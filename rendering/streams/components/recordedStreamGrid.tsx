import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tv, Clock, Activity, Flag, CheckCircle2, Loader2 } from "lucide-react";

export function RecordedStreamGrid({
  filteredRecordedStreams,
  chefs,
  setWatchingRecordedStream,
  setFlaggingStream,
  setFlagReason,
  isResolving,
  handleResolveDispute,
}: any) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredRecordedStreams.map((rs: any) => {
        const chef = chefs.find((c: any) => c.userId === rs.chefId || c.user?.id === rs.chefId);
        const chefName = rs.chefName || chef?.displayName || chef?.businessName || `Chef (${rs.chefId?.slice(0, 8) || "Unknown"})`;
        let start = "N/A";
        if (rs.createdAt) {
          const d = new Date(rs.createdAt);
          start = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        return (
          <Card key={rs.sessionId} className="group overflow-hidden border border-border/80 transition-all duration-300 hover:shadow-lg hover:border-[#2d7a4f]/20">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-950 cursor-pointer" onClick={() => setWatchingRecordedStream({ ...rs, chef: chefName, start })}>
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-950 to-emerald-950/20 opacity-90 transition-all duration-300 group-hover:scale-105" />

              <div className="flex flex-col items-center gap-2 z-10 transition-transform duration-300 group-hover:scale-95">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2d7a4f]/10 border border-[#2d7a4f]/20 text-[#2d7a4f]">
                  <Tv className="h-6 w-6" />
                </div>
                <span className="text-[10px] tracking-wider text-muted-foreground uppercase">Recorded Video</span>
              </div>

              <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-700/95 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-white shadow-lg backdrop-blur-sm">
                Recorded
              </div>

              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[9px] text-gray-300 backdrop-blur-sm">
                <Clock className="h-3 w-3 text-amber-400" />
                <span>{start}</span>
              </div>

              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                <Button
                  size="sm"
                  className="bg-[#2d7a4f] hover:bg-[#236040] text-white font-semibold transition-transform duration-300 hover:scale-105 cursor-pointer"
                >
                  <Activity className="h-4 w-4 mr-1.5" /> Watch Recording
                </Button>
              </div>
            </div>

            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold group-hover:text-[#2d7a4f] transition-colors">{chefName}</CardTitle>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Session ID: <span className="font-mono text-gray-500">{rs.sessionId}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex items-center justify-between gap-3 border-t border-muted/55 bg-muted/20">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                Recorded Stream
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs cursor-pointer"
                  onClick={() => setWatchingRecordedStream({ ...rs, chef: chefName, start })}
                >
                  Play
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-medium cursor-pointer"
                  onClick={() => { setFlaggingStream(rs); setFlagReason(""); }}
                >
                  <Flag className="h-3.5 w-3.5 mr-1" /> Flag
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs font-medium cursor-pointer"
                  disabled={isResolving === rs.sessionId}
                  onClick={() => handleResolveDispute(rs.sessionId)}
                >
                  {isResolving === rs.sessionId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  )}
                  Resolve
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
