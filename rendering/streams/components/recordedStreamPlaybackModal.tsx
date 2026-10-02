import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tv, Loader2, Ban, Flag, CheckCircle2 } from "lucide-react";
import { VideoQualitySelector } from "./videoQualitySelector";

export function RecordedStreamPlaybackModal({
  watchingRecordedStream,
  setWatchingRecordedStream,
  isLoadingRecordedPlayback,
  recordedStreamData,
  setFlaggingStream,
  setFlagReason,
  isResolving,
  handleResolveDispute,
}: any) {
  return (
    <Dialog open={!!watchingRecordedStream} onOpenChange={(open) => {
      if (!open) {
        setWatchingRecordedStream(null);
      }
    }}>
      <DialogContent className="sm:max-w-4xl transition-all duration-300">
        <DialogHeader className="flex flex-row items-center justify-between pr-6 border-b pb-3">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Tv className="h-5 w-5 text-[#2d7a4f]" />
              Playback — {watchingRecordedStream?.chef}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Recorded Session: {watchingRecordedStream?.sessionId} · Started at {watchingRecordedStream?.start}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {isLoadingRecordedPlayback ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground bg-slate-950 rounded-lg aspect-video">
              <Loader2 className="h-10 w-10 animate-spin text-[#2d7a4f]" />
              <p className="text-sm font-semibold">Loading playback data...</p>
            </div>
          ) : recordedStreamData?.recordingUrl ? (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border">
              <VideoQualitySelector />
              <video
                src={recordedStreamData?.recordingUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="p-12 border rounded-lg bg-slate-950 text-sm text-center flex flex-col items-center justify-center aspect-video text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-3 text-[#2d7a4f]" />
              <p>Processing stream recording or playback video not found yet...</p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-3 gap-2">
          <Button variant="outline" onClick={() => setWatchingRecordedStream(null)}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (watchingRecordedStream) {
                setFlaggingStream(watchingRecordedStream);
                setFlagReason("");
              }
            }}
          >
            <Flag className="h-4 w-4 mr-1.5" /> Flag Dispute
          </Button>
          <Button
            variant="destructive"
            disabled={isResolving === watchingRecordedStream?.sessionId}
            onClick={() => watchingRecordedStream && handleResolveDispute(watchingRecordedStream.sessionId)}
          >
            {isResolving === watchingRecordedStream?.sessionId ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
            )}
            Resolve Dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
