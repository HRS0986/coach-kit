import { Dumbbell } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachKit — Trainer PDF Generator",
  description: "Turn workout schedules into professional PDF documents instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Dumbbell className="w-5 h-5" /> 
              </div>
              <span className="font-bold text-xl text-[#1f3a5e] tracking-tight">CoachKit</span>
            </Link>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}