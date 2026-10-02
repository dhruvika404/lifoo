import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, Star, User, Phone, Mail, Globe } from "lucide-react";
import { ChefDetail } from "@/services";
import { formatLocale, getStatusIcon } from "./utils";
import toast from "react-hot-toast";

export function ChefAccountStats({ chef }: { chef: ChefDetail }) {
  return (
    <>
      <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Percent className="h-4 w-4 text-[#2d7a4f]" />
            Commission, Fees & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-5">
          <div className="space-y-2 p-3.5 rounded-xl bg-muted/20 border border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                Chef Rating
              </span>
              <span className="font-bold text-sm text-foreground">
                {chef.ratingAvg !== null && chef.ratingAvg !== undefined ? Number(chef.ratingAvg).toFixed(1) : "0.0"} / 5.0
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Rating Reviews</span>
              <span className="font-semibold text-foreground">{chef.ratingCount} reviews</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chef Commission</span>
              <span className="font-bold text-base text-foreground">{chef.commissionPct}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, chef.commissionPct))}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground block leading-tight">
              Percentage of order revenue retained by chef.
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/30">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Platform Fee</span>
              <span className="font-bold text-base text-foreground">{chef.platformFeePct}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2d7a4f] to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, chef.platformFeePct * 5))}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground block leading-tight">
              Platform services fee applied on operations.
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4 text-[#2d7a4f]" />
            User Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Chef User ID</span>
            <div className="font-mono text-xs bg-muted/50 p-2.5 rounded-lg select-all text-muted-foreground border border-border/30 flex items-center justify-between mt-1">
              <span className="truncate mr-2">{chef.userId}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(chef.userId);
                  toast.success("User ID copied!");
                }}
                className="text-[10px] text-[#2d7a4f] hover:underline font-semibold shrink-0 cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Phone Number</span>
            <div className="text-foreground font-semibold flex items-center gap-2 mt-1">
              <div className="p-1.5 rounded bg-muted/50 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <span>{chef.user?.phone || "N/A"}</span>
            </div>
          </div>

          {chef.alternatePhone && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Alternate Phone</span>
              <div className="text-foreground font-semibold flex items-center gap-2 mt-1">
                <div className="p-1.5 rounded bg-muted/50 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>{chef.alternatePhone}</span>
              </div>
            </div>
          )}

          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Email Address</span>
            <div className="text-foreground font-medium flex items-center gap-2 mt-1">
              <div className="p-1.5 rounded bg-muted/50 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
              </div>
              {chef.user?.email ? (
                <span className="select-all truncate">{chef.user.email}</span>
              ) : (
                <span className="text-muted-foreground italic text-xs">No email set</span>
              )}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Preferred Language</span>
            <div className="text-foreground font-medium flex items-center gap-2 mt-1">
              <div className="p-1.5 rounded bg-muted/50 text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
              </div>
              <span>{formatLocale(chef.user?.preferredLocale)}</span>
            </div>
          </div>

          <div className="space-y-1 pt-2.5 border-t border-border/30">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Account Status</span>
            <div className="flex items-center gap-2 mt-1.5">
              {getStatusIcon(chef.user?.status || "inactive")}
              <span className="capitalize font-bold text-sm text-foreground">
                {chef.user?.status || "inactive"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
