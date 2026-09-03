#!/usr/bin/env python3
"""
Script untuk mengkonversi soal raw text menjadi format JSON
"""

import json
import re


def parse_raw_soal(raw_text, kunci_jawaban_text):
    """
    Parse raw text soal menjadi struktur data
    """
    # Split berdasarkan "Soal N" dengan lookahead untuk memastikan diikuti line break
    soal_pattern = r'(?=Soal\s+\d+\s*\n)'
    soal_splits = re.split(soal_pattern, raw_text)
    
    # Buang elemen pertama yang kosong
    soal_splits = [s.strip() for s in soal_splits if s.strip()]
    
    # Parse kunci jawaban
    kunci_dict = parse_kunci_jawaban(kunci_jawaban_text)
    
    # Group menjadi pasangan (nomor, konten)
    soal_list = []
    for soal_text in soal_splits:
        # Extract nomor dari awal teks
        match = re.match(r'Soal\s+(\d+)', soal_text)
        if match:
            nomor = int(match.group(1))
            # Buang "Soal N" dari konten
            konten = soal_text[match.end():].strip()
            
            # Parse konten soal
            soal_data = parse_konten_soal(nomor, konten, kunci_dict)
            if soal_data:
                soal_list.append(soal_data)
    
    return soal_list


def parse_kunci_jawaban(kunci_text):
    """
    Parse kunci jawaban menjadi dictionary
    """
    kunci_dict = {}
    
    # Pattern untuk menangkap nomor, jawaban, dan pembahasan
    pattern = r'(\d+)\.\s+([A-E])\s+\((.*?)\)\s*(.*?)(?=\d+\.\s+[A-E]|\Z)'
    matches = re.findall(pattern, kunci_text, re.DOTALL)
    
    for match in matches:
        nomor = int(match[0])
        jawaban = match[1]
        pembahasan = match[3].strip()
        
        kunci_dict[nomor] = {
            'jawaban': jawaban,
            'pembahasan': pembahasan
        }
    
    return kunci_dict


def parse_konten_soal(nomor, konten, kunci_dict):
    """
    Parse konten soal individual
    """
    lines = konten.split('\n')
    
    # Cari pilihan jawaban terlebih dahulu untuk menentukan batas
    pilihan_start_idx = -1
    for idx, line in enumerate(lines):
        line_stripped = line.strip()
        # Hanya deteksi pilihan yang benar-benar di awal line (bukan bagian kalimat)
        if re.match(r'^[A-E]\s+[A-Z]', line_stripped) or re.match(r'^[A-E]\s+\d', line_stripped):
            pilihan_start_idx = idx
            break
    
    # Jika tidak menemukan pilihan dengan huruf/angka kapital, coba pattern lebih umum
    if pilihan_start_idx == -1:
        for idx, line in enumerate(lines):
            line_stripped = line.strip()
            if re.match(r'^[A-E]\s+.{3,}', line_stripped):
                # Pastikan minimal 5 pilihan berturut-turut
                consecutive_options = 0
                for check_idx in range(idx, min(idx + 5, len(lines))):
                    if re.match(r'^[A-E]\s+', lines[check_idx].strip()):
                        consecutive_options += 1
                if consecutive_options >= 3:  # Minimal 3 pilihan berturut-turut
                    pilihan_start_idx = idx
                    break
    
    # Parse teks dan pertanyaan (sebelum pilihan)
    teks_lines = []
    pertanyaan = ""
    
    content_before_options = lines[:pilihan_start_idx] if pilihan_start_idx != -1 else lines
    
    in_teks = False
    for idx, line in enumerate(content_before_options):
        line = line.strip()
        
        if not line:
            continue
        
        # Deteksi awal teks
        if line.lower().startswith('teks'):
            in_teks = True
            continue
        
        # Deteksi pertanyaan (biasanya dengan tanda tanya atau kata tanya)
        if '?' in line or any(kata in line.lower() for kata in ['manakah', 'berapa', 'apakah', 'bagaimana', 'siapakah', 'mana']):
            if not pertanyaan:  # Ambil pertanyaan pertama
                pertanyaan = line
                in_teks = False
            continue
        
        # Kumpulkan teks
        if in_teks or (not pertanyaan and idx < len(content_before_options) - 2):
            teks_lines.append(line)
    
    # Jika pertanyaan tidak ditemukan, ambil baris terakhir sebelum pilihan
    if not pertanyaan and pilihan_start_idx > 0:
        for i in range(pilihan_start_idx - 1, -1, -1):
            if lines[i].strip():
                pertanyaan = lines[i].strip()
                # Hapus dari teks_lines jika ada
                if pertanyaan in teks_lines:
                    teks_lines.remove(pertanyaan)
                break
    
    # Parse pilihan jawaban
    pilihan = []
    if pilihan_start_idx != -1:
        for line in lines[pilihan_start_idx:]:
            line = line.strip()
            match = re.match(r'^([A-E])\s+(.*)', line)
            if match:
                pilihan.append({
                    "kode": match.group(1),
                    "teks": match.group(2)
                })
                # Stop jika sudah dapat 5 pilihan
                if len(pilihan) >= 5:
                    break
    
    # Tentukan tipe soal berdasarkan konten
    tipe_soal = detect_tipe_soal(' '.join(teks_lines) + ' ' + pertanyaan)
    
    # Ambil kunci jawaban
    jawaban = ""
    pembahasan = ""
    if nomor in kunci_dict:
        jawaban = kunci_dict[nomor]['jawaban']
        pembahasan = kunci_dict[nomor]['pembahasan']
    
    return {
        "nomor": nomor,
        "subtest": tipe_soal,
        "text": ' '.join(teks_lines),
        "question": pertanyaan,
        "option_a": f"(A) {pilihan[0]['teks']}" if len(pilihan) > 0 else "",
        "option_b": f"(B) {pilihan[1]['teks']}" if len(pilihan) > 1 else "",
        "option_c": f"(C) {pilihan[2]['teks']}" if len(pilihan) > 2 else "",
        "option_d": f"(D) {pilihan[3]['teks']}" if len(pilihan) > 3 else "",
        "option_e": f"(E) {pilihan[4]['teks']}" if len(pilihan) > 4 else "",
        "correct_answer": jawaban,
        "explanation": pembahasan
    }


def detect_tipe_soal(text):
    """
    Deteksi tipe soal berdasarkan konten
    """
    text_lower = text.lower()
    
    if any(keyword in text_lower for keyword in ['korelasi', 'simpulan', 'kesimpulan', 'benar', 'salah', 'memperlemah', 'menguatkan']):
        return "penalaran umum"
    elif any(keyword in text_lower for keyword in ['deret', 'pola', 'angka', 'bilangan', 'persentase', 'keuntungan']):
        return "penalaran matematika"
    elif any(keyword in text_lower for keyword in ['kata', 'makna', 'sinonim', 'antonim', 'kalimat']):
        return "literasi bahasa indonesia"
    else:
        return "penalaran umum"


def main():
    """
    Fungsi utama
    """
    # Baca file raw soal
    with open('soal_raw.txt', 'r', encoding='utf-8') as f:
        raw_text = f.read()
    
    # Baca file kunci jawaban
    with open('kunci_jawaban.txt', 'r', encoding='utf-8') as f:
        kunci_text = f.read()
    
    # Parse soal
    soal_list = parse_raw_soal(raw_text, kunci_text)
    
    # Konversi ke JSON
    output = []
    for soal in soal_list:
        output.append({
            "subtest": soal["subtest"],
            "text": soal["text"],
            "question": soal["question"],
            "option_a": soal["option_a"],
            "option_b": soal["option_b"],
            "option_c": soal["option_c"],
            "option_d": soal["option_d"],
            "option_e": soal["option_e"],
            "correct_answer": soal["correct_answer"],
            "explanation": soal["explanation"]
        })
    
    # Simpan ke file JSON
    with open('soal_output.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Berhasil mengkonversi {len(output)} soal ke soal_output.json")
    
    # Tampilkan preview
    print("\n📋 Preview soal pertama:")
    print(json.dumps(output[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
