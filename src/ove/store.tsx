import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  Role,
  Protocol,
  Schedule,
  Execution,
  Incident,
  Notification,
  Person,
  MaintenanceTool,
  InventoryItem,
  ResourceReservation,
} from "./types";
import {
  seedProtocols,
  seedSchedules,
  seedExecutions,
  seedIncidents,
  seedNotifications,
  seedPeople,
  seedTools,
  seedInventory,
  seedReservations,
} from "./seed";

interface State {
  role: Role;
  protocols: Protocol[];
  schedules: Schedule[];
  executions: Execution[];
  incidents: Incident[];
  notifications: Notification[];
  people: Person[];
  tools: MaintenanceTool[];
  inventory: InventoryItem[];
  reservations: ResourceReservation[];
}

interface Store extends State {
  setRole: (r: Role) => void;
  setProtocols: (p: Protocol[]) => void;
  setSchedules: (s: Schedule[]) => void;
  setExecutions: (e: Execution[]) => void;
  setIncidents: (i: Incident[]) => void;
  setNotifications: (n: Notification[]) => void;
  setPeople: (p: Person[]) => void;
  setTools: (t: MaintenanceTool[]) => void;
  setInventory: (i: InventoryItem[]) => void;
  setReservations: (r: ResourceReservation[]) => void;
  reset: () => void;
}

const StoreCtx = createContext<Store | null>(null);
const KEY = "zellship-maintenance-os-v4";

const initial: State = {
  role: "admin",
  protocols: seedProtocols,
  schedules: seedSchedules,
  executions: seedExecutions,
  incidents: seedIncidents,
  notifications: seedNotifications,
  people: seedPeople,
  tools: seedTools,
  inventory: seedInventory,
  reservations: seedReservations,
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...initial, ...JSON.parse(raw) };
    } catch {
      // Ignore invalid or unavailable device-local demo state.
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // The simulator remains usable when browser storage is unavailable.
    }
  }, [state]);

  const store = useMemo<Store>(
    () => ({
      ...state,
      setRole: (role) => setState((s) => ({ ...s, role })),
      setProtocols: (protocols) => setState((s) => ({ ...s, protocols })),
      setSchedules: (schedules) => setState((s) => ({ ...s, schedules })),
      setExecutions: (executions) => setState((s) => ({ ...s, executions })),
      setIncidents: (incidents) => setState((s) => ({ ...s, incidents })),
      setNotifications: (notifications) => setState((s) => ({ ...s, notifications })),
      setPeople: (people) => setState((s) => ({ ...s, people })),
      setTools: (tools) => setState((s) => ({ ...s, tools })),
      setInventory: (inventory) => setState((s) => ({ ...s, inventory })),
      setReservations: (reservations) => setState((s) => ({ ...s, reservations })),
      reset: () => setState(initial),
    }),
    [state],
  );

  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
