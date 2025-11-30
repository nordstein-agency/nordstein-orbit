import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// ⭐ Preis → Credits Mapping (Plan B)
const PRICE_TO_CREDITS: Record<number, number> = {
  500: 10,    // 5,00 €
  1150: 25,   // 11,50 €
  2600: 60,   // 26,00 €
  6000: 150,  // 60,00 €
};

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

    // Preis auslesen
    const lineItems = await stripe.checkout.sessions.listLineItems(
      session.id,
      { expand: ["data.price"] }
    );

    const price = lineItems.data[0]?.price;
    const unitAmount = price?.unit_amount ?? 0;

    // ⭐ Credits aus Mapping ermitteln (Plan B)
    const credits = PRICE_TO_CREDITS[unitAmount] ?? 0;

    // Supabase Admin Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Credits gutschreiben
    await supabase.rpc("add_orbit_credits", {
      uid: userId,
      amount: credits,
    });

    // Transaktion speichern
    await supabase.from("orbit_credit_transactions").insert({
      user_id: userId,
      amount: credits,
      type: "purchase",
      description: `${credits} Credits gekauft`,
    });
  }

  return new Response("OK", { status: 200 });
}
