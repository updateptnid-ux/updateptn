"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, TrendingUp, Users, FileText } from "lucide-react";

interface Result {
  id: string;
  user_id: string;
  tryout_id: string;
  score: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  tryouts: {
    title: string;
    tryout_type: string;
    mandiri_category: string;
  };
}

export default function AdminResultsMandiriPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    fetchResults();
  }, [currentPage]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get total count
      const { count } = await supabase
        .from("results")
        .select("id", { count: "exact", head: true })
        .eq("tryout_type", "mandiri");

      setTotalCount(count || 0);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("results")
        .select(`
          *,
          profiles!inner(full_name, email),
          tryouts!inner(title, tryout_type, mandiri_category)
        `)
        .eq("tryouts.tryout_type", "mandiri")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        setResults(data as any);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    const query = searchQuery.toLowerCase();
    return (
      result.profiles?.full_name?.toLowerCase().includes(query) ||
      result.profiles?.email?.toLowerCase().includes(query) ||
      result.tryouts?.title?.toLowerCase().includes(query)
    );
  });

  const totalParticipants = new Set(results.map(r => r.user_id)).size;
  const totalAttempts = results.length;
  const avgScore = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) 
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Hasil Ujian Mandiri</h1>
        <p className="text-sm text-slate-600 mt-1">
          Lihat dan analisis hasil Try Out Ujian Mandiri PTN siswa
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Peserta</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalParticipants}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ujian</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalAttempts}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rata-rata Skor</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{avgScore}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari siswa, email, atau nama try out..."
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Table */}
      <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Memuat data hasil ujian...
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {searchQuery ? "Tidak ada hasil yang cocok dengan pencarian." : "Belum ada hasil ujian Mandiri."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold">Nama Siswa</TableHead>
                <TableHead className="font-bold">Try Out</TableHead>
                <TableHead className="font-bold">Kategori</TableHead>
                <TableHead className="font-bold">Skor</TableHead>
                <TableHead className="font-bold">Waktu Pengerjaan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{result.profiles?.full_name || "Nama tidak tersedia"}</p>
                      <p className="text-xs text-slate-500">{result.profiles?.email || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900 text-sm">{result.tryouts?.title || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs font-bold">
                      {result.tryouts?.mandiri_category || "Lainnya"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs font-bold ${
                        result.score >= 700 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        result.score >= 500 ? "bg-blue-100 text-blue-700 border-blue-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {Math.round(result.score)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600">{formatDate(result.created_at)}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
