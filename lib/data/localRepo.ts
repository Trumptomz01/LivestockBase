import type { Animal, AnimalEvent, LogType, ModuleId } from "@/lib/store";
import type { Repository } from "./repository";

const DB_NAME = "hb360-local";
const STORE = "kv";
const KEY = "state";

export type LocalEvent = AnimalEvent & { createdAt?: string };
export type LocalAnimal = Omit<Animal, "events"> & { events: LocalEvent[]; createdAt: string };
export type LocalState = {
  selectedModules: ModuleId[];
  onboardingCompleted: boolean;
  animals: LocalAnimal[];
  farmName?: string | null;
};

const emptyState = (): LocalState => ({ selectedModules: ["cattle"], onboardingCompleted: false, animals: [], farmName: null });

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readState(): Promise<LocalState> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as LocalState | undefined) ?? emptyState());
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

async function writeState(state: LocalState): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(state, KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Read-modify-write steps run one at a time so two quick actions can't overwrite each other.
let chain: Promise<unknown> = Promise.resolve();
function mutate(fn: (s: LocalState) => void): Promise<void> {
  const run = chain.then(async () => {
    const s = await readState();
    fn(s);
    await writeState(s);
  });
  chain = run.catch(() => {});
  return run;
}

function need(s: LocalState, id: string): LocalAnimal {
  const a = s.animals.find((x) => x.id === id);
  if (!a) throw new Error("Animal not found");
  return a;
}

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

function toAnimal(a: LocalAnimal): Animal {
  return {
    id: a.id,
    name: a.name,
    module: a.module,
    ageLabel: a.ageLabel,
    startCount: a.startCount ?? 1,
    lastFedWhen: a.lastFedWhen,
    lastCheckWhen: a.lastCheckWhen,
    attentionFlag: a.attentionFlag,
    addedToday: isToday(a.createdAt),
    events: a.events.map((e) => ({
      id: e.id,
      type: e.type,
      label: e.label,
      when: e.when,
      flag: e.flag,
      count: e.count ?? null,
      details: e.details ?? null,
    })),
    status: a.status,
    deathCause: a.deathCause,
    deathDate: a.deathDate,
  };
}

export function createLocalRepo(): Repository {
  return {
    async load() {
      const s = await readState();
      return {
        selectedModules: s.selectedModules,
        onboardingCompleted: s.onboardingCompleted,
        animals: s.animals.map(toAnimal),
        farmName: s.farmName ?? null
      };
    },
    saveSelectedModules: (mods) =>
      mutate((s) => {
        s.selectedModules = mods;
      }),
    completeOnboarding: (mods) =>
      mutate((s) => {
        s.selectedModules = mods;
        s.onboardingCompleted = true;
      }),
    saveFarmName: (name) =>
      mutate((s) => {
         s.farmName = name;
      }),
    insertAnimal: (a) =>
      mutate((s) => {
        s.animals.push({ ...a, events: [], createdAt: new Date().toISOString() });
      }),
    updateAnimal: (id, patch) =>
      mutate((s) => {
        const a = need(s, id);
        if (patch.name !== undefined) a.name = patch.name;
        if (patch.ageLabel !== undefined) a.ageLabel = patch.ageLabel;
      }),
    deleteAnimal: (id) =>
      mutate((s) => {
        need(s, id);
        s.animals = s.animals.filter((a) => a.id !== id);
      }),
    markDeceased: (id, cause, dateISO) =>
      mutate((s) => {
        const a = need(s, id);
        a.status = "deceased";
        a.deathCause = cause;
        a.deathDate = dateISO;
      }),
    insertEvent: (animalId, type, event, patch) =>
      mutate((s) => {
        const a = need(s, animalId);
        a.events.unshift({ ...event, type, createdAt: new Date().toISOString() });
        if (patch.lastFedWhen !== undefined) a.lastFedWhen = patch.lastFedWhen;
        if (patch.lastCheckWhen !== undefined) a.lastCheckWhen = patch.lastCheckWhen;
        if (patch.attentionFlag !== undefined) a.attentionFlag = patch.attentionFlag;
      }),
    deleteEvent: (eventId) =>
      mutate((s) => {
        for (const a of s.animals) {
          const i = a.events.findIndex((e) => e.id === eventId);
          if (i !== -1) {
            a.events.splice(i, 1);
            return;
          }
        }
        throw new Error("Event not found");
      }),
  };
}

export async function readLocalSnapshot(): Promise<LocalState> {
  return readState();
}

export function clearLocalData(): Promise<void> {
  const run = chain.then(() => writeState(emptyState()));
  chain = run.catch(() => {});
  return run;
}