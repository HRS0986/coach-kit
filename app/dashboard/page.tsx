"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle, FilePlus, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please paste a workout schedule to analyze.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!resp.ok) {
        throw new Error(await resp.text());
      }

      const data = await resp.json();

      // Save data for the preview page
      sessionStorage.setItem("workoutData", JSON.stringify(data));

      // Redirect to preview
      router.push("/preview");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze schedule.");
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 gap-8 items-center h-full">
        {/* Left Column: Hero Text */}
        <div className="flex flex-col space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
            <span className="text-[#1f3a5e]">
              Raw Text Into Deliverable Workout Schedules
            </span>
          </h1>
          <p className="text-lg text-slate-500">
            Paste your messy WhatsApp or email messages. Our AI instantly
            organizes them into clear days and professional PDFs for your
            clients.
          </p>
        </div>

        {/* Right Column: Input Area */}
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white py-0">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="bg-slate-200 border-b border-slate-100 p-4 px-6 flex items-center text-sm font-medium text-slate-500">
              Paste your raw schedule below
            </div>

            <div className="relative grow">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[400px] border-0 rounded-none shadow-none focus-visible:ring-0 resize-none p-6 text-base"
                placeholder={`Example:
Day 1 - Chest/Triceps
Bench Press: 4 sets of 10-12
Incline DB Press: 3x10
Tricep Pushdown - 4/12

Day 2 - Back/Biceps
Lat Pulldown 4 sets 10
Barbell Row 3x8
Bicep Curls 4 sets 12`}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 text-sm flex items-center border-t border-red-100">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}

            <div className="p-6 bg-slate-200 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="w-full flex-1 h-14 text-lg bg-[#1f3a5e] hover:bg-[#1a2f4a] text-white rounded-xl transition-all"
                onClick={handleAnalyze}
                disabled={loading || !text}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing raw text...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Schedule With AI
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full flex-1 h-14 text-lg rounded-xl transition-all border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                onClick={() => {
                  sessionStorage.setItem("workoutData", JSON.stringify({ days: [], isManual: true }));
                  router.push("/preview");
                }}
                disabled={loading}
              >
                <FilePlus className="w-5 h-5 mr-2" />
                Create Schedule Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}