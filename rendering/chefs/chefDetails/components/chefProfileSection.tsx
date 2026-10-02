import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Briefcase, User, Calendar, Phone, CheckCircle2, AlertTriangle } from "lucide-react";
import { ChefDetail } from "@/services";

export function ChefProfileSection({ chef }: { chef: ChefDetail }) {
  return (
    <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Info className="h-4 w-4 text-[#2d7a4f]" />
          Chef Bio & Personal Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {chef.bio && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Biography</span>
            <p className="text-sm text-foreground leading-relaxed bg-muted/10 p-4 rounded-xl border border-border/30 mt-1">
              {chef.bio}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {chef.experienceYears !== null && chef.experienceYears !== undefined && (
            <div className="space-y-1 bg-muted/15 p-3.5 rounded-xl border border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Experience</span>
              <div className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-[#2d7a4f]" />
                {chef.experienceYears} Years
              </div>
            </div>
          )}

          {chef.gender && (
            <div className="space-y-1 bg-muted/15 p-3.5 rounded-xl border border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Gender</span>
              <div className="text-sm font-semibold text-foreground mt-0.5 capitalize flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#2d7a4f]" />
                {chef.gender}
              </div>
            </div>
          )}

          {chef.dateOfBirth && (
            <div className="space-y-1 bg-muted/15 p-3.5 rounded-xl border border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Date of Birth</span>
              <div className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#2d7a4f]" />
                {new Date(chef.dateOfBirth).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </div>
            </div>
          )}

          {chef.alternatePhone && (
            <div className="space-y-1 bg-muted/15 p-3.5 rounded-xl border border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Alternate Phone</span>
              <div className="text-sm font-mono font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#2d7a4f]" />
                {chef.alternatePhone}
              </div>
            </div>
          )}

          {chef.gstNumber && (
            <div className="space-y-1 bg-muted/15 p-3.5 rounded-xl border border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">GST Number</span>
              <div className="text-sm font-mono font-bold text-foreground mt-0.5">
                {chef.gstNumber}
              </div>
            </div>
          )}

          <div className="space-y-1 bg-muted/15 p-3.5 rounded-xl border border-border/20">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Verification Status</span>
            <div className="text-sm text-foreground mt-0.5 flex items-center gap-1.5 font-semibold">
              {chef.verifiedAt ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{new Date(chef.verifiedAt).toLocaleDateString()}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-amber-600 font-medium">Pending Verification</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
