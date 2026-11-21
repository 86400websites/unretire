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
 *     is not counted as a second visit. sessionStorage holds the key (for
 *     example "linkedin") and, where the browser names history slots, the
 *     slot that wrote it — an id the browser makes up, nothing about the
 *     visitor. It is gone when the tab closes, and every access is wrapped
 *     because some browsers refuse storage outright.
 *
 * A remembered key also means "this tab's visit has been counted".
 *
 * ONE EXCEPTION: a tab another tab opened (window.open, or a link that keeps
 * its opener) starts with a COPY of its opener's sessionStorage, so on that
 * tab's first page a stored key is the opener's, not this tab's. It neither
 * stops this tab's own visit from being counted nor names its source (Codex
 * review of S6.2, Finding 4). Only a tab's first page can hold such a copy:
 * its history has one entry and the page was reached by a navigation, not a
 * reload or back/forward. Then the copy is told apart from the tab's own key
 * by the history slot that wrote it — a reload, or loading the same address
 * again, keeps the slot, and no other tab shares it — so it is recognised
 * even when the opening site cuts the opener link. Where the browser names no
 * slots, a first page with an opener is taken to hold a copy. The site's own
 * pages never open a tab with an opener; this covers a page elsewhere, or a
 * visitor's script, that does.
 */

const STORAGE_PREFIX = "ur-conv-source:";
/** The history slot that wrote this tab's key, beside it (see above). */
const SLOT_PREFIX = "ur-conv-slot:";

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

/**
 * This page's history slot: the Navigation API's key for the current entry,
 * which a reload or a same-address load keeps and no other tab shares. Null
 * where the browser has no Navigation API.
 */
function currentSlot(): string | null {
  try {
    const key = (
      window as Window & {
        navigation?: { currentEntry?: { key?: unknown } | null };
      }
    ).navigation?.currentEntry?.key;
    return typeof key === "string" && key !== "" ? key : null;
  } catch {
    return null;
  }
}

/**
 * Whether this page's sessionStorage is a copy made when another tab opened
 * this one, so a key there is the other tab's (see above). Any error: no.
 */
function storageCopiedFromOpener(campaign: string): boolean {
  try {
    if (window.history.length !== 1) return false;
    const [entry] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (entry?.type !== "navigate") return false;
    const here = currentSlot();
    const writtenIn = window.sessionStorage.getItem(SLOT_PREFIX + campaign);
    if (here !== null && writtenIn !== null) return writtenIn !== here;
    return Boolean(window.opener);
  } catch {
    return false;
  }
}

/** The key already remembered for this tab and campaign, if any. */
export function rememberedTabSource(campaign: string): SourceKey | null {
  if (remembered) return remembered;
  if (storageCopiedFromOpener(campaign)) return null;
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
    const slot = currentSlot();
    if (slot !== null) {
      window.sessionStorage.setItem(SLOT_PREFIX + campaign, slot);
    }
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
