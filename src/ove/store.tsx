import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role, Protocol, Schedule, Execution, Incident, Notification } from "./types";
import { seedProtocols, seedSchedules, seedExecutions, seedIncidents, seedNotifications } from "./seed";

interface State {
  role: Role;
  protocols: Protocol[];
  schedules: Schedule[];
  executions: Execution[];
  incidents: Incident[];
  notifications: Notification[];
}

interface Store extends State {
  setRole: (r: Role) => void;
  setProtocols: (p: Protocol[]) => void;
  setSchedules: (s: Schedule[]) => void;
  setExecutions: (e: Execution[]) => void;
  setIncidents: (i: Incident[]) => void;
  setNotifications: (n: Notification[]) => void;
  reset: () => void;
}

const StoreCtx = createContext<Store | null>(null);
const KEY = "zellship-maintenance-os-v2";

const initial: State = {
  role: "admin",
  protocols: seedProtocols,
  schedules: seedSchedules,
  executions: seedExecutions,
  incidents: seedIncidents,
  notifications: seedNotifications,
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...initial, ...JSON.parse(raw) };
    } catch {}
    return initial;
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const store = useMemo<Store>(() => ({
    ...state,
    setRole: (role) => setState((s) => ({ ...s, role })),
    setProtocols: (protocols) => setState((s) => ({ ...s, protocols })),
    setSchedules: (schedules) => setState((s) => ({ ...s, schedules })),
    setExecutions: (executions) => setState((s) => ({ ...s, executions })),
    setIncidents: (incidents) => setState((s) => ({ ...s, incidents })),
    setNotifications: (notifications) => setState((s) => ({ ...s, notifications })),
    reset: () => setState(initial),
  }), [state]);

  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
