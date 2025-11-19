// src/app/api/leads/enrich/route.ts
import { NextRequest, NextResponse } from "next/server";
// Hier später: OpenAI / KI-Client importieren

export async function POST(req: NextRequest) {
  try {
    const { lead } = await req.json();

    if (!lead) {
      return NextResponse.json(
        { error: "Kein Lead im Request." },
        { status: 400 }
      );
    }

    // Basic-Check: wir brauchen mindestens eine Website oder Firma
    const website = lead.website as string | null;
    const company = lead.company_name as string | null;

    if (!website && !company) {
      return NextResponse.json(
        { error: "Lead hat weder Website noch Firmenname." },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // 1) Website HTML laden (wenn möglich)
    // ----------------------------------------
    let html = "";
    if (website) {
      const url =
        website.startsWith("http://") || website.startsWith("https://")
          ? website
          : `https://${website}`;

      try {
        const resp = await fetch(url, { method: "GET" });
        html = await resp.text();
      } catch (e) {
        // Wenn Fetch fehlschlägt, machen wir einfach ohne HTML weiter
        console.error("Fehler beim Laden der Website:", e);
      }
    }

    // ----------------------------------------
    // 2) KI-Aufruf (hier später OpenAI / Make)
    // ----------------------------------------
    // 👉 Hier kommt dein KI-Call rein (OpenAI, Make-Webhook, etc.)
    // Für jetzt bauen wir ein mock-artiges Enrichment,
    // damit die End-to-End-Kette schon funktioniert.

    const enriched = {
      // Beispiel: falls keine Branche gesetzt, eine Dummy-Branche
      industry: lead.industry ?? "Agentur / Marketing",
      // Beispiel: falls keine Region gesetzt, „DACH“
      region: lead.region ?? "DACH",
      // CEO Dummy, falls nicht vorhanden
      ceo: lead.ceo ?? null,
      // Socials ergänzen (hier nur Platzhalter)
      socials: {
        ...(lead.socials ?? {}),
        // linkedin: "https://www.linkedin.com/in/example",
      },
      // Signals: hier später das Ergebnis der KI-Analyse
      signals: {
        ...(lead.signals ?? {}),
        has_website: Boolean(website),
        // html_length: html.length,
        // keywords: [...]
      },
    };

    return NextResponse.json(enriched, { status: 200 });
  } catch (error) {
    console.error("Enrich-API Fehler:", error);
    return NextResponse.json(
      { error: "Interner Fehler beim Enrichment." },
      { status: 500 }
    );
  }
}
