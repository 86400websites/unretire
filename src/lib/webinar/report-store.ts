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
 * writes the three tables of migration 0005 (campaign_visits, campaign_people,
 * campaign_report_inputs), always through the service-role client: no browser
 * role can reach those tables at all.
 *
 * WHAT IS STORED. A campaign id, a source key, timestamps, the owner's two
 * typed numbers and, per person, a keyed one-way code made from the email
 * address. Never the address, a name, an IP address, a user agent, a referrer
 * or a URL.
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
  /** "YYYY-MM-DD", or null when counting from the beginning. */
  countFrom: string | null;
  /** The owner's number from Zoom, or null when not added yet. */
  showedUp: number | null;
};

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
    const admin = createAdminClient();
    const signal = AbortSignal.timeout(READ_TIMEOUT_MS);
    const [report, inputs] = await Promise.all([
      admin
        .rpc("campaign_report", { p_campaign: CAMPAIGN.id })
        .abortSignal(signal),
      admin
        .from("campaign_report_inputs")
        .select("count_from, showed_up")
        .eq("campaign", CAMPAIGN.id)
        .abortSignal(signal)
        .maybeSingle(),
    ]);
    if (report.error || inputs.error) {
      console.error(
        `Webinar report could not be read: ${failure(report.error ?? inputs.error)}.`,
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
    for (const raw of Array.isArray(data) ? data : []) {
      const row = raw as {
        source?: unknown;
        visits?: unknown;
        registered?: unknown;
      };
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

    const saved = inputs.data as {
      count_from: unknown;
      showed_up: unknown;
    } | null;
    const countFrom =
      saved && typeof saved.count_from === "string" ? saved.count_from : null;
    const showedUp =
      saved && typeof saved.showed_up === "number" ? saved.showed_up : null;

    return { rows, totals, countFrom, showedUp };
  } catch (err) {
    console.error(`Webinar report could not be read: ${failure(err)}.`);
    return null;
  }
}

export type ReportInputs = {
  /** "YYYY-MM-DD" or null. */
  countFrom: string | null;
  showedUp: number | null;
};

export type ReportInputError = "date" | "number";

const EARLIEST_COUNT_FROM = "2026-01-01";
const LATEST_COUNT_FROM = "2100-12-31";
const MAX_SHOWED_UP = 100000;

/**
 * The two boxes, as the form sends them. Empty means "clear it". A date must
 * be a real calendar day from 2026-01-01 to 2100-12-31; a number must be whole
 * digits from 0 to 100000. Anything else is refused with a code the page turns
 * into its approved sentence — including a box that is missing from the post
 * or is not text (FormData.get gives null or a File), so a post without a box
 * can never clear a saved value.
 */
export function parseReportInputs(raw: {
  countFrom: unknown;
  showedUp: unknown;
}): { ok: true; value: ReportInputs } | { ok: false; code: ReportInputError } {
  if (typeof raw.countFrom !== "string") return { ok: false, code: "date" };
  if (typeof raw.showedUp !== "string") return { ok: false, code: "number" };
  const dateText = raw.countFrom.trim();
  const numberText = raw.showedUp.trim();

  let countFrom: string | null = null;
  if (dateText !== "") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
    if (!match) return { ok: false, code: "date" };
    const [year, month, day] = [
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
    ];
    const asDate = new Date(Date.UTC(year, month - 1, day));
    const real =
      asDate.getUTCFullYear() === year &&
      asDate.getUTCMonth() === month - 1 &&
      asDate.getUTCDate() === day;
    if (
      !real ||
      dateText < EARLIEST_COUNT_FROM ||
      dateText > LATEST_COUNT_FROM
    ) {
      return { ok: false, code: "date" };
    }
    countFrom = dateText;
  }

  let showedUp: number | null = null;
  if (numberText !== "") {
    if (!/^\d{1,6}$/.test(numberText)) return { ok: false, code: "number" };
    const value = Number(numberText);
    if (value > MAX_SHOWED_UP) return { ok: false, code: "number" };
    showedUp = value;
  }

  return { ok: true, value: { countFrom, showedUp } };
}

/** Save the two boxes for the current campaign. Returns whether it worked. */
export async function saveReportInputs(inputs: ReportInputs): Promise<boolean> {
  try {
    const { error } = await createAdminClient()
      .from("campaign_report_inputs")
      .upsert(
        {
          campaign: CAMPAIGN.id,
          count_from: inputs.countFrom,
          showed_up: inputs.showedUp,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "campaign" },
      )
      .abortSignal(AbortSignal.timeout(WRITE_TIMEOUT_MS));
    if (error) {
      console.error(`Report numbers not saved: ${failure(error)}.`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Report numbers not saved: ${failure(err)}.`);
    return false;
  }
}
