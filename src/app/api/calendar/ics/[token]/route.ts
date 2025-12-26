import { NextResponse, type NextRequest } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";
import { format } from "date-fns";

function toICSDate(date: string) {
  return format(new Date(date), "yyyyMMdd'T'HHmmss'Z'");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  let { token } = await context.params;

  if (token.endsWith(".ics")) {
    token = token.slice(0, -4);
  }

  const { data: tokenRow } = await supabaseOrbitAdmin
    .from("calendar_ics_tokens")
    .select("user_id")
    .eq("token", token)
    .single();

  if (!tokenRow) {
    return new NextResponse("Invalid calendar token", { status: 404 });
  }

  const { data: events } = await supabaseOrbitAdmin
    .from("orbit_calendar_events")
    .select("*")
    .eq("user_id", tokenRow.user_id)
    .order("starts_at", { ascending: true });

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nordstein Orbit//Calendar//DE
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  for (const e of events ?? []) {
    ics += `
BEGIN:VEVENT
UID:${e.id}@orbit
DTSTAMP:${toICSDate(e.starts_at)}
DTSTART:${toICSDate(e.starts_at)}
DTEND:${toICSDate(e.ends_at)}
SUMMARY:${e.title}
DESCRIPTION:${e.description ?? ""}
LOCATION:${e.location ?? ""}
END:VEVENT
`;
  }

  ics += "END:VCALENDAR";

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
