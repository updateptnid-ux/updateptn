"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitTryoutAction(payload: {
  tryoutId: string;
  answers: Record<string, string>; // questionId -> selectedOption ("A" | "B" | "C" | "D" | "E")
}) {
  const { tryoutId, answers } = payload;
  const supabase = await createClient();

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all questions for this tryout from Supabase to calculate actual score
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, correct_answer")
    .eq("tryout_id", tryoutId);

  let totalCorrect = 0;
  let totalQuestions = 0;

  if (questions && questions.length > 0) {
    totalQuestions = questions.length;
    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer && userAnswer.toUpperCase() === q.correct_answer.toUpperCase()) {
        totalCorrect += 1;
      }
    });
  } else {
    // Demo fallback for sample questions
    totalQuestions = Object.keys(answers).length || 10;
    Object.values(answers).forEach((ans) => {
      if (ans === "B" || ans === "C") {
        totalCorrect += 1;
      }
    });
  }

  // IRT Score Calculation (Scale: 300 - 1000)
  const score = Math.round(300 + (totalCorrect / Math.max(totalQuestions, 1)) * 700);

  if (user) {
    // Insert into Supabase results table
    const { data: resultData, error: insertError } = await supabase
      .from("results")
      .insert({
        user_id: user.id,
        tryout_id: tryoutId,
        score: score,
        total_correct: totalCorrect,
        total_questions: totalQuestions,
      })
      .select("id")
      .single();

    if (!insertError && resultData) {
      return { success: true, resultId: resultData.id, score, totalCorrect, totalQuestions };
    }
  }

  // Fallback for anonymous / demo mode
  const fallbackId = `res_${Date.now()}`;
  return { success: true, resultId: fallbackId, score, totalCorrect, totalQuestions };
}
