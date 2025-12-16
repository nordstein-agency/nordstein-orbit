// app/api/webhooks/meta/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.META_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json(
    { error: "Webhook verification failed" },
    { status: 403 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    console.log("📩 META WEBHOOK EVENT", payload);

    // Meta erwartet schnell 200 OK
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Meta Webhook Error", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
