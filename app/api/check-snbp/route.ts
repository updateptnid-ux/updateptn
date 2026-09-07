import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const { averageScore, schoolAccreditation, desiredMajor } = await request.json();

  // ---- Input validation ----
  if (typeof averageScore !== 'number' || isNaN(averageScore) || averageScore < 0 || averageScore > 100) {
    return NextResponse.json({ error: 'Invalid averageScore. Must be a number between 0 and 100.' }, { status: 400 });
  }
  if (typeof schoolAccreditation !== 'string' || !/^[A-E]$/i.test(schoolAccreditation.trim())) {
    return NextResponse.json({ error: 'Invalid schoolAccreditation. Must be a single letter A‑E.' }, { status: 400 });
  }
  if (typeof desiredMajor !== 'string' || desiredMajor.trim() === '') {
    return NextResponse.json({ error: 'Invalid desiredMajor. Must be a non‑empty string.' }, { status: 400 });
  }

  try {
    const csvPath = path.resolve(process.cwd(), 'data_snbp_2026.csv');
    let rows: any[] = [];
    try {
      const data = fs.readFileSync(csvPath, 'utf-8');
      const lines = data.split(/\r?\n/).filter(l => l.trim().length > 0);
      const headers = lines[0].split(',').map(h => h.trim());
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length !== headers.length) continue;
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx];
        });
        rows.push(row);
      }
    } catch (e) {
      console.error('Failed to read SNBP CSV:', e);
      const scoreFactor = Math.min(averageScore / 100, 1);
      const accreditationFactor = schoolAccreditation === 'A' ? 1 : 0.8;
      const chance = Math.round(scoreFactor * accreditationFactor * 100);
      return NextResponse.json({ estimatedChance: `${chance}%` });
    }

    // Normalize input and handle common synonyms
    const rawDesired = (desiredMajor || '').toString().trim().toLowerCase();
    const synonymsMap: { [key: string]: string[] } = {
      geologi: ['geologi', 'geology', 'tek geologi', 'geologi teknik'],
      kimia: ['kimia', 'chemical', 'tek kimia'],
      fisika: ['fisika', 'physics', 'tek fisika'],
      matematika: ['matematika', 'mathematics', 'math'],
      // add more as needed
    };
    let desired = rawDesired;
    // replace with synonym if matches
    for (const [canonical, alts] of Object.entries(synonymsMap)) {
      if (alts.includes(rawDesired)) {
        desired = canonical;
        break;
      }
    }
    // Try exact match first (kode_prodi or nama_prodi)
    let match = rows.find(r =>
      r['kode_prodi']?.toString().toLowerCase() === desired ||
      r['nama_prodi']?.toString().toLowerCase() === desired
    );
    // If not found, attempt fuzzy match on nama_prodi containing the term
    if (!match) {
      const lowered = desired.toLowerCase();
      match = rows.find(r => r['nama_prodi']?.toString().toLowerCase().includes(lowered));
    }

    let chance: number;
    if (match) {
      // Exact or fuzzy program match found
      const targetScore = parseFloat(match['estimasi_nilai_raport'] ?? match['nilai_raport'] ?? '0');
      const rasio = parseFloat(match['rasio_keketatan'] ?? '1');
      const programScoreFactor = targetScore ? Math.min(averageScore / targetScore, 1) : 0;
      const accreditationFactor = schoolAccreditation === 'A' ? 1 : 0.8;
      const ratioWeight = Math.min(rasio, 3);
      const rawChance = programScoreFactor * accreditationFactor * ratioWeight * 100;
      chance = Math.round(Math.max(0, Math.min(rawChance, 100)));
    } else {
      // PTN-level fallback (e.g., user entered PTN name)
      const ptnRows = rows.filter(r => r['ptn_name']?.toString().toLowerCase().includes(desired));
      if (ptnRows.length > 0) {
        const avgTargetScore = ptnRows.reduce((sum, r) => sum + parseFloat(r['estimasi_nilai_raport'] ?? r['nilai_raport'] ?? '0'), 0) / ptnRows.length;
        const avgRasio = ptnRows.reduce((sum, r) => sum + parseFloat(r['rasio_keketatan'] ?? '1'), 0) / ptnRows.length;
        const programScoreFactor = avgTargetScore ? Math.min(averageScore / avgTargetScore, 1) : 0;
        const accreditationFactor = schoolAccreditation === 'A' ? 1 : 0.8;
        const ratioWeight = Math.min(avgRasio, 3);
        const rawChance = programScoreFactor * accreditationFactor * ratioWeight * 100;
        chance = Math.round(Math.max(0, Math.min(rawChance, 100)));
      } else {
        return NextResponse.json({ error: 'Program not found. Please verify the program name and try again.' }, { status: 404 });
      }
    }

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('snbp_estimations').insert({
          user_id: user.id,
          average_score: averageScore,
          school_accreditation: schoolAccreditation,
          desired_major: desiredMajor,
          estimated_chance: chance,
        });
      }
    } catch (dbErr) {
      console.error('Failed to store SNBP estimation:', dbErr);
    }

    return NextResponse.json({ estimatedChance: `${chance}%` });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json({ error: 'Internal calculation error' }, { status: 500 });
  }
}
