"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";

interface WorkoutRow {
  no: number;
  exercise: string;
  sets: number | string;
  reps: number[];
}

export default function Home() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGeneratePdf = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate schedule");
      }

      generatePdf(data.schedule);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePdf = (scheduleData: WorkoutRow[]) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Workout Schedule", 14, 22);

    const tableColumn = ["No", "Exercise", "Sets", "Reps"];
    const tableRows: any[][] = [];

    scheduleData.forEach((row) => {
      const sortedReps = [...row.reps].sort((a, b) => b - a);
      const rowData = [
        row.no.toString(),
        row.exercise,
        row.sets.toString(),
        sortedReps.join(", "),
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: "#1f3a5e", // Navy Blue
        textColor: "#ffffff", // White
      },
      styles: {
        lineColor: "#000000", // Black
        textColor: "#000000", // Black text for the table body
        cellPadding: 4, // Increased padding for all cells
      },
    });

    doc.save(`workout-schedule-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto flex flex-col font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">Workout Schedule PDF Generator</h1>
      
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Paste your plain text workout schedule below. The AI will format it and generate a downloadable PDF summary table.
      </p>

      <textarea
        className="w-full h-64 p-4 border rounded-md mb-4 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste your workout text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleGeneratePdf}
        disabled={isLoading || !text.trim()}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? "Processing & Generating PDF..." : "Generate PDF Download"}
      </button>
    </main>
  );
}
