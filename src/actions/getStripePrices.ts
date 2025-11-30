"use server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
  });

  const orbitPrices = prices.data
    .filter((p) => (p.product as any)?.name === "Orbit Credits")
    .map((p) => {
      const lookup = p.lookup_key?.[0] || "";

      const credits = lookup.startsWith("credits_")
        ? Number(lookup.replace("credits_", ""))
        : 0;

      return {
        id: p.id,
        amount: (p.unit_amount || 0) / 100,
        credits,
        lookup_key: lookup,
      };
    });

  return orbitPrices;
}
