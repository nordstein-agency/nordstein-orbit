/*

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrbitButton from "@/components/orbit/OrbitButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/orbit/OrbitToast";

import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";

import SocialsEditor from "@/components/orbit/socials/SocialsEditor";
import SignalsEditor from "@/components/orbit/signals/SignalsEditor";

export default function NewLeadPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { addToast } = useToast();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Tabs
  const [tab, setTab] = useState("data");

  // Felder (leer)
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

  // User laden
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        addToast("Nicht eingeloggt", "error");
        router.push("/login");
        return;
      }

      setCurrentUserId(user.id);
    }

    load();
  }, []);

  // Speichern
  async function handleSave() {
    if (!currentUserId) return;

    const payload = {
      ...form,
      owner: currentUserId, // wichtig!
    };

    const { data, error } = await supabase
      .from("leads")
      .insert([payload])
      .select()
      .single();

    if (error) {
      addToast("Fehler beim Anlegen des Leads", "error");
      return;
    }

    addToast("Lead erfolgreich angelegt", "success");
    router.push(`/leads/${data.id}`);
  }

  return (
    <div className="pt-16 pl-12 pr-8 max-w-4xl space-y-10">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <OrbitButton
          onClick={() => router.back()}
          className="bg-white text-black hover:bg-white/80"
        >
          ← Zurück
        </OrbitButton>

        <OrbitButton
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-500"
        >
          Speichern
        </OrbitButton>
      </div>

      <h1 className="text-3xl text-white font-bold">Neuen Lead anlegen</h1>

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

      <div className="space-y-6">
        {tab === "data" && (
          <>
            <OrbitInput
              label="Unternehmen"
              value={form.company_name}
              onChange={(value) => setForm({ ...form, company_name: value })}
            />

            <OrbitInput
              label="Website"
              value={form.website}
              onChange={(value) => setForm({ ...form, website: value })}
            />

            <OrbitInput
              label="Branche"
              value={form.industry}
              onChange={(value) => setForm({ ...form, industry: value })}
            />

            <OrbitInput
              label="Region"
              value={form.region}
              onChange={(value) => setForm({ ...form, region: value })}
            />

            <OrbitInput
              label="Adresse"
              value={form.address}
              onChange={(value) => setForm({ ...form, address: value })}
            />
          </>
        )}

        {tab === "contact" && (
          <>
            <OrbitInput
              label="E-Mail"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
            />

            <OrbitInput
              label="Telefon"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />
          </>
        )}

        {tab === "socials" && (
          <SocialsEditor
            value={form.socials}
            onChange={(value: any) => setForm({ ...form, socials: value })}
          />
        )}

        {tab === "signals" && (
          <SignalsEditor
            value={form.signals}
            onChange={(value: any) => setForm({ ...form, signals: value })}
          />
        )}

        {tab === "ceo" && (
          <OrbitInput
            label="CEO / Founder"
            value={form.ceo}
            onChange={(value) => setForm({ ...form, ceo: value })}
          />
        )}
      </div>
    </div>
  );
}

*/

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrbitButton from "@/components/orbit/OrbitButton";
import { createSupabaseAuthClient } from "@/lib/supabase/authClient";
import { useToast } from "@/components/orbit/OrbitToast";
import OrbitInput from "@/components/orbit/OrbitInput";
import SocialsEditor from "@/components/orbit/socials/SocialsEditor";
import SignalsEditor from "@/components/orbit/signals/SignalsEditor";

export default function NewLeadPage() {
  const router = useRouter();
  const authClient = createSupabaseAuthClient();
  const { addToast } = useToast();

  const [ready, setReady] = useState(false);

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

  const [tab, setTab] = useState("data");

  // Auth prüfen
  useEffect(() => {
    async function check() {
      const { data } = await authClient.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setReady(true);
    }
    check();
  }, []);

  async function handleSave() {
    const res = await fetch("/api/orbit/create/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      addToast("Fehler beim Anlegen", "error");
      return;
    }

    const json = await res.json();
    addToast("Lead angelegt!", "success");
    router.push(`/leads/${json.id}`);
  }

  if (!ready) return null;

  return (
    <div className="pt-16 pl-12 pr-8 max-w-4xl space-y-10">
      
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <OrbitButton onClick={() => router.back()}>← Zurück</OrbitButton>
        <OrbitButton className="bg-green-600" onClick={handleSave}>
          Speichern
        </OrbitButton>
      </div>

      <h1 className="text-3xl text-white font-bold">Neuen Lead anlegen</h1>

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
            className={`pb-2 text-sm ${
              tab === key
                ? "text-white border-b-2 border-white"
                : "text-white/40 hover:text-white"
            }`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

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
            label="CEO"
            value={form.ceo}
            onChange={(v) => setForm({ ...form, ceo: v })}
          />
        )}
      </div>
    </div>
  );
}
