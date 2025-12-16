// app/api/webhooks/meta/route.ts
import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "orbit_meta_verify_2025";

// ------------------------------------------------------
// GET → Webhook Verifikation (Meta Pflicht)
// ------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    // ✅ Meta erwartet EXAKT diesen Response
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

// ------------------------------------------------------
// POST → Webhook Events (Leadgen etc.)
// ------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // 🔹 aktuell nur loggen – später verarbeiten
    console.log("📩 META WEBHOOK EVENT:", JSON.stringify(payload, null, 2));

    // ⚠️ Meta erwartet schnell 200 OK
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Meta Webhook Error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
