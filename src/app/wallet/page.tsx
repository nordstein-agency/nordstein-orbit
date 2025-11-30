import WalletCard from "@/components/orbit/wallet/WalletCard";
import TransactionItem from "@/components/orbit/wallet/TransactionItem";
import { getWallet } from "@/actions/getWallet";
import { getTransactions } from "@/actions/getTransactions";
import Link from "next/link";
import { OrbitButtonLink } from "@/components/orbit/OrbitButton";

export default async function WalletPage() {
  const wallet = await getWallet();
  const transactions = await getTransactions();

  return (
    <div className="px-6 pt-16 pb-24 max-w-4xl mx-auto space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white">Orbit Wallet</h1>
        <p className="text-white/60 mt-2">
          Dein persönliches Credit-Wallet für KI-Tools, Lead-Analysen & Premium-Funktionen.
        </p>
      </div>

      {/* WALLET BALANCE CARD */}
      <WalletCard credits={wallet?.credits ?? 0} />

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        <OrbitButtonLink
          href="/wallet/buy"
          className="bg-[#B244FF] hover:bg-[#9A32E0] transition text-white px-4 py-3 rounded-xl font-semibold"
        >
          Credits kaufen
        </OrbitButtonLink>

        <OrbitButtonLink
          href="/wallet/earn"
          className="bg-white/10 hover:bg-white/20 transition border border-white/20 text-white px-4 py-3 rounded-xl font-semibold"
        >
          Credits verdienen
        </OrbitButtonLink>
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-xl">
        <h2 className="text-xl text-white font-semibold mb-4">
          Letzte Transaktionen
        </h2>

        {transactions.length === 0 && (
          <p className="text-white/50">Noch keine Transaktionen.</p>
        )}

        {transactions.map((tx) => (
          <TransactionItem key={tx.id} tx={tx} />
        ))}
      </div>
    </div>
  );
}
