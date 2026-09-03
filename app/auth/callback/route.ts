import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('🔍 Auth Callback Debug:', {
    code: code ? 'exists' : 'missing',
    error,
    errorDescription,
    fullUrl: request.url
  });

  // Handle OAuth error
  if (error) {
    console.error('❌ OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/register?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`
    );
  }

  // Exchange code for session
  if (code) {
    try {
      const supabase = await createClient();
      
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('❌ Exchange error:', exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/register?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (!data.session || !data.user) {
        console.error('❌ No session or user created');
        return NextResponse.redirect(`${requestUrl.origin}/register?error=no_session`);
      }

      console.log('✅ Session created for user:', data.user.email);

      // Wait for profile trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to success page with countdown (instead of direct dashboard redirect)
      const response = NextResponse.redirect(`${requestUrl.origin}/auth/success?email=${encodeURIComponent(data.user.email || '')}`);
      
      // Ensure cookies are set properly for the session
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      
      // Get all supabase cookies and set them on the response
      const allCookies = cookieStore.getAll();
      for (const cookie of allCookies) {
        if (cookie.name.startsWith('sb-')) {
          response.cookies.set(cookie.name, cookie.value, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
        }
      }

      return response;
    } catch (err: any) {
      console.error('❌ Unexpected error in callback:', err);
      return NextResponse.redirect(
        `${requestUrl.origin}/register?error=unexpected&message=${encodeURIComponent(err.message || 'Unknown error')}`
      );
    }
  }

  // No code provided - redirect to register
  console.error('❌ No code provided in callback');
  return NextResponse.redirect(`${requestUrl.origin}/register?error=no_code`);
}
