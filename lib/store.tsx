"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import * as q from "@/lib/supabase/queries";


// ---- Domain types ----
export type ModuleId = "cattle" | "goat" | "sheep" | "fish" | "poultry";

export type ModuleDef = {
  id: ModuleId;
  label: string;
  singular: string; // used in "What's this ___ called?" and "Add another ___"
  isBatch: boolean; // fish/poultry are batch/pond records, not individual animals
  defaultName: string;
  icon: ReactNode;
};
...
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function formatWhen(iso: string): string {
  if (iso === todayISO()) return "Today";
  if (iso === yesterdayISO()) return "Yesterday";
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export type AnimalEvent = {
  id: string;
  label: string;
  when: string;
  flag: boolean;
};

export type Animal = {
  id: string;
  name: string;
  module: ModuleId;
  ageLabel: string;
  lastFedWhen: string | null;
  lastCheckWhen: string | null;
  attentionFlag: boolean;
  addedToday: boolean;
  events: AnimalEvent[];
  status: "active" | "deceased";
  deathCause: string | null;
  deathDate: string | null; 
};

export type LogType = "feeding" | "health" | "breeding" | "weight";
export const deathCauseSuggestions = ["Illness", "Predator attack", "Old age", "Accident", "Unknown"];

export const logTypeConfig: Record<
  LogType,
  {
    title: string;
    primaryLabel: string | null;
    primaryOptions: string[];
    showAmount: boolean;
    amountLabel?: string;
    unit?: string;
    startAmount?: number;
    eventLabel: (primary: string | null, amount: number | null) => string;
    flag?: (primary: string | null) => boolean;
  }
> = {
  feeding: {
    title: "Log feeding",
    primaryLabel: "What did they eat?",
    primaryOptions: ["Grass", "Concentrate", "Mixed"],
    showAmount: true,
    amountLabel: "How much?",
    unit: "kg",
    startAmount: 2,
    eventLabel: (p, a) => `Fed — ${p}${a ? ` (${a}kg)` : ""}`,
  },
  health: {
    title: "Log health check",
    primaryLabel: "How are they doing?",
    primaryOptions: ["Healthy", "Needs treatment", "Treated"],
    showAmount: false,
    eventLabel: (p) => `Health check — ${p}`,
    flag: (p) => p === "Needs treatment",
  },
  breeding: {
    title: "Log breeding",
    primaryLabel: "What happened?",
    primaryOptions: ["Mated", "Pregnancy confirmed", "Gave birth"],
    showAmount: false,
    eventLabel: (p) => `Breeding — ${p}`,
  },
  weight: {
    title: "Log weight",
    primaryLabel: null,
    primaryOptions: [],
    showAmount: true,
    amountLabel: "Weight",
    unit: "kg",
    startAmount: 10,
    eventLabel: (p, a) => `Weight recorded — ${a}kg`,
  },
};

// Icons kept as raw path strings (not JSX) so they can round-trip through
// the modules array easily; components render them via <IconPaths/>.
const ICONS: Record<ModuleId, string> = {
  cattle: '<ellipse cx="12" cy="15" rx="7" ry="5"/><circle cx="6" cy="10" r="3.4"/>',
  goat: '<ellipse cx="12" cy="15" rx="6" ry="5"/><circle cx="6.5" cy="9.5" r="3"/><path d="M4.5 7l1-2M8.5 7l0.5-2.3"/>',
  sheep: '<circle cx="10" cy="12" r="5.5"/><circle cx="16" cy="12" r="2.6"/>',
  fish: '<path d="M3 12c3-4 8-6 13-4-1 2-1 6 0 8-5 2-10 0-13-4z"/><path d="M16 8l4 4-4 4"/>',
  poultry: '<circle cx="10" cy="12" r="5"/><path d="M15 10l4-1-1 3z"/>',
};

export const modules: { id: ModuleId; label: string; singular: string; isBatch: boolean; defaultName: string; iconPaths: string }[] = [
  { id: "cattle", label: "Cattle", singular: "animal", isBatch: false, defaultName: "Bessie", iconPaths: ICONS.cattle },
  { id: "goat", label: "Goat", singular: "goat", isBatch: false, defaultName: "Nanny", iconPaths: ICONS.goat },
  { id: "sheep", label: "Sheep", singular: "sheep", isBatch: false, defaultName: "Woolly", iconPaths: ICONS.sheep },
  { id: "fish", label: "Fish", singular: "pond", isBatch: true, defaultName: "Pond 1", iconPaths: ICONS.fish },
  { id: "poultry", label: "Poultry", singular: "flock", isBatch: true, defaultName: "Flock A", iconPaths: ICONS.poultry },
];

export function moduleById(id: ModuleId) {
  return modules.find((m) => m.id === id)!;
}

// ---- Local cache (NOT the source of truth) ----
// Supabase is authoritative. This cache is keyed by user id and only used
// when Supabase can't be reached (e.g. offline) so we never show another user's data.
type StoredState = {
  userId: string;
  animals: Animal[];
  activeModule: ModuleId;
  selectedModules: ModuleId[];
  onboardingCompleted: boolean;
};
const STORAGE_KEY = "hb360-state";

function loadStored(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    return parsed?.userId ? parsed : null; // old-format cache (no userId) is ignored
  } catch {
    return null;
  }
}
function saveStored(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
function clearStored() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export type SyncStatus = "loading" | "signed-out" | "ready" | "error";

type AppState = {
  animals: Animal[];
  activeModule: ModuleId;
  selectedModules: ModuleId[];
  firstAnimalModule: ModuleId;
  currentAnimalId: string | null;
  isOnline: boolean;
  isReturningUser: boolean;
  hydrated: boolean; // client mounted
  farmerName: string | null;
  lastSavedMessage: string;
  syncStatus: SyncStatus; // auth + farmer + animals resolved?
  onboardingCompleted: boolean | null; // from farmers.onboarding_completed
  syncError: string | null;
  markDeceased: (id: string, cause: string, dateISO: string) => Promise<boolean>;
  deleteEvent: (animalId: string, eventId: string) => void;
  clearSyncError: () => void;
  retrySync: () => void;
  addSelectedModule: (id: ModuleId) => Promise<boolean>;
  setActiveModule: (id: ModuleId) => void;
  toggleSelectedModule: (id: ModuleId) => void;
  setFirstAnimalModule: (id: ModuleId) => void;
  setCurrentAnimalId: (id: string | null) => void;
  setLastSavedMessage: (msg: string) => void;
  addAnimal: (name: string, module: ModuleId, ageLabel: string) => Animal;
  updateAnimal: (id: string, patch: { name?: string; ageLabel?: string }) => void;
  deleteAnimal: (id: string) => void;
  logEvent: (
    animalId: string,
    type: LogType,
    primary: string | null,
    amount: number | null,
    whenISO: string
  ) => AnimalEvent;

  saveSelectedModules: () => Promise<boolean>;
  completeOnboarding: () => Promise<boolean>;

  animalsInModule: (id: ModuleId) => Animal[];
  getAnimal: (id: string) => Animal | undefined;
  attentionList: () => Animal[];
  todayCounts: () => { fed: number; health: number; attention: number; newToday: number };
};

const AppContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [activeModule, setActiveModuleState] = useState<ModuleId>("cattle");
  const [selectedModules, setSelectedModules] = useState<ModuleId[]>(["cattle"]);
  const [firstAnimalModule, setFirstAnimalModuleState] = useState<ModuleId>("cattle");
  const [currentAnimalId, setCurrentAnimalIdState] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [farmerName, setFarmerName] = useState<string | null>(null);
  const [lastSavedMessage, setLastSavedMessage] = useState("");

  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadedUserRef = useRef<string | null>(null);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());

  // Writes run one at a time, in order (e.g. animal insert before its first event).
  function enqueue(task: () => Promise<void>, onError: () => void) {
    queueRef.current = queueRef.current.then(task).catch(onError);
  }

  const resetLocal = useCallback(() => {
    setAnimals([]);
    setFarmerId(null);
    setFarmerName(null);
    setOnboardingCompleted(null);
    setSelectedModules(["cattle"]);
    setActiveModuleState("cattle");
    setCurrentAnimalIdState(null);
    setLastSavedMessage("");
    clearStored();
  }, []);

  const loadRemote = useCallback(
    async (userId: string) => {
      setSyncStatus("loading");
      try {
          let farmer = await q.fetchFarmer(supabase, userId);
          if (!farmer) {
            farmer = await q.ensureFarmer(supabase, userId);
          }
          const remoteAnimals = await q.fetchAnimals(supabase, userId);
        
        const mods: ModuleId[] = farmer.selected_modules?.length ? farmer.selected_modules : ["cattle"];
        const cached = loadStored();
        const preferred = cached?.userId === userId ? cached.activeModule : undefined;
        const { data: authData } = await supabase.auth.getUser();
        
        setFarmerName(authData.user?.user_metadata?.full_name ?? null);
        setFarmerId(userId);
        setOnboardingCompleted(farmer.onboarding_completed);
        setAnimals(remoteAnimals);
        setSelectedModules(mods);
        setActiveModuleState(preferred && mods.includes(preferred) ? preferred : mods[0]);
        setSyncStatus("ready");
      } catch {
        loadedUserRef.current = null; // allow a retry
        const cached = loadStored();
        if (cached && cached.userId === userId) {
          // Couldn't reach Supabase: fall back to this user's own cache.
          setFarmerId(userId);
          setOnboardingCompleted(cached.onboardingCompleted);
          setAnimals(cached.animals);
          setSelectedModules(cached.selectedModules?.length ? cached.selectedModules : ["cattle"]);
          setActiveModuleState(cached.activeModule || "cattle");
          setSyncStatus("ready");
        } else {
          setSyncStatus("error");
        }
      }
    },
    [supabase]
  );

  // Online/offline listeners (client only).
  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    setHydrated(true);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Auth -> data. Supabase decides who the user is; we then load THEIR rows.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        loadedUserRef.current = null;
        resetLocal();
        setSyncStatus("signed-out");
        return;
      }
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        const uid = session?.user?.id;
        if (!uid) {
          setSyncStatus("signed-out");
          return;
        }
        if (loadedUserRef.current === uid) return; // e.g. SIGNED_IN re-fired on tab focus
        if (loadedUserRef.current) resetLocal(); // different user, never show old data
        loadedUserRef.current = uid;
        // Don't await Supabase calls inside this callback (can deadlock the auth lock).
        setTimeout(() => {
          void loadRemote(uid);
        }, 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, loadRemote, resetLocal]);

  // Cache write: one effect, no setState inside, so no update loop.
  useEffect(() => {
    if (syncStatus !== "ready" || !farmerId || onboardingCompleted === null) return;
    saveStored({ userId: farmerId, animals, activeModule, selectedModules, onboardingCompleted });
  }, [syncStatus, farmerId, animals, activeModule, selectedModules, onboardingCompleted]);

  function retrySync() {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) {
        setSyncStatus("signed-out");
        return;
      }
      loadedUserRef.current = uid;
      void loadRemote(uid);
    });
  }

  function setActiveModule(id: ModuleId) {
    setActiveModuleState(id);
  }
  function toggleSelectedModule(id: ModuleId) {
    setSelectedModules((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function setFirstAnimalModule(id: ModuleId) {
    setFirstAnimalModuleState(id);
  }
  function setCurrentAnimalId(id: string | null) {
    setCurrentAnimalIdState(id);
  }

  function addAnimal(name: string, module: ModuleId, ageLabel: string): Animal {
    const animal: Animal = {
      id: crypto.randomUUID(),
      name,
      module,
      ageLabel,
      lastFedWhen: null,
      lastCheckWhen: null,
      attentionFlag: false,
      addedToday: true,
      events: [],
      status: "active",
      deathCause: null,
      deathDate: null
    };
    setAnimals((prev) => [...prev, animal]); // functional: safe when called several times in a row
    setActiveModuleState(module);
    setCurrentAnimalIdState(animal.id);

    const rollback = () => {
      setAnimals((prev) => prev.filter((a) => a.id !== animal.id));
      setSyncError(`Could not save ${name}. Check your connection and try again.`);
    };
    if (!farmerId) {
      rollback();
      return animal;
    }
    enqueue(() => q.insertAnimal(supabase, farmerId, animal), rollback);
    return animal;
  }

  async function addSelectedModule(id: ModuleId): Promise<boolean> {
    if (selectedModules.includes(id)) return true; // already have it
    const next = [...selectedModules, id];
    setSelectedModules(next);
    console.log("addSelectedModule called", { id, farmerId, selectedModules });
    if (!farmerId) return false;
    try {
      await q.saveSelectedModulesRow(supabase, farmerId, next);
      return true;
    } catch {
      setSelectedModules(selectedModules); // rollback
      setSyncError("Could not save the new animal type. Please try again.");
      return false;
    }
  }

  async function updateAnimal(id: string, patch: { name?: string; ageLabel?: string }): Promise<boolean> {
    const before = animals.find((a) => a.id === id);
    if (!before || !farmerId) return false;

    setAnimals((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

    const rollback = () => {
      setAnimals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, name: before.name, ageLabel: before.ageLabel } : a))
      );
      setSyncError("Could not save the change. Please try again.");
    };

    // Chain onto the same queue as everything else (so ordering with animal
    // inserts/events is preserved), but keep a handle we can actually await.
    const task = queueRef.current.then(() =>
      q.updateAnimalRow(supabase, farmerId, id, {
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.ageLabel !== undefined && { age_label: patch.ageLabel }),
      })
    );
    queueRef.current = task.catch(() => {}); // keep the shared queue alive even if this write fails

    try {
      await task;
      return true;
    } catch {
      rollback();
      return false;
    }
  }
// for dead anials
  async function markDeceased(id: string, cause: string, dateISO: string): Promise<boolean> {
  const before = animals.find((a) => a.id === id);
  if (!before || !farmerId) return false;

  setAnimals((prev) =>
    prev.map((a) => (a.id === id ? { ...a, status: "deceased", deathCause: cause, deathDate: dateISO } : a))
  );

  try {
    await q.markAnimalDeceasedRow(supabase, farmerId, id, cause, dateISO);
    return true;
  } catch {
    setAnimals((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: before.status, deathCause: before.deathCause, deathDate: before.deathDate } : a
      )
    );
    setSyncError("Could not save this. Please try again.");
    return false;
  }
}

    function deleteEvent(animalId: string, eventId: string) {
    const animal = animals.find((a) => a.id === animalId);
    const before = animal?.events.find((e) => e.id === eventId);
    if (!before || !farmerId) return;

    setAnimals((prev) =>
      prev.map((a) => (a.id === animalId ? { ...a, events: a.events.filter((e) => e.id !== eventId) } : a))
    );

    enqueue(
      () => q.deleteEventRow(supabase, farmerId, eventId),
      () => {
        setAnimals((prev) =>
          prev.map((a) =>
            a.id === animalId && !a.events.some((e) => e.id === eventId)
              ? { ...a, events: [before, ...a.events] }
              : a
          )
        );
        setSyncError("Could not delete that record. Please try again.");
      }
    );
  }
  function deleteAnimal(id: string) {
    const before = animals.find((a) => a.id === id);
    if (!before || !farmerId) return;
    setAnimals((prev) => prev.filter((a) => a.id !== id));
    if (currentAnimalId === id) setCurrentAnimalIdState(null);
    enqueue(
      () => q.deleteAnimalRow(supabase, farmerId, id),
      () => {
        setAnimals((prev) => (prev.some((a) => a.id === id) ? prev : [...prev, before]));
        setSyncError(`Could not delete ${before.name}. Please try again.`);
      }
    );
  }

  function logEvent(
    animalId: string,
    type: LogType,
    primary: string | null,
    amount: number | null,
    when: string,
  ): AnimalEvent {
    const cfg = logTypeConfig[type];
    const label = cfg.eventLabel(primary, amount);
    const isFlag = cfg.flag ? cfg.flag(primary) : false;
    const event: AnimalEvent = { id: crypto.randomUUID(), label, when, flag: isFlag };
    const before = animals.find((a) => a.id === animalId);

    const patch: { last_fed_when?: string; last_check_when?: string; attention_flag?: boolean } = {};
    if (type === "feeding") patch.last_fed_when = when;
    if (type === "health") {
      patch.last_check_when = when;
      patch.attention_flag = isFlag;
    }

    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id !== animalId) return a;
        const updated: Animal = { ...a, events: [event, ...a.events] };
        if (type === "feeding") updated.lastFedWhen = when;
        if (type === "health") {
          updated.lastCheckWhen = when;
          updated.attentionFlag = isFlag;
        }
        return updated;
      })
    );

    const rollback = () => {
      setAnimals((prev) =>
        prev.map((a) =>
          a.id !== animalId
            ? a
            : {
                ...a,
                events: a.events.filter((e) => e !== event),
                lastFedWhen: before?.lastFedWhen ?? null,
                lastCheckWhen: before?.lastCheckWhen ?? null,
                attentionFlag: before?.attentionFlag ?? false,
              }
        )
      );
      setSyncError("Could not save this record. Please try again.");
    };
    if (!farmerId) {
      rollback();
      return event;
    }
    enqueue(() => q.insertEventAndUpdateAnimal(supabase, farmerId, animalId, type, event, patch), rollback);
    return event;
  }

  async function saveSelectedModules(): Promise<boolean> {
    if (!farmerId) return false;
    try {
      await q.saveSelectedModulesRow(supabase, farmerId, selectedModules);
      return true;
    } catch {
      setSyncError("Could not save your choices. Please try again.");
      return false;
    }
  }

  async function completeOnboarding(): Promise<boolean> {
    if (!farmerId) return false;
    try {
      await queueRef.current; // let pending animal inserts finish first
      await q.completeOnboardingRow(supabase, farmerId, selectedModules);
      setOnboardingCompleted(true);
      return true;
    } catch {
      setSyncError("Could not finish setup. Please try again.");
      return false;
    }
  }

  function animalsInModule(id: ModuleId) {
    return animals.filter((a) => a.module === id);
  }
  function getAnimal(id: string) {
    return animals.find((a) => a.id === id);
  }
  function attentionList() {
    return animals.filter((a) => a.attentionFlag);
  }
  function todayCounts() {
    const today = todayISO();
    const fed = animals.filter((a) => a.events.some((e) => e.label.startsWith("Fed") && e.when === today)).length;
    const health = animals.filter((a) => a.events.some((e) => e.label.startsWith("Health check") && e.when === today)).length;
    const attention = animals.filter((a) => a.attentionFlag).length;
    const newToday = animals.filter((a) => a.addedToday).length;
    return { fed, health, attention, newToday };
  }

  const value: AppState = {
    animals,
    activeModule,
    selectedModules,
    firstAnimalModule,
    currentAnimalId,
    isOnline,
    isReturningUser: onboardingCompleted === true,
    hydrated,
    lastSavedMessage, 
    farmerName,
    syncStatus,
    onboardingCompleted,
    syncError,
    markDeceased,
    deleteEvent,
    addSelectedModule,
    clearSyncError: () => setSyncError(null),
    retrySync,
    setActiveModule,
    toggleSelectedModule,
    setFirstAnimalModule,
    setCurrentAnimalId,
    setLastSavedMessage,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    logEvent,
    saveSelectedModules,
    completeOnboarding,
    animalsInModule,
    getAnimal,
    attentionList,
    todayCounts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}