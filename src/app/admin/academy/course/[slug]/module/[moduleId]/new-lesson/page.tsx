"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";
import OrbitButton from "@/components/orbit/OrbitButton";

export default function NewLessonPage({ params }: { params: Promise<{ slug: string; moduleId: string }> }) {
  const router = useRouter();
  const { slug, moduleId } = use(params);

  const supabase = createSupabaseBrowserClient();


  const [moduleData, setModuleData] = useState<any>(null);
  const [position, setPosition] = useState(1);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modul + Position laden
  useEffect(() => {
    async function load() {
      // Modul laden
      const { data: mod } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId)
        .single();

      if (mod) setModuleData(mod);

      // Position berechnen
      const { data: lessons } = await supabase
        .from("lessons")
        .select("position")
        .eq("module_id", moduleId)
        .order("position", { ascending: false })
        .limit(1);

      if (lessons?.length) {
        setPosition(lessons[0].position + 1);
      }

      setLoading(false);
    }

    load();
  }, [moduleId]);

  async function createLesson(e: any) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("lessons").insert({
      module_id: moduleId,
      title,
      description,
      position,
    });

    setSaving(false);

    if (error) {
      alert("Fehler: " + error.message);
      return;
    }

    // zurück zum Modul
    router.push(`/admin/academy/course/${moduleData.slug}/module/${moduleId}`);
    router.refresh();
  }

  if (loading || !moduleData) {
  return (
    <div className="pt-24 text-center text-gray-400">
      Lade Modul…
    </div>
  );
}

return (
  <div className="max-w-2xl mx-auto pt-20 space-y-10">

    <header className="space-y-2">
      <a
        href={`/admin/academy/course/${slug}/module/${moduleId}`}
        className="text-xs text-[#d8a5d0] hover:underline"
      >
        ← Zurück zum Modul
      </a>

      <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase">
        Admin • Neue Lesson
      </p>

      <h1 className="text-3xl font-bold tracking-wide">
        Neue Lesson für "{moduleData.title}"
      </h1>

      <p className="text-sm text-gray-300">
        Erstelle eine neue Lesson in diesem Modul.
      </p>
    </header>

    {/* Rest unverändert */}


      <form className="space-y-6" onSubmit={createLesson}>
        <OrbitInput
          label="Lesson-Titel"
          value={title}
          onChange={setTitle}
          placeholder="z. B. Einführung in Instagram"
        />

        <OrbitTextarea
          label="Beschreibung"
          value={description}
          onChange={setDescription}
          rows={4}
          placeholder="Kurze Beschreibung der Lesson"
        />

        <OrbitInput
          label="Position im Modul"
          type="number"
          value={position.toString()}
          onChange={(v) => setPosition(Number(v))}
          placeholder="z. B. 1"
        />

        <OrbitButton
          type="submit"
          variant="primary"
          loading={saving}
          className="w-full py-3"
        >
          Lesson speichern
        </OrbitButton>
      </form>
    </div>
  );
}
