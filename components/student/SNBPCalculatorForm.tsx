"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  School,
  BookOpen,
  Award,
  Plus,
  Trash2,
  Calculator,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// Data provinsi Indonesia
const PROVINCES = [
  "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta",
  "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur",
  "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah",
  "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
  "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat",
  "Nusa Tenggara Timur", "Papua", "Papua Barat", "Papua Barat Daya",
  "Papua Pegunungan", "Papua Selatan", "Papua Tengah", "Riau",
  "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara",
  "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara"
];

// Data akreditasi
const ACCREDITATIONS = ["A (Unggul)", "B (Baik Sekali)", "C (Baik)"];

// Data kurikulum dengan jurusan
const CURRICULUMS = [
  { value: "merdeka-ipa", label: "Kurikulum Merdeka - IPA" },
  { value: "merdeka-ips", label: "Kurikulum Merdeka - IPS" },
  { value: "k13-ipa", label: "Kurikulum 2013 - IPA" },
  { value: "k13-ips", label: "Kurikulum 2013 - IPS" },
];

// Tingkatan prestasi
const ACHIEVEMENT_LEVELS = [
  "Internasional - Juara 1",
  "Internasional - Juara 2",
  "Internasional - Juara 3",
  "Nasional - Juara 1",
  "Nasional - Juara 2",
  "Nasional - Juara 3",
  "Provinsi - Juara 1",
  "Provinsi - Juara 2",
  "Provinsi - Juara 3",
];

interface BoosterSubject {
  id: string;
  name: string;
  value: string;
}

interface Achievement {
  id: string;
  name: string;
  level: string;
  year: string;
}

interface SNBPData {
  // Biodata
  province: string;
  city: string;
  schoolName: string;
  accreditation: string;
  curriculum: string;
  
  // Booster Score
  boosterSubjects: BoosterSubject[];
  
  // Prestasi
  achievements: Achievement[];
  
  // Nilai raport (akan dihitung dari detail)
  averageScore: number;
}

interface Props {
  onCalculate: (data: SNBPData) => void;
  initialScore?: number;
  children?: React.ReactNode;
  isQuotaExhausted?: boolean;
  remainingQuota?: number | null;
  totalQuota?: number | null;
}

export default function SNBPCalculatorForm({
  onCalculate,
  initialScore = 0,
  children,
  isQuotaExhausted = false,
  remainingQuota = null,
  totalQuota = null,
}: Props) {
  // Biodata
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [accreditation, setAccreditation] = useState("");
  const [curriculum, setCurriculum] = useState("");
  
  // Booster Subjects
  const [boosterSubjects, setBoosterSubjects] = useState<BoosterSubject[]>([
    { id: "b1", name: "", value: "" }
  ]);
  
  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Nilai raport
  const [averageScore, setAverageScore] = useState<number>(initialScore);

  // Add booster subject
  const addBoosterSubject = () => {
    setBoosterSubjects([
      ...boosterSubjects,
      { id: `b${Date.now()}`, name: "", value: "" }
    ]);
  };

  // Remove booster subject
  const removeBoosterSubject = (id: string) => {
    setBoosterSubjects(boosterSubjects.filter(b => b.id !== id));
  };

  // Update booster subject
  const updateBoosterSubject = (id: string, field: 'name' | 'value', value: string) => {
    setBoosterSubjects(boosterSubjects.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  // Add achievement
  const addAchievement = () => {
    if (achievements.length >= 3) {
      alert("Maksimal 3 prestasi");
      return;
    }
    setAchievements([
      ...achievements,
      { id: `a${Date.now()}`, name: "", level: "", year: "" }
    ]);
  };

  // Remove achievement
  const removeAchievement = (id: string) => {
    setAchievements(achievements.filter(a => a.id !== id));
  };

  // Update achievement
  const updateAchievement = (id: string, field: 'name' | 'level' | 'year', value: string) => {
    setAchievements(achievements.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  // Validate and submit
  const handleCalculate = () => {
    if (isQuotaExhausted) {
      alert("Kuota Anda sudah habis");
      return;
    }

    // Validation
    if (!province || !city || !schoolName || !accreditation || !curriculum) {
      alert("Harap isi semua data diri dan sekolah");
      return;
    }

    if (averageScore <= 0 || averageScore > 100) {
      alert("Nilai raport harus antara 1-100");
      return;
    }

    const data: SNBPData = {
      province,
      city,
      schoolName,
      accreditation,
      curriculum,
      boosterSubjects: boosterSubjects.filter(b => b.name && b.value),
      achievements: achievements.filter(a => a.name && a.level && a.year),
      averageScore,
    };

    onCalculate(data);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 p-3 md:p-4 w-full">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs md:text-sm font-bold text-blue-900">Kalkulator SNBP Terintegrasi</p>
            <p className="text-[10px] md:text-xs text-blue-700 leading-relaxed">
              Lengkapi data diri, sekolah, nilai pendukung (booster score), dan prestasi untuk mendapatkan analisis peluang SNBP yang akurat.
            </p>
          </div>
        </div>
      </Card>

      {/* Data Diri & Sekolah */}
      <Card className="p-4 md:p-5 space-y-4 w-full shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
          <h3 className="text-sm md:text-base font-bold text-slate-900">Data Diri & Sekolah</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {/* Provinsi */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs md:text-sm font-semibold text-slate-700">
              Provinsi Sekolah <span className="text-rose-600">*</span>
            </Label>
            <Select value={province} onValueChange={(val) => setProvince(val || "")}>
              <SelectTrigger className="h-10 md:h-11 text-xs md:text-sm w-full">
                <SelectValue placeholder="Pilih provinsi..." />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((p) => (
                  <SelectItem key={p} value={p} className="text-xs md:text-sm">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kota */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs md:text-sm font-semibold text-slate-700">
              Kota/Kabupaten <span className="text-rose-600">*</span>
            </Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Contoh: Jakarta Selatan"
              className="h-10 md:h-11 text-xs md:text-sm w-full"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Nama Sekolah */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs md:text-sm font-semibold text-slate-700">
              Nama Sekolah <span className="text-rose-600">*</span>
            </Label>
            <Input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Contoh: SMAN 1 Jakarta"
              className="h-10 md:h-11 text-xs md:text-sm w-full"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Akreditasi */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs md:text-sm font-semibold text-slate-700">
              Akreditasi Sekolah <span className="text-rose-600">*</span>
            </Label>
            <Select value={accreditation} onValueChange={(val) => setAccreditation(val || "")}>
              <SelectTrigger className="h-10 md:h-11 text-xs md:text-sm w-full">
                <SelectValue placeholder="Pilih akreditasi..." />
              </SelectTrigger>
              <SelectContent>
                {ACCREDITATIONS.map((acc) => (
                  <SelectItem key={acc} value={acc} className="text-xs md:text-sm">
                    {acc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kurikulum */}
          <div className="space-y-1.5 md:col-span-2 w-full">
            <Label className="text-xs md:text-sm font-semibold text-slate-700">
              Kurikulum & Jurusan <span className="text-rose-600">*</span>
            </Label>
            <Select value={curriculum} onValueChange={(val) => setCurriculum(val || "")}>
              <SelectTrigger className="h-10 md:h-11 text-xs md:text-sm w-full">
                <SelectValue placeholder="Pilih kurikulum dan jurusan..." />
              </SelectTrigger>
              <SelectContent>
                {CURRICULUMS.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value} className="text-xs md:text-sm">
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Nilai Raport */}
      <Card className="p-4 md:p-5 space-y-3 w-full shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
          <h3 className="text-sm md:text-base font-bold text-slate-900">Nilai Raport Rata-rata</h3>
        </div>

        <div className="space-y-2 w-full">
          <Label className="text-xs md:text-sm font-semibold text-slate-700">
            Rata-rata Nilai Raport Semester 1-5 <span className="text-rose-600">*</span>
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={averageScore}
            onChange={(e) => setAverageScore(parseFloat(e.target.value) || 0)}
            placeholder="Masukkan rata-rata nilai (0-100)"
            className="h-11 md:h-12 text-sm md:text-base font-bold w-full"
            style={{ fontSize: '16px' }}
          />
          <p className="text-[10px] md:text-xs text-slate-500">
            💡 Nilai rata-rata dari semua mata pelajaran semester 1-5. Gunakan kalkulator otomatis jika perlu bantuan menghitung.
          </p>
        </div>
      </Card>

      {/* Booster Score */}
      <Card className="p-4 md:p-5 space-y-4 w-full shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            <h3 className="text-sm md:text-base font-bold text-slate-900">Booster Score (Nilai Pendukung)</h3>
          </div>
          <Badge variant="outline" className="text-[10px] md:text-xs">Opsional</Badge>
        </div>

        <p className="text-[10px] md:text-xs text-slate-600">
          Masukkan nilai mata pelajaran yang relevan dengan jurusan pilihan (contoh: Matematika & Fisika untuk Teknik)
        </p>

        <div className="space-y-3 w-full">
          {boosterSubjects.map((subject) => (
            <div key={subject.id} className="flex gap-2 w-full items-center">
              <Input
                value={subject.name}
                onChange={(e) => updateBoosterSubject(subject.id, 'name', e.target.value)}
                placeholder="Nama mata pelajaran (contoh: Matematika)"
                className="flex-1 h-10 text-xs md:text-sm w-full"
                style={{ fontSize: '16px' }}
              />
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={subject.value}
                onChange={(e) => updateBoosterSubject(subject.id, 'value', e.target.value)}
                placeholder="Nilai"
                className="w-24 md:w-32 h-10 text-center text-xs md:text-sm font-semibold shrink-0"
                style={{ fontSize: '16px' }}
              />
              {boosterSubjects.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBoosterSubject(subject.id)}
                  className="h-10 w-10 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={addBoosterSubject}
          variant="outline"
          size="sm"
          className="w-full h-9 text-xs md:text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Tambah Mapel Pendukung
        </Button>
      </Card>

      {/* Prestasi */}
      <Card className="p-4 md:p-5 space-y-4 w-full shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
            <h3 className="text-sm md:text-base font-bold text-slate-900">Prestasi</h3>
          </div>
          <Badge variant="outline" className="text-[10px] md:text-xs">
            Max 3 prestasi
          </Badge>
        </div>

        <p className="text-[10px] md:text-xs text-slate-600">
          Masukkan prestasi yang diakui (Internasional, Nasional, atau Provinsi)
        </p>

        {achievements.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 w-full">
            <Award className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Belum ada prestasi ditambahkan</p>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            {achievements.map((achievement, index) => (
              <Card key={achievement.id} className="p-3 md:p-4 bg-slate-50 border-slate-200 w-full">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-[10px]">Prestasi {index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAchievement(achievement.id)}
                    className="h-6 w-6 p-0 text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                  <Input
                    value={achievement.name}
                    onChange={(e) => updateAchievement(achievement.id, 'name', e.target.value)}
                    placeholder="Nama lomba/kompetisi"
                    className="h-9 md:h-10 text-xs md:text-sm w-full"
                    style={{ fontSize: '14px' }}
                  />
                  
                  <Select
                    value={achievement.level}
                    onValueChange={(value) => updateAchievement(achievement.id, 'level', value || "")}
                  >
                    <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm w-full">
                      <SelectValue placeholder="Tingkat & juara" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACHIEVEMENT_LEVELS.map((level) => (
                        <SelectItem key={level} value={level} className="text-xs md:text-sm">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min={2020}
                    max={new Date().getFullYear()}
                    value={achievement.year}
                    onChange={(e) => updateAchievement(achievement.id, 'year', e.target.value)}
                    placeholder="Tahun"
                    className="h-9 md:h-10 text-xs md:text-sm text-center w-full"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        {achievements.length < 3 && (
          <Button
            onClick={addAchievement}
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs md:text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah Prestasi
          </Button>
        )}
      </Card>

      {/* Children Slot (Pilih Jurusan PTN) */}
      {children}

      {isQuotaExhausted && (
        <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-rose-100 rounded-lg shrink-0">
              <AlertCircle className="h-5 w-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-900 mb-1">Kuota Anda sudah habis</p>
              <p className="text-xs text-rose-800 leading-relaxed">
                Batas kuota penggunaan Paket Cek Peluang Anda telah habis. Silakan beli paket tambahan untuk melanjutkan analisis.
              </p>
            </div>
          </div>
        </div>
      )}

      {totalQuota !== null && remainingQuota !== null && !isQuotaExhausted && (
        <div className="text-center">
          <span className="text-xs text-slate-500 font-medium">
            Sisa Kuota Cek: <span className="font-bold text-blue-600">{remainingQuota}</span> / {totalQuota}x
          </span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleCalculate}
        disabled={isQuotaExhausted}
        className={`w-full h-11 md:h-12 font-bold text-sm md:text-base shadow-md transition-all ${
          isQuotaExhausted
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-lg'
        }`}
      >
        <Calculator className="h-4 w-4 md:h-5 md:w-5 mr-2" />
        {isQuotaExhausted ? "Kuota Anda sudah habis" : "Hitung Peluang SNBP"}
      </Button>
    </div>
  );
}
