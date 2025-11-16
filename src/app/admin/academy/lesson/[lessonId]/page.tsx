"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import OrbitButton from "@/components/orbit/OrbitButton";
import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";

export default function LessonEditor({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  // ⬅ PARAMS korrekt entpacken (Next.js 16)
  const { lessonId } = use(params);

  const router = useRouter();
    const supabase = createSupabaseBrowserClient();


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [lesson, setLesson] = useState<any>(null);
  const [moduleData, setModuleData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<number>(1);

  const [blocks, setBlocks] = useState<any[]>([]);

  const [showTextModal, setShowTextModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [savingBlock, setSavingBlock] = useState(false);

  // -----------------------------
  // Daten laden
  // -----------------------------
  useEffect(() => {
    async function load() {
      // LESSON
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (!lessonData) {
        console.warn("Lesson NICHT gefunden:", lessonId);
        return;
      }

      setLesson(lessonData);
      setTitle(lessonData.title);
      setDescription(lessonData.description || "");
      setPosition(lessonData.position);

      // MODUL
      const { data: mod } = await supabase
        .from("modules")
        .select("*")
        .eq("id", lessonData.module_id)
        .single();

      setModuleData(mod);

      // COURSE
      const { data: course } = await supabase
        .from("courses")
        .select("*")
        .eq("id", mod.course_id)
        .single();

      setCourseData(course);

      // BLOCKS
      const { data: blocksData } = await supabase
        .from("lesson_blocks")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("position");

      setBlocks(blocksData || []);
      setLoading(false);
    }

    load();
  }, [lessonId]);

  // -----------------------------
  // SPEICHERN
  // -----------------------------
  async function saveLesson(e: any) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("lessons")
      .update({ title, description, position })
      .eq("id", lessonId);

    setSaving(false);

    if (error) {
      alert("Fehler: " + error.message);
      return;
    }

    alert("Lesson gespeichert!");
    router.refresh();
  }

  // -----------------------------
  // TEXTBLOCK SPEICHERN
  // -----------------------------
  async function saveTextBlock() {
    setSavingBlock(true);

    const { data: highest , error} = await supabase
      .from("lesson_blocks")
      .select("position")
      .eq("lesson_id", lessonId)
      .order("position", { ascending: false })
      .limit(1);

    const nextPos = highest?.[0]?.position + 1 || 1;

    await supabase.from("lesson_blocks").insert({
      lesson_id: lessonId,
      block_type: "text",
      position: nextPos,
      content: { text: newText },
    });

    setSavingBlock(false);
    setShowTextModal(false);

    router.refresh();
  }

  // -----------------------------
  // UI
  // -----------------------------
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
    <div className="max-w-4xl mx-auto pt-24 space-y-10">

      {/* Breadcrumb */}
      <a
        href={`/admin/academy/course/${courseData.slug}/module/${moduleData.id}`}
        className="text-xs text-[#d8a5d0] hover:underline"
      >
        ← Zurück zum Modul
      </a>

      {/* HEADER */}
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase">
          Admin • Orbit Lesson
        </p>

        <h1 className="text-3xl font-bold tracking-wide">{title}</h1>
        <p className="text-sm text-gray-300">
          Bearbeite die Inhalte dieser Lesson.
        </p>
      </header>

      {/* LESSON FORM */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-6">
        <h2 className="text-sm font-semibold text-white">Lesson-Einstellungen</h2>

        <form className="space-y-6" onSubmit={saveLesson}>
          <OrbitInput label="Lesson-Titel" value={title} onChange={setTitle} />

          <OrbitTextarea
            label="Beschreibung"
            value={description}
            onChange={setDescription}
            rows={4}
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

      {/* BLOCK EDITOR */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Inhalte der Lesson</h2>

          <OrbitButton variant="secondary" onClick={() => setShowTextModal(true)}>
            + Textblock
          </OrbitButton>
        </div>

        {blocks.length === 0 ? (
          <p className="text-sm text-gray-400">Noch keine Inhalte vorhanden.</p>
        ) : (
          <div className="space-y-4">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="p-4 rounded-xl bg-gradient-to-br from-[#1a0f17] via-black to-[#110811] border border-white/10 text-sm text-gray-300"
              >
                <p className="text-xs text-gray-400">Block #{block.position}</p>
                <p className="font-semibold text-white mt-1">{block.type}</p>
                <p className="mt-2 text-gray-300">{block.content?.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TEXTBLOCK MODAL */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/80 border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-semibold">Neuen Textblock hinzufügen</h3>

            <textarea
              className="w-full h-40 p-3 rounded-xl bg-black/40 border border-white/10 text-gray-200"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <OrbitButton variant="secondary" onClick={() => setShowTextModal(false)}>
                Abbrechen
              </OrbitButton>

              <OrbitButton variant="primary" loading={savingBlock} onClick={saveTextBlock}>
                Speichern
              </OrbitButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
