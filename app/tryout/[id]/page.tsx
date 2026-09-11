"use client";

import { useState, useEffect, useTransition } from "react";
import { use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitTryoutAction } from "@/actions/tryout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  FileCheck2,
  Search,
  Target,
  BookOpen,
  CheckCircle2,
  GripVertical,
  Shuffle,
  Lock,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";

interface ProdiItem {
  id: string | number;
  univ: string;
  prodi: string;
  jenjang?: string;
  kelompok?: string;
  passing_grade_est?: number;
}

interface QuestionItem {
  id: string;
  tryout_id?: string;
  subtest: string;
  question_text?: string;
  text?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
}

export default function TryoutEnginePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tryoutId = resolvedParams.id;
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<Record<string, number>>({});
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Per-subtest state
  const [activeSubtestIndex, setActiveSubtestIndex] = useState<number>(0);
  const [showSubtestBreak, setShowSubtestBreak] = useState<boolean>(false);

  // Target Jurusan Picker state (4 Prodi & Smart Verdict)
  const [showTargetPicker, setShowTargetPicker] = useState<boolean>(false);
  const [allProdiData, setAllProdiData] = useState<ProdiItem[]>([]); // full local dataset, loaded once
  const [prodiSearch, setProdiSearch] = useState("");
  const [prodiList, setProdiList] = useState<ProdiItem[]>([]);
  const [activeTargetSlot, setActiveTargetSlot] = useState<number>(0);
  const [targets, setTargets] = useState<(ProdiItem | null)[]>([null, null, null, null]);
  const [selectedPtn, setSelectedPtn] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
  const [selectedPg, setSelectedPg] = useState<number>(695);
  const [targetConfirmed, setTargetConfirmed] = useState(false);
  const [accessDenied, setAccessDenied] = useState<{ isDenied: boolean; reason: string; requiresUpgrade: boolean; resultId?: string }>({ isDenied: false, reason: "", requiresUpgrade: false });
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Subtest Picker state
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [showSubtestPicker, setShowSubtestPicker] = useState<boolean>(false);
  const [subtestList, setSubtestList] = useState<{name: string, count: number, category: string, duration: number}[]>([]);

  // Helper to normalize question objects
  const normalizeQuestions = (data: any[]): QuestionItem[] => {
    return data.map((q, idx) => ({
      ...q,
      id: q.id || `q-${idx + 1}`,
      question_text: q.text || q.question_text || "Teks soal tidak tersedia.",
      text: q.text || q.question_text || "Teks soal tidak tersedia.",
    }));
  };

  // Fetch Questions from Supabase or Fallback JSON
  useEffect(() => {
    async function loadQuestions() {
      let tryoutInfo: any = null;
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Cek autentikasi
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/login?redirect=/tryout/${tryoutId}`);
          return;
        }

        // Pre-populate Pilihan 1 with saved profile target (can be changed by user)
        const meta = user.user_metadata as Record<string, string> | undefined;
        const defaultUniv = meta?.target_univ || meta?.target_ptn || "";
        const defaultProdi = meta?.target_prodi || "";

        if (defaultUniv || defaultProdi) {
          // Lookup actual passing_grade_est from data_snbt.json
          let profilePg = 650; // fallback default
          try {
            const pgRes = await fetch("/data_snbt.json");
            if (pgRes.ok) {
              const pgData: any[] = await pgRes.json();
              const uNorm = defaultUniv.toUpperCase().trim();
              const pNorm = defaultProdi.toUpperCase().trim();
              const match = pgData.find(
                (x) =>
                  (x.univ || "").toUpperCase().includes(uNorm) ||
                  (x.prodi || "").toUpperCase().includes(pNorm)
              );
              if (match?.passing_grade_est) {
                profilePg = Number(match.passing_grade_est);
              }
            }
          } catch {
            // silently fall back to 650
          }

          setTargets((prev) => {
            const copy = [...prev];
            if (!copy[0]) {
              copy[0] = {
                id: "profile-target",
                univ: defaultUniv || "UNIVERSITAS INDONESIA",
                prodi: defaultProdi || "S1 Ilmu Komputer",
                passing_grade_est: profilePg,
              };
            }
            return copy;
          });
        }

        const [{ data: subsData }, { data: profileData }] = await Promise.all([
          supabase.from("subscriptions").select("tier").eq("user_id", user.id).maybeSingle(),
          supabase.from("profiles").select("role, is_marketing, free_access").eq("id", user.id).maybeSingle()
        ]);
        const isMarketing = Boolean(profileData?.is_marketing || profileData?.free_access);
        const isPremium = isMarketing || subsData?.tier === "Premium" || subsData?.tier === "Platinum";
        setIsPremiumUser(isPremium);

        if (!tryoutId.startsWith("latihan-")) {
          const { data: tInfo } = await supabase.from("tryouts").select("tryout_type, mandiri_category").eq("id", tryoutId).maybeSingle();
          tryoutInfo = tInfo;
        }

        // Limit Check (hanya untuk try out asli, bukan latihan subtes)
        if (!tryoutId.startsWith("latihan-") && !isMarketing) {
          const { data: resultsData } = await supabase.from("results").select("id").eq("user_id", user.id).eq("tryout_id", tryoutId);

          const attempts = resultsData?.length || 0;
          const maxAttempts = isPremium ? 3 : 1;

          if (attempts >= maxAttempts) {
            setAccessDenied({
              isDenied: true,
              reason: `Kamu sudah mencapai batas pengerjaan Try Out ini (${maxAttempts} kali).`,
              requiresUpgrade: !isPremium,
              resultId: resultsData?.[0]?.id
            });
            setLoading(false);
            return;
          }
        }

        let dbData: any[] | null = null;

        if (tryoutId.startsWith("latihan-")) {
          const categorySlug = tryoutId.replace("latihan-", "");
          const slugToName: Record<string, string> = {
            "penalaran-umum": "Penalaran Umum",
            "pengetahuan-kuantitatif": "Pengetahuan Kuantitatif",
            "literasi-indonesia": "Literasi B. Indonesia",
            "literasi-inggris": "Literasi B. Inggris",
            "penalaran-matematika": "Penalaran Matematika"
          };
          const subtestName = slugToName[categorySlug] || "Penalaran Umum";

          const { data } = await supabase
            .from("questions")
            .select("*");

          if (data && data.length > 0) {
            const matched = data.filter((q: any) => 
              (q.subtest || "").toLowerCase().includes(subtestName.toLowerCase()) || 
              (q.text || q.question_text || "").toLowerCase().includes(subtestName.toLowerCase())
            );
            
            if (matched.length > 0) {
              dbData = [...matched].sort(() => 0.5 - Math.random()).slice(0, 15);
            } else {
              dbData = [...data].sort(() => 0.5 - Math.random()).slice(0, 15);
            }
          }
        } else {
          const { data } = await supabase
            .from("questions")
            .select("*")
            .eq("tryout_id", tryoutId)
            .order("id");
          dbData = data;

          // Jika tidak ada soal untuk try-out ini, tampilkan error
          if (!dbData || dbData.length === 0) {
            setAccessDenied({
              isDenied: true,
              reason: "Paket try-out ini belum memiliki soal. Silakan hubungi admin untuk melengkapi soal try-out ini terlebih dahulu.",
              requiresUpgrade: false
            });
            setLoading(false);
            return;
          }
        }

        if (dbData && dbData.length > 0) {
          const finalQs = normalizeQuestions(dbData);
          setQuestions(finalQs);
          extractSubtests(finalQs, tryoutInfo);
        } else {
          // Fallback to local /40_soal_snbt.json
          try {
            const res = await fetch("/40_soal_snbt.json");
            if (res.ok) {
              const localJson = await res.json();
              if (localJson && localJson.length > 0) {
                const finalQs = normalizeQuestions(localJson);
                setQuestions(finalQs);
                extractSubtests(finalQs, tryoutInfo);
              } else {
                setQuestions([]);
              }
            }
          } catch (jsonErr) {
            console.error("Error loading JSON fallback:", jsonErr);
            setQuestions([]);
          }
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        // Try JSON fallback on error
        try {
          const res = await fetch("/40_soal_snbt.json");
          if (res.ok) {
            const localJson = await res.json();
            const finalQs = normalizeQuestions(localJson);
            setQuestions(finalQs);
            extractSubtests(finalQs, tryoutInfo);
          }
        } catch {
          setQuestions([]);
        }
      } finally {
        setLoading(false);
      }
    }

    const extractSubtests = (qs: QuestionItem[], tInfo?: any) => {
      const map = new Map<string, number>();
      qs.forEach(q => {
        const sub = q.subtest || "Lainnya";
        map.set(sub, (map.get(sub) || 0) + 1);
      });
      
      const getCategoryAndDuration = (name: string) => {
        const n = name.toLowerCase();
        
        // 1. Check if this is a Mandiri tryout and apply specific rules
        if (tInfo?.tryout_type === "mandiri") {
          const category = tInfo.mandiri_category || "";
          
          if (category === "SIMAK UI") {
            // SIMAK UI
            if (n.includes("verbal")) return { category: "Kemampuan Skolastik", duration: 25 }; // estimasi
            if (n.includes("kuantitatif")) return { category: "Kemampuan Skolastik", duration: 35 }; // estimasi
            if (n.includes("logika")) return { category: "Kemampuan Skolastik", duration: 25 }; // estimasi
            if (n.includes("matematika dasar")) return { category: "Kemampuan Dasar", duration: 40 }; // total kem. dasar 45 soal 35 menit
            if (n.includes("indonesia")) return { category: "Kemampuan Dasar", duration: 25 };
            if (n.includes("inggris")) return { category: "Kemampuan Dasar", duration: 25 };
          }
          
          if (category === "SSU ITB") {
            // SSU ITB
            if (n.includes("matematika")) return { category: "Matematika", duration: 50 };
            if (n.includes("fisika")) return { category: "Fisika", duration: 50 };
            if (n.includes("kognitif")) return { category: "Tes Potensi Kognitif", duration: 50 };
          }
          
          if (category === "UM-CBT UGM") {
            // UM UGM
            if (n.includes("tka") || n.includes("akademik")) return { category: "Tes Kemampuan Akademik (TKA)", duration: 60 };
            if (n.includes("tpa") || n.includes("potensi akademik")) return { category: "Tes Potensi Akademik (TPA)", duration: 60 };
            if (n.includes("matematika dasar")) return { category: "Kemampuan Dasar (TKDU)", duration: 20 };
            if (n.includes("indonesia")) return { category: "Kemampuan Dasar (TKDU)", duration: 20 };
            if (n.includes("inggris")) return { category: "Kemampuan Dasar (TKDU)", duration: 20 };
          }
          
          if (category === "Bela Negara UPN Jogja") {
            // UPN Jogja
            if (n.includes("pancasila")) return { category: "Komponen Kebangsaan & Negara", duration: 12 };
            if (n.includes("kewarganegaraan")) return { category: "Komponen Kebangsaan & Negara", duration: 12 };
            if (n.includes("bela negara")) return { category: "Komponen Kebangsaan & Negara", duration: 13 };
            if (n.includes("sejarah kebangsaan")) return { category: "Komponen Kebangsaan & Negara", duration: 13 };
            if (n.includes("matematika") || n.includes("kognitif") || n.includes("skolastik")) return { category: "Komponen Kognitif & Skolastik", duration: 50 };
          }
          
          if (category === "SMMPTN-Barat") {
            // SMMPTN-Barat
            if (n.includes("penalaran umum")) return { category: "Tes Potensi Skolastik (TPS)", duration: 30 };
            if (n.includes("pemahaman umum")) return { category: "Tes Potensi Skolastik (TPS)", duration: 25 };
            if (n.includes("bacaan dan menulis")) return { category: "Tes Potensi Skolastik (TPS)", duration: 25 };
            if (n.includes("kuantitatif")) return { category: "Tes Potensi Skolastik (TPS)", duration: 25 };
            if (n.includes("indonesia")) return { category: "Tes Literasi & Penalaran Matematika", duration: 30 };
            if (n.includes("inggris")) return { category: "Tes Literasi & Penalaran Matematika", duration: 30 };
            if (n.includes("matematika")) return { category: "Tes Literasi & Penalaran Matematika", duration: 30 };
          }
        }

        // Default SNBT mapping
        if (n.includes("penalaran umum")) return { category: "Tes Potensi Skolastik (TPS)", duration: 30 };
        if (n.includes("pemahaman umum")) return { category: "Tes Potensi Skolastik (TPS)", duration: 15 };
        if (n.includes("bacaan dan menulis")) return { category: "Tes Potensi Skolastik (TPS)", duration: 25 };
        if (n.includes("kuantitatif")) return { category: "Tes Potensi Skolastik (TPS)", duration: 20 };
        if (n.includes("literasi") && n.includes("indonesia")) return { category: "Tes Literasi", duration: 45 };
        if (n.includes("literasi") && n.includes("inggris")) return { category: "Tes Literasi", duration: 30 };
        if (n.includes("penalaran matematika") || n.includes("matematika")) return { category: "Tes Literasi", duration: 30 };
        return { category: "Lainnya", duration: 0 };
      };

      const list = Array.from(map.entries()).map(([name, count]) => {
        const { category, duration } = getCategoryAndDuration(name);
        return { name, count, category, duration };
      });
      
      // Sort initially by standard order
      const standardOrder = ["Penalaran Umum", "Pengetahuan dan Pemahaman Umum", "Kemampuan Memahami Bacaan dan Menulis", "Pengetahuan Kuantitatif", "Literasi dalam Bahasa Indonesia", "Literasi dalam Bahasa Inggris", "Penalaran Matematika"];
      list.sort((a, b) => {
        const idxA = standardOrder.findIndex(s => a.name.toLowerCase().includes(s.toLowerCase()));
        const idxB = standardOrder.findIndex(s => b.name.toLowerCase().includes(s.toLowerCase()));
        return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
      });
      
      setSubtestList(list);
    };

    loadQuestions();
  }, [tryoutId]);

  // Load full prodi dataset once (client-side, no RPC limit)
  useEffect(() => {
    if (allProdiData.length > 0) return;
    fetch("/data_snbt.json")
      .then((r) => r.json())
      .then((data: any[]) => setAllProdiData(data))
      .catch(() => {});
  }, []);

  // Client-side full-text search — detects all data, zero network calls
  useEffect(() => {
    const q = prodiSearch.trim().toLowerCase();
    if (q.length < 2) {
      setProdiList([]);
      return;
    }
    const filtered = allProdiData
      .filter(
        (p) =>
          (p.univ || "").toLowerCase().includes(q) ||
          (p.prodi || "").toLowerCase().includes(q)
      )
      .slice(0, 50);
    setProdiList(filtered);
  }, [prodiSearch, allProdiData]);

  const filteredProdi = prodiList;

  // Smart Verdict Analysis Logic
  const getSmartVerdict = () => {
    const activeTargets = targets
      .map((t, idx) => ({ ...t, slot: idx + 1 }))
      .filter((t): t is (ProdiItem & { slot: number }) => t !== null && !!t.prodi);

    if (activeTargets.length === 0) {
      return {
        status: "EMPTY",
        badge: "Belum Memilih Target",
        badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
        warnings: [],
        summary: "Pilih minimal 1 target prodi untuk melihat Smart Verdict strategi kamu.",
      };
    }

    const warnings: string[] = [];
    let hasOrderError = false;

    for (let i = 0; i < activeTargets.length - 1; i++) {
      const current = activeTargets[i];
      const next = activeTargets[i + 1];
      const currentPg = Number(current.passing_grade_est || 650);
      const nextPg = Number(next.passing_grade_est || 650);

      if (nextPg > currentPg) {
        hasOrderError = true;
        warnings.push(
          `Pilihan ${next.slot} (${next.prodi} — PG ${nextPg}) LEBIH TINGGI daripada Pilihan ${current.slot} (${current.prodi} — PG ${currentPg}). Di sistem SNBT, tempatkan prodi terketat/tertinggi di Pilihan 1!`
        );
      }
    }

    if (hasOrderError) {
      return {
        status: "BAD_ORDER",
        badge: "🛑 STRATEGI URUTAN TIDAK IDEAL",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
        warnings,
        summary: "Urutan pilihan jurusan berisiko gugur di sistem SNBT! Dalam aturan resmi SNBT, pilihan diurutkan dari passing grade terketat (berisiko) di Pilihan 1 ke yang lebih aman di pilihan berikutnya.",
      };
    }

    const highestPg = Number(activeTargets[0]?.passing_grade_est || 650);
    if (highestPg >= 710 && activeTargets.length === 1) {
      return {
        status: "HIGH_RISK",
        badge: "🟡 KEKETATAN TINGGI (TAMBAHKAN CADANGAN AMAN)",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        warnings: ["Disarankan menambahkan Pilihan 2, 3, atau 4 dengan passing grade lebih rendah sebagai cadangan aman."],
        summary: "Pilihan 1 sangat kompetitif. Pertimbangkan untuk melengkapi Pilihan 2 - 4 sebagai cadangan.",
      };
    }

    return {
      status: "IDEAL",
      badge: "🟢 STRATEGI OPTIMAL & RASIONAL",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      warnings: [],
      summary: "Urutan 4 pilihan prodi kamu sudah terstruktur dengan baik! Bergradasi dari yang terketat di Pilihan 1 hingga pilihan yang lebih aman.",
    };
  };

  // Show target picker after loading finishes — per-tryout key so each tryout has its own selection
  useEffect(() => {
    if (!loading && !accessDenied.isDenied) {
      if (tryoutId.startsWith("latihan-")) {
        setTargetConfirmed(true);
        setShowTargetPicker(false);
        setShowSubtestPicker(false);
        return;
      }

      // Key is per-tryoutId so each tryout stores independently
      const perKey = `tryout_targets_${tryoutId}`;
      const savedTargetsStr = localStorage.getItem(perKey);

      if (savedTargetsStr) {
        try {
          const parsed = JSON.parse(savedTargetsStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTargets(parsed);
            const p1 = parsed.find((t: ProdiItem | null) => t !== null);
            if (p1) {
              setSelectedPtn(p1.univ);
              setSelectedProdi(p1.prodi);
              setSelectedPg(Number(p1.passing_grade_est || 695));
            }
            // Even when targets are saved, show picker so user can review/adjust
            setShowTargetPicker(true);
            return;
          }
        } catch (e) {
          console.warn("Failed to parse saved tryout targets:", e);
        }
      }

      // No saved targets for this tryout → show picker fresh
      setShowTargetPicker(true);
    }
  }, [loading, accessDenied.isDenied, tryoutId]);

  const handleConfirmTarget = () => {
    const validTargets = targets.filter((t) => t !== null && !!t.prodi);
    if (validTargets.length === 0) return;

    // Save per-tryout key
    const perKey = `tryout_targets_${tryoutId}`;
    localStorage.setItem(perKey, JSON.stringify(targets));
    // Also keep legacy global keys for result page backward compat
    localStorage.setItem("tryout_targets", JSON.stringify(targets));

    const p1 = targets[0] || validTargets[0];
    if (p1) {
      localStorage.setItem("tryout_target_ptn", p1.univ);
      localStorage.setItem("tryout_target_prodi", p1.prodi);
      localStorage.setItem("tryout_target_pg", String(p1.passing_grade_est || 695));
      setSelectedPtn(p1.univ);
      setSelectedProdi(p1.prodi);
      setSelectedPg(Number(p1.passing_grade_est || 695));
    }

    setTargetConfirmed(true);
    setShowTargetPicker(false);
    setShowSubtestPicker(true);
  };

  const handleSkipTarget = () => {
    const defaultTargets: (ProdiItem | null)[] = [
      { id: "def-1", univ: "UNIVERSITAS INDONESIA", prodi: "S1 Ilmu Komputer", passing_grade_est: 710 },
      { id: "def-2", univ: "UNIVERSITAS INDONESIA", prodi: "S1 Sistem Informasi", passing_grade_est: 685 },
      { id: "def-3", univ: "UNIVERSITAS GADJAH MADA", prodi: "S1 Teknologi Informasi", passing_grade_est: 660 },
      { id: "def-4", univ: "UNIVERSITAS DIPONEGORO", prodi: "S1 Informatika", passing_grade_est: 630 },
    ];
    setTargets(defaultTargets);
    const perKey = `tryout_targets_${tryoutId}`;
    localStorage.setItem(perKey, JSON.stringify(defaultTargets));
    localStorage.setItem("tryout_targets", JSON.stringify(defaultTargets));
    localStorage.setItem("tryout_target_ptn", "UNIVERSITAS INDONESIA");
    localStorage.setItem("tryout_target_prodi", "S1 Ilmu Komputer");
    localStorage.setItem("tryout_target_pg", "710");
    setSelectedPtn("UNIVERSITAS INDONESIA");
    setSelectedProdi("S1 Ilmu Komputer");
    setSelectedPg(710);
    setTargetConfirmed(true);
    setShowTargetPicker(false);
    setShowSubtestPicker(true);
  };

  const handleMoveSubtest = (index: number, direction: "up" | "down") => {
    if (!isPremiumUser) return;
    if (direction === "up" && index > 0) {
      const newList = [...subtestList];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      setSubtestList(newList);
    } else if (direction === "down" && index < subtestList.length - 1) {
      const newList = [...subtestList];
      [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
      setSubtestList(newList);
    }
  };

  const handleShuffleSubtests = () => {
    if (!isPremiumUser) return;
    const shuffled = [...subtestList].sort(() => Math.random() - 0.5);
    setSubtestList(shuffled);
  };

  const handleStartTryout = () => {
    // Sort questions based on the selected subtest order
    const orderedQuestions: QuestionItem[] = [];
    subtestList.forEach(sub => {
      orderedQuestions.push(...questions.filter(q => (q.subtest || "Lainnya") === sub.name));
    });
    setQuestions(orderedQuestions);
    setActiveSubtestIndex(0);
    setCurrentIndex(0);
    const firstDuration = subtestList[0]?.duration || 30;
    setTimeLeftSeconds(firstDuration * 60);
    setShowSubtestPicker(false);
    setHasStarted(true);
  };

  // Per-subtest derived state
  const currentSubtest = subtestList[activeSubtestIndex];
  const currentSubtestQuestions = questions.filter(
    q => (q.subtest || "Lainnya") === currentSubtest?.name
  );
  const currentSubtestAnsweredCount = currentSubtestQuestions.filter(q => answers[q.id]).length;
  const isLastSubtest = activeSubtestIndex === subtestList.length - 1;

  // Per-subtest countdown timer
  useEffect(() => {
    if (!hasStarted) return;
    if (showSubtestBreak) return; // pause when on break screen
    if (timeLeftSeconds <= 0) {
      // Auto-advance when time runs out → go to break screen
      if (!isLastSubtest) {
        setShowSubtestBreak(true);
      } else {
        setIsSubmitDialogOpen(true);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftSeconds, showSubtestBreak]);

  const handleNextSubtest = (autoAdvance = false) => {
    const nextIndex = activeSubtestIndex + 1;
    if (nextIndex >= subtestList.length) return;
    // Show break screen first, don't advance yet
    setIsSubmitDialogOpen(false);
    setTimeLeftSeconds(0); // pause timer
    setShowSubtestBreak(true);
  };

  const handleStartNextSubtest = () => {
    const nextIndex = activeSubtestIndex + 1;
    if (nextIndex >= subtestList.length) return;
    setActiveSubtestIndex(nextIndex);
    setCurrentIndex(0);
    const nextDuration = subtestList[nextIndex]?.duration || 30;
    setTimeLeftSeconds(nextDuration * 60);
    setShowSubtestBreak(false);
  };

  const handleFinalSubmit = () => {
    startTransition(async () => {
      // Save final question time before submitting
      if (currentQ && questionStartTime[currentQ.id]) {
        const timeSpent = Math.floor((Date.now() - questionStartTime[currentQ.id]) / 1000);
        setQuestionTimeSpent((prev) => ({
          ...prev,
          [currentQ.id]: (prev[currentQ.id] || 0) + timeSpent,
        }));
      }

      const res = await submitTryoutAction({
        tryoutId,
        answers,
        questionTimeSpent, // Send timing data
      });

      if (res?.success && res?.resultId) {
        router.push(`/tryout/result/${res.resultId}`);
      } else {
        alert(res?.error || "Gagal mengumpulkan jawaban. Silakan coba lagi.");
        setIsSubmitDialogOpen(false);
      }
    });
  };

  const formatTimer = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentQ = currentSubtestQuestions[currentIndex];

  // Track time spent on each question
  useEffect(() => {
    if (!currentQ || !hasStarted || showSubtestBreak) return;

    // Start timing when question is displayed
    if (!questionStartTime[currentQ.id]) {
      setQuestionStartTime((prev) => ({ ...prev, [currentQ.id]: Date.now() }));
    }

    // Save time spent when navigating away from question
    return () => {
      if (questionStartTime[currentQ.id]) {
        const timeSpent = Math.floor((Date.now() - questionStartTime[currentQ.id]) / 1000);
        setQuestionTimeSpent((prev) => ({
          ...prev,
          [currentQ.id]: (prev[currentQ.id] || 0) + timeSpent,
        }));
      }
    };
  }, [currentIndex, currentQ, hasStarted, showSubtestBreak]);

  const handleSelectOption = (value: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: value }));
  };

  const toggleFlag = () => {
    if (!currentQ) return;
    setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };




  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-sans">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Menyiapkan Lembar Ujian CBT...</p>
      </div>
    );
  }

  // --- ACCESS DENIED SCREEN ---
  if (accessDenied.isDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Batas Pengerjaan Habis</h2>
          <p className="text-sm text-slate-500 mb-6">{accessDenied.reason}</p>
          
          <div className="space-y-3">
            {accessDenied.resultId && (
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm" onClick={() => router.push(`/tryout/result/${accessDenied.resultId}`)}>
                Lihat Hasil Try Out
              </Button>
            )}
            {accessDenied.requiresUpgrade && (
              <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl gap-2 shadow-sm" onClick={() => router.push("/pricing")}>
                <Target className="h-4 w-4" />
                Upgrade ke Premium untuk Coba Lagi
              </Button>
            )}
            <Button variant="outline" className="w-full h-11 border-slate-200 font-semibold rounded-xl text-slate-600 hover:bg-slate-50" onClick={() => router.push("/dashboard/student")}>
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- TARGET JURUSAN PICKER SCREEN (4 PRODI & SMART VERDICT) ---
  if (showTargetPicker) {
    const verdict = getSmartVerdict();

    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 font-sans py-8">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm overflow-hidden border border-blue-100">
          {/* Header */}
          <div className="px-6 py-4 border-b border-blue-100 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-blue-900 tracking-tight">Pilihan Target Jurusan</h2>
              <p className="text-xs text-blue-400">Atur urutan 1–4 prodi impian kamu sebelum try out</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* Search Input for Active Slot */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  Cari & Isi Jurusan Pilihan {activeTargetSlot + 1}:
                </label>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Slot Pilihan {activeTargetSlot + 1} Aktif
                </span>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 text-blue-300 absolute left-3.5 top-3.5" />
                <Input
                  value={prodiSearch}
                  onChange={(e) => setProdiSearch(e.target.value)}
                  placeholder="Ketik nama jurusan / PTN (cth: Kedokteran UI, Teknik ITB)..."
                  className="pl-10 h-11 rounded-xl text-xs border-blue-200 font-medium bg-blue-50 focus:bg-white transition-all"
                />
              </div>

              {/* Autocomplete Suggestions dropdown */}
              {filteredProdi.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1 border border-blue-100 rounded-xl p-2 bg-white shadow-md animate-in fade-in duration-150 relative z-20">
                  {filteredProdi.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        const selectedItem: ProdiItem = {
                          id: p.id,
                          univ: p.univ,
                          prodi: `${p.jenjang ? `${p.jenjang} ` : ""}${p.prodi}`,
                          passing_grade_est: Number(p.passing_grade_est || 650),
                        };
                        setTargets((prev) => {
                          const copy = [...prev];
                          copy[activeTargetSlot] = selectedItem;
                          if (activeTargetSlot < 3 && !copy[activeTargetSlot + 1]) {
                            setActiveTargetSlot(activeTargetSlot + 1);
                          }
                          return copy;
                        });
                        setProdiSearch("");
                        setProdiList([]);
                      }}
                      className="w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between hover:bg-blue-700 hover:text-white transition-colors group"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold block truncate text-slate-900 group-hover:text-white">{p.prodi}</span>
                        <span className="text-[11px] block truncate text-slate-500 group-hover:text-blue-100">{p.univ}</span>
                      </div>
                      {p.passing_grade_est && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 bg-blue-100 text-blue-700 group-hover:bg-white/20 group-hover:text-white">
                          PG ~{p.passing_grade_est}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4 Choice Slots */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider px-1">
                <span>Daftar 4 Pilihan Kamu</span>
                <span>Klik slot untuk mengubah</span>
              </div>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const item = targets[slotIdx];
                  const isActive = activeTargetSlot === slotIdx;
                  const slotNum = slotIdx + 1;

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => setActiveTargetSlot(slotIdx)}
                      className={`cursor-pointer rounded-xl p-3 border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? "border-blue-400 bg-blue-50 ring-1 ring-blue-400/30"
                          : item
                          ? "border-blue-100 bg-white hover:border-blue-200"
                          : "border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-extrabold text-xs ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : item
                            ? "bg-blue-700 text-white"
                            : "bg-blue-100 text-blue-400"
                        }`}>
                          P{slotNum}
                        </div>

                        {item ? (
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-extrabold text-slate-900 truncate">{item.prodi}</p>
                              {slotIdx === 0 && (
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded shrink-0">Profil Impian</span>
                              )}
                            </div>
                            <p className="text-[11px] text-blue-400 font-medium truncate">{item.univ}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-blue-300">Pilihan {slotNum} belum diisi</p>
                            <p className="text-[10px] text-blue-300">Klik & cari prodi di atas untuk mengisi</p>
                          </div>
                        )}
                      </div>

                      {item ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                            PG {item.passing_grade_est || 650}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargets((prev) => {
                                const copy = [...prev];
                                copy[slotIdx] = null;
                                return copy;
                              });
                            }}
                            className="text-xs text-blue-300 hover:text-blue-600 font-bold p-1 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg shrink-0">
                          + Pilih
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Verdict */}
            {verdict.warnings.length > 0 && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-blue-700">
                  <AlertTriangle className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>Peringatan Urutan Pilihan:</span>
                </div>
                <ul className="space-y-1 pl-5 list-disc text-[11px] leading-relaxed text-blue-700">
                  {verdict.warnings.map((warn, wIdx) => (
                    <li key={wIdx} className="font-semibold">{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {verdict.summary && (
              <p className="text-[11px] text-blue-500 leading-relaxed font-medium px-1">
                {verdict.summary}
              </p>
            )}

            {/* Action Button */}
            <Button
              disabled={!targets[0] || !targets[0].prodi}
              onClick={handleConfirmTarget}
              className="w-full h-11 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl gap-2 shadow-sm transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Simpan Target & Lanjut Ke Try Out</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBTEST PICKER SCREEN ---
  if (showSubtestPicker) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Daftar Subtes</h2>
              <p className="text-sm text-slate-500">
                {isPremiumUser 
                  ? "Atur urutan pengerjaan subtes sesuai dengan strategi terbaikmu." 
                  : "Urutan pengerjaan telah ditetapkan. Upgrade ke Premium untuk bebas memilih urutan subtes."}
              </p>
            </div>

            {isPremiumUser && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleShuffleSubtests} 
                  variant="outline" 
                  className="gap-2 h-9 text-xs font-semibold rounded-xl"
                >
                  <Shuffle className="h-4 w-4" />
                  Acak Urutan
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {subtestList.map((sub, index) => (
                <div 
                  key={sub.name} 
                  className={`flex items-center justify-between p-4 rounded-2xl border ${isPremiumUser ? 'bg-white border-slate-200 hover:border-blue-300 transition-colors' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-center gap-4">
                    {isPremiumUser ? (
                      <div className="flex flex-col gap-1 items-center justify-center text-slate-400">
                        <button 
                          onClick={() => handleMoveSubtest(index, "up")} 
                          disabled={index === 0}
                          className="hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4 rotate-90" />
                        </button>
                        <GripVertical className="h-4 w-4 opacity-30" />
                        <button 
                          onClick={() => handleMoveSubtest(index, "down")} 
                          disabled={index === subtestList.length - 1}
                          className="hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4 -rotate-90" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                    
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{sub.name}</h4>
                        <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                          {sub.category}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                        {sub.duration > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {sub.duration} menit
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {sub.count} Soal
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 shrink-0">
                    Urutan ke-{index + 1}
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              onClick={handleStartTryout}
              className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-md mt-6"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mulai Try Out Sekarang</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- BREAK / JEDA SCREEN antara subtes ---
  if (showSubtestBreak) {
    const finishedSubtest = subtestList[activeSubtestIndex];
    const nextSubtest = subtestList[activeSubtestIndex + 1];
    const finishedQs = questions.filter(q => (q.subtest || "Lainnya") === finishedSubtest?.name);
    const finishedAnswered = finishedQs.filter(q => answers[q.id]).length;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg space-y-4">

          {/* Completion card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Blue header */}
            <div className="bg-blue-600 px-6 py-5 text-white text-center">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-extrabold">Subtes Selesai!</h2>
              <p className="text-sm text-blue-100 mt-1">{finishedSubtest?.name}</p>
            </div>

            {/* Stats */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-extrabold text-blue-700">{finishedAnswered}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Soal Terjawab</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-extrabold text-slate-700">{finishedQs.length - finishedAnswered}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Soal Dikosongkan</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Progress subtes ini</span>
                <span className="font-bold text-slate-700">{finishedAnswered}/{finishedQs.length}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${finishedQs.length > 0 ? (finishedAnswered / finishedQs.length) * 100 : 0}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 text-center bg-blue-50 text-blue-700 p-2.5 rounded-xl border border-blue-100 font-medium">
                Jawaban subtes ini telah dikunci. Kamu tidak bisa kembali ke subtes sebelumnya.
              </p>
            </div>
          </div>

          {/* Next subtest info card */}
          {nextSubtest && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Subtes Berikutnya</p>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{nextSubtest.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{nextSubtest.category}</p>
                </div>
                <div className="text-right text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1 justify-end">
                    <BookOpen className="h-3 w-3 text-blue-600" />
                    <span className="font-semibold">{nextSubtest.count} Soal</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="font-semibold">{nextSubtest.duration} menit</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <Button
            onClick={handleStartNextSubtest}
            className="w-full h-13 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl gap-2 shadow-md py-4"
          >
            <ArrowRight className="h-5 w-5" />
            <span>Lanjut ke {nextSubtest?.name || "Subtes Berikutnya"}</span>
          </Button>

          <p className="text-center text-xs text-slate-400 font-medium pt-1">
            Kamu bebas istirahat sejenak. Klik lanjut jika sudah siap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans pb-12">
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="UpdatePTN Logo" width={32} height={32} className="h-8 w-auto object-contain" />
          <div>
            <span className="font-extrabold text-sm sm:text-base text-slate-900 block leading-tight">
              Update<span className="text-blue-600">PTN</span>
            </span>
            <span className="text-[11px] text-slate-500 font-semibold hidden sm:block">
              {currentSubtest?.category || "SNBT Standard IRT"} • Subtes {activeSubtestIndex + 1}/{subtestList.length}
            </span>
          </div>
        </div>

        {/* Timer per subtes */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${
          timeLeftSeconds < 300 
            ? "bg-red-50 border-red-200" 
            : "bg-blue-50 border-blue-200/80"
        }`}>
          <Clock className={`h-4 w-4 animate-pulse ${timeLeftSeconds < 300 ? "text-red-500" : "text-blue-600"}`} />
          <span className={`font-mono text-sm sm:text-base font-extrabold ${timeLeftSeconds < 300 ? "text-red-600" : "text-blue-700"}`}>
            {formatTimer(timeLeftSeconds)}
          </span>
        </div>

        {/* Selesai Subtes / Kumpulkan Button */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogTrigger render={
            <Button
              variant="default"
              className={`font-bold text-xs sm:text-sm rounded-xl gap-2 h-10 px-4 shadow-sm ${
                isLastSubtest
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isLastSubtest ? (
                <><FileCheck2 className="h-4 w-4" /><span>Selesai &amp; Kumpulkan</span></>
              ) : (
                <><ArrowRight className="h-4 w-4" /><span className="hidden sm:inline">Selesai Subtes Ini</span><span className="sm:hidden">Selesai</span></>
              )}
            </Button>
          } />

          <DialogContent className="sm:max-w-md rounded-2xl bg-white p-6">
            <DialogHeader className="space-y-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mx-auto border ${
                isLastSubtest ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-blue-50 border-blue-200 text-blue-600"
              }`}>
                {isLastSubtest ? <FileCheck2 className="h-6 w-6" /> : <ArrowRight className="h-6 w-6" />}
              </div>
              <DialogTitle className="text-center text-xl font-bold text-slate-900">
                {isLastSubtest ? "Kumpulkan Semua Jawaban?" : `Selesai: ${currentSubtest?.name}?`}
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-slate-500 leading-relaxed">
                {isLastSubtest
                  ? `Ini adalah subtes terakhir. Kamu akan mengumpulkan seluruh jawaban dari semua subtes.`
                  : `Kamu akan melanjutkan ke subtes berikutnya: ${subtestList[activeSubtestIndex + 1]?.name || ""}. Jawaban subtes ini akan dikunci.`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600 my-2">
              <div className="flex justify-between">
                <span>Subtes saat ini:</span>
                <strong className="text-slate-900">{currentSubtest?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Terjawab di subtes ini:</span>
                <strong className="text-blue-700">{currentSubtestAnsweredCount} / {currentSubtestQuestions.length} Soal</strong>
              </div>
              <div className="flex justify-between">
                <span>Total terjawab:</span>
                <strong className="text-slate-900">{Object.keys(answers).length} Soal</strong>
              </div>
              <div className="flex justify-between">
                <span>Sisa waktu subtes:</span>
                <strong className="text-blue-600 font-mono">{formatTimer(timeLeftSeconds)}</strong>
              </div>
            </div>

            <DialogFooter className="flex sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsSubmitDialogOpen(false)}
                className="w-full sm:w-1/2 rounded-xl text-xs font-semibold h-11 border-slate-200"
              >
                Kembali Periksa
              </Button>
              <Button
                disabled={isPending}
                onClick={isLastSubtest ? handleFinalSubmit : () => handleNextSubtest()}
                className={`w-full sm:w-1/2 rounded-xl text-xs font-bold h-11 gap-2 shadow-sm ${
                  isLastSubtest
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /><span>Memproses...</span></>
                ) : isLastSubtest ? (
                  <><FileCheck2 className="h-4 w-4" /><span>Ya, Kumpulkan</span></>
                ) : (
                  <><ArrowRight className="h-4 w-4" /><span>Lanjut Subtes Berikutnya</span></>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Subtest Progress Bar */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {subtestList.map((sub, idx) => {
              const subQs = questions.filter(q => (q.subtest || "Lainnya") === sub.name);
              const subAnswered = subQs.filter(q => answers[q.id]).length;
              const isDone = idx < activeSubtestIndex;
              const isActive = idx === activeSubtestIndex;
              return (
                <div key={sub.name} className={`flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isDone ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                  isActive ? "bg-blue-600 border-blue-600 text-white" :
                  "bg-slate-100 border-slate-200 text-slate-400"
                }`}>
                  {isDone && <CheckCircle2 className="h-3 w-3" />}
                  {isActive && <BookOpen className="h-3 w-3" />}
                  <span className="hidden sm:inline">{sub.name}</span>
                  <span className="sm:hidden">{idx + 1}</span>
                  {isActive && <span className="opacity-75">({subAnswered}/{subQs.length})</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Question & Options Interface */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Question Header Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border-blue-200">
                  Soal {currentIndex + 1} / {currentSubtestQuestions.length}
                </Badge>
                <Badge variant="outline" className="px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border-slate-200">
                  {currentSubtest?.name}
                </Badge>
              </div>

              <Button
                variant={flagged[currentQ?.id] ? "destructive" : "outline"}
                size="sm"
                onClick={toggleFlag}
                className="rounded-xl gap-2 font-semibold text-xs h-9"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{flagged[currentQ?.id] ? "Ragu-Ragu ✓" : "Tandai Ragu-Ragu"}</span>
              </Button>
            </div>

            {/* Question Reading Body */}
            <div className="space-y-4">
              <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
                {currentQ?.question_text || currentQ?.text}
              </p>
            </div>

            {/* Options A - E Selector */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pilihan Jawaban:</p>
              <RadioGroup
                value={answers[currentQ?.id] || ""}
                onValueChange={handleSelectOption}
                className="space-y-2.5"
              >
                {[
                  { key: "A", text: currentQ?.option_a },
                  { key: "B", text: currentQ?.option_b },
                  { key: "C", text: currentQ?.option_c },
                  { key: "D", text: currentQ?.option_d },
                  { key: "E", text: currentQ?.option_e },
                ].map((opt) => {
                  const isSelected = answers[currentQ?.id] === opt.key;
                  return (
                    <Label
                      key={opt.key}
                      htmlFor={`opt-${opt.key}`}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <RadioGroupItem value={opt.key} id={`opt-${opt.key}`} className="mt-0.5 border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <div className="flex gap-2">
                        <span className="font-bold text-sm text-blue-600">{opt.key}.</span>
                        <span className="text-sm font-normal leading-relaxed">{opt.text}</span>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="rounded-xl border-slate-200 font-semibold gap-2 h-11"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </Button>

              <Button
                disabled={currentIndex === currentSubtestQuestions.length - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl gap-2 h-11 px-6"
              >
                <span>Berikutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Question Number Palette (current subtest only) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Navigasi Soal</h3>
                <p className="text-[11px] text-slate-400 font-medium">{currentSubtest?.name}</p>
              </div>
              <Badge variant="outline" className="text-[11px] font-semibold text-slate-500 border-slate-200">
                {currentSubtestAnsweredCount} / {currentSubtestQuestions.length}
              </Badge>
            </div>

            {/* Palette Grid — only current subtest questions */}
            <div className="grid grid-cols-5 gap-2">
              {currentSubtestQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q.id]);
                const isFlagged = Boolean(flagged[q.id]);

                let styleClass = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";
                if (isCurrent) styleClass = "ring-2 ring-blue-600 bg-blue-600 text-white font-bold";
                else if (isFlagged) styleClass = "bg-amber-500 text-white font-bold border-amber-600";
                else if (isAnswered) styleClass = "bg-blue-50 text-blue-700 border-blue-300 font-bold";

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all ${styleClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-600 inline-block" /><span>Sedang Dikerjakan</span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-50 border border-blue-300 inline-block" /><span>Sudah Dijawab</span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500 inline-block" /><span>Ragu-Ragu</span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-white border border-slate-300 inline-block" /><span>Belum Dijawab</span></div>
            </div>

            {/* Subtest list summary */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Semua Subtes</p>
              {subtestList.map((sub, idx) => {
                const subQs = questions.filter(q => (q.subtest || "Lainnya") === sub.name);
                const subAnswered = subQs.filter(q => answers[q.id]).length;
                const isDone = idx < activeSubtestIndex;
                const isActive = idx === activeSubtestIndex;
                return (
                  <div key={sub.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {isDone
                        ? <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        : <div className={`h-2 w-2 rounded-full shrink-0 ${isActive ? "bg-blue-500" : "bg-slate-300"}`} />
                      }
                      <span className={`font-medium truncate max-w-[130px] ${isActive ? "text-blue-700 font-bold" : isDone ? "text-emerald-700" : "text-slate-400"}`}>
                        {sub.name}
                      </span>
                    </div>
                    <span className={`font-semibold ${isDone ? "text-emerald-600" : isActive ? "text-blue-600" : "text-slate-400"}`}>
                      {subAnswered}/{subQs.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
