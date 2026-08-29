"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  UserCircle2,
  Mail,
  Phone,
  BookOpen,
  Save,
  Pencil,
  X,
  CheckCircle2,
  Sparkles,
  Video,
  PlaySquare,
  GraduationCap,
  Plus,
  Trash2,
  MoreHorizontal,
  UserCheck,
  Edit,
  Eye,
  AlertTriangle,
  ChevronDown,
  Search,
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

interface EducationItem {
  id: string;
  university: string;
  faculty: string;
  major: string;
  start_year: string;
  end_year: string;
  degree: string; // S1, S2, S3, D3, D4
}

interface MentorRecord {
  id: string;
  full_name: string;
  email: string;
  specialization: string;
  status: "active" | "inactive";
  joined_at: string;
  education?: EducationItem[];
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

  const [educationList, setEducationList] = useState<EducationItem[]>([]);

  // Dropdown states for each education item
  const [univDropdownOpen, setUnivDropdownOpen] = useState<Record<string, boolean>>({});
  const [majorDropdownOpen, setMajorDropdownOpen] = useState<Record<string, boolean>>({});
  const [facultyDropdownOpen, setFacultyDropdownOpen] = useState<Record<string, boolean>>({});
  
  const [univOptions, setUnivOptions] = useState<string[]>([]);
  const [majorOptions, setMajorOptions] = useState<Record<string, string[]>>({});
  const [facultyOptions, setFacultyOptions] = useState<Record<string, string[]>>({});

  const [univSearch, setUnivSearch] = useState<Record<string, string>>({});
  const [majorSearch, setMajorSearch] = useState<Record<string, string>>({});
  const [facultySearch, setFacultySearch] = useState<Record<string, string>>({});

  const mockMentors: MentorRecord[] = [
    {
      id: "m1",
      full_name: "Kak Sarah, M.Sc",
      email: "sarah.mentor@updateptn.id",
      specialization: "Penalaran Matematika & Kuantitatif (Alumni ITB)",
      status: "active",
      joined_at: new Date(Date.now() - 86400000 * 120).toISOString(),
      education: [
        {
          id: "e1",
          degree: "S2",
          university: "Institut Teknologi Bandung",
          faculty: "Fakultas MIPA",
          major: "Matematika",
          start_year: "2018",
          end_year: "2020",
        },
        {
          id: "e2",
          degree: "S1",
          university: "Institut Teknologi Bandung",
          faculty: "Fakultas MIPA",
          major: "Matematika",
          start_year: "2014",
          end_year: "2018",
        },
      ],
    },
    {
      id: "m2",
      full_name: "Kak Fikri, S.Kom",
      email: "fikri.mentor@updateptn.id",
      specialization: "Penalaran Umum & TPS (Alumni UI)",
      status: "active",
      joined_at: new Date(Date.now() - 86400000 * 90).toISOString(),
      education: [
        {
          id: "e3",
          degree: "S1",
          university: "Universitas Indonesia",
          faculty: "Fakultas Ilmu Komputer",
          major: "Ilmu Komputer",
          start_year: "2015",
          end_year: "2019",
        },
      ],
    },
    {
      id: "m3",
      full_name: "Kak Dimas, M.A",
      email: "dimas.mentor@updateptn.id",
      specialization: "Literasi Bahasa Inggris (Alumni UGM)",
      status: "active",
      joined_at: new Date(Date.now() - 86400000 * 80).toISOString(),
      education: [
        {
          id: "e4",
          degree: "S2",
          university: "Universitas Gadjah Mada",
          faculty: "Fakultas Ilmu Budaya",
          major: "Sastra Inggris",
          start_year: "2019",
          end_year: "2021",
        },
      ],
    },
  ];

  useEffect(() => {
    fetchMentors();
    fetchUniversitiesAndMajors();
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

  const fetchUniversitiesAndMajors = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("direktori_prodi").select("univ, prodi, fakultas");
      
      if (error) {
        console.error("Supabase error:", error.code, error.message, error.details);
        // If table doesn't exist or cache issue, use fallback data
        if (error.code === "PGRST116" || error.code === "PGRST205" || error.message.includes("does not exist") || error.message.includes("schema cache")) {
          console.warn("Table direktori_prodi not found or cache issue, using fallback universities");
          useFallbackUniversities();
        }
        return;
      }
      
      if (data) {
        // Get unique universities
        const uniqueUnivs = Array.from(new Set(data.map(item => item.univ).filter(Boolean))) as string[];
        setUnivOptions(uniqueUnivs.sort());

        // Group majors and faculties by university
        const majorsByUniv: Record<string, string[]> = {};
        const facultiesByUniv: Record<string, string[]> = {};
        
        data.forEach(item => {
          if (item.univ) {
            if (!majorsByUniv[item.univ]) majorsByUniv[item.univ] = [];
            if (!facultiesByUniv[item.univ]) facultiesByUniv[item.univ] = [];
            
            if (item.prodi && !majorsByUniv[item.univ].includes(item.prodi)) {
              majorsByUniv[item.univ].push(item.prodi);
            }
            if (item.fakultas && !facultiesByUniv[item.univ].includes(item.fakultas)) {
              facultiesByUniv[item.univ].push(item.fakultas);
            }
          }
        });

        // Sort each array
        Object.keys(majorsByUniv).forEach(key => {
          majorsByUniv[key].sort();
        });
        Object.keys(facultiesByUniv).forEach(key => {
          facultiesByUniv[key].sort();
        });

        setMajorOptions(majorsByUniv);
        setFacultyOptions(facultiesByUniv);
      }
    } catch (err) {
      console.error("Error fetching universities:", err);
      useFallbackUniversities();
    }
  };

  const useFallbackUniversities = () => {
    // Fallback universities if direktori_prodi table doesn't exist
    const fallbackUnivs = [
      "UNIVERSITAS INDONESIA",
      "INSTITUT TEKNOLOGI BANDUNG",
      "UNIVERSITAS GADJAH MADA",
      "INSTITUT TEKNOLOGI SEPULUH NOPEMBER",
      "UNIVERSITAS AIRLANGGA",
      "UNIVERSITAS BRAWIJAYA",
      "UNIVERSITAS DIPONEGORO",
      "UNIVERSITAS PADJADJARAN",
      "UNIVERSITAS HASANUDDIN",
      "UNIVERSITAS SUMATERA UTARA",
    ].sort();

    setUnivOptions(fallbackUnivs);
    
    // Set generic faculty and major options
    const genericFaculties = [
      "FAKULTAS TEKNIK",
      "FAKULTAS KEDOKTERAN",
      "FAKULTAS EKONOMI DAN BISNIS",
      "FAKULTAS HUKUM",
      "FAKULTAS ILMU SOSIAL DAN ILMU POLITIK",
      "FAKULTAS MIPA",
      "FAKULTAS ILMU KOMPUTER",
      "FAKULTAS ILMU BUDAYA",
      "FAKULTAS PSIKOLOGI",
      "FAKULTAS PERTANIAN",
    ];

    const genericMajors = [
      "TEKNIK INFORMATIKA",
      "TEKNIK SIPIL",
      "TEKNIK ELEKTRO",
      "KEDOKTERAN",
      "MANAJEMEN",
      "AKUNTANSI",
      "HUKUM",
      "ILMU KOMUNIKASI",
      "MATEMATIKA",
      "FISIKA",
      "KIMIA",
      "BIOLOGI",
      "PSIKOLOGI",
      "SASTRA INDONESIA",
      "SASTRA INGGRIS",
    ];

    const fallbackMajors: Record<string, string[]> = {};
    const fallbackFaculties: Record<string, string[]> = {};
    
    fallbackUnivs.forEach(univ => {
      fallbackMajors[univ] = genericMajors;
      fallbackFaculties[univ] = genericFaculties;
    });

    setMajorOptions(fallbackMajors);
    setFacultyOptions(fallbackFaculties);
  };

  const handleCreate = () => {
    setEditingMentor(null);
    setFormData({
      full_name: "",
      email: "",
      specialization: "",
      status: "active",
    });
    setEducationList([]);
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
    setEducationList(mentor.education || []);
    setIsDialogOpen(true);
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: Date.now().toString(),
      university: "",
      faculty: "",
      major: "",
      start_year: "",
      end_year: "",
      degree: "S1",
    };
    setEducationList([...educationList, newEdu]);
  };

  const removeEducation = (id: string) => {
    setEducationList(educationList.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setEducationList(
      educationList.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const dataToSave = {
        ...formData,
        education: educationList,
      };

      if (isDemoMode) {
        if (editingMentor) {
          setMentors(prev =>
            prev.map(m => (m.id === editingMentor.id ? { ...m, ...dataToSave } : m))
          );
        } else {
          const newMentor: MentorRecord = {
            id: `m_${Date.now()}`,
            ...dataToSave,
            joined_at: new Date().toISOString(),
          };
          setMentors(prev => [newMentor, ...prev]);
        }
        setIsDialogOpen(false);
        return;
      }

      const supabase = createClient();
      if (editingMentor) {
        const { error } = await supabase.from("mentors").update(dataToSave).eq("id", editingMentor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("mentors").insert([dataToSave]);
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
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Memuat data mentor...
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Belum ada data mentor.
            </div>
          ) : (
            mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                      <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-xs">
                        {mentor.full_name ? mentor.full_name.substring(0, 2).toUpperCase() : "MT"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                        {mentor.full_name}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{mentor.email}</span>
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-100 shrink-0 touch-manipulation"
                      >
                        <MoreHorizontal className="h-4 w-4 text-slate-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                      <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Opsi Mentor
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleEdit(mentor)}
                        className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2 touch-manipulation"
                      >
                        <Edit className="h-3.5 w-3.5 text-blue-600" />
                        <span>Edit Mentor</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(mentor.id)}
                        className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50 touch-manipulation"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                        <span>Hapus Mentor</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-semibold leading-tight">{mentor.specialization}</span>
                  </div>

                  {mentor.education && mentor.education.length > 0 && (
                    <div className="flex items-start gap-1.5 pt-1 border-t border-slate-100">
                      <GraduationCap className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        {mentor.education.slice(0, 1).map((edu, i) => (
                          <div key={i} className="text-[10px]">
                            <span className="font-bold text-blue-900">{edu.degree} {edu.major}</span>
                            <span className="text-blue-700"> - {edu.university}</span>
                          </div>
                        ))}
                        {mentor.education.length > 1 && (
                          <span className="text-[9px] text-blue-600">+{mentor.education.length - 1} lainnya</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[10px] text-slate-500">
                    Bergabung: {formatDate(mentor.joined_at)}
                  </div>
                  {mentor.status === "active" ? (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-[10px] px-2 py-0.5 gap-1">
                      <UserCheck className="h-3 w-3" />
                      <span>AKTIF</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-semibold text-[10px] px-2 py-0.5">
                      NON-AKTIF
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                          <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-xs">
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
                        <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                        <span>{mentor.specialization}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {mentor.status === "active" ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-[11px] px-2.5 py-0.5 gap-1">
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
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                          <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Opsi Mentor
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEdit(mentor)}
                            className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                          >
                            <Edit className="h-3.5 w-3.5 text-blue-600" />
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
        </div>
      </CrudLayout>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">{editingMentor ? "Edit Mentor" : "Tambah Mentor Baru"}</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Isi data tutor/mentor secara lengkap untuk ditampilkan di modul UpdatePTN.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4 py-3 md:py-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-xs md:text-sm font-bold">Nama Lengkap *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Kak Sarah, M.Sc"
                style={{ fontSize: '16px' }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                className="rounded-lg h-11 md:h-10 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs md:text-sm font-bold">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah@updateptn.id"
                style={{ fontSize: '16px' }}
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="off"
                className="rounded-lg h-11 md:h-10 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specialization" className="text-xs md:text-sm font-bold">Spesialisasi Mata Pelajaran *</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Penalaran Matematika (Alumni ITB)"
                style={{ fontSize: '16px' }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                className="rounded-lg h-11 md:h-10 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs md:text-sm font-bold">Status Keaktifan</Label>
              <select
                id="status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                className="w-full h-11 md:h-10 px-3 border border-slate-200 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white touch-manipulation"
                style={{ fontSize: '16px' }}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
              </select>
            </div>

            {/* Education Section */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <Label className="text-xs md:text-sm font-bold flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  Jejak Pendidikan
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEducation}
                  className="h-8 text-xs rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Tambah
                </Button>
              </div>

              {educationList.length === 0 ? (
                <div className="text-center py-4 px-3 bg-slate-50 rounded-lg border border-slate-200">
                  <GraduationCap className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-400">Belum ada jejak pendidikan</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {educationList.map((edu, index) => (
                    <div
                      key={edu.id}
                      className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-blue-700">Pendidikan {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(edu.id)}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-600">Jenjang</Label>
                          <select
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                            className="w-full h-9 px-2 text-xs border border-slate-200 rounded bg-white"
                            style={{ fontSize: '16px' }}
                          >
                            <option value="S1">S1</option>
                            <option value="S2">S2</option>
                            <option value="S3">S3</option>
                            <option value="D3">D3</option>
                            <option value="D4">D4</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-600">Universitas</Label>
                          <div className="relative">
                            <Input
                              list={`univ-list-${edu.id}`}
                              value={edu.university}
                              onChange={(e) => updateEducation(edu.id, "university", e.target.value)}
                              placeholder="Cari universitas..."
                              className="h-9 text-xs pr-8"
                              style={{ fontSize: '16px' }}
                              autoComplete="off"
                            />
                            <Search className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <datalist id={`univ-list-${edu.id}`}>
                              {univOptions.map((univ, idx) => (
                                <option key={idx} value={univ} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-600">Fakultas</Label>
                          <div className="relative">
                            <Input
                              list={`faculty-list-${edu.id}`}
                              value={edu.faculty}
                              onChange={(e) => updateEducation(edu.id, "faculty", e.target.value)}
                              placeholder="Cari fakultas..."
                              className="h-9 text-xs pr-8"
                              style={{ fontSize: '16px' }}
                              autoComplete="off"
                              disabled={!edu.university}
                            />
                            <Search className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <datalist id={`faculty-list-${edu.id}`}>
                              {edu.university && facultyOptions[edu.university]?.map((faculty, idx) => (
                                <option key={idx} value={faculty} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-600">Jurusan</Label>
                          <div className="relative">
                            <Input
                              list={`major-list-${edu.id}`}
                              value={edu.major}
                              onChange={(e) => updateEducation(edu.id, "major", e.target.value)}
                              placeholder="Cari jurusan..."
                              className="h-9 text-xs pr-8"
                              style={{ fontSize: '16px' }}
                              autoComplete="off"
                              disabled={!edu.university}
                            />
                            <Search className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <datalist id={`major-list-${edu.id}`}>
                              {edu.university && majorOptions[edu.university]?.map((major, idx) => (
                                <option key={idx} value={major} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-600">Tahun Mulai</Label>
                          <Input
                            value={edu.start_year}
                            onChange={(e) => updateEducation(edu.id, "start_year", e.target.value)}
                            placeholder="2018"
                            className="h-9 text-xs"
                            style={{ fontSize: '16px' }}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-600">Tahun Lulus</Label>
                          <Input
                            value={edu.end_year}
                            onChange={(e) => updateEducation(edu.id, "end_year", e.target.value)}
                            placeholder="2022"
                            className="h-9 text-xs"
                            style={{ fontSize: '16px' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)} 
              className="rounded-lg h-11 md:h-10 w-full sm:w-auto touch-manipulation"
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.full_name || !formData.email || !formData.specialization}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg h-11 md:h-10 w-full sm:w-auto touch-manipulation"
            >
              <Save className="h-4 w-4 mr-2" />
              <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
