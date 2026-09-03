#!/usr/bin/env python3
"""
Web-based converter untuk soal ke JSON
"""

from flask import Flask, render_template, request, jsonify, send_file
import json
import re
from converter import parse_raw_soal

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

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
        
        # Parse soal
        soal_list = parse_raw_soal(raw_text, kunci_text)
        
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
            'count': len(output)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Server berjalan di http://localhost:5000")
    app.run(debug=True, port=5000)
