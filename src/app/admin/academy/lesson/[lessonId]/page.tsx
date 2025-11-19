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
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);


  const [showTextModal, setShowTextModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [savingBlock, setSavingBlock] = useState(false);

  const [showVideoModal, setShowVideoModal] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [savingVideo, setSavingVideo] = useState(false);


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

// QUIZ LADEN, falls Quiz-Block existiert
const quizExists = (blocksData || []).some((b: any) => b.block_type === "quiz");

if (quizExists) {
  const { data: qData } = await supabase
    .from("quiz_questions")
    .select(
      `id, question, position, quiz_answers (id, answer, is_correct)`
    )
    .eq("lesson_id", lessonId)
    .order("position");

  const mapped = qData?.map((q: any) => ({
    id: q.id,
    question: q.question,
    position: q.position,
    answers: q.quiz_answers.sort(
      (a: any, b: any) => a.position - b.position
    ),
  }));

  setQuizQuestions(mapped || []);
}

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

  const { data: highest } = await supabase
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

    // TEXT
    content: newText,

    // JSONB leer
    data: null,
  });

  setSavingBlock(false);
  setShowTextModal(false);
  setNewText("");

  router.refresh();
}



async function saveVideoBlock() {
  setSavingVideo(true);

  const { data: highest } = await supabase
    .from("lesson_blocks")
    .select("position")
    .eq("lesson_id", lessonId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPos = highest?.[0]?.position + 1 || 1;

  await supabase.from("lesson_blocks").insert({
    lesson_id: lessonId,
    block_type: "video",
    position: nextPos,

    // TEXT ist leer
    content: null,

    // JSONB speichert YouTube URL
    data: { youtube_url: newVideoUrl },
  });

  setSavingVideo(false);
  setShowVideoModal(false);
  setNewVideoUrl("");

  router.refresh();
}

function updateQuestionText(id: string, text: string) {
  setQuizQuestions(prev =>
    prev.map(q => q.id === id ? { ...q, question: text } : q)
  );
}

function updateAnswerText(qId: string, index: number, text: string) {
  setQuizQuestions(prev =>
    prev.map(q => {
      if (q.id !== qId) return q;
      const copy = [...q.answers];
      copy[index].answer = text;
      return { ...q, answers: copy };
    })
  );
}

function toggleCorrect(qId: string, index: number) {
  setQuizQuestions(prev =>
    prev.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        answers: q.answers.map((a: any, i: number) => ({
          ...a,
          is_correct: i === index,
        })),
      };
    })
  );
}

function addAnswer(qId: string) {
  setQuizQuestions(prev =>
    prev.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        answers: [
          ...q.answers,
          { answer: "Neue Antwort", is_correct: false, position: q.answers.length + 1 },
        ],
      };
    })
  );
}

function deleteAnswer(qId: string, ansId: string) {
  setQuizQuestions(prev =>
    prev.map(q =>
      q.id !== qId
        ? q
        : { ...q, answers: q.answers.filter((a: any) => a.id !== ansId) }
    )
  );

  supabase.from("quiz_answers").delete().eq("id", ansId);
}

async function addQuestion() {
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      lesson_id: lessonId,
      question: "Neue Frage",
      position: quizQuestions.length + 1,
    })
    .select("id")
    .limit(1);

  if (error) {
    console.error(error);
    alert("Fehler beim Erstellen der Frage: " + error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.error("Supabase hat die Frage erstellt, aber keine ID zurückgegeben.");
    return;
  }

  const newId = data[0].id;

  setQuizQuestions((prev) => [
    ...prev,
    {
      id: newId,
      question: "Neue Frage",
      position: prev.length + 1,
      answers: [
        { answer: "Antwort 1", is_correct: true, position: 1 },
        { answer: "Antwort 2", is_correct: false, position: 2 },
      ],
    },
  ]);
}


async function saveQuestion(qId: string) {
  const q = quizQuestions.find((x) => x.id === qId);

  await supabase
    .from("quiz_questions")
    .update({ question: q.question })
    .eq("id", qId);

  for (const ans of q.answers) {
    if (ans.id) {
      await supabase
        .from("quiz_answers")
        .update({
          answer: ans.answer,
          is_correct: ans.is_correct,
        })
        .eq("id", ans.id);
    } else {
      const { data, error } = await supabase
  .from("quiz_answers")
  .insert({
    question_id: qId,
    answer: ans.answer,
    is_correct: ans.is_correct,
  })
  .select("id")
  .maybeSingle();

if (error) {
  console.error("Insert Answer Error:", error);
  continue; // nächste Antwort speichern
}

if (!data) {
  console.warn("Supabase returned null for inserted answer — fetching manually");
  const { data: retry } = await supabase
    .from("quiz_answers")
    .select("id")
    .eq("question_id", qId)
    .eq("answer", ans.answer)
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (retry) ans.id = retry.id;
  continue;
}

ans.id = data.id;

    }
  }
}


async function saveQuizBlock() {
  if (blocks.some((b) => b.block_type === "quiz")) {
    alert("Es kann nur EIN Quiz pro Lesson geben.");
    return;
  }

  setSavingBlock(true);

  const { data: highest } = await supabase
    .from("lesson_blocks")
    .select("position")
    .eq("lesson_id", lessonId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPos = highest?.[0]?.position + 1 || 1;

  const { error } = await supabase.from("lesson_blocks").insert({
    lesson_id: lessonId,
    block_type: "quiz",
    position: nextPos,
    content: "Quiz",
    data: null,
  });

  setSavingBlock(false);

  if (error) {
    alert("Fehler: " + error.message);
    return;
  }

  await reloadBlocks(); // <-- wichtig
}


async function reloadBlocks() {
  const { data: blocksData } = await supabase
    .from("lesson_blocks")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("position");

  setBlocks(blocksData || []);
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
        <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">Inhalte der Lesson</h2>

        <div className="flex gap-2">
            <OrbitButton variant="secondary" onClick={() => setShowTextModal(true)}>
              + Textblock
            </OrbitButton>

            <OrbitButton variant="secondary" onClick={() => setShowVideoModal(true)}>
              + Video
            </OrbitButton>

            <OrbitButton
              variant="secondary"
              onClick={saveQuizBlock}
              disabled={blocks.some((b) => b.block_type === "quiz")}
            >
              + Quiz
            </OrbitButton>
        </div>

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

    <p className="font-semibold text-white mt-1">
      {block.block_type === "video" && "🎬 Video"}
      {block.block_type === "text" && "📝 Text"}
      {block.block_type === "quiz" && "🧠 Quiz"}
    </p>

    {/* TEXTBLOCK */}
    {block.block_type === "text" && (
      <p className="mt-2 text-gray-300">{block.content}</p>
    )}

    {/* VIDEOBLOCK */}
    {block.block_type === "video" && (
      <p className="mt-2 text-[#d8a5d0] text-xs">
        {block.data?.youtube_url}
      </p>
    )}

    {/* QUIZBLOCK */}
    {block.block_type === "quiz" && (
      <p className="mt-2 text-[#b244ff] text-xs">
        Quiz-Block – unten editierbar
      </p>
    )}
  </div>
))}

  </div>
)}

      </section>

      {/* QUIZ EDITOR */}
        {blocks.some((b) => b.block_type === "quiz") && (
          <section className="rounded-2xl border border-[#b244ff]/40 bg-black/40 p-6 space-y-6">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              🧠 Quiz dieser Lesson
            </h2>

            <OrbitButton variant="secondary" onClick={addQuestion}>
              + Frage hinzufügen
            </OrbitButton>

            {quizQuestions.length === 0 && (
              <p className="text-gray-400 text-sm">Noch keine Fragen vorhanden.</p>
            )}

            <div className="space-y-4">
              {quizQuestions.map((q, qi) => (
                <div key={q.id} className="border border-white/10 rounded-xl p-4 space-y-3 bg-black/60">
                  
                  {/* Frage */}
                  <input
                    className="w-full bg-black/40 border border-white/10 rounded-xl text-white p-3"
                    value={q.question}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                  />

                  {/* Antworten */}
                  <div className="space-y-2 text-white">
                    {q.answers.map((ans: any, ai: number) => (

                      <div
                        key={ans.id ?? `${q.id}-new-${ai}`}
                        className={`flex items-center gap-2 border rounded-xl p-2 ${
                          ans.is_correct ? "border-[#b244ff]" : "border-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCorrect(q.id, ai)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            ans.is_correct
                              ? "border-[#b244ff] bg-[#b244ff]"
                              : "border-white/20"
                          }`}
                        >
                          {ans.is_correct && "✓"}
                        </button>

                        <input
                          className="flex-1 bg-transparent outline-none"
                          value={ans.answer ?? ""}
                          onChange={(e) =>
                            updateAnswerText(q.id, ai, e.target.value)
                          }
                        />

                        <button
                          type="button"
                          className="text-red-400 text-xs"
                          onClick={() => deleteAnswer(q.id, ans.id)}
                        >
                          Löschen
                        </button>
                      </div>
                    ))}

                    <OrbitButton variant="secondary" onClick={() => addAnswer(q.id)}>
                      + Antwort hinzufügen
                    </OrbitButton>
                  </div>

                  <OrbitButton
                    variant="primary"
                    onClick={() => saveQuestion(q.id)}
                  >
                    Frage speichern
                  </OrbitButton>

                </div>
              ))}
            </div>
          </section>
        )}









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

      {showVideoModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-black/80 border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4">
      <h3 className="text-lg font-semibold">YouTube-Video hinzufügen</h3>

      <input
        type="text"
        placeholder="YouTube URL eingeben"
        className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-gray-200"
        value={newVideoUrl}
        onChange={(e) => setNewVideoUrl(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <OrbitButton variant="secondary" onClick={() => setShowVideoModal(false)}>
          Abbrechen
        </OrbitButton>

        <OrbitButton variant="primary" loading={savingVideo} onClick={saveVideoBlock}>
          Speichern
        </OrbitButton>
      </div>
    </div>
  </div>
)}


    </div>
  );
}
