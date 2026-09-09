'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkProfileAndRedirect() {
      try {
        const supabase = createClient();
        
        // Wait a bit longer for session cookies to be fully established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ No user found after OAuth:', userError);
          // Redirect back to login with error
          router.push('/login?error=session_failed&message=' + encodeURIComponent('Sesi tidak ditemukan. Silakan coba login lagi.'));
          return;
        }

        console.log('✅ User found:', user.email);

        // Check if profile needs completion
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, provinsi")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error('⚠️ Profile query error:', profileError);
          // If profile doesn't exist yet, go to complete-profile
          setChecking(false);
          router.push('/complete-profile');
          return;
        }

        console.log('📊 Profile check:', { profile, needsCompletion: !profile?.full_name || !profile?.provinsi });

        const needsCompletion = !profile?.full_name || !profile?.provinsi;
        const redirectUrl = needsCompletion ? '/complete-profile' : '/dashboard/student';
        
        setChecking(false);

        // Start countdown after profile check
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              router.push(redirectUrl);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('❌ Error checking profile:', error);
        setChecking(false);
        // On error, try to go to dashboard anyway
        setTimeout(() => {
          router.push('/dashboard/student');
        }, 2000);
      }
    }

    checkProfileAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Image
            src="/logo.svg"
            alt="UpdatePTN"
            width={48}
            height={48}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-xl font-semibold text-slate-900">
            UpdatePTN
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-6">
          {/* Checkmark */}
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              {checking ? 'Memeriksa profil...' : 'Login berhasil!'}
            </h2>
            {email && (
              <p className="text-sm text-slate-500">
                {email}
              </p>
            )}
          </div>

          {/* Countdown */}
          {!checking && (
            <div className="pt-2">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 text-lg font-semibold">
                {countdown}
              </span>
            </div>
          )}

          {checking && (
            <div className="pt-2">
              <div className="inline-flex items-center justify-center w-10 h-10">
                <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          {!checking && (
            <button
              onClick={() => router.push(countdown === 0 ? '/dashboard/student' : '/dashboard/student')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Masuk sekarang →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
