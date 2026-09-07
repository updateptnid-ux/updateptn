"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  sem1: string;
  sem2: string;
  sem3: string;
  sem4: string;
  sem5: string;
}

// Default subjects based on common school subjects
const DEFAULT_SUBJECTS = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Fisika",
  "Kimia",
  "Biologi",
  "Sejarah",
  "Geografi",
  "Ekonomi",
  "Sosiologi",
];

export default function KalkulatorSNBPPage() {
  const [subjects, setSubjects] = useState<Subject[]>(
    DEFAULT_SUBJECTS.map((name, idx) => ({
      id: `subj-${idx}`,
      name,
      sem1: "",
      sem2: "",
      sem3: "",
      sem4: "",
      sem5: "",
    }))
  );

  const [customSubjectName, setCustomSubjectName] = useState("");
  const [finalAverage, setFinalAverage] = useState<number | null>(null);
  const [semesterAverages, setSemesterAverages] = useState<number[]>([]);

  // Add custom subject
  const addCustomSubject = () => {
    if (!customSubjectName.trim()) return;
    
    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name: customSubjectName.trim(),
      sem1: "",
      sem2: "",
      sem3: "",
      sem4: "",
      sem5: "",
    };
    
    setSubjects([...subjects, newSubject]);
    setCustomSubjectName("");
  };

  // Remove subject
  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  // Update subject field
  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(subjects.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  // Calculate averages
  const calculateAverages = () => {
    const semAverages: number[] = [];
    
    // Calculate average for each semester
    for (let semNum = 1; semNum <= 5; semNum++) {
      const semKey = `sem${semNum}` as keyof Subject;
      const values = subjects
        .map(s => parseFloat(s[semKey] as string))
        .filter(v => !isNaN(v) && v > 0);
      
      if (values.length > 0) {
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
        semAverages.push(Math.round(avg * 100) / 100);
      }
    }
    
    setSemesterAverages(semAverages);
    
    // Calculate final average from semester averages
    if (semAverages.length > 0) {
      const finalAvg = semAverages.reduce((sum, v) => sum + v, 0) / semAverages.length;
      setFinalAverage(Math.round(finalAvg * 100) / 100);
    } else {
      setFinalAverage(null);
    }
  };

  // Get status color based on average
  const getStatusColor = (avg: number) => {
    if (avg >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (avg >= 85) return "text-blue-600 bg-blue-50 border-blue-200";
    if (avg >= 80) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  const getStatusLabel = (avg: number) => {
    if (avg >= 90) return "Sangat Baik (Pilihan Top PTN)";
    if (avg >= 85) return "Baik (PTN Favorit)";
    if (avg >= 80) return "Cukup Baik (PTN Menengah)";
    return "Perlu Peningkatan";
  };

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6 py-4 font-sans">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900">
              ← Kembali
            </Button>
          </Link>
        </div>
        
        <div className="space-y-2">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
            Kalkulator SNBP 2026
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Kalkulator Nilai Raport SNBP
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl">
            Hitung rata-rata nilai raport kamu secara detail per mata pelajaran dari semester 1-5. 
            Hasil perhitungan bisa langsung digunakan untuk Cek Peluang SNBP.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-900">Cara Penggunaan:</p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Isi nilai raport untuk setiap mata pelajaran per semester (skala 0-100)</li>
              <li>Tidak wajib mengisi semua semester atau semua mata pelajaran</li>
              <li>Klik "Hitung Rata-rata" untuk melihat hasil perhitungan</li>
              <li>Tambah mata pelajaran custom jika ada yang belum tersedia</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Input Table Card */}
      <Card className="border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Daftar Mata Pelajaran
          </h2>
          <Badge variant="outline" className="text-xs">
            {subjects.length} Mapel
          </Badge>
        </div>

        {/* Table - Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-3 text-xs font-bold text-slate-700 bg-slate-50">Mata Pelajaran</th>
                <th className="text-center p-3 text-xs font-bold text-slate-700 bg-slate-50 w-24">Sem 1</th>
                <th className="text-center p-3 text-xs font-bold text-slate-700 bg-slate-50 w-24">Sem 2</th>
                <th className="text-center p-3 text-xs font-bold text-slate-700 bg-slate-50 w-24">Sem 3</th>
                <th className="text-center p-3 text-xs font-bold text-slate-700 bg-slate-50 w-24">Sem 4</th>
                <th className="text-center p-3 text-xs font-bold text-slate-700 bg-slate-50 w-24">Sem 5</th>
                <th className="text-center p-3 text-xs font-bold text-slate-700 bg-slate-50 w-16">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-3">
                    <span className="text-sm font-semibold text-slate-900">{subject.name}</span>
                  </td>
                  {(['sem1', 'sem2', 'sem3', 'sem4', 'sem5'] as const).map((sem) => (
                    <td key={sem} className="p-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={subject[sem]}
                        onChange={(e) => updateSubject(subject.id, sem, e.target.value)}
                        placeholder="0-100"
                        className="h-9 text-center text-sm font-semibold rounded-lg"
                      />
                    </td>
                  ))}
                  <td className="p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubject(subject.id)}
                      className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards - Mobile */}
        <div className="lg:hidden space-y-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="p-4 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{subject.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubject(subject.id)}
                  className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {(['sem1', 'sem2', 'sem3', 'sem4', 'sem5'] as const).map((sem, idx) => (
                  <div key={sem}>
                    <Label className="text-[10px] text-slate-600 block mb-1 text-center">
                      S{idx + 1}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={subject[sem]}
                      onChange={(e) => updateSubject(subject.id, sem, e.target.value)}
                      placeholder="0"
                      className="h-10 text-center text-xs font-semibold rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Add Custom Subject */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <Label className="text-sm font-semibold text-slate-700">Tambah Mata Pelajaran Lain</Label>
          <div className="flex gap-2">
            <Input
              value={customSubjectName}
              onChange={(e) => setCustomSubjectName(e.target.value)}
              placeholder="Nama mata pelajaran..."
              onKeyPress={(e) => e.key === "Enter" && addCustomSubject()}
              className="flex-1 h-11 rounded-xl text-sm"
            />
            <Button
              onClick={addCustomSubject}
              disabled={!customSubjectName.trim()}
              className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculateAverages}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-base shadow-md"
        >
          <Calculator className="h-5 w-5 mr-2" />
          Hitung Rata-rata Nilai
        </Button>
      </Card>

      {/* Results */}
      {finalAverage !== null && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          {/* Final Average Card */}
          <Card className={`p-6 border-2 ${getStatusColor(finalAverage)}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Rata-rata Nilai Akhir
                  </p>
                  <h2 className="text-4xl font-black mt-1">
                    {finalAverage.toFixed(2)}
                  </h2>
                </div>
                <div className="text-right">
                  <Badge className={`${getStatusColor(finalAverage)} text-xs font-bold px-3 py-1`}>
                    {getStatusLabel(finalAverage)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <TrendingUp className="h-4 w-4" />
                <span>Dihitung dari {semesterAverages.length} semester yang terisi</span>
              </div>
            </div>
          </Card>

          {/* Semester Breakdown */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Rata-rata Per Semester</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {semesterAverages.map((avg, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                  <p className="text-xs text-slate-600 font-medium mb-1">Semester {idx + 1}</p>
                  <p className="text-xl font-black text-slate-900">{avg.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* CTA to Cek Peluang */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Nilai sudah dihitung? Cek peluang PTN kamu sekarang!
                </h3>
                <p className="text-sm text-slate-600">
                  Gunakan nilai <strong className="text-blue-700">{finalAverage.toFixed(2)}</strong> untuk mengecek peluang di jurusan impian
                </p>
              </div>
              <Link href={`/dashboard/student/cek-peluang?type=snbp&score=${finalAverage}`}>
                <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl whitespace-nowrap">
                  Cek Peluang SNBP
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
