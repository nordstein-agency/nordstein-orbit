import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/**
 * Business TZ für Nordstein (Default).
 */
export const ORBIT_BUSINESS_TZ = "Europe/Vienna";

/**
 * Entscheidet, welche TZ für Anzeige genutzt wird.
 */
export function resolveDisplayTZ(displayTz?: string | null) {
  if (!displayTz) return ORBIT_BUSINESS_TZ;

  if (displayTz === "local") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  return displayTz;
}

/**
 * Formatiert ein Datum (UTC oder ISO String) in gewünschter TZ
 */
export function formatOrbit(
  date: Date | string,
  tz: string,
  fmt: string
) {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(d, tz, fmt);
}

/**
 * Wandelt Business-Lokalzeit → UTC
 * z.B. "2025-12-22 10:00" (Europe/Vienna) → Date (UTC)
 */
export function businessLocalToUtc(local: string) {
  return fromZonedTime(local, ORBIT_BUSINESS_TZ);
}
