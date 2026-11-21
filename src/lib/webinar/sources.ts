/**
 * Where a visitor came from — Sprint S6.2 (the webinar report).
 *
 * PURE AND IMPORT-FREE, for the reason registration-payload.ts is: the same
 * rules run in the visitor's browser (src/app/conversation/tab-source.ts) and
 * on the server (the registration validator and POST
 * /api/conversation/arrival), and the specs in tests/e2e/webinar/ import this
 * file directly.
 *
 * THE LINK CONTRACT. The owner's team posts exactly one link per platform. A
 * link carries utm_source and utm_medium and nothing else. The same table
 * lives in the sprint record (docs/sprint-prompts/S6.2-webinar-report.md,
 * "Link contract"), in the owner's guide (docs/WEBINAR-FUNNEL.md section 16.3)
 * and in the Excel sheet the team copies from — change a link here and you
 * change it in all of them, in the same commit.
 *
 * Why platforms and not posts: Meta documents clickable links on Instagram only
 * in the profile's bio and in Story link stickers — not in an ordinary
 * caption — so a per-post link cannot be relied on there, and one link per
 * platform means nobody can pick the wrong one (owner decision, S6.2).
 *
 * The KEYS below are not copy. The label the report shows for each key is
 * approved copy and lives in src/app/report/copy.ts.
 */

/** The report's rows, in the order the report shows them. */
export const SOURCE_KEYS = [
  "linkedin",
  "instagram",
  "facebook",
  "whatsapp",
  "email",
  "meta-ads",
  "linkedin-ads",
  "other",
] as const;

export type SourceKey = (typeof SOURCE_KEYS)[number];

export function isSourceKey(value: unknown): value is SourceKey {
  return (
    typeof value === "string" &&
    (SOURCE_KEYS as readonly string[]).includes(value)
  );
}

export type TrackedSourceKey = Exclude<SourceKey, "other">;

/** One row of the link contract: the two parameters each link carries. */
export type TrackingLink = {
  key: TrackedSourceKey;
  utmSource: string;
  utmMedium: string;
};

export const LINK_CONTRACT: readonly TrackingLink[] = [
  { key: "linkedin", utmSource: "linkedin", utmMedium: "social" },
  { key: "instagram", utmSource: "instagram", utmMedium: "social" },
  { key: "facebook", utmSource: "facebook", utmMedium: "social" },
  { key: "whatsapp", utmSource: "whatsapp", utmMedium: "social" },
  { key: "email", utmSource: "newsletter", utmMedium: "email" },
  { key: "meta-ads", utmSource: "meta", utmMedium: "paid" },
  { key: "linkedin-ads", utmSource: "linkedin", utmMedium: "paid" },
];

/**
 * The full link the team posts for one platform, on the given origin (the
 * live site's — https://www.unretireproject.com — for anything posted).
 */
export function trackingLink(origin: string, key: TrackedSourceKey): string {
  const entry = LINK_CONTRACT.find((link) => link.key === key);
  if (!entry) throw new Error(`No tracking link for "${key}".`);
  return `${origin}/conversation?utm_source=${entry.utmSource}&utm_medium=${entry.utmMedium}`;
}

export type SourceInput = {
  /** The raw utm_source value from the address, when there is one. */
  utmSource?: string | null;
  /** The raw utm_medium value from the address, when there is one. */
  utmMedium?: string | null;
  /** document.referrer as the browser gave it: a full URL, or "". */
  referrer?: string | null;
};

/**
 * Ad platforms whose paid link may name Meta, Facebook or Instagram. "fb" and
 * "ig" are Meta's short names: our links never use them, but Meta and
 * Instagram can put their own utm_source on a link (Instagram's default link
 * parameters; Meta's automatic ad parameters since 2024), and reading them as
 * the platform keeps such a visit in its real row instead of "Other / unknown".
 */
const META_PAID = ["meta", "facebook", "fb", "instagram", "ig"];

function clean(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed === "" ? null : trimmed;
}

/** True for the domain itself or any subdomain of it — whole labels only. */
function isDomainOrSubdomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function fromReferrer(referrer: string | null | undefined): SourceKey {
  if (typeof referrer !== "string" || referrer === "") return "other";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "other";
  }
  if (isDomainOrSubdomain(host, "linkedin.com") || host === "lnkd.in") {
    return "linkedin";
  }
  if (isDomainOrSubdomain(host, "instagram.com")) return "instagram";
  if (isDomainOrSubdomain(host, "facebook.com")) return "facebook";
  // Anything else — a search engine, another site, an e-mail client, or this
  // site's own pages — is not a platform the team posts on.
  return "other";
}

/**
 * The rules, in order (the sprint record, step 5, with Meta's short names):
 *   1. utm_medium "paid": utm_source meta, facebook, fb, instagram or ig →
 *      meta-ads; linkedin → linkedin-ads; anything else → other.
 *   2. utm_source linkedin, instagram, facebook or whatsapp → itself; ig →
 *      instagram; fb → facebook; newsletter → email; anything else → other.
 *   3. No utm_source: the referrer's host — linkedin.com (or a subdomain) or
 *      lnkd.in → linkedin; instagram.com (or a subdomain) → instagram;
 *      facebook.com (or a subdomain) → facebook; anything else → other.
 * Values are trimmed and lower-cased first; an empty value counts as absent.
 */
export function resolveSource(input: SourceInput): SourceKey {
  const source = clean(input.utmSource);
  const medium = clean(input.utmMedium);

  if (medium === "paid") {
    if (source === "linkedin") return "linkedin-ads";
    if (source !== null && META_PAID.includes(source)) return "meta-ads";
    return "other";
  }

  if (source !== null) {
    switch (source) {
      case "linkedin":
      case "instagram":
      case "facebook":
      case "whatsapp":
        return source;
      // Meta's short names (see META_PAID).
      case "ig":
        return "instagram";
      case "fb":
        return "facebook";
      case "newsletter":
        return "email";
      default:
        return "other";
    }
  }

  return fromReferrer(input.referrer);
}
