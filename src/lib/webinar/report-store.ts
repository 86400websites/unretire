import { createHmac } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { CAMPAIGN } from "@/lib/webinar/config";
import type { RegistrationForm } from "@/lib/webinar/registration-payload";
import { reportSecret } from "@/lib/webinar/report-auth";
import {
  isSourceKey,
  SOURCE_KEYS,
  type SourceKey,
} from "@/lib/webinar/sources";
import { isTestAddress } from "@/lib/webinar/test-address";

/**
 * The webinar report's data — Sprint S6.2. The ONLY module that reads or
 * writes the two tables of migration 0005 (campaign_visits and
 * campaign_people), always through the service-role client: no browser
 * role can reach those tables at all.
 *
 * WHAT IS STORED. A campaign id, a source key, timestamps and, per person,
 * a keyed one-way code made from the email address. Never the address, a
 * name, an IP address, a user agent, a referrer or a URL.
 *
 * NOTHING HERE MAY HURT A SIGN-UP. recordSignup runs inside POST
 * /api/conversation after Mailchimp has accepted the person. It never throws,
 * every request it makes is bounded by a short timeout, and the Data API never
 * retries a write — so a slow or broken database costs the visitor at most
 * that timeout and never changes their answer. Failures are logged by error
 * name or Postgres code only.
 */

/** Upper bound on one counting write, so a sign-up never waits longer. */
const WRITE_TIMEOUT_MS = 2500;
/** Upper bound on reading the report (reads may be retried by the client). */
const READ_TIMEOUT_MS = 8000;
/** Upper bound on a reset (two deletes in one statement). */
const RESET_TIMEOUT_MS = 10000;

function failure(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === "string" && code !== "") return code;
  }
  return err instanceof Error ? err.name : "unknown";
}

/**
 * The keyed code for one person: base64url(HMAC-SHA256(REPORT_SECRET,
 * "conv-person:v1:" + the trimmed, lower-cased address)) — always 43
 * characters. Without the server-only secret nobody can link a code back to
 * an address, or make the code for a guessed one.
 */
export function personCode(email: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`conv-person:v1:${email.trim().toLowerCase()}`, "utf8")
    .digest("base64url");
}

/**
 * Store one counted visit. Returns whether it was stored; never throws.
 */
export async function recordArrival(source: SourceKey): Promise<boolean> {
  try {
    const { error } = await createAdminClient()
      .from("campaign_visits")
      .insert({ campaign: CAMPAIGN.id, source })
      .abortSignal(AbortSignal.timeout(WRITE_TIMEOUT_MS));
    if (error) {
      console.error(`Visit not recorded: ${failure(error)}.`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Visit not recorded: ${failure(err)}.`);
    return false;
  }
}

/**
 * Count one ACCEPTED sign-up for the report. Called by POST /api/conversation
 * immediately before each of its two success answers. A test address is never
 * counted, and nothing is sent anywhere when REPORT_SECRET is not usable: it
 * keys the person code. The secret alone is enough — a missing or short
 * REPORT_PASSWORD closes the report page but does not stop the counting, just
 * as it never stops a visit being counted, so the numbers stay complete while
 * the password is being fixed. Never throws.
 */
export async function recordSignup({
  form,
  email,
  source,
}: {
  form: RegistrationForm;
  email: string;
  source: SourceKey;
}): Promise<void> {
  try {
    if (isTestAddress(email)) return;
    const secret = reportSecret();
    if (secret === null) return;

    const { error } = await createAdminClient()
      .rpc("record_campaign_person", {
        p_campaign: CAMPAIGN.id,
        p_person: personCode(email, secret),
        p_source: source,
        p_registered: form === "register",
      })
      .abortSignal(AbortSignal.timeout(WRITE_TIMEOUT_MS));
    if (error) {
      console.error(`Sign-up not counted for the report: ${failure(error)}.`);
    }
  } catch (err) {
    console.error(`Sign-up not counted for the report: ${failure(err)}.`);
  }
}

export type ReportRow = {
  source: SourceKey;
  visits: number;
  registered: number;
};

export type ReportData = {
  /** One row per source key, in the report's order, zeros included. */
  rows: ReportRow[];
  totals: { visits: number; registered: number };
  /**
   * When the campaign's first row was stored — campaign_report's `since`,
   * exactly as the database wrote it — or null when the campaign holds no row
   * at all. It covers every row a reset deletes, people who only asked for the
   * Toolkit included, so it can be set while every number here is zero.
   * Opaque: never parsed here. The page sends it back with a reset, so the
   * database deletes only what the page stood for (resetReport).
   */
  since: string | null;
};

/**
 * Which Supabase project this deployment's report reads and writes: the first
 * label of NEXT_PUBLIC_SUPABASE_URL's host — the address createAdminClient
 * (src/lib/supabase/admin.ts) gives every request this module makes. Null when
 * it cannot be read. Not a secret: it is the public part of the project's
 * address. The signed-in report carries it (data-report-db), so the one spec
 * that writes to and resets the report can check, before it does either, that
 * the deployment it is talking to uses the test database (the Codex review of
 * S6.2, round 2, Finding 1).
 */
export function reportDatabaseRef(): string | null {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
    const ref = host.split(".")[0] ?? "";
    return /^[a-z0-9-]{1,63}$/.test(ref) ? ref : null;
  } catch {
    return null;
  }
}

/**
 * The shape of a `since` value as PostgREST writes a timestamptz: a date, a
 * time with up to six decimals, and an offset. Anything else is refused, so a
 * reset never sends the database a value it did not write.
 */
const PERIOD_STAMP =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}(:?\d{2})?)$/;

export function isPeriodStamp(value: unknown): value is string {
  return (
    typeof value === "string" && value.length <= 40 && PERIOD_STAMP.test(value)
  );
}

function toCount(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n >= 0
    ? Math.trunc(n)
    : 0;
}

/**
 * Everything /report shows, or null when it cannot be read. The numbers come
 * from campaign_report — aggregated in the database — because a plain select
 * through the Data API stops at the project's row cap.
 */
export async function readReport(): Promise<ReportData | null> {
  try {
    const report = await createAdminClient()
      .rpc("campaign_report", { p_campaign: CAMPAIGN.id })
      .abortSignal(AbortSignal.timeout(READ_TIMEOUT_MS));
    if (report.error) {
      console.error(
        `Webinar report could not be read: ${failure(report.error)}.`,
      );
      return null;
    }

    const counts = new Map<SourceKey, ReportRow>(
      SOURCE_KEYS.map((key) => [
        key,
        { source: key, visits: 0, registered: 0 },
      ]),
    );
    const data: unknown = report.data;
    let since: string | null = null;
    for (const raw of Array.isArray(data) ? data : []) {
      const row = raw as {
        source?: unknown;
        visits?: unknown;
        registered?: unknown;
        since?: unknown;
      };
      // Every row carries the same `since`; the first usable one is kept.
      if (since === null && isPeriodStamp(row.since)) since = row.since;
      // A row with no source counts nothing: it is how `since` arrives when
      // no source has a visit or a registered person.
      if (row.source === null || row.source === undefined) continue;
      // Only the eight keys are ever written; anything else is folded into
      // "other" rather than dropped, so the totals still add up.
      const key: SourceKey = isSourceKey(row.source) ? row.source : "other";
      const entry = counts.get(key)!;
      entry.visits += toCount(row.visits);
      entry.registered += toCount(row.registered);
    }

    const rows = SOURCE_KEYS.map((key) => counts.get(key)!);
    const totals = rows.reduce(
      (sum, row) => ({
        visits: sum.visits + row.visits,
        registered: sum.registered + row.registered,
      }),
      { visits: 0, registered: 0 },
    );

    return { rows, totals, since };
  } catch (err) {
    console.error(`Webinar report could not be read: ${failure(err)}.`);
    return null;
  }
}

/** What a reset did: deleted the numbers, found the page out of date, or failed. */
export type ResetOutcome = "done" | "stale" | "failed";

/**
 * "Start again for a new webinar": deletes every counted visit and every
 * counted person of the current campaign, in one statement
 * (reset_campaign_report, migration 0005) — but only if the campaign's first
 * row is still the one stored at `since`, the value the page was given (null
 * for a campaign with no row). If a reset happened elsewhere after the page
 * was opened, or an empty campaign got its first row, the database deletes
 * nothing and the answer is "stale". Never throws. Only POST /report/reset calls it, after a
 * valid session, this site's own Origin, the rate limit, the report password
 * and the page's campaign. Never retried: the Data API does not retry a write,
 * and the owner clicks again if it failed.
 */
export async function resetReport(since: string | null): Promise<ResetOutcome> {
  try {
    const { data, error } = await createAdminClient()
      .rpc("reset_campaign_report", {
        p_campaign: CAMPAIGN.id,
        p_since: since,
      })
      .abortSignal(AbortSignal.timeout(RESET_TIMEOUT_MS));
    if (error) {
      console.error(`Webinar report not reset: ${failure(error)}.`);
      return "failed";
    }
    const row = (Array.isArray(data) ? data[0] : data) as
      | { reset?: unknown; visits?: unknown; people?: unknown }
      | null
      | undefined;
    if (row?.reset === false) {
      console.info("Webinar report not reset: the page was out of date.");
      return "stale";
    }
    if (row?.reset !== true) {
      console.error("Webinar report not reset: unexpected answer.");
      return "failed";
    }
    console.info(
      `Webinar report reset: ${toCount(row.visits)} visits and ${toCount(row.people)} people deleted.`,
    );
    return "done";
  } catch (err) {
    console.error(`Webinar report not reset: ${failure(err)}.`);
    return "failed";
  }
}
