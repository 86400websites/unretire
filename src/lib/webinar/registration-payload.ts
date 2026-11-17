/**
 * Validation for POST /api/conversation — Sprint S6.1.
 *
 * A module of its own for the reason src/lib/forms/subscribe-payload.ts is one:
 * the route's only observable output is an HTTP status, and a test that found
 * out what a payload does by sending it would write a real contact into the
 * one LIVE Mailchimp audience (D-22). So the decision is made here, with no
 * imports, and asserted directly in
 * tests/e2e/webinar/registration-payload.spec.ts.
 *
 * TWO THINGS THIS DELIBERATELY DOES DIFFERENTLY from the subscribe validator:
 *
 *   1. There is no `tag` in the payload. The caller says which FORM was
 *      submitted and the server picks the tag from that. A client-supplied tag
 *      lets an anonymous caller apply any tag of the right shape, as
 *      /api/subscribe does today, and here the tags start e-mail flows.
 *
 *   2. A rejection is a CODE, not a sentence. The sentences are approved copy
 *      (docs/content/page-copy/conversation.md, section 10) and live with the
 *      rest of the page's copy; the route maps a code to its sentence. That
 *      keeps wording out of this library, and it means a rejection can never
 *      be built from the caller's input or from an upstream response.
 */

/** RFC-shaped enough to reject junk without rejecting real addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254; // RFC 5321
const MAX_NAME = 100;

export const REGISTRATION_FORMS = ["register", "toolkit"] as const;
export type RegistrationForm = (typeof REGISTRATION_FORMS)[number];

/**
 * The hidden anti-spam field's name in the JSON body and in the form.
 *
 * It must be a name a browser's autofill does not recognise — a field called
 * "website", "company" or "phone" can be filled in for a real visitor by their
 * own browser, and that visitor would then be refused. "topic" names no
 * contact, address or payment detail, and still reads to a form-filling script
 * like a field worth completing. The form sets autocomplete off, tabindex -1
 * and aria-hidden on it as well.
 *
 * A good name is not enough for a TEXT box: on 2026-11-14 a real visitor's
 * browser autofill filled the hidden box anyway (it took the consent line
 * before it, which says "email", for the box's label) and the visitor was
 * refused. So the form renders it as a checkbox, which autofill never
 * touches, and sends "on" when it is ticked and "" when it is not. This
 * validator is unchanged: absent or empty is still the only acceptable value.
 */
export const HONEYPOT_FIELD = "topic";

/**
 *   invalid-request — not an object, an unknown `form`, a filled anti-spam
 *                     field, or a field of the wrong type.
 *   invalid-email   — missing, or not shaped like an address.
 *   email-too-long  — over 254 characters.
 *   name-too-long   — first name over 100 characters.
 */
export type RegistrationErrorCode =
  | "invalid-request"
  | "invalid-email"
  | "email-too-long"
  | "name-too-long";

export type RegistrationRejection = {
  ok: false;
  code: RegistrationErrorCode;
};
export type RegistrationAccepted = {
  ok: true;
  form: RegistrationForm;
  /** Trimmed. */
  email: string;
  /** Trimmed; an empty string when none was given. */
  firstName: string;
};
export type RegistrationValidation =
  | RegistrationAccepted
  | RegistrationRejection;

function reject(code: RegistrationErrorCode): RegistrationRejection {
  return { ok: false, code };
}

/**
 * Validate an anonymous registration and return only what may leave this
 * server: which form, the address, and the first name. Nothing else in the
 * body survives.
 */
export function validateRegistrationPayload(
  body: unknown,
): RegistrationValidation {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return reject("invalid-request");
  }

  const fields = body as Record<string, unknown>;
  const { form, email, firstName } = fields;
  const honeypot = fields[HONEYPOT_FIELD];

  if (
    typeof form !== "string" ||
    !(REGISTRATION_FORMS as readonly string[]).includes(form)
  ) {
    return reject("invalid-request");
  }

  // A filled anti-spam field is a REJECTION like any other invalid payload —
  // the same 400. It is never answered with a pretend success: a caller that
  // is told "you're registered" when nothing happened has been lied to, and a
  // real visitor whose browser extension filled the field would never know.
  // Absent or empty is the only acceptable value.
  if (honeypot !== undefined && honeypot !== "") {
    return reject("invalid-request");
  }

  // SECURITY-CHECKLIST §5: the browser's own check is a convenience for
  // honest users, not a control — nothing stops a script POSTing here.
  if (typeof email !== "string" || !EMAIL.test(email.trim())) {
    return reject("invalid-email");
  }
  if (email.trim().length > MAX_EMAIL) {
    return reject("email-too-long");
  }
  if (firstName !== undefined && typeof firstName !== "string") {
    return reject("invalid-request");
  }
  if (typeof firstName === "string" && firstName.trim().length > MAX_NAME) {
    return reject("name-too-long");
  }

  return {
    ok: true,
    form: form as RegistrationForm,
    email: email.trim(),
    firstName: typeof firstName === "string" ? firstName.trim() : "",
  };
}
