import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key is not set in environment variables (GEMINI_API_KEY)" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `Kamu adalah asisten AI pembuat JSON untuk soal Try Out UTBK.
Pengguna akan memberikan teks mentah berisi soal-soal. Tugasmu adalah mem-parsing soal-soal tersebut dan menghasilkan array JSON yang valid.
Setiap objek dalam array harus memiliki struktur berikut:
- subtest_id: "Nama Subtes (misal: Penalaran Umum)"
- question: "Teks soal"
- option_a: "Pilihan A"
- option_b: "Pilihan B"
- option_c: "Pilihan C"
- option_d: "Pilihan D"
- option_e: "Pilihan E"
- correct_answer: "Kunci jawaban yang benar (hanya huruf A, B, C, D, atau E)"
- explanation: "Pembahasan (jika ada, jika tidak kosongkan string)"

Keluarkan HANYA JSON array yang valid. Jangan gunakan block backtick markdown (seperti \`\`\`json), jangan ada teks pengantar atau penutup. HANYA array JSON murni.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
      }
    });

    let text = response.text || "";
    // Bersihkan jika AI masih ngeyel pakai markdown backticks
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    // Coba validasi JSON-nya
    let parsedJson = [];
    try {
      parsedJson = JSON.parse(text);
    } catch (parseError) {
      console.error("Gagal parse JSON dari Gemini:", text);
      return NextResponse.json({ error: "AI tidak mengembalikan JSON yang valid. Silakan coba lagi dengan format teks yang lebih rapi." }, { status: 500 });
    }

    return NextResponse.json({ data: JSON.stringify(parsedJson, null, 2) });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan internal saat menghubungi Gemini API." }, { status: 500 });
  }
}
