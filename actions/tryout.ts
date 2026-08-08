"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitTryoutAction(payload: {
  tryoutId: string;
  answers: Record<string, string>; // questionId -> selectedOption ("A" | "B" | "C" | "D" | "E")
  questionTimeSpent?: Record<string, number>; // questionId -> seconds spent
}) {
  const { tryoutId, answers, questionTimeSpent = {} } = payload;
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

  // Jika tidak ada soal untuk try-out ini, jangan lanjutkan
  if (qError || !questions || questions.length === 0) {
    return { 
      success: false, 
      error: "Paket try-out ini belum memiliki soal. Silakan hubungi admin untuk melengkapi soal try-out ini terlebih dahulu." 
    };
  }

  let totalCorrect = 0;
  let totalQuestions = questions.length;
  let weightedScore = 0;
  let maxPossibleWeight = 0;
  
  const subtestScores: Record<string, { correct: number; total: number; weighted: number; maxWeight: number; irt_score: number }> = {};

  // Initialize subtestScores
  questions.forEach((q) => {
    const sub = q.subtest || "Lainnya";
    if (!subtestScores[sub]) {
      subtestScores[sub] = { correct: 0, total: 0, weighted: 0, maxWeight: 0, irt_score: 0 };
    }
    subtestScores[sub].total += 1;
  });

  // Calculate scores with IRT weighting
  const questionAnalytics: any[] = [];
  
  questions.forEach((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer && userAnswer.toUpperCase() === q.correct_answer.toUpperCase();
    const sub = q.subtest || "Lainnya";
    
    // Store analytics for this question
    questionAnalytics.push({
      question_id: q.id,
      user_answer: userAnswer || null,
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      time_spent_seconds: questionTimeSpent[q.id] || 0,
      skipped: !userAnswer,
      subtest: sub,
    });
    
    // IRT Parameters (with defaults if not set)
    const discrimination = q.irt_discrimination || 1.5; // Default: medium discrimination
    const difficulty = q.irt_difficulty || 0.0; // Default: medium difficulty
    
    // Weight calculation based on difficulty
    // Soal sulit (b > 0) dapat weight lebih tinggi
    const weight = 1.0 + (Math.max(difficulty, 0) * 0.3);
    
    maxPossibleWeight += weight;
    subtestScores[sub].maxWeight += weight;
    
    if (isCorrect) {
      totalCorrect += 1;
      weightedScore += weight;
      subtestScores[sub].correct += 1;
      subtestScores[sub].weighted += weight;
    }
  });

  // IRT Score Calculation (Scale: 200 - 1000)
  const weightedRatio = weightedScore / Math.max(maxPossibleWeight, 1);
  const irtScore = Math.round(200 + (weightedRatio * 800));

  // Calculate per-subtest IRT Score
  Object.keys(subtestScores).forEach(sub => {
    const s = subtestScores[sub];
    const subRatio = s.weighted / Math.max(s.maxWeight, 1);
    s.irt_score = Math.round(200 + (subRatio * 800));
  });

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
      subtest_scores: subtestScores,
      question_analytics: questionAnalytics, // Store detailed analytics
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
