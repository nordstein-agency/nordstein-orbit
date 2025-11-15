"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fake-Login für den Anfang (später: echte Auth)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    // Dummy-Zugangsdaten – NUR zu Testzwecken
    if (email === "demo@nordstein.one" && password === "demo123") {
      // Hier könntest du später Tokens/Session setzen
      router.push("/dashboard");
    } else {
      setError("Zugangsdaten sind ungültig.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Login</h2>
      <p className="text-xs text-gray-300/80 mb-6">
        Bitte melde dich mit deinen Nordstein Zugangsdaten an.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-medium text-gray-200 tracking-wide"
          >
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            placeholder="vorname.nachname@nordstein.one"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-medium text-gray-200 tracking-wide"
          >
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl px-3 py-2 text-sm font-medium bg-brand-accent text-black hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? "Wird geprüft..." : "Anmelden"}
        </button>

        <p className="text-[11px] text-gray-400 text-center mt-2">
          Probleme beim Login? Wende dich an deinen Nordstein Administrator.
        </p>
      </form>
    </div>
  );
}
