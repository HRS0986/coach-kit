import { SiteHeader } from "@/components/site-header";
import { AuthProvider } from "@/lib/auth-context";
import type { Metadata } from "next";
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
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}