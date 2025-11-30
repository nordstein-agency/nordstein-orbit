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

  // Nur "Orbit Credits" Produkt filtern
  const orbitPrices = prices.data.filter(
    (p) => p.product && (p.product as any).name === "Orbit Credits"
  );

  return orbitPrices.map((p) => ({
    id: p.id,
    amount: (p.unit_amount || 0) / 100, // Preis in €
    credits: Number(p.metadata.credits || 0),
    name: (p.product as any).name,
  }));
}
