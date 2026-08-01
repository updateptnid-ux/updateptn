"use server";

import { createClient } from "@/lib/supabase/server";

export async function calculateProbabilityAction(payload: {
  score: number;
  universityName: string;
  prodiId: string | number;
}) {
  const { score, universityName: inputUnivName, prodiId } = payload;
  const supabase = await createClient();

  let passingGrade = 700;
  let majorName = "Program Studi PTN";
  let universityName = inputUnivName || "Universitas Indonesia";

  // Query prodi_reference from Supabase DB
  const { data: prodiRecord } = await supabase
    .from("prodi_reference")
    .select("*")
    .eq("id", prodiId)
    .single();

  if (prodiRecord) {
    passingGrade = Number(prodiRecord.passing_grade_est) || 700;
    majorName = `${prodiRecord.jenjang ? `${prodiRecord.jenjang} ` : ""}${prodiRecord.prodi}`;
    universityName = prodiRecord.univ;
  }

  // Prediction Algorithm Logic
  const diff = score - passingGrade;
  let percentage = 75;
  let status: "AMAN" | "BERSAING" | "RENTAN" = "BERSAING";
  let recommendation = "";

  if (diff >= 20) {
    status = "AMAN";
    percentage = Math.min(98, Math.round(85 + (diff - 20) * 0.4));
    recommendation = `Skor kamu (${score}) berada +${diff.toFixed(1)} poin di atas estimasi ketetatan (${passingGrade}). Peluang kelulusan kamu di ${majorName} - ${universityName} SANGAT TINGGI (Pilihan Sangat Aman)!`;
  } else if (diff >= 0) {
    status = "BERSAING";
    percentage = Math.round(60 + (diff / 20) * 24);
    recommendation = `Skor kamu (${score}) melampaui estimasi passing grade (${passingGrade}) sebesar +${diff.toFixed(1)} poin. Kamu berada di zona kompetisi aktif. Tingkatkan 15-20 poin di Try Out berikutnya agar makin mantap!`;
  } else {
    status = "RENTAN";
    percentage = Math.max(25, Math.round(60 + diff * 1.2));
    const gap = Math.abs(diff).toFixed(1);
    recommendation = `Skor kamu (${score}) masih berjarak ${gap} poin di bawah estimasi ketetatan (${passingGrade}). Disarankan untuk meningkatkan latihan subtes lemah atau mempertimbangkan jurusan ini di Pilihan 2.`;
  }

  return {
    success: true,
    score,
    passingGrade,
    diff,
    percentage,
    status,
    majorName,
    universityName,
    recommendation,
  };
}
