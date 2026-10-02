import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building } from "lucide-react";
import { ChefBankAccount } from "@/services";
import { getStatusColor } from "./utils";

export function ChefBankSection({ bankAccountsList }: { bankAccountsList: ChefBankAccount[] }) {
  return (
    <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#2d7a4f]" />
          Registered Bank Accounts ({bankAccountsList.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {bankAccountsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <CreditCard className="h-9 w-9 opacity-30 mb-2" />
            <p className="text-sm font-medium">No bank accounts registered yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccountsList.map((account) => (
              <div key={account.id} className="p-4 rounded-xl border border-border/40 bg-muted/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-[#2d7a4f]" />
                    <span className="font-bold text-sm text-foreground">{account.bankName}</span>
                    {account.branch && <span className="text-xs text-muted-foreground">({account.branch})</span>}
                    {account.isPrimary && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold border ${getStatusColor(account.approvalStatus)}`}>
                    {account.approvalStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-background/60 p-2.5 rounded-lg border border-border/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Account Holder</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{account.accountHolderName}</span>
                  </div>
                  <div className="bg-background/60 p-2.5 rounded-lg border border-border/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Account Number</span>
                    <span className="font-mono font-bold text-foreground mt-0.5 block select-all">
                      {account.accountNumber}
                    </span>
                  </div>
                  <div className="bg-background/60 p-2.5 rounded-lg border border-border/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">IFSC Code</span>
                    <span className="font-mono font-bold text-emerald-600 mt-0.5 block uppercase select-all">
                      {account.ifsc}
                    </span>
                  </div>
                </div>

                {account.rejectionReason && (
                  <div className="text-xs text-rose-600 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 mt-2">
                    <strong>Rejection Reason:</strong> {account.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
