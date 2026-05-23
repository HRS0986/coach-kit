import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExerciseRow {
    no: number;
    exercise: string;
    sets: number | string;
    reps: number[];
}

export interface DaySchedule {
    id: string;
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

    // Draw tables for each day
    days.forEach((day, index) => {
        // Start each new day on a new page
        if (index > 0) {
            doc.addPage();
        }

        let currentY = 20;

        // 1. Day name/label (centered horizontally)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 0, 0);
        const dayText = day.dayName ? day.dayName.toUpperCase() : `DAY ${index + 1}`;
        const dayTextWidth = doc.getTextWidth(dayText);
        doc.text(dayText, (W - dayTextWidth) / 2, currentY);
        doc.line(13, currentY + 5, W - 13, currentY + 5); // Underline the day name
        currentY += 10;

        // 2. Client details within a rectangle
        if (clientName || trainerName || age || height || weight || bmi || workoutPeriod || date) {
            const hasDetails = age || height || weight || bmi;
            const hasExtra = workoutPeriod || date;
            const rectHeight = hasDetails && hasExtra ? 40 : (hasDetails || hasExtra ? 28 : 20);

            doc.setFillColor(256, 256, 256); // Light background
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.rect(13, currentY, W - 26, rectHeight, "FD"); // Draw filled rectangle with border

            if (clientName) {
                doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
                doc.text("Client: ", 18, currentY + 10);
                doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
                doc.text(clientName, 35, currentY + 10);
            }

            if (trainerName) {
                doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
                doc.text("Trainer: ", W / 2, currentY + 10);
                doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
                doc.text(trainerName, W / 2 + 20, currentY + 10);
            }

            if (age) {
                doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
                doc.text("Age: ", 18, currentY + 18);
                doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
                doc.text(age.toString(), 35, currentY + 18);
            }

            if (height) {
                doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
                doc.text("Height: ", W / 2, currentY + 18);
                doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
                doc.text(height.toString(), W / 2 + 20, currentY + 18);
            }

            if (weight) {
                doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
                doc.text("Weight: ", 18, currentY + 26);
                doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
                doc.text(weight.toString(), 35, currentY + 26);
            }

            if (bmi) {
                doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
                doc.text("BMI: ", W / 2, currentY + 26);
                doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
                doc.text(bmi.toString(), W / 2 + 20, currentY + 26);
            }

            if (workoutPeriod) {
                doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
                doc.text("Period: ", 18, currentY + 34);
                doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
                doc.text(workoutPeriod.toString(), 35, currentY + 34);
            }

            if (date) {
                doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
                doc.text("Date: ", W / 2, currentY + 34);
                doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
                doc.text(date.toString(), W / 2 + 20, currentY + 34);
            }

            doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
            currentY += rectHeight + 5; // Move currentY below the rectangle for the table
        }

        // 3. Workout schedule table
        autoTable(doc, {
            startY: currentY + 10,
            head: [["No", "Exercise", "Sets", "Reps"]],
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
                fontSize: 14,
                cellPadding: 4,
            },
            styles: {
                font: "helvetica",
                fontSize: 12,
                textColor: "black",
                cellPadding: 4,
                fillColor: "#f4f4f4",
                lineColor: "black",
                lineWidth: 0.2,
            },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: "auto" },
                2: { cellWidth: 35 },
                3: { cellWidth: 35 },
            },
            margin: { left: 13, right: 13 },
        });
    });

    const slug = clientName ? clientName.toString().replace(/\s+/g, "-").toLowerCase() : "client";
    doc.save(`${slug}-workout-schedule.pdf`);
}
