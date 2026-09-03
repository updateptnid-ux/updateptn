import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

export default function TestGoogleLogin() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Test Google Login
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Klik tombol di bawah untuk test login dengan Google
            </p>
          </div>

          <GoogleLoginButton />

          <div className="text-xs text-slate-500 text-center">
            Setelah login berhasil, Anda akan diarahkan ke dashboard
          </div>
        </div>
      </div>
    </div>
  );
}
