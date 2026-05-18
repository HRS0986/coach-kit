"use client";

import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function HeaderAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading || !user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-slate-600">
        {user.displayName || user.email}
      </span>
      <Button variant="ghost" onClick={handleLogout} className="text-slate-500 hover:text-slate-900 h-9">
        <LogOut className="w-4 h-4 mr-2" /> Log Out
      </Button>
    </div>
  );
}