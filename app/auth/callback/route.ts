import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/url-helpers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  // Get dynamic base URL (works for both localhost and production)
  const baseUrl = getBaseUrl();

  console.log('🔍 Auth Callback Debug:', {
    code: code ? 'exists' : 'missing',
    error,
    errorDescription,
    baseUrl,
    fullUrl: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

  // Handle OAuth error
  if (error) {
    console.error('❌ OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${baseUrl}/register?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`
    );
  }

  // Exchange code for session
  if (code) {
    try {
      const supabase = await createClient();
      
      // Exchange code for session - this automatically sets cookies via middleware
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('❌ Exchange error:', exchangeError);
        return NextResponse.redirect(
          `${baseUrl}/register?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (!data.session || !data.user) {
        console.error('❌ No session or user created');
        return NextResponse.redirect(`${baseUrl}/register?error=no_session`);
      }

      console.log('✅ Session created for user:', data.user.email, 'Session expires:', data.session.expires_at);

      // Wait for profile trigger to complete (2 seconds to be safe)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if profile needs completion
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, provinsi")
        .eq("id", data.user.id)
        .single();

      console.log('📊 Profile check result:', { 
        hasProfile: !!profile, 
        fullName: profile?.full_name, 
        provinsi: profile?.provinsi,
        error: profileError 
      });

      // If profile is incomplete (no name or provinsi), redirect to complete-profile
      const needsCompletion = !profile?.full_name || !profile?.provinsi;
      
      const redirectUrl = needsCompletion 
        ? `${baseUrl}/complete-profile` 
        : `${baseUrl}/dashboard/student`;
      
      console.log(needsCompletion ? '📝 Profile incomplete, redirecting to complete-profile' : '✅ Profile complete, redirecting to dashboard');

      // Simple redirect - let the middleware handle session cookies
      return NextResponse.redirect(redirectUrl);
      
    } catch (err: any) {
      console.error('❌ Unexpected error in callback:', err);
      return NextResponse.redirect(
        `${baseUrl}/register?error=unexpected&message=${encodeURIComponent(err.message || 'Unknown error')}`
      );
    }
  }

  // No code provided - redirect to register
  console.error('❌ No code provided in callback');
  return NextResponse.redirect(`${baseUrl}/register?error=no_code`);
}
