"use client";

import { CheckCircle2, ShieldCheck, Zap, Award, BarChart3, Video, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TryoutSnbtTools() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4 my-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-sm md:text-base text-slate-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            Fitur &amp; Tools Simulasi Try Out SNBT
          </h3>
          <p className="text-xs text-slate-500">Perbandingan dukung tools pada kategori gratis (Reguler) dan berbayar (Intensif)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fitur Gratis / Reguler */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">Try Out Reguler</span>
            <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Gratis</Badge>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Sistem Penilaian IRT Standard</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Kunci Jawaban &amp; Pembahasan Singkat</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Timer Subtes Real-time</span>
            </li>
          </ul>
        </div>

        {/* Fitur Berbayar / Intensif */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-blue-950 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Try Out Intensif
            </span>
            <Badge className="bg-blue-600 text-white font-bold text-[10px]">Berbayar / Premium</Badge>
          </div>
          <ul className="space-y-1.5 text-xs text-blue-900">
            <li className="flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold">Skor IRT Presisi &amp; Rekomendasi PTN</span>
            </li>
            <li className="flex items-center gap-2">
              <Video className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold">Pembahasan Teks Detail &amp; Video Pembahasan</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold">Simulasi Strict (Fitur Pause Dinonaktifkan)</span>
            </li>
            <li className="flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold">Sertifikat Hasil Simulasi &amp; Ranking Nasional</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
