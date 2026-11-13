/**
 * Webinar funnel — the Mailchimp side, set up and checked by one script.
 * Sprint S6.1. Run by the "Webinar Funnel" GitHub Actions workflow:
 *
 *   node scripts/webinar-funnel.mjs <mode>
 *
 *   setup         create the tags and the three saved segments if they are missing
 *   drafts        create the seven empty, unscheduled email drafts if they are missing
 *   selftest      prove the segments with five throw-away test contacts, then archive them
 *   check         read-only report of everything above
 *   launch-check  check, plus the hard go-live failures
 *   cleanup       archive leftover test contacts
 *
 * WHAT THIS SCRIPT CAN AND CANNOT DO — enforced in code, not only stated here.
 *
 *   • Every Mailchimp request goes through `request()`, which refuses any
 *     route that is not one of the fixed strings in `API` below. That list is
 *     the complete set of endpoints this file can reach: five of them write,
 *     the rest are GET. There is no route for setting an email's body, for
 *     sending, test-sending or scheduling, or for permanently deleting a
 *     contact, so no code path can do any of those.
 *     tests/e2e/webinar/funnel-script.spec.ts reads this file and fails if
 *     that list grows.
 *   • The only campaign write is "create one of the seven named drafts", built
 *     from the constants in `FUNNEL` and nothing else.
 *   • Every contact write (create, tag, archive) goes through
 *     `assertTestAddress()`: an address that is not an owner plus-address of
 *     the +ur-test-… / +ur-e2e-… shape is refused before any request.
 *     Archive, never delete: an archived test address can be used again.
 *   • Nothing here prints the API key, the audience id, a full email address,
 *     a Zoom address or anything Mailchimp sends back with an error. A failed
 *     call prints its route (without ids) and the status code.
 *
 * Dependency-free: Node 24, global fetch, this one file. Importing it does
 * nothing; it only runs when started directly.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Everything that names something in Mailchimp, in one place.
 *
 * The tag names must equal `CAMPAIGN.tags` in src/lib/webinar/config.ts, and
 * the names, subjects, preview texts, segments and send rules must equal
 * docs/content/email-copy/conv1.md (the PASTE VERSION blocks, square brackets
 * included). This file is plain Node and cannot import either, so
 * tests/e2e/webinar/funnel-script.spec.ts compares them as text.
 */
export const FUNNEL = {
  campaignId: "conv1",
  /** Length of the session; Email 7 must go out after it ends. */
  sessionMinutes: 60,
  /** Send times are worked out in the webinar's fixed offset (SAST). */
  utcOffset: "+02:00",
  utcOffsetMinutes: 120,
  zoneLabel: "SAST",
  tags: {
    registered: "conv1-registered",
    toolkit: "conv1-toolkit",
    purchased: "purchased-course",
    /** The second developer's tag. Looked up, or created empty; never applied. */
    premium: "premium",
  },
  /** The two tags a webinar sign-up can carry. Test contacts are found by these. */
  funnelTagKeys: ["registered", "toolkit"],
  segments: [
    {
      key: "registered",
      name: "Conv1 - Registered",
      is: ["registered"],
      not: [],
    },
    {
      key: "toolkitNotRegistered",
      name: "Conv1 - Toolkit, not registered",
      is: ["toolkit"],
      not: ["registered"],
    },
    {
      key: "registeredNotBought",
      name: "Conv1 - Registered, not bought",
      is: ["registered"],
      not: ["purchased", "premium"],
    },
  ],
  /** Emails 1 and 2 live in two flows the owner builds by hand; no API can read them. */
  flows: [
    {
      name: "conv1-01",
      tag: "registered",
      subject: "You’re in. [Thursday 10 December]",
      preview: "Your seat and your Zoom link.",
    },
    {
      name: "conv1-02",
      tag: "toolkit",
      subject: "Your Toolkit is here",
      preview: "Plus [one free hour] that takes it further.",
    },
  ],
  /** Emails 3 to 9: the seven drafts this script creates, empty and unscheduled. */
  campaigns: [
    {
      name: "conv1-03",
      segment: "toolkitNotRegistered",
      subject:
        "You stopped working. So why do you feel like you stopped mattering?",
      preview: "[This Thursday’s] free webinar is for you.",
      send: {
        rule: "Start date − 3 days, at 10:00",
        anchor: "start-date",
        days: -3,
        at: "10:00",
        must: "before-start",
      },
    },
    {
      name: "conv1-04",
      segment: "registered",
      subject: "[Tomorrow] at [time]: what do you say now?",
      preview: "Your Zoom link for [tomorrow].",
      send: {
        rule: "Start − 24 h",
        anchor: "start",
        hours: -24,
        must: "before-start",
      },
    },
    {
      name: "conv1-05",
      segment: "registered",
      subject: "We start in [one hour]",
      preview: "Grab a pen. Here’s your link.",
      send: { rule: "Start − 1 h", anchor: "start", hours: -1, must: "exact" },
    },
    {
      name: "conv1-06",
      segment: "registered",
      subject: "We’re live. Join now",
      preview: "The first question is on screen.",
      send: { rule: "Start", anchor: "start", hours: 0, must: "exact" },
    },
    {
      name: "conv1-07",
      segment: "registered",
      subject: "Your replay[, workbook] and free Starter Plan",
      preview: "Plus The (Un)Retire Course, open until [Thursday].",
      send: {
        rule: "Start date + 1 day, at 09:00",
        anchor: "start-date",
        days: 1,
        at: "09:00",
        must: "after-session",
      },
    },
    {
      name: "conv1-08",
      segment: "registeredNotBought",
      subject: "“Is it too late for me?”",
      preview: "Straight answers before the offer closes [Thursday].",
      send: {
        rule: "Start date + 4 days, at 09:00",
        anchor: "start-date",
        days: 4,
        at: "09:00",
        must: "before-offer-end",
      },
    },
    {
      name: "conv1-09",
      segment: "registeredNotBought",
      subject: "[Last day]: the offer closes [tonight]",
      preview: "Before someone asks “So, what do you do?”",
      send: {
        rule: "Offer-end date, at 09:00",
        anchor: "offer-end-date",
        days: 0,
        at: "09:00",
        must: "before-offer-end",
      },
    },
  ],
  /**
   * The self-test's contacts and the membership it must find. The expected
   * lists are written out, not derived from the segment definitions above: a
   * mistake in a definition must not be able to correct its own answer key.
   */
  selftest: {
    contacts: [
      { letter: "a", tags: ["registered"] },
      { letter: "b", tags: ["toolkit"] },
      { letter: "c", tags: ["registered", "purchased"] },
      { letter: "d", tags: ["toolkit", "registered"] },
    ],
    /** Created, archived and signed up again; reported, never asserted. */
    archivedContact: "f",
    expect: {
      registered: ["a", "c", "d"],
      toolkitNotRegistered: ["b"],
      registeredNotBought: ["a", "d"],
    },
  },
  /** Site paths the emails link to. The join path forwards to Zoom. */
  paths: { page: "/conversation", join: "/conversation/join" },
};

/**
 * The complete list of Mailchimp endpoints this script can call. `request()`
 * refuses anything else. Ids are filled into the {braces} at call time, so a
 * route can be printed as it stands without revealing one.
 */
const API = Object.freeze({
  account: "GET /",
  audience: "GET /lists/{list_id}",
  listSegments: "GET /lists/{list_id}/segments",
  createSegment: "POST /lists/{list_id}/segments",
  readSegment: "GET /lists/{list_id}/segments/{segment_id}",
  segmentMembers: "GET /lists/{list_id}/segments/{segment_id}/members",
  readMember: "GET /lists/{list_id}/members/{subscriber_hash}",
  upsertMember: "PUT /lists/{list_id}/members/{subscriber_hash}",
  tagMember: "POST /lists/{list_id}/members/{subscriber_hash}/tags",
  archiveMember: "DELETE /lists/{list_id}/members/{subscriber_hash}",
  listCampaigns: "GET /campaigns",
  createCampaign: "POST /campaigns",
  readCampaignBody: "GET /campaigns/{campaign_id}/content",
});

const ALLOWED_ROUTES = new Set(Object.values(API));

/** The five routes that change anything. Every other route must be a GET. */
const WRITE_ROUTES = new Set([
  API.createSegment,
  API.upsertMember,
  API.tagMember,
  API.archiveMember,
  API.createCampaign,
]);

/** The same shape the test harness enforces (tests/e2e/helpers/parity.ts). */
const TEST_ADDRESS = /^[^@+\s]+\+ur-(e2e|test)-[a-z0-9-]+@[^@\s]+$/i;

/** As in src/lib/mailchimp/client.ts: the suffix of the key picks the host. */
const DATA_CENTRE = /^[a-z]{2,4}\d{1,3}$/;

/**
 * For the local proof only. When this variable is set, the script talks to a
 * fake Mailchimp on this machine instead of the real one. It is honoured ONLY
 * for a plain http address on 127.0.0.1 with a port, and never on GitHub
 * Actions; any other value stops the script rather than falling back to the
 * live account.
 */
const TEST_BASE_ENV = "MAILCHIMP_API_BASE_FOR_TESTS";
const TEST_BASE_PREFIX = "http://127.0.0.1:";

const REQUEST_TIMEOUT_MS = 20000;
const PAGE_SIZE = 1000;
const MAX_PAGES = 500;
const POLL_ATTEMPTS = 18;
const POLL_INTERVAL_MS = 10000;
const POLL_INTERVAL_TEST_MS = 50;

/* ------------------------------------------------------------------ */
/* The report                                                          */
/* ------------------------------------------------------------------ */

const tally = { passed: 0, failed: 0 };

function say(line = "") {
  console.log(line);
}
function heading(title) {
  say("");
  say(`== ${title} ==`);
}
function fact(text) {
  say(`      ${text}`);
}
function note(text) {
  say(`NOTE  ${text}`);
}
function pass(text) {
  tally.passed += 1;
  say(`PASS  ${text}`);
}
function fail(text) {
  tally.failed += 1;
  say(`FAIL  ${text}`);
}

/** An error whose message is safe to print as it stands. */
class FunnelError extends Error {
  constructor(message) {
    super(message);
    this.name = "FunnelError";
  }
}

/* ------------------------------------------------------------------ */
/* Pure helpers (exported so they can be exercised without a network)  */
/* ------------------------------------------------------------------ */

export function isTestAddress(email) {
  return typeof email === "string" && TEST_ADDRESS.test(email.trim());
}

/** "someone+ur-test-seat1@example.com" → "…+ur-test-seat1@…". */
export function maskAddress(email) {
  const match = /^[^@+]*(\+[^@]*)?@/.exec(String(email).trim());
  return `…${match?.[1] ?? ""}@…`;
}

/** True only for http://127.0.0.1:<port> with nothing else attached. */
export function isLoopbackTestBase(value) {
  if (typeof value !== "string" || !value.startsWith(TEST_BASE_PREFIX)) {
    return false;
  }
  try {
    const url = new URL(value);
    return (
      url.protocol === "http:" &&
      url.hostname === "127.0.0.1" &&
      url.port !== "" &&
      url.username === "" &&
      url.password === "" &&
      url.search === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

function clockMinutes(at) {
  const [hours, minutes] = at.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Midnight (as a UTC instant) of the calendar day `instant` falls on in the webinar's offset. */
function localDayStart(instant) {
  const offsetMs = FUNNEL.utcOffsetMinutes * 60000;
  const shifted = new Date(instant.getTime() + offsetMs);
  return (
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ) - offsetMs
  );
}

/**
 * The planned send time of every draft, from the two instants the site shows.
 * All calendar arithmetic is done in the fixed +02:00 offset. A formula that
 * needs the offer end gives null when there is none.
 */
export function computeSendTimes(startsAt, offerEndsAt) {
  const plan = new Map();
  for (const campaign of FUNNEL.campaigns) {
    const { anchor, days = 0, hours = 0, at } = campaign.send;
    let when = null;
    if (anchor === "start") {
      when = new Date(startsAt.getTime() + hours * 3600000);
    } else {
      const base = anchor === "start-date" ? startsAt : offerEndsAt;
      if (base) {
        when = new Date(
          localDayStart(base) + days * 86400000 + clockMinutes(at) * 60000,
        );
      }
    }
    plan.set(campaign.name, when);
  }
  return plan;
}

const FIXED_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatAtOffset(instant, offsetMinutes) {
  return FIXED_FORMAT.format(
    new Date(instant.getTime() + offsetMinutes * 60000),
  ).replaceAll(",", "");
}

function formatInZone(instant, timeZone) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .format(instant)
      .replaceAll(",", "");
  } catch {
    return null;
  }
}

function decodeEntities(text) {
  return text
    .replace(/&(?:#0*91|#x0*5b|lbrack|lsqb);/gi, "[")
    .replace(/&(?:#0*93|#x0*5d|rbrack|rsqb);/gi, "]")
    .replace(/&(?:#0*38|#x0*26|amp);/gi, "&")
    .replace(/&nbsp;|&#0*160;/gi, " ");
}

/**
 * What a reader sees of an email's HTML: comments (Outlook's "[if mso]"
 * blocks among them), styles, scripts and tags are dropped first, because
 * they are full of square brackets that are not blanks.
 */
export function visibleText(html) {
  return decodeEntities(
    String(html ?? "")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(style|script|head|title)\b[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** Every "[" still in a text, each with the words that follow it. */
export function findBlanks(text) {
  const found = [];
  const source = String(text ?? "");
  const pattern = /\[[^[\]]{0,60}\]?/g;
  for (const match of source.matchAll(pattern)) {
    found.push(match[0].replace(/\s+/g, " "));
  }
  return found;
}

/** The address of every link in an email's HTML. */
export function extractLinks(html) {
  const links = [];
  const pattern = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  for (const match of String(html ?? "").matchAll(pattern)) {
    links.push(decodeEntities(match[1] ?? match[2] ?? "").trim());
  }
  return links;
}

function isZoomHost(hostname) {
  return hostname === "zoom.us" || hostname.endsWith(".zoom.us");
}

/**
 * Sort one link into what the report does with it. Only a link to the site
 * itself is ever printed in full; for any other address the host alone is
 * shown, and a Zoom address is not shown at all.
 */
export function classifyLink(href, siteOrigin) {
  if (/\[|%5b/i.test(href)) return { kind: "blank" };
  if (href === "" || href.startsWith("#")) return { kind: "skipped" };
  if (href.includes("*|")) return { kind: "skipped" };
  if (/^(mailto|tel|sms):/i.test(href)) return { kind: "skipped" };
  let url;
  try {
    url = new URL(href);
  } catch {
    return { kind: "unreadable" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { kind: "skipped" };
  }
  if (url.origin === siteOrigin) {
    return { kind: "internal", path: `${url.pathname}${url.search}` };
  }
  if (isZoomHost(url.hostname)) return { kind: "zoom" };
  // The site's own name, but not at the one address the emails must use (no
  // "www", or http): it would be reported as "another site" and never
  // requested, so a mistyped path on it would pass unseen.
  let siteHost = "";
  try {
    siteHost = new URL(siteOrigin).hostname;
  } catch {
    siteHost = "";
  }
  const bare = (host) => host.toLowerCase().replace(/^www\./, "");
  if (siteHost && bare(url.hostname) === bare(siteHost)) {
    return { kind: "wrong-origin" };
  }
  return { kind: "external", host: url.hostname };
}

function normalise(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase();
}

function quoted(name) {
  return JSON.stringify(String(name ?? "").slice(0, 80));
}

function hashOf(email) {
  return crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
}

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new FunnelError(
      `${name} is not set. It is passed in by name from the repository's Actions secrets and variables.`,
    );
  }
  return value;
}

/** Key, data centre and audience exactly as the site reads them. */
function connect() {
  const apiKey = requireEnv("MAILCHIMP_API_KEY");
  const listId = requireEnv("MAILCHIMP_LIST_ID");
  const hyphen = apiKey.lastIndexOf("-");
  const dataCentre = hyphen === -1 ? "" : apiKey.slice(hyphen + 1);
  if (!DATA_CENTRE.test(dataCentre)) {
    throw new FunnelError(
      "MAILCHIMP_API_KEY has no usable data-centre ending, so no Mailchimp host can be chosen.",
    );
  }

  let base = `https://${dataCentre}.api.mailchimp.com/3.0`;
  let testMode = false;
  const override = process.env[TEST_BASE_ENV]?.trim();
  if (override) {
    if (process.env.GITHUB_ACTIONS === "true") {
      throw new FunnelError(
        `${TEST_BASE_ENV} is set on GitHub Actions. It is for a local proof only; refusing to run.`,
      );
    }
    if (!isLoopbackTestBase(override)) {
      throw new FunnelError(
        `${TEST_BASE_ENV} is set but is not a plain ${TEST_BASE_PREFIX}<port> address; refusing to run.`,
      );
    }
    base = `${override.replace(/\/+$/, "")}/3.0`;
    testMode = true;
    note(
      "TEST MODE: talking to a local fake on 127.0.0.1, NOT to Mailchimp. Nothing below is evidence about the real account.",
    );
  }

  return {
    base,
    listId,
    testMode,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };
}

/** The live site's origin. Loopback is accepted only alongside the local fake. */
function readSiteOrigin(mc) {
  const raw = requireEnv("PRODUCTION_URL");
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new FunnelError("PRODUCTION_URL is not a web address.");
  }
  const loopback =
    mc.testMode && url.protocol === "http:" && url.hostname === "127.0.0.1";
  if (
    url.username ||
    url.password ||
    (url.protocol !== "https:" && !loopback)
  ) {
    throw new FunnelError("PRODUCTION_URL must be a plain https address.");
  }
  return url.origin;
}

/* ------------------------------------------------------------------ */
/* Mailchimp requests                                                  */
/* ------------------------------------------------------------------ */

/**
 * One request. Returns the status code and the parsed JSON body (null when
 * there is none). It throws only when no answer arrived at all, and then with
 * the error's NAME: a fetch error's message can quote the address, which
 * contains the audience id.
 */
async function request(mc, route, params = {}, { query, body } = {}) {
  if (!ALLOWED_ROUTES.has(route)) {
    throw new FunnelError("Refused: a call that is not on the script's list.");
  }
  const space = route.indexOf(" ");
  const method = route.slice(0, space);
  if (method !== "GET" && !WRITE_ROUTES.has(route)) {
    throw new FunnelError(`Refused: ${route} is not an allowed write.`);
  }
  if (method === "GET" && body !== undefined) {
    throw new FunnelError(`Refused: ${route} must not carry a body.`);
  }

  const filled = route.slice(space + 1).replace(/\{([a-z_]+)\}/g, (_, key) => {
    const value = key === "list_id" ? mc.listId : params[key];
    if (value === undefined || value === null || String(value) === "") {
      throw new FunnelError(`Refused: ${route} was called without {${key}}.`);
    }
    return encodeURIComponent(String(value));
  });
  const search = query ? `?${new URLSearchParams(query)}` : "";

  let response;
  try {
    response = await fetch(`${mc.base}${filled}${search}`, {
      method,
      headers: mc.headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const name = err instanceof Error ? err.name : "unknown";
    throw new FunnelError(`${route} got no answer (${name}).`);
  }

  let parsed = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }
  return { status: response.status, body: parsed };
}

function isSuccess(status) {
  return status >= 200 && status < 300;
}

/** A request that must succeed. On anything else: the route and the code, nothing more. */
async function call(mc, route, params, options) {
  const answer = await request(mc, route, params, options);
  if (!isSuccess(answer.status)) {
    throw new FunnelError(`${route} answered HTTP ${answer.status}.`);
  }
  return answer.body;
}

/** Every page of a list call: `count` and `offset` until `total_items` is reached. */
async function listAll(mc, route, params, query, key) {
  const items = [];
  let offset = 0;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const body = await call(mc, route, params, {
      query: { ...query, count: String(PAGE_SIZE), offset: String(offset) },
    });
    const batch = Array.isArray(body?.[key]) ? body[key] : [];
    items.push(...batch);
    offset += batch.length;
    const total = Number(body?.total_items);
    if (batch.length === 0) break;
    if (
      Number.isFinite(total) ? items.length >= total : batch.length < PAGE_SIZE
    )
      break;
  }
  return items;
}

async function listSegments(mc, type) {
  const items = await listAll(
    mc,
    API.listSegments,
    {},
    {
      type,
      fields:
        "segments.id,segments.name,segments.type,segments.member_count,segments.options,total_items",
    },
    "segments",
  );
  // The `type` filter is asked for AND checked: a tag and a saved segment may share a name.
  return items.filter((item) => item?.type === type);
}

async function listSegmentMembers(mc, segmentId, { everyStatus }) {
  const query = {
    fields: "members.email_address,members.status,total_items",
  };
  if (everyStatus) {
    query.include_cleaned = "true";
    query.include_transactional = "true";
    query.include_unsubscribed = "true";
  }
  const items = await listAll(
    mc,
    API.segmentMembers,
    { segment_id: segmentId },
    query,
    "members",
  );
  return items.filter((item) => typeof item?.email_address === "string");
}

async function listCampaigns(mc) {
  const items = await listAll(
    mc,
    API.listCampaigns,
    {},
    {
      list_id: mc.listId,
      fields:
        "campaigns.id,campaigns.status,campaigns.send_time,campaigns.settings.title,campaigns.settings.subject_line,campaigns.settings.preview_text,campaigns.recipients.list_id,campaigns.recipients.segment_opts,total_items",
    },
    "campaigns",
  );
  return items.map((item) => ({
    id: item?.id,
    status: String(item?.status ?? ""),
    sendTime: item?.send_time ? new Date(item.send_time) : null,
    title: String(item?.settings?.title ?? ""),
    subject: String(item?.settings?.subject_line ?? ""),
    preview: String(item?.settings?.preview_text ?? ""),
    sameAudience: item?.recipients?.list_id === mc.listId,
    savedSegmentId: item?.recipients?.segment_opts?.saved_segment_id ?? null,
  }));
}

/* ------------------------------------------------------------------ */
/* Contact writes — test addresses only                                */
/* ------------------------------------------------------------------ */

function assertTestAddress(email) {
  if (!isTestAddress(email)) {
    throw new FunnelError(
      "Refused: this script only ever writes to an owner test address (…+ur-test-…@… or …+ur-e2e-…@…).",
    );
  }
}

/** Create the contact as subscribed, or leave an existing one as it is. Never throws on a refusal. */
async function upsertTestMember(mc, email, { setSubscribed = false } = {}) {
  assertTestAddress(email);
  const answer = await request(
    mc,
    API.upsertMember,
    { subscriber_hash: hashOf(email) },
    {
      body: {
        email_address: email,
        status_if_new: "subscribed",
        ...(setSubscribed ? { status: "subscribed" } : {}),
      },
    },
  );
  const status =
    typeof answer.body?.status === "string" ? answer.body.status : null;
  return {
    http: answer.status,
    status: isSuccess(answer.status) ? status : null,
  };
}

/** `is_syncing: true` tells Mailchimp not to start any flow from these tags. */
async function tagTestMember(mc, email, tagNames) {
  assertTestAddress(email);
  const answer = await request(
    mc,
    API.tagMember,
    { subscriber_hash: hashOf(email) },
    {
      body: {
        tags: tagNames.map((name) => ({ name, status: "active" })),
        is_syncing: true,
      },
    },
  );
  return answer.status;
}

async function readMember(mc, email) {
  const answer = await request(
    mc,
    API.readMember,
    { subscriber_hash: hashOf(email) },
    { query: { fields: "status,tags" } },
  );
  if (!isSuccess(answer.status))
    return { http: answer.status, status: null, tags: [] };
  const tags = Array.isArray(answer.body?.tags)
    ? answer.body.tags.map((tag) => String(tag?.name ?? "")).filter(Boolean)
    : [];
  return { http: answer.status, status: answer.body?.status ?? null, tags };
}

/**
 * Archive one test contact. "gone" means it is archived or was never there;
 * anything else is reported by status code.
 */
async function archiveTestMember(mc, email) {
  assertTestAddress(email);
  const answer = await request(mc, API.archiveMember, {
    subscriber_hash: hashOf(email),
  });
  if (isSuccess(answer.status)) return { gone: true, how: "archived" };
  if (answer.status === 404) return { gone: true, how: "was not there" };
  const look = await readMember(mc, email);
  if (look.http === 404) return { gone: true, how: "was not there" };
  if (look.status === "archived")
    return { gone: true, how: "already archived" };
  return { gone: false, http: answer.status };
}

/* ------------------------------------------------------------------ */
/* Tags and segments                                                   */
/* ------------------------------------------------------------------ */

function nearMisses(items, name) {
  return items.filter(
    (item) => item.name !== name && normalise(item.name) === normalise(name),
  );
}

/** Find the four tags; in `create` mode make the missing ones (empty). */
async function resolveTags(mc, { create }) {
  heading("Tags");
  const existing = await listSegments(mc, "static");
  const ids = {};
  for (const [key, name] of Object.entries(FUNNEL.tags)) {
    const exact = existing.filter((item) => item.name === name);
    for (const near of nearMisses(existing, name)) {
      note(
        `Possible typo: a tag named ${quoted(near.name)} exists beside "${name}".`,
      );
    }
    if (exact.length > 0) {
      ids[key] = exact[0].id;
      pass(`Tag "${name}" exists.`);
      continue;
    }
    if (!create) {
      ids[key] = null;
      fail(`Tag "${name}" is missing. Run the "setup" mode.`);
      continue;
    }
    const made = await call(
      mc,
      API.createSegment,
      {},
      { body: { name, static_segment: [] } },
    );
    ids[key] = made?.id ?? null;
    if (ids[key] === null) {
      fail(`Tag "${name}" was created but Mailchimp returned no id for it.`);
    } else if (key === "premium") {
      pass(
        `Tag "${name}" did not exist, so it was created EMPTY. No contact was given it.`,
      );
    } else {
      pass(`Tag "${name}" created (empty).`);
    }
  }
  return ids;
}

function describeDefinition(definition) {
  return [
    ...definition.is.map((key) => `has the tag ${FUNNEL.tags[key]}`),
    ...definition.not.map((key) => `does not have the tag ${FUNNEL.tags[key]}`),
  ].join("; ");
}

function expectedConditions(definition, tagIds) {
  const condition = (op) => (key) => ({
    condition_type: "StaticSegment",
    field: "static_segment",
    op,
    value: tagIds[key],
  });
  return [
    ...definition.is.map(condition("static_is")),
    ...definition.not.map(condition("static_not")),
  ];
}

/** What is wrong with a segment's definition, as plain sentences; empty when it is right. */
function definitionProblems(segment, definition, tagIds) {
  const problems = [];
  const expected = expectedConditions(definition, tagIds);
  const actual = Array.isArray(segment?.options?.conditions)
    ? segment.options.conditions
    : [];
  if (expected.length > 1 && segment?.options?.match !== "all") {
    problems.push(
      'it must match ALL of its conditions, and it is not set to "all"',
    );
  }
  for (const want of expected) {
    const present = actual.some(
      (have) =>
        have?.condition_type === want.condition_type &&
        have?.field === want.field &&
        have?.op === want.op &&
        Number(have?.value) === Number(want.value),
    );
    if (!present) {
      const tagKey = Object.keys(tagIds).find(
        (key) => tagIds[key] === want.value,
      );
      const words =
        want.op === "static_is" ? "has the tag" : "does not have the tag";
      problems.push(
        `the condition "${words} ${FUNNEL.tags[tagKey]}" is missing`,
      );
    }
  }
  if (actual.length > expected.length) {
    problems.push(
      `it has ${actual.length - expected.length} condition(s) this script did not put there`,
    );
  }
  return problems;
}

/**
 * Find the three saved segments and verify each definition; in `create` mode
 * make the missing ones. An existing segment is never edited: an email may
 * already be scheduled to it.
 */
async function resolveSegments(mc, tagIds, { create }) {
  heading("Saved segments");
  const existing = await listSegments(mc, "saved");
  const found = {};
  for (const definition of FUNNEL.segments) {
    const { key, name } = definition;
    found[key] = null;
    const needed = [...definition.is, ...definition.not];
    if (
      needed.some(
        (tagKey) => tagIds[tagKey] === null || tagIds[tagKey] === undefined,
      )
    ) {
      fail(
        `Segment "${name}" cannot be checked: a tag it depends on is missing.`,
      );
      continue;
    }
    for (const near of nearMisses(existing, name)) {
      note(
        `Possible typo: a segment named ${quoted(near.name)} exists beside "${name}".`,
      );
    }
    const exact = existing.filter((item) => item.name === name);
    if (exact.length > 1) {
      fail(
        `More than one segment is named "${name}". Delete the extra one in Mailchimp.`,
      );
      continue;
    }

    let segment = exact[0] ?? null;
    if (!segment) {
      if (!create) {
        fail(`Segment "${name}" is missing. Run the "setup" mode.`);
        continue;
      }
      const made = await call(
        mc,
        API.createSegment,
        {},
        {
          body: {
            name,
            options: {
              match: "all",
              conditions: expectedConditions(definition, tagIds),
            },
          },
        },
      );
      if (made?.id === undefined || made?.id === null) {
        fail(
          `Segment "${name}" was created but Mailchimp returned no id for it.`,
        );
        continue;
      }
      // Read it back: the definition that counts is the one Mailchimp stored.
      segment = await call(mc, API.readSegment, { segment_id: made.id });
      fact(`Segment "${name}" did not exist and was created.`);
    }

    const problems = definitionProblems(segment, definition, tagIds);
    if (problems.length > 0) {
      fail(
        `Segment "${name}" is not defined as it should be: ${problems.join("; ")}. The script never edits an existing segment; ask the developer.`,
      );
      found[key] = { id: segment.id, ok: false };
      continue;
    }
    pass(`Segment "${name}": ${describeDefinition(definition)}.`);
    found[key] = { id: segment.id, ok: true };
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* Mode: setup                                                         */
/* ------------------------------------------------------------------ */

async function setup() {
  const mc = connect();
  say("SETUP: tags and saved segments. Safe to run again; nothing is edited.");
  const tagIds = await resolveTags(mc, { create: true });
  await resolveSegments(mc, tagIds, { create: true });
}

/* ------------------------------------------------------------------ */
/* Mode: drafts                                                        */
/* ------------------------------------------------------------------ */

/** The audience's own default sender ("Mailchimp default"). Never printed. */
async function readDefaultSender(mc) {
  const answer = await request(
    mc,
    API.audience,
    {},
    {
      query: {
        fields: "campaign_defaults.from_name,campaign_defaults.from_email",
      },
    },
  );
  if (!isSuccess(answer.status)) return {};
  const fromName = answer.body?.campaign_defaults?.from_name;
  const replyTo = answer.body?.campaign_defaults?.from_email;
  return {
    ...(typeof fromName === "string" && fromName
      ? { from_name: fromName }
      : {}),
    ...(typeof replyTo === "string" && replyTo ? { reply_to: replyTo } : {}),
  };
}

/**
 * Create ONE empty draft. The body of the request is built here from the
 * constants and nothing else: a name, an audience and segment, a subject and
 * a preview text, and the audience's default sender. No email body, no send
 * time. If Mailchimp refuses the request (400) with the sender in it, the
 * draft is asked for once more without one, and the owner sets it by hand.
 */
async function createDraft(mc, campaign, segmentId, sender) {
  if (!FUNNEL.campaigns.includes(campaign)) {
    throw new FunnelError("Refused: not one of the seven named drafts.");
  }
  const body = (withSender) => ({
    type: "regular",
    recipients: {
      list_id: mc.listId,
      segment_opts: { saved_segment_id: Number(segmentId) },
    },
    settings: {
      title: campaign.name,
      subject_line: campaign.subject,
      preview_text: campaign.preview,
      ...(withSender ? sender : {}),
    },
  });
  const hasSender = Object.keys(sender).length > 0;
  let answer = await request(
    mc,
    API.createCampaign,
    {},
    { body: body(hasSender) },
  );
  let withoutSender = !hasSender;
  if (answer.status === 400 && hasSender) {
    answer = await request(mc, API.createCampaign, {}, { body: body(false) });
    withoutSender = true;
  }
  if (!isSuccess(answer.status)) {
    throw new FunnelError(
      `${API.createCampaign} answered HTTP ${answer.status}.`,
    );
  }
  return { id: answer.body?.id ?? null, withoutSender };
}

async function drafts() {
  const mc = connect();
  say(
    "DRAFTS: the seven empty email drafts. Safe to run again; an existing draft is never changed.",
  );
  const tagIds = await resolveTags(mc, { create: false });
  const segments = await resolveSegments(mc, tagIds, { create: false });

  heading("Drafts");
  const campaigns = await listCampaigns(mc);
  let sender = null;
  let senderMissing = false;
  for (const campaign of FUNNEL.campaigns) {
    const segmentName = segmentByKey(campaign.segment).name;
    const exact = campaigns.filter((item) => item.title === campaign.name);
    if (exact.length > 1) {
      fail(
        `More than one email is named "${campaign.name}". Delete the extra one in Mailchimp.`,
      );
      continue;
    }
    if (exact.length === 1) {
      pass(`Draft "${campaign.name}" already exists; left as it is.`);
      continue;
    }
    const segment = segments[campaign.segment];
    if (!segment?.ok) {
      fail(
        `Draft "${campaign.name}" was NOT created: its segment "${segmentName}" is missing or wrong. Run the "setup" mode first.`,
      );
      continue;
    }
    sender ??= await readDefaultSender(mc);
    const made = await createDraft(mc, campaign, segment.id, sender);
    if (made.id === null) {
      fail(
        `Draft "${campaign.name}" was created but Mailchimp returned no id for it.`,
      );
      continue;
    }
    if (made.withoutSender || !(sender.from_name && sender.reply_to)) {
      senderMissing = true;
    }
    pass(
      `Draft "${campaign.name}" created: goes to "${segmentName}"; empty; not scheduled.`,
    );
  }
  if (senderMissing) {
    note(
      "At least one new draft has no From name or reply-to address: the audience's default could not be used. Set them in that draft's From section in Mailchimp.",
    );
  }
}

function segmentByKey(key) {
  return FUNNEL.segments.find((segment) => segment.key === key);
}

/* ------------------------------------------------------------------ */
/* Mode: selftest                                                      */
/* ------------------------------------------------------------------ */

/** <owner>+ur-test-conv1-<run id>-<attempt>-<letter>@…, one per contact. */
function selftestAddresses() {
  const owner = requireEnv("E2E_OWNER_MAILBOX");
  const parts = /^([^@+\s]+)@([^@\s]+)$/.exec(owner);
  if (!parts) {
    throw new FunnelError(
      "E2E_OWNER_MAILBOX must be a plain mailbox address with no plus-tag.",
    );
  }
  const runId = requireEnv("GITHUB_RUN_ID");
  const attempt = requireEnv("GITHUB_RUN_ATTEMPT");
  if (!/^\d+$/.test(runId))
    throw new FunnelError("GITHUB_RUN_ID is not a number.");
  if (!/^\d+$/.test(attempt)) {
    throw new FunnelError("GITHUB_RUN_ATTEMPT is not a number.");
  }
  const letters = [
    ...FUNNEL.selftest.contacts.map((contact) => contact.letter),
    FUNNEL.selftest.archivedContact,
  ];
  const addresses = {};
  for (const letter of letters) {
    const address = `${parts[1]}+ur-test-${FUNNEL.campaignId}-${runId}-${attempt}-${letter}@${parts[2]}`;
    assertTestAddress(address);
    addresses[letter] = address;
  }
  return addresses;
}

async function selftest() {
  const mc = connect();
  const addresses = selftestAddresses();
  say(
    "SELF-TEST: five throw-away contacts on the owner's own plus-addresses prove the three segments, then all five are archived.",
  );
  const tagIds = await resolveTags(mc, { create: false });
  const segments = await resolveSegments(mc, tagIds, { create: false });
  if (FUNNEL.segments.some((definition) => !segments[definition.key]?.ok)) {
    fail('The self-test did not start: run the "setup" mode first.');
    return;
  }

  let interrupted = false;
  const onSignal = () => {
    interrupted = true;
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  const pause = async (ms) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    if (interrupted) throw new FunnelError("The run was cancelled.");
  };

  try {
    heading("Test contacts");
    for (const contact of FUNNEL.selftest.contacts) {
      const address = addresses[contact.letter];
      const tagNames = contact.tags.map((key) => FUNNEL.tags[key]);
      const made = await upsertTestMember(mc, address);
      if (!isSuccess(made.http)) {
        throw new FunnelError(
          `${API.upsertMember} answered HTTP ${made.http} for contact ${contact.letter}.`,
        );
      }
      const tagged = await tagTestMember(mc, address, tagNames);
      if (!isSuccess(tagged)) {
        throw new FunnelError(
          `${API.tagMember} answered HTTP ${tagged} for contact ${contact.letter}.`,
        );
      }
      fact(
        `${contact.letter}  ${maskAddress(address)}  status ${made.status ?? "unknown"}  tags: ${tagNames.join(", ")}  (no flow started)`,
      );
    }

    heading("Segment membership");
    const letterOf = new Map(
      FUNNEL.selftest.contacts.map((contact) => [
        addresses[contact.letter].toLowerCase(),
        contact.letter,
      ]),
    );
    const interval = mc.testMode ? POLL_INTERVAL_TEST_MS : POLL_INTERVAL_MS;
    const observed = {};
    for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt += 1) {
      let settled = true;
      for (const definition of FUNNEL.segments) {
        const members = await listSegmentMembers(
          mc,
          segments[definition.key].id,
          {
            everyStatus: false,
          },
        );
        observed[definition.key] = members
          .map((member) => letterOf.get(member.email_address.toLowerCase()))
          .filter(Boolean)
          .sort();
        const wanted = FUNNEL.selftest.expect[definition.key];
        if (observed[definition.key].join() !== [...wanted].sort().join()) {
          settled = false;
        }
      }
      if (settled) break;
      if (attempt < POLL_ATTEMPTS) {
        fact(
          `Mailchimp has not caught up yet (look ${attempt} of ${POLL_ATTEMPTS}); waiting.`,
        );
        await pause(interval);
      }
    }
    for (const definition of FUNNEL.segments) {
      const wanted = [...FUNNEL.selftest.expect[definition.key]].sort();
      const got = observed[definition.key] ?? [];
      if (got.join() === wanted.join()) {
        pass(`"${definition.name}" holds exactly: ${wanted.join(", ")}.`);
      } else {
        fail(
          `"${definition.name}" should hold exactly ${wanted.join(", ")} and holds ${got.join(", ") || "none of the four"}.`,
        );
      }
    }

    heading("An archived contact who signs up again (a record, not a test)");
    const again = addresses[FUNNEL.selftest.archivedContact];
    const registered = [FUNNEL.tags.registered];
    const first = await upsertTestMember(mc, again);
    fact(`1. created: HTTP ${first.http}, status ${first.status ?? "none"}`);
    fact(
      `   tag added (no flow): HTTP ${await tagTestMember(mc, again, registered)}`,
    );
    const archived = await archiveTestMember(mc, again);
    const afterArchive = await readMember(mc, again);
    fact(
      `2. archive request: ${archived.gone ? archived.how : `HTTP ${archived.http}`}; Mailchimp now reports status ${afterArchive.status ?? `none (HTTP ${afterArchive.http})`}`,
    );
    const second = await upsertTestMember(mc, again);
    fact(
      `3. signed up again, the site's first call (status only if new): HTTP ${second.http}, status ${second.status ?? "none"}`,
    );
    if (second.status === "archived") {
      const third = await upsertTestMember(mc, again, { setSubscribed: true });
      fact(
        `4. the site's second call (set to subscribed): HTTP ${third.http}, status ${third.status ?? "none"}`,
      );
    }
    fact(
      `   tag added again (no flow): HTTP ${await tagTestMember(mc, again, registered)}`,
    );
  } finally {
    heading("Tidy up");
    let left = 0;
    for (const [letter, address] of Object.entries(addresses)) {
      try {
        const result = await archiveTestMember(mc, address);
        if (result.gone) {
          fact(`${letter}  ${maskAddress(address)}  ${result.how}`);
        } else {
          left += 1;
          fact(
            `${letter}  ${maskAddress(address)}  NOT archived (HTTP ${result.http})`,
          );
        }
      } catch {
        left += 1;
        fact(`${letter}  ${maskAddress(address)}  NOT archived (no answer)`);
      }
    }
    if (left === 0) {
      pass("Every test contact of this run is archived.");
    } else {
      fail(
        `${left} test contact(s) could NOT be archived. Run the "cleanup" mode and tell the developer.`,
      );
    }
    process.removeListener("SIGINT", onSignal);
    process.removeListener("SIGTERM", onSignal);
  }
}

/* ------------------------------------------------------------------ */
/* The live site                                                       */
/* ------------------------------------------------------------------ */

async function siteGet(url) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return { status: response.status, response };
  } catch {
    return { status: null, response: null };
  }
}

function attribute(html, name) {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(html);
  return match ? match[1] : null;
}

function parseInstant(value) {
  if (!value) return null;
  const instant = new Date(value);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/**
 * Read the funnel's state from the live page's own markers. A 404 means the
 * funnel is switched off there ("dormant").
 */
async function readLivePage(origin) {
  const { status, response } = await siteGet(`${origin}${FUNNEL.paths.page}`);
  if (status === 404) return { kind: "dormant" };
  if (status !== 200) return { kind: "unreadable", status };
  const html = await response.text();
  const startsAt = parseInstant(attribute(html, "data-conv-starts-at"));
  if (!startsAt) return { kind: "unreadable", status };
  const state = attribute(html, "data-conv-state") ?? "";
  return {
    kind: "live",
    state: /^[a-z-]{1,40}$/.test(state) ? state : "unknown",
    startsAt,
    offerEndsAt: parseInstant(attribute(html, "data-conv-offer-ends-at")),
  };
}

/** True when the join address forwards (307) to a Zoom host. The address is never printed. */
async function joinForwardsToZoom(origin) {
  const { status, response } = await siteGet(`${origin}${FUNNEL.paths.join}`);
  if (status !== 307) return { ok: false, status };
  try {
    const target = new URL(response.headers.get("location") ?? "");
    return {
      ok: target.protocol === "https:" && isZoomHost(target.hostname),
      status,
    };
  } catch {
    return { ok: false, status };
  }
}

/* ------------------------------------------------------------------ */
/* Modes: check and launch-check                                       */
/* ------------------------------------------------------------------ */

const STATUS_WORDS = {
  save: "draft, not scheduled",
  paused: "paused",
  schedule: "scheduled",
  sending: "sending now",
  sent: "sent",
  canceled: "cancelled",
  canceling: "being cancelled",
  archived: "archived",
};

/** A campaign counts as scheduled when it is scheduled, going out, or already out. */
const SCHEDULED_STATUSES = ["schedule", "sending", "sent"];

function reportBlanks(where, blanks, strict) {
  if (blanks.length === 0) {
    if (strict) pass(`${where}: no "[" left.`);
    else fact(`${where}: no "[" left.`);
    return;
  }
  const line = `${where}: ${blanks.length} blank(s) still to replace: ${blanks.join(" ")}`;
  if (strict) fail(line);
  else fact(line);
}

async function inspectDraft(
  mc,
  campaign,
  found,
  segments,
  site,
  strict,
  linkChecks,
) {
  const segmentName = segmentByKey(campaign.segment).name;
  const expected = segments[campaign.segment];
  const status = STATUS_WORDS[found.status] ?? "in an unknown state";

  const onSegment =
    found.sameAudience &&
    expected?.id !== undefined &&
    found.savedSegmentId !== null &&
    Number(found.savedSegmentId) === Number(expected.id);
  if (onSegment) {
    pass(`"${campaign.name}" exists (${status}) and goes to "${segmentName}".`);
  } else {
    fail(
      `"${campaign.name}" exists (${status}) but does NOT go to "${segmentName}". Open it in Mailchimp and choose that segment in the To section.`,
    );
  }

  reportBlanks("  subject", findBlanks(found.subject), strict);
  reportBlanks("  preview text", findBlanks(found.preview), strict);

  const content = await request(
    mc,
    API.readCampaignBody,
    { campaign_id: found.id },
    {
      query: { fields: "html,plain_text" },
    },
  );
  if (!isSuccess(content.status)) {
    const line = `  body: could not be read (HTTP ${content.status}).`;
    if (strict) fail(line);
    else fact(line);
    return;
  }
  const html = typeof content.body?.html === "string" ? content.body.html : "";
  const plain =
    typeof content.body?.plain_text === "string" ? content.body.plain_text : "";
  const text = html ? visibleText(html) : plain.trim();
  if (!text) {
    fact("  body: empty. Nothing has been pasted in yet.");
    return;
  }
  reportBlanks("  body", findBlanks(text), strict);

  const links = [...new Set(extractLinks(html))];
  let skipped = 0;
  for (const href of links) {
    const link = classifyLink(href, site.origin);
    if (link.kind === "skipped") {
      skipped += 1;
    } else if (link.kind === "blank") {
      const line =
        "  link: an address still has a blank (a square bracket) in it.";
      if (strict) fail(line);
      else fact(line);
    } else if (link.kind === "unreadable") {
      fact("  link: an address that is not a web address.");
    } else if (link.kind === "zoom") {
      const line = `"${campaign.name}" links straight to a Zoom address. Emails must link to ${site.origin}${FUNNEL.paths.join} instead.`;
      if (strict) fail(line);
      else note(line);
    } else if (link.kind === "wrong-origin") {
      const line = `"${campaign.name}" has a link to this site that does not start with ${site.origin}. Emails must use that exact start.`;
      if (strict) fail(line);
      else note(line);
    } else if (link.kind === "external") {
      fact(`  link: another site (${link.host})`);
    } else {
      fact(`  link: ${site.origin}${link.path}`);
      linkChecks.add(link.path);
    }
  }
  if (links.length === 0) fact("  links: none.");
  if (skipped > 0) fact(`  links skipped (merge tags, mailto): ${skipped}`);
}

function reportSendTimes(found, site, accountZone, strict) {
  heading("Send times");
  const plan = computeSendTimes(site.startsAt, site.offerEndsAt);
  const sessionEnd = new Date(
    site.startsAt.getTime() + FUNNEL.sessionMinutes * 60000,
  );
  const local = (instant) =>
    `${formatAtOffset(instant, FUNNEL.utcOffsetMinutes)} ${FUNNEL.zoneLabel}`;
  fact(`Webinar starts: ${local(site.startsAt)} (UTC${FUNNEL.utcOffset}).`);
  fact(
    site.offerEndsAt
      ? `Offer ends:     ${local(site.offerEndsAt)}.`
      : "Offer ends:     not set on the live page.",
  );
  fact(
    accountZone
      ? `The Mailchimp account's time zone: ${accountZone}.`
      : "Mailchimp did not say which time zone the account uses; go by the UTC line.",
  );

  for (const campaign of FUNNEL.campaigns) {
    const planned = plan.get(campaign.name);
    const item = found.get(campaign.name);
    say("");
    fact(`${campaign.name} — ${campaign.send.rule}`);
    if (planned) {
      const zoned = accountZone ? formatInZone(planned, accountZone) : null;
      fact(`  planned:   ${local(planned)}`);
      fact(`             ${formatAtOffset(planned, 0)} UTC`);
      if (zoned) fact(`             ${zoned} (${accountZone})`);
    } else {
      fact("  planned:   cannot be worked out; the offer end is not set.");
    }

    const scheduled = item && SCHEDULED_STATUSES.includes(item.status);
    if (!scheduled) {
      fact("  scheduled: not yet.");
      continue;
    }
    if (!item.sendTime || Number.isNaN(item.sendTime.getTime())) {
      note(
        `Mailchimp did not return a send time for "${campaign.name}". Check it by eye against the line above.`,
      );
      continue;
    }
    const actual = item.sendTime;
    fact(`  scheduled: ${local(actual)} (${STATUS_WORDS[item.status]})`);
    if (planned && Math.abs(actual.getTime() - planned.getTime()) >= 60000) {
      note(`"${campaign.name}" is not scheduled for the planned time above.`);
    }
    if (!strict) continue;

    const must = campaign.send.must;
    if (must === "exact") {
      const onTime =
        planned && Math.abs(actual.getTime() - planned.getTime()) < 60000;
      if (onTime)
        pass(
          `"${campaign.name}" goes out exactly on its rule (${campaign.send.rule}).`,
        );
      else
        fail(
          `"${campaign.name}" must go out exactly on its rule (${campaign.send.rule}).`,
        );
    } else if (must === "before-start") {
      if (actual < site.startsAt)
        pass(`"${campaign.name}" goes out before the webinar starts.`);
      else fail(`"${campaign.name}" must go out BEFORE the webinar starts.`);
    } else if (must === "after-session") {
      if (actual > sessionEnd)
        pass(`"${campaign.name}" goes out after the session ends.`);
      else fail(`"${campaign.name}" must go out AFTER the session ends.`);
    } else if (!site.offerEndsAt) {
      fail(
        `"${campaign.name}" must go out before the offer ends, and the live page has no offer end.`,
      );
    } else if (actual < site.offerEndsAt) {
      pass(`"${campaign.name}" goes out before the offer ends.`);
    } else {
      fail(`"${campaign.name}" must go out BEFORE the offer ends.`);
    }
  }
}

async function check({ strict }) {
  const mc = connect();
  const origin = readSiteOrigin(mc);
  say(
    strict
      ? "LAUNCH CHECK: the read-only report, plus the failures that must stop a go-live."
      : "CHECK: a read-only report. Nothing is changed.",
  );

  const tagIds = await resolveTags(mc, { create: false });
  const segments = await resolveSegments(mc, tagIds, { create: false });

  heading("The live page");
  const page = await readLivePage(origin);
  const site = { origin, ...page };
  if (page.kind === "dormant") {
    if (strict)
      fail(
        `${origin}${FUNNEL.paths.page} answers 404: the funnel is switched off on the live site.`,
      );
    else
      fact(
        `${origin}${FUNNEL.paths.page} answers 404: the funnel is switched off on the live site (expected until go-live).`,
      );
  } else if (page.kind === "unreadable") {
    const line = `${origin}${FUNNEL.paths.page} could not be read (${page.status === null ? "no answer" : `HTTP ${page.status}`}).`;
    if (strict) fail(line);
    else note(line);
  } else {
    pass(`${origin}${FUNNEL.paths.page} is live (state: ${page.state}).`);
  }

  heading("The two flows (built by hand; no script can read them)");
  for (const flow of FUNNEL.flows) {
    fact(
      `${flow.name}: starts when the tag ${FUNNEL.tags[flow.tag]} is added. Check its email's blanks by eye.`,
    );
  }

  heading("The seven emails");
  const campaigns = await listCampaigns(mc);
  const found = new Map();
  const linkChecks = new Set();
  for (const campaign of FUNNEL.campaigns) {
    const exact = campaigns.filter((item) => item.title === campaign.name);
    if (exact.length === 0) {
      fail(`"${campaign.name}" is missing. Run the "drafts" mode.`);
      continue;
    }
    if (exact.length > 1) {
      fail(
        `More than one email is named "${campaign.name}". Delete the extra one in Mailchimp.`,
      );
      continue;
    }
    found.set(campaign.name, exact[0]);
    await inspectDraft(
      mc,
      campaign,
      exact[0],
      segments,
      site,
      strict,
      linkChecks,
    );
  }
  const names = FUNNEL.campaigns.map((campaign) => campaign.name);
  for (const item of campaigns) {
    if (
      normalise(item.title).startsWith(FUNNEL.campaignId) &&
      !names.includes(item.title)
    ) {
      note(
        `Possible typo: an email is named ${quoted(item.title)}, which is not one of the seven.`,
      );
    }
  }
  if (strict) {
    const scheduled = FUNNEL.campaigns.filter((campaign) =>
      SCHEDULED_STATUSES.includes(found.get(campaign.name)?.status),
    ).length;
    if (scheduled === names.length) pass("All seven emails are scheduled.");
    else fail(`Only ${scheduled} of the seven emails are scheduled.`);
  }

  await reportTestContacts(mc, tagIds, segments);

  if (page.kind === "live") {
    const account = await request(
      mc,
      API.account,
      {},
      {
        query: { fields: "account_timezone" },
      },
    );
    const zone = account.body?.account_timezone;
    reportSendTimes(
      found,
      site,
      typeof zone === "string" && zone && formatInZone(new Date(), zone)
        ? zone
        : null,
      strict,
    );
  } else {
    heading("Send times");
    fact("no start configured — table skipped");
  }

  if (strict) {
    heading("Links on the live site");
    for (const linkPath of [...linkChecks].sort()) {
      if (linkPath.split("?")[0] === FUNNEL.paths.join) continue;
      const { status } = await siteGet(`${origin}${linkPath}`);
      if (status === 200) pass(`${origin}${linkPath} answers 200.`);
      else
        fail(
          `${origin}${linkPath} does not answer 200 (${status === null ? "no answer" : `HTTP ${status}`}).`,
        );
    }
    const join = await joinForwardsToZoom(origin);
    if (join.ok) {
      pass(
        `${origin}${FUNNEL.paths.join} forwards (307) to a Zoom address (not shown).`,
      );
    } else {
      fail(
        `${origin}${FUNNEL.paths.join} does not forward (307) to a Zoom address (${join.status === null ? "no answer" : `HTTP ${join.status}`}).`,
      );
    }
  }
}

/** Who is carrying a funnel tag, and who is in each segment. Only test addresses are shown. */
async function reportTestContacts(mc, tagIds, segments) {
  heading("Test contacts and segment members");
  const carriers = await membersCarryingFunnelTags(mc, tagIds);
  const inSegment = {};
  for (const definition of FUNNEL.segments) {
    const segment = segments[definition.key];
    if (!segment) continue;
    const members = await listSegmentMembers(mc, segment.id, {
      everyStatus: false,
    });
    inSegment[definition.key] = new Set(
      members.map((member) => member.email_address.toLowerCase()),
    );
    const real = members.filter(
      (member) => !isTestAddress(member.email_address),
    );
    let who = "Nobody is in it.";
    if (members.length > 0) {
      who =
        real.length === 0
          ? "Every member is a test address."
          : `NOT a test address (real people): ${real.length}.`;
    }
    fact(`"${definition.name}": members ${members.length}. ${who}`);
  }
  const tests = carriers.filter((member) =>
    isTestAddress(member.email_address),
  );
  if (tests.length === 0) {
    fact("No test contact carries a funnel tag.");
    return;
  }
  for (const member of tests) {
    const detail = await readMember(mc, member.email_address);
    const held = FUNNEL.segments
      .filter((definition) =>
        inSegment[definition.key]?.has(member.email_address.toLowerCase()),
      )
      .map((definition) => `"${definition.name}"`);
    fact(
      `${maskAddress(member.email_address)}  status ${detail.status ?? member.status}  tags: ${detail.tags.join(", ") || "none"}  in: ${held.join(", ") || "no segment"}`,
    );
  }
}

/** Every contact, of any status, that carries conv1-registered or conv1-toolkit. */
async function membersCarryingFunnelTags(mc, tagIds) {
  const byAddress = new Map();
  for (const key of FUNNEL.funnelTagKeys) {
    if (tagIds[key] === null || tagIds[key] === undefined) continue;
    const members = await listSegmentMembers(mc, tagIds[key], {
      everyStatus: true,
    });
    for (const member of members) {
      byAddress.set(member.email_address.toLowerCase(), member);
    }
  }
  return [...byAddress.values()];
}

/* ------------------------------------------------------------------ */
/* Mode: cleanup                                                       */
/* ------------------------------------------------------------------ */

async function cleanup() {
  const mc = connect();
  say(
    "CLEANUP: archive (never delete) test contacts that carry a funnel tag. Real contacts are refused.",
  );
  const tagIds = await resolveTags(mc, { create: false });

  heading("Archiving");
  const carriers = await membersCarryingFunnelTags(mc, tagIds);
  let archived = 0;
  let refused = 0;
  let stuck = 0;
  for (const member of carriers) {
    if (!isTestAddress(member.email_address)) {
      // A real person. Counted, never shown, never touched.
      refused += 1;
      continue;
    }
    // archiveTestMember checks the address again before it sends anything.
    const result = await archiveTestMember(mc, member.email_address);
    if (result.gone) {
      archived += 1;
      fact(`${maskAddress(member.email_address)}  ${result.how}`);
    } else {
      stuck += 1;
      fact(
        `${maskAddress(member.email_address)}  NOT archived (HTTP ${result.http})`,
      );
    }
  }
  fact(`Refused (not a test address, left untouched): ${refused}`);
  if (stuck === 0) pass(`Test contacts archived: ${archived}.`);
  else
    fail(`${stuck} test contact(s) could NOT be archived; ${archived} were.`);
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

const MODES = {
  setup,
  drafts,
  selftest,
  check: () => check({ strict: false }),
  "launch-check": () => check({ strict: true }),
  cleanup,
};

export async function main(argv) {
  const mode = argv[0];
  if (!Object.hasOwn(MODES, mode ?? "")) {
    say(
      `Usage: node scripts/webinar-funnel.mjs <${Object.keys(MODES).join(" | ")}>`,
    );
    return 1;
  }
  try {
    await MODES[mode]();
  } catch (err) {
    if (err instanceof FunnelError) {
      fail(err.message);
    } else {
      // Name and line only: an unexpected error's message is not known to be safe to print.
      const line = /webinar-funnel\.mjs:(\d+)/.exec(
        err instanceof Error ? (err.stack ?? "") : "",
      );
      fail(
        `The script stopped unexpectedly (${err instanceof Error ? err.name : "error"}${line ? `, line ${line[1]}` : ""}).`,
      );
    }
  }
  say("");
  if (tally.failed > 0) {
    say(
      `RESULT: FAIL (${mode}). ${tally.failed} failed, ${tally.passed} passed. Read the FAIL lines above.`,
    );
    return 1;
  }
  say(`RESULT: PASS (${mode}). ${tally.passed} passed, 0 failed.`);
  return 0;
}

/** True only when this file is the program being run, not when it is imported. */
function startedDirectly() {
  if (!process.argv[1]) return false;
  try {
    const started = fs.realpathSync(process.argv[1]);
    const self = fs.realpathSync(fileURLToPath(import.meta.url));
    return process.platform === "win32"
      ? started.toLowerCase() === self.toLowerCase()
      : started === self;
  } catch {
    return false;
  }
}

if (startedDirectly()) {
  process.exitCode = await main(process.argv.slice(2));
}
