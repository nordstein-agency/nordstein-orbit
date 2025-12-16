import { NextRequest, NextResponse } from "next/server";

// -----------------------------------------------
// Funktion zum Abrufen der Lead-Daten
// -----------------------------------------------
async function fetchMetaLead(leadgenId: string) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Meta Lead Fetch failed: " + err);
  }

  return res.json();
}

// ------------------------------------------------------
// GET → Webhook Verification (bleibt gleich)
// ------------------------------------------------------
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

// ------------------------------------------------------
// POST → Webhook Events (DEBUG / TEST)
// ------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    console.log("======================================");
    console.log("📩 META WEBHOOK EVENT RECEIVED");
    console.log("======================================");
    console.log(JSON.stringify(payload, null, 2));

    // ----------------------------------
    // Optional: gezielt Leadgen-Daten lesen
    // ----------------------------------
    const entries = payload?.entry ?? [];

    for (const entry of entries) {
      const pageId = entry.id;
      const changes = entry.changes ?? [];

      for (const change of changes) {
        if (change.field === "leadgen") {
          const leadgenId = change.value?.leadgen_id;
          const formId = change.value?.form_id;
          const createdTime = change.value?.created_time;

          console.log("🧲 LEADGEN EVENT");
          console.log({
            pageId,
            leadgenId,
            formId,
            createdTime,
          });

          // Holen der echten Lead-Daten
          if (leadgenId) {
            const lead = await fetchMetaLead(leadgenId);
            console.log("📇 FULL META LEAD");
            console.log(JSON.stringify(lead, null, 2)); // Zeigt den kompletten Lead
          }
        }
      }
    }

    // ⚠️ Meta erwartet IMMER schnell 200 OK
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ META WEBHOOK ERROR");
    console.error(err);

    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }
}
