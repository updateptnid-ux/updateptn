"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileJson,
} from "lucide-react";
import { toast } from "sonner";

interface SNBPData {
  id: string;
  ptn_id: string;
  ptn_name: string;
  kategori: string;
  kode_prodi: string;
  nama_prodi: string;
  jenjang: string;
  daya_tampung: number;
  peminat: number;
  rasio_keketatan: number;
  nilai_raport: number;
  estimasi_nilai_raport: number;
  jenis_portofolio: string;
}

export default function SNBPDataManagementPage() {
  const [snbpData, setSnbpData] = useState<SNBPData[]>([]);
  const [filteredData, setFilteredData] = useState<SNBPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSNBPData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, selectedKategori, snbpData]);

  async function loadSNBPData() {
    setLoading(true);
    try {
      const res = await fetch("/data_snbp.json");
      if (res.ok) {
        const data = await res.json();
        setSnbpData(data);
        setFilteredData(data);
      } else {
        toast.error("Gagal memuat data SNBP");
      }
    } catch (error) {
      console.error("Error loading SNBP data:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    }
    setLoading(false);
  }

  function filterData() {
    let filtered = [...snbpData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.nama_prodi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ptn_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.kode_prodi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedKategori !== "all") {
      filtered = filtered.filter((item) => item.kategori === selectedKategori);
    }

    setFilteredData(filtered);
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("File harus berformat JSON");
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const newData = JSON.parse(content);

          // Validate data structure
          if (!Array.isArray(newData)) {
            throw new Error("Data harus berupa array");
          }

          if (newData.length === 0) {
            throw new Error("Data tidak boleh kosong");
          }

          // Validate required fields
          const requiredFields = [
            "ptn_name",
            "nama_prodi",
            "kategori",
            "jenjang",
            "daya_tampung",
            "peminat",
            "nilai_raport",
          ];

          const isValid = newData.every((item) =>
            requiredFields.every((field) => field in item)
          );

          if (!isValid) {
            throw new Error("Data tidak memiliki semua field yang diperlukan");
          }

          // Upload via API
          const response = await fetch("/api/upload-snbp-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newData),
          });

          if (response.ok) {
            toast.success(`Berhasil upload ${newData.length} data SNBP!`);
            await loadSNBPData();
          } else {
            throw new Error("Gagal upload data ke server");
          }
        } catch (error: any) {
          console.error("Error parsing JSON:", error);
          toast.error(error.message || "File JSON tidak valid");
        } finally {
          setUploading(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Gagal membaca file");
      setUploading(false);
    }

    // Reset input
    event.target.value = "";
  }

  function downloadCurrentData() {
    const dataStr = JSON.stringify(snbpData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `data_snbp_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data berhasil didownload!");
  }

  function downloadTemplate() {
    const template = [
      {
        id: "generate-uuid",
        ptn_id: "111",
        ptn_name: "UNIVERSITAS CONTOH",
        kategori: "Akademik",
        kode_prodi: "11111001",
        nama_prodi: "TEKNIK INFORMATIKA",
        jenjang: "Sarjana",
        daya_tampung: 100,
        peminat: 500,
        rasio_keketatan: 5.0,
        nilai_raport: 85,
        estimasi_nilai_raport: 85,
        jenis_portofolio: "Tidak Ada",
      },
    ];

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_snbp.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Template berhasil didownload!");
  }

  const categories = ["all", ...Array.from(new Set(snbpData.map((d) => d.kategori)))];

  const stats = {
    total: snbpData.length,
    akademik: snbpData.filter((d) => d.kategori === "Akademik").length,
    vokasi: snbpData.filter((d) => d.kategori === "Vokasi").length,
    avgKeketatan: snbpData.length > 0
      ? (snbpData.reduce((sum, d) => sum + d.rasio_keketatan, 0) / snbpData.length).toFixed(2)
      : "0",
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Data SNBP 2026</h1>
          <p className="text-sm text-slate-600 mt-1">
            Kelola data keketatan program studi jalur SNBP
          </p>
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-900">Catatan Akurasi Data</p>
                <p className="text-xs text-amber-700 mt-1">
                  Data SNBP adalah <strong>estimasi</strong> berdasarkan:
                </p>
                <ul className="text-xs text-amber-700 mt-1 ml-4 list-disc space-y-0.5">
                  <li>Nilai raport rata-rata peserta diterima tahun lalu</li>
                  <li>Rasio keketatan = Peminat ÷ Daya Tampung (data LTMPT)</li>
                  <li>Bukan angka pasti karena SNBP tidak ada passing grade resmi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="gap-2"
          >
            <FileJson className="h-4 w-4" />
            Template
          </Button>
          <Button
            variant="outline"
            onClick={downloadCurrentData}
            disabled={snbpData.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => document.getElementById("snbp-upload")?.click()}
            disabled={uploading}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload JSON
              </>
            )}
          </Button>
          <input
            id="snbp-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">TOTAL PRODI</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-600 mt-1">Program studi tersedia</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">AKADEMIK</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.akademik}</p>
          <p className="text-xs text-slate-600 mt-1">Kategori akademik</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">VOKASI</span>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.vokasi}</p>
          <p className="text-xs text-slate-600 mt-1">Kategori vokasi</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">AVG KEKETATAN</span>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.avgKeketatan}:1</p>
          <p className="text-xs text-slate-600 mt-1">Rasio rata-rata</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama prodi, PTN, atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ fontSize: "16px" }}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedKategori === "all" ? "default" : "outline"}
            onClick={() => setSelectedKategori("all")}
            size="sm"
          >
            Semua
          </Button>
          <Button
            variant={selectedKategori === "Akademik" ? "default" : "outline"}
            onClick={() => setSelectedKategori("Akademik")}
            size="sm"
          >
            Akademik
          </Button>
          <Button
            variant={selectedKategori === "Vokasi" ? "default" : "outline"}
            onClick={() => setSelectedKategori("Vokasi")}
            size="sm"
          >
            Vokasi
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">
            Data Program Studi ({filteredData.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSNBPData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600">Memuat data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-8 w-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600">Tidak ada data yang sesuai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 font-bold text-xs text-slate-600">PTN</th>
                  <th className="text-left p-3 font-bold text-xs text-slate-600">PRODI</th>
                  <th className="text-left p-3 font-bold text-xs text-slate-600">KATEGORI</th>
                  <th className="text-right p-3 font-bold text-xs text-slate-600">DAYA TAMPUNG</th>
                  <th className="text-right p-3 font-bold text-xs text-slate-600">PEMINAT</th>
                  <th className="text-right p-3 font-bold text-xs text-slate-600">RASIO</th>
                  <th className="text-right p-3 font-bold text-xs text-slate-600">EST. NILAI</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.slice(0, 100).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-semibold text-slate-900 text-xs">
                        {item.ptn_name}
                      </p>
                      <p className="text-xs text-slate-500">{item.ptn_id}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-900 text-xs">
                        {item.nama_prodi}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.jenjang} • {item.kode_prodi}
                      </p>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={
                          item.kategori === "Akademik"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }
                      >
                        {item.kategori}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-semibold">{item.daya_tampung}</td>
                    <td className="p-3 text-right font-semibold">{item.peminat}</td>
                    <td className="p-3 text-right">
                      <Badge
                        className={
                          item.rasio_keketatan > 10
                            ? "bg-rose-100 text-rose-700"
                            : item.rasio_keketatan > 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }
                      >
                        {item.rasio_keketatan.toFixed(2)}:1
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-bold text-blue-600">
                      {item.estimasi_nilai_raport}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length > 100 && (
              <p className="text-xs text-slate-500 text-center mt-4">
                Menampilkan 100 dari {filteredData.length} data
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
