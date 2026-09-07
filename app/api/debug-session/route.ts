import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    
    // Get all cookies
    const allCookies = cookieStore.getAll();
    const sbCookies = allCookies.filter(c => c.name.startsWith('sb-'));
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Get profile if user exists
    let profile = null;
    let profileError = null;
    if (user) {
      const profileResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = profileResult.data;
      profileError = profileResult.error;
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cookies: {
        total: allCookies.length,
        supabaseCookies: sbCookies.map(c => ({ 
          name: c.name, 
          value: c.value.substring(0, 20) + '...', // Don't expose full token
          hasValue: !!c.value 
        }))
      },
      session: {
        exists: !!session,
        expiresAt: session?.expires_at,
        expiresIn: session?.expires_in,
        hasAccessToken: !!session?.access_token,
        hasRefreshToken: !!session?.refresh_token,
        error: sessionError?.message
      },
      user: {
        exists: !!user,
        id: user?.id,
        email: user?.email,
        emailConfirmed: user?.email_confirmed_at,
        lastSignIn: user?.last_sign_in_at,
        provider: user?.app_metadata?.provider,
        error: userError?.message
      },
      profile: {
        exists: !!profile,
        fullName: profile?.full_name,
        provinsi: profile?.provinsi,
        isComplete: !!(profile?.full_name && profile?.provinsi),
        error: profileError?.message
      }
    }, { status: 200 });
    
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
