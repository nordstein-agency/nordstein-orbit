"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import OrbitButton from "@/components/orbit/OrbitButton";

type QuizAnswer = {
  id: string;
  answer: string;
  is_correct: boolean;
};

type QuizQuestion = {
  id: string;
  question: string;
  position: number;
  quiz_answers: QuizAnswer[];
};

export default function OrbitQuizPlayer({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);

      const { data, error } = await supabase
        .from("quiz_questions")
        .select(
          `
            id,
            question,
            position,
            quiz_answers (
              id,
              answer,
              is_correct
            )
          `
        )
        .eq("lesson_id", lessonId)
        .order("position", { ascending: true });

      if (error) {
        console.error("Error loading quiz:", error);
        setQuestions([]);
        setLoading(false);
        return;
      }

      const sorted = (data || []).map((q) => ({
        ...q,
        quiz_answers: (q.quiz_answers || []).slice(), // ggf. sortieren, falls nötig
      }));

      setQuestions(sorted);
      setLoading(false);
    }

    loadQuiz();
  }, [lessonId, supabase]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  function handleRetry() {
  setCurrentIndex(0);
  setSelectedAnswerId(null);
  setHasAnswered(false);
  setIsCorrect(null);
}


  // Klick auf Antwort-Option
  function handleSelectAnswer(answerId: string) {
    if (hasAnswered) return; // nach dem Antworten keine Änderung mehr
    setSelectedAnswerId(answerId);
  }

  // Klick auf "Beantworten"
  function handleSubmit() {
    if (!currentQuestion || !selectedAnswerId) return;

    setSubmitting(true);

    const selected = currentQuestion.quiz_answers.find(
      (a) => a.id === selectedAnswerId
    );

    const correct = selected?.is_correct === true;
    setIsCorrect(correct);
    setHasAnswered(true);

    // Kleine künstliche Delay für niceres Feedback-Feeling
    setTimeout(() => {
      setSubmitting(false);
    }, 250);
  }

  // Klick auf "Weiter"
  function handleNext() {
    if (isLastQuestion) return;

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswerId(null);
    setHasAnswered(false);
    setIsCorrect(null);
  }

async function completeLesson() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // 1. Lesson Progress speichern
  await supabase
    .from("user_lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

  // 2. Lesson Info laden
  const { data: lessonInfo } = await supabase
    .from("lessons")
    .select("module_id")
    .eq("id", lessonId)
    .single();

  if (!lessonInfo) return; // <-- FIX

  // 3. Modul Info laden
  const { data: moduleInfo } = await supabase
    .from("modules")
    .select("course_id")
    .eq("id", lessonInfo.module_id)
    .single();

  if (!moduleInfo) return; // <-- FIX

  const courseId = moduleInfo.course_id;

  // 4. Alle Lessons im Modul laden
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", lessonInfo.module_id);

  if (!allLessons) return; // <-- FIX

  const lessonIds = allLessons.map((l) => l.id);

  // 5. Fortschritt des Users für alle Lessons laden
  const { data: progresses } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);

  // falls progress null → kein Abschluss möglich
  if (!progresses) return; // <-- FIX

  const allDone = lessonIds.every((l) =>
    progresses.some((p) => p.lesson_id === l && p.completed === true)
  );

  // 6. Wenn ALLE Lessons abgeschlossen → Course Progress speichern
  if (allDone) {
    await supabase
      .from("user_course_progress")
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          completed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id" }
      );
  }
}



  function handleBackToCourse() {
    // Wenn du eine explizite Route hast, kannst du hier z.B. router.push("/academy/...") machen
    router.back();
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16">
        <div
          className="
            relative w-24 h-24 
            animate-[orbit-spin_6s_linear_infinite] 
            flex items-center justify-center
          "
        >
          <div className="absolute inset-0 rounded-full blur-xl bg-[#b244ff]/30" />
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
        <p className="mt-4 text-sm text-gray-400">Quiz wird geladen…</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-gray-300">
        Kein Quiz für diese Lesson vorhanden.
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-[#b244ff]/40 bg-gradient-to-br from-[#0b0410] via-black to-[#150016] p-6 overflow-hidden">
      {/* Orbit Glow Background */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-32 -left-10 w-64 h-64 bg-[#b244ff]/40 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 right-0 w-72 h-72 bg-cyan-400/20 blur-3xl rounded-full" />
      </div>

      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase">
              Orbit • Quiz
            </p>
            <h2 className="text-xl font-semibold text-white mt-1">
              Frage {currentIndex + 1} von {questions.length}
            </h2>
          </div>

          {/* kleiner "Bubble"-Status */}
          {hasAnswered && isCorrect !== null && (
            <div
              className={`
                px-3 py-1 rounded-full text-xs font-medium
                border 
                ${
                  isCorrect
                    ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-200"
                    : "bg-red-500/10 border-red-400/60 text-red-200"
                }
                animate-[pulse_1.4s_ease-in-out]
              `}
            >
              {isCorrect ? "Richtig beantwortet" : "Falsche Antwort"}
            </div>
          )}
        </div>

        {/* Frage-Card */}
        <div
          className={`
            relative rounded-2xl border p-4 md:p-5 
            bg-black/50 backdrop-blur
            transition-all duration-300
            ${
              hasAnswered && isCorrect === false
                ? "border-red-500/60 shadow-[0_0_30px_rgba(248,113,113,0.35)]"
                : hasAnswered && isCorrect === true
                ? "border-emerald-400/70 shadow-[0_0_30px_rgba(52,211,153,0.35)]"
                : "border-white/10 shadow-[0_0_25px_rgba(178,68,255,0.15)]"
            }
          `}
        >
          <p className="text-sm text-[#d8a5d0]/80 font-semibold mb-2">
            Frage
          </p>
          <p className="text-base md:text-lg text-white leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* Antworten */}
        <div className="space-y-3">
          {currentQuestion.quiz_answers.map((ans) => {
            const isSelected = selectedAnswerId === ans.id;
            const isTheCorrectOne = ans.is_correct;

            // Visual Feedback nach dem Beantworten
            let stateClasses =
              "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30";
            if (hasAnswered) {
              if (isSelected && isTheCorrectOne) {
                stateClasses =
                  "border-emerald-400/80 bg-emerald-500/15 shadow-[0_0_25px_rgba(52,211,153,0.4)]";
              } else if (isSelected && !isTheCorrectOne) {
                stateClasses =
                  "border-red-500/80 bg-red-500/10 shadow-[0_0_25px_rgba(248,113,113,0.4)]";
              } else if (!isSelected && isTheCorrectOne) {
                stateClasses =
                  "border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.3)]";
              } else {
                stateClasses =
                  "border-white/10 bg-white/5 opacity-70";
              }
            } else if (isSelected) {
              stateClasses =
                "border-[#b244ff]/80 bg-[#b244ff]/15 shadow-[0_0_25px_rgba(178,68,255,0.6)]";
            }

            return (
              <button
                key={ans.id}
                type="button"
                onClick={() => handleSelectAnswer(ans.id)}
                className={`
                  w-full text-left rounded-2xl px-4 py-3 text-sm md:text-base
                  transition-all duration-200
                  flex items-start gap-3
                  ${stateClasses}
                  ${hasAnswered ? "cursor-default" : "cursor-pointer"}
                `}
              >
                <span
                  className={`
                    mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                    border 
                    ${
                      isSelected
                        ? "border-[#b244ff] bg-[#b244ff]/30 text-white"
                        : "border-white/25 text-[#d8a5d0]"
                    }
                  `}
                >
                  {String.fromCharCode(
                    "A".charCodeAt(0) +
                      currentQuestion.quiz_answers.indexOf(ans)
                  )}
                </span>
                <span className="flex-1 text-gray-100">{ans.answer}</span>
              </button>
            );
          })}
        </div>

        {/* Buttons unten */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t border-white/10 mt-2">
          <div className="flex gap-2">



            {!hasAnswered ? (
                // → Noch nicht beantwortet
                <OrbitButton
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!selectedAnswerId || submitting}
                    loading={submitting}
                >
                    Beantworten
                </OrbitButton>
                ) : isCorrect ? (
                // → RICHTIG BEANTWORTET
                <OrbitButton
                    variant="primary"
                    onClick={
                    isLastQuestion
                        ? async () => {
                            await completeLesson(); // ⭐ Lesson/Fortschritt speichern
                            handleBackToCourse();
                        }
                        : handleNext
                    }
                >
                    {isLastQuestion ? "Quiz abschließen" : "Weiter"}
                </OrbitButton>
                ) : (
                // → FALSCH BEANTWORTET → Quiz von vorne
                <OrbitButton
                    variant="secondary"
                    onClick={handleRetry}
                >
                    Nochmal versuchen
                </OrbitButton>
                )}




          </div>

          <button
            type="button"
            onClick={handleBackToCourse}
            className="text-xs md:text-sm text-gray-400 hover:text-gray-200 transition-colors underline-offset-4 hover:underline"
          >
            Zurück zum Kurs
          </button>
        </div>
      </div>
    </div>
  );
}
