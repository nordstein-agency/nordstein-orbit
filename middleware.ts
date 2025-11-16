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
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set(name, value, options);
        },
        remove: (name: string, options: any) => {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  // alle öffentlichen Routen
  const PUBLIC_PATHS = ["/login"];

  const path = req.nextUrl.pathname;

  // WICHTIG: Supabase AUTH zulassen!
  if (path.startsWith("/auth")) {
    return res;
  }

  // statische Dateien zulassen
  if (
    path.startsWith("/_next") ||
    path.startsWith("/images") ||
    path.startsWith("/favicon") ||
    path.match(/.*\.(png|jpg|jpeg|svg|ico|gif|webp)$/)
  ) {
    return res;
  }

  // Public Pages durchlassen
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
  matcher: ["/((?!.*\\..*|_next).*)"],
};
