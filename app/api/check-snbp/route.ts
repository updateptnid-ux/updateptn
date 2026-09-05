import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { averageScore, schoolAccreditation, desiredMajor } = await request.json();

  // Simple placeholder estimation – replace with real algorithm as needed
  const scoreFactor = Math.min(averageScore / 100, 1);
  const accreditationFactor = schoolAccreditation === 'A' ? 1 : 0.8;
  const chance = Math.round(scoreFactor * accreditationFactor * 100);

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
