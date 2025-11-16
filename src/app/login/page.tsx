"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24"> 
      {/* pt-24 = Abstand nach unten, damit Navbar NICHT überlappt */}

      <div className="w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl 
      hover:shadow-[0_0_25px_#451a3d55] transition-all">

        <h1 className="text-3xl font-semibold text-center mb-8 text-white tracking-wide">
          Willkommen bei <span className="text-[#d8a5d0]">Orbit</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* EMAIL */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 
              text-white focus:outline-none focus:ring-2 focus:ring-[#b879a8] transition"
              placeholder="name@nordstein.one"
            />
          </div>

          {/* PASSWORT */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 
              text-white focus:outline-none focus:ring-2 focus:ring-[#b879a8] transition"
              placeholder="••••••••"
            />
          </div>

          {/* ERROR */}
          {message && (
            <p className="text-center text-red-400 bg-red-900/30 p-2 rounded-lg border border-red-800/30 text-sm">
              {message}
            </p>
          )}

          {/* ORBIT LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-black text-sm tracking-wide
            bg-gradient-to-r from-[#d8a5d0] to-[#a75692] 
            shadow-[0_0_20px_#a7569255] hover:shadow-[0_0_35px_#a75692aa]
            hover:scale-[1.02] active:scale-[0.98]
            transition-all disabled:opacity-50"
          >
            {loading ? "Wird geprüft..." : "Einloggen"}
          </button>
        </form>

      </div>
    </div>
  );
}
