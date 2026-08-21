import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY || "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"; // using fallback as requested

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

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "UpdatePTN",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash:free", // using free model on openrouter
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
      })
    });

    if (!openRouterRes.ok) {
      const errorData = await openRouterRes.text();
      console.error("OpenRouter Error:", errorData);
      return NextResponse.json({ error: "Gagal memanggil OpenRouter API." }, { status: openRouterRes.status });
    }

    const responseData = await openRouterRes.json();
    let text = responseData.choices?.[0]?.message?.content || "";

    // Bersihkan jika AI masih ngeyel pakai markdown backticks
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    // Coba validasi JSON-nya
    let parsedJson = [];
    try {
      parsedJson = JSON.parse(text);
    } catch (parseError) {
      console.error("Gagal parse JSON dari OpenRouter:", text);
      return NextResponse.json({ error: "AI tidak mengembalikan JSON yang valid. Silakan coba lagi dengan format teks yang lebih rapi." }, { status: 500 });
    }

    return NextResponse.json({ data: JSON.stringify(parsedJson, null, 2) });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan internal saat menghubungi API." }, { status: 500 });
  }
}
