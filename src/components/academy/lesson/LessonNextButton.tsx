"use client";

import { useRouter } from "next/navigation";
import OrbitButton from "@/components/orbit/OrbitButton";

export default function LessonNextButton({
  lessonId,
  nextLessonId
}: {
  lessonId: string;
  nextLessonId: string;
}) {
  const router = useRouter();

  async function handleNext() {
    // 1) Lesson als abgeschlossen markieren
    await fetch("/api/lesson/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lessonId }),
    });

    // 2) Weiter navigieren
    router.push(`/academy/lesson/${nextLessonId}`);
  }

  return (
    <OrbitButton variant="primary" onClick={handleNext}>
      Weiter →
    </OrbitButton>
  );
}
