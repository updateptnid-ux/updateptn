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
import { MoreHorizontal, BarChart3, Trash2, AlertTriangle } from "lucide-react";

interface ResultRecord {
  id: string;
  user_id: string;
  tryout_id: string;
  user_name: string;
  tryout_title: string;
  score: number;
  total_correct: number;
  total_questions: number;
  created_at: string;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("results")
        .select("*, tryouts(title)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching results:", error);
        setIsDemoMode(true);
        setResults([]);
      } else if (data) {
        setResults(
          data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            tryout_id: item.tryout_id,
            user_name: item.user_name || item.user_id || "Siswa UpdatePTN",
            tryout_title: item.tryouts?.title || item.tryout_title || "Simulasi UTBK",
            score: item.score ?? item.total_score ?? 0,
            total_correct: item.total_correct ?? item.correct_answers ?? 0,
            total_questions: item.total_questions ?? 0,
            created_at: item.created_at,
          }))
        );
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error("Exception in fetchResults:", err);
      setIsDemoMode(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus hasil ujian ini?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("results").delete().eq("id", id);
      if (error) throw error;
      fetchResults();
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
            <p className="text-[11px] text-amber-700">Terjadi error saat mengakses tabel results. Cek console untuk detail.</p>
          </div>
        </div>
      )}

      <CrudLayout
        title="Hasil & Skor IRT"
        description="Laporan hasil ujian Try Out siswa, skor bobot IRT per subtes, dan peringkat nasional (leaderboard)."
        searchPlaceholder="Cari berdasarkan siswa..."
        totalItems={results.length}
        currentPage={1}
        totalPages={1}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Siswa</TableHead>
              <TableHead className="font-bold text-slate-700">Paket Try Out</TableHead>
              <TableHead className="font-bold text-slate-700">Skor Akhir IRT</TableHead>
              <TableHead className="font-bold text-slate-700">Statistik Jawaban</TableHead>
              <TableHead className="font-bold text-slate-700">Tanggal Ujian</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">Memuat data dari database...</TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <BarChart3 className="h-10 w-10 text-slate-300" />
                    <p className="text-sm font-semibold">Belum ada hasil ujian</p>
                    <p className="text-xs">Data akan muncul setelah siswa menyelesaikan Try Out</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              results.map((res) => (
                <TableRow key={res.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{res.user_name}</p>
                      <p className="text-xs text-slate-500 font-mono">{res.user_id?.slice(0, 8)}...</p>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-700 font-semibold truncate max-w-[180px]">
                    {res.tryout_title}
                  </TableCell>

                  <TableCell className="py-3 font-black text-slate-900">
                    <div className="flex items-center gap-1.5 text-sm">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span>{res.score}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-600 font-medium">
                    {res.total_correct} Benar dari {res.total_questions} Soal
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">{formatDate(res.created_at)}</TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Opsi Hasil
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs font-semibold text-slate-700 cursor-pointer rounded-lg gap-2">
                          <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                          <span>Rincian Nilai IRT</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(res.id)} className="text-xs font-semibold text-rose-600 cursor-pointer rounded-lg gap-2 focus:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Reset Ujian</span>
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
    </div>
  );
}
