import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { getAccess, ownsProduct } from "@/lib/auth/entitlements";
import { createClient } from "@/lib/supabase/server";

// Node runtime (not edge) — pdf-lib + fs need Node.
export const runtime = "nodejs";

// The un-watermarked masters live OUTSIDE /public so they can never be fetched
// clean by a URL. Only this server route reads them.
const MASTERS = {
  book: {
    path: path.join(
      process.cwd(),
      "src/app/unretire/account/_book/unretire-book-master.pdf",
    ),
    label: "book",
  },
  workbook: {
    path: path.join(
      process.cwd(),
      "src/app/unretire/account/_book/unretire-workbook-master.pdf",
    ),
    label: "workbook",
  },
} as const;

type DocType = keyof typeof MASTERS;

// Keep the stamped name sane: strip control chars, collapse whitespace, cap length.
function cleanName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export async function POST(request: NextRequest) {
  // 1. Must be a signed-in premium member (FREE-coupon members included —
  //    they hold a real 'premium' entitlement).
  const { userId, products } = await getAccess();
  if (!userId || !ownsProduct("premium", products)) {
    return NextResponse.json(
      { error: "Premium access required." },
      { status: 403 },
    );
  }

  // 2. Get and validate the name + which document.
  let name = "";
  let type: DocType = "book";
  try {
    const body = await request.json();
    name = cleanName(String(body?.name ?? ""));
    const t = String(body?.type ?? "book");
    if (t === "book" || t === "workbook") type = t;
    else
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 },
    );
  }

  // 2b. One download per user per document. Check whether they've already
  //     downloaded this doc. (Reviewed with Mohammad after building — writes
  //     to the new book_downloads table, under the user's own RLS session.)
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("book_downloads")
    .select("id")
    .eq("user_id", userId)
    .eq("doc_type", type)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error:
          "You've already downloaded this — it's a one-time download. If you can't find your copy, contact support.",
      },
      { status: 409 },
    );
  }

  // 3. Load the selected master PDF.
  let masterBytes: Buffer;
  try {
    masterBytes = await readFile(MASTERS[type].path);
  } catch {
    return NextResponse.json(
      { error: `The ${MASTERS[type].label} is not available right now.` },
      { status: 500 },
    );
  }

  // 4. Stamp "Private Copy — [Name]" diagonally across every page.
  const pdf = await PDFDocument.load(masterBytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const line1 = "Private Copy —";
  const line2 = name;

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(14, Math.floor(width / 32));
    const gap = size * 1.25; // vertical space between the two lines
    const w1 = font.widthOfTextAtSize(line1, size);
    const w2 = font.widthOfTextAtSize(line2, size);
    const cos = Math.cos(Math.PI / 4);
    const sin = Math.sin(Math.PI / 4);

    // Two diagonal stamps per page — one toward the left, one toward the
    // right — so the name is harder to crop out (matches the reference).
    // Each stamp is two lines: "Private Copy —" above the name. Because the
    // text is rotated 45°, the second line is stepped along the rotation so
    // it sits directly beneath the first.
    const centres = [width * 0.3, width * 0.68];
    for (const cx of centres) {
      const cy = height / 2;
      page.drawText(line1, {
        x: cx - (w1 / 2) * cos,
        y: cy - (w1 / 2) * sin,
        size,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.22,
        rotate: degrees(45),
      });
      page.drawText(line2, {
        x: cx - (w2 / 2) * cos + gap * sin,
        y: cy - (w2 / 2) * sin - gap * cos,
        size,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.22,
        rotate: degrees(45),
      });
    }
  }

  const out = await pdf.save();

  // 4b. Record the download so it can't be repeated. The unique
  //     (user_id, doc_type) constraint also guards against a race where two
  //     requests slip past the check above — the second insert errors, and we
  //     refuse. (If the insert fails for any OTHER reason we still let this
  //     one download through, since the user did legitimately request it.)
  const { error: insertError } = await supabase
    .from("book_downloads")
    .insert({ user_id: userId, doc_type: type });

  if (insertError && insertError.code === "23505") {
    // 23505 = unique_violation → they already have a row (race). Refuse.
    return NextResponse.json(
      {
        error:
          "You've already downloaded this — it's a one-time download. If you can't find your copy, contact support.",
      },
      { status: 409 },
    );
  }

  // 5. Stream it back as a download.
  const prefix = type === "workbook" ? "UnRetire-Workbook" : "UnRetire";
  const safeFile =
    prefix +
    "-" +
    name.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "") +
    ".pdf";

  return new NextResponse(Buffer.from(out), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFile}"`,
      "Cache-Control": "no-store",
    },
  });
}
