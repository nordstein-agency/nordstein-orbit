"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import OrbitButton from "@/components/orbit/OrbitButton";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";
import { AllianceDropdown } from "./AllianceDropdown";
import AllianceButton from "./AllianceButton";

export default function AlliancePartnerCreateForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [nordsteinId, setNordsteinId] = useState("");
  const [leader, setLeader] = useState("");
  const [role, setRole] = useState("alliance_partner");
  const [partnerRole, setPartnerRole] = useState("fulfillment");
  const [loading, setLoading] = useState(false);

  const userRoleOptions = [
    { label: "Alliance Partner", value: "alliance_partner" },
    { label: "Agentur", value: "agency" },
    { label: "Spezialist", value: "specialist" },
    { label: "Fulfillment", value: "fulfillment" },
  ];

  const partnerRoleOptions = [
    { label: "Fulfillment Partner", value: "fulfillment" },
    { label: "Agentur", value: "agency" },
    { label: "Spezialist", value: "specialist" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ USER ERSTELLEN
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          role,
          nordstein_id: nordsteinId || null,
          leader: leader || null,
          auth_id: null,
        })
        .select()
        .single();

      if (userError) throw userError;

      // 2️⃣ ALLIANCE PARTNER ANLEGEN
      const { data: partner, error: partnerError } = await supabase
        .from("alliance_partners")
        .insert({
          user_id: newUser.id,
          partner_role: partnerRole,
          status: "active",
        })
        .select()
        .single();

      if (partnerError) throw partnerError;

      // 3️⃣ REDIRECT
      router.push(`/alliance/partner/${partner.id}`);
    } catch (error) {
      console.error(error);
      alert("Fehler beim Erstellen des Alliance Partners.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* NAME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          type="text"
          placeholder="Vorname"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e4c46d]"
          required
        />
        <input
          type="text"
          placeholder="Nachname"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e4c46d]"
          required
        />
      </div>

      {/* EMAIL */}
      <input
        type="email"
        placeholder="E-Mail Adresse"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e4c46d]"
        required
      />

      {/* USER ROLE */}
      <div>
        <label className="block mb-2 text-sm text-[#c9b5c7]">Interne Rolle</label>
        <AllianceDropdown
          options={userRoleOptions}
          value={role}
          placeholder="Rolle auswählen"
          onChange={setRole}
        />
      </div>

      {/* PARTNER ROLE */}
      <div>
        <label className="block mb-2 text-sm text-[#c9b5c7]">Alliance Partnerrolle</label>
        <AllianceDropdown
          options={partnerRoleOptions}
          value={partnerRole}
          placeholder="Partnerrolle auswählen"
          onChange={setPartnerRole}
        />
      </div>

      {/* NORDSTEIN ID */}
      <input
        type="text"
        placeholder="Nordstein-ID (optional)"
        value={nordsteinId}
        onChange={(e) => setNordsteinId(e.target.value)}
        className="w-full bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e4c46d]"
      />

      {/* LEADER */}
      <input
        type="text"
        placeholder="Leader (optional, UUID)"
        value={leader}
        onChange={(e) => setLeader(e.target.value)}
        className="w-full bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e4c46d]"
      />

      {/* SUBMIT */}
      <AllianceButton type="submit" loading={loading}>
        Alliance Partner erstellen
      </AllianceButton>
    </form>
  );
}
