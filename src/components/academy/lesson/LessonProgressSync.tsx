"use client";

import { useEffect } from "react";

export default function LessonProgressSync({ courseId, lessonId }: any) {
  useEffect(() => {
    fetch("/api/course/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: courseId,
        lesson_id: lessonId,
      }),
    });
  }, [courseId, lessonId]);

  return null;
}
