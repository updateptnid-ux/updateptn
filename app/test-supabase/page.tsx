"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestSupabasePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    try {
      const supabase = createClient();
      
      // Test 1: Basic connection
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const endTime = Date.now();
      
      setResult({
        test: "Connection Test",
        duration: `${endTime - startTime}ms`,
        success: !error,
        session: data.session ? "Found" : "None",
        error: error?.message || null,
      });
    } catch (err: any) {
      setResult({
        test: "Connection Test",
        success: false,
        error: err.message,
      });
    }
    setLoading(false);
  };

  const testLogin = async () => {
    if (!email || !password) {
      alert("Email dan password required!");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const supabase = createClient();
      
      const startTime = Date.now();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      const endTime = Date.now();
      
      setResult({
        test: "Login Test",
        duration: `${endTime - startTime}ms`,
        success: !error,
        session: data.session ? "Created ✅" : "Failed ❌",
        user: data.user?.email || null,
        error: error?.message || null,
        accessToken: data.session?.access_token?.substring(0, 20) + "..." || null,
      });
    } catch (err: any) {
      setResult({
        test: "Login Test",
        success: false,
        error: err.message,
        stack: err.stack,
      });
    }
    setLoading(false);
  };

  const testLogout = async () => {
    setLoading(true);
    setResult(null);
    try {
      const supabase = createClient();
      
      const startTime = Date.now();
      const { error } = await supabase.auth.signOut();
      const endTime = Date.now();
      
      setResult({
        test: "Logout Test",
        duration: `${endTime - startTime}ms`,
        success: !error,
        error: error?.message || null,
      });
    } catch (err: any) {
      setResult({
        test: "Logout Test",
        success: false,
        error: err.message,
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Test basic connection to Supabase
              </p>
              <Button onClick={testConnection} disabled={loading}>
                {loading ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔐 Login Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={testLogin} disabled={loading}>
                {loading ? "Testing..." : "Test Login"}
              </Button>
              <Button onClick={testLogout} variant="outline" disabled={loading}>
                Test Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className={result.success ? "border-green-500" : "border-red-500"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? "✅ Success" : "❌ Failed"}
                <span className="text-sm font-normal text-slate-500">
                  ({result.test})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>📝 Environment Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Supabase URL:</span>
                <code className="bg-slate-200 px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ Not set"}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Anon Key:</span>
                <code className="bg-slate-200 px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set"}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
