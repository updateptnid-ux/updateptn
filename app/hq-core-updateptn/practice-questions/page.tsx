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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye, Upload } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

interface PracticeQuestion {
  id: string;
  module_id: string;
  module_title?: string;
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

interface Module {
  id: string;
  title: string;
  subtes_category: string;
}

export default function PracticeQuestionsPage() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PracticeQuestion | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    module_id: "",
    question_number: 1,
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    option_e: "",
    correct_answer: "A",
    explanation: "",
  });

  useEffect(() => {
    fetchModules();
    fetchQuestions();
  }, [selectedModule]);

  const fetchModules = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subtes_modules")
        .select("id, title, subtes_category")
        .eq("is_active", true)
        .order("subtes_category")
        .order("order_index");

      if (error) {
        console.error("Error fetching modules:", error);
        setError("Gagal memuat modul: " + error.message);
        return;
      }
      
      if (data) {
        setModules(data as Module[]);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError("Gagal memuat modul: " + err.message);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      
      let query = supabase
        .from("practice_questions")
        .select(`
          *,
          subtes_modules!inner (
            title,
            subtes_category
          )
        `)
        .order("question_number");

      if (selectedModule) {
        query = query.eq("module_id", selectedModule);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching questions:", error);
        setError("Gagal memuat soal: " + error.message);
        return;
      }
      
      if (data) {
        const mapped = data.map((q: any) => ({
          ...q,
          module_title: q.subtes_modules.title,
        }));
        setQuestions(mapped);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError("Gagal memuat soal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData({
      module_id: selectedModule || (modules[0]?.id || ""),
      question_number: 1,
      question_text: "",
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

  const handleEdit = (question: PracticeQuestion) => {
    setEditingQuestion(question);
    setFormData({
      module_id: question.module_id,
      question_number: question.question_number,
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      option_e: question.option_e,
      correct_answer: question.correct_answer,
      explanation: question.explanation || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question_text.trim()) {
      alert("Soal wajib diisi!");
      return;
    }

    try {
      setIsSaving(true);
      const supabase = createClient();

      if (editingQuestion) {
        const { error } = await supabase
          .from("practice_questions")
          .update(formData)
          .eq("id", editingQuestion.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("practice_questions")
          .insert([formData]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchQuestions();
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus soal ini?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("practice_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchQuestions();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const handleBatchUpload = async () => {
    if (!uploadFile) {
      alert("Pilih file JSON terlebih dahulu!");
      return;
    }

    if (!selectedModule) {
      alert("Pilih modul target terlebih dahulu!");
      return;
    }

    try {
      setIsSaving(true);
      const text = await uploadFile.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        alert("Format JSON salah! Harus berupa array soal.");
        return;
      }

      const supabase = createClient();
      const questionsToInsert = data.map((q, idx) => ({
        module_id: selectedModule,
        question_number: q.question_number || idx + 1,
        question_text: q.question_text || q.soal || "",
        option_a: q.option_a || q.a || "",
        option_b: q.option_b || q.b || "",
        option_c: q.option_c || q.c || "",
        option_d: q.option_d || q.d || "",
        option_e: q.option_e || q.e || "",
        correct_answer: q.correct_answer || q.jawaban_benar || "A",
        explanation: q.explanation || q.pembahasan || "",
      }));

      const { error } = await supabase
        .from("practice_questions")
        .insert(questionsToInsert);

      if (error) throw error;

      alert(`Berhasil upload ${questionsToInsert.length} soal!`);
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      fetchQuestions();
    } catch (err: any) {
      alert("Gagal upload: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">⚠️ Error</p>
          <p className="text-sm text-red-700">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              fetchModules();
              fetchQuestions();
            }}
            className="mt-4"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter by Module */}
      <div className="flex items-center gap-3">
        <Label className="font-bold text-sm">Filter Modul:</Label>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="h-10 px-3 border border-slate-200 rounded-xl text-sm"
        >
          <option value="">Semua Modul</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
        
        <Button
          onClick={() => setIsUploadDialogOpen(true)}
          variant="outline"
          className="ml-auto gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload JSON
        </Button>
      </div>

      <CrudLayout
        title="Soal Latihan Per Subtes"
        description="Kelola bank soal untuk latihan per modul subtes"
        addButtonLabel="Tambah Soal"
        onAddClick={handleCreate}
        searchPlaceholder="Cari soal..."
        totalItems={questions.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">No</TableHead>
              <TableHead className="font-bold text-slate-700">Modul</TableHead>
              <TableHead className="font-bold text-slate-700">Soal</TableHead>
              <TableHead className="font-bold text-slate-700">Jawaban</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">
                  Belum ada soal.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <TableRow key={q.id} className="border-slate-100 hover:bg-slate-50/60">
                  <TableCell className="font-bold">{q.question_number}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {q.module_title}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2">{q.question_text}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-700 font-bold">
                      {q.correct_answer}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-8 w-8 hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Opsi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(q)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(q.id)} variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CrudLayout>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modul *</Label>
                <select
                  value={formData.module_id}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  className="w-full h-10 px-3 border rounded-xl text-sm"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Nomor Soal *</Label>
                <Input
                  type="number"
                  value={formData.question_number}
                  onChange={(e) => setFormData({ ...formData, question_number: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Soal *</Label>
              <Textarea
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                rows={4}
              />
            </div>

            {["A", "B", "C", "D", "E"].map((opt) => (
              <div key={opt} className="space-y-2">
                <Label>Opsi {opt} *</Label>
                <Input
                  value={formData[`option_${opt.toLowerCase()}` as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [`option_${opt.toLowerCase()}`]: e.target.value })}
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label>Jawaban Benar *</Label>
              <select
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                className="w-full h-10 px-3 border rounded-xl text-sm"
              >
                {["A", "B", "C", "D", "E"].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Pembahasan</Label>
              <Textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={3}
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

      {/* Upload JSON Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Soal dari JSON</DialogTitle>
            <DialogDescription>
              Upload file JSON berisi array soal untuk modul tertentu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Modul Target *</Label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full h-10 px-3 border rounded-xl text-sm"
              >
                <option value="">-- Pilih Modul --</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>File JSON *</Label>
              <Input
                type="file"
                accept=".json"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-slate-500">
                Format: Array JSON dengan field: question_text, option_a-e, correct_answer, explanation
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs font-bold text-slate-700 mb-2">Contoh Format JSON:</p>
              <pre className="text-[10px] text-slate-600 overflow-x-auto">
{`[
  {
    "question_number": 1,
    "question_text": "Soal...",
    "option_a": "Jawaban A",
    "option_b": "Jawaban B",
    "option_c": "Jawaban C",
    "option_d": "Jawaban D",
    "option_e": "Jawaban E",
    "correct_answer": "A",
    "explanation": "Pembahasan..."
  }
]`}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleBatchUpload} disabled={isSaving || !uploadFile || !selectedModule}>
              {isSaving ? "Mengupload..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
