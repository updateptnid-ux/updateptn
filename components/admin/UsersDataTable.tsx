"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  MoreHorizontal,
  ShieldCheck,
  UserX,
  Edit,
  Eye,
  Mail,
  Search,
  Users as UsersIcon,
  UserCheck,
  Shield,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface UserRecord {
  id: string;
  full_name?: string | null;
  email?: string | null;
  target_ptn?: string | null;
  role?: string | null;
  is_marketing?: boolean | null;
  free_access?: boolean | null;
  created_at: string;
}

interface UsersDataTableProps {
  initialUsers: UserRecord[];
  totalCount: number;
}

export default function UsersDataTable({ initialUsers, totalCount }: UsersDataTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [total, setTotal] = useState(totalCount);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "admin" | "kol" | "ba" | "marketing">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/hq-core-updateptn/api/users", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setUsers(json.data);
          if (json.count !== undefined) {
            setTotal(json.count);
          }
        }
      }
    } catch (err) {
      console.error("Failed to auto-refresh users:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Supabase Realtime channel listening on profiles table
    const supabase = createClient();
    const channel = supabase
      .channel("admin-users-datatable-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    // 2. Fallback auto-refresh polling every 5 seconds for instant registration updates
    const interval = setInterval(() => {
      fetchUsers();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Delete user state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (u.target_ptn?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all"
          ? true
          : roleFilter === "marketing"
          ? Boolean(u.is_marketing || u.free_access)
          : u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

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

  const getInitials = (name?: string | null) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const totalStudents = users.filter((u) => u.role === "student" && !u.is_marketing).length;
  const totalMarketing = users.filter((u) => u.is_marketing || u.free_access).length;
  const totalKols = users.filter((u) => u.role === "kol").length;
  const totalBas = users.filter((u) => u.role === "ba").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

  // Handle role or marketing toggle
  const handleChangeUserRole = async (targetUser: UserRecord, newRole: string, newIsMarketing?: boolean) => {
    const isMarketingToggle = typeof newIsMarketing === "boolean";
    const promptText = isMarketingToggle
      ? `Ubah status tim marketing untuk ${targetUser.full_name || targetUser.email} menjadi ${newIsMarketing ? "AKTIF (Free Bimbel Pass)" : "NONAKTIF"}?`
      : `Ubah role ${targetUser.full_name || targetUser.email} menjadi ${newRole.toUpperCase()}?`;

    if (!confirm(promptText)) return;

    try {
      const payload: any = {
        userId: targetUser.id,
        newRole,
      };
      if (isMarketingToggle) {
        payload.isMarketing = newIsMarketing;
      }

      const response = await fetch('/hq-core-updateptn/api/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change role');
      }

      setUsers(users.map((u) => u.id === targetUser.id ? {
        ...u,
        role: newRole,
        ...(isMarketingToggle ? { is_marketing: newIsMarketing } : {})
      } : u));

      alert(`✅ Berhasil diupdate!`);
      router.refresh();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
      console.error('Change role error:', error);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    // Validation: must type exact confirmation
    if (deleteConfirmText !== "HAPUS PERMANEN") {
      setDeleteError("Ketik 'HAPUS PERMANEN' untuk konfirmasi");
      return;
    }

    setDeleteError(null);

    startDeleteTransition(async () => {
      try {
        const response = await fetch('/hq-core-updateptn/api/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userToDelete.id })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete user');
        }

        // Remove user from local state
        setUsers(users.filter(u => u.id !== userToDelete.id));
        
        // Close dialog and reset
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setDeleteConfirmText("");
        
        // Show success (you can add toast notification here)
        alert(`✅ Akun ${userToDelete.full_name || userToDelete.email} berhasil dihapus`);
        
        // Refresh page to get updated data
        router.refresh();
        
      } catch (error: any) {
        setDeleteError(error.message || 'Gagal menghapus akun');
        console.error('Delete error:', error);
      }
    });
  };

  const openDeleteDialog = (user: UserRecord) => {
    setUserToDelete(user);
    setDeleteConfirmText("");
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Title & Add User Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Siswa & Pengguna
          </h1>
          <p className="text-sm text-slate-500">
            Kelola akun siswa, hak akses role admin, dan status aktivitas pengguna UpdatePTN.
          </p>
        </div>

        <Button
          onClick={() => alert("Modal Tambah Pengguna dapat diintegrasikan dengan Supabase Auth Admin SDK.")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-sm shrink-0 h-10 px-4"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pengguna</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pengguna</p>
            <p className="text-xl font-black text-slate-900">{total || users.length}</p>
          </div>
        </Card>

        <Card className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa Terdaftar</p>
            <p className="text-xl font-black text-slate-900">{totalStudents}</p>
          </div>
        </Card>

        <Card className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrator HQ</p>
            <p className="text-xl font-black text-slate-900">{totalAdmins}</p>
          </div>
        </Card>
      </div>

      {/* Main Data Table Container */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden p-6 space-y-6">
        {/* Controls: Search Bar & Role Filter Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari berdasarkan nama, email, atau PTN..."
              className="pl-10 h-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
            />
          </div>

          {/* Filter Tabs & Refresh */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 gap-0.5">
              <button
                onClick={() => { setRoleFilter("all"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === "all" ? "bg-white text-blue-600 font-bold shadow-2xs" : "hover:text-slate-900"}`}
              >
                Semua ({users.length})
              </button>
              <button
                onClick={() => { setRoleFilter("student"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === "student" ? "bg-white text-blue-600 font-bold shadow-2xs" : "hover:text-slate-900"}`}
              >
                Siswa ({totalStudents})
              </button>
              <button
                onClick={() => { setRoleFilter("marketing"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === "marketing" ? "bg-white text-amber-600 font-bold shadow-2xs" : "hover:text-slate-900"}`}
              >
                Marketing ({totalMarketing})
              </button>
              <button
                onClick={() => { setRoleFilter("kol"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === "kol" ? "bg-white text-purple-600 font-bold shadow-2xs" : "hover:text-slate-900"}`}
              >
                KOL ({totalKols})
              </button>
              <button
                onClick={() => { setRoleFilter("ba"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === "ba" ? "bg-white text-indigo-600 font-bold shadow-2xs" : "hover:text-slate-900"}`}
              >
                BA ({totalBas})
              </button>
              <button
                onClick={() => { setRoleFilter("admin"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-colors ${roleFilter === "admin" ? "bg-white text-blue-600 font-bold shadow-2xs" : "hover:text-slate-900"}`}
              >
                Admin ({totalAdmins})
              </button>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-slate-200 shrink-0 h-9 w-9"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setCurrentPage(1);
                fetchUsers();
              }}
              title="Segarkan Data"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-75">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50/70">
                <TableHead className="font-bold text-slate-700">Nama & Email</TableHead>
                <TableHead className="font-bold text-slate-700">Target PTN</TableHead>
                <TableHead className="font-bold text-slate-700">Role & Akses</TableHead>
                <TableHead className="font-bold text-slate-700">Tanggal Terdaftar</TableHead>
                <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                    Tidak ada pengguna yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user: UserRecord) => (
                  <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50/70 transition-colors">
                    {/* User Avatar & Name */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-200">
                          <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-xs">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {user.full_name || "Siswa UpdatePTN"}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{user.email || `user-${user.id.substring(0, 6)}@updateptn.id`}</span>
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Target PTN */}
                    <TableCell className="text-xs text-slate-700 font-semibold">
                      {user.target_ptn ? (
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 font-bold text-[11px] px-2.5 py-0.5">
                          {user.target_ptn}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 italic">Belum Ditetapkan</span>
                      )}
                    </TableCell>

                    {/* Role Badge */}
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {user.role === "admin" ? (
                          <Badge className="bg-blue-600 text-white font-bold text-[11px] px-2.5 py-0.5 gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            <span>ADMIN HQ</span>
                          </Badge>
                        ) : user.role === "kol" ? (
                          <Badge className="bg-purple-600 text-white font-bold text-[11px] px-2.5 py-0.5 gap-1">
                            <span>KOL</span>
                          </Badge>
                        ) : user.role === "ba" ? (
                          <Badge className="bg-indigo-600 text-white font-bold text-[11px] px-2.5 py-0.5 gap-1">
                            <span>BA</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px] px-2.5 py-0.5">
                            STUDENT
                          </Badge>
                        )}
                        {(user.is_marketing || user.free_access) && (
                          <Badge className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>MARKETING FREE</span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Tanggal Daftar */}
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(user.created_at)}
                    </TableCell>

                    {/* Action Dropdown Menu */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                          <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Opsi Pengguna
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => alert(`Detail Pengguna: ${user.full_name || user.email}\nRole: ${user.role || 'student'}\nMarketing: ${user.is_marketing ? 'Ya (Bypass Bimbel)' : 'Tidak'}`)}
                            className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                            <span>Lihat Detail Profile</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Ubah Hak Akses
                          </DropdownMenuLabel>

                          {user.role !== "student" && (
                            <DropdownMenuItem
                              onClick={() => handleChangeUserRole(user, "student")}
                              className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                            >
                              <Edit className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Set Role: Student (Siswa)</span>
                            </DropdownMenuItem>
                          )}

                          {user.role !== "kol" && (
                            <DropdownMenuItem
                              onClick={() => handleChangeUserRole(user, "kol")}
                              className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                            >
                              <Edit className="h-3.5 w-3.5 text-purple-600" />
                              <span>Set Role: KOL (Akses Tools)</span>
                            </DropdownMenuItem>
                          )}

                          {user.role !== "ba" && (
                            <DropdownMenuItem
                              onClick={() => handleChangeUserRole(user, "ba")}
                              className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                            >
                              <Edit className="h-3.5 w-3.5 text-indigo-600" />
                              <span>Set Role: BA (Akses Tools)</span>
                            </DropdownMenuItem>
                          )}

                          {user.role !== "admin" && (
                            <DropdownMenuItem
                              onClick={() => handleChangeUserRole(user, "admin")}
                              className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                              <span>Set Role: Admin HQ</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleChangeUserRole(user, user.role || "student", !user.is_marketing)}
                            className="text-xs font-semibold text-amber-700 cursor-pointer rounded-lg gap-2 focus:bg-amber-50"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                            <span>{user.is_marketing ? "Hapus Flag Marketing" : "Aktifkan Tim Marketing (Bimbel Gratis)"}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(user)}
                            className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50"
                          >
                            <UserX className="h-3.5 w-3.5 text-rose-600" />
                            <span>Hapus Akun Permanen</span>
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

        {/* Pagination Footer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <div>
            Menampilkan <strong className="text-slate-900">{filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> -{" "}
            <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> dari{" "}
            <strong className="text-slate-900">{filteredUsers.length}</strong> pengguna
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="rounded-xl border-slate-200 text-xs font-semibold h-8 gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </Button>

            <span className="px-2 text-xs font-bold text-slate-900">
              Halaman {currentPage} dari {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="rounded-xl border-slate-200 text-xs font-semibold h-8 gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white border-2 border-rose-200 rounded-2xl max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold text-slate-900">
                  Hapus Akun Permanen
                </DialogTitle>
                <p className="text-xs text-slate-500 font-medium">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* User Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-slate-200">
                  <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-sm">
                    {getInitials(userToDelete?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {userToDelete?.full_name || "User"}
                  </p>
                  <p className="text-xs text-slate-500">{userToDelete?.email}</p>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="text-xs text-slate-700 space-y-2">
              <p className="font-bold text-rose-600">⚠️ Data yang akan dihapus:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                <li>Profil & akun login</li>
                <li>Semua hasil Try Out & latihan</li>
                <li>Data subscription & pembayaran</li>
                <li>Riwayat prediksi peluang</li>
                <li>Data afiliasi (jika ada)</li>
                <li>Semua data terkait akun ini</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Ketik <span className="text-rose-600 font-black">HAPUS PERMANEN</span> untuk konfirmasi:
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError(null);
                }}
                placeholder="HAPUS PERMANEN"
                className="border-slate-300 focus:border-rose-500 focus:ring-rose-500 font-mono text-sm"
                disabled={isDeleting}
                style={{ fontSize: '16px' }}
              />
              {deleteError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {deleteError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
                setDeleteConfirmText("");
                setDeleteError(null);
              }}
              disabled={isDeleting}
              className="rounded-xl border-slate-200 font-bold"
            >
              Batal
            </Button>
            <Button
              onClick={handleDeleteUser}
              disabled={isDeleting || deleteConfirmText !== "HAPUS PERMANEN"}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4" />
                  <span>Hapus Permanen</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
