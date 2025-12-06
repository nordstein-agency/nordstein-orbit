/*

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Einheitlicher Response
  const res = NextResponse.next({
    request: {
      headers: req.headers
    }
  });

  // Supabase Server Client korrekt initialisieren
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  const path = req.nextUrl.pathname;

  // öffentliche Routen
  if (
    path.startsWith("/login") ||
    path.startsWith("/auth") ||
    path.startsWith("/api/public")
  ) {
    return res;
  }

  // Session prüfen
  const {
    data: { session },
  } = await supabase.auth.getSession();

    console.log("SESSION:", session); // <--- HIER

  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|static|.*\\..*|favicon.ico).*)",
  ],
};
*/



import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: { headers: req.headers }
  });

  const isDev = process.env.NODE_ENV === "development";
  const startLoginUrl = isDev
    ? "http://localhost:3000/login?from=orbit"
    : "https://start.nordstein-agency.com/login?from=orbit";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, {
            ...options,
            domain: ".nordstein-agency.com",
            path: "/",
            sameSite: "lax",
          });
        },
        remove(name: string, options: any) {
          res.cookies.set(name, "", {
            ...options,
            domain: ".nordstein-agency.com",
            path: "/",
            maxAge: 0,
          });
        },
      },
    }
  );

  const path = req.nextUrl.pathname;

  // Orbit darf kein eigenes Login haben → redirect zu Start (Dev oder Prod)
  if (path.startsWith("/login") || path.startsWith("/auth")) {
    return NextResponse.redirect(startLoginUrl);
  }

  // Session prüfen
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(startLoginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|static|.*\\..*|favicon.ico).*)"],
};

