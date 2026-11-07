import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type StreakData = {
  current: number;
  longest: number;
  solvedToday: boolean;
  lastSolvedOn: string | null;
  timezone: string;
};

export type StreakState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: StreakData };

/**
 * Loads /api/streak. Reloads on navigation and whenever some part of the app
 * dispatches a "streak:refresh" window event (e.g. after marking a challenge solved).
 */
export function useStreak() {
  const [state, setState] = useState<StreakState>({ status: "loading" });
  const pathname = usePathname();

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/streak", { signal });
      if (!res.ok) throw new Error("bad response");
      setState({ status: "ready", data: await res.json() });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const onRefresh = () => {
      load();
    };
    window.addEventListener("streak:refresh", onRefresh);
    return () => {
      controller.abort();
      window.removeEventListener("streak:refresh", onRefresh);
    };
  }, [load, pathname]);

  return { state, reload: load };
}
