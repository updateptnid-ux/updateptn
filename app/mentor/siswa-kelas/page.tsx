"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  BookOpen,
  TrendingUp,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Sparkles,
  Award,
  BarChart2,
  GraduationCap,
  Download,
  Filter,
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  targetPtn: string;
  targetProdi: string;
  classGroup: string;
  attendanceRate: number;
  latestIrtScore: number;
  avatar: string;
}

interface MaterialItem {
  id: string;
  title: string;
  subtest: string;
  type: "pdf" | "video" | "slide";
  url: string;
  date: string;
  downloadsCount: number;
}

interface ProgressNoteItem {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  subtest: string;
  score: number;
  strengths: string;
  improvements: string;
  mentorNote: string;
}

const INITIAL_STUDENTS: StudentItem[] = [
  {
    id: "std-1",
    name: "Amanda Zevanya",
    email: "amanda.z@gmail.com",
    targetPtn: "Universitas Indonesia (UI)",
    targetProdi: "Pendidikan Dokter",
    classGroup: "Intensif SNBT #1",
    attendanceRate: 95,
    latestIrtScore: 685,
    avatar: "AZ",
  },
  {
    id: "std-2",
    name: "Bagas Pratama",
    email: "bagas.pratama@gmail.com",
    targetPtn: "Institut Teknologi Bandung (ITB)",
    targetProdi: "Teknik Informatika",
    classGroup: "Intensif SNBT #1",
    attendanceRate: 90,
    latestIrtScore: 670,
    avatar: "BP",
  },
  {
    id: "std-3",
    name: "Citra Kirana",
    email: "citra.k@gmail.com",
    targetPtn: "Universitas Gadjah Mada (UGM)",
    targetProdi: "Ilmu Hukum",
    classGroup: "Reguler TPS #2",
    attendanceRate: 88,
    latestIrtScore: 645,
    avatar: "CK",
  },
  {
    id: "std-4",
    name: "Davin Syahputra",
    email: "davin.syah@gmail.com",
    targetPtn: "Universitas Airlangga (UNAIR)",
    targetProdi: "Manajemen",
    classGroup: "Reguler TPS #2",
    attendanceRate: 92,
    latestIrtScore: 660,
    avatar: "DS",
  },
];

const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: "mat-1",
    title: "Bedah Soal Penalaran Kuantitatif & Trik Cepat IRT",
    subtest: "Pengetahuan Kuantitatif (PK)",
    type: "pdf",
    url: "#",
    date: "2026-09-08",
    downloadsCount: 142,
  },
  {
    id: "mat-2",
    title: "Konsep Dasar & Strategi Pengerjaan Teks Panjang PBM",
    subtest: "Pemahaman Bacaan & Menulis (PBM)",
    type: "pdf",
    url: "#",
    date: "2026-09-05",
    downloadsCount: 198,
  },
  {
    id: "mat-3",
    title: "Formula Penalaran Matematika Berbasis Studi Kasus",
    subtest: "Penalaran Matematika (PM)",
    type: "slide",
    url: "#",
    date: "2026-09-01",
    downloadsCount: 115,
  },
];

const INITIAL_NOTES: ProgressNoteItem[] = [
  {
    id: "note-1",
    studentId: "std-1",
    studentName: "Amanda Zevanya",
    date: "2026-09-10",
    subtest: "Pengetahuan Kuantitatif",
    score: 685,
    strengths: "Memahami konsep logika aritmatika dan aljabar dengan sangat baik.",
    improvements: "Perlu meningkatkan ketelitian pada soal geometri berbasis spasial.",
    mentorNote: "Konsistensi tinggi. Berpeluang besar lolos FK UI jika mempertahankan grafik IRT.",
  },
  {
    id: "note-2",
    studentId: "std-2",
    studentName: "Bagas Pratama",
    date: "2026-09-07",
    subtest: "Penalaran Matematika",
    score: 670,
    strengths: "Kecepatan analisa grafik dan data tabel sangat baik.",
    improvements: "Manajemen waktu 5 soal terakhir perlu dipercepat 2-3 menit.",
    mentorNote: "Direkomendasikan fokus latihan waktu nyata (real-time timer).",
  },
];

export default function MentorSiswaKelasPage() {
  const [activeTab, setActiveTab] = useState<"siswa" | "materi" | "catatan">("siswa");
  const [students, setStudents] = useState<StudentItem[]>(INITIAL_STUDENTS);
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [notes, setNotes] = useState<ProgressNoteItem[]>(INITIAL_NOTES);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog State for adding note
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    studentId: "std-1",
    subtest: "Pengetahuan Kuantitatif",
    score: 650,
    strengths: "",
    improvements: "",
    mentorNote: "",
  });

  // Dialog State for adding material
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: "",
    subtest: "Pengetahuan Kuantitatif (PK)",
    type: "pdf" as "pdf" | "video" | "slide",
    url: "",
  });

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.targetPtn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.targetProdi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    if (!noteForm.strengths || !noteForm.mentorNote) {
      alert("Mohon isi analisis kelebihan dan catatan evaluasi tentor.");
      return;
    }
    const studentObj = students.find((s) => s.id === noteForm.studentId);
    const newNote: ProgressNoteItem = {
      id: `note-${Date.now()}`,
      studentId: noteForm.studentId,
      studentName: studentObj?.name || "Siswa",
      date: new Date().toISOString().split("T")[0],
      subtest: noteForm.subtest,
      score: Number(noteForm.score),
      strengths: noteForm.strengths,
      improvements: noteForm.improvements,
      mentorNote: noteForm.mentorNote,
    };
    setNotes([newNote, ...notes]);
    setIsAddNoteOpen(false);
    setNoteForm({
      studentId: "std-1",
      subtest: "Pengetahuan Kuantitatif",
      score: 650,
      strengths: "",
      improvements: "",
      mentorNote: "",
    });
  };

  const handleAddMaterial = () => {
    if (!materialForm.title) {
      alert("Judul materi wajib diisi.");
      return;
    }
    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      title: materialForm.title,
      subtest: materialForm.subtest,
      type: materialForm.type,
      url: materialForm.url || "#",
      date: new Date().toISOString().split("T")[0],
      downloadsCount: 0,
    };
    setMaterials([newMat, ...materials]);
    setIsAddMaterialOpen(false);
    setMaterialForm({
      title: "",
      subtest: "Pengetahuan Kuantitatif (PK)",
      type: "pdf",
      url: "",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Panel Manajemen Tentor
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Siswa &amp; Kelas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola daftar siswa yang diampu, bagikan materi pembelajaran, dan pantau catatan perkembangan IRT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddMaterialOpen(true)}
            variant="outline"
            className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 font-bold gap-2 text-xs"
          >
            <BookOpen className="h-4 w-4" />
            <span>Tambah Materi</span>
          </Button>
          <Button
            onClick={() => setIsAddNoteOpen(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs shadow-md shadow-blue-200"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Catatan</span>
          </Button>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Siswa Diampu</p>
              <p className="text-xl font-extrabold text-slate-900">{students.length} Siswa</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Kehadiran Rata-rata</p>
              <p className="text-xl font-extrabold text-slate-900">91.3%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Total Materi Kelas</p>
              <p className="text-xl font-extrabold text-slate-900">{materials.length} File</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Rata-rata Skor IRT</p>
              <p className="text-xl font-extrabold text-slate-900">665 Poin</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Filter Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("siswa")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "siswa"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            👨‍🎓 Daftar Siswa ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("materi")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "materi"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            📚 Materi Pembelajaran ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab("catatan")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "catatan"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            📝 Catatan Perkembangan ({notes.length})
          </button>
        </div>

        {activeTab === "siswa" && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau PTN..."
              className="pl-9 h-9 text-xs rounded-xl bg-white border-slate-200"
            />
          </div>
        )}
      </div>

      {/* TAB 1: DAFTAR SISWA */}
      {activeTab === "siswa" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((std) => (
            <Card
              key={std.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border-2 border-blue-200">
                    <AvatarFallback className="bg-blue-600 text-white font-extrabold text-sm">
                      {std.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{std.name}</h3>
                    <p className="text-xs text-slate-500">{std.email}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] font-semibold bg-blue-50 text-blue-700 border-blue-200">
                      {std.classGroup}
                    </Badge>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                  Skor IRT: {std.latestIrtScore}
                </Badge>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Target PTN &amp; Prodi</p>
                  <p className="font-bold text-slate-800 line-clamp-1">{std.targetPtn}</p>
                  <p className="text-[11px] text-slate-500">{std.targetProdi}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 font-semibold">Tingkat Kehadiran</p>
                  <p className="font-extrabold text-emerald-600">{std.attendanceRate}% Hadir</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: MATERI PEMBELAJARAN */}
      {activeTab === "materi" && (
        <div className="space-y-3">
          {materials.map((mat) => (
            <Card
              key={mat.id}
              className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{mat.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {mat.subtest}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      Diunggah: {mat.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Download className="h-3.5 w-3.5 text-slate-400" />
                  {mat.downloadsCount}x diunduh
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50 text-xs font-bold gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buka File
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: CATATAN PERKEMBANGAN */}
      {activeTab === "catatan" && (
        <div className="space-y-4">
          {notes.map((n) => (
            <Card key={n.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{n.studentName}</h4>
                  <p className="text-xs text-slate-500">Evaluasi Subtes: {n.subtest} · {n.date}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-xs">
                  Hasil IRT: {n.score}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
                  <p className="font-bold text-emerald-800 mb-1">💪 Keunggulan Siswa:</p>
                  <p className="text-emerald-900 leading-relaxed">{n.strengths}</p>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                  <p className="font-bold text-amber-800 mb-1">⚠️ Area Perlu Ditingkatkan:</p>
                  <p className="text-amber-900 leading-relaxed">{n.improvements || "—"}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl text-xs">
                <p className="font-bold text-blue-800 mb-1">🎓 Rekomendasi Tentor:</p>
                <p className="text-blue-950 font-medium leading-relaxed">{n.mentorNote}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* DIALOG ADD NOTE */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              Tambah Catatan Perkembangan Siswa
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Catat evaluasi skor IRT dan rekomendasi belajar untuk siswa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Pilih Siswa *</Label>
              <select
                value={noteForm.studentId}
                onChange={(e) => setNoteForm({ ...noteForm, studentId: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.classGroup})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Subtes *</Label>
                <Input
                  value={noteForm.subtest}
                  onChange={(e) => setNoteForm({ ...noteForm, subtest: e.target.value })}
                  placeholder="Pengetahuan Kuantitatif"
                  className="rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Skor IRT *</Label>
                <Input
                  type="number"
                  value={noteForm.score}
                  onChange={(e) => setNoteForm({ ...noteForm, score: Number(e.target.value) })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Keunggulan Siswa *</Label>
              <Input
                value={noteForm.strengths}
                onChange={(e) => setNoteForm({ ...noteForm, strengths: e.target.value })}
                placeholder="Misal: Paham rumus turunan cepat"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Area Perbaikan</Label>
              <Input
                value={noteForm.improvements}
                onChange={(e) => setNoteForm({ ...noteForm, improvements: e.target.value })}
                placeholder="Misal: Perlu percepat pengerjaan soal aljabar"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Catatan &amp; Rekomendasi Tentor *</Label>
              <textarea
                value={noteForm.mentorNote}
                onChange={(e) => setNoteForm({ ...noteForm, mentorNote: e.target.value })}
                rows={3}
                placeholder="Rekomendasi tindak lanjut..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)} className="rounded-xl text-xs font-bold">
              Batal
            </Button>
            <Button onClick={handleAddNote} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              Simpan Catatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG ADD MATERIAL */}
      <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">
              Upload Materi Pembelajaran Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Bagikan modul PDF, slide presentasi, atau link video kepada siswa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Judul Materi *</Label>
              <Input
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                placeholder="Misal: Ringkasan Rumus Cepat Penalaran Umum"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Subtes *</Label>
              <select
                value={materialForm.subtest}
                onChange={(e) => setMaterialForm({ ...materialForm, subtest: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="Pengetahuan Kuantitatif (PK)">Pengetahuan Kuantitatif (PK)</option>
                <option value="Penalaran Umum (PU)">Penalaran Umum (PU)</option>
                <option value="Pemahaman Bacaan & Menulis (PBM)">Pemahaman Bacaan &amp; Menulis (PBM)</option>
                <option value="Penalaran Matematika (PM)">Penalaran Matematika (PM)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">URL / Link File *</Label>
              <Input
                value={materialForm.url}
                onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddMaterialOpen(false)} className="rounded-xl text-xs font-bold">
              Batal
            </Button>
            <Button onClick={handleAddMaterial} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              Upload &amp; Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
