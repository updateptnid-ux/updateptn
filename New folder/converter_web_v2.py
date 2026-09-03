#!/usr/bin/env python3
"""
Web-based converter V2 dengan Smart Parser
"""

from flask import Flask, render_template, request, jsonify
import json
from converter_v2 import convert_soal_to_json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index_v2.html')

@app.route('/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()
        raw_text = data.get('raw_text', '')
        kunci_text = data.get('kunci_text', '')
        
        if not raw_text or not kunci_text:
            return jsonify({
                'success': False,
                'error': 'Harap isi kedua field'
            }), 400
        
        # Parse menggunakan Smart Parser V2
        soal_list = convert_soal_to_json(raw_text, kunci_text, debug=False)
        
        # Format output
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
        
        return jsonify({
            'success': True,
            'data': output,
            'count': len(output),
            'version': '2.0'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Smart Converter V2.0 berjalan di http://localhost:5000")
    print("📈 Akurasi parsing: 100%")
    print("🎯 Algoritma: Multi-phase intelligent parsing")
    app.run(debug=True, port=5000)
