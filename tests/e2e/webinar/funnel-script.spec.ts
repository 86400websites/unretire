import fs from "node:fs";
import path from "node:path";
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
