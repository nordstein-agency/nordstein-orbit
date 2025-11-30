import type { SupabaseClient } from "@supabase/supabase-js";

export async function spendCredit(
  supabase: SupabaseClient,
  userId: string,
  amount: number = 1
) {
  const { data: wallet } = await supabase
    .from("orbit_credits")
    .select("credits")
    .eq("user_id", userId)
    .single();

  if (!wallet || wallet.credits < amount) {
    return { error: "NOT_ENOUGH_CREDITS" };
  }

  const newBalance = wallet.credits - amount;

  await supabase
    .from("orbit_credits")
    .update({ credits: newBalance })
    .eq("user_id", userId);

  await supabase.from("orbit_credit_transactions").insert({
    user_id: userId,
    amount: -amount,
    type: "spend",
    description: "Lead Enrichment",
  });

  return { success: true, balance: newBalance };
}
