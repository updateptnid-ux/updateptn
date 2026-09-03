"use client";

/**
 * Admin Articles CRUD Page
 * Full-featured article management with rich text editor
 * Security: All operations validated and sanitized
 */

import { useState, useEffect } from "react";
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
import { 
  MoreHorizontal, 
  FileText, 
  Calendar, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Eye,
  Star,
  TrendingUp
} from "lucide-react";
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
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ImageUpload } from "@/components/editor/ImageUpload";
import {
  getArticlesAdmin,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadArticleImage,
} from "@/actions/articles";
import type { Article, ArticleFormData } from "@/types/article";

const CATEGORIES = [
  "Info SNBT",
  "Tips Sukses",
  "Berita Pendidikan",
  "Pengumuman",
  "Tutorial",
  "Lainnya",
];

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    excerpt: "",
    category: "Info SNBT",
    tags: [],
    author: "",
    featured_image: "",
    seo_title: "",
    seo_description: "",
    status: "draft",
    is_featured: false,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const result = await getArticlesAdmin();
      
      if (result.success && result.data) {
        setArticles(result.data);
      } else {
        alert("Gagal memuat artikel: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "Info SNBT",
      tags: [],
      author: "Admin UpdatePTN",
      featured_image: "",
      seo_title: "",
      seo_description: "",
      status: "draft",
      is_featured: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (art: Article) => {
    setEditingArticle(art);
    setFormData({
      title: art.title,
      slug: art.slug,
      content: art.content,
      excerpt: art.excerpt || "",
      category: art.category,
      tags: art.tags || [],
      author: art.author || "Admin UpdatePTN",
      featured_image: art.featured_image || "",
      seo_title: art.seo_title || art.title,
      seo_description: art.seo_description || art.excerpt || "",
      status: art.status,
      is_featured: art.is_featured,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      alert("Judul artikel harus diisi");
      return;
    }

    if (!formData.content.trim()) {
      alert("Konten artikel harus diisi");
      return;
    }

    try {
      setIsSaving(true);
      
      let result;
      if (editingArticle) {
        result = await updateArticle(editingArticle.id, formData);
      } else {
        result = await createArticle(formData);
      }

      if (result.success) {
        setIsDialogOpen(false);
        fetchArticles();
      } else {
        alert("Gagal menyimpan: " + result.error);
      }
    } catch (err) {
      alert("Error: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const result = await deleteArticle(id);
      
      if (result.success) {
        fetchArticles();
      } else {
        alert("Gagal menghapus: " + result.error);
      }
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadArticleImage(file, editingArticle?.id);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || "Upload failed");
    }

    return result.data;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
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

  const filteredArticles = articles.filter((art) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      art.title.toLowerCase().includes(query) ||
      art.category.toLowerCase().includes(query) ||
      art.excerpt?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      <CrudLayout
        title="Artikel & Berita"
        description="Kelola publikasi info masuk PTN, tips belajar UTBK, berita edukasi, dan pengumuman platform."
        addButtonLabel="Tulis Artikel"
        onAddClick={handleCreate}
        searchPlaceholder="Cari artikel..."
        onSearchChange={setSearchQuery}
        totalItems={filteredArticles.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Judul Artikel</TableHead>
              <TableHead className="font-bold text-slate-700">Kategori</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Views</TableHead>
              <TableHead className="font-bold text-slate-700">Tanggal</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada artikel"}
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((art) => (
                <TableRow key={art.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{art.title}</span>
                          {art.is_featured && (
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        {art.excerpt && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {art.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">
                    {art.category}
                  </TableCell>
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
                  <TableCell className="text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-slate-400" />
                      {art.views_count.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(art.published_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Opsi
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleEdit(art)} 
                          className="cursor-pointer gap-2"
                        >
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Edit Artikel</span>
                        </DropdownMenuItem>
                        {art.status === "published" && (
                          <DropdownMenuItem 
                            onClick={() => window.open(`/articles/${art.slug}`, '_blank')}
                            className="cursor-pointer gap-2"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                            <span>Lihat Publik</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(art.id, art.title)} 
                          className="text-rose-600 cursor-pointer gap-2 focus:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Create/Edit Dialog - Mobile Optimized */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              {editingArticle ? "Edit Artikel" : "Tulis Artikel Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingArticle 
                ? "Perbarui konten artikel yang sudah ada" 
                : "Buat artikel baru untuk platform UpdatePTN"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-bold text-slate-700">Informasi Dasar</h3>
              
              <div className="space-y-2">
                <Label>Judul Artikel *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Tips Lolos SNBT 2026"
                  style={{ fontSize: '16px' }}
                  className="touch-manipulation"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white touch-manipulation"
                    style={{ fontSize: '16px' }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Penulis</Label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Admin UpdatePTN"
                    style={{ fontSize: '16px' }}
                    className="touch-manipulation"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Excerpt/Ringkasan</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Ringkasan singkat artikel (maks 200 karakter)..."
                  maxLength={200}
                  rows={2}
                  style={{ fontSize: '16px' }}
                  className="touch-manipulation resize-none"
                />
                <p className="text-xs text-slate-500">
                  {formData.excerpt?.length || 0}/200 karakter
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tags (pisahkan dengan koma)</Label>
                <Input
                  value={formData.tags?.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="snbt, tips belajar, utbk"
                  style={{ fontSize: '16px' }}
                  className="touch-manipulation"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-bold text-slate-700">Gambar Utama</h3>
              <ImageUpload
                value={formData.featured_image}
                onChange={(url) => setFormData({ ...formData, featured_image: url })}
                onUpload={handleImageUpload}
              />
            </div>

            {/* Content */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-bold text-slate-700">Konten Artikel *</h3>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                onImageUpload={handleImageUpload}
                placeholder="Tulis konten artikel di sini..."
              />
            </div>

            {/* SEO */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-bold text-slate-700">SEO & Meta</h3>
              
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  placeholder="Judul untuk search engine (opsional)"
                  style={{ fontSize: '16px' }}
                  className="touch-manipulation"
                />
              </div>

              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  placeholder="Deskripsi untuk search engine (opsional)"
                  maxLength={160}
                  rows={2}
                  style={{ fontSize: '16px' }}
                  className="touch-manipulation resize-none"
                />
                <p className="text-xs text-slate-500">
                  {formData.seo_description?.length || 0}/160 karakter
                </p>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-bold text-slate-700">Opsi Publikasi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      status: e.target.value as 'published' | 'draft'
                    })}
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white touch-manipulation"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="draft">Draft (Belum Dipublikasi)</option>
                    <option value="published">Published (Publik)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-8">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>Artikel Unggulan</span>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
              className="touch-manipulation"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !formData.title || !formData.content}
              className="bg-blue-600 hover:bg-blue-700 text-white touch-manipulation"
            >
              {isSaving ? "Menyimpan..." : "Simpan Artikel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
