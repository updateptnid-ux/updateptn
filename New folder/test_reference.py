#!/usr/bin/env python3
"""
Test reference handling
"""

from converter_v2 import SmartSoalParser
import json

TEST_SOAL = """Soal 16
Teks:
Riset mengenai dinamika iklim menunjukkan bagaimana perubahan fisik dan biologis Bumi memengaruhi ketahanan pangan.

Berdasarkan paragraf pertama, manakah klaim yang TIDAK SESUAI?

A Perubahan iklim mengubah dinamika pangan
B Peningkatan CO2 berimbas pada hasil panen
C Wilayah tropis memiliki output tinggi
D Produksi tidak berubah tanpa perubahan iklim
E Curah hujan berakibat pada produksi

Soal 17
Berdasarkan isi paragraf kedua dari teks pada Soal 16, manakah pernyataan yang BENAR?

A Bila populasi hama tidak meningkat
B Bila populasi tidak bertambah
C Tanpa perubahan iklim
D Luas wilayah hama meluas
E Populasi hama meningkat

Soal 25
Data Kelulusan:
Kelas A: Lulus 15, Total 20

Kelas manakah yang mencatatkan rasio kelulusan paling tinggi?

A Kelas A
B Kelas B
C Kelas C
D Kelas D
E Kelas E

Soal 26
Berdasarkan data dari Soal 25, kelas manakah yang dihuni siswa paling banyak?

A Kelas A
B Kelas B
C Kelas C
D Kelas D
E Kelas E
"""

TEST_KUNCI = """
16. D (Produksi)
Pembahasan 16.

17. C (Tanpa perubahan)
Pembahasan 17.

25. A (Kelas A)
Pembahasan 25.

26. D (Kelas D)
Pembahasan 26.
"""

def test_reference_resolution():
    print("=" * 70)
    print("🧪 Testing Reference Resolution V2.2")
    print("=" * 70)
    
    parser = SmartSoalParser()
    parser.debug = True
    
    print("\n📝 Parsing test data with references...")
    hasil = parser.parse(TEST_SOAL, TEST_KUNCI)
    
    print(f"\n{'=' * 70}")
    print(f"✅ Hasil: {len(hasil)} soal terdeteksi")
    print("=" * 70)
    
    # Check specific soals
    for soal in hasil:
        print(f"\n{'=' * 70}")
        print(f"Soal {soal['nomor']}:")
        print(f"  Text length: {len(soal['text'])} chars")
        print(f"  Text preview: {soal['text'][:60]}..." if soal['text'] else "  Text: EMPTY ❌")
        print(f"  Question: {soal['question'][:70]}...")
        print(f"  Answer: {soal['correct_answer']}")
        
        # Validation
        has_text = len(soal['text']) > 10
        has_question = len(soal['question']) > 5
        no_comma_start = not soal['question'].startswith(',')
        
        print(f"  Validation:")
        print(f"    - Has text (>10 chars): {'✅' if has_text else '❌'}")
        print(f"    - Has question (>5 chars): {'✅' if has_question else '❌'}")
        print(f"    - Question formatted: {'✅' if no_comma_start else '❌'}")
        
        valid = has_text and has_question and no_comma_start
        print(f"  Status: {'✅ VALID' if valid else '❌ NEEDS FIX'}")
    
    print(f"\n{'=' * 70}")
    
    # Summary
    all_valid = all(
        len(s['text']) > 10 and 
        len(s['question']) > 5 and 
        not s['question'].startswith(',')
        for s in hasil
    )
    
    print(f"\n📊 Summary:")
    print(f"  Total soal: {len(hasil)}")
    print(f"  All valid: {'✅ YES' if all_valid else '❌ NO'}")
    print("=" * 70)
    
    return all_valid

if __name__ == "__main__":
    success = test_reference_resolution()
    
    if success:
        print("\n✅ Test PASSED! Reference resolution working perfectly!")
    else:
        print("\n❌ Test FAILED! Some issues remain.")
