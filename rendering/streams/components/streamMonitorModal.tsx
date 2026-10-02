import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Clock, Eye, Activity, MessageSquare, Loader2, Info, Ban } from "lucide-react";
import { LiveKitStreamPlayer } from "./liveKitPlayer";
import { VideoQualitySelector } from "./videoQualitySelector";

const mockChatMessages = [
  { user: "Aarav S.", text: "Looks extremely clean! Loving the transparency.", time: "1 min ago" },
  { user: "Priya M.", text: "Is that the butter chicken order?", time: "45s ago" },
  { user: "Rahul K.", text: "Amazing kitchen hygiene standards.", time: "30s ago" },
  { user: "Sneha G.", text: "The chef is wearing proper gloves and hairnets.", time: "Just now" },
];

export function StreamMonitorModal({
  watchingStream,
  setWatchingStream,
  isFullscreen,
  setIsFullscreen,
  isLoadingToken,
  tokenError,
  livekitToken,
  livekitUrl,
  setSuspendingStream,
}: any) {
  return (
    <Dialog open={!!watchingStream} onOpenChange={(open) => {
      if (!open) {
        setWatchingStream(null);
        setIsFullscreen(false);
      }
    }}>
      <DialogContent className={`sm:max-w-4xl transition-all duration-300 ${isFullscreen ? "max-w-full h-screen sm:max-w-full rounded-none" : ""}`}>
        <DialogHeader className="flex flex-row items-center justify-between pr-6 border-b pb-3">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              Streaming Monitor — {watchingStream?.chef}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Monitoring Live Stream Feed for Room {watchingStream?.order} · Started at {watchingStream?.start}
            </DialogDescription>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 ml-auto mr-2 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </DialogHeader>

        {watchingStream && (
          <div className={`grid gap-4 mt-3 ${isFullscreen ? "h-[calc(100vh-120px)] grid-rows-[1fr_auto]" : "grid-cols-1 lg:grid-cols-3"}`}>
            <div className={`lg:col-span-2 flex flex-col gap-3 ${isFullscreen ? "overflow-hidden" : ""}`}>
              <div className="relative flex-1 aspect-video min-h-[300px] rounded-lg bg-slate-950 flex flex-col justify-between overflow-hidden border border-slate-800">
                {isLoadingToken ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/90">
                    <Loader2 className="h-10 w-10 animate-spin text-[#2d7a4f]" />
                    <p className="text-sm font-semibold">Generating connection credentials...</p>
                  </div>
                ) : tokenError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/90 p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center">
                      <Info className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-destructive">Failed to connect to stream</p>
                    <p className="text-xs text-muted-foreground max-w-xs">{tokenError}</p>
                    <Button size="sm" variant="outline" onClick={() => {
                      const temp = watchingStream;
                      setWatchingStream(null);
                      setTimeout(() => setWatchingStream(temp), 50);
                    }} className="mt-2">
                      Retry Connection
                    </Button>
                  </div>
                ) : livekitToken && livekitUrl ? (
                  <LiveKitStreamPlayer token={livekitToken} serverUrl={livekitUrl} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/90">
                    <Loader2 className="h-10 w-10 animate-spin text-[#2d7a4f]" />
                    <p className="text-sm">Connecting to stream...</p>
                  </div>
                )}

                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-destructive/95 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-white shadow-lg backdrop-blur-sm z-20">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  <span className="h-2 w-2 rounded-full bg-white absolute left-2.5" />
                  Live
                </div>

                <div className="absolute right-3 top-3 flex items-center gap-2 z-30">
                  <div className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white shadow-lg backdrop-blur-sm">
                    <Eye className="h-3 w-3 text-sky-400" />
                    <span>{watchingStream.viewers} watching</span>
                  </div>
                  {!(isLoadingToken || tokenError) && (
                    <VideoQualitySelector className="" />
                  )}
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[9px] text-gray-300 backdrop-blur-sm z-20">
                  <Clock className="h-3 w-3 text-amber-400" />
                  <span>Started {watchingStream.start}</span>
                </div>

                {!(isLoadingToken || tokenError) && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
                    <span className="text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded text-sky-400 backdrop-blur-sm">RTMP / LiveKit</span>
                    <span className="text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded text-emerald-400 backdrop-blur-sm">CONNECTED</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="border rounded bg-muted/40 p-2 flex flex-col items-center">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">Frame Loss</span>
                  <span className="font-semibold mt-0.5 text-emerald-600 dark:text-emerald-400">0.02%</span>
                </div>
                <div className="border rounded bg-muted/40 p-2 flex flex-col items-center">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">Audio Codec</span>
                  <span className="font-semibold mt-0.5">AAC LC (48 kHz)</span>
                </div>
                <div className="border rounded bg-muted/40 p-2 flex flex-col items-center">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">Security</span>
                  <span className="font-semibold mt-0.5 text-emerald-600 dark:text-emerald-400">RTMPS Encrypted</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border rounded-lg bg-card p-4 overflow-hidden min-h-[350px]">
              <div className="flex flex-col flex-1 gap-2 min-h-0">
                <h4 className="font-semibold text-xs uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <MessageSquare className="h-3.5 w-3.5 text-[#2d7a4f]" /> User Live Chat
                </h4>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {mockChatMessages.map((m, idx) => (
                    <div key={idx} className="bg-muted/40 p-2.5 rounded-lg border border-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#2d7a4f]">{m.user}</span>
                        <span className="text-[9px] text-muted-foreground">{m.time}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 flex flex-col gap-2">
                <h4 className="font-semibold text-[11px] uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Telemetry Events
                </h4>
                <div className="font-mono text-[10px] bg-slate-950 text-slate-300 p-2.5 rounded border border-slate-800 space-y-1 overflow-y-auto h-24">
                  <div className="text-emerald-400">· [SYSTEM] RTMP Handshake Successful</div>
                  <div className="text-gray-400">· [VIDEO] H.264 stream detected (1080p)</div>
                  <div className="text-gray-400">· [AUDIO] AAC audio channel active</div>
                  <div className="text-emerald-400">· [MONITOR] Ping latency stable at 1.1s</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t pt-3 gap-2">
          <Button variant="outline" onClick={() => {
            setWatchingStream(null);
            setIsFullscreen(false);
          }}>
            Close Monitor
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (watchingStream) {
                const target = watchingStream;
                setWatchingStream(null);
                setIsFullscreen(false);
                setTimeout(() => {
                  setSuspendingStream(target);
                }, 150);
              }
            }}
          >
            <Ban className="h-4 w-4 mr-1.5" /> Suspend Stream
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
