import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IronScript — Trainer PDF Generator",
  description: "Turn workout schedules into professional PDF documents instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}