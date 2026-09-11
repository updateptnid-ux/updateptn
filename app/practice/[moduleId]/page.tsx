"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { FormattedContent } from "@/components/ui/formatted-content";

interface PracticeQuestion {
  id: string;
  module_id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
}

interface ModuleInfo {
  id: string;
  title: string;
  subtes_category: string;
  duration_minutes: number;
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<ModuleInfo | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    loadPractice();
  }, [moduleId]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && module) {
      handleFinish();
    }
  }, [timeLeft, showResults]);

  const loadPractice = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get module info
      const { data: moduleData, error: moduleError } = await supabase
        .from("subtes_modules")
        .select("*")
        .eq("id", moduleId)
        .single();

      if (moduleError) {
        console.error("Error loading module:", moduleError);
        alert("Module tidak ditemukan");
        router.back();
        return;
      }

      setModule(moduleData as ModuleInfo);
      setTimeLeft(moduleData.duration_minutes * 60);

      // Get questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("practice_questions")
        .select("*")
        .eq("module_id", moduleId)
        .order("question_number", { ascending: true });

      if (questionsError) {
        console.error("Error loading questions:", questionsError);
      } else if (!questionsData || questionsData.length === 0) {
        alert("Belum ada soal untuk modul ini. Hubungi admin.");
        router.back();
        return;
      } else {
        setQuestions(questionsData as PracticeQuestion[]);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat memuat latihan");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentIndex]: answer });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    if (showResults) return;
    
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      if (!confirm(`Masih ada ${unanswered} soal yang belum dijawab. Yakin ingin selesai?`)) {
        return;
      }
    }
    
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: (correct / questions.length) * 100,
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-slate-600">Memuat soal latihan...</p>
        </div>
      </div>
    );
  }

  if (!module || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Soal Tidak Tersedia</h2>
          <p className="text-slate-600 mb-4">Belum ada soal untuk modul ini.</p>
          <Button onClick={() => router.back()}>Kembali</Button>
        </Card>
      </div>
    );
  }

  // Results View
  if (showResults) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="p-6 bg-blue-700 text-white">
            <h1 className="text-2xl font-bold mb-2">Hasil Latihan</h1>
            <p className="text-blue-100">{module.title}</p>
          </Card>

          {/* Score Card */}
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className={`text-6xl font-black ${
                score.percentage >= 80 ? "text-emerald-600" :
                score.percentage >= 60 ? "text-amber-600" :
                "text-rose-600"
              }`}>
                {score.percentage.toFixed(0)}%
              </div>
              <p className="text-xl font-bold text-slate-900">
                {score.correct} dari {score.total} soal benar
              </p>
              <Progress value={score.percentage} className="h-3" />
            </div>
          </Card>

          {/* Review Questions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Pembahasan Soal</h2>
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correct_answer;
              
              return (
                <Card key={q.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className={isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                        {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">Soal {idx + 1}</h3>
                        <FormattedContent content={q.question_text} className="text-slate-700 mb-3" />
                        
                        <div className="space-y-1 text-sm mb-3">
                          <p>Jawaban kamu: <span className={`font-bold ${!userAnswer ? "text-slate-400" : isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                            {userAnswer || "Tidak dijawab"}
                          </span></p>
                          <p>Jawaban benar: <span className="font-bold text-emerald-600">{q.correct_answer}</span></p>
                        </div>

                        {q.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-bold text-blue-900 mb-1">Pembahasan:</p>
                            <FormattedContent content={q.explanation} className="text-xs text-blue-800" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => router.back()} variant="outline" className="flex-1">
              Kembali ke Daftar Modul
            </Button>
            <Button onClick={() => window.location.reload()} className="flex-1 bg-blue-600">
              Ulangi Latihan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Practice View
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Keluar
            </Button>
            <div className="text-sm">
              <p className="font-bold text-slate-900">{module.title}</p>
              <p className="text-xs text-slate-500">Soal {currentIndex + 1} dari {questions.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className={timeLeft < 300 ? "text-rose-600" : "text-slate-900"}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Badge className="mb-4">Soal {currentIndex + 1}</Badge>
              <FormattedContent content={currentQuestion.question_text} className="text-lg text-slate-900 leading-relaxed" />
            </div>

            <div className="space-y-3">
              {["A", "B", "C", "D", "E"].map((option) => {
                const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof PracticeQuestion] as string;
                const isSelected = answers[currentIndex] === option;
                
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                      }`}>
                        {option}
                      </div>
                      <FormattedContent content={optionText} inline className="text-sm text-slate-700 flex-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-700">
              Selesai
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              Selanjutnya
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
