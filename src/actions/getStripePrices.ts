"use server";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// ⭐ Preis -> Credits Mapping (Plan B)
const PRICE_TO_CREDITS: Record<number, number> = {
  500: 10,    // 5,00 €
  1150: 25,   // 11,50 €
  2600: 60,   // 26,00 €
  6000: 150,  // 60,00 €
};

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
  });

  // Nur das Orbit Credits Produkt filtern
  const orbitPrices = prices.data.filter(
    (p) => p.product && (p.product as any).name === "Orbit Credits"
  );

  return orbitPrices.map((p) => {
    const unitAmount = p.unit_amount || 0;

    return {
      id: p.id,
      amount: unitAmount / 100,
      credits: PRICE_TO_CREDITS[unitAmount] ?? 0, // ⭐ stabile Lösung
      name: (p.product as any).name,
    };
  });
}   
