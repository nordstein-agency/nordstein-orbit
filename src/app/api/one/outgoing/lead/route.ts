import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(
      "https://one.nordstein-agency.com/api/orbit/incoming/lead",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          // OPTIONAL falls du absichern willst
          Authorization: `Bearer ${process.env.ORBIT_TO_ONE_SECRET}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "ONE API error", details: text },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Transfer failed" },
      { status: 500 }
    );
  }
}
