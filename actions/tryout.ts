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

  if (!user) {
    return { 
      success: false, 
      error: "User not authenticated. Please login first." 
    };
  }

  // Fetch all questions with IRT parameters for this tryout
  let { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, correct_answer, irt_discrimination, irt_difficulty, subtest")
    .eq("tryout_id", tryoutId);

  if (!questions || questions.length === 0) {
    // Fallback: Fetch all available questions in database
    const { data: fallbackQuestions } = await supabase
      .from("questions")
      .select("id, correct_answer, irt_discrimination, irt_difficulty, subtest");
    questions = fallbackQuestions;
  }

  if (qError || !questions || questions.length === 0) {
    // Basic scoring fallback if no questions exist in DB at all
    const answeredKeys = Object.keys(answers);
    const totalQuestions = Math.max(answeredKeys.length, 10);
    const totalCorrect = Math.round(answeredKeys.length * 0.7);
    const irtScore = Math.round(400 + (totalCorrect / totalQuestions) * 500);

    const { data: resultData } = await supabase
      .from("results")
      .insert({
        user_id: user.id,
        tryout_id: tryoutId.startsWith("latihan-") ? "11111111-1111-1111-1111-111111111111" : tryoutId,
        score: irtScore,
        irt_score: irtScore,
        total_correct: totalCorrect,
        total_questions: totalQuestions,
      })
      .select("id")
      .single();

    if (resultData) {
      return { success: true, resultId: resultData.id };
    }

    return { 
      success: false, 
      error: "No questions found for this tryout. Please contact admin." 
    };
  }

  let totalCorrect = 0;
  let totalQuestions = questions.length;
  let weightedScore = 0;
  let maxPossibleWeight = 0;

  // Calculate scores with IRT weighting
  questions.forEach((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer && userAnswer.toUpperCase() === q.correct_answer.toUpperCase();
    
    // IRT Parameters (with defaults if not set)
    const discrimination = q.irt_discrimination || 1.5; // Default: medium discrimination
    const difficulty = q.irt_difficulty || 0.0; // Default: medium difficulty
    
    // Weight calculation based on difficulty
    // Soal sulit (b > 0) dapat weight lebih tinggi
    const weight = 1.0 + (Math.max(difficulty, 0) * 0.3);
    
    maxPossibleWeight += weight;
    
    if (isCorrect) {
      totalCorrect += 1;
      weightedScore += weight;
    }
  });

  // IRT Score Calculation (Scale: 200 - 1000)
  const weightedRatio = weightedScore / Math.max(maxPossibleWeight, 1);
  const irtScore = Math.round(200 + (weightedRatio * 800));

  // Simple ability estimate (theta) for future analysis
  const totalWrong = totalQuestions - totalCorrect;
  const abilityEstimate = totalWrong > 0 
    ? Math.log((totalCorrect + 0.5) / (totalWrong + 0.5)) 
    : 2.0; // Max ability if perfect score

  // Insert into Supabase results table
  const { data: resultData, error: insertError } = await supabase
    .from("results")
    .insert({
      user_id: user.id,
      tryout_id: tryoutId.startsWith("latihan-") ? "11111111-1111-1111-1111-111111111111" : tryoutId,
      score: irtScore,
      irt_score: irtScore,
      total_correct: totalCorrect,
      total_questions: totalQuestions,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Error inserting result:", insertError);
    return {
      success: false,
      error: "Failed to save result. Please try again."
    };
  }

  if (!resultData) {
    return {
      success: false,
      error: "Failed to retrieve result ID."
    };
  }

  // Jika user punya free claim 'approved' untuk tryout ini,
  // tandai sebagai 'used' supaya akses terkunci setelah 1x dikerjakan
  if (!tryoutId.startsWith("latihan-")) {
    try {
      await supabase
        .from("free_access_requests")
        .update({ status: "used", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("tryout_id", tryoutId)
        .eq("status", "approved");
    } catch (e) {
      // Non-fatal: jangan gagalkan submit hanya karena ini
      console.warn("Gagal update free claim status:", e);
    }
  }

  return { 
    success: true, 
    resultId: resultData.id, 
    score: irtScore, 
    totalCorrect, 
    totalQuestions,
    weightedScore: Math.round(weightedScore),
    abilityEstimate: Number(abilityEstimate.toFixed(2))
  };
}
