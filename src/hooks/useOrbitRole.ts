"use client";

import { useEffect, useState } from "react";

export function useOrbitRole() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/user/role");
      const json = await res.json();
      setRole(json.role);
    };

    load();
  }, []);

  return role;
}
