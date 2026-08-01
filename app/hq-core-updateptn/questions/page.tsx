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
import { MoreHorizontal, FileQuestion, Edit, Trash2, CheckCircle2, X, Save, AlertTriangle, Upload } from "lucide-react";
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

interface QuestionRecord {
  id: string;
  tryout_id: string;
  tryout_title: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string | null;
}

interface TryoutItem {
  id: string;
  title: string;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [tryouts, setTryouts] = useState<TryoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadTargetTryoutId, setUploadTargetTryoutId] = useState("");
  const [uploadingBulk, setUploadingBulk] = useState(false);
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
  });

  const mockQuestions: QuestionRecord[] = [
    {
      id: "q1",
      tryout_id: "t1",
      tryout_title: "Try Out SNBT 2026 - Episode 1",
      text: "Jika p -> q bernilai salah, manakah dari pernyataan berikut yang pasti bernilai benar?",
      option_a: "p bernilai salah dan q bernilai benar",
      option_b: "p bernilai benar dan q bernilai salah",
      option_c: "p bernilai benar dan q bernilai benar",
      option_d: "p bernilai salah dan q bernilai salah",
      option_e: "Tidak dapat ditentukan nilai kebenarannya",
      correct_answer: "B",
      explanation: "Implikasi p -> q hanya bernilai salah jika p benar dan q salah.",
    },
    {
      id: "q2",
      tryout_id: "t1",
      tryout_title: "Try Out SNBT 2026 - Episode 1",
      text: "Suatu barisan aritmatika memiliki suku ke-3 sama dengan 11 dan suku ke-7 sama dengan 27. Berapakah suku ke-10?",
      option_a: "35",
      option_b: "37",
      option_c: "39",
      option_d: "41",
      option_e: "43",
      correct_answer: "C",
      explanation: "Beda b=4, suku pertama a=3. Suku ke-10 adalah 3 + 9(4) = 39.",
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data: toData } = await supabase.from("tryouts").select("id, title");
      if (toData && toData.length > 0) {
        setTryouts(toData);
        setUploadTargetTryoutId(toData[0].id);
      }

      const { data, error } = await supabase
        .from("questions")
        .select("*, tryouts(title)")
        .order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setQuestions(mockQuestions);
      } else if (data) {
        setQuestions(
          data.map((item: any) => ({
            id: item.id,
            tryout_id: item.tryout_id,
            tryout_title: item.tryouts?.title || "Umum / Bank Soal",
            text: item.text,
            option_a: item.option_a,
            option_b: item.option_b,
            option_c: item.option_c,
            option_d: item.option_d,
            option_e: item.option_e,
            correct_answer: item.correct_answer,
            explanation: item.explanation,
          }))
        );
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setQuestions(mockQuestions);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData({
      tryout_id: tryouts[0]?.id || "",
      text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A",
      explanation: "",
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
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const toTitle = tryouts.find(t => t.id === formData.tryout_id)?.title || "Umum";

      if (isDemoMode) {
        if (editingQuestion) {
          setQuestions(prev =>
            prev.map(q => (q.id === editingQuestion.id ? { ...q, ...formData, tryout_title: toTitle } : q))
          );
        } else {
          setQuestions(prev => [
            ...prev,
            { id: `q_${Date.now()}`, ...formData, tryout_title: toTitle },
          ]);
        }
        setIsDialogOpen(false);
        return;
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
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBulk(true);
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        alert("Gagal: Format JSON harus berupa array objek soal!");
        return;
      }

      if (!uploadTargetTryoutId) {
        alert("Gagal: Pilih paket Try Out terlebih dahulu!");
        return;
      }

      const questionsToInsert = parsed.map((q: any) => ({
        tryout_id: uploadTargetTryoutId,
        text: q.text || q.question_text || "",
        option_a: q.option_a || "",
        option_b: q.option_b || "",
        option_c: q.option_c || "",
        option_d: q.option_d || "",
        option_e: q.option_e || "",
        correct_answer: q.correct_answer || "A",
        explanation: q.explanation || null,
      }));

      if (isDemoMode) {
        setQuestions(prev => [
          ...questionsToInsert.map((q, idx) => ({
            id: `q_bulk_${Date.now()}_${idx}`,
            tryout_id: q.tryout_id,
            tryout_title: tryouts.find(t => t.id === q.tryout_id)?.title || "Demo Tryout",
            text: q.text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            option_e: q.option_e,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })),
          ...prev,
        ]);
        alert(`[Demo Mode] Simulasi berhasil mengunggah ${questionsToInsert.length} soal!`);
        setIsUploadDialogOpen(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.from("questions").insert(questionsToInsert);
      if (error) throw error;

      alert(`Berhasil mengunggah ${questionsToInsert.length} soal ke database!`);
      setIsUploadDialogOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal memproses file: " + (err as Error).message);
    } finally {
      setUploadingBulk(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus soal ini?")) return;
    try {
      if (isDemoMode) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Mode Demonstrasi Aktif</h4>
            <p className="text-[11px] text-amber-700">Tabel questions tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Bank Soal UTBK"
        description="Manajemen bank soal persiapan UTBK SNBT, kunci jawaban, subtes mapel, dan video/teks pembahasan."
        addButtonLabel="Tambah Soal"
        onAddClick={handleCreate}
        searchPlaceholder="Cari berdasarkan teks soal..."
        totalItems={questions.length}
        currentPage={1}
        totalPages={1}
        filterComponent={
          <Button
            variant="outline"
            onClick={() => setIsUploadDialogOpen(true)}
            className="rounded-xl border border-slate-200 hover:bg-slate-50 font-bold gap-2 text-slate-700 h-10 px-4"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Bulk Upload Soal</span>
          </Button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Soal</TableHead>
              <TableHead className="font-bold text-slate-700">Try Out Terkait</TableHead>
              <TableHead className="font-bold text-slate-700">Kunci Jawaban</TableHead>
              <TableHead className="font-bold text-slate-700">Pembahasan</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              questions.map((quest) => (
                <TableRow key={quest.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 max-w-xs font-medium text-slate-900 truncate">
                    <div className="flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate">{quest.text}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold truncate max-w-[150px]">
                    {quest.tryout_title}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-black text-xs gap-1 px-2.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Kunci: {quest.correct_answer}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 truncate max-w-[200px]">
                    {quest.explanation || "Belum ada pembahasan"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Opsi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(quest)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Soal</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(quest.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Soal</span>
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
            <DialogTitle>{editingQuestion ? "Ubah Soal" : "Tambah Soal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Paket Try Out *</Label>
              {isDemoMode ? (
                <select
                  value={formData.tryout_id}
                  onChange={e => setFormData({ ...formData, tryout_id: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="t1">Try Out SNBT 2026 - Episode 1</option>
                </select>
              ) : (
                <select
                  value={formData.tryout_id}
                  onChange={e => setFormData({ ...formData, tryout_id: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {tryouts.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              )}
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

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Upload Soal UTBK</DialogTitle>
            <DialogDescription>
              Unggah berkas JSON berisi daftar soal untuk dimasukkan sekaligus ke dalam sistem.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Target Paket Try Out *</Label>
              <select
                value={uploadTargetTryoutId}
                onChange={e => setUploadTargetTryoutId(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                {tryouts.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Berkas JSON Soal *</Label>
              <Input
                type="file"
                accept=".json"
                onChange={handleBulkUpload}
                disabled={uploadingBulk}
                className="rounded-xl file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-[11px] text-slate-500 leading-normal pt-1">
                Berkas harus berformat array JSON dengan struktur keys: <br />
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">text</code>, 
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono"> option_a</code> s.d. 
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono"> option_e</code>, 
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono"> correct_answer</code>, 
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono"> explanation</code>.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Batal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
