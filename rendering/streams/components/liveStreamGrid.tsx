import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/pageShell";
import { Tv, Eye, Clock, Activity, Info, Ban } from "lucide-react";

export function LiveStreamGrid({
  filteredAndSortedStreams,
  setWatchingStream,
  setSuspendingStream,
}: any) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredAndSortedStreams.map((s: any) => (
        <Card key={s.id} className="group overflow-hidden border border-border/80 transition-all duration-300 hover:shadow-lg hover:border-[#2d7a4f]/20">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-950 to-emerald-950/20 opacity-90 transition-all duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />

            <div className="flex flex-col items-center gap-2 z-10 transition-transform duration-300 group-hover:scale-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2d7a4f]/10 border border-[#2d7a4f]/20 text-[#2d7a4f] animate-pulse">
                <Tv className="h-6 w-6" />
              </div>
              <span className="text-[10px] tracking-wider text-muted-foreground uppercase">Camera Feed Active</span>
            </div>

            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-destructive/95 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-white shadow-lg backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              <span className="h-2 w-2 rounded-full bg-white absolute left-2.5" />
              Live
            </div>

            <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white shadow-lg backdrop-blur-sm">
              <Eye className="h-3 w-3 text-sky-400" />
              <span>{s.viewers} watching</span>
            </div>

            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[9px] text-gray-300 backdrop-blur-sm">
              <Clock className="h-3 w-3 text-amber-400" />
              <span>Started {s.start}</span>
            </div>

            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
              <Button
                onClick={() => setWatchingStream(s)}
                size="sm"
                className="bg-[#2d7a4f] hover:bg-[#236040] text-white font-semibold transition-transform duration-300 hover:scale-105 cursor-pointer"
              >
                <Activity className="h-4 w-4 mr-1.5" /> Watch Stream
              </Button>
            </div>
          </div>

          <CardHeader className="p-4 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold group-hover:text-[#2d7a4f] transition-colors">{s.chef}</CardTitle>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Room: <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">{s.order}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Slot ID: <span className="font-mono text-gray-500">{s.slotId}</span>
                </div>
              </div>
              <StatusBadge value={s.health} />
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2 flex items-center justify-between gap-3 border-t border-muted/55 bg-muted/20">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-muted-foreground/80" />
              {s.health === "Healthy" ? "Broadcasting normally" : "Broadcasting status degraded"}
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs cursor-pointer"
                onClick={() => setWatchingStream(s)}
              >
                Inspect
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs font-medium cursor-pointer"
                onClick={() => {
                  setSuspendingStream(s);
                }}
              >
                <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
