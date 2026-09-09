import { createServerClient } from "@supabase/ssr";
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
  });

  // Handle OAuth error
  if (error) {
    console.error('❌ OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`
    );
  }

  // Exchange code for session
  if (code) {
    try {
      // CRITICAL FIX: Create response first, then supabase client that can set cookies in response
      let response = NextResponse.redirect(`${baseUrl}/auth/success`);
      
      // Create Supabase client with cookie handler that sets cookies in the response
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              // Set cookies in the NextResponse
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );
      
      // Exchange code for session - this will call setAll to set cookies in response
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('❌ Exchange error:', exchangeError);
        return NextResponse.redirect(
          `${baseUrl}/login?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`
        );
      }

      if (!data.session || !data.user) {
        console.error('❌ No session or user created');
        return NextResponse.redirect(`${baseUrl}/login?error=no_session`);
      }

      console.log('✅ Session created for user:', data.user.email, 'User ID:', data.user.id);
      console.log('🍪 Cookies set in response, redirecting to success page');

      // Update redirect URL with email param (create new response with cookies already set)
      const finalResponse = NextResponse.redirect(`${baseUrl}/auth/success?email=${encodeURIComponent(data.user.email || '')}`);
      
      // Copy all cookies from the previous response to the final response
      response.cookies.getAll().forEach(cookie => {
        finalResponse.cookies.set(cookie.name, cookie.value);
      });
      
      return finalResponse;
      
    } catch (err: any) {
      console.error('❌ Unexpected error in callback:', err);
      return NextResponse.redirect(
        `${baseUrl}/login?error=unexpected&message=${encodeURIComponent(err.message || 'Unknown error')}`
      );
    }
  }

  // No code provided - redirect to login
  console.error('❌ No code provided in callback');
  return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
}
