import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExerciseRow {
  no: number;
  exercise: string;
  sets: number | string;
  reps: number[];
}

export interface DaySchedule {
  dayName: string;
  exercises: ExerciseRow[];
}

export function buildPdf(
  days: DaySchedule[],
  opts: {
    clientName: string;
    trainerName: string;
    age?: string | number;
    height?: string | number;
    weight?: string | number;
    bmi?: string | number;
    workoutPeriod?: string;
    date?: string;
  }
) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const { clientName, trainerName, age, height, weight, bmi, workoutPeriod, date } = opts;

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
  doc.text("WORKOUT SCHEDULE", 13, 28);

  const phaseText = workoutPeriod ? workoutPeriod : "";
  if (phaseText) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(phaseText.toString().toUpperCase(), 13, 40);
  }

  const dateStr = date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(dateStr, W - 10, 11, { align: "right" });

  let tableBaseY = 68;
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
    tableBaseY = 100;
  }

  // Draw tables for each day
  days.forEach((day, index) => {
    // Start each new day on a new page
    if (index > 0) {
      doc.addPage();
      tableBaseY = 20;
    }

    // Print Day Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(day.dayName.toUpperCase(), 13, tableBaseY);
    tableBaseY += 5;

    autoTable(doc, {
      startY: tableBaseY,
      head: [["#", "EXERCISE", "SETS", "REPS"]],
      body: day.exercises.map((row, i) => [
        (i + 1).toString(), // Using array index or row.no
        row.exercise,
        row.sets.toString(),
        row.reps && row.reps.length > 0 ? [...row.reps].sort((a, b) => b - a).join(", ") : "",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: "#1f3a5e",
        textColor: "white",
        fontStyle: "bold",
        fontSize: 10,
        cellPadding: 4,
      },
      styles: {
        font: "helvetica",
        fontSize: 9,
        textColor: "black",
        cellPadding: 4,
        lineColor: "black",
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
      },
      margin: { left: 13, right: 13 },
      didDrawPage: (data) => {
        tableBaseY = data.cursor ? data.cursor.y + 15 : tableBaseY;
      }
    });
    
    // AutoTable updates its internal cursor, so we just use that for the next day iteration
    tableBaseY = (doc as any).lastAutoTable.finalY + 15;
  });

  const slug = clientName ? clientName.toString().replace(/\s+/g, "-").toLowerCase() : "client";
  doc.save(`${slug}-workout-schedule.pdf`);
}
