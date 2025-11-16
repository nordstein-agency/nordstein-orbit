"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const doLogout = async () => {
      await supabase.auth.signOut();
      router.push("/login");
    };

    doLogout();
  }, []);

  return (
    <div className="text-white p-10">
      Abmelden...
    </div>
  );
}
