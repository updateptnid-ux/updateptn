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
import { MoreHorizontal, PlaySquare, Eye, Edit, Trash2, AlertTriangle, Save, X } from "lucide-react";
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

interface VideoRecord {
  id: string;
  title: string;
  category: string;
  url: string;
  views_count: number;
  duration: string;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Penalaran Umum",
    url: "",
    duration: "15:00",
    views_count: 0,
  });

  const mockVideos: VideoRecord[] = [
    {
      id: "v1",
      title: "Konsep Dasar Silogisme & Logika Matematika",
      category: "Penalaran Umum",
      url: "https://www.youtube.com/watch?v=silogisme",
      views_count: 3240,
      duration: "18:45",
    },
    {
      id: "v2",
      title: "Rumus Cepat Fungsi Kuadrat & Grafik Parabola",
      category: "Pengetahuan Kuantitatif",
      url: "https://www.youtube.com/watch?v=fungsikuadrat",
      views_count: 4120,
      duration: "25:30",
    },
  ];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setVideos(mockVideos);
      } else if (data) {
        setVideos(data as VideoRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setVideos(mockVideos);
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
      duration: "15:00",
      views_count: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (vid: VideoRecord) => {
    setEditingVideo(vid);
    setFormData({
      title: vid.title,
      category: vid.category,
      url: vid.url,
      duration: vid.duration,
      views_count: vid.views_count,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (isDemoMode) {
        if (editingVideo) {
          setVideos(prev => prev.map(v => (v.id === editingVideo.id ? { ...v, ...formData } : v)));
        } else {
          setVideos(prev => [
            ...prev,
            { id: `v_${Date.now()}`, ...formData },
          ]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingVideo) {
        const { error } = await supabase.from("videos").update(formData).eq("id", editingVideo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("videos").insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchVideos();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus video ini?")) return;
    try {
      if (isDemoMode) {
        setVideos(prev => prev.filter(v => v.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
      fetchVideos();
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
            <p className="text-[11px] text-amber-700">Tabel videos tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Video Learning"
        description="Kelola materi video penjelasan materi, tips/trik UTBK, dan materi tambahan siswa."
        addButtonLabel="Unggah Video"
        onAddClick={handleCreate}
        searchPlaceholder="Cari video..."
        totalItems={videos.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Judul Video</TableHead>
              <TableHead className="font-bold text-slate-700">Kategori</TableHead>
              <TableHead className="font-bold text-slate-700">Durasi</TableHead>
              <TableHead className="font-bold text-slate-700">Jumlah Ditonton</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              videos.map((vid) => (
                <TableRow key={vid.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-bold text-slate-900 flex items-center gap-2">
                    <PlaySquare className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{vid.title}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">{vid.category}</TableCell>
                  <TableCell className="text-xs text-slate-900 font-bold">{vid.duration}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>{vid.views_count.toLocaleString()}x</span>
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
                        <DropdownMenuItem onClick={() => handleEdit(vid)} className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Ubah Video</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(vid.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Video</span>
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
            <DialogTitle>{editingVideo ? "Ubah Video" : "Tambah Video"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Video *</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Konsep Silogisme" />
            </div>
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Penalaran Umum" />
            </div>
            <div className="space-y-2">
              <Label>URL Video *</Label>
              <Input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durasi *</Label>
                <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="15:00" />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Views</Label>
                <Input type="number" value={formData.views_count} onChange={e => setFormData({ ...formData, views_count: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.title || !formData.url} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
