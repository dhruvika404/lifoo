// utils/refreshTracker.ts
type RefreshEvent = {
  id: string;
  source: "api.ts" | "authStore.checkAuth" | "utils/auth.checkToken";
  trigger: "401-interceptor" | "interval-60s" | "tab-focus" | "manual";
  status: "started" | "success" | "failed" | "skipped-already-refreshing";
  timestamp: string;
  refreshTokenFingerprint?: string; // last 6 chars only, never log full token
  errorStatus?: number;
};

const LOG_KEY = "refresh_debug_log";

export const logRefreshEvent = (event: Omit<RefreshEvent, "id" | "timestamp">) => {
  const entry: RefreshEvent = {
    ...event,
    id: Math.random().toString(36).slice(2, 8),
    timestamp: new Date().toISOString(),
  };

  console.log(
    `%c[REFRESH] ${entry.source} | ${entry.trigger} | ${entry.status}`,
    "color: #e67e22; font-weight: bold;",
    entry
  );

  try {
    const existing: RefreshEvent[] = JSON.parse(
      localStorage.getItem(LOG_KEY) || "[]"
    );
    existing.push(entry);
    // keep last 100 only
    localStorage.setItem(LOG_KEY, JSON.stringify(existing.slice(-100)));
  } catch {
    // ignore storage errors
  }
};

export const dumpRefreshLog = () => {
  const log = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  console.table(log);
  return log;
};

export const clearRefreshLog = () => {
  localStorage.removeItem(LOG_KEY);
};

// Helper: detect overlapping refresh attempts (the race condition signature)
export const findRaces = () => {
  const log: RefreshEvent[] = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  const started = log.filter((e) => e.status === "started");
  const races: { a: RefreshEvent; b: RefreshEvent; gapMs: number }[] = [];

  for (let i = 0; i < started.length; i++) {
    for (let j = i + 1; j < started.length; j++) {
      const gap = Math.abs(
        new Date(started[j].timestamp).getTime() -
          new Date(started[i].timestamp).getTime()
      );
      if (gap < 3000 && started[i].source !== started[j].source) {
        races.push({ a: started[i], b: started[j], gapMs: gap });
      }
    }
  }

  console.table(races);
  return races;
};