import fs from "node:fs";
import path from "node:path";
import { test, expect } from "../fixtures";
import {
  LINK_CONTRACT,
  SOURCE_KEYS,
  isSourceKey,
  resolveSource,
  trackingLink,
  type SourceInput,
  type SourceKey,
} from "../../../src/lib/webinar/sources";

/**
 * Sprint S6.2 — where a visitor came from (src/lib/webinar/sources.ts): the
 * webinar report's eight rows, the rules that file a visit or a sign-up under
 * one of them, and the fixed set of links the owner's team posts.
 * FEATURE-LIST line IN-009 (a draft until the owner approves it at Gate B).
 *
 * Asserted against the function, not through a browser. The module is pure
 * and import-free, and the SAME rules run in the visitor's tab
 * (src/app/conversation/tab-source.ts) and on the server, so one direct proof
 * covers both — and the hostile referrers below (a look-alike host, a
 * platform's name somewhere else in an address) are tried directly instead of
 * being hoped for.
 *
 * THE LINK CONTRACT LIVES IN TWO PLACES THAT MUST NOT DRIFT: LINK_CONTRACT in
 * sources.ts, and the "## Link contract" table of the sprint record
 * (docs/sprint-prompts/S6.2-webinar-report.md), which the owner's guide and
 * the Excel sheet are copied from. The last group reads that table as TEXT
 * and holds it to the code row by row, so a link changed in one place and not
 * the other turns this file red.
 *
 * Nothing here makes a request.
 */

const ROOT = path.join(__dirname, "..", "..", "..");
const RECORD = "docs/sprint-prompts/S6.2-webinar-report.md";

/** The origin of every link the team posts (the sprint record's Link contract). */
const LIVE = "https://www.unretireproject.com";

/** What the Link contract table shows in the Link column of the "other" row. */
const NO_LINK = "—";

function read(relative: string): string {
  // The worktree is CRLF on Windows and LF in CI; compare one way.
  return fs
    .readFileSync(path.join(ROOT, relative), "utf8")
    .replace(/\r\n/g, "\n");
}

/** Each input must resolve to its key; a failure names the input. */
function expectResolved(cases: [SourceInput, SourceKey][]): void {
  for (const [input, key] of cases) {
    expect(resolveSource(input), JSON.stringify(input)).toBe(key);
  }
}

/** A visit whose address carries no tag at all: the referrer decides. */
function fromReferrer(referrer: string): SourceKey {
  return resolveSource({ utmSource: null, utmMedium: null, referrer });
}

type ContractTable = {
  header: string[];
  divider: string;
  rows: { key: string; where: string; link: string }[];
};

/** The sprint record's "## Link contract" table, exactly as written. */
function contractTable(): ContractTable {
  const lines = read(RECORD).split("\n");
  const at = lines.flatMap((line, index) =>
    line === "## Link contract" ? [index] : [],
  );
  if (at.length !== 1) {
    throw new Error(
      `${RECORD}: expected one "## Link contract" heading, found ${at.length}.`,
    );
  }
  const table: string[] = [];
  for (const line of lines.slice(at[0]! + 1)) {
    if (line.startsWith("## ")) break;
    if (line.startsWith("|")) table.push(line);
  }
  const cells = (line: string) =>
    line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim());
  const [header = "", divider = "", ...rows] = table;
  return {
    header: cells(header),
    divider,
    rows: rows.map((line) => {
      const [key = "", where = "", link = ""] = cells(line);
      return { key, where, link };
    }),
  };
}

test.describe("S6.2 report sources — the report's rows", () => {
  test("IN-009 eight keys, in the order the report shows them", () => {
    expect([...SOURCE_KEYS]).toEqual([
      "linkedin",
      "instagram",
      "facebook",
      "whatsapp",
      "email",
      "meta-ads",
      "linkedin-ads",
      "other",
    ]);
    for (const key of SOURCE_KEYS) {
      expect(isSourceKey(key), key).toBe(true);
    }

    // A key is matched exactly: no trimming, no case folding, no near miss.
    for (const value of [
      "",
      " ",
      "LinkedIn",
      "LINKEDIN",
      " linkedin",
      "linkedin ",
      "Other",
      "other ",
      "meta",
      "newsletter",
      "ads",
      "meta_ads",
      "linkedin-ad",
      "tiktok",
      "linkedin,instagram",
    ]) {
      expect(isSourceKey(value), JSON.stringify(value)).toBe(false);
    }

    // Only a string can be a key, whatever it prints as.
    const notStrings: [string, unknown][] = [
      ["undefined", undefined],
      ["null", null],
      ["a number", 0],
      ["a boolean", true],
      ["an object", {}],
      ["an array holding a key", ["linkedin"]],
      ["an object that prints as a key", { toString: () => "linkedin" }],
      ["a String object", new String("linkedin")],
      ["a symbol", Symbol("linkedin")],
    ];
    for (const [label, value] of notStrings) {
      expect(isSourceKey(value), label).toBe(false);
    }
  });
});

test.describe("S6.2 report sources — rule 1: a paid link", () => {
  test("IN-009 paid + meta, facebook or instagram is meta-ads; paid + linkedin is linkedin-ads", () => {
    expectResolved([
      [{ utmSource: "meta", utmMedium: "paid" }, "meta-ads"],
      [{ utmSource: "facebook", utmMedium: "paid" }, "meta-ads"],
      [{ utmSource: "instagram", utmMedium: "paid" }, "meta-ads"],
      [{ utmSource: "linkedin", utmMedium: "paid" }, "linkedin-ads"],
    ]);
  });

  test("IN-009 paid + Meta's short names fb or ig is meta-ads, in any case", () => {
    // Meta can write its own utm_source on an ad's link; it may use these.
    expectResolved([
      [{ utmSource: "fb", utmMedium: "paid" }, "meta-ads"],
      [{ utmSource: "ig", utmMedium: "paid" }, "meta-ads"],
      [{ utmSource: " FB ", utmMedium: "Paid" }, "meta-ads"],
      [{ utmSource: "Ig", utmMedium: "PAID" }, "meta-ads"],
    ]);
  });

  test("IN-009 paid + any other source, or none, is other — and the referrer is not consulted", () => {
    for (const utmSource of [
      "google",
      "whatsapp",
      "newsletter",
      "tiktok",
      "email",
      "meta-ads",
      "linkedin-ads",
      "other",
      "f b",
      "igg",
      "fbx",
      "li",
    ]) {
      expectResolved([[{ utmSource, utmMedium: "paid" }, "other"]]);
    }
    expectResolved([
      [{ utmMedium: "paid" }, "other"],
      [{ utmSource: null, utmMedium: "paid" }, "other"],
      [{ utmSource: "", utmMedium: "paid" }, "other"],
      [{ utmSource: "   ", utmMedium: "paid" }, "other"],
      // Rule 1 decides before rule 3: a paid link with no source is "other"
      // even when the click came from a platform.
      [
        { utmMedium: "paid", referrer: "https://www.linkedin.com/feed/" },
        "other",
      ],
      [{ utmMedium: "paid", referrer: "https://l.instagram.com/" }, "other"],
    ]);
  });
});

test.describe("S6.2 report sources — rule 2: utm_source", () => {
  test("IN-009 linkedin, instagram, facebook and whatsapp are themselves; newsletter is email", () => {
    expectResolved([
      [{ utmSource: "linkedin", utmMedium: "social" }, "linkedin"],
      [{ utmSource: "instagram", utmMedium: "social" }, "instagram"],
      [{ utmSource: "facebook", utmMedium: "social" }, "facebook"],
      [{ utmSource: "whatsapp", utmMedium: "social" }, "whatsapp"],
      [{ utmSource: "newsletter", utmMedium: "email" }, "email"],
      // The medium only matters when it is exactly "paid".
      [{ utmSource: "linkedin" }, "linkedin"],
      [{ utmSource: "newsletter" }, "email"],
      [{ utmSource: "whatsapp", utmMedium: "cpc" }, "whatsapp"],
      [{ utmSource: "linkedin", utmMedium: "paid-social" }, "linkedin"],
    ]);
  });

  test("IN-009 Meta's short names: ig is instagram, fb is facebook, in any case", () => {
    // Instagram can add its own link parameters (utm_source=ig) to a bio or
    // Story link; the visit stays on the Instagram row, not "Other".
    expectResolved([
      [{ utmSource: "ig", utmMedium: "social" }, "instagram"],
      [{ utmSource: "fb", utmMedium: "social" }, "facebook"],
      [{ utmSource: "ig" }, "instagram"],
      [{ utmSource: "fb" }, "facebook"],
      [{ utmSource: " IG ", utmMedium: "social" }, "instagram"],
      [{ utmSource: "Fb", utmMedium: "cpc" }, "facebook"],
      // A source still wins over the referrer.
      [
        { utmSource: "ig", referrer: "https://www.linkedin.com/feed/" },
        "instagram",
      ],
    ]);
  });

  test("IN-009 any other utm_source is other — including the name of a report row", () => {
    for (const utmSource of [
      "tiktok",
      "twitter",
      "x",
      "google",
      "meta", // only a PAID link may say "meta"
      "email", // the newsletter's tag is "newsletter", not "email"
      "meta-ads",
      "linkedin-ads",
      "other",
      "linkedin.com",
      "news letter",
    ]) {
      expectResolved([
        [{ utmSource, utmMedium: "social" }, "other"],
        [{ utmSource }, "other"],
      ]);
    }
  });

  test("IN-009 a utm_source wins over the referrer", () => {
    expectResolved([
      [
        { utmSource: "whatsapp", referrer: "https://www.linkedin.com/feed/" },
        "whatsapp",
      ],
      [
        { utmSource: "newsletter", referrer: "https://www.instagram.com/" },
        "email",
      ],
      [
        {
          utmSource: "facebook",
          utmMedium: "social",
          referrer: "https://l.instagram.com/",
        },
        "facebook",
      ],
      // An unknown tag still decides: "other", not the platform it came through.
      [{ utmSource: "tiktok", referrer: "https://www.facebook.com/" }, "other"],
    ]);
  });
});

test.describe("S6.2 report sources — values are cleaned first", () => {
  test("IN-009 values are trimmed and lower-cased", () => {
    expectResolved([
      [{ utmSource: "  LinkedIn ", utmMedium: "social" }, "linkedin"],
      [{ utmSource: "LINKEDIN" }, "linkedin"],
      [{ utmSource: "WhatsApp", utmMedium: "Social" }, "whatsapp"],
      [{ utmSource: " NewsLetter\t" }, "email"],
      [{ utmSource: "Meta", utmMedium: "PAID" }, "meta-ads"],
      [{ utmSource: "INSTAGRAM", utmMedium: "PAID" }, "meta-ads"],
      [{ utmSource: " LinkedIn ", utmMedium: " Paid " }, "linkedin-ads"],
    ]);
  });

  test("IN-009 an empty or blank value counts as absent", () => {
    expectResolved([
      // No usable utm_source, so the referrer decides (rule 3).
      [
        { utmSource: "", referrer: "https://www.linkedin.com/feed/" },
        "linkedin",
      ],
      [
        { utmSource: "   ", referrer: "https://www.instagram.com/" },
        "instagram",
      ],
      [{ utmSource: null, referrer: "https://m.facebook.com/" }, "facebook"],
      // No usable medium: rule 2 as usual.
      [{ utmSource: "linkedin", utmMedium: "" }, "linkedin"],
      [{ utmSource: "linkedin", utmMedium: "   " }, "linkedin"],
      [{ utmSource: "linkedin", utmMedium: null }, "linkedin"],
      // Nothing at all.
      [{}, "other"],
      [{ utmSource: null, utmMedium: null, referrer: null }, "other"],
      [{ utmSource: "", utmMedium: "", referrer: "" }, "other"],
    ]);
  });
});

test.describe("S6.2 report sources — rule 3: no utm_source, so the referrer decides", () => {
  test("IN-009 LinkedIn, Instagram and Facebook referrers, their link shims included", () => {
    const shimmed = encodeURIComponent(`${LIVE}/conversation`);
    const cases: [string, SourceKey][] = [
      ["https://www.linkedin.com/feed/", "linkedin"],
      ["https://linkedin.com/", "linkedin"],
      ["https://lnkd.in/abc", "linkedin"],
      ["https://WWW.LinkedIn.COM/feed/", "linkedin"],
      [`https://l.instagram.com/?u=${shimmed}&e=AT0`, "instagram"],
      ["https://www.instagram.com/", "instagram"],
      ["https://instagram.com/", "instagram"],
      ["https://m.facebook.com/", "facebook"],
      [`https://l.facebook.com/l.php?u=${shimmed}&h=AT0`, "facebook"],
      ["https://lm.facebook.com/", "facebook"],
      ["https://www.facebook.com/", "facebook"],
    ];
    for (const [referrer, key] of cases) {
      expect(fromReferrer(referrer), referrer).toBe(key);
    }
  });

  test("IN-009 a host matches on whole labels only", () => {
    for (const referrer of [
      "https://evil-linkedin.com/",
      "https://linkedin.com.evil.example/",
      "https://notinstagram.com/",
      "https://instagram.com.evil.example/",
      "https://notfacebook.com/",
      "https://facebook.com.evil.example/",
      "https://xlnkd.in/",
      "https://lnkd.in.evil.example/",
      // A platform's name anywhere but the host does not count either.
      "https://www.linkedin.com@evil.example/",
      "https://evil.example/https://www.linkedin.com/",
      "https://evil.example/?ref=www.instagram.com",
    ]) {
      expect(fromReferrer(referrer), referrer).toBe("other");
    }
  });

  test("IN-009 this site, a search engine, webmail, an unreadable referrer and none at all are other", () => {
    for (const referrer of [
      `${LIVE}/`,
      `${LIVE}/conversation?utm_source=linkedin&utm_medium=social`,
      "https://unretireproject.com/",
      "http://localhost:3000/conversation",
      "https://www.google.com/",
      "https://www.bing.com/",
      "https://duckduckgo.com/",
      "https://mail.google.com/",
      "https://outlook.live.com/",
      "not a url",
      "www.linkedin.com", // no scheme: not an address a browser would send
      "",
    ]) {
      expect(fromReferrer(referrer), JSON.stringify(referrer)).toBe("other");
    }
  });
});

test.describe("S6.2 report sources — the link contract", () => {
  test("IN-009 every posted link resolves back to its own row", () => {
    // One link per row, in the report's order; "other" is what is left over.
    expect(LINK_CONTRACT.map((entry) => entry.key)).toEqual(
      SOURCE_KEYS.filter((key) => key !== "other"),
    );
    expect(() => trackingLink(LIVE, "other" as never)).toThrow();

    for (const entry of LINK_CONTRACT) {
      const link = trackingLink(LIVE, entry.key);
      const url = new URL(link);
      expect(url.origin, link).toBe(LIVE);
      expect(url.pathname, link).toBe("/conversation");
      expect(url.hash, link).toBe("");
      // utm_source and utm_medium, and nothing else.
      expect([...url.searchParams], link).toEqual([
        ["utm_source", entry.utmSource],
        ["utm_medium", entry.utmMedium],
      ]);

      // Read the way the visitor's tab reads it (tab-source.ts) ...
      const tagged = {
        utmSource: url.searchParams.get("utm_source"),
        utmMedium: url.searchParams.get("utm_medium"),
      };
      expect(resolveSource({ ...tagged, referrer: "" }), link).toBe(entry.key);
      // ... and the link still wins when the click came through another
      // platform's app or a search engine.
      for (const referrer of [
        "https://www.linkedin.com/feed/",
        "https://l.instagram.com/",
        "https://lm.facebook.com/",
        "https://www.google.com/",
      ]) {
        expect(
          resolveSource({ ...tagged, referrer }),
          `${link} from ${referrer}`,
        ).toBe(entry.key);
      }
    }
  });

  test("IN-009 the sprint record's Link contract table lists the same keys and links, in the same order", () => {
    const table = contractTable();
    expect(table.header).toEqual(["Key", "Where the team uses it", "Link"]);
    expect(table.divider).toMatch(/^\|(\s*:?-+:?\s*\|){3}$/);

    // Every report row, in the report's order — "other" last, with no link.
    expect(table.rows.map((row) => row.key)).toEqual([...SOURCE_KEYS]);
    for (const row of table.rows) {
      expect(row.where, `the "${row.key}" row says where it is used`).not.toBe(
        "",
      );
    }
    expect(table.rows.at(-1)?.link).toBe(NO_LINK);

    const tracked = table.rows.filter((row) => row.key !== "other");
    expect(tracked).toHaveLength(LINK_CONTRACT.length);
    LINK_CONTRACT.forEach((entry, index) => {
      expect(tracked[index]?.key).toBe(entry.key);
      expect(tracked[index]?.link, entry.key).toBe(
        trackingLink(LIVE, entry.key),
      );
    });
  });
});
