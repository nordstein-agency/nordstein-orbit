import { NextRequest, NextResponse } from "next/server";
import { getOneAdmin } from "@/lib/supabase/one";

export async function GET(req: NextRequest) {
  try {
    const supabase = getOneAdmin();

    // --------------------------------------------------
    // User-ID aus Header
    // --------------------------------------------------
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "x-user-id header missing" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Notifications laden
    // --------------------------------------------------
    const { data: notifications, error: nErr } = await supabase
      .from("notifications")
      .select("id, created_at, title, message, sender_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (nErr) throw nErr;

    // --------------------------------------------------
    // Sender auflösen
    // --------------------------------------------------
    const senderIds = [
      ...new Set(
        (notifications || [])
          .map((n) => n.sender_id)
          .filter(Boolean)
      ),
    ];

    let senderMap: Record<string, string> = {};

    if (senderIds.length > 0) {
      const { data: senders } = await supabase
        .from("users")
        .select("id, first_name, last_name")
        .in("id", senderIds);

      senders?.forEach((s) => {
        senderMap[s.id] = `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
      });
    }

    return NextResponse.json({
      data: (notifications || []).map((n) => ({
        id: n.id,
        created_at: n.created_at,
        title: n.title,
        message: n.message,
        sender_name: n.sender_id
          ? senderMap[n.sender_id] ?? "System"
          : "System",
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
