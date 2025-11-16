"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import OrbitButton from "@/components/orbit/OrbitButton";
import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";

export default function ModuleEditPage({ params }: { params: Promise<{ slug: string; moduleId: string }> }) {
  const router = useRouter();

  // ⬅️ PARAMS ENTPACKEN – MUSS SO SEIN!
  const { slug, moduleId } = use(params);

  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [moduleData, setModuleData] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<number>(1);

  const [lessons, setLessons] = useState<any[]>([]);

  // Modul & Lessons laden
  useEffect(() => {
    async function load() {
      const { data: mod } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId)
        .single();

      if (!mod) return;

      setModuleData(mod);
      setTitle(mod.title);
      setDescription(mod.description || "");
      setPosition(mod.position);

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", mod.id)
        .order("position");

      setLessons(lessonsData || []);
      setLoading(false);
    }

    load();
  }, [moduleId]);

  async function saveModule(e: any) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("modules")
      .update({
        title,
        description,
        position,
      })
      .eq("id", moduleId);

    setSaving(false);

    if (error) {
      alert("Fehler: " + error.message);
      return;
    }

    router.refresh();
    alert("Änderungen gespeichert!");
  }

  if (loading) {
  return (
    <div className="pt-32 flex flex-col items-center justify-center">
      <div
        className="
          relative w-24 h-24 
          animate-[orbit-spin_6s_linear_infinite] 
          flex items-center justify-center
        "
      >
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full blur-xl bg-[#b244ff]/30" />

        {/* Floating Logo */}
        <img
          src="/orbit.png"
          alt="Orbit Loading"
          className="
            w-16 h-16 
            animate-[orbit-float_3s_ease-in-out_infinite]
            drop-shadow-[0_0_15px_#b244ff]
          "
        />
      </div>

      
    </div>
  );
}

  return (
    <div className="max-w-3xl mx-auto pt-24 space-y-10">
      <header className="space-y-2">
        <a href={`/admin/academy/course/${slug}`} className="text-xs text-[#d8a5d0] hover:underline">
          ← Zurück zum Kurs
        </a>

        <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase">
          Admin • Orbit Modul
        </p>

        <h1 className="text-3xl font-bold tracking-wide">{title}</h1>

        <p className="text-sm text-gray-300">Bearbeite die Einstellungen dieses Moduls und verwalte die Lessons.</p>
      </header>

      {/* Modul bearbeiten */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-6">
        <h2 className="text-sm font-semibold text-white">Modul-Einstellungen</h2>

        <form className="space-y-6" onSubmit={saveModule}>
          <OrbitInput label="Modul-Titel" value={title} onChange={setTitle} placeholder="Titel eingeben" />

          <OrbitTextarea
            label="Beschreibung"
            value={description}
            onChange={setDescription}
            rows={4}
            placeholder="Kurze Erklärung des Moduls"
          />

          <OrbitInput
            label="Position"
            type="number"
            value={position.toString()}
            onChange={(v) => setPosition(Number(v))}
          />

          <OrbitButton type="submit" variant="primary" loading={saving} className="w-full">
            Änderungen speichern
          </OrbitButton>
        </form>
      </section>

      {/* LESSON LIST */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Orbit Lessons in diesem Modul</h2>

          <a href={`/admin/academy/course/${slug}/module/${moduleId}/new-lesson`}>
        <OrbitButton variant="primary" className="text-xs px-3 py-2">
            Neue Lesson
        </OrbitButton>
        </a>

        </div>

        {lessons.length === 0 ? (
          <p className="text-sm text-gray-400">Noch keine Lessons vorhanden.</p>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <a
                key={lesson.id}
                href={`/admin/academy/lesson/${lesson.id}`}
                className="block p-4 rounded-xl bg-gradient-to-br from-[#1a0f17] via-black to-[#110811] border border-white/10 hover:border-[#d8a5d0]/40 hover:shadow-[0_0_20px_#a7569244] transition"
              >
                <p className="text-xs text-gray-400 mb-1">Lesson {lesson.position}</p>
                <h3 className="text-sm font-semibold text-white">{lesson.title}</h3>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
