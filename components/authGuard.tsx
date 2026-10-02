"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAdminStore } from "@/store/adminStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    console.log("[AuthGuard] useEffect: hasHydrated =", hasHydrated, "isAuthenticated =", isAuthenticated);
    // ← wait until Zustand has loaded from localStorage
    if (!hasHydrated) return;

    const verifySession = async () => {
      console.log("[AuthGuard] verifySession: Starting...");
      try {
        if (!isAuthenticated) {
          console.log("[AuthGuard] verifySession: Not authenticated, redirecting to /login...");
          router.replace("/login");
          return;
        }

        // access token may be missing (not persisted) — silently refresh
        console.log("[AuthGuard] verifySession: Authenticated, calling checkAuth...");
        await checkAuth();

        const authenticated = useAuthStore.getState().isAuthenticated;
        console.log("[AuthGuard] verifySession: After checkAuth, authenticated =", authenticated);
        if (!authenticated) {
          console.log("[AuthGuard] verifySession: Lost authentication, redirecting to /login...");
          router.replace("/login");
          return;
        }

        if (user?.roles?.length) {
          useAdminStore.getState().setCurrentUserRole(user.roles[0]);
        }
      } catch (err) {
        console.error("[AuthGuard] Session verification failed:", err);
        router.replace("/login");
      } finally {
        console.log("[AuthGuard] verifySession: Done, setting isVerifying to false");
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [hasHydrated]); // ← only run after hydration

  // ─── Loading ─────────────────────────────────────────────────
  if (!hasHydrated || isVerifying) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-radial from-primary/10 via-background to-background overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-primary/8 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-primary/4 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[8000ms]" />
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-xl shadow-primary/25 ring-4 ring-primary/10 select-none animate-pulse">
            L
          </div>
          <div className="flex items-center gap-2 text-muted-foreground/80 font-medium text-sm">
            <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
            <span>Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div className="relative flex min-h-screen w-full items-center justify-center bg-radial from-primary/10 via-background to-background" />;
  }

  return <>{children}</>;
}