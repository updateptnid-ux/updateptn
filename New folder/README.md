# 🔄 Tool Konversi Soal ke JSON

Tool otomatis untuk mengkonversi soal ujian dari format raw text menjadi format JSON.

## 🚀 Quick Start

### Cara 1: Web Interface (Recommended)

1. **Install dependencies**
```bash
pip install -r requirements.txt
```

2. **Jalankan web server**
```bash
python converter_web.py
```

3. **Buka browser**
```
http://localhost:5000
```

4. **Paste soal dan kunci jawaban, lalu klik "Konversi ke JSON"**

5. **Download hasil JSON**

### Cara 2: Command Line

1. **Buat file `soal_raw.txt`** dengan format:
```
Soal 1
Teks
[Isi teks soal]

[Pertanyaan]

A [Pilihan A]
B [Pilihan B]
C [Pilihan C]
D [Pilihan D]
E [Pilihan E]

Soal 2
...
```

2. **Buat file `kunci_jawaban.txt`** dengan format:
```
KUNCI JAWABAN
1. C (Jawaban lengkap)
Penjelasan/pembahasan jawaban.

2. B (Jawaban lengkap)
Penjelasan/pembahasan jawaban.
```

3. **Jalankan script**
```bash
python converter.py
```

4. **Output akan tersimpan di `soal_output.json`**

## 📋 Format Output JSON

```json
[
  {
    "subtest": "penalaran umum",
    "text": "Teks soal...",
    "question": "Pertanyaan?",
    "option_a": "(A) Pilihan A",
    "option_b": "(B) Pilihan B",
    "option_c": "(C) Pilihan C",
    "option_d": "(D) Pilihan D",
    "option_e": "(E) Pilihan E",
    "correct_answer": "C",
    "explanation": "Penjelasan jawaban"
  }
]
```

## ✨ Fitur

- ✅ **Web Interface** - UI yang user-friendly
- ✅ **Parsing Otomatis** - Ekstraksi teks, pertanyaan, dan pilihan jawaban
- ✅ **Deteksi Tipe Soal** - Otomatis mengenali jenis soal
- ✅ **Kunci Jawaban** - Ekstraksi jawaban benar dan pembahasan
- ✅ **Download JSON** - Langsung download hasil konversi
- ✅ **UTF-8 Support** - Mendukung karakter bahasa Indonesia

## 🎯 Tipe Soal yang Terdeteksi

| Tipe | Keywords |
|------|----------|
| **Penalaran Umum** | korelasi, simpulan, kesimpulan, benar, salah, memperlemah, menguatkan |
| **Penalaran Matematika** | deret, pola, angka, bilangan, persentase, keuntungan |
| **Literasi Bahasa Indonesia** | kata, makna, sinonim, antonim, kalimat |

## 📁 Struktur File

```
.
├── converter.py           # Script konversi CLI
├── converter_web.py       # Web server Flask
├── templates/
│   └── index.html        # UI web interface
├── requirements.txt       # Dependencies Python
├── README.md             # Dokumentasi
├── soal_raw.txt          # Input soal (contoh)
├── kunci_jawaban.txt     # Input kunci (contoh)
└── soal_output.json      # Output hasil konversi
```

## 🔧 Requirements

- Python 3.6+
- Flask 3.0.0

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Error encoding | Pastikan file menggunakan UTF-8 |
| Format tidak sesuai | Cek pattern soal dan kunci jawaban |
| Flask tidak ditemukan | Jalankan `pip install -r requirements.txt` |
| Port 5000 sudah digunakan | Edit `converter_web.py` dan ubah port |

## 💡 Tips

1. Gunakan web interface untuk konversi yang lebih cepat
2. Klik "Load Contoh" untuk melihat format yang benar
3. Pastikan nomor soal berurutan (Soal 1, Soal 2, dst)
4. Pisahkan setiap pilihan jawaban dengan baris baru
5. Gunakan format "1. X (Jawaban)" untuk kunci jawaban

## 📝 Contoh Format Input

### Soal Raw
```
Soal 1
Teks
Tubuh memanfaatkan lemak sebagai sumber energi.

Manakah pernyataan yang benar?

A Lemak tidak diperlukan tubuh.
B Lemak adalah sumber energi.
C Lemak selalu berbahaya.
D Lemak tidak mengandung kalori.
E Lemak hanya untuk diet.
```

### Kunci Jawaban
```
KUNCI JAWABAN
1. B (Lemak adalah sumber energi)
Teks menyebutkan bahwa tubuh memanfaatkan lemak sebagai sumber daya/energi.
```

## 🎉 Screenshot

Web interface menyediakan:
- 📝 Text area untuk paste soal
- 🔑 Text area untuk kunci jawaban
- ✨ Tombol konversi dengan loading indicator
- 📊 Preview hasil JSON
- ⬇️ Tombol download file JSON
- 🗑️ Tombol clear untuk reset

## 📞 Support

Jika ada pertanyaan atau menemukan bug, silakan buat issue atau hubungi developer.
