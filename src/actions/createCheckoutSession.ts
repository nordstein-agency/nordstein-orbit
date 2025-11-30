"use server";

import Stripe from "stripe";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function createCheckoutSession(priceId: string) {
  const cookieStore = await cookies();

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: cookieStore
  }
);


  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wallet?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wallet?canceled=1`,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_id: user.id },
  });

  return session.url;
}
