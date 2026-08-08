"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CrudLayout from "@/components/admin/CrudLayout";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { MoreHorizontal, UserCheck, Edit, Eye, Trash2, Mail, BookOpen, Database, AlertTriangle, Plus, X, Save } from "lucide-react";
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

interface MentorRecord {
  id: string;
  full_name: string;
  email: string;
  specialization: string;
  status: "active" | "inactive";
  joined_at: string;
}

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<MentorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<MentorRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    specialization: "",
    status: "active" as "active" | "inactive",
  });

  const mockMentors: MentorRecord[] = [
    {
      id: "m1",
      full_name: "Kak Sarah, M.Sc",
      email: "sarah.mentor@updateptn.id",
      specialization: "Penalaran Matematika & Kuantitatif (Alumni ITB)",
      status: "active",
      joined_at: new Date(Date.now() - 86400000 * 120).toISOString(),
    },
    {
      id: "m2",
      full_name: "Kak Fikri, S.Kom",
      email: "fikri.mentor@updateptn.id",
      specialization: "Penalaran Umum & TPS (Alumni UI)",
      status: "active",
      joined_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    },
    {
      id: "m3",
      full_name: "Kak Dimas, M.A",
      email: "dimas.mentor@updateptn.id",
      specialization: "Literasi Bahasa Inggris (Alumni UGM)",
      status: "active",
      joined_at: new Date(Date.now() - 86400000 * 80).toISOString(),
    },
  ];

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.from("mentors").select("*").order("created_at", { ascending: false });

      if (error) {
        if (error.code === "PGRST205" || error.message.includes("does not exist")) {
          setIsDemoMode(true);
          setMentors(mockMentors);
        } else {
          throw error;
        }
      } else if (data) {
        setMentors(data as MentorRecord[]);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setIsDemoMode(true);
      setMentors(mockMentors);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMentor(null);
    setFormData({
      full_name: "",
      email: "",
      specialization: "",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (mentor: MentorRecord) => {
    setEditingMentor(mentor);
    setFormData({
      full_name: mentor.full_name,
      email: mentor.email,
      specialization: mentor.specialization,
      status: mentor.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (isDemoMode) {
        if (editingMentor) {
          setMentors(prev =>
            prev.map(m => (m.id === editingMentor.id ? { ...m, ...formData } : m))
          );
        } else {
          const newMentor: MentorRecord = {
            id: `m_${Date.now()}`,
            ...formData,
            joined_at: new Date().toISOString(),
          };
          setMentors(prev => [newMentor, ...prev]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingMentor) {
        const { error } = await supabase.from("mentors").update(formData).eq("id", editingMentor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("mentors").insert([formData]);
        if (error) throw error;
      }

      setIsDialogOpen(false);
      fetchMentors();
    } catch (err) {
      console.error("Error saving mentor:", err);
      alert("Gagal menyimpan mentor: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus mentor ini?")) return;
    try {
      if (isDemoMode) {
        setMentors(prev => prev.filter(m => m.id !== id));
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.from("mentors").delete().eq("id", id);
      if (error) throw error;
      fetchMentors();
    } catch (err) {
      console.error("Error deleting mentor:", err);
      alert("Gagal menghapus mentor: " + (err as Error).message);
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900">Mode Demonstrasi Aktif</h4>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Tabel <code>public.mentors</code> belum terdeteksi di database Supabase Anda. Anda dapat menguji secara in-memory sekarang. Jalankan file migrasi <code>0006_create_admin_tables.sql</code> di editor SQL Supabase Anda untuk menyimpan data ke database.
            </p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Master Tutor & Mentor"
        description="Kelola data pengajar, spesialisasi mata pelajaran, dan status keaktifan mentor UpdatePTN."
        addButtonLabel="Tambah Mentor"
        onAddClick={handleCreate}
        searchPlaceholder="Cari berdasarkan nama..."
        totalItems={mentors.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Nama & Email</TableHead>
              <TableHead className="font-bold text-slate-700">Spesialisasi</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Tanggal Bergabung</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">
                  Memuat data mentor...
                </TableCell>
              </TableRow>
            ) : mentors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500">
                  Belum ada data mentor.
                </TableCell>
              </TableRow>
            ) : (
              mentors.map((mentor) => (
                <TableRow key={mentor.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-xs">
                          {mentor.full_name ? mentor.full_name.substring(0, 2).toUpperCase() : "MT"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {mentor.full_name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span>{mentor.email}</span>
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-700 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{mentor.specialization}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {mentor.status === "active" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[11px] px-2.5 py-0.5 gap-1">
                        <UserCheck className="h-3 w-3" />
                        <span>AKTIF</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-semibold text-[11px] px-2.5 py-0.5">
                        NON-AKTIF
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {formatDate(mentor.joined_at)}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Opsi Mentor
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEdit(mentor)}
                          className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                        >
                          <Edit className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Edit Mentor</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(mentor.id)}
                          className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Hapus Mentor</span>
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
            <DialogTitle>{editingMentor ? "Edit Mentor" : "Tambah Mentor Baru"}</DialogTitle>
            <DialogDescription>
              Isi data tutor/mentor secara lengkap untuk ditampilkan di modul UpdatePTN.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Kak Sarah, M.Sc"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah@updateptn.id"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Spesialisasi Mata Pelajaran *</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Penalaran Matematika (Alumni ITB)"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Keaktifan</Label>
              <select
                id="status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.full_name || !formData.email || !formData.specialization}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              <span>Simpan</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
