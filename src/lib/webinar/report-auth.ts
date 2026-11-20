import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The /report password gate — Sprint S6.2.
 *
 * The site's first page with a password of its own. There is no admin role
 * anywhere in this project, and the owner asked for one shared password his
 * team can use, so this is deliberately small (docs/TECH-ARCHITECTURE.md §5):
 *
 *   - Two server-only values: REPORT_PASSWORD (what people type) and
 *     REPORT_SECRET (40+ random characters, never typed by anyone). Neither is
 *     ever sent to a browser, logged, or put in a response.
 *   - The report is OFF — no form, no number — unless both are set and long
 *     enough. A missing value never opens the page; it closes it (fail closed).
 *   - Signing in sets one cookie, ur_report, holding a token derived from BOTH
 *     values. Nothing is stored on the server: the token is recomputed and
 *     compared on every request. Changing either value signs everyone out.
 *   - Every comparison is constant-time on equal-length digests.
 *
 * Server-only: this module reads process.env and node:crypto. It must never
 * be imported by a client component.
 */

export const REPORT_COOKIE = "ur_report";
export const REPORT_COOKIE_PATH = "/report";
/** 30 days, in seconds. */
export const REPORT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/** Shorter than this and the report stays off. */
export const MIN_PASSWORD_LENGTH = 12;
export const MIN_SECRET_LENGTH = 32;
/** A typed password longer than this is refused before any work. */
export const MAX_PASSWORD_INPUT = 200;

export type ReportConfig = {
  password: string;
  secret: string;
};

/**
 * REPORT_SECRET when it is usable, else null. Counting a sign-up needs only
 * this (it keys the person code); viewing the report needs both values
 * (reportConfig); counting a visit needs neither.
 */
export function reportSecret(): string | null {
  const secret = process.env.REPORT_SECRET ?? "";
  return secret.length >= MIN_SECRET_LENGTH ? secret : null;
}

/**
 * Both values, or null when the report is switched off. Only the variable
 * NAMES are ever logged.
 */
export function reportConfig(): ReportConfig | null {
  const password = process.env.REPORT_PASSWORD ?? "";
  const secret = reportSecret();
  const unusable: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) unusable.push("REPORT_PASSWORD");
  if (secret === null) unusable.push("REPORT_SECRET");
  if (unusable.length > 0 || secret === null) {
    console.error(
      `Webinar report is switched off: ${unusable.join(" and ")} is not set or too short.`,
    );
    return null;
  }
  return { password, secret };
}

function hmac(secret: string, message: string): Buffer {
  return createHmac("sha256", secret).update(message, "utf8").digest();
}

/**
 * Constant-time equality for two strings of any length: both sides are first
 * reduced to equal-length digests under the secret, so neither the content
 * nor the length of the expected value can be learned from the timing.
 */
function sameSecretValue(a: string, b: string, secret: string): boolean {
  return timingSafeEqual(
    hmac(secret, `report-compare:v1:${a}`),
    hmac(secret, `report-compare:v1:${b}`),
  );
}

/** The value of the ur_report cookie for this configuration. */
export function sessionToken(config: ReportConfig): string {
  return hmac(config.secret, `report-session:v1:${config.password}`).toString(
    "base64url",
  );
}

/** True only for the exact token of the current configuration. */
export function isValidSession(
  cookieValue: string | undefined | null,
  config: ReportConfig,
): boolean {
  if (typeof cookieValue !== "string" || cookieValue === "") return false;
  return sameSecretValue(cookieValue, sessionToken(config), config.secret);
}

/** The typed password against REPORT_PASSWORD. */
export function passwordMatches(
  candidate: string,
  config: ReportConfig,
): boolean {
  if (candidate === "" || candidate.length > MAX_PASSWORD_INPUT) return false;
  return sameSecretValue(candidate, config.password, config.secret);
}

/**
 * The Set-Cookie header value for a fresh session. HttpOnly (no script can
 * read it), Secure (https only; browsers also allow it on localhost),
 * SameSite=Lax (not sent with a cross-site form post) and Path=/report (never
 * sent to any other page or route of the site).
 */
export function sessionCookieHeader(token: string): string {
  return [
    `${REPORT_COOKIE}=${token}`,
    `Path=${REPORT_COOKIE_PATH}`,
    `Max-Age=${REPORT_COOKIE_MAX_AGE}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}
