# 📡 API Documentation

## Overview

Converter Web API menyediakan endpoint RESTful untuk konversi soal ujian ke format JSON.

## Base URL

```
http://localhost:5000
```

## Endpoints

### 1. GET / (Homepage)

Menampilkan web interface untuk konversi soal.

**Request:**
```http
GET / HTTP/1.1
Host: localhost:5000
```

**Response:**
- HTML page dengan form input

---

### 2. POST /convert (Convert Soal)

Mengkonversi soal raw text menjadi JSON.

**Request:**
```http
POST /convert HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "raw_text": "Soal 1\nTeks\n[isi soal]...",
  "kunci_text": "KUNCI JAWABAN\n1. C (Jawaban)..."
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| raw_text | string | Yes | Raw text soal dengan format yang ditentukan |
| kunci_text | string | Yes | Kunci jawaban dengan pembahasan |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
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
      "explanation": "Pembahasan jawaban"
    }
  ],
  "count": 1
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Harap isi kedua field"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## Request Examples

### cURL

```bash
curl -X POST http://localhost:5000/convert \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "Soal 1\nTeks\nIni teks soal\n\nPertanyaan?\n\nA Pilihan A\nB Pilihan B\nC Pilihan C\nD Pilihan D\nE Pilihan E",
    "kunci_text": "KUNCI JAWABAN\n1. C (Pilihan C)\nPembahasan jawaban."
  }'
```

### Python (requests)

```python
import requests
import json

url = "http://localhost:5000/convert"

payload = {
    "raw_text": """Soal 1
Teks
Ini teks soal

Pertanyaan?

A Pilihan A
B Pilihan B
C Pilihan C
D Pilihan D
E Pilihan E""",
    "kunci_text": """KUNCI JAWABAN
1. C (Pilihan C)
Pembahasan jawaban."""
}

response = requests.post(url, json=payload)
result = response.json()

if result['success']:
    print(f"Berhasil konversi {result['count']} soal")
    print(json.dumps(result['data'], indent=2))
else:
    print(f"Error: {result['error']}")
```

### JavaScript (fetch)

```javascript
const url = 'http://localhost:5000/convert';

const payload = {
  raw_text: `Soal 1
Teks
Ini teks soal

Pertanyaan?

A Pilihan A
B Pilihan B
C Pilihan C
D Pilihan D
E Pilihan E`,
  kunci_text: `KUNCI JAWABAN
1. C (Pilihan C)
Pembahasan jawaban.`
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log(`Berhasil konversi ${data.count} soal`);
    console.log(JSON.stringify(data.data, null, 2));
  } else {
    console.error(`Error: ${data.error}`);
  }
})
.catch(error => console.error('Error:', error));
```

---

## Response Schema

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "nomor": 1,
      "subtest": "string (penalaran umum | penalaran matematika | literasi bahasa indonesia)",
      "text": "string (teks/bacaan soal)",
      "question": "string (pertanyaan soal)",
      "option_a": "string (pilihan A dengan prefix)",
      "option_b": "string (pilihan B dengan prefix)",
      "option_c": "string (pilihan C dengan prefix)",
      "option_d": "string (pilihan D dengan prefix)",
      "option_e": "string (pilihan E dengan prefix)",
      "correct_answer": "string (A|B|C|D|E)",
      "explanation": "string (pembahasan jawaban)"
    }
  ],
  "count": "integer (jumlah soal yang berhasil dikonversi)"
}
```

### Error Response

```json
{
  "success": false,
  "error": "string (deskripsi error)"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Konversi berhasil |
| 400 | Bad Request - Parameter tidak lengkap atau format salah |
| 500 | Internal Server Error - Error saat parsing atau konversi |

---

## Rate Limiting

Saat ini tidak ada rate limiting. Untuk production, disarankan menambahkan:
- Request throttling
- Authentication
- CORS policy

---

## CORS

Default CORS policy:
- Origin: `*` (semua origin)
- Methods: `GET, POST`
- Headers: `Content-Type`

Untuk production, ubah di `converter_web.py`:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/convert": {
        "origins": ["https://your-domain.com"],
        "methods": ["POST"]
    }
})
```

---

## Input Format Specification

### Raw Text Format

```
Soal [number]
Teks | Text | Teks:
[text content line 1]
[text content line 2]
...

[question line]

A [option A text]
B [option B text]
C [option C text]
D [option D text]
E [option E text]

Soal [number+1]
...
```

**Rules:**
- Setiap soal diawali "Soal" + nomor
- Teks bisa diawali "Teks", "Teks:", "Text" atau tanpa header
- Pertanyaan biasanya mengandung tanda tanya (?)
- Pilihan jawaban diawali huruf A-E + spasi
- Pisahkan antar soal dengan baris kosong

### Kunci Jawaban Format

```
KUNCI JAWABAN
[number]. [letter] ([answer text])
[explanation text line 1]
[explanation text line 2]
...

[number+1]. [letter] ([answer text])
[explanation text]
...
```

**Rules:**
- Opsional header "KUNCI JAWABAN"
- Format: `nomor. huruf (teks)`
- Pembahasan di baris berikutnya
- Pisahkan antar kunci dengan baris kosong

---

## Error Handling

### Common Errors

**1. Empty Input**
```json
{
  "success": false,
  "error": "Harap isi kedua field"
}
```
**Solution:** Pastikan raw_text dan kunci_text tidak kosong

**2. Parse Error**
```json
{
  "success": false,
  "error": "No match found for pattern..."
}
```
**Solution:** Cek format input sesuai spesifikasi

**3. Missing Key**
```json
{
  "success": false,
  "error": "KeyError: 'raw_text'"
}
```
**Solution:** Pastikan semua parameter required ada di request body

---

## Testing API

### Postman Collection

Import collection berikut ke Postman:

```json
{
  "info": {
    "name": "Soal Converter API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Convert Soal",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"raw_text\": \"Soal 1\\nTeks\\nIni teks soal\\n\\nPertanyaan?\\n\\nA Pilihan A\\nB Pilihan B\\nC Pilihan C\\nD Pilihan D\\nE Pilihan E\",\n  \"kunci_text\": \"KUNCI JAWABAN\\n1. C (Pilihan C)\\nPembahasan jawaban.\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/convert",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["convert"]
        }
      }
    }
  ]
}
```

---

## Integration Examples

### Integrasi dengan React

```jsx
import React, { useState } from 'react';

function SoalConverter() {
  const [rawText, setRawText] = useState('');
  const [kunciText, setKunciText] = useState('');
  const [result, setResult] = useState(null);

  const handleConvert = async () => {
    try {
      const response = await fetch('http://localhost:5000/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: rawText,
          kunci_text: kunciText
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <textarea 
        value={rawText} 
        onChange={(e) => setRawText(e.target.value)}
        placeholder="Raw soal..."
      />
      <textarea 
        value={kunciText} 
        onChange={(e) => setKunciText(e.target.value)}
        placeholder="Kunci jawaban..."
      />
      <button onClick={handleConvert}>Convert</button>
      
      {result && result.success && (
        <pre>{JSON.stringify(result.data, null, 2)}</pre>
      )}
    </div>
  );
}
```

---

## Security Considerations

### Production Checklist

- [ ] Enable HTTPS
- [ ] Add authentication (JWT/API Key)
- [ ] Implement rate limiting
- [ ] Validate and sanitize input
- [ ] Add request size limits
- [ ] Enable CORS with specific origins
- [ ] Add logging and monitoring
- [ ] Handle file upload instead of text
- [ ] Add request timeout
- [ ] Implement caching

---

## Support

For API issues or questions:
- Check error messages in response
- Review input format specification
- Test with provided examples
- Check server logs

---

**Version:** 1.0.0  
**Last Updated:** 2026-09-01
