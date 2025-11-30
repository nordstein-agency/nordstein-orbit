import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  const signature = (await headers()).get("stripe-signature")!;
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const userId = session.metadata.user_id;

    // Price Metadata auslesen (Credits pro Paket)
    const lineItem = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price"],
    });

    const credits = Number(lineItem.data[0].price?.metadata?.credits || 0);

    // Supabase Admin Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Credits buchen
    await supabase.rpc("add_orbit_credits", {
      uid: userId,
      amount: credits,
    });

    // Transaktion loggen
    await supabase.from("orbit_credit_transactions").insert({
      user_id: userId,
      amount: credits,
      type: "purchase",
      description: `${credits} Credits gekauft`,
    });
  }

  return new Response("OK", { status: 200 });
}
