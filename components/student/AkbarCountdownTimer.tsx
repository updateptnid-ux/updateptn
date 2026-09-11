"use client";

import { useState, useEffect } from "react";
import { Timer, Sparkles } from "lucide-react";

interface AkbarCountdownTimerProps {
  targetDate?: string;
  title?: string;
}

export function AkbarCountdownTimer({
  targetDate = "2026-10-15T08:00:00+07:00",
  title = "Try Out Akbar UTBK-SNBT 2027",
}: AkbarCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 md:p-6 border border-blue-500/30 shadow-lg space-y-4 my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </span>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 block">
              EVENT NASIONAL UTBK
            </span>
            <h3 className="font-extrabold text-base md:text-lg text-white">{title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold w-fit">
          <Timer className="h-4 w-4 animate-spin" style={{ animationDuration: "8s" }} />
          <span>Waktu Pendaftaran Terbatas</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
        <div className="bg-blue-950/80 border border-blue-800/80 rounded-xl p-2 md:p-3">
          <span className="font-mono text-xl md:text-3xl font-black text-blue-400 block">
            {String(timeLeft.days).padStart(2, "0")}
          </span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Hari</span>
        </div>
        <div className="bg-blue-950/80 border border-blue-800/80 rounded-xl p-2 md:p-3">
          <span className="font-mono text-xl md:text-3xl font-black text-blue-400 block">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Jam</span>
        </div>
        <div className="bg-blue-950/80 border border-blue-800/80 rounded-xl p-2 md:p-3">
          <span className="font-mono text-xl md:text-3xl font-black text-blue-400 block">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Menit</span>
        </div>
        <div className="bg-blue-950/80 border border-blue-800/80 rounded-xl p-2 md:p-3">
          <span className="font-mono text-xl md:text-3xl font-black text-amber-400 block">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Detik</span>
        </div>
      </div>
    </div>
  );
}
