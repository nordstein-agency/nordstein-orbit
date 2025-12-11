import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 🔓 Public routes (Login, Callback, Public APIs)
  const publicPaths = [
    "/login",
    "/auth",
    "/auth/callback",
    "/api/public",
    "/api/user/role"
  ];

  if (publicPaths.some((p) => path === p || path.startsWith(p))) {
    return NextResponse.next();
  }

  // 🧱 Now build response safely
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  // 🔐 ONE Auth Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, opts) => {
          res.cookies.set(name, value, {
            ...opts,
            domain: ".nordstein-agency.com",
            path: "/",
          });
        },
        remove: (name, opts) => {
          res.cookies.set(name, "", {
            ...opts,
            maxAge: 0,
            domain: ".nordstein-agency.com",
            path: "/",
          });
        },
      },
    }
  );

  // 🔍 Check session
  const { data: { session } } = await supabase.auth.getSession();

  // ❌ No session → redirect (BUT NEVER redirect /login to itself!)
  if (!session && !path.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|static|.*\\..*|favicon.ico).*)",
  ],
};





/*
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  console.log("ORBIT_COOKIES", req.cookies.getAll());


  // Detect Dev/Prod environment
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
            domain: ".nordstein-agency.com", // SSO COOKIE DOMAIN
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

  // Orbit darf KEIN eigenes Login haben → immer zu Start weiterleiten
  if (path.startsWith("/login") || path.startsWith("/auth")) {
    return NextResponse.redirect(new URL(startLoginUrl, req.url));
  }

  // Session prüfen
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("ORBIT_SESSION", session);


  // Keine Session? → Weiterleiten zu Start Login Page
  if (!session) {
    return NextResponse.redirect(new URL(startLoginUrl, req.url));
  }

  // Session vorhanden → Seite normal laden
  return res;
}

// Alle Routen schützen außer static files und next internals
export const config = {
  matcher: ["/((?!_next|static|.*\\..*|favicon.ico).*)"],
};

*/