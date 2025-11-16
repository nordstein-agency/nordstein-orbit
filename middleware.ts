import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Supabase Server Client
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

  // Session abrufen
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // 📌 Öffentliche Seiten definieren
  const publicRoutes = ["/login"];

  // 🟢 Wenn route public ist → durchlassen
  if (publicRoutes.some((route) => path.startsWith(route))) {
    return res;
  }

  // 🔒 ALLES ANDERE → geschützt
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

// 📌 Middleware fängt ALLE ROUTEN ab
export const config = {
  matcher: ["/:path*"],  //  <-- ALLES!
};
