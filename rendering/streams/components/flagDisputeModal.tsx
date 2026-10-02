import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Flag } from "lucide-react";

export function FlagDisputeModal({
  flaggingStream,
  setFlaggingStream,
  flagReason,
  setFlagReason,
  isFlagging,
  handleFlagDispute,
}: any) {
  return (
    <Dialog open={!!flaggingStream} onOpenChange={(open) => {
      if (!open) {
        setFlaggingStream(null);
        setFlagReason("");
      }
    }}>
      <DialogContent className="max-w-md border border-border bg-background shadow-2xl rounded-xl p-6">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 text-center">
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
              Flag Dispute
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Flagging session <strong className="text-foreground font-mono">{flaggingStream?.sessionId?.slice(0, 12)}…</strong>. Please provide a reason for the dispute.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="pt-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="flag-reason">
            Reason
          </label>
          <textarea
            id="flag-reason"
            rows={3}
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            placeholder="e.g. Inappropriate language used during the live stream"
            className="mt-1.5 w-full resize-none rounded-md border border-border bg-muted/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => { setFlaggingStream(null); setFlagReason(""); }}
            disabled={isFlagging}
            className="h-10 rounded-lg border border-border hover:bg-muted text-foreground transition-all duration-200 font-medium flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleFlagDispute}
            disabled={isFlagging || !flagReason.trim()}
            className="h-10 rounded-lg font-medium shadow-sm transition-all duration-200 flex-1 bg-destructive hover:bg-destructive/90"
          >
            {isFlagging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Flagging…
              </>
            ) : (
              <>
                <Flag className="h-4 w-4 mr-2" />
                Flag Dispute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
