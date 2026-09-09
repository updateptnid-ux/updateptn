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

      // Redirect to success page - session cookies are already set by exchangeCodeForSession
      // The success page will check profile completion status
      const response = NextResponse.redirect(`${baseUrl}/auth/success?email=${encodeURIComponent(data.user.email || '')}`);
      
      console.log('🍪 Redirecting to success page for profile check');
      
      return response;
      
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
