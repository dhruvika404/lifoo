import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2 } from "lucide-react";
import { ChefDetail } from "@/services";
import { isStepCompleted, getStatusIcon, formatStepKey, getStatusColor, formatStepStatus } from "./utils";

export function ChefOnboardingTracker({ chef }: { chef: ChefDetail }) {
  return (
    <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between gap-2 w-full">
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#2d7a4f]" />
            Compliance Tracker
          </span>
          {chef.onboarding && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider normal-case">
              Onboarding: {chef.onboarding.overallPercentage}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 relative">
        {chef.onboarding && (
          <div className="mb-6 p-3.5 rounded-xl bg-muted/15 border border-border/20">
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between text-[10px] font-semibold">
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Approved: {chef.onboarding.overallApprovedPercentage}%
                </span>
                <span className="text-amber-600 flex items-center gap-1">
                  Uploaded: {chef.onboarding.overallPercentage}%
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                </span>
              </div>
              <div className="h-2 w-full bg-secondary overflow-hidden rounded-full flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${chef.onboarding.overallApprovedPercentage}%` }}
                  title={`Approved: ${chef.onboarding.overallApprovedPercentage}%`}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, chef.onboarding.overallPercentage - chef.onboarding.overallApprovedPercentage)}%` }}
                  title={`Uploaded pending approval: ${Math.max(0, chef.onboarding.overallPercentage - chef.onboarding.overallApprovedPercentage)}%`}
                />
              </div>
            </div>
          </div>
        )}

        {chef.onboarding && chef.onboarding.sections ? (
          <div className="space-y-4">
            {Object.entries(chef.onboarding.sections).map(([sectionKey, sectionData]) => (
              <div key={sectionKey} className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-border/20">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{sectionKey}</h4>
                  <span className="text-[9px] text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-full">Appr: {sectionData.approvedPercentage}% | Upld: {sectionData.percentage}%</span>
                </div>
                {Object.entries(sectionData.items)
                  .filter(([key]) => key !== "_debugFields")
                  .map(([key, value]) => {
                  const completed = isStepCompleted(value);
                  return (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/30 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          getStatusIcon(value, "h-3.5 w-3.5")
                        )}
                        <span className="font-semibold text-foreground truncate">
                          {formatStepKey(key)}
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0.5 border font-medium shrink-0 ${getStatusColor(value)}`}>
                        {formatStepStatus(value, key)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No onboarding checklist data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
