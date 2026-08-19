"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { insertVideo, updateVideo, deleteVideo } from "@/actions/mentor-crud";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  PlaySquare,
  Search,
  Eye,
  Clock,
  ExternalLink,
} from "lucide-react";

interface VideoRecord {
  id: string;
  title: string;
  category: string;
  url: string;
  duration: string;
  views_count: number;
  is_premium: boolean;
  created_at: string;
}

const CATEGORIES = [
  "Penalaran Umum",
  "Pengetahuan Kuantitatif",
  "Literasi Indonesia",
  "Literasi Inggris",
  "Penalaran Matematika",
];

export default function MentorVideoPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [filtered, setFiltered] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Penalaran Umum",
    url: "",
    duration: "",
    is_premium: false,
    views_count: 0,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(videos);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(
        videos.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, videos]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setVideos(data as VideoRecord[]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVideo(null);
    setFormData({
      title: "",
      category: "Penalaran Umum",
      url: "",
      duration: "",
      is_premium: false,
      views_count: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (v: VideoRecord) => {
    setEditingVideo(v);
    setFormData({
      title: v.title,
      category: v.category,
      url: v.url,
      duration: v.duration || "",
      is_premium: v.is_premium || false,
      views_count: v.views_count || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let result;
      if (editingVideo) {
        result = await updateVideo(editingVideo.id, formData);
      } else {
        result = await insertVideo(formData);
      }
      if (!result.ok) throw new Error(result.message);
      setIsDialogOpen(false);
      fetchVideos();
    } catch (err) {
      alert("Gagal menyimpan: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus video ini?")) return;
    try {
      const result = await deleteVideo(id);
      if (!result.ok) throw new Error(result.message);
      fetchVideos();
    } catch (err) {
      alert("Gagal menghapus: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    }
  };

  const formatViews = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n?.toString() || "0";
  };

  const totalViews = videos.reduce((acc, v) => acc + (v.views_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Video Pembelajaran
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola video materi UTBK/SNBT yang dapat diakses siswa
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-md shadow-blue-200 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Tambah Video
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 rounded-xl border border-slate-200 bg-white">
          <p className="text-2xl font-extrabold text-slate-900">
            {loading ? "—" : videos.length}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            Total Video
          </p>
        </Card>
        <Card className="p-4 rounded-xl border border-slate-200 bg-white">
          <p className="text-2xl font-extrabold text-slate-900">
            {loading ? "—" : formatViews(totalViews)}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            Total Views
          </p>
        </Card>
        <Card className="p-4 rounded-xl border border-slate-200 bg-white">
          <p className="text-2xl font-extrabold text-slate-900">
            {loading
              ? "—"
              : videos.filter((v) => v.is_premium).length}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            Video Premium
          </p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari video..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-xl border-slate-200 text-sm"
        />
      </div>

      {/* Table */}
      <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-slate-400">
              <PlaySquare className="h-5 w-5 animate-pulse text-blue-400" />
              <span className="text-sm font-semibold">Memuat video...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <PlaySquare className="h-10 w-10 text-slate-200 mx-auto" />
            <p className="text-sm text-slate-400 font-semibold">
              {searchQuery
                ? "Tidak ada video yang cocok"
                : "Belum ada video. Tambahkan yang pertama!"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="font-bold text-slate-700">Judul</TableHead>
                <TableHead className="font-bold text-slate-700">
                  Kategori
                </TableHead>
                <TableHead className="font-bold text-slate-700">
                  Durasi
                </TableHead>
                <TableHead className="font-bold text-slate-700">Views</TableHead>
                <TableHead className="font-bold text-slate-700">Tipe</TableHead>
                <TableHead className="font-bold text-slate-700">Link</TableHead>
                <TableHead className="font-bold text-slate-700 text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow
                  key={v.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 shrink-0">
                        <PlaySquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">
                        {v.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {v.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {v.duration || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Eye className="h-3 w-3" />
                      {formatViews(v.views_count || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {v.is_premium ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                        Premium
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-bold">
                        Gratis
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {v.url ? (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-semibold"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Buka
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(v)}
                        className="h-8 px-3 rounded-lg hover:border-blue-300 hover:text-blue-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(v.id)}
                        className="h-8 px-3 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              {editingVideo ? "Edit Video" : "Tambah Video Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {editingVideo ? "Perbarui" : "Isi"} informasi video pembelajaran.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Judul Video *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Contoh: Konsep Silogisme – Penalaran Umum"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Kategori *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v || "Penalaran Umum" })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Durasi
                </Label>
                <Input
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="20:30"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                URL Video (YouTube / Vimeo / Drive) *
              </Label>
              <Input
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
                className="rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_premium}
                onChange={(e) =>
                  setFormData({ ...formData, is_premium: e.target.checked })
                }
                className="rounded accent-blue-600"
              />
              <span className="text-sm font-semibold text-slate-700">
                Video Premium (hanya untuk subscriber)
              </span>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl"
            >
              <X className="h-4 w-4 mr-1.5" />
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.title || !formData.url}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5"
            >
              {isSaving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
