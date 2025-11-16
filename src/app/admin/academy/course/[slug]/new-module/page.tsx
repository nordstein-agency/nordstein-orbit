"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import OrbitButton from "@/components/orbit/OrbitButton";
import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";

export default function NewModulePage({ params }: { params: Promise<{ slug: string }> }) {
  // ❗ Next.js 16: params ist ein Promise → mit use() auflösen
  const { slug } = use(params);

  const router = useRouter();

  const supabase = createSupabaseBrowserClient();

  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<number>(1);

  // Kurs laden
  useEffect(() => {
    async function loadCourse() {
      // 1. Kurs-ID per Slug holen
      const { data: course } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", slug)
        .single();

      if (course) setCourseId(course.id);

      // 2. Letzte Position des Moduls holen
      const { data: modules } = await supabase
        .from("modules")
        .select("position")
        .eq("course_id", course?.id)
        .order("position", { ascending: false })
        .limit(1);

      if (modules?.length) {
        setPosition(modules[0].position + 1);
      }
    }

    loadCourse();
  }, [slug]); // <-- ❗ jetzt korrekt

  // Modul speichern
  async function createModule(e: any) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("modules").insert({
      title,
      description,
      position,
      course_id: courseId!,
    });

    setLoading(false);

    if (error) {
      alert("Fehler: " + error.message);
    } else {
      router.push(`/admin/academy/course/${slug}`);
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 pt-20">

      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase">
          Admin • Neues Orbit Modul
        </p>
        <h1 className="text-3xl font-bold tracking-wide">
          Neues Modul erstellen
        </h1>
        <p className="text-sm text-gray-300 max-w-md">
          Füge ein neues Modul zum Kurs hinzu.
        </p>
      </header>

      <form className="space-y-6" onSubmit={createModule}>

        <OrbitInput
          label="Modul-Titel"
          value={title}
          onChange={setTitle}
          placeholder="z. B. Grundlagen der Kundengewinnung"
        />

        <OrbitTextarea
          label="Beschreibung"
          value={description}
          onChange={setDescription}
          rows={4}
          placeholder="Kurze Beschreibung des Moduls..."
        />

        <OrbitInput
          label="Position im Kurs"
          type="number"
          value={position.toString()}
          onChange={(v) => setPosition(Number(v))}
          placeholder="z. B. 1"
        />

        <OrbitButton
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full py-3 text-center"
        >
          Modul speichern
        </OrbitButton>

      </form>
    </div>
  );
}
