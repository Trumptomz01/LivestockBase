import type { Animal, AnimalEvent, LogType, ModuleId } from "@/lib/store";

export type ProfileData = {
  selectedModules: ModuleId[];
  onboardingCompleted: boolean;
  animals: Animal[];
};

// Fields on an animal that a log entry can change.
export type AnimalStatePatch = {
  lastFedWhen?: string;
  lastCheckWhen?: string;
  attentionFlag?: boolean;
};

export interface Repository {
  load(): Promise<ProfileData>;
  saveSelectedModules(mods: ModuleId[]): Promise<void>;
  completeOnboarding(mods: ModuleId[]): Promise<void>;
  insertAnimal(a: Animal): Promise<void>;
  updateAnimal(id: string, patch: { name?: string; ageLabel?: string }): Promise<void>;
  deleteAnimal(id: string): Promise<void>;
  markDeceased(id: string, cause: string, dateISO: string): Promise<void>;
  insertEvent(animalId: string, type: LogType, event: AnimalEvent, patch: AnimalStatePatch): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
}