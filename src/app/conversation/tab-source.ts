import {
  isSourceKey,
  resolveSource,
  type SourceKey,
} from "@/lib/webinar/sources";

/**
 * Where THIS browser tab came from — Sprint S6.2 (the webinar report).
 *
 * Browser-only helper for ArrivalCounter and the sign-up forms. The first
 * time a tab opens /conversation, the source is worked out from the address
 * (utm_source, utm_medium) and the referrer by the shared rules in
 * src/lib/webinar/sources.ts, and remembered for the life of the tab:
 *
 *   - in memory, for the rest of this page view;
 *   - in sessionStorage, so a reload in the same tab keeps the same source and
 *     is not counted as a second visit. sessionStorage holds nothing but the
 *     key (for example "linkedin"); it is gone when the tab closes, and every
 *     access is wrapped because some browsers refuse storage outright.
 *
 * A remembered key also means "this tab's visit has been counted".
 */

const STORAGE_PREFIX = "ur-conv-source:";

let remembered: SourceKey | null = null;

/** What this page view's own address and referrer say. */
export function sourceFromThisPage(): SourceKey {
  const params = new URLSearchParams(window.location.search);
  return resolveSource({
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    referrer: document.referrer,
  });
}

/** The key already remembered for this tab and campaign, if any. */
export function rememberedTabSource(campaign: string): SourceKey | null {
  if (remembered) return remembered;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_PREFIX + campaign);
    if (isSourceKey(stored)) {
      remembered = stored;
      return stored;
    }
  } catch {
    // Storage refused: memory alone has to do.
  }
  return null;
}

/** Remember the key for this tab, in memory and (when allowed) storage. */
export function rememberTabSource(campaign: string, key: SourceKey): void {
  remembered = key;
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + campaign, key);
  } catch {
    // Storage refused: memory alone has to do.
  }
}

/**
 * The key a sign-up sends: the tab's remembered key when ArrivalCounter has
 * set one (it runs as the page loads, before anyone can submit), otherwise
 * what this page view says.
 */
export function sourceForSignup(): SourceKey {
  return remembered ?? sourceFromThisPage();
}
