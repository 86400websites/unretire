import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect } from "../fixtures";
import { CAMPAIGN } from "../../../src/lib/webinar/config";

/**
 * Sprint S6.1 — scripts/webinar-funnel.mjs, read as TEXT.
 *
 * The script is plain Node: it cannot import the site's TypeScript config or
 * the approved email sheet, so it carries its own copy of every Mailchimp
 * name. A copy can drift. This spec is what stops it: the tag names must be
 * the ones the site applies (src/lib/webinar/config.ts), and the campaign
 * names, subjects, preview texts, segments and send rules must be the ones
 * the owner approved (docs/content/email-copy/conv1.md, PASTE VERSION).
 *
 * It also holds the script to what it promises NOT to be able to do. The
 * script reaches Mailchimp through a fixed list of routes; that list is read
 * here and compared with the one this spec expects, so a new endpoint — above
 * all one that sets an email's body, sends, schedules or permanently deletes
 * — cannot be added without this file changing in the same diff.
 *
 * Nothing here runs the script or makes a request. What the script DOES
 * against Mailchimp is proven by the "Webinar Funnel" workflow run.
 *
 * The last group is the one exception to "read as TEXT": it imports the script
 * for its pure helpers (importing it does nothing) and holds them to the rule
 * that an email with a "{{…}}" placeholder left in it cannot pass launch-check.
 */

const ROOT = path.join(__dirname, "..", "..", "..");

function read(relative: string): string {
  // The worktree is CRLF on Windows and LF in CI; compare one way.
  return fs
    .readFileSync(path.join(ROOT, relative), "utf8")
    .replace(/\r\n/g, "\n");
}

const script = read("scripts/webinar-funnel.mjs");
const config = read("src/lib/webinar/config.ts");
const sheet = read("docs/content/email-copy/conv1.md");
const workflow = read(".github/workflows/webinar-funnel.yml");

/** The string values of the `tags: { … }` block in config.ts. */
function tagsInConfig(): string[] {
  const block = /\btags:\s*\{([\s\S]*?)\n {2}\},/.exec(config);
  if (!block) throw new Error("config.ts: the tags block was not found.");
  return [...block[1].matchAll(/^\s*[A-Za-z]+:\s*"([^"]+)",?\s*$/gm)].map(
    (match) => match[1],
  );
}

type SheetEmail = {
  name: string;
  subject: string;
  preview: string;
  /** For the seven scheduled emails; null for the two flow emails. */
  segment: string | null;
  rule: string;
};

/** Every email in conv1.md: its PASTE VERSION subject and preview, and its table row. */
function emailsInSheet(): SheetEmail[] {
  const emails: SheetEmail[] = [];
  const sections = sheet.split(/^## (?=conv1-\d\d )/m).slice(1);
  for (const section of sections) {
    const name = section.slice(0, "conv1-00".length);
    const paste =
      /### PASTE VERSION\n\nSubject\n\n```text\n([^\n]+)\n```\n\nPreview text\n\n```text\n([^\n]+)\n```/.exec(
        section,
      );
    if (!paste) throw new Error(`conv1.md: no PASTE VERSION for ${name}.`);
    const row = new RegExp(`^\\| \`${name}\` \\|(.*)\\|$`, "m").exec(sheet);
    if (!row) throw new Error(`conv1.md: no table row for ${name}.`);
    const cells = row[1].split("|").map((cell) => cell.trim());
    const segment = /^Segment "([^"]+)"$/.exec(cells[2]);
    emails.push({
      name,
      subject: paste[1],
      preview: paste[2],
      segment: segment ? segment[1] : null,
      rule: cells[3],
    });
  }
  return emails;
}

/** key → name, from the script's `segments: [ … ]` entries. */
function segmentsInScript(): Map<string, string> {
  return new Map(
    [...script.matchAll(/key:\s*"(\w+)",\s*name:\s*"([^"]+)",/g)].map(
      (match) => [match[1], match[2]],
    ),
  );
}

/** Every Mailchimp route the script names: "METHOD /path". */
function routesInScript(): string[] {
  return [
    ...new Set(
      [...script.matchAll(/"((?:GET|POST|PUT|PATCH|DELETE) \/[^"]*)"/g)].map(
        (match) => match[1],
      ),
    ),
  ].sort();
}

const READ_ROUTES = [
  "GET /",
  "GET /campaigns",
  "GET /campaigns/{campaign_id}/content",
  "GET /lists/{list_id}",
  "GET /lists/{list_id}/members/{subscriber_hash}",
  "GET /lists/{list_id}/segments",
  "GET /lists/{list_id}/segments/{segment_id}",
  "GET /lists/{list_id}/segments/{segment_id}/members",
];

/** The only five things the script may change in Mailchimp. */
const WRITE_ROUTES = [
  "DELETE /lists/{list_id}/members/{subscriber_hash}", // archive a test contact
  "POST /campaigns", // create one of the seven empty drafts
  "POST /lists/{list_id}/members/{subscriber_hash}/tags", // tag a test contact
  "POST /lists/{list_id}/segments", // create a tag or a saved segment
  "PUT /lists/{list_id}/members/{subscriber_hash}", // create a test contact
];

test.describe("S6.1 funnel script — its names are the approved names", () => {
  test("every tag in config.ts is in the script, and the parser saw them all", () => {
    const tags = tagsInConfig();
    // The text parser and the real module must agree, or the parser is blind.
    expect([...tags].sort()).toEqual(Object.values(CAMPAIGN.tags).sort());
    expect(tags).toHaveLength(3);
    for (const tag of tags) {
      expect(script, `tag ${tag}`).toContain(`"${tag}"`);
    }
  });

  test("the campaign id and the session length equal config.ts", () => {
    expect(script).toContain(`campaignId: "${CAMPAIGN.id}"`);
    expect(script).toContain(`sessionMinutes: ${CAMPAIGN.sessionMinutes},`);
    expect(config).toContain(`id: "${CAMPAIGN.id}"`);
    expect(config).toContain(`sessionMinutes: ${CAMPAIGN.sessionMinutes},`);
  });

  test("the sheet has nine emails: two flows and seven scheduled", () => {
    const emails = emailsInSheet();
    expect(emails.map((email) => email.name)).toEqual([
      "conv1-01",
      "conv1-02",
      "conv1-03",
      "conv1-04",
      "conv1-05",
      "conv1-06",
      "conv1-07",
      "conv1-08",
      "conv1-09",
    ]);
    expect(
      emails.filter((email) => email.segment).map((email) => email.name),
    ).toEqual([
      "conv1-03",
      "conv1-04",
      "conv1-05",
      "conv1-06",
      "conv1-07",
      "conv1-08",
      "conv1-09",
    ]);
  });

  test("every PASTE VERSION subject and preview text is in the script, brackets included", () => {
    for (const email of emailsInSheet()) {
      expect(script, `${email.name} name`).toContain(`name: "${email.name}"`);
      expect(script, `${email.name} subject`).toContain(`"${email.subject}"`);
      expect(script, `${email.name} preview`).toContain(`"${email.preview}"`);
    }
  });

  test("every segment name in the sheet is in the script", () => {
    const names = new Set(
      emailsInSheet()
        .map((email) => email.segment)
        .filter((name): name is string => name !== null),
    );
    expect([...names].sort()).toEqual([
      "Conv1 - Registered",
      "Conv1 - Registered, not bought",
      "Conv1 - Toolkit, not registered",
    ]);
    expect([...segmentsInScript().values()].sort()).toEqual([...names].sort());
  });

  test("each of the seven drafts pairs its own subject, preview, segment and send rule", () => {
    const segments = segmentsInScript();
    const scheduled = emailsInSheet().filter((email) => email.segment);
    expect(scheduled).toHaveLength(7);
    for (const email of scheduled) {
      const entry = new RegExp(
        `name: "${email.name}",\\s*segment: "(\\w+)",\\s*subject:\\s*"([^"]*)",\\s*preview:\\s*"([^"]*)",\\s*send: \\{\\s*rule: "([^"]*)"`,
      ).exec(script);
      expect(entry, `${email.name} entry`).not.toBeNull();
      if (!entry) continue;
      expect(segments.get(entry[1]), `${email.name} segment`).toBe(
        email.segment,
      );
      expect(entry[2], `${email.name} subject`).toBe(email.subject);
      expect(entry[3], `${email.name} preview`).toBe(email.preview);
      expect(entry[4], `${email.name} send rule`).toBe(email.rule);
    }
  });
});

test.describe("S6.1 funnel script — what it cannot do", () => {
  test("no send, test-send, schedule or permanent-delete endpoint appears anywhere", () => {
    for (const forbidden of [
      "/actions/send",
      "/actions/test",
      "/actions/schedule",
      "/actions/",
      "delete-permanent",
    ]) {
      expect(script, forbidden).not.toContain(forbidden);
    }
  });

  test("the email-body endpoint appears once, and only as a GET", () => {
    // "docs/content/…" is a file path in a comment, not an endpoint.
    const occurrences = script
      .replaceAll("docs/content/", "")
      .split("/content");
    expect(occurrences).toHaveLength(2);
    expect(script).toContain('"GET /campaigns/{campaign_id}/content"');
  });

  test("the routes are exactly the expected list; five of them write", () => {
    expect(routesInScript()).toEqual([...READ_ROUTES, ...WRITE_ROUTES].sort());
    expect(
      routesInScript().filter((route) => !route.startsWith("GET ")),
    ).toEqual(WRITE_ROUTES);
    // The only campaign route that is not a GET creates a draft.
    expect(
      routesInScript().filter(
        (route) => route.includes("/campaigns") && !route.startsWith("GET "),
      ),
    ).toEqual(["POST /campaigns"]);
  });

  test("no request can bypass the route list", () => {
    // Two fetch calls: one behind the route list, one that only reads the site.
    expect(script.split("fetch(")).toHaveLength(3);
    // No method is ever typed at a call site; it comes from the route.
    expect(script).not.toMatch(/method:\s*["'`]/);
    expect(script).toContain("if (!ALLOWED_ROUTES.has(route))");
    expect(script).toContain(
      'if (method !== "GET" && !WRITE_ROUTES.has(route))',
    );
  });

  test("every contact write checks for a test address first", () => {
    for (const writer of [
      "upsertTestMember",
      "tagTestMember",
      "archiveTestMember",
    ]) {
      const body = new RegExp(
        `async function ${writer}\\([^)]*\\) \\{\\s*assertTestAddress\\(email\\);`,
      );
      expect(script, writer).toMatch(body);
    }
    expect(script).toContain("+ur-(e2e|test)-");
  });

  test("the self-test archives in a finally block and names the run in its addresses", () => {
    expect(script).toMatch(/\} finally \{\s*heading\("Tidy up"\);/);
    expect(script).toContain('requireEnv("GITHUB_RUN_ID")');
    expect(script).toContain('requireEnv("GITHUB_RUN_ATTEMPT")');
    expect(script).toContain("is_syncing: true");
  });

  test("the local-fake override is loopback-only and is not in the workflow", () => {
    expect(script).toContain('"MAILCHIMP_API_BASE_FOR_TESTS"');
    expect(script).toContain('"http://127.0.0.1:"');
    expect(script).toContain('url.hostname === "127.0.0.1"');
    expect(workflow).not.toContain("MAILCHIMP_API_BASE_FOR_TESTS");
  });
});

type Link = { kind: string; token?: string; host?: string; path?: string };

type FunnelHelpers = {
  visibleText(html: string): string;
  findBlanks(text: string): string[];
  findPlaceholders(text: string): string[];
  extractLinks(html: string): string[];
  classifyLink(href: string, siteOrigin: string): Link;
};

/** The script's pure helpers. Importing the script runs nothing and makes no request. */
function helpers(): Promise<FunnelHelpers> {
  return import(
    pathToFileURL(path.join(ROOT, "scripts", "webinar-funnel.mjs")).href
  );
}

test.describe("S6.1 funnel script — a placeholder left in an email", () => {
  const SITE = "https://www.example.com";

  test("a link that is still {{…}} is its own kind, named only when it is a bare name", async () => {
    const { classifyLink } = await helpers();
    expect(classifyLink("{{ZOOM_URL}}", SITE)).toEqual({
      kind: "placeholder",
      token: "{{ZOOM_URL}}",
    });
    // Percent-encoded curly brackets, in either case, are the same placeholder.
    expect(classifyLink("%7B%7BCOURSE_URL%7D%7D", SITE)).toEqual({
      kind: "placeholder",
      token: "{{COURSE_URL}}",
    });
    expect(classifyLink("%7b%7bREPLAY_URL%7d%7d", SITE)).toEqual({
      kind: "placeholder",
      token: "{{REPLAY_URL}}",
    });
    // Anything more than a bare name is never given back: it may hold an address.
    for (const href of [
      "http://{{ZOOM_URL}}",
      "https://us02web.zoom.us/j/1?pwd={{PASSWORD}}",
      "https://www.example.com/{{COURSE_URL}}",
      "{{https://us02web.zoom.us/j/1}}",
      "{{zoom url}}",
      "{{ZOOM_URL}}?e=*|EMAIL|*",
      "{{ZOOM_URL",
      "ZOOM_URL}}",
    ]) {
      expect(classifyLink(href, SITE), href).toEqual({ kind: "placeholder" });
    }
  });

  test("merge tags, mailto and ordinary links are sorted exactly as before", async () => {
    const { classifyLink } = await helpers();
    for (const href of ["*|UNSUB|*", "*|ARCHIVE|*", "*|UPDATE_PROFILE|*"]) {
      expect(classifyLink(href, SITE), href).toEqual({ kind: "skipped" });
    }
    expect(classifyLink("mailto:hello@example.net", SITE)).toEqual({
      kind: "skipped",
    });
    expect(classifyLink("https://www.example.com/start?x=1", SITE)).toEqual({
      kind: "internal",
      path: "/start?x=1",
    });
    expect(classifyLink("https://www.youtube.com/watch?v=abc", SITE)).toEqual({
      kind: "external",
      host: "www.youtube.com",
    });
    expect(classifyLink("https://us02web.zoom.us/j/1?pwd=x", SITE)).toEqual({
      kind: "zoom",
    });
    expect(classifyLink("https://example.com/start", SITE)).toEqual({
      kind: "wrong-origin",
    });
    expect(classifyLink("[link]", SITE)).toEqual({ kind: "blank" });
    expect(classifyLink("not a web address", SITE)).toEqual({
      kind: "unreadable",
    });
  });

  test("{{…}} in a text is found: a bare name is listed, anything else is hidden", async () => {
    const { findPlaceholders, findBlanks } = await helpers();
    expect(findPlaceholders("Join at {{ZOOM_URL}} on {{ date }}.")).toEqual([
      "{{ZOOM_URL}}",
      "{{…}}",
    ]);
    expect(findPlaceholders("{{https://us02web.zoom.us/j/1}}")).toEqual([
      "{{…}}",
    ]);
    expect(findPlaceholders("Replace all {{...}} before sending")).toEqual([
      "{{…}}",
    ]);
    expect(findPlaceholders("one {{ left open")).toEqual(["{{…}}"]);
    expect(findPlaceholders("one closed }} alone")).toEqual(["{{…}}"]);
    // Mailchimp merge tags, square brackets and single curly brackets are not placeholders.
    expect(findPlaceholders("Hi *|FNAME|*, at [time] {see you}")).toEqual([]);
    expect(findPlaceholders(undefined as unknown as string)).toEqual([]);
    // …and a placeholder is not also reported as a "[" blank.
    expect(findBlanks("Join at {{ZOOM_URL}}")).toEqual([]);
  });

  test("comments, styles, the head and the title never count; the text and the links do", async () => {
    const {
      visibleText,
      findBlanks,
      findPlaceholders,
      extractLinks,
      classifyLink,
    } = await helpers();
    const html = [
      "<html><head><title>{{TITLE}} at [time]</title>",
      "<!--[if mso]><xml><o:PixelsPerInch>96</o:PixelsPerInch></xml><![endif]-->",
      "<style>a[x-apple-data-detectors]{color:inherit} .x{{}}</style></head><body>",
      "<!-- Replace all {{...}} URL placeholders and all [square-bracket] content. -->",
      '<!--[if mso]><table role="presentation"><tr><td><![endif]-->',
      "<p>We start at [time]. {{START_TIME}} &#123;&#123;HOST_NAME&#125;&#125;</p>",
      '<a href="{{ZOOM_URL}}">Join on Zoom</a>',
      '<a href="https://www.example.com/start">Starter Plan</a>',
      '<a href="*|UNSUB|*">Unsubscribe</a>',
      "<!--[if mso]></td></tr></table><![endif]-->",
      "</body></html>",
    ].join("\n");
    const text = visibleText(html);
    expect(findBlanks(text)).toEqual(["[time]"]);
    expect(findPlaceholders(text)).toEqual(["{{START_TIME}}", "{{HOST_NAME}}"]);
    expect(
      extractLinks(html).map((href) => classifyLink(href, SITE).kind),
    ).toEqual(["placeholder", "internal", "skipped"]);
  });

  test("launch-check fails on a placeholder; check only lists it", () => {
    // The link: decided before the address is parsed, and never a bare note.
    const classify = script.slice(
      script.indexOf("export function classifyLink("),
      script.indexOf("function normalise("),
    );
    expect(classify.indexOf('kind: "placeholder"')).toBeGreaterThan(-1);
    expect(classify.indexOf('kind: "placeholder"')).toBeLessThan(
      classify.indexOf("new URL(href)"),
    );
    expect(script).toMatch(
      /\} else if \(link\.kind === "placeholder"\) \{\n {6}const line = link\.token\n[\s\S]{0,300}?\n {6}if \(strict\) fail\(line\);\n {6}else fact\(line\);\n {4}\} else if \(link\.kind === "unreadable"\) \{/,
    );
    // The text: subject, preview text and body, each failed when strict.
    expect(script).toMatch(
      /function reportPlaceholders\(where, placeholders, strict\) \{\n {2}if \(placeholders\.length === 0\) return;\n[\s\S]{0,300}?\n {2}if \(strict\) fail\(line\);\n {2}else fact\(line\);\n\}/,
    );
    for (const call of [
      'reportPlaceholders("  subject", findPlaceholders(found.subject), strict);',
      'reportPlaceholders("  preview text", findPlaceholders(found.preview), strict);',
      'reportPlaceholders("  body", findPlaceholders(text), strict);',
    ]) {
      expect(script, call).toContain(call);
    }
    // No report line is ever built from a link's own address.
    expect(script).not.toContain("${href}");
  });
});

test.describe("S6.1 funnel workflow — its guard rails", () => {
  /** The file without its comments: the header describes what it must not do. */
  const active = workflow
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n");

  test("named triggers only, read-only token, its own queue, no artifact", () => {
    expect(active).toContain("name: Webinar Funnel");
    expect(active).not.toContain("pull_request_target");
    expect(active).not.toContain("upload-artifact");
    expect(active).toMatch(/permissions:\n {2}contents: read\n/);
    expect(active).toContain("cancel-in-progress: false");
    expect(active).toContain(
      "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository",
    );
    expect(active).toMatch(
      /pull_request:\n {4}paths:\n {6}- scripts\/webinar-funnel\.mjs\n {6}- \.github\/workflows\/webinar-funnel\.yml\n/,
    );
  });

  test("the secrets are named once each, on the step that runs the script", () => {
    expect(active.split("secrets.")).toHaveLength(4);
    const step = active.slice(active.indexOf("- name: Run the funnel script"));
    for (const name of [
      "secrets.MAILCHIMP_API_KEY",
      "secrets.MAILCHIMP_LIST_ID",
      "secrets.E2E_OWNER_MAILBOX",
      "vars.PRODUCTION_URL",
    ]) {
      expect(step, name).toContain(name);
    }
  });

  test("the dispatch modes are the script's modes, with check as the default", () => {
    const options = /options:\n((?: {10}- [a-z-]+\n)+)/.exec(active);
    expect(options).not.toBeNull();
    const modes = (options?.[1] ?? "")
      .split("\n")
      .map((line) => line.replace(/^\s*- /, ""))
      .filter(Boolean);
    expect(modes).toEqual([
      "check",
      "launch-check",
      "setup",
      "drafts",
      "selftest",
      "cleanup",
    ]);
    expect(active).toMatch(/default: check\n/);
    for (const mode of modes) {
      expect(script, mode).toMatch(
        new RegExp(`\\n {2}(?:"${mode}"|${mode})[,:]`),
      );
    }
  });
});
