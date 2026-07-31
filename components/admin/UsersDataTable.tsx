"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

export interface UserRecord {
  id: string;
  full_name?: string | null;
  email?: string | null;
  target_ptn?: string | null;
  role?: string | null;
  created_at: string;
}

interface UsersDataTableProps {
  initialUsers: UserRecord[];
  totalCount: number;
}

export default function UsersDataTable({ initialUsers, totalCount }: UsersDataTableProps) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "admin">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (u.target_ptn?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" ? true : u.role === roleFilter;

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

  const totalStudents = users.filter((u) => u.role !== "admin").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

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
            <p className="text-xl font-black text-slate-900">{totalCount || users.length}</p>
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
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
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
              onClick={() => { setSearchQuery(""); setRoleFilter("all"); setCurrentPage(1); }}
              title="Reset Filter"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
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
                      {user.role === "admin" ? (
                        <Badge className="bg-blue-600 text-white font-bold text-[11px] px-2.5 py-0.5 gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>ADMIN HQ</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px] px-2.5 py-0.5">
                          STUDENT
                        </Badge>
                      )}
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
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                          <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Opsi Pengguna
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => alert(`Detail Pengguna: ${user.full_name || user.email}`)}
                            className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                            <span>Lihat Detail Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const newRole = user.role === "admin" ? "student" : "admin";
                              setUsers(users.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
                            }}
                            className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2"
                          >
                            <Edit className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Ubah Role ({user.role === "admin" ? "Ke Student" : "Ke Admin"})</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => alert(`Suspend akun ${user.email}`)}
                            className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50"
                          >
                            <UserX className="h-3.5 w-3.5 text-rose-600" />
                            <span>Suspend Akun</span>
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
    </div>
  );
}
