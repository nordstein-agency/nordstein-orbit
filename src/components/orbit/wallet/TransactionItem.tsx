"use client";

export default function TransactionItem({ tx }: { tx: any }) {
  const positive = tx.amount > 0;

  return (
    <div className="flex justify-between items-center py-3 border-b border-white/10">
      <div>
        <p className="text-white">{tx.description || tx.type}</p>
        <p className="text-white/40 text-xs">
          {new Date(tx.created_at).toLocaleString("de-DE")}
        </p>
      </div>

      <p
        className={`text-lg font-semibold ${
          positive ? "text-green-400" : "text-red-400"
        }`}
      >
        {positive ? "+" : ""}
        {tx.amount}
      </p>
    </div>
  );
}
