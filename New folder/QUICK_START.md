# ⚡ Quick Start - 5 Menit Langsung Jalan!

## 🚀 Langkah Super Cepat

### 1️⃣ Install Flask (Sekali Aja)
```bash
pip install Flask
```

### 2️⃣ Jalankan Server
```bash
python converter_web.py
```

### 3️⃣ Buka Browser
```
http://localhost:5000
```

### 4️⃣ Paste Data
- **Kiri**: Paste soal raw text
- **Kanan**: Paste kunci jawaban

### 5️⃣ Konversi & Download
- Klik **"Konversi ke JSON"**
- Klik **"Download JSON"**

## ✅ Selesai!

---

## 📝 Format Input (Copy-Paste Template)

### Template Soal:
```
Soal 1
Teks
[Paste teks soal di sini]

[Paste pertanyaan di sini]

A [Pilihan A]
B [Pilihan B]
C [Pilihan C]
D [Pilihan D]
E [Pilihan E]

Soal 2
...
```

### Template Kunci:
```
KUNCI JAWABAN
1. C (Jawaban yang benar)
Penjelasan kenapa jawaban ini benar.

2. A (Jawaban yang benar)
Penjelasan.
```

---

## 🎯 Contoh Cepat

### Input Soal:
```
Soal 1
Teks
2 + 2 = ?

Berapakah hasil penjumlahan di atas?

A 2
B 3
C 4
D 5
E 6
```

### Input Kunci:
```
1. C (4)
2 ditambah 2 sama dengan 4.
```

### Output JSON:
```json
[{
  "subtest": "penalaran matematika",
  "text": "2 + 2 = ?",
  "question": "Berapakah hasil penjumlahan di atas?",
  "option_a": "(A) 2",
  "option_b": "(B) 3",
  "option_c": "(C) 4",
  "option_d": "(D) 5",
  "option_e": "(E) 6",
  "correct_answer": "C",
  "explanation": "2 ditambah 2 sama dengan 4."
}]
```

---

## ❓ Troubleshooting Cepat

| Problem | Fix |
|---------|-----|
| Flask error | `pip install Flask` |
| Port 5000 used | Edit `converter_web.py` ganti port |
| Format salah | Klik "Load Contoh" di web |
| Error parsing | Cek format nomor soal (1, 2, 3) |

---

## 💡 Tips Kilat

✅ **DO:**
- Copy-paste langsung dari Word/PDF
- Gunakan tombol "Load Contoh"
- Preview sebelum download

❌ **DON'T:**
- Jangan hapus nomor soal
- Jangan skip pilihan A-E
- Jangan format kunci sembarangan

---

## 🎁 Bonus: Keyboard Shortcuts

- `Ctrl + A` - Select all text
- `Ctrl + C` - Copy
- `Ctrl + V` - Paste
- `Ctrl + S` - Download (saat fokus di result)

---

**Need more help?** 
- 📖 Baca [PANDUAN.md](PANDUAN.md) untuk guide lengkap
- 📚 Baca [README.md](README.md) untuk dokumentasi teknis
- 📊 Baca [SUMMARY.md](SUMMARY.md) untuk overview lengkap

**Happy Converting! 🎉**
