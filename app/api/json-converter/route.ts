import { NextRequest, NextResponse } from 'next/server';
import { parseSoal, toJSONFormat } from '@/lib/soal-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raw_text, kunci_text } = body;

    if (!raw_text || !kunci_text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Harap isi kedua field (raw_text dan kunci_text)',
        },
        { status: 400 }
      );
    }

    // Parse menggunakan JS parser
    const parseResult = parseSoal(raw_text, kunci_text);

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.errors.join('; '),
        },
        { status: 400 }
      );
    }

    if (parseResult.questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak ada soal yang terdeteksi. Periksa format penomoran soal.',
        },
        { status: 400 }
      );
    }

    // Convert to JSON format
    const jsonData = toJSONFormat(parseResult.questions, 'umum');

    return NextResponse.json({
      success: true,
      data: jsonData,
      count: jsonData.length,
      version: '2.0',
      stats: {
        errorCount: parseResult.stats.errorCount,
        hasIncompleteOptions: parseResult.stats.hasIncompleteOptions,
      },
    });
  } catch (error) {
    console.error('JSON Converter error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
      },
      { status: 500 }
    );
  }
}
