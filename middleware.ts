import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  // Cookie wrapper, kompatibel zu Supabase CookieMethodsServer
  const cookieStore = {
    get(name: string) {
      return req.cookies.get(name)?.value;
    },
    set(name: string, value: string, options?: any) {
      res.cookies.set(name, value, options);
    },
    remove(name: string, options?: any) {
      res.cookies.set(name, "", {
        ...options,
        maxAge: 0,
      });
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore,
    }
  );

  const url = req.nextUrl;
  const path = url.pathname;

  // Static + next internals -> always allowed
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.match(/\.(.*)$/)
  ) {
    return res;
  }

  // Allow Supabase auth
  if (path.startsWith("/auth")) return res;

  // Allow login (with params too)
  if (path === "/login" || path.startsWith("/login?")) return res;

  // Allow next data requests
  if (path.startsWith("/_next/data")) return res;

  // Check session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
