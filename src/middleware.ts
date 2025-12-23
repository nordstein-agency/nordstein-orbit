
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

















// ============= SSO VERSION ========================



/*

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public routes in Orbit
  const publicPaths = ["/api/public", "/_next", "/favicon.ico"];
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const res = NextResponse.next({ request: { headers: req.headers } });

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
            sameSite: "lax",
            secure: true,
          });
        },
        remove: (name, opts) => {
          res.cookies.set(name, "", {
            ...opts,
            maxAge: 0,
            domain: ".nordstein-agency.com",
            path: "/",
            sameSite: "lax",
            secure: true,
          });
        },
      },
    }
  );

  // Besser als getSession(): getUser() prüft den User “sauberer”
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const returnTo = encodeURIComponent(req.nextUrl.href);
    const startLogin =
      process.env.NODE_ENV === "development"
        ? `http://localhost:3000/login?returnTo=${returnTo}`
        : `https://start.nordstein-agency.com/login?returnTo=${returnTo}`;

    return NextResponse.redirect(startLogin);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|static|.*\\..*|favicon.ico).*)"],
};


*/
















//META TEST

/*
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 🔓 Meta Webhook IMMER erlauben
  if (path === "/api/webhooks/meta") {
    return NextResponse.next();
  }

  // Public routes in Orbit
  const publicPaths = ["/api/public", "/_next", "/favicon.ico"];
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const res = NextResponse.next({ request: { headers: req.headers } });

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
            sameSite: "lax",
            secure: true,
          });
        },
        remove: (name, opts) => {
          res.cookies.set(name, "", {
            ...opts,
            maxAge: 0,
            domain: ".nordstein-agency.com",
            path: "/",
            sameSite: "lax",
            secure: true,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const returnTo = encodeURIComponent(req.nextUrl.href);
    const startLogin =
      process.env.NODE_ENV === "development"
        ? `http://localhost:3000/login?returnTo=${returnTo}`
        : `https://start.nordstein-agency.com/login?returnTo=${returnTo}`;

    return NextResponse.redirect(startLogin);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|static|.*\\..*|favicon.ico).*)"],
};


*/
