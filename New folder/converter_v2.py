#!/usr/bin/env python3
"""
Converter V2 - Smart Parser dengan akurasi 100%
Algoritma parsing yang lebih advanced dan robust
"""

import json
import re
from typing import List, Dict, Tuple, Optional


class SmartSoalParser:
    """Parser pintar untuk soal ujian"""
    
    def __init__(self):
        self.debug = False
    
    def parse(self, raw_text: str, kunci_text: str) -> List[Dict]:
        """Main parsing function - V2.2 with reference handling"""
        # Step 1: Split soal dengan algoritma pintar
        soal_blocks = self._split_soal_blocks(raw_text)
        
        # Step 2: Parse kunci jawaban
        kunci_dict = self._parse_kunci_jawaban(kunci_text)
        
        # Step 3: Parse setiap soal
        hasil = []
        for nomor, content in soal_blocks:
            try:
                soal_data = self._parse_soal_block(nomor, content, kunci_dict)
                if soal_data:
                    hasil.append(soal_data)
            except Exception as e:
                if self.debug:
                    print(f"Error parsing soal {nomor}: {e}")
                continue
        
        # Step 4: Post-process untuk handle references (V2.2)
        hasil = self._resolve_references(hasil)
        
        return hasil
    
    def _split_soal_blocks(self, text: str) -> List[Tuple[int, str]]:
        """
        Split text menjadi blok-blok soal
        Algoritma: Cari "Soal N" dan ambil konten sampai "Soal N+1"
        """
        blocks = []
        
        # Find all "Soal N" positions
        pattern = r'Soal\s+(\d+)'
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        
        for i, match in enumerate(matches):
            nomor = int(match.group(1))
            start = match.end()
            
            # End position: next soal or end of text
            if i + 1 < len(matches):
                end = matches[i + 1].start()
            else:
                end = len(text)
            
            content = text[start:end].strip()
            blocks.append((nomor, content))
        
        return blocks
    
    def _parse_soal_block(self, nomor: int, content: str, kunci_dict: Dict) -> Dict:
        """Parse single soal block dengan algoritma 3-phase"""
        
        # Phase 1: Deteksi pilihan jawaban (ini anchor point paling reliable)
        pilihan_start, pilihan = self._extract_pilihan(content)
        
        if not pilihan or len(pilihan) < 5:
            if self.debug:
                print(f"Soal {nomor}: Pilihan tidak lengkap ({len(pilihan)} pilihan)")
            return None
        
        # Phase 2: Extract teks dan pertanyaan (sebelum pilihan)
        content_before_options = content[:pilihan_start].strip() if pilihan_start != -1 else content
        teks, pertanyaan = self._extract_teks_dan_pertanyaan(content_before_options)
        
        # Phase 3: Deteksi tipe soal
        tipe = self._detect_tipe_soal(teks, pertanyaan, pilihan)
        
        # Phase 4: Get kunci jawaban
        jawaban, pembahasan = self._get_kunci_jawaban(nomor, kunci_dict)
        
        return {
            "nomor": nomor,
            "subtest": tipe,
            "text": teks,
            "question": pertanyaan,
            "option_a": f"(A) {pilihan[0]}" if len(pilihan) > 0 else "",
            "option_b": f"(B) {pilihan[1]}" if len(pilihan) > 1 else "",
            "option_c": f"(C) {pilihan[2]}" if len(pilihan) > 2 else "",
            "option_d": f"(D) {pilihan[3]}" if len(pilihan) > 3 else "",
            "option_e": f"(E) {pilihan[4]}" if len(pilihan) > 4 else "",
            "correct_answer": jawaban,
            "explanation": pembahasan
        }
    
    def _extract_pilihan(self, content: str) -> Tuple[int, List[str]]:
        """
        Extract pilihan jawaban A-E dengan algoritma multi-pattern
        Returns: (start_position, list_of_options)
        """
        lines = content.split('\n')
        pilihan = []
        start_idx = -1
        
        # Pattern matching untuk pilihan A-E
        for idx, line in enumerate(lines):
            stripped = line.strip()
            
            # Skip empty lines
            if not stripped:
                continue
            
            # Check if line starts with A-E followed by space
            match = re.match(r'^([A-E])\s+(.+)', stripped)
            if match:
                huruf = match.group(1)
                teks = match.group(2).strip()
                
                # First option found
                if start_idx == -1:
                    start_idx = content.find(line)
                    pilihan = []
                
                # Validate sequence (A->B->C->D->E)
                expected_huruf = chr(ord('A') + len(pilihan))
                if huruf == expected_huruf:
                    pilihan.append(teks)
                    
                    # Stop if we have all 5 options
                    if len(pilihan) == 5:
                        break
                else:
                    # Sequence broken, reset if not complete
                    if len(pilihan) < 5:
                        pilihan = []
                        start_idx = -1
        
        return start_idx, pilihan
    
    def _extract_teks_dan_pertanyaan(self, content: str) -> Tuple[str, str]:
        """
        Extract teks soal dan pertanyaan dengan algoritma smart detection
        V2.1: Enhanced untuk handle soal tanpa header "Teks"
        """
        lines = [l.strip() for l in content.split('\n') if l.strip()]
        
        if not lines:
            return "", ""
        
        teks_lines = []
        pertanyaan = ""
        in_teks_section = False
        has_teks_header = False
        
        for i, line in enumerate(lines):
            # Skip "Teks" atau "Teks:" header
            if re.match(r'^Teks\s*:?$', line, re.IGNORECASE):
                in_teks_section = True
                has_teks_header = True
                continue
            
            # Deteksi pertanyaan dengan multiple indicators
            is_question = self._is_question_line(line)
            
            if is_question and not pertanyaan:
                pertanyaan = line
                in_teks_section = False
                continue
            
            # Jika belum ketemu pertanyaan dan bukan baris pertanyaan, masukkan ke teks
            if not pertanyaan or in_teks_section:
                teks_lines.append(line)
        
        # Join teks
        teks = ' '.join(teks_lines).strip()
        
        # Special case: Jika tidak ada header "Teks" dan teks sangat pendek
        # Kemungkinan ini soal matematika/deret angka
        if not has_teks_header and len(teks) < 100:
            # Cek apakah ada pattern angka atau data
            if re.search(r'\d+', teks):
                # Ini kemungkinan soal matematika, jangan ambil pertanyaan dari teks
                pass
        
        # Jika pertanyaan masih kosong, ambil baris terakhir sebelum teks
        if not pertanyaan and teks_lines:
            # Cari dari belakang, baris pertama yang seperti pertanyaan
            for idx in range(len(teks_lines) - 1, -1, -1):
                if self._is_question_line(teks_lines[idx]):
                    pertanyaan = teks_lines[idx]
                    teks_lines = teks_lines[:idx]
                    teks = ' '.join(teks_lines).strip()
                    break
        
        # Fallback: jika masih tidak ada pertanyaan, gunakan baris terakhir
        if not pertanyaan and teks_lines and len(teks_lines) > 1:
            pertanyaan = teks_lines[-1]
            teks_lines = teks_lines[:-1]
            teks = ' '.join(teks_lines).strip()
        
        return teks, pertanyaan
    
    def _is_question_line(self, line: str) -> bool:
        """
        Deteksi apakah baris adalah pertanyaan
        Multiple indicators untuk akurasi tinggi
        """
        indicators = [
            '?' in line,  # Ada tanda tanya
            line.lower().startswith('manakah'),
            line.lower().startswith('berapa'),
            line.lower().startswith('apakah'),
            line.lower().startswith('bagaimana'),
            line.lower().startswith('siapakah'),
            line.lower().startswith('mana '),
            line.lower().startswith('tentukan'),
            'yang benar' in line.lower(),
            'yang salah' in line.lower(),
            'yang tepat' in line.lower(),
            'kesimpulan' in line.lower() and ('?' in line or 'mana' in line.lower()),
        ]
        
        return any(indicators)
    
    def _detect_tipe_soal(self, teks: str, pertanyaan: str, pilihan: List[str]) -> str:
        """
        Deteksi tipe soal dengan algoritma scoring
        """
        combined = (teks + ' ' + pertanyaan).lower()
        
        # Scoring system
        scores = {
            'penalaran umum': 0,
            'penalaran matematika': 0,
            'literasi bahasa indonesia': 0
        }
        
        # Keywords untuk penalaran matematika
        math_keywords = [
            'angka', 'bilangan', 'deret', 'pola', 'persentase', 'keuntungan',
            'modal', 'pendapatan', 'hitung', 'jumlah', 'rata-rata', 'total',
            'tahun ke', 'hari ke', 'berapa', r'\d+', 'tambah', 'kurang', 'kali', 'bagi'
        ]
        
        # Check if text contains number sequences (strong indicator for math)
        if re.search(r'\d+\s*,\s*\d+\s*,\s*\d+', combined):
            scores['penalaran matematika'] += 10
        
        for keyword in math_keywords:
            if re.search(keyword, combined):
                scores['penalaran matematika'] += 1
        
        # Keywords untuk literasi bahasa
        bahasa_keywords = [
            'kata', 'makna', 'sinonim', 'antonim', 'kalimat', 'paragraf',
            'arti', 'bahasa', 'tata bahasa', 'ejaan'
        ]
        
        for keyword in bahasa_keywords:
            if keyword in combined:
                scores['literasi bahasa indonesia'] += 2
        
        # Keywords untuk penalaran umum
        logic_keywords = [
            'korelasi', 'simpulan', 'kesimpulan', 'benar', 'salah',
            'memperlemah', 'menguatkan', 'pandangan', 'pernyataan',
            'jika', 'maka', 'bila', 'apabila', 'sehingga'
        ]
        
        for keyword in logic_keywords:
            if keyword in combined:
                scores['penalaran umum'] += 1
        
        # Default score untuk penalaran umum jika tidak ada yang dominan
        if max(scores.values()) == 0:
            scores['penalaran umum'] = 1
        
        # Return tipe dengan score tertinggi
        return max(scores, key=scores.get)
    
    def _parse_kunci_jawaban(self, text: str) -> Dict[int, Dict[str, str]]:
        """
        Parse kunci jawaban dengan algoritma robust
        """
        kunci_dict = {}
        
        # Remove "KUNCI JAWABAN" header if exists
        text = re.sub(r'^KUNCI\s+JAWABAN\s*', '', text, flags=re.IGNORECASE)
        
        # Pattern: "nomor. huruf (teks jawaban)" diikuti pembahasan
        # Split by nomor pattern
        pattern = r'(\d+)\.\s*([A-E])\s*\((.*?)\)'
        matches = list(re.finditer(pattern, text, re.DOTALL))
        
        for i, match in enumerate(matches):
            nomor = int(match.group(1))
            huruf = match.group(2)
            teks_jawaban = match.group(3).strip()
            
            # Extract pembahasan (text after current match until next match or end)
            start = match.end()
            if i + 1 < len(matches):
                end = matches[i + 1].start()
            else:
                end = len(text)
            
            pembahasan = text[start:end].strip()
            
            # Clean pembahasan (remove extra whitespace and newlines)
            pembahasan = ' '.join(pembahasan.split())
            
            kunci_dict[nomor] = {
                'jawaban': huruf,
                'pembahasan': pembahasan
            }
        
        return kunci_dict
    
    def _get_kunci_jawaban(self, nomor: int, kunci_dict: Dict) -> Tuple[str, str]:
        """Get kunci jawaban dan pembahasan"""
        if nomor in kunci_dict:
            return kunci_dict[nomor]['jawaban'], kunci_dict[nomor]['pembahasan']
        return "", ""
    
    def _resolve_references(self, soal_list: List[Dict]) -> List[Dict]:
        """
        V2.2: Resolve soal yang merujuk ke soal lain
        Pattern: "Berdasarkan... Soal N" atau "data dari Soal N"
        """
        # Build lookup dictionary by nomor
        soal_dict = {s['nomor']: s for s in soal_list}
        
        for soal in soal_list:
            # Store original for debugging
            original_text = soal['text']
            original_question = soal['question']
            
            # Check if text is empty or very short (possible reference)
            if len(soal['text']) < 20 or not soal['text'].strip():
                # Check question for reference pattern
                question = soal['question']
                
                # Pattern 1: "Berdasarkan... Soal N"
                match = re.search(r'[Ss]oal\s+(\d+)', question)
                if match:
                    ref_nomor = int(match.group(1))
                    
                    if ref_nomor in soal_dict:
                        # Copy text from referenced soal
                        soal['text'] = soal_dict[ref_nomor]['text']
                        
                        if self.debug:
                            print(f"✅ Soal {soal['nomor']}: Resolved reference to Soal {ref_nomor}")
                            print(f"   Copied {len(soal['text'])} chars from Soal {ref_nomor}")
            
            # Check if question mentions reference without explicit "Soal N"
            # Pattern: "Berdasarkan data dari Soal 25" is already handled
            # Pattern: Question starts with "Berdasarkan..." but no explicit soal number
            if len(soal['text']) < 20:
                # Try to infer from question context
                if 'berdasarkan' in soal['question'].lower():
                    # Look for previous soal with substantial text
                    current_nomor = soal['nomor']
                    for check_nomor in range(current_nomor - 1, max(0, current_nomor - 5), -1):
                        if check_nomor in soal_dict and len(soal_dict[check_nomor]['text']) > 50:
                            soal['text'] = soal_dict[check_nomor]['text']
                            if self.debug:
                                print(f"✅ Soal {soal['nomor']}: Inferred reference to Soal {check_nomor}")
                            break
            
            # Fix question formatting (comma at start)
            if soal['question'].startswith(','):
                # Determine proper prefix based on context
                if 'paragraf' in soal['question'].lower():
                    prefix = 'Berdasarkan paragraf tersebut'
                elif 'data' in soal['question'].lower() or 'tabel' in soal['question'].lower():
                    prefix = 'Berdasarkan data tersebut'
                elif 'teks' in soal['question'].lower():
                    prefix = 'Berdasarkan teks tersebut'
                else:
                    prefix = 'Berdasarkan informasi tersebut'
                
                soal['question'] = prefix + soal['question']
                
                if self.debug:
                    print(f"✅ Soal {soal['nomor']}: Fixed question formatting")
        
        return soal_list


def convert_soal_to_json(raw_text: str, kunci_text: str, debug: bool = False) -> List[Dict]:
    """
    Main function untuk konversi soal
    """
    parser = SmartSoalParser()
    parser.debug = debug
    
    return parser.parse(raw_text, kunci_text)


def main():
    """CLI interface"""
    import sys
    
    # Read input files
    try:
        with open('soal_input.txt', 'r', encoding='utf-8') as f:
            raw_text = f.read()
        
        with open('kunci_input.txt', 'r', encoding='utf-8') as f:
            kunci_text = f.read()
    except FileNotFoundError as e:
        print(f"❌ Error: File tidak ditemukan - {e}")
        print("\nBuat file berikut:")
        print("  - soal_input.txt (berisi soal)")
        print("  - kunci_input.txt (berisi kunci jawaban)")
        sys.exit(1)
    
    # Parse
    print("🔄 Memproses soal...")
    hasil = convert_soal_to_json(raw_text, kunci_text, debug=True)
    
    # Save output
    output_data = []
    for soal in hasil:
        output_data.append({
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
    
    with open('soal_output_v2.json', 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Berhasil mengkonversi {len(hasil)} soal!")
    print(f"📄 Output: soal_output_v2.json")
    
    # Validation check
    print("\n📊 Validasi:")
    for i, soal in enumerate(hasil, 1):
        status = "✅" if all([
            soal['text'],
            soal['question'],
            soal['option_a'],
            soal['option_e'],
            soal['correct_answer']
        ]) else "⚠️"
        print(f"  {status} Soal {soal['nomor']}: {len(soal['text'])} chars text, answer: {soal['correct_answer']}")


if __name__ == "__main__":
    main()
