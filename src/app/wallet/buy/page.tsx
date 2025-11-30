import { getStripePrices } from "@/actions/getStripePrices";
import { createCheckoutSession } from "@/actions/createCheckoutSession";
import { redirect } from "next/navigation";
import OrbitButton from "@/components/orbit/OrbitButton";


export default async function BuyCreditsPage() {
  const prices = await getStripePrices();

  return (
    <div className="px-6 pt-16 pb-24 max-w-4xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-white">Credits kaufen</h1>
      <p className="text-white/60">Wähle ein Credit-Paket aus Stripe:</p>

      <div className="grid sm:grid-cols-2 gap-6">
        {prices.map((p) => (
          <form
            key={p.id}
            action={async () => {
              "use server";
              const url = await createCheckoutSession(p.id);
              if (url) return redirect(url);
            }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between"
          >
            <div>
              <p className="text-white text-2xl font-bold">{p.credits} Credits</p>
              <p className="text-white/70 mt-2">{p.amount} €</p>
            </div>

            <OrbitButton
              type="submit"
              className="mt-6 w-full bg-[#B244FF] hover:bg-[#9A32E0] text-white py-3 rounded-xl font-semibold transition"
            >
              Kaufen
            </OrbitButton>
          </form>
        ))}
      </div>
    </div>
  );
}
