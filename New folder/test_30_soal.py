#!/usr/bin/env python3
"""
Test script untuk validasi 30 soal
"""

from converter_v2 import SmartSoalParser
import json

# Sample dengan 3 soal berbeda format untuk test
TEST_SOAL = """Soal 1
Teks
Tubuh memang memanfaatkan lemak sebagai sumber daya.

Berdasarkan uraian di atas, manakah korelasi yang PASTI BENAR?

A Asupan lemak melimpah
B Melonjaknya berat badan
C Penumpukan kalori dari lemak
D Rasa lemas di siang hari
E Memakan lemak dalam takaran pas

Soal 29
3, 5, 9, 15, 16, 19, 24, 26, 30, 36, …

Manakah angka yang tepat untuk melanjutkan deret tersebut?

A 37
B 38
C 39
D 40
E 41

Soal 30
3, 6, 9, 15, 24, 39, …, 102, 165

Angka berapa yang memenuhi bagian kosong pada deret tersebut?

A 63
B 75
C 81
D 92
E 100
"""

TEST_KUNCI = """
1. C (Penumpukan kalori dari lemak)
Test pembahasan.

29. A (37)
Pola selisih.

30. A (63)
Deret Fibonacci.
"""

def test_parser():
    print("=" * 60)
    print("🧪 Testing Smart Parser V2.1")
    print("=" * 60)
    
    parser = SmartSoalParser()
    parser.debug = True
    
    print("\n📝 Parsing test data...")
    hasil = parser.parse(TEST_SOAL, TEST_KUNCI)
    
    print(f"\n✅ Hasil: {len(hasil)} soal terdeteksi")
    print("=" * 60)
    
    for soal in hasil:
        print(f"\nSoal {soal['nomor']}:")
        print(f"  Text: {soal['text'][:50]}..." if len(soal['text']) > 50 else f"  Text: {soal['text']}")
        print(f"  Question: {soal['question'][:50]}..." if len(soal['question']) > 50 else f"  Question: {soal['question']}")
        print(f"  Options: {soal['option_a'][:30]}...")
        print(f"  Answer: {soal['correct_answer']}")
        print(f"  Type: {soal['subtest']}")
        
        # Validation
        valid = all([
            soal['text'],
            soal['question'],
            soal['option_a'],
            soal['option_e'],
            soal['correct_answer']
        ])
        print(f"  Status: {'✅ VALID' if valid else '❌ INVALID'}")
    
    print("\n" + "=" * 60)
    print(f"📊 Summary: {len(hasil)}/3 soal berhasil di-parse")
    print("=" * 60)
    
    return len(hasil) == 3

if __name__ == "__main__":
    success = test_parser()
    
    if success:
        print("\n✅ Test PASSED! Parser siap untuk 30 soal lengkap.")
    else:
        print("\n❌ Test FAILED! Ada masalah dengan parser.")
