"use client";

import { useState } from "react";

/**
 * Password input with a show/hide eye toggle. Shares the same field/label
 * styling as the other auth forms. Drop-in: it renders its own <label> and
 * <input name=...>, so it works inside the existing <form> submissions.
 */
export default function PasswordField({
  id = "password",
  name = "password",
  label = "Password",
  autoComplete = "current-password",
  required = true,
  minLength,
  placeholder,
}: {
  id?: string;
  name?: string;
  label?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  const field =
    "w-full px-4 py-3 pr-12 rounded-lg border border-[#ECE5DB] bg-white text-[#14110D] text-[15px] focus:outline-none focus:border-[#D05D11]";
  const labelCls = "block text-[13px] font-semibold text-[#4A443B] mb-2";

  return (
    <div>
      <label className={labelCls} htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className={field}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#837A6E] hover:text-[#D05D11] transition-colors"
        >
          {show ? (
            // eye-off
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <path d="M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          ) : (
            // eye
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
