import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.MAILCHIMP_API_KEY!;
const LIST_ID = process.env.MAILCHIMP_LIST_ID!;
const DC = API_KEY.split("-")[1]; // e.g. "us22"

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, tag } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const body: Record<string, unknown> = {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName || "",
      },
    };

    // Add tag if provided (used to trigger the right sequence)
    if (tag) {
      body.tags = [tag];
    }

    const response = await fetch(
      `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    // Already subscribed — still success
    if (data.status === 400 && data.title === "Member Exists") {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    if (!response.ok) {
      console.error("Mailchimp error:", data);
      return NextResponse.json({ error: data.detail || "Subscription failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
