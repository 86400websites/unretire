"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  HONEYPOT_FIELD,
  validateRegistrationPayload,
  type RegistrationForm,
} from "@/lib/webinar/registration-payload";
import { COPY, KNOWN_MESSAGES, REJECTION_COPY } from "./copy";

/**
 * The register form on /conversation, and the form body it shares with the
 * Toolkit form — Sprint S6.1.
 *
 * Both forms post to /api/conversation and differ only in which FORM they
 * name; the server picks the tag from that. So there is one implementation of
 * the fields, the validation, the request and the messages (`SignupForm`,
 * exported for ToolkitForm.tsx), and each form file adds only its own heading
 * and its own "done" state.
 *
 * No Date is formatted here. Every date, time and address arrives from the
 * server as a finished string (see src/lib/webinar/config.ts for why).
 */

export type SignupResult = { emailable: boolean };

/** Visible label above each field — the shipped contact-form pattern. */
const LABEL =
  "block text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--ur-navy)] mb-2";
const FIELD =
  "w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-[var(--ur-navy)] placeholder:text-[#9A9080] outline-none focus:border-[var(--ur-crimson)] focus:ring-2 focus:ring-[var(--ur-crimson)]/20 transition-colors";
/** Words, not colour alone: every error is a sentence the visitor can read. */
const ERROR = "text-[13px] text-[#8B1A1A] leading-[1.5]";

function isAccepted(data: unknown): data is { ok: true; emailable: boolean } {
  if (typeof data !== "object" || data === null) return false;
  const reply = data as Record<string, unknown>;
  return reply.ok === true && typeof reply.emailable === "boolean";
}

/**
 * The server's message, if — and only if — it is one of the approved
 * sentences. Anything else becomes the generic line.
 */
function messageFrom(data: unknown): string {
  if (typeof data === "object" && data !== null) {
    const error = (data as Record<string, unknown>).error;
    if (typeof error === "string" && KNOWN_MESSAGES.has(error)) return error;
  }
  return COPY.errors.noAnswer;
}

type SignupFormProps = {
  form: RegistrationForm;
  buttonLabel: string;
  /**
   * When set, an address that cannot be emailed KEEPS the form on screen and
   * shows this text instead of calling `onDone` — the Toolkit can only be
   * delivered by email, so the useful next step is a different address.
   */
  notEmailableText?: string;
  onDone: (result: SignupResult) => void;
};

export function SignupForm({
  form,
  buttonLabel,
  notEmailableText,
  onDone,
}: SignupFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [sending, setSending] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const ids = {
    form: `conv-${form}-form`,
    firstName: `conv-${form}-first`,
    firstNameError: `conv-${form}-first-error`,
    email: `conv-${form}-email`,
    emailError: `conv-${form}-email-error`,
    formError: `conv-${form}-error`,
    consent: `conv-${form}-consent`,
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    setFirstNameError("");
    setEmailError("");
    setFormError("");

    // The server's own validator, run here first. The browser check is a
    // courtesy — the route runs the same function again — but using the SAME
    // function means the two can never disagree about what an address is.
    const checked = validateRegistrationPayload({ form, firstName, email });
    if (!checked.ok) {
      const message = REJECTION_COPY[checked.code];
      if (checked.code === "name-too-long") {
        setFirstNameError(message);
        firstNameRef.current?.focus();
      } else {
        setEmailError(message);
        emailRef.current?.focus();
      }
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form,
          firstName: checked.firstName,
          email: checked.email,
          [HONEYPOT_FIELD]: trap,
        }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (response.ok && isAccepted(data)) {
        if (!data.emailable && notEmailableText) {
          setFormError(notEmailableText);
        } else {
          onDone({ emailable: data.emailable });
        }
      } else {
        // The fields keep what was typed, so trying again is one click.
        setFormError(messageFrom(data));
      }
    } catch {
      setFormError(COPY.errors.noAnswer);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      id={ids.form}
      onSubmit={onSubmit}
      noValidate
      aria-describedby={ids.consent}
      className="card p-7 sm:p-8 flex flex-col gap-5"
    >
      <div>
        <label htmlFor={ids.firstName} className={LABEL}>
          {COPY.form.firstName}
        </label>
        <input
          ref={firstNameRef}
          id={ids.firstName}
          name="firstName"
          type="text"
          autoComplete="given-name"
          placeholder={COPY.form.firstName}
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          aria-invalid={firstNameError ? true : undefined}
          aria-describedby={firstNameError ? ids.firstNameError : undefined}
          className={FIELD}
        />
        {firstNameError && (
          <p id={ids.firstNameError} className={`${ERROR} mt-2`}>
            {firstNameError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={ids.email} className={LABEL}>
          {COPY.form.email}
        </label>
        <input
          ref={emailRef}
          id={ids.email}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={COPY.form.email}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? ids.emailError : undefined}
          className={FIELD}
        />
        {emailError && (
          <p id={ids.emailError} className={`${ERROR} mt-2`}>
            {emailError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="btn btn-crimson w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending ? COPY.form.sending : buttonLabel}
      </button>

      {formError && (
        <p id={ids.formError} role="alert" className={ERROR}>
          {formError}
        </p>
      )}

      <p
        id={ids.consent}
        className="text-[13px] text-[var(--ur-muted)] leading-[1.6]"
      >
        {COPY.form.consent}
      </p>

      {/*
        Anti-spam field. No label and no visible text; off-screen, out of the
        tab order and hidden from assistive technology, with a name
        (HONEYPOT_FIELD) no browser autofills. A person never reaches it; a
        script that fills every input does, and the server answers that
        request with the same 400 as any other invalid payload.
      */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <input
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={trap}
          onChange={(event) => setTrap(event.target.value)}
        />
      </div>
    </form>
  );
}

function CheckBadge() {
  return (
    <span
      className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ur-tint)] text-[var(--ur-crimson)]"
      aria-hidden="true"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

type RegisterFormProps = {
  /** The line under the heading, already filled with the date and time. */
  detail: string;
  /** The thank-you state's detail line, already filled. */
  eventDetail: string;
  /** Google's event-template address, built on the server. */
  googleCalendarHref: string;
};

export default function RegisterForm({
  detail,
  eventDetail,
  googleCalendarHref,
}: RegisterFormProps) {
  const [done, setDone] = useState<SignupResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The form has just been replaced by different content. Move focus to its
  // heading so a keyboard or screen-reader user lands on the confirmation
  // rather than on nothing. The heading's scroll margin is deep enough that
  // the badge above it clears the sticky header if the browser scrolls to it.
  useEffect(() => {
    if (done) headingRef.current?.focus();
  }, [done]);

  if (done) {
    return (
      <div
        className="max-w-2xl mx-auto text-center"
        role="status"
        data-conv-done="register"
      >
        <CheckBadge />
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight outline-none scroll-mt-44"
        >
          {COPY.thankYou.heading}
        </h2>
        <span className="rule mt-6 mb-7 mx-auto" aria-hidden="true" />
        <p className="font-bold text-xl sm:text-2xl text-[var(--ur-navy)] leading-snug">
          {COPY.thankYou.title}
        </p>
        <p className="lede mt-3">{eventDetail}</p>
        {/*
          The copy file lists the thank-you rows in page order: the links, then
          the "diary" line, then the inbox line. The not-emailable sentence is
          the one exception — it says "the link below", so it sits above them.
        */}
        {!done.emailable && (
          <p className="prose-body max-w-[52ch] mx-auto mt-6">
            {COPY.thankYou.notEmailable}
          </p>
        )}
        {/*
          Plain anchors, not next/link: /conversation/join answers with a
          redirect to another site, which must not be prefetched, and the
          calendar file is a download.
        */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center mt-7">
          <a
            href="/conversation/join"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-crimson"
          >
            {COPY.thankYou.join}
          </a>
          <a href="/conversation/calendar.ics" className="btn btn-outline">
            {COPY.thankYou.calendarFile}
          </a>
          <a
            href={googleCalendarHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            {COPY.thankYou.calendarGoogle}
          </a>
        </div>
        {done.emailable && (
          <>
            <p className="prose-body max-w-[52ch] mx-auto mt-7">
              {COPY.thankYou.saveNow}
            </p>
            <p className="font-bold text-[var(--ur-ink)] mt-3">
              {COPY.thankYou.inbox}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      <div className="lg:col-span-5">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
          {COPY.register.heading}
        </h2>
        <span className="rule mt-6 mb-7" aria-hidden="true" />
        <p className="lede">{detail}</p>
      </div>
      <div className="lg:col-span-7">
        <SignupForm
          form="register"
          buttonLabel={COPY.register.button}
          onDone={setDone}
        />
      </div>
    </div>
  );
}
