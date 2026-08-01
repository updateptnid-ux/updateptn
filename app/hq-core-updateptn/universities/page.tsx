"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Building2, MapPin, Edit, Trash2, GraduationCap, RefreshCw, Database } from "lucide-react";
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

interface ProdiRecord {
  id: string;
  univ: string;
  prodi: string;
  prov: string | null;
  kelompok: string | null;
  passing_grade_est: number | null;
}

interface UnivSummary {
  name: string;
  prov: string;
  totalProdi: number;
  kelompokSaintek: number;
  kelompokSoshum: number;
  avgPg: number;
}

export default function AdminUniversitiesPage() {
  const [allProdi, setAllProdi] = useState<ProdiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch all records from prodi_reference
      let allData: ProdiRecord[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("prodi_reference")
          .select("id, univ, prodi, prov, kelompok, passing_grade_est")
          .order("univ", { ascending: true })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error("DB error:", error);
          // Fallback to data_snbt.json
          try {
            const res = await fetch("/data_snbt.json");
            if (res.ok) {
              const json = await res.json();
              allData = json.map((item: any) => ({
                id: item.id,
                univ: item.univ,
                prodi: item.prodi,
                prov: item.prov || null,
                kelompok: item.kelompok || null,
                passing_grade_est: item.passing_grade_est || null,
              }));
            }
          } catch {}
          break;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...(data as ProdiRecord[])];
          from += batchSize;
          if (data.length < batchSize) hasMore = false;
        } else {
          hasMore = false;
        }
      }

      setAllProdi(allData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate: group by univ → summary
  const univList: UnivSummary[] = useMemo(() => {
    const map = new Map<string, UnivSummary>();

    for (const p of allProdi) {
      const existing = map.get(p.univ);
      if (existing) {
        existing.totalProdi += 1;
        if (p.kelompok?.toLowerCase().includes("saintek")) existing.kelompokSaintek += 1;
        else existing.kelompokSoshum += 1;
        if (p.passing_grade_est) {
          existing.avgPg = (existing.avgPg * (existing.totalProdi - 1) + p.passing_grade_est) / existing.totalProdi;
        }
      } else {
        map.set(p.univ, {
          name: p.univ,
          prov: p.prov || "-",
          totalProdi: 1,
          kelompokSaintek: p.kelompok?.toLowerCase().includes("saintek") ? 1 : 0,
          kelompokSoshum: p.kelompok?.toLowerCase().includes("saintek") ? 0 : 1,
          avgPg: p.passing_grade_est || 500,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allProdi]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return univList;
    const q = searchQuery.toLowerCase();
    return univList.filter(
      (u) => u.name.toLowerCase().includes(q) || u.prov.toLowerCase().includes(q)
    );
  }, [univList, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-xs font-bold gap-1.5">
          <Database className="h-3.5 w-3.5" />
          {univList.length} PTN
        </Badge>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-xs font-bold gap-1.5">
          <GraduationCap className="h-3.5 w-3.5" />
          {allProdi.length.toLocaleString()} Prodi
        </Badge>
        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 px-3 py-1 text-xs font-medium">
          Data SNBT 2025/2026
        </Badge>
      </div>

      <CrudLayout
        title="Universitas (PTN)"
        description={`Kelola daftar ${univList.length} perguruan tinggi negeri dari ${allProdi.length.toLocaleString()} program studi SNBT 2025/2026.`}
        addButtonLabel="Refresh Data"
        onAddClick={fetchData}
        searchPlaceholder="Cari nama PTN atau provinsi..."
        searchValue={searchQuery}
        onSearchChange={(q: string) => { setSearchQuery(q); setCurrentPage(1); }}
        totalItems={filtered.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700 w-8">#</TableHead>
              <TableHead className="font-bold text-slate-700">Nama Universitas</TableHead>
              <TableHead className="font-bold text-slate-700">Provinsi</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">Total Prodi</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">Saintek</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">Soshum</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">Avg PG</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                  Memuat {allProdi.length > 0 ? `${allProdi.length} ` : ""}data dari prodi_reference...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
                  {searchQuery ? `Tidak ditemukan PTN untuk "${searchQuery}"` : "Belum ada data. Jalankan seed_prodi_reference.sql di Supabase."}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((uni, idx) => (
                <TableRow key={uni.name} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="text-xs text-slate-400 font-mono">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </TableCell>
                  <TableCell className="py-3 font-bold text-slate-900 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>{uni.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{uni.prov}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold px-2">
                      {uni.totalProdi}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs font-semibold text-emerald-700">
                    {uni.kelompokSaintek}
                  </TableCell>
                  <TableCell className="text-center text-xs font-semibold text-purple-700">
                    {uni.kelompokSoshum}
                  </TableCell>
                  <TableCell className="text-center text-xs font-black text-slate-700">
                    {Math.round(uni.avgPg)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CrudLayout>
    </div>
  );
}
