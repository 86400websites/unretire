import crypto from "crypto";

/**
 * The Mailchimp calls the webinar funnel makes — Sprint S6.1.
 *
 * Server-side only: it reads MAILCHIMP_API_KEY. It deliberately does NOT
 * import "server-only" — that package is not a dependency of this project and
 * this sprint adds none. What keeps it off the client is that only route
 * handlers import it.
 *
 * WHY THIS IS NOT A COPY of the three inline Mailchimp blocks already in the
 * repo. Each rule below closes something one of them leaves open:
 *
 *   • EVERY CALL HAS A TIMEOUT. No fetch in `src` had one before this sprint,
 *     so a hung upstream held the request for as long as the platform allowed
 *     — and one of this module's callers is the Stripe webhook, where a paid
 *     grant has already been written and must not be kept waiting on a tag.
 *
 *   • NOTHING FROM UPSTREAM LEAVES THIS FILE. Not a response body, not a
 *     `title` or `detail`, not a URL, not an Error message. Mailchimp's error
 *     text carries contact-level specifics (who is already subscribed, who is
 *     in a compliance state), the request URL contains the audience id, and a
 *     thrown fetch error can quote that URL. Callers get a small fixed
 *     vocabulary — a kind, a member status, an HTTP status code — and the log
 *     gets a status code, an outcome class or an error NAME, never more.
 *
 *   • A 400 IS CLASSIFIED, NOT GUESSED AT. "Mailchimp said no" covers three
 *     different situations the visitor must be told apart: the address may not
 *     be added by anyone (ok, but it cannot be e-mailed), the address is not a
 *     real one (ask them to check it), or something is wrong on our side
 *     (fail). The upstream `title` — and for a validation failure the fields
 *     it names — is read in memory to decide which, and then discarded.
 *
 *   • NO FUNCTION HERE THROWS. Every outcome, including a timeout and a thrown
 *     fetch, is a return value, so a caller cannot forget a catch.
 *
 *   • `fetch` IS LOOKED UP ON globalThis AT CALL TIME, so a spec can replace
 *     it and assert every branch without a request ever leaving the machine
 *     (tests/e2e/webinar/mailchimp-client.spec.ts). One live audience serves
 *     every environment (D-22); a spec that reached it would write to it.
 *
 * The configuration is read lazily, inside each call, so a build or an
 * environment without these values does not crash on import.
 */

export type MailchimpEnvName = "MAILCHIMP_API_KEY" | "MAILCHIMP_LIST_ID";

/** Every status a member can come back with. */
export type MemberStatus =
  | "subscribed"
  | "unsubscribed"
  | "cleaned"
  | "pending"
  | "transactional"
  | "archived";

const MEMBER_STATUSES: readonly string[] = [
  "subscribed",
  "unsubscribed",
  "cleaned",
  "pending",
  "transactional",
  "archived",
];

/**
 *   ok               — the member exists in the audience; `status` says how.
 *   refused-address  — Mailchimp will not let ANYONE add this address by API:
 *                      it was permanently deleted ("forgotten"), or it is in a
 *                      compliance state. Not our failure and not the visitor's
 *                      mistake; the address simply cannot be e-mailed.
 *   invalid-address  — Mailchimp judged the address itself to be not real.
 *   error            — anything else: not configured, another 4xx or 5xx, an
 *                      unreadable answer, a timeout, a thrown fetch.
 *
 * `httpStatus` is the upstream status code, or null when no response arrived.
 */
export type UpsertResult =
  | { kind: "ok"; status: MemberStatus; httpStatus: number }
  | { kind: "refused-address"; httpStatus: number }
  | { kind: "invalid-address"; httpStatus: number }
  | { kind: "error"; httpStatus: number | null };

export type CallOptions = {
  /** Per-call limit in milliseconds. Defaults to DEFAULT_TIMEOUT_MS. */
  timeoutMs?: number;
};

/**
 * Long enough for a slow answer, short enough that the three calls a
 * registration can make still finish inside one request.
 */
export const DEFAULT_TIMEOUT_MS = 4000;

/**
 * The data centre is the part of the key after its last hyphen ("us22") and
 * becomes part of the HOST the key is sent to. It is therefore shape-checked
 * before use: a key with a stray character must never be able to choose where
 * the Authorization header goes.
 */
const DATA_CENTRE = /^[a-z]{2,4}\d{1,3}$/;

type Config = {
  base: string;
  headers: Record<string, string>;
};

type ConfigRead =
  | { ok: true; config: Config }
  | { ok: false; missing: MailchimpEnvName };

function readConfig(): ConfigRead {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const listId = process.env.MAILCHIMP_LIST_ID?.trim();
  if (!apiKey) return { ok: false, missing: "MAILCHIMP_API_KEY" };
  if (!listId) return { ok: false, missing: "MAILCHIMP_LIST_ID" };

  const hyphen = apiKey.lastIndexOf("-");
  const dataCentre = hyphen === -1 ? "" : apiKey.slice(hyphen + 1);
  // A key with no usable data-centre suffix cannot reach any host.
  if (!DATA_CENTRE.test(dataCentre)) {
    return { ok: false, missing: "MAILCHIMP_API_KEY" };
  }

  return {
    ok: true,
    config: {
      base: `https://${dataCentre}.api.mailchimp.com/3.0/lists/${encodeURIComponent(listId)}`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  };
}

/**
 * The NAME of the value that is missing or unusable, or null when both are
 * fine. For a log line; it never returns a value.
 */
export function mailchimpMissingEnv(): MailchimpEnvName | null {
  const read = readConfig();
  return read.ok ? null : read.missing;
}

/**
 * True when both values are set and the key carries a data-centre suffix.
 * Makes no request. A caller that must fail closed asks this BEFORE doing any
 * work, so "not configured" is an honest refusal rather than a failed fetch.
 */
export function mailchimpConfigured(): boolean {
  return readConfig().ok;
}

/** Mailchimp identifies a contact by the MD5 of the lowercased address. */
function memberPath(email: string): string {
  const hash = crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
  return `/members/${hash}`;
}

type Answer =
  | { arrived: true; status: number; body: unknown }
  | { arrived: false; errorName: string };

/**
 * One request. The body is parsed here and handed back for the caller to
 * classify in memory; a body that is not JSON (a 204, an HTML error page)
 * comes back as null. A thrown fetch or an elapsed timeout is reduced to the
 * error's NAME ("TimeoutError", "TypeError") — its message can quote the URL.
 */
async function call(
  config: Config,
  method: "PUT" | "POST",
  path: string,
  payload: unknown,
  options: CallOptions | undefined,
): Promise<Answer> {
  try {
    const response = await globalThis.fetch(`${config.base}${path}`, {
      method,
      headers: config.headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(options?.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return { arrived: true, status: response.status, body };
  } catch (err) {
    return {
      arrived: false,
      errorName: err instanceof Error ? err.name : "unknown",
    };
  }
}

function field(body: unknown, key: string): unknown {
  if (typeof body !== "object" || body === null) return undefined;
  return (body as Record<string, unknown>)[key];
}

/**
 * The 400 titles this module acts on.
 *
 * The first two mean "this address may not be added through the API at all":
 * one for an address that was permanently deleted, one for an address that
 * unsubscribed, bounced or is under compliance review. The third is
 * Mailchimp's general validation failure and needs a second look — see below.
 */
const TITLE_FORGOTTEN = "forgotten email not subscribed";
const TITLE_COMPLIANCE = "member in compliance state";
const TITLE_INVALID_RESOURCE = "invalid resource";

/**
 * "Invalid Resource" is NOT by itself a verdict on the address: the same
 * title is returned when a merge field fails validation. It counts as an
 * invalid address only when Mailchimp points at the address —
 *
 *   • its `errors` list names the `email_address` field, or
 *   • it sends no field list at all and its explanation is the fixed
 *     "looks fake or invalid" sentence it uses for addresses it distrusts.
 *
 * A field list that names only other fields is our own payload being wrong,
 * and that is an error, not something to ask the visitor to fix.
 */
function pointsAtAddress(body: unknown): boolean {
  const errors = field(body, "errors");
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.some((item) => {
      const name = field(item, "field");
      return (
        typeof name === "string" &&
        name.trim().toLowerCase().replace(/\s+/g, "_") === "email_address"
      );
    });
  }
  const detail = field(body, "detail");
  return typeof detail === "string" && /looks fake or invalid/i.test(detail);
}

type BadRequestClass = "refused-address" | "invalid-address" | "other";

function classifyBadRequest(body: unknown): BadRequestClass {
  const raw = field(body, "title");
  const title = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (title === TITLE_FORGOTTEN || title === TITLE_COMPLIANCE) {
    return "refused-address";
  }
  if (title === TITLE_INVALID_RESOURCE && pointsAtAddress(body)) {
    return "invalid-address";
  }
  return "other";
}

function memberStatus(body: unknown): MemberStatus | null {
  const status = field(body, "status");
  return typeof status === "string" && MEMBER_STATUSES.includes(status)
    ? (status as MemberStatus)
    : null;
}

/**
 * Create the contact if it is new, as `subscribed`, or update its first name
 * if it exists. `status_if_new` — never `status` — so an existing contact
 * keeps whatever status it has: someone who unsubscribed is not resubscribed
 * by filling in a form.
 *
 * The returned `status` is what the caller must act on. Only `subscribed`
 * means the address can be e-mailed.
 */
export async function upsertMember(
  email: string,
  firstName: string,
  options?: CallOptions,
): Promise<UpsertResult> {
  const read = readConfig();
  if (!read.ok) return { kind: "error", httpStatus: null };

  const name = firstName.trim();
  const answer = await call(
    read.config,
    "PUT",
    memberPath(email),
    {
      email_address: email.trim(),
      status_if_new: "subscribed",
      ...(name ? { merge_fields: { FNAME: name } } : {}),
    },
    options,
  );

  if (!answer.arrived) {
    console.error(`Mailchimp upsert did not complete: ${answer.errorName}.`);
    return { kind: "error", httpStatus: null };
  }

  const httpStatus = answer.status;
  if (httpStatus >= 200 && httpStatus < 300) {
    const status = memberStatus(answer.body);
    if (status) return { kind: "ok", status, httpStatus };
    // A success we cannot read is not a success we can report.
    console.error(
      `Mailchimp upsert answered HTTP ${httpStatus} without a readable member status.`,
    );
    return { kind: "error", httpStatus };
  }

  if (httpStatus === 400) {
    const outcome = classifyBadRequest(answer.body);
    if (outcome !== "other") {
      // Expected, visitor-driven outcomes: a warning, not an error.
      console.warn(`Mailchimp upsert answered HTTP 400 (${outcome}).`);
      return { kind: outcome, httpStatus };
    }
  }

  console.error(`Mailchimp upsert failed with HTTP ${httpStatus}.`);
  return { kind: "error", httpStatus };
}

/**
 * Bring an ARCHIVED contact back as `subscribed` — one update, nothing more.
 *
 * Call this ONLY when `upsertMember` has just returned status "archived".
 * Archiving is housekeeping done by the audience's owner; it is not an
 * opt-out, and a person who fills in the form again is signing up afresh. It
 * must never be used for `unsubscribed`, `cleaned` or `pending`: those are
 * the contact's own choice or a delivery fact, and setting `status` over them
 * would resubscribe someone who said no.
 *
 * True only when Mailchimp answers 2xx AND reports the member as subscribed.
 * If it refuses, the caller reports the address as one that cannot be
 * e-mailed; it does not retry.
 */
export async function resubscribeArchived(
  email: string,
  options?: CallOptions,
): Promise<boolean> {
  const read = readConfig();
  if (!read.ok) return false;

  const answer = await call(
    read.config,
    "PUT",
    memberPath(email),
    {
      email_address: email.trim(),
      status_if_new: "subscribed",
      status: "subscribed",
    },
    options,
  );

  if (!answer.arrived) {
    console.error(
      `Mailchimp resubscribe did not complete: ${answer.errorName}.`,
    );
    return false;
  }
  const subscribed =
    answer.status >= 200 &&
    answer.status < 300 &&
    memberStatus(answer.body) === "subscribed";
  if (!subscribed) {
    console.error(
      `Mailchimp resubscribe was not applied (HTTP ${answer.status}).`,
    );
  }
  return subscribed;
}

/**
 * Add tags to a contact that already exists — a tags-only call, with no
 * member upsert, so it can never create a contact or change a status.
 *
 * True only when Mailchimp confirms the tags (2xx). False for everything
 * else, and in particular WITHOUT ANY REQUEST when the address is empty, no
 * tag is named, or Mailchimp is not configured — which is what lets the
 * Stripe webhook call it unconditionally after a paid grant.
 */
export async function addTags(
  email: string | null | undefined,
  tags: readonly string[],
  options?: CallOptions,
): Promise<boolean> {
  if (!email || !email.trim() || tags.length === 0) return false;
  const read = readConfig();
  if (!read.ok) return false;

  const answer = await call(
    read.config,
    "POST",
    `${memberPath(email)}/tags`,
    { tags: tags.map((name) => ({ name, status: "active" })) },
    options,
  );

  if (!answer.arrived) {
    console.error(`Mailchimp tag did not complete: ${answer.errorName}.`);
    return false;
  }
  if (answer.status === 404) {
    // The ordinary case for a buyer who never joined the list: not a fault.
    console.warn(
      "Mailchimp tag skipped: the contact is not in the audience (HTTP 404).",
    );
    return false;
  }
  if (answer.status < 200 || answer.status >= 300) {
    console.error(`Mailchimp tag failed with HTTP ${answer.status}.`);
    return false;
  }
  return true;
}
