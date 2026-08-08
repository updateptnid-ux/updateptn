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
  { name: "Pengetahuan Kuantitatif", max: 15, category: "TPS", duration: 20 },
  { name: "Literasi dalam Bahasa Indonesia", max: 30, category: "Tes Literasi", duration: 45 },
  { name: "Literasi dalam Bahasa Inggris", max: 20, category: "Tes Literasi", duration: 30 },
  { name: "Penalaran Matematika", max: 20, category: "Tes Literasi", duration: 30 },
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
  const [isGeneratorDialogOpen, setIsGeneratorDialogOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
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
        .order("scheduled_date", { ascending: false });

      if (data) {
        setTryouts(data as TryoutItem[]);
      }
      if (error) throw error;
    } catch (err) {
      console.error(err);
      alert("Gagal memuat daftar Try Out.");
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

      const questionsToInsert = parsed.map((q) => ({
        ...q,
        tryout_id: selectedTryout.id,
      }));

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
      alert("Gagal membaca atau mem-parsing file JSON.");
    } finally {
      setIsUploadingJson(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleGenerateJson = () => {
    try {
      const lines = rawText.split('\n').filter(l => l.trim() !== '');
      const jsonArray = lines.map((line, index) => {
        const parts = line.split('|');
        if (parts.length < 8) {
          throw new Error(`Baris ${index + 1} tidak valid. Kurang dari 8 kolom.`);
        }
        return {
          subtest: parts[0]?.trim() || "Penalaran Umum",
          text: parts[1]?.trim() || "",
          option_a: parts[2]?.trim() || "",
          option_b: parts[3]?.trim() || "",
          option_c: parts[4]?.trim() || "",
          option_d: parts[5]?.trim() || "",
          option_e: parts[6]?.trim() || "",
          correct_answer: parts[7]?.trim().toUpperCase() || "A",
          explanation: parts[8]?.trim() || ""
        };
      });
      setGeneratedJson(JSON.stringify(jsonArray, null, 2));
    } catch (e: any) {
      alert("Gagal mem-parsing teks: " + e.message);
    }
  };

  const handleCopyJson = () => {
    if (!generatedJson) return;
    navigator.clipboard.writeText(generatedJson);
    alert("JSON berhasil di-copy! Silakan paste ke notepad dan save sebagai .json, atau gunakan langsung.");
  };

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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bank Soal UTBK</h1>
            <p className="text-sm text-slate-500 mt-1">Pilih paket Try Out untuk mengelola soal di dalamnya.</p>
          </div>
          <Button
            onClick={() => setIsGeneratorDialogOpen(true)}
            className="rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold gap-2 h-11 px-5 shadow-sm"
          >
            <FileText className="h-4 w-4" />
            <span>Alat Generator JSON</span>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat paket Try Out...</div>
        ) : tryouts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl">
            Belum ada paket Try Out. Buat di menu Manajemen Try Out.
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

        <GeneratorDialog />
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
              <textarea
                value={formData.text}
                onChange={e => setFormData({ ...formData, text: e.target.value })}
                className="w-full h-24 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
      <GeneratorDialog />
    </div>
  );

  function GeneratorDialog() {
    return (
      <Dialog open={isGeneratorDialogOpen} onOpenChange={setIsGeneratorDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generator JSON Soal UTBK</DialogTitle>
            <DialogDescription>
              Ubah teks CSV raw menjadi format JSON yang valid untuk diupload saat membuat Try Out.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Paste teks CSV di sini</Label>
              <p className="text-[11px] text-slate-500">
                Format per baris, dipisahkan dengan tanda pipe (|): <br />
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">
                  Subtest | Soal | A | B | C | D | E | Kunci Jawaban | Pembahasan (Opsional)
                </code>
              </p>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                className="w-full h-40 p-3 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Penalaran Umum | Siapa presiden RI ke-1? | Soekarno | Soeharto | Habibie | Gus Dur | Megawati | A | Jelas"
              />
            </div>

            <Button onClick={handleGenerateJson} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              Generate JSON
            </Button>

            {generatedJson && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label>Hasil JSON</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyJson} className="h-7 text-[11px] rounded-lg">
                      Copy JSON
                    </Button>
                    <Button variant="default" size="sm" onClick={() => {
                      if (!generatedJson) return;
                      const blob = new Blob([generatedJson], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "soal_tryout.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    }} className="h-7 text-[11px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                      Download JSON
                    </Button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={generatedJson}
                  className="w-full h-48 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsGeneratorDialogOpen(false); setGeneratedJson(""); setRawText(""); }}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}
