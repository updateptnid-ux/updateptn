import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
export async function POST(request: Request) {
  const { averageScore, schoolAccreditation, desiredMajor } = await request.json();

  // Real estimation algorithm using SNBP data CSV
  // Load CSV data (cached after first load)
  const path = require('path');
  const fs = require('fs');
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
    // Fallback to placeholder if CSV load fails
    const scoreFactor = Math.min(averageScore / 100, 1);
    const accreditationFactor = schoolAccreditation === 'A' ? 1 : 0.8;
    const chance = Math.round(scoreFactor * accreditationFactor * 100);
    return NextResponse.json({ estimatedChance: `${chance}%` });
  }

  // Find matching program by kode_prodi or nama_prodi (case‑insensitive)
  const desired = (desiredMajor || '').toString().trim().toLowerCase();
  const match = rows.find(r =>
    r['kode_prodi']?.toString().toLowerCase() === desired ||
    r['nama_prodi']?.toString().toLowerCase() === desired
  );

  // If no match, fall back to simple calculation
  if (!match) {
    const scoreFactor = Math.min(averageScore / 100, 1);
    const accreditationFactor = schoolAccreditation === 'A' ? 1 : 0.8;
    const chance = Math.round(scoreFactor * accreditationFactor * 100);
    return NextResponse.json({ estimatedChance: `${chance}%` });
  }

  // Use estimasi_nilai_raport as the benchmark score for the program
  const targetScore = parseFloat(match['estimasi_nilai_raport'] ?? match['nilai_raport'] ?? '0');
  const rasio = parseFloat(match['rasio_keketatan'] ?? '1');
  const scoreFactor = targetScore ? Math.min(averageScore / targetScore, 1) : 0;
  // Adjust by accreditation and competition (rasio). Higher rasio (more seats per applicant) improves chance.
  const accreditationFactor = schoolAccreditation === 'A' ? 1 : 0.8;
  const competitionFactor = rasio > 0 ? Math.min(rasio, 2) : 1; // cap to avoid extreme boost
  const rawChance = scoreFactor * accreditationFactor * competitionFactor * 100;
  const chance = Math.round(Math.max(0, Math.min(rawChance, 100)));


  // Optionally store the estimation for the user
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

  return NextResponse.json({ estimatedChance: `${chance}%` });
}
