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
import { MoreHorizontal, FolderArchive, Download, Trash2, ExternalLink, AlertTriangle, Save, X } from "lucide-react";
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

interface MediaRecord {
  id: string;
  name: string;
  size: string;
  type: string;
  uploaded_at: string;
  url: string;
}

export default function AdminMediaPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    size: "1.2 MB",
    type: "application/pdf",
    url: "https://",
  });

  const mockMedia: MediaRecord[] = [
    {
      id: "m1",
      name: "panduan_pendaftaran_snbt_2026.pdf",
      size: "2.4 MB",
      type: "application/pdf",
      uploaded_at: new Date().toISOString(),
      url: "#",
    },
    {
      id: "m2",
      name: "hero_banner_discount.jpg",
      size: "450 KB",
      type: "image/jpeg",
      uploaded_at: new Date(Date.now() - 86400000).toISOString(),
      url: "#",
    },
  ];

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });

      if (error) {
        setIsDemoMode(true);
        setMediaFiles(mockMedia);
      } else if (data) {
        setMediaFiles(data as MediaRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
      setMediaFiles(mockMedia);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      size: "1.2 MB",
      type: "application/pdf",
      url: "https://",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        uploaded_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        setMediaFiles(prev => [
          ...prev,
          { id: `m_${Date.now()}`, ...payload },
        ]);
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.from("media").insert([payload]);
      if (error) throw error;

      setIsDialogOpen(false);
      fetchMedia();
    } catch (err) {
      alert("Gagal menyimpan: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus file ini permanently?")) return;
    try {
      if (isDemoMode) {
        setMediaFiles(prev => prev.filter(m => m.id !== id));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("media").delete().eq("id", id);
      if (error) throw error;
      fetchMedia();
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
            <p className="text-[11px] text-amber-700">Tabel media tidak ditemukan, menggunakan data demo.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Media Library"
        description="Kelola file aset media, modul PDF pengajar, gambar spanduk, dan dokumen pelengkap belajar."
        addButtonLabel="Upload File"
        onAddClick={handleCreate}
        searchPlaceholder="Cari file..."
        totalItems={mediaFiles.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama File</TableHead>
              <TableHead className="font-bold text-slate-700">Ukuran</TableHead>
              <TableHead className="font-bold text-slate-700">Jenis File</TableHead>
              <TableHead className="font-bold text-slate-700">Tanggal Unggah</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Memuat data...</TableCell>
              </TableRow>
            ) : mediaFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">Belum ada data.</TableCell>
              </TableRow>
            ) : (
              mediaFiles.map((file) => (
                <TableRow key={file.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3 font-mono text-xs font-bold text-slate-900 flex items-center gap-2 max-w-xs truncate">
                    <FolderArchive className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-semibold">{file.size}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">{file.type}</TableCell>
                  <TableCell className="text-xs text-slate-500">{formatDate(file.uploaded_at)}</TableCell>
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
                        <DropdownMenuItem className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <Download className="h-3.5 w-3.5 text-blue-600" />
                          <span>Unduh File</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(file.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus File</span>
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
            <DialogTitle>Unggah File Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama File *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="modul_fisika.pdf" />
            </div>
            <div className="space-y-2">
              <Label>Direct URL Link *</Label>
              <Input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder="https://storage.googleapis.com/..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ukuran File *</Label>
                <Input value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} placeholder="1.2 MB" />
              </div>
              <div className="space-y-2">
                <Label>Mime Type *</Label>
                <Input value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} placeholder="application/pdf" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.url} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
