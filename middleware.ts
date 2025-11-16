// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Response klonen (wichtig für Cookies!)
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set(name, value, { ...options });
        },
        remove: (name: string, options: any) => {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // Öffentlich zugängliche Seiten
  const publicRoutes = ["/login"];

  if (publicRoutes.some((route) => path.startsWith(route))) {
    return res;
  }

  // Geschützte Routen
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

// WICHTIG: Auth-API-Ausschlüsse hinzufügen
export const config = {
  matcher: [
    // match ALLE Seiten außer diese:
    "/((?!_next|.*\\..*|auth|supabase|favicon.ico|robots.txt).*)",
  ],
};
