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
import { MoreHorizontal, FileText, Calendar, Edit, Trash2, AlertTriangle, Save, X } from "lucide-react";
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

interface ArticleRecord {
  id: string;
  title: string;
  category: string;
  status: "published" | "draft";
  views_count: number;
  published_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Info SNBT",
    status: "draft" as "published" | "draft",
    views_count: 0,
  });

  const mockArticles: ArticleRecord[] = [
    {
      id: "art1",
      title: "Jadwal Resmi UTBK SNBT 2026 dan Tips Belajar",
      category: "Info SNBT",
      status: "published",
      views_count: 14200,
      published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "art2",
      title: "Rasionalisasi Nilai: Cara Jitu Mengukur Peluang Masuk PTN",
      category: "Tips Sukses",
      status: "draft",
      views_count: 0,
      published_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setArticles(mockArticles);
      } else if (data) {
        setArticles(data as ArticleRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setArticles(mockArticles);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      category: "Info SNBT",
      status: "draft",
      views_count: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (art: ArticleRecord) => {
    setEditingArticle(art);
    setFormData({
      title: art.title,
      category: art.category,
      status: art.status,
      views_count: art.views_count,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        published_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        if (editingArticle) {
          setArticles(prev => prev.map(a => (a.id === editingArticle.id ? { ...a, ...payload } : a)));
        } else {
          setArticles(prev => [
            ...prev,
            { id: `art_${Date.now()}`, ...payload },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingArticle) {
        const { error } = await supabase.from("articles").update(formData).eq("id", editingArticle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert([payload]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchArticles();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus artikel ini?")) return;
    try {
      if (isDemoMode) {
        setArticles(prev => prev.filter(a => a.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
      fetchArticles();
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Mode Demonstrasi Aktif</h4>
            <p className="text-[11px] text-amber-700">Tabel articles tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Artikel & Berita"
        description="Kelola publikasi info masuk PTN, tips belajar UTBK, berita edukasi, dan pengumuman platform."
        addButtonLabel="Tulis Artikel"
        onAddClick={handleCreate}
        searchPlaceholder="Cari artikel..."
        totalItems={articles.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Judul Artikel</TableHead>
              <TableHead className="font-bold text-slate-700">Kategori</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Dibaca</TableHead>
              <TableHead className="font-bold text-slate-700">Tanggal Rilis</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              articles.map((art) => (
                <TableRow key={art.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{art.title}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">{art.category}</TableCell>
                  <TableCell>
                    {art.status === "published" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[11px] px-2.5">
                        PUBLISHED
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-semibold text-[11px] px-2.5">
                        DRAFT
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">{art.views_count.toLocaleString()}x</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(art.published_at)}</span>
                    </div>
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
                        <DropdownMenuItem onClick={() => handleEdit(art)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Edit Konten</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(art.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Artikel</span>
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
            <DialogTitle>{editingArticle ? "Ubah Artikel" : "Tulis Artikel Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Artikel *</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Tips Lolos SNBT" />
            </div>
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Tips Sukses" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status *</Label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Jumlah Dibaca</Label>
                <Input type="number" value={formData.views_count} onChange={e => setFormData({ ...formData, views_count: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.title} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
