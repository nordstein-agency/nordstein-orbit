"use client";

import { useState } from "react";
import  OrbitButton  from "@/components/orbit/OrbitButton";

export default function StartCourseButton({
  courseId,
  firstLessonId,
  redirectHref,
}: {
  courseId: string;
  firstLessonId: string;
  redirectHref: string;
}) {
  const [loading, setLoading] = useState(false);

  async function startCourse() {
    setLoading(true);

    await fetch("/api/course/start", {
      method: "POST",
      body: JSON.stringify({
        course_id: courseId,
        first_lesson_id: firstLessonId,
      }),
    });

    window.location.href = redirectHref;
  }

  return (
    <OrbitButton onClick={startCourse} disabled={loading} variant="primary">
      {loading ? "Starte..." : "Kurs starten"}
    </OrbitButton>
  );
}
