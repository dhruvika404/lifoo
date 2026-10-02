"use client";

import React, { useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Bell,
  Megaphone,
  Smartphone,
  Send,
  MoreVertical,
  Eye,
  Trash2,
  Copy,
  Users,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, StatCard } from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import toast from "react-hot-toast";

// Static mock data
const MOCK_NOTIFICATIONS = [
  {
    id: "NOT-9012",
    title: "Weekend Special: 50% Off 🍔",
    message: "Order your favorite meals this weekend and get a flat 50% discount on all...",
    audience: "ALL_CUSTOMERS",
    type: "PROMOTIONAL",
    status: "SENT",
    sentAt: "2024-05-12T18:00:00Z",
    reach: 12450,
    openRate: "24.5%",
  },
  {
    id: "NOT-9011",
    title: "System Maintenance Alert",
    message: "The platform will be down for scheduled maintenance at 2 AM tonight.",
    audience: "ALL_USERS",
    type: "SYSTEM",
    status: "SCHEDULED",
    sentAt: "2024-05-13T02:00:00Z",
    reach: 0,
    openRate: "-",
  },
  {
    id: "NOT-9010",
    title: "New Chef Bonus Structure",
    message: "Check out our updated payout structure for the festival season!",
    audience: "CHEFS_ONLY",
    type: "ANNOUNCEMENT",
    status: "SENT",
    sentAt: "2024-05-10T10:30:00Z",
    reach: 450,
    openRate: "89.2%",
  },
  {
    id: "NOT-9009",
    title: "Rain Surge Pricing Active",
    message: "High demand in your area. Extra delivery partner earnings applied.",
    audience: "DELIVERY_PARTNERS",
    type: "ALERT",
    status: "SENT",
    sentAt: "2024-05-09T14:15:00Z",
    reach: 820,
    openRate: "92.1%",
  },
  {
    id: "NOT-9008",
    title: "Welcome to LiFoo! 🎉",
    message: "We're glad you're here. Use code WELCOME to get free delivery on...",
    audience: "NEW_CUSTOMERS",
    type: "AUTOMATED",
    status: "ACTIVE",
    sentAt: "2024-05-01T00:00:00Z",
    reach: 3450,
    openRate: "41.8%",
  },
];

export function NotificationsModule() {
  const [searchVal, setSearchVal] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const activeFiltersCount = [
    typeFilter !== "all",
    statusFilter !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchVal("");
    setTypeFilter("all");
    setStatusFilter("all");
    toast.success("Filters cleared");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "SCHEDULED":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "ACTIVE":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PROMOTIONAL":
        return <Megaphone className="h-3 w-3 mr-1 text-pink-500" />;
      case "SYSTEM":
        return <AlertCircle className="h-3 w-3 mr-1 text-red-500" />;
      case "ANNOUNCEMENT":
        return <Bell className="h-3 w-3 mr-1 text-blue-500" />;
      case "ALERT":
        return <Smartphone className="h-3 w-3 mr-1 text-orange-500" />;
      default:
        return <Send className="h-3 w-3 mr-1 text-muted-foreground" />;
    }
  };

  // Need to import AlertCircle as it was missing in my manual import list above, let's use Bell as fallback for SYSTEM
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PROMOTIONAL":
        return "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20";
      case "SYSTEM":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "ANNOUNCEMENT":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "ALERT":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "AUTOMATED":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <>
      <PageHeader
        title="Push Notifications"
        description="Create, schedule, and analyze push notification campaigns sent to customers, chefs, and drivers."
        actions={
          <Button
            onClick={() => toast.success("Opening notification composer...")}
            className="bg-[#2d7a4f] hover:bg-[#236040] text-white gap-1.5 font-semibold shadow-sm transition-all"
          >
            <Send className="h-4 w-4" />
            New Campaign
          </Button>
        }
      />

      <PageBody>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
          <StatCard
            label="Total Campaigns"
            value={142}
            hint="All-time push notifications"
            accent
          />
          <StatCard
            label="Active Automations"
            value={8}
            hint="Trigger-based alerts"
          />
          <StatCard
            label="Total Reach"
            value="89.4k"
            hint="Users successfully notified"
          />
          <StatCard
            label="Avg Open Rate"
            value="34.2%"
            hint="Across all promotional campaigns"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-3xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns by title..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="pl-9 pr-8 h-10 rounded-lg border-border/60 bg-background focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all text-sm w-full"
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 border-border/60 hover:bg-muted text-foreground transition-all shrink-0 gap-2 font-medium relative cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2d7a4f] text-[10px] font-bold text-white leading-none">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col justify-between h-full">
                <div className="flex-1 overflow-y-auto pr-1">
                  <SheetHeader className="pb-6 border-b border-border">
                    <SheetTitle className="text-lg font-semibold text-foreground">Filter Notifications</SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      Refine the list by notification type or status.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full h-10 border-border/60">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="SENT">Sent</SelectItem>
                          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                          <SelectItem value="ACTIVE">Active (Automated)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full h-10 border-border/60">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
                          <SelectItem value="SYSTEM">System</SelectItem>
                          <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                          <SelectItem value="ALERT">Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    disabled={activeFiltersCount === 0 && !searchVal}
                    className="flex-1 h-10 font-semibold cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {(activeFiltersCount > 0 || searchVal) && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="h-10 text-xs font-semibold text-[#2d7a4f] hover:text-[#236040] hover:bg-emerald-500/5 gap-1 shrink-0 cursor-pointer"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        <div className="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-xs uppercase font-semibold">
                  <th className="py-3.5 px-4 w-64">Campaign Title</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Audience</th>
                  <th className="py-3.5 px-4 w-32">Type</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-36">Sent Date</th>
                  <th className="py-3.5 px-4 w-24 text-right">Reach</th>
                  <th className="py-3.5 px-4 w-24 text-right">Opens</th>
                  <th className="py-3.5 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_NOTIFICATIONS.map((notif) => (
                  <tr
                    key={notif.id}
                    className="group hover:bg-muted/10 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-foreground text-sm flex items-center">
                          {notif.title}
                        </span>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                          {notif.message}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                          {notif.audience.replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className={`font-semibold px-2 py-0.5 border ${getTypeBadge(notif.type)}`}>
                        {notif.type}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="outline" className={`font-semibold px-2 py-0.5 border ${getStatusBadge(notif.status)}`}>
                        {notif.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
                      {new Date(notif.sentAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium">
                      {notif.reach > 0 ? notif.reach.toLocaleString() : "-"}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium">
                      {notif.openRate}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-44 p-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-foreground cursor-pointer rounded-md"
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            View Analytics
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success("Notification duplicated");
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-foreground cursor-pointer rounded-md"
                          >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            Duplicate
                          </button>

                          {notif.status === "SCHEDULED" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.error("Campaign cancelled");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-left text-rose-600 hover:text-rose-700 cursor-pointer rounded-md"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                              Cancel Campaign
                            </button>
                          )}
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={1}
            totalPages={4}
            limit={10}
            onPageChange={(page) => { }}
            onLimitChange={(val) => { }}
          />
        </div>
      </PageBody>
    </>
  );
}
