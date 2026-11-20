import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import PasswordField from "@/app/PasswordField";
import { formatDisplayParts, getWebinar } from "@/lib/webinar/config";
import {
  isValidSession,
  REPORT_COOKIE,
  reportConfig,
} from "@/lib/webinar/report-auth";
import { readReport, type ReportData } from "@/lib/webinar/report-store";
import {
  fillReport,
  isReportMessageCode,
  REPORT_COPY,
  type ReportMessageCode,
} from "./copy";

/**
 * /report — the owner's webinar report. Sprint S6.2.
 *
 * PRIVATE. One shared password (docs/TECH-ARCHITECTURE.md §5); never linked,
 * never in the sitemap, and search engines are told not to index it. FOUR
 * STATES, on the page root as data-report-state:
 *
 *   off    — REPORT_PASSWORD or REPORT_SECRET is missing or too short. One
 *            line; no form and no number. A missing value closes the page.
 *   locked — no valid session cookie: the password form only.
 *   open   — the three cards, the where-from table and the owner's two boxes.
 *   error  — signed in, but the numbers could not be read.
 *
 * Nothing is read from the database until the session check has passed.
 * Rendered per request: the numbers change all the time and the answer
 * depends on the visitor's cookie.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: REPORT_COPY.meta.title,
  robots: { index: false, follow: false },
};

type State = "off" | "locked" | "open" | "error";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** The shipped form-field pattern (src/app/conversation/RegisterForm.tsx). */
const LABEL =
  "block text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--ur-navy)] mb-2";
const FIELD =
  "w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-[var(--ur-navy)] placeholder:text-[#9A9080] outline-none focus:border-[var(--ur-crimson)] focus:ring-2 focus:ring-[var(--ur-crimson)]/20 transition-colors";
const HINT = "mt-2 text-[13px] text-[var(--ur-muted)] leading-[1.6]";
/** Words, not colour alone: every error is a sentence the reader can read. */
const ERROR = "text-[13px] text-[#8B1A1A] leading-[1.5]";

const NUMBER = new Intl.NumberFormat("en-GB");

/** "Monday 23 November" for a saved "YYYY-MM-DD" day — no time zone shift. */
const DAY = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatDay(isoDay: string): string {
  const parts = new Map<string, string>();
  for (const part of DAY.formatToParts(new Date(`${isoDay}T00:00:00Z`))) {
    parts.set(part.type, part.value);
  }
  return `${parts.get("weekday") ?? ""} ${parts.get("day") ?? ""} ${parts.get("month") ?? ""}`;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function Frame({ state, children }: { state: State; children: ReactNode }) {
  return (
    <section className="bg-white" data-report-state={state}>
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
  pending = false,
}: {
  label: string;
  value: string;
  name: string;
  /** True while the card shows its "not added yet" words instead of a number. */
  pending?: boolean;
}) {
  return (
    <li className="card p-6 sm:p-8" data-report-card={name}>
      <p className="text-[15px] text-[var(--ur-text)]">{label}</p>
      {pending ? (
        <p className="mt-3 text-lg font-bold leading-snug text-[var(--ur-muted)]">
          {value}
        </p>
      ) : (
        <p className="mt-3 text-4xl sm:text-5xl font-bold leading-none text-[var(--ur-crimson)] tabular-nums">
          {value}
        </p>
      )}
    </li>
  );
}

function Open({
  data,
  code,
  saved,
}: {
  data: ReportData;
  code: ReportMessageCode | null;
  saved: boolean;
}) {
  const webinar = getWebinar();
  const webinarLine = webinar.startsAt
    ? fillReport(REPORT_COPY.header.webinar, {
        weekday: formatDisplayParts(webinar.startsAt).weekday,
        date: formatDisplayParts(webinar.startsAt).date,
      })
    : null;
  const countingLine = data.countFrom
    ? fillReport(REPORT_COPY.header.countingFrom, {
        "count from": formatDay(data.countFrom),
      })
    : REPORT_COPY.header.countingFromStart;

  const dateError = code === "date" ? REPORT_COPY.messages.date : null;
  const numberError = code === "number" ? REPORT_COPY.messages.number : null;
  const formError =
    code === "save" || code === "busy" || code === "error"
      ? REPORT_COPY.messages[code]
      : null;

  return (
    <Frame state="open">
      <div className="mt-5 space-y-2">
        {webinarLine && (
          <p className="font-bold text-[var(--ur-navy)]">{webinarLine}</p>
        )}
        <p className="lede">
          {countingLine} {REPORT_COPY.header.howItCounts}
        </p>
      </div>

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
          name="showed-up"
          label={REPORT_COPY.cards.showedUp}
          pending={data.showedUp === null}
          value={
            data.showedUp === null
              ? REPORT_COPY.cards.showedUpEmpty
              : NUMBER.format(data.showedUp)
          }
        />
      </ul>

      <section aria-labelledby="report-where-heading" className="mt-14">
        <h2 id="report-where-heading" className="text-2xl sm:text-3xl mb-5">
          {REPORT_COPY.table.heading}
        </h2>
        <table
          aria-labelledby="report-where-heading"
          className="w-full border-collapse text-left text-[15px]"
        >
          <thead>
            <tr className="border-b border-[var(--ur-border)]">
              <th
                scope="col"
                className="py-3 pr-3 font-bold text-[var(--ur-ink)]"
              >
                {REPORT_COPY.table.source}
              </th>
              <th
                scope="col"
                className="py-3 px-3 font-bold text-[var(--ur-ink)] text-right"
              >
                {REPORT_COPY.table.visits}
              </th>
              <th
                scope="col"
                className="py-3 pl-3 font-bold text-[var(--ur-ink)] text-right"
              >
                {REPORT_COPY.table.registered}
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
                  className="py-3 pr-3 font-normal text-[var(--ur-text)]"
                >
                  {REPORT_COPY.sources[row.source]}
                </th>
                <td className="py-3 px-3 text-right tabular-nums text-[var(--ur-text)]">
                  {NUMBER.format(row.visits)}
                </td>
                <td className="py-3 pl-3 text-right tabular-nums text-[var(--ur-text)]">
                  {NUMBER.format(row.registered)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr data-report-row="total">
              <th
                scope="row"
                className="py-3 pr-3 font-bold text-[var(--ur-ink)]"
              >
                {REPORT_COPY.table.total}
              </th>
              <td className="py-3 px-3 text-right font-bold tabular-nums text-[var(--ur-ink)]">
                {NUMBER.format(data.totals.visits)}
              </td>
              <td className="py-3 pl-3 text-right font-bold tabular-nums text-[var(--ur-ink)]">
                {NUMBER.format(data.totals.registered)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section aria-labelledby="report-inputs-heading" className="mt-14">
        <h2 id="report-inputs-heading" className="text-2xl sm:text-3xl mb-5">
          {REPORT_COPY.inputs.heading}
        </h2>
        <form
          method="post"
          action="/report/save"
          className="card p-7 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl"
        >
          <div>
            <label htmlFor="report-count-from" className={LABEL}>
              {REPORT_COPY.inputs.countFrom}
            </label>
            <input
              id="report-count-from"
              name="countFrom"
              type="date"
              min="2026-01-01"
              max="2100-12-31"
              defaultValue={data.countFrom ?? ""}
              aria-invalid={dateError ? true : undefined}
              aria-describedby={
                dateError
                  ? "report-count-from-hint report-count-from-error"
                  : "report-count-from-hint"
              }
              className={FIELD}
            />
            <p id="report-count-from-hint" className={HINT}>
              {REPORT_COPY.inputs.countFromHint}
            </p>
            {dateError && (
              <p id="report-count-from-error" className={`${ERROR} mt-2`}>
                {dateError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="report-showed-up" className={LABEL}>
              {REPORT_COPY.inputs.showedUp}
            </label>
            <input
              id="report-showed-up"
              name="showedUp"
              type="number"
              inputMode="numeric"
              min={0}
              max={100000}
              step={1}
              defaultValue={data.showedUp ?? ""}
              aria-invalid={numberError ? true : undefined}
              aria-describedby={
                numberError
                  ? "report-showed-up-hint report-showed-up-error"
                  : "report-showed-up-hint"
              }
              className={FIELD}
            />
            <p id="report-showed-up-hint" className={HINT}>
              {REPORT_COPY.inputs.showedUpHint}
            </p>
            {numberError && (
              <p id="report-showed-up-error" className={`${ERROR} mt-2`}>
                {numberError}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 flex flex-col gap-3">
            <button
              type="submit"
              className="btn btn-crimson w-full sm:w-auto sm:self-start"
            >
              {REPORT_COPY.inputs.button}
            </button>
            {saved && (
              <p role="status" className="text-[13px] text-[var(--ur-navy)]">
                {REPORT_COPY.inputs.saved}
              </p>
            )}
            {formError && (
              <p role="alert" className={ERROR}>
                {formError}
              </p>
            )}
          </div>
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
  const raw = first(params.e);
  const code = isReportMessageCode(raw) ? raw : null;

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
    const message =
      code === "wrong" || code === "busy" || code === "error"
        ? REPORT_COPY.messages[code]
        : null;
    return <Locked message={message} />;
  }

  const data = await readReport();
  if (!data) {
    return (
      <Frame state="error">
        <p className="lede mt-6">{REPORT_COPY.messages.loadFailed}</p>
      </Frame>
    );
  }

  return <Open data={data} code={code} saved={first(params.saved) === "1"} />;
}
