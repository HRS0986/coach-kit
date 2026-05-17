"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AlertCircle, Download, Dumbbell, Flame, Loader2, User } from "lucide-react";
import { useState } from "react";

interface WorkoutRow {
  no: number;
  exercise: string;
  sets: number | string;
  reps: number[];
}

function buildPdf(scheduleData: WorkoutRow[], opts: {
  clientName: string; trainerName: string; programName: string; phase: string; age?: string; height?: string; weight?: string; bmi?: string; workoutPeriod?: string; date?: string;
}) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const { clientName, trainerName, programName, phase, age, height, weight, bmi, workoutPeriod, date } = opts;

  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, W, 56, "F");

  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 5, 56, "F");

  doc.setFillColor(0, 0, 0);
  doc.rect(0, 56, W, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(50, 50, 50);
  doc.text("WORKOUT SCHEDULER", 13, 11);

  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text((programName || "WORKOUT SCHEDULE").toUpperCase(), 13, 28);

  const phaseText = phase ? phase : workoutPeriod ? workoutPeriod : "";
  if (phaseText) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(phaseText.toUpperCase(), 13, 40);
  }

  const dateStr = date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(dateStr, W - 10, 11, { align: "right" });

  let tableStart = 68;
  if (clientName || trainerName || age || height || weight || bmi) {
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 59, W, 34, "F");

    if (clientName) {
      doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 110, 110);
      doc.text("CLIENT", 13, 66);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
      doc.text(clientName.toUpperCase(), 13, 76);
    }
    
    const details: string[] = [];
    if (age) details.push(`Age: ${age}`);
    if (height) details.push(`H: ${height}`);
    if (weight) details.push(`W: ${weight}`);
    if (bmi) details.push(`BMI: ${bmi}`);
    
    if (details.length > 0) {
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
      doc.text(details.join(" | "), 13, 86);
    }

    if (trainerName) {
      doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 110, 110);
      doc.text("TRAINER", W / 2 + 5, 66);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
      doc.text(trainerName.toUpperCase(), W / 2 + 5, 76);
    }
    tableStart = 100;
  }

  autoTable(doc, {
    startY: tableStart,
    head: [["#", "EXERCISE", "SETS", "REPS"]],
    body: scheduleData.map((row) => [
      row.no.toString(),
      row.exercise,
      row.sets.toString(),
      [...row.reps].sort((a, b) => b - a).join(", "),
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [20, 20, 20], textColor: [255, 255, 255],
      fontStyle: "bold", fontSize: 8, cellPadding: 6,
    },
    columnStyles: {
      0: { cellWidth: 13, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 40, halign: "center" },
    },
    styles: { fontSize: 9, cellPadding: 6, lineColor: [230, 230, 230], textColor: [25, 25, 25] },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    bodyStyles: { fillColor: [255, 255, 255] },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(140, 140, 140);
  doc.text("Generated with AI Workout Scheduler", W / 2, finalY, { align: "center" });

  const slug = clientName ? clientName.replace(/\s+/g, "-").toLowerCase() : "client";
  doc.save(`${slug}-workout-schedule.pdf`);
}

export default function Home() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState<"idle" | "extracting" | "creating">("idle");
  const [error, setError] = useState("");
  
  const [clientName, setClientName] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [programName, setProgramName] = useState("");
  const [isScheduleExtracted, setIsScheduleExtracted] = useState(false);
  const [phase, setPhase] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState("");
  const [workoutPeriod, setWorkoutPeriod] = useState("");
  const [date, setDate] = useState("");
  
  const [scheduleData, setScheduleData] = useState<WorkoutRow[] | null>(null);

  const isLoading = progress !== "idle";
  const canAnalyze = !isLoading && !!text.trim();

  const handleAnalyze = async () => {
    setProgress("extracting");
    setError("");
    setScheduleData(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze schedule");
      
      setScheduleData(data.schedule);
      if (data.name) setClientName(data.name);
      if (data.age) setAge(data.age.toString());
      if (data.height) setHeight(data.height.toString());
      if (data.weight) setWeight(data.weight.toString());
      if (data.bmi) setBmi(data.bmi.toString());
      if (data.workoutPeriod) setWorkoutPeriod(data.workoutPeriod);
      if (data.date) setDate(data.date);
      setIsScheduleExtracted(true);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setProgress("idle");
    }
  };

  const handleGeneratePdf = async () => {
    if (!scheduleData) return;
    setProgress("creating");
    await new Promise((r) => setTimeout(r, 60));
    buildPdf(scheduleData, { clientName, trainerName, programName, phase, age, height, weight, bmi, workoutPeriod, date });
    setProgress("idle");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center text-white">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900">Workout <span className="text-blue-600">Scheduler</span></h1>
            <p className="text-[10px] tracking-wider text-slate-500 uppercase font-medium">Trainer Edition</p>
          </div>
        </div>        
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 gap-8 items-start">
        
        <div className="flex flex-col gap-6">
          <div className="mb-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Create Deliverable Workout Schedules In Seconds.
            </h2>
            <p className="text-slate-600 text-lg">
              Drop any workout schedule below. Our AI processes the text and neatly organizes it into a formatted, ready-to-print document.
            </p>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-lg">
                  <Flame className="w-5 h-5 text-blue-600" /> Raw Workout Text
                </CardTitle>
                <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-md">
                  {text.trim() ? text.trim().split(/\s+/).length : 0} words
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                disabled={isLoading}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-87.5 border-0 rounded-none shadow-none focus-visible:ring-0 resize-none p-6 text-base"
                placeholder={`Paste your raw workout text here...
                  Example:
                  1. Barbell Back Squat — 4 sets × 8, 8, 6, 6 reps
                  2. Romanian Deadlift — 3 sets × 10 reps
                  3. Leg Press — 3 sets × 12, 10, 10 reps`}
              />
            </CardContent>
            <CardFooter className="border-t bg-slate-50/50 py-3 px-6 flex justify-between">
               <p className="text-xs text-slate-500 font-medium">ANY FORMAT IS SUPPORTED</p>
               <p className="text-xs text-slate-500">{text.length} chars</p>
            </CardFooter>
          </Card>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {!scheduleData ? (
          <Button
            size="lg"
            onClick={handleAnalyze} 
            disabled={!canAnalyze}
            className="w-full h-14 text-base font-bold shadow-md"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Schedule...</>
            ) : (
              <><Flame className="w-5 h-5 mr-2" /> Analyze Schedule</>
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleGeneratePdf} 
            disabled={isLoading}
            className="w-full h-14 text-base font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Building PDF...</>
            ) : (
              <><Download className="w-5 h-5 mr-2" /> Download PDF</>
            )}
          </Button>
        )}

        {isScheduleExtracted && (
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <Card className="shadow-sm border-t-4 border-t-slate-900">
              <CardHeader className="pb-4 border-b bg-slate-50/50">
                <CardTitle className="flex items-center gap-2.5 text-lg">
                  <User className="w-5 h-5 text-slate-700" /> Client Details
                </CardTitle>
                <CardDescription>Metrics printed on the PDF header</CardDescription>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-5">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input placeholder="e.g. Alex Johnson" value={clientName} onChange={e => setClientName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input placeholder="e.g. 28" value={age} onChange={e => setAge(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input placeholder="e.g. 2024-05-17" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <Input placeholder="180cm" value={height} onChange={e => setHeight(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <Input placeholder="80kg" value={weight} onChange={e => setWeight(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>BMI</Label>
                    <Input placeholder="24.7" value={bmi} onChange={e => setBmi(e.target.value)} />
                  </div>
                </div>              
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Input placeholder="4 Weeks" value={workoutPeriod} onChange={e => setWorkoutPeriod(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Trainer Name</Label>
                  <Input placeholder="e.g. Coach Marcus" value={trainerName} onChange={e => setTrainerName(e.target.value)} />
                </div>
                
              </CardContent>
            </Card></div>
        )}

        

      </main>
    </div>
  );
}
