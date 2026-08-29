"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { insertModul, updateModul, deleteModul, insertVideo, updateVideo, deleteVideo } from "@/actions/mentor-crud";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BookOpen,
  Search,
  ExternalLink,
  FileText,
  PlaySquare,
  Video,
  Clock,
  Eye,
} from "lucide-react";

interface ModulRecord {
  id: string;
  title: string;
  description?: string;
  category: string;
  pdf_url?: string;
  is_premium: boolean;
  order_index?: number;
  created_at: string;
}

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
  "Umum",
];

export default function MentorModulPage() {
  const [activeTab, setActiveTab] = useState<"pdf" | "video">("pdf");
  const [moduls, setModuls] = useState<ModulRecord[]>([]);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [filteredModuls, setFilteredModuls] = useState<ModulRecord[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModul, setEditingModul] = useState<ModulRecord | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [modulFormData, setModulFormData] = useState({
    title: "",
    description: "",
    category: "Penalaran Umum",
    pdf_url: "",
    is_premium: false,
    order_index: 0,
  });

  const [videoFormData, setVideoFormData] = useState({
    title: "",
    category: "Penalaran Umum",
    url: "",
    duration: "",
    is_premium: false,
    views_count: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredModuls(moduls);
      setFilteredVideos(videos);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredModuls(
        moduls.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q)
        )
      );
      setFilteredVideos(
        videos.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, moduls, videos]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch moduls (PDFs)
      const { data: modulData, error: modulError } = await supabase
        .from("moduls")
        .select("*")
        .order("created_at", { ascending: false });

      if (!modulError && modulData) {
        setModuls(modulData as ModulRecord[]);
      }

      // Fetch videos
      const { data: videoData, error: videoError } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!videoError && videoData) {
        setVideos(videoData as VideoRecord[]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModul = () => {
    setEditingModul(null);
    setEditingVideo(null);
    setModulFormData({
      title: "",
      description: "",
      category: "Penalaran Umum",
      pdf_url: "",
      is_premium: false,
      order_index: moduls.length + 1,
    });
    setActiveTab("pdf");
    setIsDialogOpen(true);
  };

  const handleCreateVideo = () => {
    setEditingModul(null);
    setEditingVideo(null);
    setVideoFormData({
      title: "",
      category: "Penalaran Umum",
      url: "",
      duration: "",
      is_premium: false,
      views_count: 0,
    });
    setActiveTab("video");
    setIsDialogOpen(true);
  };

  const handleEditModul = (m: ModulRecord) => {
    setEditingModul(m);
    setEditingVideo(null);
    setModulFormData({
      title: m.title,
      description: m.description || "",
      category: m.category,
      pdf_url: m.pdf_url || "",
      is_premium: m.is_premium || false,
      order_index: m.order_index || 0,
    });
    setActiveTab("pdf");
    setIsDialogOpen(true);
  };

  const handleEditVideo = (v: VideoRecord) => {
    setEditingModul(null);
    setEditingVideo(v);
    setVideoFormData({
      title: v.title,
      category: v.category,
      url: v.url,
      duration: v.duration || "",
      is_premium: v.is_premium || false,
      views_count: v.views_count || 0,
    });
    setActiveTab("video");
    setIsDialogOpen(true);
  };

  const handleSaveModul = async () => {
    try {
      setIsSaving(true);
      let result;
      if (editingModul) {
        result = await updateModul(editingModul.id, modulFormData);
      } else {
        result = await insertModul(modulFormData);
      }
      if (!result.ok) throw new Error(result.message);
      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVideo = async () => {
    try {
      setIsSaving(true);
      let result;
      if (editingVideo) {
        result = await updateVideo(editingVideo.id, videoFormData);
      } else {
        result = await insertVideo(videoFormData);
      }
      if (!result.ok) throw new Error(result.message);
      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModul = async (id: string) => {
    if (!confirm("Yakin ingin menghapus modul PDF ini?")) return;
    try {
      const result = await deleteModul(id);
      if (!result.ok) throw new Error(result.message);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Yakin ingin menghapus video ini?")) return;
    try {
      const result = await deleteVideo(id);
      if (!result.ok) throw new Error(result.message);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    }
  };

  const categoryCount = (cat: string) =>
    moduls.filter((m) => m.category === cat).length;

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
            Modul Belajar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola video pembelajaran dan modul PDF untuk siswa
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pdf" | "video")} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
            <TabsTrigger 
              value="pdf" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg font-semibold gap-2"
            >
              <FileText className="h-4 w-4" />
              Modul PDF ({moduls.length})
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg font-semibold gap-2"
            >
              <PlaySquare className="h-4 w-4" />
              Video ({videos.length})
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={activeTab === "pdf" ? handleCreateModul : handleCreateVideo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-md shadow-blue-200 shrink-0"
          >
            <Plus className="h-4 w-4" />
            {activeTab === "pdf" ? "Tambah PDF" : "Tambah Video"}
          </Button>
        </div>

        {/* PDF Tab Content */}
        <TabsContent value="pdf" className="mt-0 space-y-6">
          {/* Category Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Card
                key={cat}
                className="p-3 rounded-xl border border-slate-200 bg-white text-center"
              >
                <p className="text-lg font-extrabold text-slate-900">
                  {loading ? "—" : categoryCount(cat)}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">
                  {cat}
                </p>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari modul PDF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 text-sm"
            />
          </div>

          {/* PDF Table */}
          <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center gap-2 text-slate-400">
                  <BookOpen className="h-5 w-5 animate-pulse text-blue-400" />
                  <span className="text-sm font-semibold">Memuat modul PDF...</span>
                </div>
              </div>
            ) : filteredModuls.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="h-10 w-10 text-slate-200 mx-auto" />
                <p className="text-sm text-slate-400 font-semibold">
                  {searchQuery
                    ? "Tidak ada modul PDF yang cocok"
                    : "Belum ada modul PDF. Tambahkan yang pertama!"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-bold text-slate-700">
                      Judul Modul
                    </TableHead>
                    <TableHead className="font-bold text-slate-700">
                      Kategori
                    </TableHead>
                    <TableHead className="font-bold text-slate-700">
                      Deskripsi
                    </TableHead>
                    <TableHead className="font-bold text-slate-700">Tipe</TableHead>
                    <TableHead className="font-bold text-slate-700">PDF</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModuls.map((m) => (
                    <TableRow
                      key={m.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-50 shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">
                            {m.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {m.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-500 max-w-xs truncate">
                          {m.description || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {m.is_premium ? (
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
                        {m.pdf_url ? (
                          <a
                            href={m.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-semibold"
                          >
                            <FileText className="h-3 w-3" />
                            Buka PDF
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
                            onClick={() => handleEditModul(m)}
                            className="h-8 px-3 rounded-lg hover:border-blue-300 hover:text-blue-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteModul(m.id)}
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
        </TabsContent>

        {/* Video Tab Content */}
        <TabsContent value="video" className="mt-0 space-y-6">
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

          {/* Video Table */}
          <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center gap-2 text-slate-400">
                  <PlaySquare className="h-5 w-5 animate-pulse text-blue-400" />
                  <span className="text-sm font-semibold">Memuat video...</span>
                </div>
              </div>
            ) : filteredVideos.length === 0 ? (
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
                  {filteredVideos.map((v) => (
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
                            onClick={() => handleEditVideo(v)}
                            className="h-8 px-3 rounded-lg hover:border-blue-300 hover:text-blue-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteVideo(v.id)}
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
        </TabsContent>
      </Tabs>

      {/* Dialog for PDF Modul */}
      <Dialog open={isDialogOpen && editingVideo === null} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              {editingModul ? "Edit Modul PDF" : "Tambah Modul PDF Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {editingModul ? "Perbarui" : "Isi"} informasi modul PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Judul Modul *
              </Label>
              <Input
                value={modulFormData.title}
                onChange={(e) =>
                  setModulFormData({ ...modulFormData, title: e.target.value })
                }
                placeholder="Contoh: Modul Silogisme & Penalaran Logis"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Kategori *
              </Label>
              <Select
                value={modulFormData.category}
                onValueChange={(v) =>
                  setModulFormData({ ...modulFormData, category: v || "Penalaran Umum" })
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
                Deskripsi
              </Label>
              <textarea
                value={modulFormData.description}
                onChange={(e) =>
                  setModulFormData({ ...modulFormData, description: e.target.value })
                }
                placeholder="Ringkasan isi modul..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                URL PDF / Google Drive
              </Label>
              <Input
                value={modulFormData.pdf_url}
                onChange={(e) =>
                  setModulFormData({ ...modulFormData, pdf_url: e.target.value })
                }
                placeholder="https://drive.google.com/..."
                className="rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modulFormData.is_premium}
                onChange={(e) =>
                  setModulFormData({ ...modulFormData, is_premium: e.target.checked })
                }
                className="rounded accent-blue-600"
              />
              <span className="text-sm font-semibold text-slate-700">
                Modul Premium (hanya untuk subscriber)
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
              onClick={handleSaveModul}
              disabled={isSaving || !modulFormData.title}
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

      {/* Dialog for Video */}
      <Dialog open={isDialogOpen && editingModul === null} onOpenChange={setIsDialogOpen}>
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
                value={videoFormData.title}
                onChange={(e) =>
                  setVideoFormData({ ...videoFormData, title: e.target.value })
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
                  value={videoFormData.category}
                  onValueChange={(v) =>
                    setVideoFormData({ ...videoFormData, category: v || "Penalaran Umum" })
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
                  value={videoFormData.duration}
                  onChange={(e) =>
                    setVideoFormData({ ...videoFormData, duration: e.target.value })
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
                value={videoFormData.url}
                onChange={(e) =>
                  setVideoFormData({ ...videoFormData, url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
                className="rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={videoFormData.is_premium}
                onChange={(e) =>
                  setVideoFormData({ ...videoFormData, is_premium: e.target.checked })
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
              onClick={handleSaveVideo}
              disabled={isSaving || !videoFormData.title || !videoFormData.url}
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
