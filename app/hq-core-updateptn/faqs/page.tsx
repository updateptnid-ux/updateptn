"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CrudLayout from "@/components/admin/CrudLayout";
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
import { MoreHorizontal, HelpCircle, Edit, Trash2, AlertTriangle, Save, X } from "lucide-react";
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

interface FAQRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "Fitur Sistem",
  });

  const mockFaqs: FAQRecord[] = [
    {
      id: "f1",
      question: "Bagaimana cara melakukan Cek Peluang PTN?",
      answer: "Siswa perlu memasukkan nilai tryout terakhir atau input nilai manual, lalu memilih program studi target.",
      category: "Fitur Sistem",
    },
    {
      id: "f2",
      question: "Apakah ada pengembalian dana jika pembayaran gagal?",
      answer: "Semua sistem pembayaran terintegrasi otomatis dengan Midtrans. Pembayaran gagal akan langsung di-refund oleh penyedia metode pembayaran.",
      category: "Pembayaran & Finance",
    },
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("faqs").select("*").order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setFaqs(mockFaqs);
      } else if (data) {
        setFaqs(data as FAQRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setFaqs(mockFaqs);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFAQ(null);
    setFormData({
      question: "",
      answer: "",
      category: "Fitur Sistem",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (faq: FAQRecord) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (isDemoMode) {
        if (editingFAQ) {
          setFaqs(prev => prev.map(f => (f.id === editingFAQ.id ? { ...f, ...formData } : f)));
        } else {
          setFaqs(prev => [
            ...prev,
            { id: `faq_${Date.now()}`, ...formData },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingFAQ) {
        const { error } = await supabase.from("faqs").update(formData).eq("id", editingFAQ.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("faqs").insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchFaqs();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus FAQ ini?")) return;
    try {
      if (isDemoMode) {
        setFaqs(prev => prev.filter(f => f.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
      fetchFaqs();
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
            <p className="text-[11px] text-amber-700">Tabel faqs tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="FAQ Assistance"
        description="Kelola basis data pertanyaan umum (FAQ) untuk pusat bantuan bagi siswa UpdatePTN."
        addButtonLabel="Tambah FAQ"
        onAddClick={handleCreate}
        searchPlaceholder="Cari FAQ..."
        totalItems={faqs.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Pertanyaan</TableHead>
              <TableHead className="font-bold text-slate-700">Kategori</TableHead>
              <TableHead className="font-bold text-slate-700">Jawaban Ringkas</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2 max-w-xs truncate">
                    <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">{faq.question}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">{faq.category}</TableCell>
                  <TableCell className="text-xs text-slate-500 truncate max-w-xs">{faq.answer}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(faq)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah FAQ</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(faq.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus FAQ</span>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFAQ ? "Ubah FAQ" : "Tambah FAQ Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pertanyaan *</Label>
              <Input value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} placeholder="Bagaimana cara...?" />
            </div>
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Fitur Sistem" />
            </div>
            <div className="space-y-2">
              <Label>Jawaban Lengkap *</Label>
              <textarea
                value={formData.answer}
                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                className="w-full h-24 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Tulis jawaban di sini..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.question || !formData.answer} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
