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
 *     slots this tab held when the key was written — ids the browser makes
 *     up, nothing about the visitor. It is gone when the tab closes, and every
 *     access is wrapped because some browsers refuse storage outright.
 *
 * A remembered key also means "this tab's visit has been counted".
 *
 * ONE EXCEPTION: a tab another tab opened (window.open, or a link that keeps
 * its opener) starts with a COPY of its opener's sessionStorage, so a key it
 * finds there may be the opener's, not its own. A copied key neither stops
 * this tab's own visit from being counted nor names its source (Codex review
 * of S6.2: round 1, Finding 4; round 2, Finding 2). The two are told apart by
 * history slots (the Navigation API's entry keys): a tab's slots are its own,
 * and a reload, the same address loaded again, or going back and on again
 * keeps at least one of them.
 *
 *   - The key was written while this tab held one of the slots it holds now:
 *     it is this tab's own key, on whichever page.
 *   - None of them, and the tab has an opener: the key is the opener's, on
 *     this tab's first page or a later one.
 *   - None of them, and no opener: on a tab's first page it is still a copy
 *     (the opening page cut the opener link, or the tab that opened this one
 *     has been closed); on a later page it is taken as this tab's own — a
 *     tab that left the site and came back by a link no longer lists its
 *     earlier pages, and it must not be counted twice. The two cannot be
 *     told apart there, and an ordinary tab comes first.
 *   - No slots to compare (a browser without the Navigation API): only the
 *     first page of a tab with an opener is taken to hold a copy.
 *
 * WHAT THAT LEAVES. Each of these needs a tab another tab opened:
 *   - with its opener gone (cut by the opening page, or the opening tab
 *     closed), or in a browser without the Navigation API, a copied key is
 *     not recognised once the tab's first page was another page of the site
 *     — and with both at once, not on its first page either: that tab's
 *     visit is not counted and its sign-up names the opener's source;
 *   - a tab that still has its opener is counted again if it leaves the site
 *     and comes back by a link, or — without the Navigation API — if its
 *     first page's own address is loaded again.
 * And one needs no other tab: a tab whose only page is replaced by another
 * site's page and then by this site's again (location.replace both ways) is
 * counted again. No page of this site navigates that way, and the site's own
 * pages never open a tab with an opener: all of this covers a page elsewhere,
 * or a visitor's script, that does. An ordinary tab — a link tapped in an
 * app, an email or a browser — is never affected by the rules above.
 */

const STORAGE_PREFIX = "ur-conv-source:";
/** The history slots this tab held when its key was written (see above). */
const SLOT_PREFIX = "ur-conv-slot:";
/** A browser keeps at most this many history entries per tab. */
const MAX_SLOTS = 50;

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
 * This tab's history slots: the Navigation API's keys for the pages of this
 * site the tab holds, the current one among them. A reload or a same-address
 * load keeps a page's slot, and no other tab shares one. Null where the
 * browser has no Navigation API (or lists nothing).
 */
function ownSlots(): string[] | null {
  try {
    const navigation = (
      window as Window & {
        navigation?: { entries?: () => { key?: unknown }[] };
      }
    ).navigation;
    if (!navigation || typeof navigation.entries !== "function") return null;
    const keys = navigation
      .entries()
      .map((entry) => entry.key)
      .filter((key): key is string => typeof key === "string" && key !== "")
      .slice(-MAX_SLOTS);
    return keys.length > 0 ? keys : null;
  } catch {
    return null;
  }
}

/**
 * Whether this is the first page the tab has shown, reached by a navigation —
 * not a reload, and not a restored or duplicated tab.
 */
function isFirstPage(): boolean {
  if (window.history.length !== 1) return false;
  const [entry] = performance.getEntriesByType(
    "navigation",
  ) as PerformanceNavigationTiming[];
  return entry?.type === "navigate";
}

/**
 * Whether the key in this tab's sessionStorage is a copy made when another
 * tab opened this one, so it is the other tab's (the rules above). Any
 * error: no.
 */
function storageCopiedFromOpener(campaign: string): boolean {
  try {
    const slots = ownSlots();
    const written = window.sessionStorage.getItem(SLOT_PREFIX + campaign);
    if (slots !== null && written !== null && written !== "") {
      // Written while this tab held one of the slots it holds now: its own.
      const writtenIn = written.split(",");
      if (slots.some((slot) => writtenIn.includes(slot))) return false;
      // Written in slots this tab does not hold. With an opener, that is the
      // opener's key — on this tab's first page or a later one.
      if (window.opener) return true;
      // No opener: a copy only on the tab's first page (see above).
      return isFirstPage();
    }
    // Nothing to compare: the first page of a tab with an opener.
    return Boolean(window.opener) && isFirstPage();
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
    const slots = ownSlots();
    if (slots !== null) {
      window.sessionStorage.setItem(SLOT_PREFIX + campaign, slots.join(","));
    } else {
      // Never leave another tab's slots beside this tab's key.
      window.sessionStorage.removeItem(SLOT_PREFIX + campaign);
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
