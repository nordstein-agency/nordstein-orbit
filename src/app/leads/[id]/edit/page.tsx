"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import OrbitButton from "@/components/orbit/OrbitButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/orbit/OrbitToast";
import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";

// Neue Komponenten
import SocialsEditor from "@/components/orbit/socials/SocialsEditor";
import SignalsEditor from "@/components/orbit/signals/SignalsEditor";

export default function EditLeadPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
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

  // Laden des Leads
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        addToast("Fehler beim Laden des Leads", "error");
        router.push("/leads");
        return;
      }

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

  // Speichern
  async function handleSave() {
    const { error } = await supabase
      .from("leads")
      .update(form)
      .eq("id", id);

    if (error) {
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

        {/* DATEN */}
        {tab === "data" && (
          <>
            <OrbitInput
              label="Unternehmen"
              value={form.company_name}
              onChange={(value) =>
                setForm({ ...form, company_name: value })
              }
            />

            <OrbitInput
              label="Website"
              value={form.website}
              onChange={(value) =>
                setForm({ ...form, website: value })
              }
            />

            <OrbitInput
              label="Branche"
              value={form.industry}
              onChange={(value) =>
                setForm({ ...form, industry: value })
              }
            />

            <OrbitInput
              label="Region"
              value={form.region}
              onChange={(value) =>
                setForm({ ...form, region: value })
              }
            />

            <OrbitInput
              label="Adresse"
              value={form.address}
              onChange={(value) =>
                setForm({ ...form, address: value })
              }
            />
          </>
        )}

        {/* KONTAKT */}
        {tab === "contact" && (
          <>
            <OrbitInput
              label="E-Mail"
              value={form.email}
              onChange={(value) =>
                setForm({ ...form, email: value })
              }
            />

            <OrbitInput
              label="Telefon"
              value={form.phone}
              onChange={(value) =>
                setForm({ ...form, phone: value })
              }
            />
          </>
        )}

        {/* SOCIALS EDITOR */}
        {tab === "socials" && (
          <SocialsEditor
            value={form.socials}
            onChange={(value: any   ) =>
              setForm({ ...form, socials: value })
            }
          />
        )}

        {/* SIGNALS EDITOR */}
        {tab === "signals" && (
          <SignalsEditor
            value={form.signals}
            onChange={(value: any) =>
              setForm({ ...form, signals: value })
            }
          />
        )}

        {/* CEO */}
        {tab === "ceo" && (
          <>
            <OrbitInput
              label="CEO / Founder"
              value={form.ceo}
              onChange={(value) =>
                setForm({ ...form, ceo: value })
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
