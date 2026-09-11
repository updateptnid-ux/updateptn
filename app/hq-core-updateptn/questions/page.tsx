"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CrudLayout from "@/components/admin/CrudLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileQuestion, Edit, Trash2, X, FileText, ArrowLeft, FolderOpen, Calendar, Clock, Database, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { QuestionTextEditor } from "@/components/editor/QuestionTextEditor";

interface QuestionRecord {
  id: string;
  tryout_id: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string | null;
  subtest: string;
}

interface TryoutItem {
  id: string;
  title: string;
  description: string;
  scheduled_date: string;
  duration_minutes: number;
  total_questions: number;
  is_active: boolean;
}

// Official SNBT 2026 Subtests and Quotas
export const OFFICIAL_SNBT_SUBTESTS = [
  { name: "Penalaran Umum", max: 30, category: "TPS", duration: 30 },
  { name: "Pengetahuan dan Pemahaman Umum", max: 20, category: "TPS", duration: 15 },
  { name: "Kemampuan Memahami Bacaan dan Menulis", max: 20, category: "TPS", duration: 25 },
  { name: "Pengetahuan Kuantitatif", max: 20, category: "TPS", duration: 20 },
  { name: "Literasi dalam Bahasa Indonesia", max: 30, category: "Tes Literasi", duration: 42.5 },
  { name: "Literasi dalam Bahasa Inggris", max: 20, category: "Tes Literasi", duration: 20 },
  { name: "Penalaran Matematika", max: 20, category: "Tes Literasi", duration: 42.5 },
];

export function getNormalizedSubtest(rawName: string) {
  const n = (rawName || "").toLowerCase().trim();
  if (n.includes("penalaran umum")) return "Penalaran Umum";
  if (n.includes("pemahaman umum") || n === "ppu") return "Pengetahuan dan Pemahaman Umum";
  if (n.includes("bacaan dan menulis") || n.includes("kbm")) return "Kemampuan Memahami Bacaan dan Menulis";
  if (n.includes("kuantitatif") || n === "pk") return "Pengetahuan Kuantitatif";
  if (n.includes("indonesia") || n.includes("literasi b. indonesia")) return "Literasi dalam Bahasa Indonesia";
  if (n.includes("inggris") || n.includes("literasi b. inggris")) return "Literasi dalam Bahasa Inggris";
  if (n.includes("matematika") || n.includes("penalaran matematika")) return "Penalaran Matematika";
  return rawName || "Penalaran Umum";
}

export default function AdminQuestionsPage() {
  const [tryouts, setTryouts] = useState<TryoutItem[]>([]);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [selectedTryout, setSelectedTryout] = useState<TryoutItem | null>(null);
  const [selectedSubtestFilter, setSelectedSubtestFilter] = useState<string>("ALL");
  
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isUploadingJson, setIsUploadingJson] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    tryout_id: "",
    text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    option_e: "",
    correct_answer: "A",
    explanation: "",
    subtest: "Penalaran Umum",
  });

  useEffect(() => {
    fetchTryouts();
  }, []);

  useEffect(() => {
    if (selectedTryout) {
      fetchQuestions(selectedTryout.id);
    }
  }, [selectedTryout]);

  const fetchTryouts = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tryouts")
        .select("*")
        .eq("tryout_type", "snbt") // ← FILTER: Hanya SNBT
        .order("scheduled_date", { ascending: false });

      if (data) {
        const sorted = (data as TryoutItem[]).sort((a, b) => {
          const numA = parseInt(a.title.replace(/\D/g, "") || "0", 10);
          const numB = parseInt(b.title.replace(/\D/g, "") || "0", 10);
          if (numA !== numB) return numA - numB;
          return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });
        });
        setTryouts(sorted);
      }
      if (error) throw error;
    } catch (err) {
      console.error(err);
      alert("Gagal memuat daftar Try Out SNBT.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (tryoutId: string) => {
    try {
      setLoadingQuestions(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("tryout_id", tryoutId)
        .order("created_at", { ascending: false });

      if (data) {
        setQuestions(data as QuestionRecord[]);
      }
      if (error) throw error;
    } catch (err) {
      console.error(err);
      alert("Gagal memuat soal untuk Try Out ini.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleCreate = () => {
    if (!selectedTryout) return;
    setEditingQuestion(null);
    setFormData({
      tryout_id: selectedTryout.id,
      text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A",
      explanation: "",
      subtest: "Penalaran Umum",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (q: QuestionRecord) => {
    setEditingQuestion(q);
    setFormData({
      tryout_id: q.tryout_id,
      text: q.text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      option_e: q.option_e,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      subtest: q.subtest || "Penalaran Umum",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const targetNormSubtest = getNormalizedSubtest(formData.subtest);
      const subConfig = OFFICIAL_SNBT_SUBTESTS.find(s => s.name === targetNormSubtest);

      // Check quota limit for new questions
      if (subConfig && !editingQuestion) {
        const currentCount = questions.filter(q => getNormalizedSubtest(q.subtest) === targetNormSubtest).length;
        if (currentCount >= subConfig.max) {
          alert(`Kuota subtes "${targetNormSubtest}" sudah PENUH (${currentCount}/${subConfig.max} soal). Tidak bisa menambah soal lagi untuk subtes ini.`);
          setIsSaving(false);
          return;
        }
      }

      const supabase = createClient();
      
      if (editingQuestion) {
        const { error } = await supabase.from("questions").update(formData).eq("id", editingQuestion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("questions").insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      if (selectedTryout) fetchQuestions(selectedTryout.id);
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus soal ini?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      if (selectedTryout) fetchQuestions(selectedTryout.id);
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  const handleUploadJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTryout) return;

    try {
      setIsUploadingJson(true);
      const fileContent = await file.text();
      const parsed = JSON.parse(fileContent);

      if (!Array.isArray(parsed)) {
        alert("Format JSON tidak valid. Harus berupa array object.");
        return;
      }

      // Check quota overload per subtest in uploaded batch
      const currentCounts: Record<string, number> = {};
      OFFICIAL_SNBT_SUBTESTS.forEach(s => {
        currentCounts[s.name] = questions.filter(q => getNormalizedSubtest(q.subtest) === s.name).length;
      });

      const batchCounts: Record<string, number> = {};
      parsed.forEach(q => {
        const normName = getNormalizedSubtest(q.subtest || "");
        batchCounts[normName] = (batchCounts[normName] || 0) + 1;
      });

      const overflowErrors: string[] = [];
      OFFICIAL_SNBT_SUBTESTS.forEach(s => {
        const curr = currentCounts[s.name] || 0;
        const add = batchCounts[s.name] || 0;
        if (curr + add > s.max) {
          overflowErrors.push(`• ${s.name}: Saat ini ${curr}/${s.max}, akan ditambah ${add} (Melebihi batas max ${s.max})`);
        }
      });

      if (overflowErrors.length > 0) {
        alert(`Gagal upload! Kuota subtes melebihi batas resmi SNBT:\n\n${overflowErrors.join("\n")}\n\nSilakan kurangi jumlah soal di file JSON.`);
        return;
      }

      // Transform JSON to match database schema
      const questionsToInsert = parsed.map((q) => {
        // Normalize subtest name
        const normalizedSubtest = getNormalizedSubtest(q.subtest || "Penalaran Umum");
        
        // Combine text and question into single text field
        let fullText = q.text || "";
        if (q.question) {
          fullText = fullText ? `${fullText}\n\n${q.question}` : q.question;
        }
        
        return {
          tryout_id: selectedTryout.id,
          text: fullText || q.question_text || "", // Support old format too
          option_a: q.option_a || "",
          option_b: q.option_b || "",
          option_c: q.option_c || "",
          option_d: q.option_d || "",
          option_e: q.option_e || "",
          correct_answer: q.correct_answer || "A",
          explanation: q.explanation || "",
          subtest: normalizedSubtest,
        };
      });

      const supabase = createClient();
      const { error } = await supabase.from("questions").insert(questionsToInsert);

      if (error) {
        alert("Gagal upload soal: " + error.message);
      } else {
        alert(`Berhasil mengunggah ${questionsToInsert.length} soal!`);
        fetchQuestions(selectedTryout.id);
      }
    } catch (err: any) {
      console.error(err);
      alert("Gagal membaca atau mem-parsing file JSON: " + err.message);
    } finally {
      setIsUploadingJson(false);
      e.target.value = ""; // Reset input
    }
  };

  // Legacy stub functions - no longer needed
  const handleGenerateJson = () => {};
  const handleCopyJson = () => {};

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // View: Daftar Try Out
  if (!selectedTryout) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bank Soal Try Out SNBT</h1>
            <p className="text-sm text-slate-500 mt-1">Pilih paket Try Out SNBT untuk mengelola soal di dalamnya.</p>
          </div>
          <Button
            onClick={() => window.open('/hq-core-updateptn/json-generator', '_blank')}
            className="rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold gap-2 h-11 px-5 shadow-sm"
          >
            <FileText className="h-4 w-4" />
            <span>Alat Generator JSON (Tab Baru)</span>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat paket Try Out...</div>
        ) : tryouts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl">
            Belum ada paket Try Out SNBT. Buat di menu "Buat Try Out SNBT".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tryouts.map((to) => (
              <Card 
                key={to.id} 
                className="overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedTryout(to)}
              >
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 group-hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-blue-500" />
                        <h3 className="font-bold text-slate-900 truncate" title={to.title}>{to.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{to.description || "Tanpa deskripsi"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Jadwal</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {to.scheduled_date ? formatDate(to.scheduled_date) : "-"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Soal</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Database className="h-3.5 w-3.5 text-slate-400" />
                      {to.total_questions} soal
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View: Isi Soal Try Out
  const filteredQuestions = selectedSubtestFilter === "ALL" 
    ? questions 
    : questions.filter(q => getNormalizedSubtest(q.subtest) === selectedSubtestFilter);

  const totalQuestionsCount = questions.length;
  const totalMaxQuota = OFFICIAL_SNBT_SUBTESTS.reduce((acc, curr) => acc + curr.max, 0); // 155

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedTryout(null)}
            className="h-10 px-3 hover:bg-slate-100 rounded-xl text-slate-600 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>
          <div>
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              {selectedTryout.title}
            </h2>
            <p className="text-xs text-slate-500">Kelola soal untuk paket Try Out ini.</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Kuota SNBT 2026</span>
          <span className="text-sm font-black text-slate-900">{totalQuestionsCount} / {totalMaxQuota} Soal</span>
        </div>
      </div>

      {/* SNBT 2026 Subtest Quota Progress Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-blue-600" />
            Status Kuota 7 Subtes Resmi SNBT 2026
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">Klik card subtes untuk memfilter</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {OFFICIAL_SNBT_SUBTESTS.map((sub) => {
            const count = questions.filter(q => getNormalizedSubtest(q.subtest) === sub.name).length;
            const pct = Math.min(100, Math.round((count / sub.max) * 100));
            const isFull = count >= sub.max;
            const isSelected = selectedSubtestFilter === sub.name;

            return (
              <div
                key={sub.name}
                onClick={() => setSelectedSubtestFilter(isSelected ? "ALL" : sub.name)}
                className={`cursor-pointer rounded-2xl p-3 border transition-all text-left space-y-2 relative overflow-hidden ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs"
                    : isFull
                    ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white">
                    {sub.category}
                  </span>
                  <Badge variant="outline" className={`text-[9px] font-black px-1.5 py-0.2 ${
                    isFull 
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                      : count > 0 
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {isFull ? "FULL" : `${count}/${sub.max}`}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-extrabold text-slate-900 line-clamp-1" title={sub.name}>{sub.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{sub.duration} Menit</p>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${isFull ? "bg-emerald-500" : "bg-blue-600"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CrudLayout
        title=""
        description=""
        addButtonLabel="Tambah Soal Manual"
        onAddClick={handleCreate}
        searchPlaceholder="Cari soal..."
        totalItems={filteredQuestions.length}
        currentPage={1}
        totalPages={1}
        filterComponent={
          <div className="flex items-center gap-3">
            {/* Filter Subtest Dropdown */}
            <select
              value={selectedSubtestFilter}
              onChange={(e) => setSelectedSubtestFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Semua Subtes ({questions.length} Soal)</option>
              {OFFICIAL_SNBT_SUBTESTS.map((s) => {
                const count = questions.filter(q => getNormalizedSubtest(q.subtest) === s.name).length;
                return (
                  <option key={s.name} value={s.name}>
                    {s.name} ({count}/{s.max} Soal {count >= s.max ? "• FULL" : ""})
                  </option>
                );
              })}
            </select>

            <input 
              type="file" 
              accept=".json" 
              id="upload-json-btn"
              className="hidden" 
              onChange={handleUploadJson} 
              disabled={isUploadingJson}
            />
            <label htmlFor="upload-json-btn">
              <div className={`cursor-pointer flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 text-xs ${isUploadingJson ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="h-4 w-4 text-slate-500" />
                <span>{isUploadingJson ? 'Mengunggah...' : 'Upload JSON Soal'}</span>
              </div>
            </label>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Soal</TableHead>
              <TableHead className="font-bold text-slate-700">Subtest / Mapel</TableHead>
              <TableHead className="font-bold text-slate-700">Kunci Jawaban</TableHead>
              <TableHead className="font-bold text-slate-700">Pembahasan</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingQuestions ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Memuat soal...</TableCell>
              </TableRow>
            ) : filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">
                  {selectedSubtestFilter !== "ALL"
                    ? `Belum ada soal untuk subtes "${selectedSubtestFilter}".`
                    : "Belum ada soal di Try Out ini. Silakan upload JSON atau tambah manual."}
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((quest) => (
                <TableRow key={quest.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 max-w-xs font-medium text-slate-900 truncate">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FileQuestion className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="truncate">{quest.text}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold text-[11px]">
                      {getNormalizedSubtest(quest.subtest)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold px-2 py-0.5 text-xs">
                      {quest.correct_answer}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    {quest.explanation ? (
                      <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{quest.explanation}</span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Kosong</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200 shadow-sm">
                        <DropdownMenuLabel className="text-xs text-slate-500">Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem onClick={() => handleEdit(quest)} className="text-xs cursor-pointer gap-2">
                          <Edit className="h-3.5 w-3.5 text-slate-400" /> Edit Soal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(quest.id)} className="text-xs cursor-pointer text-red-600 gap-2 focus:text-red-700 focus:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CrudLayout>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk mengelola soal secara manual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subtest / Mapel *</Label>
              <select
                value={formData.subtest}
                onChange={e => setFormData({ ...formData, subtest: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white font-medium"
              >
                {OFFICIAL_SNBT_SUBTESTS.map((s) => {
                  const count = questions.filter(q => getNormalizedSubtest(q.subtest) === s.name).length;
                  const isFull = count >= s.max;
                  return (
                    <option key={s.name} value={s.name} disabled={isFull && !editingQuestion}>
                      {s.category}: {s.name} ({count}/{s.max} Soal {isFull ? "• FULL" : ""})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Teks Pertanyaan Soal *</Label>
              <QuestionTextEditor
                value={formData.text}
                onChange={val => setFormData({ ...formData, text: val })}
                placeholder="Tulis soal di sini..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pilihan A *</Label>
                <Input value={formData.option_a} onChange={e => setFormData({ ...formData, option_a: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pilihan B *</Label>
                <Input value={formData.option_b} onChange={e => setFormData({ ...formData, option_b: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pilihan C *</Label>
                <Input value={formData.option_c} onChange={e => setFormData({ ...formData, option_c: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pilihan D *</Label>
                <Input value={formData.option_d} onChange={e => setFormData({ ...formData, option_d: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pilihan E *</Label>
                <Input value={formData.option_e} onChange={e => setFormData({ ...formData, option_e: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kunci Jawaban Benar *</Label>
                <select
                  value={formData.correct_answer}
                  onChange={e => setFormData({ ...formData, correct_answer: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Penjelasan Pembahasan Soal</Label>
              <textarea
                value={formData.explanation}
                onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full h-20 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Tulis penjelasan/pembahasan kunci jawaban..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.text || !formData.tryout_id} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart JSON Generator — 2-column layout (Teks Bacaan | Soal + Kunci)
// ─────────────────────────────────────────────────────────────────────────────
interface ParsedQuestion {
  subtest: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
}

function parseQuestionsToJson(
  readingText: string,
  questionsText: string,
  answerKeyText: string,
  subtest: string
): ParsedQuestion[] {
  // 1. Parse answer key: "1. C" or "1 C" or "1.C"
  const answerMap: Record<number, string> = {};
  answerKeyText.split("\n").forEach(line => {
    const m = line.trim().match(/^(\d+)[.\s]+([A-Ea-e])/);
    if (m) answerMap[parseInt(m[1])] = m[2].toUpperCase();
  });

  // 2. Split questions by numbered pattern e.g. "1." or "1)" at line start
  const blocks: string[][] = [];
  let cur: string[] = [];
  questionsText.split("\n").forEach(line => {
    if (/^\s*\d+\s*[.)\s]\s*\S/.test(line) && cur.length > 0) {
      blocks.push(cur);
      cur = [line];
    } else {
      cur.push(line);
    }
  });
  if (cur.length > 0) blocks.push(cur);

  return blocks
    .map((blockLines): ParsedQuestion | null => {
      const filtered = blockLines.filter(l => l.trim());
      if (!filtered.length) return null;

      // Extract question number
      const numMatch = filtered[0].match(/^\s*(\d+)\s*[.)]/);
      const qNum = numMatch ? parseInt(numMatch[1]) : 0;

      const textLines: string[] = [];
      const opts: Record<string, string> = {};

      filtered.forEach(line => {
        const optM = line.match(/^\s*\(?([A-Ea-e])\)?\s*[.)\s]\s*(.+)/);
        if (optM) {
          opts[optM[1].toUpperCase()] = optM[2].trim();
        } else {
          textLines.push(line.trim());
        }
      });

      const prefix = readingText.trim() ? readingText.trim() + "\n\n" : "";
      return {
        subtest,
        text: prefix + textLines.join("\n"),
        option_a: opts["A"] || "",
        option_b: opts["B"] || "",
        option_c: opts["C"] || "",
        option_d: opts["D"] || "",
        option_e: opts["E"] || "",
        correct_answer: answerMap[qNum] || "A",
        explanation: "",
      };
    })
    .filter((x): x is ParsedQuestion => x !== null);
}

function GeneratorDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  rawText?: string;
  setRawText?: (val: string) => void;
  generatedJson?: string;
  setGeneratedJson?: (val: string) => void;
  handleGenerateJson?: () => void;
  handleCopyJson?: () => void;
}) {
  const [readingText, setReadingText] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [answerKeyText, setAnswerKeyText] = useState("");
  const [selectedSubtest, setSelectedSubtest] = useState("Kemampuan Memahami Bacaan dan Menulis");
  const [generatedJson, setGeneratedJson] = useState("");
  const [parsed, setParsed] = useState<object[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    try {
      if (!questionsText.trim()) {
        alert("Kolom Soal tidak boleh kosong.");
        return;
      }
      const result = parseQuestionsToJson(readingText, questionsText, answerKeyText, selectedSubtest);
      if (!result.length) {
        alert("Tidak ada soal yang berhasil di-parse. Pastikan format nomor soal benar (1. ... 2. ...)");
        return;
      }
      setParsed(result);
      setGeneratedJson(JSON.stringify(result, null, 2));
    } catch (e: any) {
      alert("Gagal parse: " + e.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soal_${selectedSubtest.toLowerCase().replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setReadingText("");
    setQuestionsText("");
    setAnswerKeyText("");
    setGeneratedJson("");
    setParsed([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) handleReset(); }}>
      <DialogContent className="max-w-[95vw] w-[1300px] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generator JSON Soal SNBT
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">Paste teks bacaan & soal → generate JSON siap upload</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Subtest Selector */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-4 flex-wrap">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Subtes:</label>
          <div className="flex flex-wrap gap-2">
            {OFFICIAL_SNBT_SUBTESTS.map(s => (
              <button
                key={s.name}
                onClick={() => setSelectedSubtest(s.name)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  selectedSubtest === s.name
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                }`}
              >
                {s.name} <span className="opacity-60">({s.max})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-column area */}
        <div className="flex flex-1 min-h-0 divide-x divide-slate-200 overflow-hidden">
          {/* Left: Teks Bacaan */}
          <div className="flex flex-col w-[35%] min-w-0">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
              <p className="text-xs font-bold text-slate-700">📄 Teks Bacaan <span className="text-slate-400 font-normal">(opsional — akan ditempel di atas setiap soal)</span></p>
            </div>
            <textarea
              value={readingText}
              onChange={e => setReadingText(e.target.value)}
              className="flex-1 p-4 text-xs font-mono resize-none focus:outline-none text-slate-700 leading-relaxed"
              placeholder={`Teks Bacaan 1\n(1) Sekitar 200 juta penduduk Amerika Serikat...\n(2) Akibat fenomena bom siklon...\n\n(Teks ini akan otomatis ditempel sebelum setiap soal yang di-parse)`}
            />
          </div>

          {/* Right: Soal + Kunci */}
          <div className="flex flex-col flex-1 min-w-0 divide-y divide-slate-200">
            <div className="flex flex-col flex-[3] min-h-0">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">📝 Soal + Pilihan Jawaban</p>
                <span className="text-[10px] text-slate-400">Format: 1. Soal... A. ... B. ... C. ... D. ... E. ...</span>
              </div>
              <textarea
                value={questionsText}
                onChange={e => setQuestionsText(e.target.value)}
                className="flex-1 p-4 text-xs font-mono resize-none focus:outline-none text-slate-700 leading-relaxed"
                placeholder={`1. Jika ingin menambahkan informasi agar isi paragraf lebih utuh...\nA. Diletakkan sebagai pembuka pada paragraf pertama.\nB. Disisipkan sebelum kalimat (2).\nC. Ditempatkan setelah kalimat (3).\nD. Disisipkan sebelum kalimat (4).\nE. Dijadikan sebagai kalimat penutup.\n\n2. Apabila informasi pada pertanyaan nomor (1) dimasukkan...\nA. Kalimat (4)\nB. Kalimat (5)\n...`}
              />
            </div>
            <div className="flex flex-col flex-[1] min-h-0">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-700">🔑 Kunci Jawaban <span className="text-slate-400 font-normal">(satu per baris: "1. C" atau "1 C")</span></p>
              </div>
              <textarea
                value={answerKeyText}
                onChange={e => setAnswerKeyText(e.target.value)}
                className="flex-1 p-4 text-xs font-mono resize-none focus:outline-none text-slate-700"
                placeholder={`1. C\n2. B\n3. B\n4. C\n5. C`}
              />
            </div>
          </div>
        </div>

        {/* Action bar + preview */}
        <div className="border-t border-slate-200 bg-white">
          <div className="px-6 py-3 flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl px-6 gap-2 shadow"
            >
              <FileText className="h-4 w-4" />
              Generate JSON ({parsed.length} soal)
            </Button>
            {generatedJson && (
              <>
                <Button variant="outline" onClick={handleCopy} className="rounded-xl gap-2 border-slate-300">
                  {copied ? "✅ Tersalin!" : "Copy JSON"}
                </Button>
                <Button onClick={handleDownload} className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  ⬇ Download .json
                </Button>
                <span className="text-xs text-slate-500 ml-auto">{parsed.length} soal · subtes: <b>{selectedSubtest}</b></span>
              </>
            )}
            {!generatedJson && (
              <span className="text-xs text-slate-400 ml-auto">Isi kolom soal & kunci jawaban, lalu klik Generate</span>
            )}
          </div>

          {generatedJson && (
            <div className="px-6 pb-4">
              <div className="rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">
                <div className="px-4 py-2 bg-slate-800 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-slate-400 ml-2 font-mono">preview output JSON</span>
                </div>
                <textarea
                  readOnly
                  value={generatedJson}
                  className="w-full h-36 p-4 bg-transparent text-[11px] font-mono text-emerald-300 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
