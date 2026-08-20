import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { getAccess, ownsProduct } from "@/lib/auth/entitlements";

// Node runtime (not edge) — pdf-lib + fs need Node.
export const runtime = "nodejs";

// The un-watermarked masters live OUTSIDE /public so they can never be fetched
// clean by a URL. Only this server route reads them.
const MASTERS = {
  book: {
    path: path.join(process.cwd(), "src/app/unretire/account/_book/unretire-book-master.pdf"),
    label: "book",
  },
  workbook: {
    path: path.join(process.cwd(), "src/app/unretire/account/_book/unretire-workbook-master.pdf"),
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
    return NextResponse.json({ error: "Premium access required." }, { status: 403 });
  }

  // 2. Get and validate the name + which document.
  let name = "";
  let type: DocType = "book";
  try {
    const body = await request.json();
    name = cleanName(String(body?.name ?? ""));
    const t = String(body?.type ?? "book");
    if (t === "book" || t === "workbook") type = t;
    else return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
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
  const label = `Private Copy — ${name}`;

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(14, Math.floor(width / 32));
    const textWidth = font.widthOfTextAtSize(label, size);

    // Two diagonal stamps per page — one toward the left, one toward the
    // right — so the name is harder to crop out (matches the reference).
    // Each x is the centre of that stamp; we offset by half the rotated
    // text width so the label sits centred on that point.
    const centres = [width * 0.3, width * 0.68];
    for (const cx of centres) {
      page.drawText(label, {
        x: cx - (textWidth / 2) * Math.cos(Math.PI / 4),
        y: height / 2 - (textWidth / 2) * Math.sin(Math.PI / 4),
        size,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.22,
        rotate: degrees(45),
      });
    }
  }

  const out = await pdf.save();

  // 5. Stream it back as a download.
  const prefix = type === "workbook" ? "UnRetire-Workbook" : "UnRetire";
  const safeFile =
    prefix + "-" + name.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + ".pdf";

  return new NextResponse(Buffer.from(out), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFile}"`,
      "Cache-Control": "no-store",
    },
  });
}
