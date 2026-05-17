import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `Extract the workout schedule from the following text based on the provided JSON schema. Ensure sets and reps are converted properly. Group the exercises by days.
    
    If the schedule only says reps like "12 / 10 / 8 / 6", that implies 4 sets.
    Some exercises do not have sets or reps, in that case, put the given value in the sets column and keep reps column empty.
    
    Workout Schedule Text:
    ${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the client" },
            age: { type: Type.INTEGER, description: "Age of the client" },
            height: { type: Type.NUMBER, description: "Height of the client" },
            weight: { type: Type.NUMBER, description: "Weight of the client" },
            bmi: { type: Type.NUMBER, description: "Body Mass Index of the client" },
            workoutPeriod: { type: Type.STRING, description: "Workout period (e.g., '4 weeks')" },
            date: { type: Type.STRING, description: "Date of the workout schedule" },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayName: { type: Type.STRING, description: "Name of the day or split, e.g., 'Monday - Chest', 'Day 1'" },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        no: { type: Type.INTEGER, description: "Exercise number" },
                        exercise: { type: Type.STRING, description: "Exercise name" },
                        sets: { type: Type.STRING, description: "Set count, can be a number like '4' or a number with unit like '5 mins'" },
                        reps: { 
                            type: Type.ARRAY, 
                            items: { type: Type.INTEGER },
                            description: "Reps count per set" 
                        }
                      },
                      required: ["no", "exercise", "sets", "reps"],
                      description: "Array of workout exercises"
                    }
                  }
                },
                required: ["dayName", "exercises"]
              },
              description: "List of training days"
            }
          },
          required: ["days"]
        }
      }
    });

    const content = response.text;
    
    if (!content) {
        return NextResponse.json({ error: "No content returned from Gemini" }, { status: 500 });
    }

    // The result is already a JSON object matching exactly our schema (due to responseMimeType and responseSchema)
    const jsonOutput = JSON.parse(content);

    return NextResponse.json(jsonOutput);

  } catch (error) {
    console.error("Error formatting schedule:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
