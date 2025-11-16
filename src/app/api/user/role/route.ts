import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookies = Object.fromEntries(
              cookieHeader
                .split(";")
                .map((cookie) => cookie.trim().split("="))
            );
            return cookies[name];
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ role: null }, { status: 200 });
    }

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("email", user.email)
      .maybeSingle();

    return NextResponse.json({ role: data?.role ?? null }, { status: 200 });
  } catch (err: any) {
    console.error("API ERROR /api/user/role:", err);
    return NextResponse.json({ role: null, error: err.message }, { status: 500 });
  }
}
