"use client";

import { useState } from "react";
import StudentTryoutList from "@/components/StudentTryoutList";

interface Tryout {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  is_free: boolean;
  allow_free_claim?: boolean;
  mandiri_category?: string | null;
}

interface MandiriTryoutFilterProps {
  tryouts: Tryout[];
  userId: string;
  userName: string;
  userEmail: string;
  initialSubscription: any | null;
}

export default function MandiriTryoutFilter({
  tryouts,
  userId,
  userName,
  userEmail,
  initialSubscription,
}: MandiriTryoutFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");

  // Get unique categories present in the active tryouts list
  const categories = ["Semua", "SSU ITB", "SIMAK UI", "UM-CBT UGM", "Bela Negara UPN Jogja", "SMMPTN-Barat", "Lainnya"];

  // Filter tryouts based on selected category
  const filteredTryouts = tryouts.filter((to) => {
    if (activeCategory === "Semua") return true;
    if (activeCategory === "Lainnya") {
      return !to.mandiri_category || to.mandiri_category === "Lainnya";
    }
    return to.mandiri_category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => {
          const count = category === "Semua" 
            ? tryouts.length 
            : category === "Lainnya"
            ? tryouts.filter(to => !to.mandiri_category || to.mandiri_category === "Lainnya").length
            : tryouts.filter(to => to.mandiri_category === category).length;
          // Only show category if there are tryouts or if it's the "Semua" tab
          if (category !== "Semua" && count === 0) return null;

          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 ${
                activeCategory === category
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {category}
              <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full font-extrabold ${
                activeCategory === category
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredTryouts.length === 0 ? null : (
        <StudentTryoutList
          tryouts={filteredTryouts}
          userId={userId}
          userName={userName}
          userEmail={userEmail}
          initialSubscription={initialSubscription}
        />
      )}
    </div>
  );
}
