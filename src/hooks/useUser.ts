"use client";

import { useEffect, useState } from "react";
//import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { createSupabaseAuthClient } from "@/lib/supabase/authClient";

const supabase = createSupabaseAuthClient();
import type { User } from "@supabase/supabase-js";  // <-- Wichtig!

export function useUser() {
  const [user, setUser] = useState<User | null>(null);   // <-- Typ richtig!

  useEffect(() => {
    // Initialer Check
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    // Listener für Status-Änderungen
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return user;
}
