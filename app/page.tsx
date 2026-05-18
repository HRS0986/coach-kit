"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ALLOWED_EMAILS, useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const email = result.user?.email;
      if (!email || !ALLOWED_EMAILS.includes(email)) {
        await signOut(auth);
        setError("Your email is not authorized to access this app.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Failed to log in with Google.");
      }
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full grid grid-cols-1 gap-8 items-center">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1f3a5e]">
            Welcome to CoachKit
          </h1>
          <p className="text-slate-500">
            Log in to manage and format workout schedules.
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-8">
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 text-sm flex items-center rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                size="lg"
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm rounded-xl transition-all font-medium h-14"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                {loading ? "Logging in..." : "Continue with Google"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
