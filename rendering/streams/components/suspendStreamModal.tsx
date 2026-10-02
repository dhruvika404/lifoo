import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban, Loader2 } from "lucide-react";

export function SuspendStreamModal({
  suspendingStream,
  setSuspendingStream,
  isSuspending,
  handleSuspendStream,
}: any) {
  return (
    <Dialog open={!!suspendingStream} onOpenChange={(open) => {
      if (!open) {
        setSuspendingStream(null);
      }
    }}>
      <DialogContent className="max-w-md border border-border bg-background shadow-2xl rounded-xl p-6">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Ban className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 text-center">
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
              Suspend Chef Stream?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to suspend the live stream for Chef <strong className="text-foreground">{suspendingStream?.chef}</strong> (Order: <strong className="text-foreground">{suspendingStream?.order}</strong>)? This will forcibly terminate the live feed session.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSuspendingStream(null)}
            disabled={isSuspending}
            className="h-10 rounded-lg border border-border hover:bg-muted text-foreground transition-all duration-200 font-medium flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSuspendStream}
            disabled={isSuspending}
            className="h-10 rounded-lg font-medium shadow-sm transition-all duration-200 flex-1 bg-destructive hover:bg-destructive/90"
          >
            {isSuspending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Suspending…
              </>
            ) : (
              "Suspend Stream"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
