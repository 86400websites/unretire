"use client";

import { useEffect, useRef, useState } from "react";
import { COPY } from "./copy";
import { SignupForm, type SignupResult } from "./RegisterForm";

/**
 * The Toolkit form on /conversation — Sprint S6.1.
 *
 * The same fields, validation, request and messages as the register form
 * (`SignupForm`, in RegisterForm.tsx); it names the form "toolkit" and the
 * server tags the contact accordingly. What is different is the ending. The
 * Toolkit arrives by email and no other way, so an address that cannot be
 * emailed is not a "done" state at all: the form stays, with what was typed,
 * and asks for a different address.
 */
export default function ToolkitForm() {
  const [done, setDone] = useState<SignupResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (done) headingRef.current?.focus();
  }, [done]);

  if (done) {
    return (
      <div
        className="max-w-2xl mx-auto text-center"
        role="status"
        data-conv-done="toolkit"
      >
        <p className="eyebrow mb-5">{COPY.toolkitSent.eyebrow}</p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight outline-none scroll-mt-44"
        >
          {COPY.toolkitSent.heading}
        </h2>
        <span className="rule mt-6 mb-7 mx-auto" aria-hidden="true" />
        <p className="prose-body max-w-[52ch] mx-auto">
          {COPY.toolkitSent.body}
        </p>
        <p className="font-bold text-xl text-[var(--ur-navy)] leading-snug mt-8 mb-5">
          {COPY.toolkitSent.lead}
        </p>
        <a href="#register" className="btn btn-crimson">
          {COPY.toolkitSent.link}
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      <div className="lg:col-span-5">
        <p className="eyebrow mb-5">{COPY.toolkit.eyebrow}</p>
        <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight">
          {COPY.toolkit.heading}
        </h2>
        <span className="rule mt-6 mb-7" aria-hidden="true" />
        <p className="lede">{COPY.toolkit.blurb}</p>
      </div>
      <div className="lg:col-span-7">
        <SignupForm
          form="toolkit"
          buttonLabel={COPY.toolkit.button}
          notEmailableText={COPY.toolkitSent.notEmailable}
          onDone={setDone}
        />
      </div>
    </div>
  );
}
