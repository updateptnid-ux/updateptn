'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = '/dashboard/student';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
              Login berhasil
            </h2>
            {email && (
              <p className="text-sm text-slate-500">
                {email}
              </p>
            )}
          </div>

          {/* Countdown */}
          <div className="pt-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 text-lg font-semibold">
              {countdown}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="/dashboard/student"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Masuk sekarang →
          </a>
        </div>
      </div>
    </div>
  );
}
