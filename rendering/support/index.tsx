"use client";

import React, { useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  UserPlus,
  CheckCircle2,
  Clock,
  Ticket,
  Mail,
  Phone,
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
import toast from "react-hot-toast";

// Static mock data for design purposes
const MOCK_TICKETS = [
  {
    id: "TIC-8092",
    user: "Sunita Roy",
    email: "sunita.roy@example.com",
    subject: "Order never arrived",
    snippet: "I have been waiting for 2 hours but the delivery partner isn't picking up...",
    priority: "URGENT",
    status: "OPEN",
    lastUpdated: "2024-05-12T14:30:00Z",
  },
  {
    id: "TIC-8091",
    user: "Deepak Kumar",
    email: "deepak.k@example.com",
    subject: "Wrong items delivered",
    snippet: "I ordered Chicken Biryani but got Veg Pulao instead. Please refund or...",
    priority: "HIGH",
    status: "IN_PROGRESS",
    lastUpdated: "2024-05-12T13:15:00Z",
  },
  {
    id: "TIC-8090",
    user: "Snehil Das",
    email: "snehil.das@example.com",
    subject: "Coupon code not working",
    snippet: "The WELCOME50 coupon says invalid even though it's my first order...",
    priority: "NORMAL",
    status: "OPEN",
    lastUpdated: "2024-05-12T10:45:00Z",
  },
  {
    id: "TIC-8089",
    user: "Anjali Verma",
    email: "anjali.v@example.com",
    subject: "Change delivery address",
    snippet: "I accidentally placed the order to my office address instead of home...",
    priority: "HIGH",
    status: "RESOLVED",
    lastUpdated: "2024-05-11T20:00:00Z",
  },
  {
    id: "TIC-8088",
    user: "Prakash Singh",
    email: "prakash.singh@example.com",
    subject: "Feedback on Chef Ankit",
    snippet: "Just wanted to say the food was fantastic. Is there a way to tip the chef?",
    priority: "LOW",
    status: "RESOLVED",
    lastUpdated: "2024-05-11T16:20:00Z",
  },
];

export function CustomerSupportModule() {
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const activeFiltersCount = [
    statusFilter !== "all",
    priorityFilter !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchVal("");
    setStatusFilter("all");
    setPriorityFilter("all");
    toast.success("Filters cleared");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
      case "IN_PROGRESS":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500 text-white border-transparent";
      case "HIGH":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "NORMAL":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "LOW":
        return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <AlertCircle className="h-3 w-3 text-white mr-1" />;
      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader
        title="Customer Support"
        description="View and resolve customer support tickets, issues, and inquiries."
      />

      <PageBody>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
          <StatCard
            label="Open Tickets"
            value={24}
            hint="Awaiting response"
            accent
          />
          <StatCard
            label="In Progress"
            value={18}
            hint="Currently being handled"
          />
          <StatCard
            label="Resolved Today"
            value={42}
            hint="Successfully closed"
          />
          <StatCard
            label="Avg Response Time"
            value="15m"
            hint="Over the last 24 hours"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-3xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, subject, or email..."
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
                    <SheetTitle className="text-lg font-semibold text-foreground">Filter Tickets</SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      Refine the list of support tickets by status or priority.
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
                          <SelectItem value="OPEN">Open (Awaiting Response)</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-full h-10 border-border/60">
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
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
                  <th className="py-3.5 px-4 w-32">Ticket ID</th>
                  <th className="py-3.5 px-4 w-56">Customer</th>
                  <th className="py-3.5 px-4 min-w-[250px]">Subject & Details</th>
                  <th className="py-3.5 px-4 w-28 text-center">Priority</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-40">Last Updated</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_TICKETS.map((ticket, index) => {
                  const isLastTwo = index >= MOCK_TICKETS.length - 2 && MOCK_TICKETS.length > 2;
                  return (
                    <tr
                      key={ticket.id}
                      className="group hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-medium text-foreground">
                        {ticket.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-foreground leading-snug">
                            {ticket.user}
                          </span>
                          <span className="text-xs flex items-center text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {ticket.email}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-foreground text-sm flex items-center">
                            {ticket.subject}
                          </span>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                            {ticket.snippet}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="outline" className={`font-semibold px-2 py-0.5 border ${getPriorityBadge(ticket.priority)}`}>
                          {getPriorityIcon(ticket.priority)}
                          {ticket.priority}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="outline" className={`font-semibold px-2 py-0.5 border ${getStatusBadge(ticket.status)}`}>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          {new Date(ticket.lastUpdated).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="relative inline-block text-left">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === ticket.id ? null : ticket.id);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {activeMenuId === ticket.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30 bg-black/5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                }}
                              />
                              <div className={`absolute right-0 w-44 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg py-1 z-40 animate-in fade-in duration-100 text-left ${isLastTwo
                                ? "bottom-full mb-1 slide-in-from-bottom-1"
                                : "mt-1 slide-in-from-top-1"
                                }`}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-foreground cursor-pointer"
                                >
                                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                  Reply to User
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    toast.success("Ticket marked as Resolved");
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-emerald-600 cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Mark Resolved
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-foreground cursor-pointer"
                                >
                                  <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                                  Assign to Admin
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-foreground cursor-pointer"
                                >
                                  <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
                                  View Full Details
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={1}
            totalPages={8}
            limit={10}
            onPageChange={(page) => {}}
            onLimitChange={(val) => {}}
          />
        </div>
      </PageBody>
    </>
  );
}
