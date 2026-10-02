"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/store/adminStore";
import { useAuthStore } from "@/store/authStore";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  const router = useRouter();
  const { currentUserRole, admins } = useAdminStore();
  const { user, logout } = useAuthStore();

  // Find the details of the active role from admins or use logged-in user details
  const adminDetails = admins.find((a) => a.email === user?.email);
  const displayName = adminDetails?.name || user?.name || user?.email?.split("@")[0] || "Anjali Verma";
  const rawRole = user?.roles?.[0] || currentUserRole || "Super Admin";
  const userRole = typeof rawRole === "object" && rawRole !== null
    ? (rawRole as any).name || (rawRole as any).id || ""
    : String(rawRole);

  const initials = displayName
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card/95 backdrop-blur-md px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8" />
        <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
          LiFoo Operations
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/notifications")}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4.5 w-4.5" />
        </Button>
        <div className="flex items-center gap-2 px-2 py-1 border-l border-r border-border/40">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
            {initials}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-semibold text-foreground">
              {displayName}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {userRole}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-4.5 w-4.5" />
        </Button>
      </div>
    </header>
  );
}
