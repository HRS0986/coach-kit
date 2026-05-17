"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildPdf, DaySchedule } from "@/lib/pdf";
import { ArrowLeft, ChevronDown, ChevronUp, Download, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PreviewPage() {
  const router = useRouter();
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(true);
  const [clientDetails, setClientDetails] = useState({
    clientName: "",
    trainerName: "AI Trainer",
    programName: "Personalized Program",
    phase: "",
    age: "",
    height: "",
    weight: "",
    bmi: "",
    workoutPeriod: "",
    date: ""
  });
  const [days, setDays] = useState<DaySchedule[]>([]);

  useEffect(() => {
    // Read from session storage on mount
    const storedSchedule = sessionStorage.getItem("workoutData");
    if (storedSchedule) {
      try {
        const parsed = JSON.parse(storedSchedule);
        if (parsed.days) setDays(parsed.days);
        setClientDetails(prev => ({
          ...prev,
          clientName: parsed.name || prev.clientName,
          age: parsed.age ? String(parsed.age) : prev.age,
          height: parsed.height ? String(parsed.height) : prev.height,
          weight: parsed.weight ? String(parsed.weight) : prev.weight,
          bmi: parsed.bmi ? String(parsed.bmi) : prev.bmi,
          workoutPeriod: parsed.workoutPeriod || prev.workoutPeriod,
          date: parsed.date || prev.date
        }));
      } catch (err) {
        console.error("Failed to parse stored schedule");
      }
    } else {
      // If no data, send back to home
      router.push("/");
    }
  }, [router]);

  const handleClientDetailChange = (field: string, value: string) => {
    setClientDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleExerciseChange = (dayIndex: number, exerciseIndex: number, field: string, value: string) => {
    const updatedDays = [...days];
    const item = { ...updatedDays[dayIndex].exercises[exerciseIndex] };
    
    if (field === "reps") {
      item.reps = value.split(",").map(v => parseInt(v.trim())).filter(n => !isNaN(n));
    } else {
      (item as any)[field] = value;
    }
    updatedDays[dayIndex].exercises[exerciseIndex] = item;
    setDays(updatedDays);
  };

  const handleAddExercise = (dayIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].exercises.push({
      no: updatedDays[dayIndex].exercises.length + 1,
      exercise: "New Exercise",
      sets: "3",
      reps: [10, 10, 10]
    });
    setDays(updatedDays);
  };

  const handleDeleteExercise = (dayIndex: number, exerciseIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setDays(updatedDays);
  };

  const handleDayNameChange = (dayIndex: number, value: string) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].dayName = value;
    setDays(updatedDays);
  };

  const generatePDF = () => {
    buildPdf(days, clientDetails);
  };

  if (days.length === 0) return null; // loading or redirecting

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Schedule Preview</h1>
        </div>

        {/* Collapsible Client Details */}
        <Collapsible 
          open={isClientDetailsOpen} 
          onOpenChange={setIsClientDetailsOpen}
          className="w-full"
        >
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CollapsibleTrigger className="w-full text-left [&>*]:w-full">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer bg-white hover:bg-slate-50/50 transition-colors p-6">
                <div>
                  <CardTitle>Client Details</CardTitle>
                  <CardDescription>Edit the personal and program information for the header.</CardDescription>
                </div>
                <div className="p-2 bg-slate-100 rounded-full flex-shrink-0">
                  {isClientDetailsOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="p-6 pt-0 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-slate-100">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input value={clientDetails.clientName} onChange={(e) => handleClientDetailChange("clientName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Trainer / Gym Name</Label>
                  <Input value={clientDetails.trainerName} onChange={(e) => handleClientDetailChange("trainerName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Program Name</Label>
                  <Input value={clientDetails.programName} onChange={(e) => handleClientDetailChange("programName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Workout Period / Phase</Label>
                  <Input value={clientDetails.workoutPeriod} onChange={(e) => handleClientDetailChange("workoutPeriod", e.target.value)} placeholder="e.g., 4 weeks" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input value={clientDetails.date} onChange={(e) => handleClientDetailChange("date", e.target.value)} placeholder="e.g., Oct 25, 2023" />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input value={clientDetails.age} onChange={(e) => handleClientDetailChange("age", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input value={clientDetails.height} onChange={(e) => handleClientDetailChange("height", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Weight</Label>
                  <Input value={clientDetails.weight} onChange={(e) => handleClientDetailChange("weight", e.target.value)} />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Schedule Tabs */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle>Workout Schedule</CardTitle>
            <CardDescription>Review and modify the extracted exercises day by day.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="day-0" className="w-full">
              <div className="overflow-x-auto border-b border-slate-100">
                <TabsList className="bg-transparent h-auto p-4 flex w-max min-w-full justify-start space-x-2">
                  {days.map((day, idx) => (
                    <TabsTrigger 
                      key={idx} 
                      value={`day-${idx}`}
                      className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-blue-100 px-4 py-2 rounded-lg"
                    >
                      {day.dayName || `Day ${idx + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {days.map((day, dayIndex) => (
                <TabsContent key={dayIndex} value={`day-${dayIndex}`} className="p-6 m-0 outline-none">
                  <div className="mb-6 space-y-2 md:w-1/2">
                    <Label className="text-slate-500">Day Name / Label</Label>
                    <Input 
                      value={day.dayName} 
                      onChange={(e) => handleDayNameChange(dayIndex, e.target.value)} 
                      className="font-medium text-lg"
                    />
                  </div>

                  <div className="space-y-4">
                    {day.exercises.map((exercise, exIndex) => (
                      <div key={exIndex} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 border border-slate-100 rounded-lg group">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-slate-500">Exercise</Label>
                          <Input 
                            value={exercise.exercise} 
                            onChange={(e) => handleExerciseChange(dayIndex, exIndex, "exercise", e.target.value)} 
                            className="bg-white"
                          />
                        </div>
                        <div className="w-full md:w-24 space-y-1">
                          <Label className="text-xs text-slate-500">Sets</Label>
                          <Input 
                            value={exercise.sets} 
                            onChange={(e) => handleExerciseChange(dayIndex, exIndex, "sets", e.target.value)} 
                            className="bg-white"
                          />
                        </div>
                        <div className="w-full md:w-32 space-y-1">
                          <Label className="text-xs text-slate-500">Reps (comma sep)</Label>
                          <Input 
                            value={exercise.reps ? exercise.reps.join(", ") : ""} 
                            onChange={(e) => handleExerciseChange(dayIndex, exIndex, "reps", e.target.value)} 
                            className="bg-white"
                          />
                        </div>
                        <div className="flex items-end pb-0.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteExercise(dayIndex, exIndex)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleAddExercise(dayIndex)}
                      className="w-full border-dashed border-2 py-8 text-slate-500 hover:text-slate-900 border-slate-200"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Exercise
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="sticky bottom-6 flex justify-end">
          <Button size="lg" onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8 rounded-full h-14 text-lg">
            <Download className="w-5 h-5 mr-3" />
            Export as PDF
          </Button>
        </div>

      </div>
    </div>
  );
}