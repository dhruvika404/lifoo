"use client";

import React, { useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  Star,
  StarHalf,
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
const MOCK_REVIEWS = [
  {
    id: "REV-1049",
    user: "Rahul Sharma",
    avatar: "RS",
    target: "Chef Sanjeev",
    targetType: "CHEF",
    rating: 5,
    comment: "Absolutely amazing food! The spices were just perfect and delivery was on time.",
    status: "PENDING",
    date: "2024-05-12T10:30:00Z",
  },
  {
    id: "REV-1048",
    user: "Anita Desai",
    avatar: "AD",
    target: "Paneer Tikka Masala",
    targetType: "FOOD",
    rating: 4,
    comment: "Very tasty but slightly oily. Will order again though.",
    status: "APPROVED",
    date: "2024-05-11T19:15:00Z",
  },
  {
    id: "REV-1047",
    user: "Vikram Singh",
    avatar: "VS",
    target: "Chef Priya",
    targetType: "CHEF",
    rating: 2,
    comment: "Food arrived cold and the portion size was very small for the price.",
    status: "REJECTED",
    date: "2024-05-10T14:45:00Z",
  },
  {
    id: "REV-1046",
    user: "Megha Gupta",
    avatar: "MG",
    target: "Hyderabadi Biryani",
    targetType: "FOOD",
    rating: 5,
    comment: "Best biryani I've had in the city. Authentic taste and generous portion.",
    status: "PENDING",
    date: "2024-05-10T12:00:00Z",
  },
  {
    id: "REV-1045",
    user: "Karan Patel",
    avatar: "KP",
    target: "Chef Rohan",
    targetType: "CHEF",
    rating: 1,
    comment: "Terrible experience. Instructions were completely ignored.",
    status: "PENDING",
    date: "2024-05-09T20:20:00Z",
  },
];

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
};

export function ReviewModerationModule() {
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const activeFiltersCount = [
    statusFilter !== "all",
    ratingFilter !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchVal("");
    setStatusFilter("all");
    setRatingFilter("all");
    toast.success("Filters cleared");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <>
      <PageHeader
        title="Review Moderation"
        description="Monitor, approve, or reject customer reviews for chefs and food items across the platform."
      />

      <PageBody>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
          <StatCard
            label="Total Reviews"
            value={12450}
            hint="All-time customer reviews"
            accent
          />
          <StatCard
            label="Pending Moderation"
            value={342}
            hint="Requires admin action"
          />
          <StatCard
            label="Average Rating"
            value="4.2"
            hint="Platform-wide average"
          />
          <StatCard
            label="Rejected"
            value={89}
            hint="Reviews failing guidelines"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center flex-1 gap-3 max-w-3xl">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by keyword, user, or target..."
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
                    <SheetTitle className="text-lg font-semibold text-foreground">Filter Reviews</SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      Refine the list of reviews by status or rating.
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
                          <SelectItem value="PENDING">Pending Moderation</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rating</label>
                      <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="w-full h-10 border-border/60">
                          <SelectValue placeholder="All Ratings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="1">1 Star</SelectItem>
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
                  <th className="py-3.5 px-4 w-32">Review ID</th>
                  <th className="py-3.5 px-4 w-48">Customer Info</th>
                  <th className="py-3.5 px-4 w-48">Target</th>
                  <th className="py-3.5 px-4 min-w-[250px]">Comment</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-36">Date</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {MOCK_REVIEWS.map((review, index) => {
                  const isLastTwo = index >= MOCK_REVIEWS.length - 2 && MOCK_REVIEWS.length > 2;
                  return (
                    <tr
                      key={review.id}
                      className="group hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {review.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                            {review.avatar}
                          </div>
                          <span className="font-semibold text-foreground leading-snug">
                            {review.user}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-foreground text-sm">
                            {review.target}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                            {review.targetType}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5">
                          <RatingStars rating={review.rating} />
                          <p className="text-xs text-foreground/80 line-clamp-2 max-w-md">
                            "{review.comment}"
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="outline" className={`font-medium px-2 py-0.5 border ${getStatusBadge(review.status)}`}>
                          {review.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
                        {new Date(review.date).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="relative inline-block text-left">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === review.id ? null : review.id);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {activeMenuId === review.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30 bg-black/5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                }}
                              />
                              <div className={`absolute right-0 w-40 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg py-1 z-40 animate-in fade-in duration-100 text-left ${isLastTwo
                                ? "bottom-full mb-1 slide-in-from-bottom-1"
                                : "mt-1 slide-in-from-top-1"
                                }`}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    toast.success("Review Approved");
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-emerald-600 cursor-pointer"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    toast.error("Review Rejected");
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-red-600 cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
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
                                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                  View Full Detail
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors text-destructive hover:bg-destructive/5 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  Delete
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
            totalPages={3}
            limit={10}
            onPageChange={(page) => {}}
            onLimitChange={(val) => {}}
          />
        </div>
      </PageBody>
    </>
  );
}
