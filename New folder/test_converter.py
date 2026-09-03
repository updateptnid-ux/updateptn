#!/usr/bin/env python3
"""
Script untuk testing konverter
"""

import json
from converter import parse_raw_soal

# Test data
TEST_RAW = """Soal 1
Teks
Ini adalah teks soal pertama untuk testing.

Manakah jawaban yang benar?

A Pilihan A
B Pilihan B
C Pilihan C
D Pilihan D
E Pilihan E

Soal 2
Teks:
3, 6, 9, 12, ...

Berapa angka selanjutnya?

A 13
B 14
C 15
D 16
E 17"""

TEST_KUNCI = """KUNCI JAWABAN
1. C (Pilihan C)
Ini adalah pembahasan untuk soal 1.

2. C (15)
Polanya adalah kelipatan 3."""


def test_basic_conversion():
    """Test konversi dasar"""
    print("🧪 Testing basic conversion...")
    
    try:
        soal_list = parse_raw_soal(TEST_RAW, TEST_KUNCI)
        
        assert len(soal_list) == 2, f"Expected 2 soal, got {len(soal_list)}"
        assert soal_list[0]['correct_answer'] == 'C', "Soal 1 answer should be C"
        assert soal_list[1]['correct_answer'] == 'C', "Soal 2 answer should be C"
        
        print("✅ Basic conversion test PASSED")
        return True
    except Exception as e:
        print(f"❌ Basic conversion test FAILED: {e}")
        return False


def test_option_extraction():
    """Test ekstraksi pilihan jawaban"""
    print("\n🧪 Testing option extraction...")
    
    try:
        soal_list = parse_raw_soal(TEST_RAW, TEST_KUNCI)
        
        soal1 = soal_list[0]
        assert 'Pilihan A' in soal1['option_a'], "Option A not extracted correctly"
        assert 'Pilihan E' in soal1['option_e'], "Option E not extracted correctly"
        
        print("✅ Option extraction test PASSED")
        return True
    except Exception as e:
        print(f"❌ Option extraction test FAILED: {e}")
        return False


def test_question_extraction():
    """Test ekstraksi pertanyaan"""
    print("\n🧪 Testing question extraction...")
    
    try:
        soal_list = parse_raw_soal(TEST_RAW, TEST_KUNCI)
        
        assert soal_list[0]['question'] != "", "Question 1 should not be empty"
        assert soal_list[1]['question'] != "", "Question 2 should not be empty"
        assert '?' in soal_list[0]['question'], "Question should contain '?'"
        
        print("✅ Question extraction test PASSED")
        return True
    except Exception as e:
        print(f"❌ Question extraction test FAILED: {e}")
        return False


def test_explanation_extraction():
    """Test ekstraksi pembahasan"""
    print("\n🧪 Testing explanation extraction...")
    
    try:
        soal_list = parse_raw_soal(TEST_RAW, TEST_KUNCI)
        
        assert soal_list[0]['explanation'] != "", "Explanation 1 should not be empty"
        assert 'pembahasan' in soal_list[0]['explanation'].lower(), "Should contain pembahasan"
        
        print("✅ Explanation extraction test PASSED")
        return True
    except Exception as e:
        print(f"❌ Explanation extraction test FAILED: {e}")
        return False


def test_subtest_detection():
    """Test deteksi tipe soal"""
    print("\n🧪 Testing subtest detection...")
    
    try:
        soal_list = parse_raw_soal(TEST_RAW, TEST_KUNCI)
        
        # Soal 2 harusnya matematika karena ada angka dan pola
        assert 'matematika' in soal_list[1]['subtest'].lower() or 'umum' in soal_list[1]['subtest'].lower(), \
            f"Subtest should be matematika or umum, got {soal_list[1]['subtest']}"
        
        print("✅ Subtest detection test PASSED")
        return True
    except Exception as e:
        print(f"❌ Subtest detection test FAILED: {e}")
        return False


def test_json_output():
    """Test output JSON"""
    print("\n🧪 Testing JSON output...")
    
    try:
        soal_list = parse_raw_soal(TEST_RAW, TEST_KUNCI)
        
        # Coba convert ke JSON string
        json_str = json.dumps(soal_list, ensure_ascii=False)
        
        # Coba parse kembali
        parsed = json.loads(json_str)
        
        assert len(parsed) == len(soal_list), "JSON parsing should preserve length"
        
        print("✅ JSON output test PASSED")
        return True
    except Exception as e:
        print(f"❌ JSON output test FAILED: {e}")
        return False


def run_all_tests():
    """Jalankan semua test"""
    print("=" * 60)
    print("🚀 Running All Tests")
    print("=" * 60)
    
    tests = [
        test_basic_conversion,
        test_option_extraction,
        test_question_extraction,
        test_explanation_extraction,
        test_subtest_detection,
        test_json_output
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed! Tool is ready to use.")
    else:
        print("\n⚠️ Some tests failed. Check the errors above.")
    
    return passed == total


if __name__ == "__main__":
    run_all_tests()
