"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ChefHat,
  ShieldCheck,
  Package,
  Tags,
  Clock,
  Zap,
  ShoppingBag,
  Truck,
  Radio,
  Wallet,
  RotateCcw,
  Banknote,
  Ticket,
  Star,
  LifeBuoy,
  Bell,
  BarChart3,
  MapPin,
  UserCog,
  Settings,
  ScrollText,
  User,
  LogOut,
  IndianRupee,
} from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  module?: string;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const groups: SidebarGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { title: "Customers", url: "/customers", icon: Users, module: "USER_ACCESS" },
      { title: "Chefs", url: "/chefs", icon: ChefHat, module: "CHEF" },
      { title: "Verification", url: "/verifications", icon: ShieldCheck, module: "CHEF" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", url: "/products", icon: Package, module: "CATALOG" },
      { title: "Categories", url: "/categories", icon: Tags, module: "CATALOG" },
      { title: "Attributes", url: "/attributes", icon: Zap, module: "CATALOG" },
      { title: "Slots", url: "/slots", icon: Clock, module: "SLOT" },
    ],
  },
  {
    label: "Operations",
    items: [
      // { title: "Instant Orders", url: "/instant-orders", icon: Zap, module: "ORDER" }, // TODO: re-enable when ready
      { title: "Orders", url: "/orders", icon: ShoppingBag, module: "ORDER" },
      { title: "Delivery", url: "/delivery", icon: Truck, module: "DELIVERY" },
      { title: "Live Streams", url: "/streams", icon: Radio, module: "CHEF" },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Wallet", url: "/wallet", icon: Wallet, module: "WALLET" },
      { title: "Refunds & Disputes", url: "/refunds", icon: RotateCcw, module: "FINANCE" },
      { title: "Payouts & Settlement", url: "/finance", icon: Banknote, module: "FINANCE" },
    ],
  },
  {
    label: "Growth",
    items: [
      { title: "Coupons & Promotions", url: "/coupons", icon: Ticket, module: "CATALOG" },
      { title: "Review Moderation", url: "/reviews", icon: Star, module: "REVIEW" },
      { title: "Customer Support", url: "/support", icon: LifeBuoy, module: "USER_ACCESS" },
      // { title: "Notifications", url: "/notifications", icon: Bell, module: "USER_ACCESS" },
    ],
  },
  // {
  //   label: "Insights",
  //   items: [{ title: "Analytics & Reports", url: "/analytics", icon: BarChart3, module: "FINANCE" }],
  // },
  {
    label: "Platform",
    items: [
      { title: "Cities & Zones", url: "/cities", icon: MapPin, module: "DELIVERY" },
      { title: "Admin Users", url: "/admins", icon: UserCog, module: "USER_ACCESS" },
      { title: "Access Roles", url: "/roles", icon: ShieldCheck, module: "USER_ACCESS" },
      { title: "Pricing Config", url: "/pricing", icon: IndianRupee, module: "SEAL" },
      // { title: "System Settings", url: "/settings", icon: Settings, module: "SEAL" },
      { title: "Audit Logs", url: "/audit-logs", icon: ScrollText, module: "USER_ACCESS" },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "", ...props }: SidebarProps & React.ComponentProps<typeof ShadcnSidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { currentUserRole, roles, fetchRoles } = useAdminStore();
  const { state, setOpenMobile, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Fetch roles list if not loaded, to support live RBAC simulation switching
  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [roles, fetchRoles]);

  const handleSignOut = () => {
    logout();
    router.replace("/login");
  };

  // Helper to determine if a module should be visible based on active role permissions
  const hasModuleAccess = (moduleName?: string) => {
    if (!moduleName) return true; // Items without a module are always visible (like Dashboard)

    const activeRole = user?.roles?.[0] || currentUserRole || "Super Admin";
    const normActiveRole = String(activeRole).toLowerCase().replace(/[-_\s]/g, "");

    // Super Admin bypass: see all modules
    if (normActiveRole === "superadmin" || normActiveRole === "super admin") {
      return true;
    }

    // 1. Check if the active role matches a fetched role structure
    if (roles.length > 0) {
      const matchedRoleObj = roles.find(
        (r) =>
          r.id === activeRole ||
          String(r.name).toLowerCase().replace(/[-_\s]/g, "") === normActiveRole
      );
      if (matchedRoleObj) {
        const perm = matchedRoleObj.permissions?.find(
          (p) => p.module.toUpperCase() === moduleName.toUpperCase()
        );
        if (perm) {
          return perm.read || perm.create || perm.update || perm.delete;
        }
        return false;
      }
    }

    // 2. Fallback: Check if the logged-in user object has direct permissions
    if (user?.permissions) {
      // If user.permissions is a record/object
      if (typeof user.permissions === "object" && !Array.isArray(user.permissions)) {
        const perm = user.permissions[moduleName.toUpperCase()] || user.permissions[moduleName];
        if (perm) {
          return perm.read || perm.create || perm.update || perm.delete;
        }
      }
      // If user.permissions is an array (fallback case)
      if (Array.isArray(user.permissions)) {
        const perm = (user.permissions as any[]).find(
          (p) => p.module?.toUpperCase() === moduleName.toUpperCase()
        );
        if (perm) {
          return perm.read || perm.create || perm.update || perm.delete;
        }
      }
    }

    return false;
  };

  // Filter groups to only show items the user has access to,
  // and hide groups that end up with no visible items.
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasModuleAccess(item.module)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <ShadcnSidebar collapsible="icon" className={className} {...props}>
      {/* Logo Header */}
      <SidebarHeader className={`h-16 border-b border-sidebar-border flex flex-row items-center justify-between px-4 gap-2 shrink-0 ${isCollapsed ? "justify-center px-2" : ""}`}>
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 overflow-hidden ${isCollapsed ? "justify-center" : ""}`}
          onClick={() => {
            if (isMobile) {
              setOpenMobile(false);
            }
          }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-md">
            L
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">LiFoo</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 whitespace-nowrap">
                Admin Panel
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-1.5 py-2 scrollbar-hide">
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            <SidebarGroupLabel className="text-[10px] font-bold text-sidebar-foreground/45 uppercase tracking-wider px-2.5">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url + "/"));
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`transition-colors duration-200 ${isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground font-medium shadow-xs"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                      >
                        <Link
                          href={item.url}
                          onClick={() => {
                            if (isMobile) {
                              setOpenMobile(false);
                            }
                          }}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60"}`} />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* User Info Footer */}
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar-accent/10 p-2 shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={`flex items-center gap-2.5 p-1 rounded-lg ${isCollapsed ? "justify-center" : ""}`}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border/30 shadow-xs">
                <User className="h-4.5 w-4.5" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 flex flex-col leading-tight">
                  <span className="truncate text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-wider">
                    {user ? (user.name || user.email.split("@")[0]) : "Simulated User"}
                  </span>
                  <span className="truncate text-xs font-semibold text-sidebar-foreground">
                    {(() => {
                      const r = user?.roles?.[0] || currentUserRole;
                      if (!r) return "";
                      if (typeof r === "object") return (r as any).name || (r as any).id || "";
                      return String(r);
                    })()}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="h-7 w-7 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {isCollapsed && (
              <div className="mt-2 flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="h-8 w-8 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer rounded-lg border border-sidebar-border/30"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </ShadcnSidebar>
  );
}
