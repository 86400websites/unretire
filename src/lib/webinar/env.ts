/**
 * The five webinar values the owner changes in Vercel — Sprint S6.1.
 *
 * THIS FILE HAS NO IMPORTS, AND MUST STAY THAT WAY. It is loaded from two very
 * different places:
 *
 *   1. `next.config.ts`, at build time, through a plain relative import. The
 *      config file is transpiled on its own, outside the app's module graph, so
 *      neither the "@/" alias nor any app module is available to it.
 *   2. `src/lib/webinar/config.ts`, at request time.
 *
 * One rule set serves both. The build runs it STRICTLY (`assertWebinarEnv`): a
 * value that is set but malformed stops the deployment, so a typing mistake in
 * Vercel can never reach visitors — the previous deployment keeps serving. The
 * request path runs it LENIENTLY (`readWebinarEnv`): a malformed value is
 * treated as unset, because a page must never crash on configuration.
 *
 * Nothing here ever puts a VALUE into an error or a return for logging. The
 * Zoom address is the one thing this funnel must not leak, and a build log is
 * a place people paste from. Errors name the VARIABLE and the rule, nothing
 * else.
 */

export const WEBINAR_ENV = {
  startsAt: "WEBINAR_STARTS_AT",
  offerEndsAt: "WEBINAR_OFFER_ENDS_AT",
  offerCode: "WEBINAR_OFFER_CODE",
  zoomUrl: "WEBINAR_ZOOM_URL",
  replayUrl: "WEBINAR_REPLAY_URL",
} as const;

export type WebinarEnvName = (typeof WEBINAR_ENV)[keyof typeof WEBINAR_ENV];

/** Every name, in the order problems are reported. */
export const WEBINAR_ENV_NAMES: readonly WebinarEnvName[] = [
  WEBINAR_ENV.startsAt,
  WEBINAR_ENV.offerEndsAt,
  WEBINAR_ENV.offerCode,
  WEBINAR_ENV.zoomUrl,
  WEBINAR_ENV.replayUrl,
];

/** The parsed values. `null` means "not configured". */
export type WebinarEnvValues = {
  startsAt: Date | null;
  offerEndsAt: Date | null;
  offerCode: string | null;
  /** Validated and normalised. Only /conversation/join may ever read it. */
  zoomUrl: string | null;
  replayUrl: string | null;
};

export type WebinarEnvRead = {
  values: WebinarEnvValues;
  /** NAMES only — never a value. Empty when everything set is valid. */
  malformed: WebinarEnvName[];
};

type EnvSource = Record<string, string | undefined>;

/**
 * Empty or whitespace-only counts as unset: Vercel stores a cleared field as an
 * empty string, and that must not read as "set but malformed".
 */
function setValue(env: EnvSource, name: WebinarEnvName): string | null {
  const raw = env[name];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * ISO 8601 date-time in the extended form with an EXPLICIT offset:
 * YYYY-MM-DDTHH:MM[:SS[.sss]] followed by Z or +HH:MM / -HH:MM.
 *
 * The offset is required because a value without one would be read in the
 * server's own zone, which is UTC on Vercel and something else on a laptop —
 * the same string would name two different instants.
 *
 * `Date.parse` is deliberately not trusted with the decision: it accepts a
 * 30 February and quietly rolls it into March. Every field is range-checked
 * here and the instant is built from the parts.
 */
const ISO_WITH_OFFSET =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/;

type ParsedInstant = { instant: Date; onQuarterHour: boolean };

function parseIso(raw: string): ParsedInstant | null {
  const match = ISO_WITH_OFFSET.exec(raw.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] === undefined ? 0 : Number(match[6]);
  const millisecond =
    match[7] === undefined ? 0 : Number(match[7].padEnd(3, "0"));
  const offset = match[8];

  if (month < 1 || month > 12) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;
  if (day < 1) return null;

  // A real calendar day: build it in UTC and require it to come back unchanged.
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (
    calendar.getUTCFullYear() !== year ||
    calendar.getUTCMonth() !== month - 1 ||
    calendar.getUTCDate() !== day
  ) {
    return null;
  }

  let offsetMinutes = 0;
  if (offset !== "Z") {
    const offsetHours = Number(offset.slice(1, 3));
    const offsetMins = Number(offset.slice(4, 6));
    if (offsetHours > 23 || offsetMins > 59) return null;
    offsetMinutes = offsetHours * 60 + offsetMins;
    if (offset.startsWith("-")) offsetMinutes = -offsetMinutes;
  }

  const epoch =
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond) -
    offsetMinutes * 60_000;
  if (!Number.isFinite(epoch)) return null;

  return {
    instant: new Date(epoch),
    onQuarterHour: minute % 15 === 0 && second === 0 && millisecond === 0,
  };
}

/**
 * WEBINAR_STARTS_AT — an instant with an explicit offset, on the quarter-hour
 * (minutes 00, 15, 30 or 45, with no seconds). Email 6 is scheduled by hand for
 * the start itself and Email 5 for one hour before it, so the start has to be
 * a time a scheduling picker can express exactly.
 */
export function parseStartsAt(raw: string): Date | null {
  const parsed = parseIso(raw);
  if (!parsed || !parsed.onQuarterHour) return null;
  return parsed.instant;
}

/** WEBINAR_OFFER_ENDS_AT — an instant with an explicit offset. 23:59 is fine. */
export function parseOfferEndsAt(raw: string): Date | null {
  return parseIso(raw)?.instant ?? null;
}

const OFFER_CODE = /^[A-Za-z0-9-]{3,40}$/;

/** WEBINAR_OFFER_CODE — letters, digits and hyphens, 3 to 40 characters. */
export function parseOfferCode(raw: string): string | null {
  const value = raw.trim();
  return OFFER_CODE.test(value) ? value : null;
}

/**
 * Shared by both links: https only, and no credentials in the address.
 *
 * The decision is made on the PARSED url, never on the text. A prefix check on
 * the string is how "https://zoom.us@evil.example/" and its relatives get
 * through — the same lesson as src/lib/auth/safe-redirect.ts.
 */
function parseHttpsUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username !== "" || url.password !== "") return null;
  return url;
}

/**
 * WEBINAR_ZOOM_URL — the ONLY off-site redirect target on this site.
 *
 * https, no credentials, and the parsed host is exactly zoom.us or ends in
 * ".zoom.us". `host` (not `hostname`) is compared on purpose: it includes a
 * non-default port, so an address on an unusual port is refused too. The
 * NORMALISED address is returned, so what /conversation/join redirects to is
 * precisely what was validated here, not the text that was typed.
 */
export function parseZoomUrl(raw: string): string | null {
  const url = parseHttpsUrl(raw);
  if (!url) return null;
  const host = url.host.toLowerCase();
  if (host !== "zoom.us" && !host.endsWith(".zoom.us")) return null;
  return url.href;
}

/**
 * WEBINAR_REPLAY_URL — https, no credentials, any host. It is shown as a link
 * on the replay page and is never a redirect target, so no host list applies.
 */
export function parseReplayUrl(raw: string): string | null {
  return parseHttpsUrl(raw)?.href ?? null;
}

type Problem = { name: WebinarEnvName; rule: string };

const RULES: Record<WebinarEnvName, string> = {
  WEBINAR_STARTS_AT:
    "must be an ISO 8601 date-time with an explicit offset and minutes on the quarter-hour (YYYY-MM-DDTHH:MM:SS+HH:MM)",
  WEBINAR_OFFER_ENDS_AT:
    "must be an ISO 8601 date-time with an explicit offset (YYYY-MM-DDTHH:MM:SS+HH:MM)",
  WEBINAR_OFFER_CODE:
    "must be 3 to 40 characters using only letters, digits and hyphens",
  WEBINAR_ZOOM_URL:
    "must be an https address on zoom.us or one of its subdomains, with no username or password in it",
  WEBINAR_REPLAY_URL:
    "must be an https address with no username or password in it",
};

/**
 * The one evaluation both entry points share.
 *
 * Each value is judged on its own. Then exactly two cross-field rules apply:
 *
 *   • when both dates are set, the offer must end after the webinar starts;
 *   • when the start is set, the Zoom address must be set and valid — an open
 *     funnel whose "Join on Zoom" link has nowhere to go is worse than a
 *     dormant one.
 *
 * Any other value may be set while the start is unset: the funnel is simply
 * dormant, and that is the state Production is in until go-live.
 *
 * The returned values are already the LENIENT view: whatever broke a rule is
 * null, and a start with no usable Zoom address is null too, so the funnel
 * falls back to dormant instead of opening half-configured.
 */
function evaluate(env: EnvSource): {
  values: WebinarEnvValues;
  problems: Problem[];
} {
  const problems: Problem[] = [];

  function read<T>(
    name: WebinarEnvName,
    parse: (raw: string) => T | null,
  ): { set: boolean; value: T | null } {
    const raw = setValue(env, name);
    if (raw === null) return { set: false, value: null };
    const value = parse(raw);
    if (value === null) problems.push({ name, rule: RULES[name] });
    return { set: true, value };
  }

  const start = read(WEBINAR_ENV.startsAt, parseStartsAt);
  const offerEnd = read(WEBINAR_ENV.offerEndsAt, parseOfferEndsAt);
  const offerCode = read(WEBINAR_ENV.offerCode, parseOfferCode);
  const zoom = read(WEBINAR_ENV.zoomUrl, parseZoomUrl);
  const replay = read(WEBINAR_ENV.replayUrl, parseReplayUrl);

  let startsAt = start.value;
  let offerEndsAt = offerEnd.value;

  if (startsAt && offerEndsAt && offerEndsAt.getTime() <= startsAt.getTime()) {
    problems.push({
      name: WEBINAR_ENV.offerEndsAt,
      rule: `must be later than ${WEBINAR_ENV.startsAt}`,
    });
    offerEndsAt = null;
  }

  if (start.set && zoom.value === null) {
    // Unset is reported here; set-but-malformed was already reported above.
    if (!zoom.set) {
      problems.push({
        name: WEBINAR_ENV.zoomUrl,
        rule: `must be set whenever ${WEBINAR_ENV.startsAt} is set`,
      });
    }
    startsAt = null;
  }

  return {
    values: {
      startsAt,
      offerEndsAt,
      offerCode: offerCode.value,
      zoomUrl: zoom.value,
      replayUrl: replay.value,
    },
    problems,
  };
}

/**
 * STRICT — for the build. Throws when any value that is set breaks a rule.
 * The message names each offending variable and its rule, and never contains
 * a value. Unset values never throw.
 */
export function assertWebinarEnv(env: EnvSource): void {
  const { problems } = evaluate(env);
  if (problems.length === 0) return;
  const lines = problems.map(({ name, rule }) => `  - ${name} ${rule}.`);
  throw new Error(
    [
      "Webinar configuration is not valid, so this build was stopped (values are never printed):",
      ...lines,
      "Correct the value in the hosting settings, or clear it, then deploy again.",
    ].join("\n"),
  );
}

/**
 * LENIENT — for a request. Never throws. A malformed value is returned as
 * null, and its NAME (only) is listed in `malformed` so the caller can log it.
 */
export function readWebinarEnv(env: EnvSource): WebinarEnvRead {
  const { values, problems } = evaluate(env);
  const flagged = new Set(problems.map((problem) => problem.name));
  return {
    values,
    malformed: WEBINAR_ENV_NAMES.filter((name) => flagged.has(name)),
  };
}
