"use client";

import { useEffect } from "react";
import {
  rememberedTabSource,
  rememberTabSource,
  sourceFromThisPage,
} from "./tab-source";

/**
 * Counts one visit to /conversation per browser tab — Sprint S6.2.
 *
 * Rendered by the page only while registration is open. It draws nothing.
 *
 *   - Automated browsers (navigator.webdriver: our own tests, the morning
 *     check, most bots) are never counted. Link-preview robots never run
 *     scripts at all, so they never reach this.
 *   - A page Chrome prerenders in the background is counted only if and when
 *     the visitor actually opens it.
 *   - A tab whose visit was already counted (a reload, or React running the
 *     effect twice in development) sends nothing.
 *   - The visit goes out as one same-origin fetch with keepalive. Never
 *     navigator.sendBeacon: Chromium reports a beacon to content blockers as a
 *     "ping" request, and the blockers' default privacy list drops many
 *     ping-type requests, while a fetch is reported as an ordinary request. A
 *     failure is ignored: the visitor never notices, and the tab is not
 *     retried.
 *
 * Only the source key is sent. The server stores it with the campaign id and
 * the time, and nothing else.
 */
export default function ArrivalCounter({ campaign }: { campaign: string }) {
  useEffect(() => {
    if (navigator.webdriver) return;

    let cancelled = false;
    const count = () => {
      if (cancelled) return;
      if (rememberedTabSource(campaign)) return;
      const source = sourceFromThisPage();
      rememberTabSource(campaign, source);
      fetch("/api/conversation/arrival", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
        credentials: "same-origin",
        keepalive: true,
      }).catch(() => {
        // Not counted. Nothing the visitor needs to know about.
      });
    };

    const doc = document as Document & { prerendering?: boolean };
    if (doc.prerendering) {
      document.addEventListener("prerenderingchange", count, { once: true });
      return () => {
        cancelled = true;
        document.removeEventListener("prerenderingchange", count);
      };
    }

    count();
    return () => {
      cancelled = true;
    };
  }, [campaign]);

  return null;
}
