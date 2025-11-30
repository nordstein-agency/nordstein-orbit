"use server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// Fallback-Domain, falls ENV nicht gesetzt
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_BASE_URL
    : "https://orbit.nordstein-agency.com";

export async function createCheckoutSession(priceId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // ⭐ Must be absolute URLs
    success_url: `${BASE_URL}/wallet/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/wallet/buy`,
  });

  return session.url;
}
