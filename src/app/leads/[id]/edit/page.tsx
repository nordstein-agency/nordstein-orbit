"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import OrbitButton from "@/components/orbit/OrbitButton";
import { useToast } from "@/components/orbit/OrbitToast";
import OrbitInput from "@/components/orbit/OrbitInput";

// Neue Komponenten
import SocialsEditor from "@/components/orbit/socials/SocialsEditor";
import SignalsEditor from "@/components/orbit/signals/SignalsEditor";

export default function EditLeadPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<any>(null);

  // Tabs
  const [tab, setTab] = useState("data");

  // Felder
  const [form, setForm] = useState<any>({
    company_name: "",
    website: "",
    email: "",
    phone: "",
    industry: "",
    region: "",
    ceo: "",
    socials: {},
    signals: {},
    address: "",
  });

  // 🔹 Lead laden – jetzt über API, NICHT Supabase Browser
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/orbit/get/lead/${id}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        addToast("Fehler beim Laden des Leads", "error");
        router.push("/leads");
        return;
      }

      const data = await res.json();
      setLead(data);

      setForm({
        company_name: data.company_name ?? "",
        website: data.website ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        industry: data.industry ?? "",
        region: data.region ?? "",
        ceo: data.ceo ?? "",
        address: data.address ?? "",
        socials: data.socials ?? {},
        signals: data.signals ?? {},
      });

      setLoading(false);
    }

    load();
  }, [id]);

  // 🔹 Speichern – ebenfalls per API
  async function handleSave() {
    const res = await fetch(`/api/orbit/update/lead/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      addToast("Fehler beim Speichern", "error");
      return;
    }

    addToast("Lead gespeichert", "success");
    router.push(`/leads/${id}`);
  }

  if (loading)
    return <div className="p-10 text-white/50">Lade…</div>;

  return (
    <div className="pt-16 pl-12 pr-8 max-w-4xl space-y-10">

      {/* TOP BAR */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <OrbitButton
          onClick={() => router.back()}
          className="bg-white text-black hover:bg-white/80"
        >
          ← Zurück
        </OrbitButton>

        <OrbitButton
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-500"
        >
          Speichern
        </OrbitButton>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl text-white font-bold">
        Lead bearbeiten
      </h1>

      {/* TABS */}
      <div className="flex gap-6 border-b border-white/10 pb-3">
        {[
          ["data", "Daten"],
          ["contact", "Kontakt"],
          ["socials", "Socials"],
          ["signals", "Signale"],
          ["ceo", "CEO"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-sm ${
              tab === key
                ? "text-white border-b-2 border-white"
                : "text-white/40 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-6">

        {tab === "data" && (
          <>
            <OrbitInput
              label="Unternehmen"
              value={form.company_name}
              onChange={(v) => setForm({ ...form, company_name: v })}
            />

            <OrbitInput
              label="Website"
              value={form.website}
              onChange={(v) => setForm({ ...form, website: v })}
            />

            <OrbitInput
              label="Branche"
              value={form.industry}
              onChange={(v) => setForm({ ...form, industry: v })}
            />

            <OrbitInput
              label="Region"
              value={form.region}
              onChange={(v) => setForm({ ...form, region: v })}
            />

            <OrbitInput
              label="Adresse"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
            />
          </>
        )}

        {tab === "contact" && (
          <>
            <OrbitInput
              label="E-Mail"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />

            <OrbitInput
              label="Telefon"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
          </>
        )}

        {tab === "socials" && (
          <SocialsEditor
            value={form.socials}
            onChange={(v) => setForm({ ...form, socials: v })}
          />
        )}

        {tab === "signals" && (
          <SignalsEditor
            value={form.signals}
            onChange={(v) => setForm({ ...form, signals: v })}
          />
        )}

        {tab === "ceo" && (
          <OrbitInput
            label="CEO / Founder"
            value={form.ceo}
            onChange={(v) => setForm({ ...form, ceo: v })}
          />
        )}
      </div>
    </div>
  );
}
