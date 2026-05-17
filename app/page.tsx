"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Dumbbell, Flame, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Column: Hero Text */}
        <div className="flex flex-col space-y-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
            Convert raw text into <br className="hidden lg:block" />
            <span className="text-blue-600">beautiful schedules.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-md">
            Paste your messy WhatsApp or email messages. Our AI instantly organizes them into clear days and professional PDFs for your clients.
          </p>
          <ul className="space-y-3 pt-4">
            {[
              "Automatically extracts exercises, sets, and reps",
              "Groups exercises by training days automatically",
              "Smart formatting into professional tables",
            ].map((item, i) => (
              <li key={i} className="flex items-center text-slate-600">
                <Flame className="w-5 h-5 mr-3 text-orange-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Input Area */}
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0 flex flex-col h-full"> 
            <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex items-center text-sm font-medium text-slate-500">
              Paste your raw schedule below
            </div>
            
            <div className="relative flex-grow">
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

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <Button 
                size="lg" 
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
                onClick={handleAnalyze} 
                disabled={loading || !text}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing structure...
                  </>
                ) : (
                  "Create Schedule"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}