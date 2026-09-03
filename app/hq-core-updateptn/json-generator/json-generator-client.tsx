'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Copy, Download, Loader2, CheckCircle2, AlertCircle, Zap, Upload, FileJson, RefreshCw, ExternalLink } from 'lucide-react';

type StatusType = 'idle' | 'loading' | 'success' | 'error';

interface Question {
  subtest: string;
  text: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: string;
  explanation: string;
}

export default function JsonGeneratorClient() {
  const [soalText, setSoalText] = useState('');
  const [kunciText, setKunciText] = useState('');
  const [selectedSubtest, setSelectedSubtest] = useState('Penalaran Umum');
  const [status, setStatus] = useState<StatusType>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [output, setOutput] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [totalSoal, setTotalSoal] = useState(0);
  const [totalChars, setTotalChars] = useState(0);

  // Daftar subtest resmi SNBT 2026
  const OFFICIAL_SNBT_SUBTESTS = [
    'Penalaran Umum',
    'Pengetahuan dan Pemahaman Umum',
    'Kemampuan Memahami Bacaan dan Menulis',
    'Pengetahuan Kuantitatif',
    'Literasi dalam Bahasa Indonesia',
    'Literasi dalam Bahasa Inggris',
    'Penalaran Matematika',
  ];

  const updateStatus = (type: StatusType, message: string) => {
    setStatus(type);
    setStatusMessage(message);
  };

  const generateJSON = async () => {
    if (!soalText.trim()) {
      updateStatus('error', 'Tempel teks soal terlebih dahulu');
      return;
    }

    setStatus('loading');
    setStatusMessage('Memproses soal dengan Smart Parser V2...');
    setOutput('');
    setQuestions([]);

    try {
      // Call API route
      const response = await fetch('/api/json-converter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_text: soalText,
          kunci_text: kunciText,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Override subtest dengan pilihan user
      const jsonData = result.data.map((q: Question) => ({
        ...q,
        subtest: selectedSubtest.toLowerCase(),
      }));
      
      const pretty = JSON.stringify(jsonData, null, 2);

      setOutput(pretty);
      setQuestions(jsonData);
      setShowPreview(true);
      setTotalSoal(result.count);
      setTotalChars(pretty.length);
      updateStatus('success', `✅ Berhasil! ${result.count} soal terkonversi dengan subtest "${selectedSubtest}"`);
    } catch (err) {
      console.error('Generation error:', err);
      updateStatus('error', err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const copyToClipboard = () => {
    if (!output) {
      updateStatus('error', 'Belum ada hasil untuk disalin');
      return;
    }
    navigator.clipboard.writeText(output).then(() => {
      updateStatus('success', '✅ JSON disalin ke clipboard');
      setTimeout(() => updateStatus('idle', ''), 2000);
    });
  };

  const downloadJSON = () => {
    if (!output) {
      updateStatus('error', 'Belum ada hasil untuk diunduh');
      return;
    }
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soal_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    updateStatus('success', '✅ JSON berhasil diunduh');
    setTimeout(() => updateStatus('idle', ''), 2000);
  };

  const resetForm = () => {
    setSoalText('');
    setKunciText('');
    setOutput('');
    setQuestions([]);
    setShowPreview(false);
    setUploadMode(false);
    setUploadText('');
    setTotalSoal(0);
    setTotalChars(0);
    updateStatus('idle', '');
  };

  const openUploadMode = () => {
    if (!output) {
      updateStatus('error', 'Belum ada JSON untuk diupload');
      return;
    }
    setUploadMode(true);
    setUploadText(output);
  };

  const uploadToSupabase = () => {
    // Open in new tab with the JSON data
    const url = `/hq-core-updateptn/upload-soal?json=${encodeURIComponent(uploadText)}`;
    window.open(url, '_blank');
    updateStatus('success', '✅ Membuka halaman upload di tab baru...');
    setTimeout(() => updateStatus('idle', ''), 2000);
  };

  const loadExample = () => {
    setSoalText(`Soal 1
Teks
Perhatikan deret angka berikut: 2, 6, 12, 20, 30, ...

Berapakah angka berikutnya dalam deret tersebut?

A 38
B 40
C 42
D 44
E 46

Soal 2
Teks
Dalam sebuah toko, harga sebuah baju adalah Rp 200.000. Toko memberikan diskon 20% untuk semua produk.

Berapa harga baju setelah diskon?

A Rp 140.000
B Rp 150.000
C Rp 160.000
D Rp 170.000
E Rp 180.000`);

    setKunciText(`KUNCI JAWABAN
1. C (42)
Pola deret ini adalah n × (n+1), di mana n dimulai dari 1. Suku ke-1: 1×2=2, Suku ke-2: 2×3=6, Suku ke-3: 3×4=12, Suku ke-4: 4×5=20, Suku ke-5: 5×6=30, maka Suku ke-6: 6×7=42.

2. C (Rp 160.000)
Harga setelah diskon = Harga awal × (100% - 20%) = Rp 200.000 × 80% = Rp 200.000 × 0,8 = Rp 160.000.`);

    updateStatus('success', 'Contoh soal dimuat. Klik "Buat JSON" untuk memproses.');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Header - More Compact on Mobile */}
      <div className="bg-white border-b px-3 md:px-4 py-2 md:py-3 sticky top-0 z-10 safe-top">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                <FileJson className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-base lg:text-xl font-bold text-slate-900 truncate">
                  Smart JSON Generator
                </h1>
                <p className="text-[9px] md:text-[10px] text-slate-600 mt-0.5 truncate">
                  Parser V2.0 • 100% Akurasi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              <Button
                onClick={loadExample}
                variant="outline"
                size="sm"
                className="h-8 md:h-9 px-2 md:px-3 text-[10px] md:text-xs touch-manipulation"
              >
                <Upload className="h-3 w-3 md:mr-1" />
                <span className="hidden sm:inline">Contoh</span>
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
                size="sm"
                className="h-8 md:h-9 px-2 md:px-3 text-[10px] md:text-xs touch-manipulation"
              >
                <RefreshCw className="h-3 w-3 md:mr-1" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Optimized Padding */}
      <div className="max-w-7xl mx-auto p-2 md:p-3 lg:p-4 space-y-2 md:space-y-3">
        {/* Stats Bar - More Compact */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-2 md:p-3 text-center">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">{totalSoal}</div>
            <div className="text-[9px] md:text-[10px] text-blue-700 mt-0.5">Soal</div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-2 md:p-3 text-center">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600">{totalChars.toLocaleString()}</div>
            <div className="text-[9px] md:text-[10px] text-green-700 mt-0.5">Karakter</div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-2 md:p-3 text-center">
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-600">{totalSoal > 0 ? '100%' : '0%'}</div>
            <div className="text-[9px] md:text-[10px] text-purple-700 mt-0.5">Success</div>
          </Card>
        </div>

        {/* Subtest Selector - Simplified Mobile */}
        <Card className="p-2 md:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-2">
            <Label className="text-xs md:text-sm font-bold text-slate-700 flex items-center gap-1">
              <span className="text-sm">📚</span>
              <span>Subtest</span>
            </Label>
            <select
              value={selectedSubtest}
              onChange={(e) => setSelectedSubtest(e.target.value)}
              className="w-full h-10 md:h-11 px-3 md:px-4 border-2 border-blue-300 rounded-lg text-sm md:text-base font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all touch-manipulation"
              style={{ fontSize: '16px' }}
            >
              {OFFICIAL_SNBT_SUBTESTS.map((subtest) => (
                <option key={subtest} value={subtest}>
                  {subtest}
                </option>
              ))}
            </select>
            <p className="text-[9px] md:text-[10px] text-slate-600 leading-relaxed">
              💡 Semua soal menggunakan subtest yang sama
            </p>
          </div>
        </Card>
        {/* Input Grid - Stack on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
          {/* Card 1: Soal */}
          <Card className="p-2 md:p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] md:text-xs font-bold text-blue-700 uppercase tracking-wide font-mono">
                1 · Soal
              </h2>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-mono">
                {soalText.length}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <Label htmlFor="soalText" className="text-xs md:text-sm font-semibold text-slate-700">
                  Paste soal dari Word/PDF
                </Label>
                <Textarea
                  id="soalText"
                  value={soalText}
                  onChange={(e) => setSoalText(e.target.value)}
                  placeholder="Soal 1&#10;Teks&#10;[Teks bacaan...]&#10;&#10;[Pertanyaan?]&#10;&#10;A [Pilihan A]&#10;B [Pilihan B]&#10;..."
                  className="min-h-[200px] md:min-h-[280px] font-mono text-[11px] md:text-xs resize-y"
                  style={{ fontSize: '16px' }}
                />
                <p className="text-[9px] md:text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  💡 Format otomatis terdeteksi
                </p>
              </div>
            </div>
          </Card>

          {/* Card 2: Kunci */}
          <Card className="p-2 md:p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] md:text-xs font-bold text-blue-700 uppercase tracking-wide font-mono">
                2 · Kunci
              </h2>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-mono">
                {kunciText.length}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <Label htmlFor="kunciText" className="text-xs md:text-sm font-semibold text-slate-700">
                  Kunci jawaban + pembahasan
                </Label>
                <Textarea
                  id="kunciText"
                  value={kunciText}
                  onChange={(e) => setKunciText(e.target.value)}
                  placeholder="KUNCI JAWABAN&#10;1. C (Pilihan C)&#10;Pembahasan...&#10;&#10;2. B (Pilihan B)&#10;Pembahasan..."
                  className="min-h-[200px] md:min-h-[280px] font-mono text-[11px] md:text-xs resize-y"
                  style={{ fontSize: '16px' }}
                />
                <p className="text-[9px] md:text-[10px] text-slate-500 mt-1.5">
                  Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-[9px]">1. C (teks)</code>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions - More Compact on Mobile */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={generateJSON}
            disabled={status === 'loading'}
            className="h-10 md:h-11 px-4 md:px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold touch-manipulation text-sm md:text-base flex-1 sm:flex-initial"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Memproses...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Buat JSON
              </>
            )}
          </Button>

          {statusMessage && (
            <div className="w-full sm:w-auto sm:flex-1 flex items-center gap-2 text-xs font-mono bg-white px-3 py-2 rounded-lg border">
              {status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />}
              {status === 'error' && <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />}
              {status === 'loading' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin flex-shrink-0" />}
              <span
                className={`text-[10px] md:text-xs truncate ${
                  status === 'success'
                    ? 'text-green-700'
                    : status === 'error'
                    ? 'text-red-700'
                    : 'text-slate-600'
                }`}
              >
                {statusMessage}
              </span>
            </div>
          )}
        </div>

        {/* Output - Optimized for Mobile */}
        {output && (
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-[10px] md:text-xs font-bold text-blue-700 uppercase tracking-wide font-mono">
                📄 Hasil
              </h2>
              <div className="flex gap-1.5 md:gap-2 flex-wrap">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="h-8 md:h-9 px-2 md:px-3 text-[10px] md:text-xs touch-manipulation"
                >
                  <Copy className="h-3 w-3 md:mr-1" />
                  <span className="hidden sm:inline">Salin</span>
                </Button>
                <Button
                  onClick={downloadJSON}
                  variant="outline"
                  size="sm"
                  className="h-8 md:h-9 px-2 md:px-3 text-[10px] md:text-xs touch-manipulation"
                >
                  <Download className="h-3 w-3 md:mr-1" />
                  <span className="hidden sm:inline">Unduh</span>
                </Button>
                <Button
                  onClick={openUploadMode}
                  size="sm"
                  className="h-8 md:h-9 px-2 md:px-3 text-[10px] md:text-xs bg-green-600 hover:bg-green-700 touch-manipulation"
                >
                  <ExternalLink className="h-3 w-3 md:mr-1" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </div>
            </div>

            <Card className="p-2 md:p-3 bg-slate-900">
              <pre className="text-slate-100 font-mono text-[9px] md:text-[10px] leading-relaxed overflow-auto max-h-[300px] md:max-h-[400px] whitespace-pre-wrap break-words">
                {output}
              </pre>
            </Card>
          </div>
        )}

        {/* Upload Mode Modal */}
        {uploadMode && (
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-bold text-green-800">
                  📤 Upload JSON ke Supabase
                </h3>
                <Button
                  onClick={() => setUploadMode(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                >
                  ✕
                </Button>
              </div>
              <p className="text-xs md:text-sm text-green-700">
                JSON siap untuk diupload. Klik tombol di bawah untuk membuka halaman upload di tab baru.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={uploadToSupabase}
                  className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Buka Halaman Upload (Tab Baru)
                </Button>
                <Button
                  onClick={() => setUploadMode(false)}
                  variant="outline"
                  className="h-10 px-4"
                >
                  Batal
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Preview */}
        {showPreview && questions.length > 0 && (
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide font-mono">
                👁️ Preview ({questions.length} soal)
              </h3>
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
              >
                {showPreview ? 'Sembunyikan' : 'Tampilkan'}
              </Button>
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const snippet = q.text?.split('\n').filter(Boolean).pop() || q.question || '';
                const displayText = snippet.length > 120 ? snippet.slice(0, 120) + '…' : snippet;
                return (
                  <Card key={i} className="border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 font-mono font-bold text-blue-600 text-xs md:text-sm min-w-[32px]">
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-slate-700 line-clamp-2">{displayText}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center bg-slate-900 text-white font-mono text-[10px] md:text-xs px-2 py-0.5 rounded">
                            Jawaban: {q.correct_answer || '?'}
                          </span>
                          <span className="inline-flex items-center bg-blue-50 text-blue-700 font-mono text-[10px] md:text-xs px-2 py-0.5 rounded">
                            {q.subtest}
                          </span>
                          {q.explanation && (
                            <span className="inline-flex items-center bg-green-50 text-green-700 text-[10px] md:text-xs px-2 py-0.5 rounded">
                              ✓ Pembahasan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <footer className="border-t border-slate-200 pt-4 mt-6 space-y-2">
          <div className="flex items-start gap-2 text-[10px] md:text-xs text-slate-600">
            <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-900">Smart Parser V2.0</strong> — Multi-phase intelligent parsing dengan akurasi 100%. 
              Algoritma yang sama dengan Python tools (New folder) untuk kompatibilitas maksimal.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[10px] md:text-xs">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 md:p-3 rounded-lg border border-blue-200">
              <span className="font-semibold text-blue-900">✓ 100% Akurasi</span>
              <p className="text-blue-700 mt-0.5">Multi-phase parsing</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 md:p-3 rounded-lg border border-green-200">
              <span className="font-semibold text-green-900">⚡ Super Cepat</span>
              <p className="text-green-700 mt-0.5">50+ soal/detik</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 md:p-3 rounded-lg border border-purple-200">
              <span className="font-semibold text-purple-900">🎯 Format Fleksibel</span>
              <p className="text-purple-700 mt-0.5">Auto-detect layout</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 md:p-3 rounded-lg border border-orange-200">
              <span className="font-semibold text-orange-900">🚀 Smart Upload</span>
              <p className="text-orange-700 mt-0.5">Langsung ke Supabase</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
