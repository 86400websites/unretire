"use client";

import { useState } from "react";

/**
 * Webinar registration form (single session — no session chooser).
 * Posts to /api/webinar, which upserts into Mailchimp and applies the
 * "webinar" + "webinar-nov4-1900" tags. On failure the inputs keep whatever
 * the person typed so they can simply try again.
 */

// A broad country list, South Africa first (the event's home audience) and
// then alphabetical. The field defaults to South Africa.
const COUNTRIES = [
  "South Africa",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Côte d’Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Guinea",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Rwanda",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Somalia",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Trinidad and Tobago",
  "Tunisia",
  "Türkiye",
  "Turkmenistan",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
  "Other",
];

type Status = "idle" | "loading" | "error";

export default function WebinarForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("South Africa");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");

  // Captured at the moment of success so the confirmation reads cleanly even
  // if the inputs were cleared.
  const [registered, setRegistered] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/webinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          country,
          website, // honeypot — real users leave this empty
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setRegistered({ name: firstName.trim(), email: email.trim() });
        setStatus("idle");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (registered) {
    return (
      <div className="card p-7 sm:p-8 text-center" role="status">
        <span
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF3EE] text-[#D05D11]"
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
        <p className="text-[#232F3F] font-bold text-[1.15rem] mb-3">
          Thank you, {registered.name}. Your seat is reserved.
        </p>
        <p className="prose-body text-[15px] text-[#444444] leading-[1.7]">
          We&apos;ve sent a confirmation to{" "}
          <span className="font-bold text-[#232F3F]">{registered.email}</span>.
          Your joining link will follow closer to the day.
        </p>
      </div>
    );
  }

  const label =
    "block text-[11px] font-bold tracking-[0.1em] uppercase text-[#232F3F] mb-2";
  const field =
    "w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-[#232F3F] placeholder-[#9A9080] outline-none focus:border-[#D05D11] focus:ring-2 focus:ring-[#D05D11]/20 transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-7 sm:p-8 space-y-5"
      noValidate
    >
      {/* Honeypot — hidden from humans, catches bots. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="wb-website">Leave this field empty</label>
        <input
          id="wb-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="wb-first" className={label}>
            First name
          </label>
          <input
            id="wb-first"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="wb-last" className={label}>
            Last name
          </label>
          <input
            id="wb-last"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="wb-email" className={label}>
          Email address
        </label>
        <input
          id="wb-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
        <p className="text-[12px] text-[#9A9080] mt-2 leading-[1.5]">
          This is where we&apos;ll send your confirmation and joining link.
        </p>
      </div>

      <div>
        <label htmlFor="wb-country" className={label}>
          Country
        </label>
        <select
          id="wb-country"
          name="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={field}
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn btn-crimson w-full"
      >
        {status === "loading" ? "Reserving your seat…" : "Reserve your seat"}
      </button>

      {status === "error" && (
        <p className="text-[13px] text-[#8B1A1A] leading-[1.5]" role="alert">
          Sorry, something went wrong. Please try again in a moment.
        </p>
      )}

      <p className="text-[12px] text-[#9A9080] leading-[1.6]">
        We&apos;ll only use your details to send you the joining link and
        reminders for this webinar.
      </p>
    </form>
  );
}
