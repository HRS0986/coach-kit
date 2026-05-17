"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";

interface WorkoutRow {
  no: number;
  exercise: string;
  sets: number | string;
  reps: number[];
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const IcoDumbbell = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11M6.5 17.5h11M4 8.5v7M8 5v14M16 5v14M20 8.5v7"/>
  </svg>
);

const IcoDownload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IcoFlame = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c-4 4-4 8 0 10-2-4 2-7 2-7s4 7-2 11c6-1 8-6 6-10 2 1 4 4 3 8 2-2 3-5 2-8 1 1 3 3 2 6 2-3 1-8-3-11-1 2-3 4-3 4s-1-1 1-3z"/>
  </svg>
);

const IcoTarget = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const IcoUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IcoAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IcoBolt = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IcoSpin = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
  </svg>
);

const IcoChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ── Small reusable pieces ─────────────────────────────────────────────────────

function RedDot() {
  return (
    <span
      style={{
        display: "inline-block", width: 8, height: 8, borderRadius: "50%",
        background: "var(--red)", flexShrink: 0,
        animation: "pulse-red 2.5s ease-in-out infinite",
      }}
    />
  );
}

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div style={{
        width: 32, height: 32, background: "var(--red)", display: "flex",
        alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0,
        clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
      }}>
        {icon}
      </div>
      <span className="font-oswald text-base font-semibold tracking-[0.2em] uppercase" style={{ color: "#fff" }}>
        {label}
      </span>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderTop: "2px solid var(--red)",
      padding: "14px 20px",
      minWidth: 90,
      textAlign: "center",
    }}>
      <div className="font-impact" style={{ fontSize: 28, color: "var(--red)", lineHeight: 1 }}>{value}</div>
      <div className="font-oswald" style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginTop: 4, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function StepRow({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div style={{
      display: "flex", gap: 16, alignItems: "flex-start",
      padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{
        width: 30, height: 30, background: "var(--red)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 14,
        flexShrink: 0,
      }}>{n}</div>
      <div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 14, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 500,
        letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <IcoChevron /> {label}
      </label>
      {children}
    </div>
  );
}

// ── PDF Generator ─────────────────────────────────────────────────────────────

function buildPdf(scheduleData: WorkoutRow[], opts: {
  clientName: string; trainerName: string; programName: string; phase: string; age?: string; height?: string; weight?: string; bmi?: string; workoutPeriod?: string; date?: string;
}) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const { clientName, trainerName, programName, phase, age, height, weight, bmi, workoutPeriod, date } = opts;

  // Full black header
  doc.setFillColor(8, 8, 10);
  doc.rect(0, 0, W, 56, "F");

  // Red left bar
  doc.setFillColor(232, 32, 14);
  doc.rect(0, 0, 5, 56, "F");

  // Red bottom accent
  doc.setFillColor(232, 32, 14);
  doc.rect(0, 56, W, 2.5, "F");

  // App brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(232, 32, 14);
  doc.text("IRONSCRIPT · TRAINER EDITION", 13, 11);

  // Program title
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text((programName || "WORKOUT SCHEDULE").toUpperCase(), 13, 28);

  // Phase line
  const phaseText = phase ? phase : workoutPeriod ? workoutPeriod : "";
  if (phaseText) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(phaseText.toUpperCase(), 13, 40);
  }

  // Date top-right
  const dateStr = date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(dateStr, W - 10, 11, { align: "right" });

  // Client / trainer row
  let tableStart = 68;
  if (clientName || trainerName || age || height || weight || bmi) {
    doc.setFillColor(14, 14, 16);
    doc.rect(0, 59, W, 34, "F");

    if (clientName) {
      doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 110, 110);
      doc.text("CLIENT", 13, 66);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(235, 235, 235);
      doc.text(clientName.toUpperCase(), 13, 76);
    }
    
    // Add extra details underneath client name
    const details = [];
    if (age) details.push(`Age: ${age}`);
    if (height) details.push(`H: ${height}`);
    if (weight) details.push(`W: ${weight}`);
    if (bmi) details.push(`BMI: ${bmi}`);
    
    if (details.length > 0) {
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(170, 170, 170);
      doc.text(details.join(" | "), 13, 86);
    }

    if (trainerName) {
      doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(110, 110, 110);
      doc.text("TRAINER", W / 2 + 5, 66);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(235, 235, 235);
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
      fillColor: [232, 32, 14], textColor: [255, 255, 255],
      fontStyle: "bold", fontSize: 8, cellPadding: 6,
    },
    columnStyles: {
      0: { cellWidth: 13, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 40, halign: "center" },
    },
    styles: { fontSize: 9, cellPadding: 6, lineColor: [30, 30, 30], textColor: [25, 25, 25] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    bodyStyles: { fillColor: [255, 255, 255] },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(140, 140, 140);
  doc.text("Generated with IronScript · Confidential", W / 2, finalY, { align: "center" });

  const slug = clientName ? clientName.replace(/\s+/g, "-").toLowerCase() : "client";
  doc.save(`${slug}-workout-${new Date().toISOString().split("T")[0]}.pdf`);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState<"idle" | "extracting" | "creating">("idle");
  const [error, setError] = useState("");
  const [clientName, setClientName] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [programName, setProgramName] = useState("");
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
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface)" }}>

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,8,10,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 60,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, background: "var(--red)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            clipPath: "polygon(0 0, 100% 0, 100% 65%, 65% 100%, 0 100%)",
          }}>
            <IcoDumbbell />
          </div>
          <div>
            <div className="font-impact" style={{ fontSize: 22, color: "#fff", lineHeight: 1, letterSpacing: "0.06em" }}>
              IRON<span style={{ color: "var(--red)" }}>SCRIPT</span>
            </div>
            <div className="font-oswald" style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
              Trainer Edition
            </div>
          </div>
        </div>

        {/* Nav right */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <RedDot />
          <span className="font-oswald" style={{ fontSize: 11, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            PDF Generator
          </span>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section
        className="noise-overlay stripe-diagonal"
        style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(160deg, #0a0a0c 0%, #0f1013 40%, #12080a 100%)",
          borderBottom: "2px solid var(--red)",
          padding: "64px 32px 56px",
        }}
      >
        {/* Giant BG text */}
        <div className="font-impact" style={{
          position: "absolute", right: -20, bottom: -30,
          fontSize: "clamp(120px, 22vw, 220px)",
          color: "rgba(232,32,14,0.06)", lineHeight: 1,
          pointerEvents: "none", userSelect: "none", letterSpacing: "0.02em",
        }}>
          LIFT
        </div>

        {/* Vertical red bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 5, background: "linear-gradient(180deg, var(--red) 0%, transparent 100%)",
        }} />

        {/* Horizontal scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, var(--red), transparent)",
          animation: "scan 4s linear infinite", opacity: 0.3,
        }} />

        <div style={{ maxWidth: 760, position: "relative" }}>
          {/* Tag */}
          <div className="reveal-1" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--red-dim)", border: "1px solid rgba(232,32,14,0.3)",
            color: "var(--red)", padding: "4px 12px", marginBottom: 20,
            fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.3em", textTransform: "uppercase",
          }}>
            <IcoBolt /> AI-Powered
          </div>

          {/* Headline */}
          <h1 className="font-impact reveal-2" style={{
            fontSize: "clamp(52px, 9vw, 96px)",
            lineHeight: 0.9, letterSpacing: "0.02em", color: "#fff",
            marginBottom: 8,
          }}>
            BUILD YOUR
          </h1>
          <div className="reveal-2" style={{
            fontSize: "clamp(52px, 9vw, 96px)",
            fontFamily: "Impact, sans-serif",
            lineHeight: 0.9, letterSpacing: "0.02em",
            color: "var(--red)", marginBottom: 24,
            textShadow: "0 0 40px rgba(232,32,14,0.4)",
          }}>
            CLIENT&apos;S PDF
          </div>

          {/* Sub */}
          <p className="reveal-3 font-oswald" style={{
            fontSize: 16, fontWeight: 300, letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.45)", maxWidth: 480, lineHeight: 1.7, marginBottom: 36,
          }}>
            Drop any workout schedule. The AI rips through it and outputs a crisp,
            branded PDF ready to hand to your client in seconds.
          </p>

          {/* Stats */}
          <div className="reveal-4" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatBox value="AI" label="Powered" />
            <StatBox value="PDF" label="Output" />
            <StatBox value="~5s" label="Speed" />
            <StatBox value="∞" label="Schedules" />
          </div>
        </div>
      </section>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: 2,
        maxWidth: 1160,
        width: "100%",
        margin: "0 auto",
        padding: "40px 32px",
        alignItems: "start",
      }}
        className="max-lg:grid-cols-1"
      >

        {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Schedule card */}
          <div style={{
            background: "var(--surface-2)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderTop: "3px solid var(--red)",
          }}>
            {/* Card header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <SectionHeading icon={<IcoFlame />} label="Workout Schedule" />
              <div style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: "0.2em",
                color: wordCount > 0 ? "var(--red)" : "rgba(255,255,255,0.2)",
                textTransform: "uppercase",
                background: wordCount > 0 ? "var(--red-dim)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${wordCount > 0 ? "rgba(232,32,14,0.3)" : "rgba(255,255,255,0.06)"}`,
                padding: "3px 10px",
              }}>
                {wordCount} words
              </div>
            </div>

            {/* Textarea */}
            <div style={{ padding: "20px 24px 24px" }}>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="textarea-gym"
                style={{ minHeight: 280 }}
                placeholder={`Paste workout schedule here...\n\nExample:\n1. Barbell Back Squat — 4 sets × 8, 8, 6, 6 reps\n2. Romanian Deadlift — 3 sets × 10 reps\n3. Leg Press — 3 sets × 12, 10, 10 reps\n4. Bulgarian Split Squat — 3 × 10 reps per leg\n5. Calf Raises — 4 × 15 reps`}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.1em" }}>
                  ANY FORMAT — AI HANDLES THE REST
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
                  {text.length} chars
                </span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(232,32,14,0.08)",
              border: "1px solid rgba(232,32,14,0.25)",
              borderLeft: "4px solid var(--red)",
              padding: "12px 18px", color: "#ff8a7a",
              fontSize: 14, fontFamily: "'Rajdhani', sans-serif",
            }}>
              <IcoAlert /> {error}
            </div>
          )}

          {/* Tip card */}
          <div style={{
            background: "transparent",
            border: "1px dashed rgba(255,255,255,0.08)",
            padding: "14px 20px",
            display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <IcoTarget style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
              <span style={{ color: "var(--red)", fontWeight: 700 }}>PRO TIP —</span>{" "}
              Include exercise name, sets, and reps per set. Weight, rest time, and notes are fine too — the AI extracts what matters.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Session details card */}
          <div style={{
            background: "var(--surface-2)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderTop: "3px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <SectionHeading icon={<IcoUser />} label="Session Details" />
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Oswald',sans-serif", letterSpacing: "0.15em", marginTop: -8 }}>
                PRINTED IN PDF HEADER
              </p>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
              <FieldRow label="Client Name">
                <Input className="input-gym" placeholder="e.g. Alex Johnson" value={clientName} onChange={e => setClientName(e.target.value)} />
              </FieldRow>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FieldRow label="Age">
                  <Input className="input-gym" placeholder="e.g. 28" value={age} onChange={e => setAge(e.target.value)} />
                </FieldRow>
                <FieldRow label="Date">
                  <Input className="input-gym" placeholder="e.g. 2024-05-17" value={date} onChange={e => setDate(e.target.value)} />
                </FieldRow>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <FieldRow label="Height">
                  <Input className="input-gym" placeholder="e.g. 180cm" value={height} onChange={e => setHeight(e.target.value)} />
                </FieldRow>
                <FieldRow label="Weight">
                  <Input className="input-gym" placeholder="e.g. 80kg" value={weight} onChange={e => setWeight(e.target.value)} />
                </FieldRow>
                <FieldRow label="BMI">
                  <Input className="input-gym" placeholder="e.g. 24.7" value={bmi} onChange={e => setBmi(e.target.value)} />
                </FieldRow>
              </div>
              
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "2px 0" }} />

              <FieldRow label="Trainer Name">
                <Input className="input-gym" placeholder="e.g. Coach Marcus" value={trainerName} onChange={e => setTrainerName(e.target.value)} />
              </FieldRow>
              <FieldRow label="Program Name">
                <Input className="input-gym" placeholder="e.g. Hypertrophy Block A" value={programName} onChange={e => setProgramName(e.target.value)} />
              </FieldRow>
              <FieldRow label="Phase / Week">
                <Input className="input-gym" placeholder="e.g. Phase 1 · Week 3" value={phase} onChange={e => setPhase(e.target.value)} />
              </FieldRow>
              <FieldRow label="Workout Period">
                <Input className="input-gym" placeholder="e.g. 4 Weeks" value={workoutPeriod} onChange={e => setWorkoutPeriod(e.target.value)} />
              </FieldRow>
            </div>
          </div>

          {/* GENERATE BUTTON */}
          {!scheduleData ? (
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              style={{
                width: "100%", height: 62,
                background: canAnalyze ? "var(--red)" : "rgba(255,255,255,0.05)",
                color: canAnalyze ? "#fff" : "rgba(255,255,255,0.2)",
                border: "none",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 18, fontWeight: 700, letterSpacing: "0.25em",
                textTransform: "uppercase",
                cursor: canAnalyze ? "pointer" : "not-allowed",
                clipPath: "polygon(0 0, 100% 0, 100% 78%, 96% 100%, 0 100%)",
                position: "relative", overflow: "hidden",
                transition: "background 0.2s, color 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              {canAnalyze && (
                <span style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                  animation: "shimmer 2.2s ease-in-out infinite",
                }} />
              )}
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                {isLoading ? (
                  <><IcoSpin />Analyzing...</>
                ) : (
                  <><IcoFlame />Analyze Schedule</>
                )}
              </span>
            </button>
          ) : (
            <button
              onClick={handleGeneratePdf}
              disabled={isLoading}
              style={{
                width: "100%", height: 62,
                background: "var(--red)",
                color: "#fff",
                border: "none",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 18, fontWeight: 700, letterSpacing: "0.25em",
                textTransform: "uppercase",
                cursor: isLoading ? "not-allowed" : "pointer",
                clipPath: "polygon(0 0, 100% 0, 100% 78%, 96% 100%, 0 100%)",
                position: "relative", overflow: "hidden",
                transition: "background 0.2s, color 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              <span style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                animation: "shimmer 2.2s ease-in-out infinite",
              }} />
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                {isLoading ? (
                  <><IcoSpin />Building PDF...</>
                ) : (
                  <><IcoDownload />Generate PDF</>
                )}
              </span>
            </button>
          )}

          {/* How it works */}
          <div style={{
            background: "var(--surface-2)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{
              padding: "16px 24px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <SectionHeading icon={<IcoTarget />} label="How It Works" />
            </div>
            <div style={{ padding: "4px 24px 16px" }}>
              <StepRow n="01" title="Fill session info" desc="Client, trainer, program & phase — all printed in the PDF header." />
              <StepRow n="02" title="Paste the schedule" desc="Dump raw text. Sets, reps, exercises — any format works." />
              <StepRow n="03" title="Hit generate" desc="AI structures the data. PDF downloads straight to your device." />
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(8,8,10,0.9)",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span className="font-impact" style={{ fontSize: 16, letterSpacing: "0.08em", color: "var(--red)" }}>
          IRONSCRIPT
        </span>
        <span className="font-oswald" style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
          Trainer Edition · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}