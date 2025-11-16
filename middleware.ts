import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set(name, value, options);
        },
        remove: (name, options) => {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  const PUBLIC_PATHS = ["/login"];
  const path = req.nextUrl.pathname;

  // Supabase AUTH Requests IMMER durchlassen
  if (path.startsWith("/auth")) return res;

  // Öffentliche Seiten
  if (PUBLIC_PATHS.some((route) => path.startsWith(route))) {
    return res;
  }

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
    "/((?!_next|api|auth|favicon.ico|.*\\..*).*)",
  ],
};
