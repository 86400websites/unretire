import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { hasAccess } from "@/lib/auth/entitlements";

// Node runtime (not edge) — reading a file from disk needs Node.
export const runtime = "nodejs";

/**
 * Course worksheets — the paid PDFs, served ONLY to an entitled member.
 *
 * Known issue 37, half one. These four files used to sit in
 * public/assets/unretire/course/, which Next serves as static assets to anyone
 * who knows (or guesses) the URL — no session, no entitlement, no log. The
 * course's own UI hid them behind a padlock, but the padlock was decoration:
 * the files themselves were public. They now live outside public/ and can only
 * be reached through this gate.
 *
 * Follows the pattern proven by /api/book-download, which reads its masters the
 * same way and is confirmed working on Vercel (PR #21 run #103).
 */

/**
 * Whitelist. The client sends a KEY, never a path, so no input of any shape can
 * escape this directory — the request cannot express a path at all, which is a
 * stronger guarantee than sanitising one.
 */
const WORKSHEETS = {
  "m1-intro": {
    file: "Module1_Deliverable_Worksheet.pdf",
    download: "Module 1 — Deliverable Worksheet.pdf",
  },
  "m1-l1": {
    file: "Module1_Lesson1_Worksheet.pdf",
    download: "Module 1, Lesson 1 — Worksheet.pdf",
  },
  "m1-l2": {
    file: "Module1_Lesson2_Worksheet.pdf",
    download: "Module 1, Lesson 2 — Worksheet.pdf",
  },
  "m1-l3": {
    file: "Module1_Lesson3_Worksheet.pdf",
    download: "Module 1, Lesson 3 — Worksheet.pdf",
  },
} as const;

export type WorksheetKey = keyof typeof WORKSHEETS;

const WORKSHEET_DIR = path.join(
  process.cwd(),
  "src/app/learn/course/_worksheets",
);

/**
 * Build a header-safe Content-Disposition (RFC 6266).
 *
 * The web `Headers` constructor rejects any character whose code point is > 255
 * ("Cannot convert argument to a ByteString"). Every approved worksheet name
 * carries an em-dash — U+2014, e.g. "Module 1 — Deliverable Worksheet.pdf" —
 * so `filename="${entry.download}"` made `new NextResponse(...)` THROW. That
 * construction is below the try/catch that guards the file read, so the throw
 * escaped the handler and Next answered 500: the owner's "unable to handle this
 * request", on every entitled worksheet download. (The book route was immune
 * only because it builds an ASCII-only filename first.)
 *
 * The fix emits both forms RFC 6266 defines: an ASCII-only `filename=` that any
 * client accepts, and a UTF-8 `filename*=` that carries the real name — em-dash
 * intact — to every modern browser. Neither passes a byte > 255 to the header.
 */
function contentDisposition(
  disposition: "inline" | "attachment",
  filename: string,
): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "-").replace(/["\\]/g, "-");
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(request: NextRequest) {
  // 1. Entitlement first, before anything else is read or revealed. Premium
  //    includes the course, which ownsProduct() handles inside hasAccess().
  if (!(await hasAccess("course"))) {
    return NextResponse.json(
      { error: "Course access required." },
      { status: 403 },
    );
  }

  // 2. Resolve the key against the whitelist. An unknown key is a 404, and the
  //    response says nothing about what other keys might exist.
  const key = request.nextUrl.searchParams.get("doc") ?? "";
  const entry = (
    WORKSHEETS as Record<string, (typeof WORKSHEETS)[WorksheetKey]>
  )[key];
  if (!entry) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // 3. Serve it.
  let bytes: Buffer;
  try {
    bytes = await readFile(path.join(WORKSHEET_DIR, entry.file));
  } catch {
    console.error(`Worksheet ${key} could not be read from ${WORKSHEET_DIR}`);
    return NextResponse.json(
      { error: "That worksheet is not available right now." },
      { status: 500 },
    );
  }

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition("inline", entry.download),
      // Paid content must never be held by a shared cache.
      "Cache-Control": "private, no-store",
    },
  });
}
