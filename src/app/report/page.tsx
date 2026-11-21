import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import PasswordField from "@/app/PasswordField";
import { COPY } from "@/app/conversation/copy";
import { CAMPAIGN } from "@/lib/webinar/config";
import {
  isValidSession,
  REPORT_COOKIE,
  reportConfig,
} from "@/lib/webinar/report-auth";
import {
  readReport,
  reportDatabaseRef,
  type ReportData,
} from "@/lib/webinar/report-store";
import {
  isLoginMessageCode,
  isResetResultCode,
  REPORT_COPY,
  type ResetResultCode,
} from "./copy";

/**
 * /report — the owner's webinar report. Sprint S6.2, as the owner simplified
 * it at Gate B on 2026-11-20 (PROJECT-STATUS D-65).
 *
 * PRIVATE. One shared password (docs/TECH-ARCHITECTURE.md §5); never linked,
 * never in the sitemap, and search engines are told not to index it. FOUR
 * STATES, on the page root as data-report-state:
 *
 *   off    — REPORT_PASSWORD or REPORT_SECRET is missing or too short. One
 *            line; no form and no number. A missing value closes the page.
 *   locked — no valid session cookie: the password form only.
 *   open   — the webinar's name, three cards (visits, registered,
 *            conversion), the where-from table and "Start again for a new
 *            webinar" (POST /report/reset, which asks for the password again).
 *            Only this state also names the database the numbers come from
 *            (data-report-db, the Supabase project's public name): the spec
 *            that resets the report reads it before it writes anything.
 *   error  — signed in, but the numbers could not be read.
 *
 * Nothing is read from the database until the session check has passed. The
 * counts come from campaign_report (one aggregate call); a conversion is only
 * the ratio of two of those counts. Rendered per request: the numbers change
 * all the time and the answer depends on the visitor's cookie.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: REPORT_COPY.meta.title,
  robots: { index: false, follow: false },
};

type State = "off" | "locked" | "open" | "error";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Words, not colour alone: every error is a sentence the reader can read. */
const ERROR = "text-[13px] text-[#8B1A1A] leading-[1.5]";

const NUMBER = new Intl.NumberFormat("en-GB");
const PERCENT = new Intl.NumberFormat("en-GB", {
  style: "percent",
  maximumFractionDigits: 0,
});

/** Registered as a share of visits, as a whole percentage; "—" with no visits. */
function conversion(registered: number, visits: number): string {
  return visits > 0
    ? PERCENT.format(registered / visits)
    : REPORT_COPY.noConversion;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function Frame({
  state,
  database,
  children,
}: {
  state: State;
  /** The open report only: which database its numbers come from. */
  database?: string | null;
  children: ReactNode;
}) {
  return (
    <section
      className="bg-white"
      data-report-state={state}
      data-report-db={database ?? undefined}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem]">
          {REPORT_COPY.header.title}
        </h1>
        {children}
      </div>
    </section>
  );
}

function Locked({ message }: { message: string | null }) {
  return (
    <Frame state="locked">
      <p className="lede mt-6 mb-8">{REPORT_COPY.login.intro}</p>
      <form
        method="post"
        action="/report/login"
        className="card p-7 sm:p-8 flex flex-col gap-5 max-w-md"
      >
        <PasswordField />
        <button type="submit" className="btn btn-crimson w-full">
          {REPORT_COPY.login.button}
        </button>
        {message && (
          <p role="alert" className={ERROR}>
            {message}
          </p>
        )}
      </form>
    </Frame>
  );
}

function Card({
  label,
  value,
  name,
}: {
  label: string;
  value: string;
  name: string;
}) {
  return (
    <li className="card p-6 sm:p-8" data-report-card={name}>
      <p className="text-[15px] text-[var(--ur-text)]">{label}</p>
      <p className="mt-3 text-4xl sm:text-5xl font-bold leading-none text-[var(--ur-crimson)] tabular-nums">
        {value}
      </p>
    </li>
  );
}

const NUMBER_CELL = "py-3 px-2 text-right tabular-nums text-[var(--ur-text)]";
const TOTAL_CELL =
  "py-3 px-2 text-right font-bold tabular-nums text-[var(--ur-ink)]";
const HEAD_CELL = "py-3 px-2 font-bold text-[var(--ur-ink)] text-right";

function Open({
  data,
  result,
}: {
  data: ReportData;
  result: ResetResultCode | null;
}) {
  const resetMessage =
    result === "wrong"
      ? REPORT_COPY.messages.resetWrong
      : result === "busy"
        ? REPORT_COPY.messages.busy
        : result === "error"
          ? REPORT_COPY.messages.resetFailed
          : result === "stale"
            ? REPORT_COPY.messages.resetStale
            : null;

  return (
    <Frame state="open" database={reportDatabaseRef()}>
      <p className="mt-5 font-bold text-[var(--ur-navy)]">{COPY.hero.title}</p>

      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card
          name="visits"
          label={REPORT_COPY.cards.visits}
          value={NUMBER.format(data.totals.visits)}
        />
        <Card
          name="registered"
          label={REPORT_COPY.cards.registered}
          value={NUMBER.format(data.totals.registered)}
        />
        <Card
          name="conversion"
          label={REPORT_COPY.cards.conversion}
          value={conversion(data.totals.registered, data.totals.visits)}
        />
      </ul>

      <section aria-labelledby="report-where-heading" className="mt-14">
        <h2 id="report-where-heading" className="text-2xl sm:text-3xl mb-5">
          {REPORT_COPY.table.heading}
        </h2>
        <div className="overflow-x-auto">
          <table
            aria-labelledby="report-where-heading"
            className="w-full border-collapse text-left text-[13px] sm:text-[15px]"
          >
            <thead>
              <tr className="border-b border-[var(--ur-border)]">
                <th scope="col" className="py-3 font-bold text-[var(--ur-ink)]">
                  {REPORT_COPY.table.source}
                </th>
                <th scope="col" className={HEAD_CELL}>
                  {REPORT_COPY.table.visits}
                </th>
                <th scope="col" className={HEAD_CELL}>
                  {REPORT_COPY.table.registered}
                </th>
                <th scope="col" className={HEAD_CELL}>
                  {REPORT_COPY.table.conversion}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr
                  key={row.source}
                  data-report-row={row.source}
                  className="border-b border-[var(--ur-border)]"
                >
                  <th
                    scope="row"
                    className="py-3 font-normal text-[var(--ur-text)]"
                  >
                    {REPORT_COPY.sources[row.source]}
                  </th>
                  <td className={NUMBER_CELL}>{NUMBER.format(row.visits)}</td>
                  <td className={NUMBER_CELL}>
                    {NUMBER.format(row.registered)}
                  </td>
                  <td className={NUMBER_CELL}>
                    {conversion(row.registered, row.visits)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr data-report-row="total">
                <th scope="row" className="py-3 font-bold text-[var(--ur-ink)]">
                  {REPORT_COPY.table.total}
                </th>
                <td className={TOTAL_CELL}>
                  {NUMBER.format(data.totals.visits)}
                </td>
                <td className={TOTAL_CELL}>
                  {NUMBER.format(data.totals.registered)}
                </td>
                <td className={TOTAL_CELL}>
                  {conversion(data.totals.registered, data.totals.visits)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section aria-labelledby="report-reset-heading" className="mt-14">
        <h2 id="report-reset-heading" className="text-2xl sm:text-3xl mb-5">
          {REPORT_COPY.reset.heading}
        </h2>
        <div className="space-y-3 mb-6 max-w-2xl">
          <p className="text-[var(--ur-text)]">{REPORT_COPY.reset.intro}</p>
          <p className="text-[var(--ur-muted)]">{REPORT_COPY.reset.keep}</p>
        </div>
        <form
          method="post"
          action="/report/reset"
          className="card p-7 sm:p-8 flex flex-col gap-5 max-w-md"
        >
          {/* The numbers this form deletes are the ones this page shows: the
              campaign and when its counting began go back with the password, and
              the reset is refused if either has changed (Codex review, Finding 1). */}
          <input type="hidden" name="campaign" value={CAMPAIGN.id} />
          <input type="hidden" name="since" value={data.since ?? ""} />
          <PasswordField id="report-reset-password" />
          <button type="submit" className="btn btn-outline w-full">
            {REPORT_COPY.reset.button}
          </button>
          {result === "done" && (
            <p role="status" className="text-[13px] text-[var(--ur-navy)]">
              {REPORT_COPY.reset.done}
            </p>
          )}
          {resetMessage && (
            <p role="alert" className={ERROR}>
              {resetMessage}
            </p>
          )}
        </form>
      </section>
    </Frame>
  );
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const config = reportConfig();
  if (!config) {
    return (
      <Frame state="off">
        <p className="lede mt-6">{REPORT_COPY.messages.off}</p>
      </Frame>
    );
  }

  const jar = await cookies();
  if (!isValidSession(jar.get(REPORT_COOKIE)?.value, config)) {
    const code = first(params.e);
    return (
      <Locked
        message={isLoginMessageCode(code) ? REPORT_COPY.messages[code] : null}
      />
    );
  }

  const data = await readReport();
  if (!data) {
    return (
      <Frame state="error">
        <p className="lede mt-6">{REPORT_COPY.messages.loadFailed}</p>
      </Frame>
    );
  }

  const result = first(params.r);
  return (
    <Open data={data} result={isResetResultCode(result) ? result : null} />
  );
}
