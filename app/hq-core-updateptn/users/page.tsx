import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CrudLayout from "@/components/admin/CrudLayout";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MoreHorizontal, ShieldCheck, User, UserX, Edit, Eye, Mail } from "lucide-react";

interface UserRecord {
  id: string;
  full_name?: string | null;
  email?: string | null;
  target_ptn?: string | null;
  role?: string | null;
  created_at: string;
}

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch profiles from Supabase DB
  const { data: profilesData, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Use real profiles from Supabase DB only
  const users: UserRecord[] = profilesData && profilesData.length > 0 ? profilesData : [];

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
    <CrudLayout
      title="Manajemen Siswa & Pengguna"
      description="Kelola akun siswa, hak akses role admin, dan status aktivitas pengguna UpdatePTN."
      addButtonLabel="Tambah Pengguna"
      searchPlaceholder="Cari berdasarkan nama atau email..."
      totalItems={count || users.length}
      currentPage={1}
      totalPages={1}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 bg-slate-50/50">
            <TableHead className="font-bold text-slate-700">Nama & Email</TableHead>
            <TableHead className="font-bold text-slate-700">Target PTN</TableHead>
            <TableHead className="font-bold text-slate-700">Role</TableHead>
            <TableHead className="font-bold text-slate-700">Tanggal Daftar</TableHead>
            <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: UserRecord) => (
            <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
              {/* User Avatar & Name */}
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-xs">
                      {user.full_name ? user.full_name.substring(0, 2).toUpperCase() : "US"}
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
                {user.target_ptn || "Belum Ditetapkan"}
              </TableCell>

              {/* Role Badge */}
              <TableCell>
                {user.role === "admin" ? (
                  <Badge className="bg-blue-600 text-white font-bold text-[11px] px-2.5 py-0.5 gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>ADMIN</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-semibold text-[11px] px-2.5 py-0.5">
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
                    <DropdownMenuItem className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                      <span>Lihat Detail Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                      <Edit className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Ubah Status Role</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                      <UserX className="h-3.5 w-3.5 text-rose-600" />
                      <span>Suspend Akun Siswa</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CrudLayout>
  );
}
