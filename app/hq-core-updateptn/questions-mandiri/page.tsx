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
import { MoreHorizontal, FileQuestion, Edit, Trash2, FileText, ArrowLeft, FolderOpen, Calendar, Database, Upload } from "lucide-react";
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

export default function AdminQuestionsMandiriPage() {
  const [tryouts, setTryouts] = useState<TryoutItem[]>([]);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [selectedTryout, setSelectedTryout] = useState<TryoutItem | null>(null);
  
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
    subtest: "Umum",
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
        .eq("tryout_type", "mandiri") // ← FILTER: Hanya Mandiri
        .order("scheduled_date", { ascending: false });

      if (data) {
        setTryouts(data as TryoutItem[]);
      }
      if (error) throw error;
    } catch (err) {
      console.error(err);
      alert("Gagal memuat daftar Try Out Mandiri.");
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
      subtest: "Umum",
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
      subtest: q.subtest || "Umum",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
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
      e.target.value = "";
    }
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bank Soal Try Out Mandiri</h1>
            <p className="text-sm text-slate-500 mt-1">Pilih paket Try Out Mandiri untuk mengelola soal di dalamnya.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat paket Try Out...</div>
        ) : tryouts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl">
            Belum ada paket Try Out Mandiri. Buat di menu "Buat Try Out Mandiri".
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
            <p className="text-xs text-slate-500">Kelola soal untuk paket Try Out Mandiri ini.</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Soal</span>
          <span className="text-sm font-black text-slate-900">{questions.length} Soal</span>
        </div>
      </div>

      <CrudLayout
        title=""
        description=""
        addButtonLabel="Tambah Soal Manual"
        onAddClick={handleCreate}
        searchPlaceholder="Cari soal..."
        totalItems={questions.length}
        currentPage={1}
        totalPages={1}
        filterComponent={
          <div className="flex items-center gap-3">
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
              <TableHead className="font-bold text-slate-700">Kategori</TableHead>
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
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">
                  Belum ada soal di Try Out ini. Silakan upload JSON atau tambah manual.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((quest) => (
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
                      {quest.subtest}
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
              Isi formulir di bawah ini untuk mengelola soal Try Out Mandiri.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kategori Soal</Label>
              <Input
                value={formData.subtest}
                onChange={e => setFormData({ ...formData, subtest: e.target.value })}
                placeholder="Contoh: Matematika Dasar, TPA, dll"
              />
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
              <Label>Pembahasan (opsional)</Label>
              <textarea
                value={formData.explanation}
                onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full h-24 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Tulis pembahasan soal di sini..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
