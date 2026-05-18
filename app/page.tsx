"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ALLOWED_EMAILS, useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { AlertCircle, Dumbbell, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Left Side: Decorative/Image Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative bg-slate-900 overflow-hidden items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/login-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/20" />
        
        <div className="relative z-10 max-w-lg p-8 md:p-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/20 text-blue-400 rounded-2xl mb-6 backdrop-blur-md border border-blue-500/20">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Build incredible programs, in a fraction of the time
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Stop translating messy texts from clients. CoachKit transforms unstructured workout descriptions into beautifully formatted, ready-to-share PDF schedules with a single click.
          </p>
        </div>
      </div>

      {/* Right Side: Login Panel */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 relative">
        <div className="max-w-md w-full grid grid-cols-1 gap-8 relative z-10">
          <div className="flex flex-col space-y-3 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-center tracking-tight text-[#1f3a5e]">
              Welcome to CoachKit
            </h2>
            <p className="text-slate-500 text-center text-lg">
              Log in to manage and format workout schedules.
            </p>
          </div>

          <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 text-sm flex items-center rounded-xl border border-red-100/50 shadow-sm transition-all animate-in fade-in zoom-in-95">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    size="lg"
                    onClick={handleGoogleLogin}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 shadow-sm rounded-xl transition-all font-semibold h-14"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-slate-400" />
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
                    {loading ? "Authenticating..." : "Continue with Google"}
                  </Button>
                </div>
                
                <div className="text-center mt-6">
                  <p className="text-xs text-slate-400">
                    Only authorized accounts can access the platform. <br className="hidden sm:block" /> Please contact an administrator to request access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
