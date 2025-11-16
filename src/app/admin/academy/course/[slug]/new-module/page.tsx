"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import OrbitButton from "@/components/orbit/OrbitButton";
import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";

export default function NewModulePage({ params }: any) {
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<number>(1);

  // Kurs ID laden
  useEffect(() => {
    async function loadCourse() {
      const { data: course } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", params.slug)
        .single();

      if (course) setCourseId(course.id);

      // Maximale Position laden
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
  }, [params.slug]);

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
      router.push(`/admin/academy/course/${params.slug}`);
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 pt-20">

      {/* HEADER */}
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

      {/* FORM */}
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
