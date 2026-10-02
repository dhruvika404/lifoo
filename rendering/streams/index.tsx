"use client";

import { useState, useMemo, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import toast from "react-hot-toast";
import { Search, Radio, Tv, RotateCw } from "lucide-react";
import { PageHeader, PageBody, StatCard } from "@/components/pageShell";
import { TablePagination } from "@/components/tablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { streamService } from "@/services";
import { useChefStore } from "@/store/chefStore";
import { useAuthStore } from "@/store/authStore";
import { useStreamStore } from "@/store/streamStore";
import { StreamMonitorModal } from "./components/streamMonitorModal";
import { RecordedStreamPlaybackModal } from "./components/recordedStreamPlaybackModal";
import { FlagDisputeModal } from "./components/flagDisputeModal";
import { SuspendStreamModal } from "./components/suspendStreamModal";
import { LiveStreamGrid } from "./components/liveStreamGrid";
import { RecordedStreamGrid } from "./components/recordedStreamGrid";

export function StreamsModule() {
  const {
    rawStreams,
    isLoadingStreams,
    errorStreams,
    limit,
    history,
    nextCursor,
    setLimit,
    fetchStreams,
    goToNextPage,
    goToPreviousPage,
    suspendStreamStore,
  } = useStreamStore(
    useShallow((state) => ({
      rawStreams: state.rawStreams,
      isLoadingStreams: state.isLoading,
      errorStreams: state.error,
      limit: state.limit,
      history: state.history,
      nextCursor: state.nextCursor,
      setLimit: state.setLimit,
      fetchStreams: state.fetchStreams,
      goToNextPage: state.goToNextPage,
      goToPreviousPage: state.goToPreviousPage,
      suspendStreamStore: state.suspendStream,
    }))
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("viewers-desc");
  const [activeTab, setActiveTab] = useState<"live" | "recorded">("live");

  const [recordedStreamsList, setRecordedStreamsList] = useState<any[]>([]);
  const [isLoadingRecordedList, setIsLoadingRecordedList] = useState(false);
  const [recordedListError, setRecordedListError] = useState<string | null>(null);

  const [recordedLimit, setRecordedLimit] = useState(10);
  const [recordedNextCursor, setRecordedNextCursor] = useState<string | null>(null);
  const [recordedHistory, setRecordedHistory] = useState<string[]>([]);

  const [recordedSearchQuery, setRecordedSearchQuery] = useState("");

  const [watchingRecordedStream, setWatchingRecordedStream] = useState<any | null>(null);
  const [recordedStreamData, setRecordedStreamData] = useState<any>(null);
  const [isLoadingRecordedPlayback, setIsLoadingRecordedPlayback] = useState(false);

  const [flaggingStream, setFlaggingStream] = useState<any | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [isFlagging, setIsFlagging] = useState(false);
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const fetchRecordedList = async (opts?: { cursor?: string; reset?: boolean }) => {
    setIsLoadingRecordedList(true);
    setRecordedListError(null);
    try {
      const res = await streamService.getPlaybacks({ limit: recordedLimit, cursor: opts?.cursor });
      if (res && res.ok) {
        const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        const next = res.data?.nextCursor ?? null;
        setRecordedStreamsList(items);
        setRecordedNextCursor(next);
        if (opts?.reset) setRecordedHistory([]);
      } else {
        setRecordedListError("Failed to fetch recorded streams");
      }
    } catch (err: any) {
      console.error(err);
      setRecordedListError(err?.response?.data?.message || "Error fetching recorded streams");
    } finally {
      setIsLoadingRecordedList(false);
    }
  };

  const goToNextRecordedPage = () => {
    if (!recordedNextCursor) return;
    setRecordedHistory((prev) => [...prev, recordedNextCursor ?? ""]);
    fetchRecordedList({ cursor: recordedNextCursor });
  };

  const goToPreviousRecordedPage = () => {
    if (recordedHistory.length === 0) return;
    const prev = [...recordedHistory];
    setRecordedHistory(prev);
    fetchRecordedList({ cursor: prev.length > 0 ? prev[prev.length - 1] : undefined });
  };

  useEffect(() => {
    if (activeTab === "recorded" && recordedStreamsList.length === 0 && !isLoadingRecordedList && !recordedListError) {
      fetchRecordedList({ reset: true });
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "recorded") {
      fetchRecordedList({ reset: true });
    }
  }, [recordedLimit]);

  useEffect(() => {
    if (!watchingRecordedStream) {
      setRecordedStreamData(null);
      return;
    }
    const fetchPlayback = async () => {
      setIsLoadingRecordedPlayback(true);
      setRecordedStreamData(null);
      try {
        const res = await streamService.getPlayback(watchingRecordedStream.sessionId);
        if (res && res.ok) {
          setRecordedStreamData(res.data);
        } else {
          toast.error("Failed to fetch recorded stream playback");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Error fetching playback");
      } finally {
        setIsLoadingRecordedPlayback(false);
      }
    };
    fetchPlayback();
  }, [watchingRecordedStream]);

  const handleFlagDispute = async () => {
    if (!flaggingStream || !flagReason.trim()) return;
    setIsFlagging(true);
    try {
      await streamService.flagDispute(flaggingStream.sessionId, { reason: flagReason.trim() });
      toast.success(`Dispute flagged for session ${flaggingStream.sessionId.slice(0, 8)}...`);
      setFlaggingStream(null);
      setFlagReason("");
    } catch (err: any) {
      console.error("[handleFlagDispute] error:", err);
      toast.error(err?.response?.data?.message || "Failed to flag dispute.");
    } finally {
      setIsFlagging(false);
    }
  };

  const handleResolveDispute = async (sessionId: string) => {
    setIsResolving(sessionId);
    try {
      await streamService.resolveDispute(sessionId);
      toast.success(`Dispute resolved for session ${sessionId.slice(0, 8)}...`);
    } catch (err: any) {
      console.error("[handleResolveDispute] error:", err);
      toast.error(err?.response?.data?.message || "Failed to resolve dispute.");
    } finally {
      setIsResolving(null);
    }
  };

  const [watchingStream, setWatchingStream] = useState<any | null>(null);
  const [suspendingStream, setSuspendingStream] = useState<any | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const { user } = useAuthStore();

  useEffect(() => {
    if (!watchingStream) {
      setLivekitToken(null);
      setLivekitUrl(null);
      setTokenError(null);
      return;
    }

    const fetchToken = async () => {
      setIsLoadingToken(true);
      setTokenError(null);
      try {
        const roomId = watchingStream.raw?.livekitRoomName || `slot_${watchingStream.slotId}`;
        const identity = user?.id || `admin_${Date.now()}`;

        const res = await streamService.getAdminToken({ roomId, identity });

        if (res && res.ok && res.data) {
          setLivekitToken(res.data.token);
          const url = res.data.livekit_url || res.data.livekitUrl || res.data.serverUrl || watchingStream.raw?.livekitUrl || watchingStream.raw?.livekit_url;
          if (url) {
            setLivekitUrl(url);
          } else {
            setLivekitUrl("wss://api.lifoo.com");
          }
        } else {
          throw new Error("Invalid token response from API");
        }
      } catch (err: any) {
        console.error("Failed to load admin token:", err);
        setTokenError(err?.response?.data?.message || err?.message || "Failed to load LiveKit connection details");
      } finally {
        setIsLoadingToken(false);
      }
    };

    fetchToken();
  }, [watchingStream, user]);

  useEffect(() => {
    if (watchingStream) {
      const streamExists = rawStreams.some((s) => s.id === watchingStream.id);
      if (!streamExists && !isLoadingStreams) {
        setWatchingStream(null);
      }
    }
  }, [rawStreams, watchingStream, isLoadingStreams]);

  const { chefs, fetchChefs } = useChefStore();

  const streams = useMemo(() => {
    return rawStreams.map((item) => {
      const chef = chefs.find((c) => c.userId === item.chefId || c.user?.id === item.chefId);
      const chefName = chef ? (chef.displayName || chef.businessName) : `Chef (${item.chefId.slice(0, 8)})`;

      let formattedStart = "N/A";
      if (item.startedAt) {
        const d = new Date(item.startedAt);
        formattedStart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      let healthStatus = "Healthy";
      if (item.state !== "active" || item.reconnectCount > 2) {
        healthStatus = "Degraded";
      }

      return {
        id: item.id,
        chef: chefName,
        chefId: item.chefId,
        slotId: item.slotId,
        order: item.livekitRoomName || item.slotId || "N/A",
        viewers: 0,
        start: formattedStart,
        health: healthStatus,
        raw: item
      };
    });
  }, [rawStreams, chefs]);

  const loadStreams = async () => {
    await fetchStreams();
  };

  useEffect(() => {
    fetchChefs();
  }, [fetchChefs]);

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(() => {
      fetchStreams();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  const handleSuspendStream = async () => {
    if (!suspendingStream) return;

    setIsSuspending(true);
    try {
      await suspendStreamStore(suspendingStream.id);
      toast.success(`Stream for Chef ${suspendingStream.chef} suspended successfully.`);
    } catch (err: any) {
      console.error("[handleSuspendStream] error:", err);
      toast.error(err?.response?.data?.message || "Failed to suspend stream.");
    } finally {
      setIsSuspending(false);
      setSuspendingStream(null);
    }
  };

  const stats = useMemo(() => {
    const total = streams.length;
    const healthy = streams.filter((s) => s.health.toLowerCase() === "healthy").length;
    const degraded = total - healthy;
    const totalViewers = streams.reduce((acc, s) => acc + s.viewers, 0);

    return { total, healthy, degraded, totalViewers };
  }, [streams]);

  const filteredAndSortedStreams = useMemo(() => {
    return streams
      .filter((s) => {
        const matchesSearch =
          s.chef.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.order.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          s.health.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "viewers-desc") return b.viewers - a.viewers;
        if (sortBy === "viewers-asc") return a.viewers - b.viewers;
        if (sortBy === "start-desc") return b.start.localeCompare(a.start);
        if (sortBy === "start-asc") return a.start.localeCompare(b.start);
        return 0;
      });
  }, [streams, searchQuery, statusFilter, sortBy]);

  const filteredRecordedStreams = useMemo(() => {
    if (!recordedSearchQuery.trim()) return recordedStreamsList;
    const q = recordedSearchQuery.toLowerCase();
    return recordedStreamsList.filter((rs: any) => {
      const name = (rs.chefName || rs.chefId || "").toLowerCase();
      const id = (rs.sessionId || "").toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [recordedStreamsList, recordedSearchQuery]);

  return (
    <>
      <PageHeader
        title="Streaming Operations"
        description="Monitor live cooking streams or view recorded sessions."
        actions={
          activeTab === "live" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={loadStreams}
              disabled={isLoadingStreams}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className={`h-4 w-4 ${isLoadingStreams ? "animate-spin" : ""}`} />
              {isLoadingStreams ? "Refreshing..." : "Refresh"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRecordedList({ reset: true })}
              disabled={isLoadingRecordedList}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className={`h-4 w-4 ${isLoadingRecordedList ? "animate-spin" : ""}`} />
              {isLoadingRecordedList ? "Refreshing..." : "Refresh"}
            </Button>
          )
        }
      />

      <PageBody>
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${activeTab === "live"
              ? "border-[#2d7a4f] text-[#2d7a4f]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
          >
            Live Streams
          </button>
          <button
            onClick={() => setActiveTab("recorded")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${activeTab === "recorded"
              ? "border-[#2d7a4f] text-[#2d7a4f]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
          >
            Recorded Streams
          </button>
        </div>

        {activeTab === "live" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Active Streams"
                value={stats.total}
                hint="Streams currently transmitting"
                accent
              />
              <StatCard
                label="Total Viewers"
                value={stats.totalViewers}
                hint="Aggregate live audience"
              />
              <StatCard
                label="Healthy Transmissions"
                value={stats.healthy}
                hint="Standard stream performance"
              />
              <StatCard
                label="Degraded Transmissions"
                value={stats.degraded}
                hint="Needs immediate attention"
                accent={stats.degraded > 0}
              />
            </div>

            <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by Chef, Room ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-10">
                      <SelectValue placeholder="All Streams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transmissions</SelectItem>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="degraded">Degraded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sort By:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px] h-10">
                      <SelectValue placeholder="Sort Viewers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewers-desc">Viewers (High to Low)</SelectItem>
                      <SelectItem value="viewers-asc">Viewers (Low to High)</SelectItem>
                      <SelectItem value="start-desc">Start Time (Newest)</SelectItem>
                      <SelectItem value="start-asc">Start Time (Oldest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {isLoadingStreams && streams.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-12 text-center bg-card w-full">
                <RotateCw className="h-12 w-12 text-[#2d7a4f] animate-spin mb-3" />
                <h3 className="text-lg font-semibold">Loading live streams...</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Fetching active transparency streams from LiveKit servers.
                </p>
              </div>
            ) : errorStreams ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-destructive/50 rounded-lg p-12 text-center bg-card w-full">
                <Radio className="h-12 w-12 text-destructive animate-pulse mb-3" />
                <h3 className="text-lg font-semibold text-destructive">Failed to load streams</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {errorStreams}
                </p>
                <Button variant="outline" className="mt-4" onClick={loadStreams}>
                  Try Again
                </Button>
              </div>
            ) : filteredAndSortedStreams.length > 0 ? (
              <LiveStreamGrid
                filteredAndSortedStreams={filteredAndSortedStreams}
                setWatchingStream={setWatchingStream}
                setSuspendingStream={setSuspendingStream}
              />
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-12 text-center bg-card">
                <Radio className="h-12 w-12 text-muted-foreground/50 animate-pulse mb-3" />
                <h3 className="text-lg font-semibold">No active streams found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  We couldn't find any stream matching your filter criteria. Try adjusting the search query or status toggle.
                </p>
              </div>
            )}

            <TablePagination
              currentPage={history.length + 1}
              totalPages={nextCursor ? history.length + 2 : history.length + 1}
              limit={limit}
              onPageChange={async (page) => {
                if (page > history.length + 1) {
                  goToNextPage();
                } else if (page < history.length + 1) {
                  goToPreviousPage();
                }
              }}
              onLimitChange={(val) => setLimit(val)}
            />
          </>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by Chef Name or Session ID..."
                  value={recordedSearchQuery}
                  onChange={(e) => setRecordedSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full"
                />
              </div>
            </div>

            {isLoadingRecordedList ? (
              <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-12 text-center bg-card w-full">
                <RotateCw className="h-12 w-12 text-[#2d7a4f] animate-spin mb-3" />
                <h3 className="text-lg font-semibold">Loading recorded streams...</h3>
              </div>
            ) : recordedListError ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-destructive/50 rounded-lg p-12 text-center bg-card w-full">
                <Radio className="h-12 w-12 text-destructive animate-pulse mb-3" />
                <h3 className="text-lg font-semibold text-destructive">Failed to load recorded streams</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">{recordedListError}</p>
                <Button variant="outline" className="mt-4" onClick={() => fetchRecordedList({ reset: true })}>Try Again</Button>
              </div>
            ) : filteredRecordedStreams.length > 0 ? (
              <RecordedStreamGrid
                filteredRecordedStreams={filteredRecordedStreams}
                chefs={chefs}
                setWatchingRecordedStream={setWatchingRecordedStream}
                setFlaggingStream={setFlaggingStream}
                setFlagReason={setFlagReason}
                isResolving={isResolving}
                handleResolveDispute={handleResolveDispute}
              />
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-12 text-center bg-card">
                <Tv className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-semibold">
                  {recordedSearchQuery ? "No matching recordings" : "No recorded streams"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {recordedSearchQuery
                    ? "Try adjusting your search query."
                    : "We couldn't find any recorded playback sessions."}
                </p>
              </div>
            )}

            <TablePagination
              currentPage={recordedHistory.length + 1}
              totalPages={recordedNextCursor ? recordedHistory.length + 2 : recordedHistory.length + 1}
              limit={recordedLimit}
              onPageChange={async (page) => {
                if (page > recordedHistory.length + 1) {
                  goToNextRecordedPage();
                } else if (page < recordedHistory.length + 1) {
                  goToPreviousRecordedPage();
                }
              }}
              onLimitChange={(val) => setRecordedLimit(val)}
            />
          </div>
        )}
      </PageBody>

      <StreamMonitorModal
        watchingStream={watchingStream}
        setWatchingStream={setWatchingStream}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        isLoadingToken={isLoadingToken}
        tokenError={tokenError}
        livekitToken={livekitToken}
        livekitUrl={livekitUrl}
        setSuspendingStream={setSuspendingStream}
      />

      <RecordedStreamPlaybackModal
        watchingRecordedStream={watchingRecordedStream}
        setWatchingRecordedStream={setWatchingRecordedStream}
        isLoadingRecordedPlayback={isLoadingRecordedPlayback}
        recordedStreamData={recordedStreamData}
        setFlaggingStream={setFlaggingStream}
        setFlagReason={setFlagReason}
        isResolving={isResolving}
        handleResolveDispute={handleResolveDispute}
      />
      ``
      <FlagDisputeModal
        flaggingStream={flaggingStream}
        setFlaggingStream={setFlaggingStream}
        flagReason={flagReason}
        setFlagReason={setFlagReason}
        isFlagging={isFlagging}
        handleFlagDispute={handleFlagDispute}
      />

      <SuspendStreamModal
        suspendingStream={suspendingStream}
        setSuspendingStream={setSuspendingStream}
        isSuspending={isSuspending}
        handleSuspendStream={handleSuspendStream}
      />
    </>
  );
}
