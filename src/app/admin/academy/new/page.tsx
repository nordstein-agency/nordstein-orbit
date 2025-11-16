"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
//import { createClient } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import OrbitButton from "@/components/orbit/OrbitButton";
import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";
import {OrbitDropdown} from "@/components/orbit/OrbitDropdown";

export default function NewCoursePage() {
  const router = useRouter();

  // Supabase (Client)
  /*
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );*/

    const supabase = createSupabaseBrowserClient();

  // State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [levelRequired, setLevelRequired] = useState("entry");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  async function createCourse(e: any) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("courses").insert({
      title,
      slug,
      description,
      level_required: levelRequired,
      est_duration: duration ? Number(duration) : null,
    });

    setLoading(false);

    if (error) {
      alert("Fehler: " + error.message);
    } else {
      router.push("/admin/academy");
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 pt-10">
      {/* HEADER */}
      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase">
          Admin • Neuer Kurs
        </p>
        <h1 className="text-3xl font-bold tracking-wide">Neuen Kurs erstellen</h1>
        <p className="text-sm text-gray-300 max-w-md">
          Lege hier einen neuen Kurs an – Module und Lektionen fügen wir später hinzu.
        </p>
      </header>

      {/* FORM */}
      <form className="space-y-6" onSubmit={createCourse}>
        
        <OrbitInput
          label="Kurs-Titel"
          value={title}
          onChange={setTitle}
          placeholder="z. B. Recruiting Basics"
        />

        <OrbitInput
          label="Slug (URL)"
          value={slug}
          onChange={setSlug}
          placeholder="z. B. recruiting-basics"
        />

        <OrbitTextarea
          label="Kurze Beschreibung"
          value={description}
          onChange={setDescription}
          rows={5}
          placeholder="Kurze Info zum Kurs..."
        />

        <div className="flex flex-col gap-1">
        <label className="text-white/70 text-sm">Zugriff-Level</label>

        <OrbitDropdown
            value={levelRequired}
            onChange={setLevelRequired}
            placeholder="Level wählen"
            options={[
            { label: "Entry (für alle)", value: "entry" },
            { label: "Growth (ab Trainee II)", value: "growth" },
            { label: "Leader (ab Consultant)", value: "leader" },
            ]}
        />
        </div>


        <OrbitInput
          label="Geschätzte Dauer (Minuten)"
          type="number"
          value={duration}
          onChange={setDuration}
          placeholder="z. B. 30"
        />

        <OrbitButton
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full py-3 text-center"
        >
          Kurs speichern
        </OrbitButton>
      </form>
    </div>
  );
}
