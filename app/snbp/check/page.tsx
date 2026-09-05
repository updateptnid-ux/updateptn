"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SNBPCheckPage() {
  const [averageScore, setAverageScore] = useState('');
  const [schoolAccreditation, setSchoolAccreditation] = useState('');
  const [desiredMajor, setDesiredMajor] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/check-snbp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          averageScore: Number(averageScore),
          schoolAccreditation,
          desiredMajor,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.estimatedChance);
        toast.success('Estimasi berhasil dihitung');
      } else {
        toast.error(data.error || 'Gagal menghitung estimasi');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Cek Peluang SNBP</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nilai Rata‑Rata</label>
          <Input
            type="number"
            value={averageScore}
            onChange={(e) => setAverageScore(e.target.value)}
            required
            placeholder="Contoh: 85"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Akreditasi Sekolah</label>
          <Input
            value={schoolAccreditation}
            onChange={(e) => setSchoolAccreditation(e.target.value)}
            required
            placeholder="A, B, C, …"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Jurusan Pilihan</label>
          <Input
            value={desiredMajor}
            onChange={(e) => setDesiredMajor(e.target.value)}
            required
            placeholder="Contoh: Teknik Informatika"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Menghitung…' : 'Hitung Estimasi'}
        </Button>
      </form>
      {result && (
        <p className="mt-4 text-lg font-semibold">
          Estimasi peluang masuk: <span className="text-green-600">{result}</span>
        </p>
      )}
    </div>
  );
}
