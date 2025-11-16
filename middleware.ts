import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Detect Domain
  const isProd = process.env.NODE_ENV === "production";
  const domain = isProd ? "orbit.nordstein-agency.com" : "localhost";

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
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            domain,
            ...options,
          });
        },
        remove(name: string, options: any) {
          res.cookies.set(name, "", {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 0,
            domain,
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  if (path.startsWith("/login")) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return res;
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
