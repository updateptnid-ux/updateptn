# 📖 Panduan Lengkap Penggunaan Tool Konversi Soal

## 🎯 Tujuan Tool

Tool ini dibuat untuk mengkonversi soal-soal ujian dalam format text mentah (raw text) menjadi format JSON yang terstruktur, sehingga mudah digunakan untuk:
- Aplikasi CBT (Computer Based Test)
- Bank soal digital
- Website ujian online
- Analisis data soal

## 🚀 Cara Penggunaan Web Interface

### Langkah 1: Jalankan Server

```bash
python converter_web.py
```

Tunggu hingga muncul:
```
🚀 Server berjalan di http://localhost:5000
```

### Langkah 2: Buka Browser

Buka browser (Chrome, Firefox, Edge) dan akses:
```
http://localhost:5000
```

### Langkah 3: Input Data

#### A. Raw Text Soal

Paste atau ketik soal Anda dengan format:

```
Soal 1
Teks
[Isi teks/bacaan soal]

[Pertanyaan/instruksi soal]

A [Pilihan jawaban A]
B [Pilihan jawaban B]
C [Pilihan jawaban C]
D [Pilihan jawaban D]
E [Pilihan jawaban E]

Soal 2
Teks:
[Isi teks soal berikutnya]
...
```

**Penting:**
- Setiap soal diawali dengan "Soal N" (N = nomor soal)
- Teks soal bisa diawali dengan "Teks", "Teks:", atau langsung isi teks
- Pilihan jawaban diawali dengan huruf A, B, C, D, E diikuti spasi
- Pisahkan antar soal dengan baris kosong

#### B. Kunci Jawaban & Pembahasan

Paste atau ketik kunci jawaban dengan format:

```
KUNCI JAWABAN
1. C (Teks pilihan jawaban yang benar)
Pembahasan/penjelasan mengapa jawaban ini benar.

2. B (Teks pilihan jawaban yang benar)
Pembahasan/penjelasan mengapa jawaban ini benar.

3. A (Teks pilihan jawaban yang benar)
Pembahasan/penjelasan.
```

**Penting:**
- Diawali dengan "KUNCI JAWABAN" (opsional)
- Format: `Nomor. Huruf (Teks jawaban)`
- Pembahasan di baris berikutnya
- Pisahkan tiap kunci jawaban dengan baris kosong

### Langkah 4: Konversi

1. Klik tombol **"✨ Konversi ke JSON"**
2. Tunggu proses (biasanya beberapa detik)
3. Hasil akan muncul di bagian bawah

### Langkah 5: Download

Klik tombol **"⬇️ Download JSON"** untuk menyimpan file hasil konversi.

File akan tersimpan dengan nama: `soal_[timestamp].json`

## 🎨 Fitur-Fitur Web Interface

### 1. Load Contoh
Klik tombol "Load Contoh" untuk melihat format input yang benar.

### 2. Clear/Hapus
Klik tombol "🗑️ Hapus Semua" untuk menghapus semua input.

### 3. Preview JSON
Hasil konversi ditampilkan langsung di browser dengan:
- Syntax highlighting
- Jumlah soal yang berhasil dikonversi
- Format JSON yang rapi

### 4. Alert Notifikasi
- ✅ Hijau: Konversi berhasil
- ❌ Merah: Ada error/kesalahan

## 📝 Contoh Lengkap

### Input Soal Raw:

```
Soal 1
Teks
Tubuh memang memanfaatkan lemak sebagai sumber daya, tetapi mengonsumsi hidangan kaya lemak berpotensi memicu rasa lemas di siang hari. Masukan lemak berlebih memicu surplus kalori yang berujung pada kenaikan bobot tubuh. Kondisi berat badan yang melonjak ini kemudian menyulitkan seseorang untuk beraktivitas secara aktif.

Berdasarkan uraian di atas, manakah korelasi yang PASTI BENAR?

A Asupan lemak melimpah sanggup memicu lonjakan stamina pada siang hari.
B Melonjaknya berat badan akibat lemak memberikan dampak positif bagi kesehatan.
C Penumpukan kalori dari lemak berisiko menghambat kelincahan pergerakan tubuh.
D Rasa lemas di siang hari selalu dipicu oleh konsumsi lemak yang tinggi.
E Memakan lemak dalam takaran pas akan membatasi kelincahan gerak tubuh.

Soal 2
Teks:
3, 5, 9, 15, 16, 19, 24, 26, 30, 36, …

Manakah angka yang tepat untuk melanjutkan deret tersebut?

A 37
B 38
C 39
D 40
E 41
```

### Input Kunci Jawaban:

```
KUNCI JAWABAN
1. C (Penumpukan kalori dari lemak berisiko menghambat kelincahan pergerakan tubuh)
Teks menjelaskan bahwa surplus kalori dari lemak memicu kenaikan berat badan yang kemudian menyulitkan seseorang beraktivitas aktif, sehingga berisiko menghambat kelincahan tubuh.

2. A (37)
Pola selisih antar angka adalah tambah 2, tambah 4, tambah 6, tambah 1, tambah 3, tambah 5, dan berulang. Setelah tambah 6 pada angka 30 menjadi 36, selanjutnya adalah tambah 1 sehingga hasilnya 37.
```

### Output JSON:

```json
[
  {
    "subtest": "penalaran umum",
    "text": "Tubuh memang memanfaatkan lemak sebagai sumber daya...",
    "question": "Berdasarkan uraian di atas, manakah korelasi yang PASTI BENAR?",
    "option_a": "(A) Asupan lemak melimpah sanggup memicu lonjakan stamina pada siang hari.",
    "option_b": "(B) Melonjaknya berat badan akibat lemak memberikan dampak positif bagi kesehatan.",
    "option_c": "(C) Penumpukan kalori dari lemak berisiko menghambat kelincahan pergerakan tubuh.",
    "option_d": "(D) Rasa lemas di siang hari selalu dipicu oleh konsumsi lemak yang tinggi.",
    "option_e": "(E) Memakan lemak dalam takaran pas akan membatasi kelincahan gerak tubuh.",
    "correct_answer": "C",
    "explanation": "Teks menjelaskan bahwa surplus kalori dari lemak memicu kenaikan berat badan yang kemudian menyulitkan seseorang beraktivitas aktif, sehingga berisiko menghambat kelincahan tubuh."
  },
  {
    "subtest": "penalaran matematika",
    "text": "3, 5, 9, 15, 16, 19, 24, 26, 30, 36, …",
    "question": "Manakah angka yang tepat untuk melanjutkan deret tersebut?",
    "option_a": "(A) 37",
    "option_b": "(B) 38",
    "option_c": "(C) 39",
    "option_d": "(D) 40",
    "option_e": "(E) 41",
    "correct_answer": "A",
    "explanation": "Pola selisih antar angka adalah tambah 2, tambah 4, tambah 6, tambah 1, tambah 3, tambah 5, dan berulang. Setelah tambah 6 pada angka 30 menjadi 36, selanjutnya adalah tambah 1 sehingga hasilnya 37."
  }
]
```

## 🔧 Troubleshooting

### Error: "Harap isi kedua field"
**Solusi:** Pastikan Anda sudah mengisi kedua textarea (soal dan kunci jawaban).

### Error: Hasil tidak sesuai harapan
**Solusi:** 
1. Periksa format input (lihat contoh di atas)
2. Pastikan nomor soal berurutan (1, 2, 3, ...)
3. Pastikan setiap pilihan diawali huruf A-E
4. Pastikan kunci jawaban menggunakan format: `1. C (Teks)`

### Error: Server tidak bisa diakses
**Solusi:**
1. Pastikan Flask sudah terinstall: `pip install Flask`
2. Cek apakah server sudah running
3. Pastikan tidak ada program lain yang menggunakan port 5000
4. Coba akses: `http://127.0.0.1:5000` atau `http://localhost:5000`

### Error: Port 5000 sudah digunakan
**Solusi:** Edit file `converter_web.py`, ubah baris terakhir:
```python
app.run(debug=True, port=5001)  # Ganti 5000 ke 5001
```

### Format soal berbeda
**Solusi:** Tool ini cukup fleksibel. Jika format Anda sedikit berbeda:
- "Teks" bisa jadi "Teks:", "Text", atau bahkan dihilangkan
- Spasi ekstra atau baris kosong tidak masalah
- Nomor soal bisa "Soal 1", "SOAL 1", "soal 1"

## 💡 Tips & Trik

1. **Copy-Paste dari Word/PDF**
   - Paste langsung ke textarea
   - Tool akan otomatis membersihkan format

2. **Soal Banyak**
   - Tool bisa menangani ratusan soal sekaligus
   - Semakin banyak soal, semakin lama prosesnya (wajar)

3. **Cek Preview**
   - Selalu cek preview JSON sebelum download
   - Pastikan jumlah soal sudah sesuai

4. **Backup Data**
   - Simpan raw text di file terpisah
   - Download JSON hasil konversi

5. **Edit Manual**
   - Jika ada yang salah, bisa edit JSON manual di text editor
   - Atau edit raw text dan konversi ulang

## 🎓 Jenis Soal yang Didukung

Tool otomatis mendeteksi jenis soal:

| Jenis | Contoh Keyword | Subtest yang Ditetapkan |
|-------|---------------|-------------------------|
| Logika | korelasi, simpulan, kesimpulan, memperlemah, menguatkan | penalaran umum |
| Matematika | deret, pola, persentase, angka, bilangan | penalaran matematika |
| Bahasa | kata, makna, sinonim, antonim | literasi bahasa indonesia |
| Default | - | penalaran umum |

Jika ingin mengubah jenis soal secara manual, edit field `"subtest"` di JSON hasil.

## 📞 Bantuan Lebih Lanjut

Jika masih ada kesulitan:
1. Baca README.md untuk dokumentasi teknis
2. Periksa contoh file `soal_raw.txt` dan `kunci_jawaban.txt`
3. Coba gunakan fitur "Load Contoh" di web interface

---

**Selamat menggunakan! 🎉**
