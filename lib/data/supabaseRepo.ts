import type { SupabaseClient } from "@supabase/supabase-js";
import * as q from "@/lib/supabase/queries";
import type { ModuleId } from "@/lib/store";
import type { Repository } from "./repository";

export function createSupabaseRepo(supabase: SupabaseClient, userId: string): Repository {
  return {
    async load() {
      let farmer = await q.fetchFarmer(supabase, userId);
      if (!farmer) farmer = await q.ensureFarmer(supabase, userId);
      const animals = await q.fetchAnimals(supabase, userId);
      const selectedModules: ModuleId[] = farmer.selected_modules?.length ? farmer.selected_modules : ["cattle"];
      return { selectedModules, onboardingCompleted: farmer.onboarding_completed, farmName: farmer.farm_name ?? null, animals };
    },
    saveSelectedModules: (mods) => q.saveSelectedModulesRow(supabase, userId, mods),
    completeOnboarding: (mods) => q.completeOnboardingRow(supabase, userId, mods),
    saveFarmName: (name) => q.saveFarmNameRow(supabase, userId, name),
    insertAnimal: (a) => q.insertAnimal(supabase, userId, a),
    updateAnimal: (id, patch) =>
      q.updateAnimalRow(supabase, userId, id, {
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.ageLabel !== undefined && { age_label: patch.ageLabel }),
      }),
    deleteAnimal: (id) => q.deleteAnimalRow(supabase, userId, id),
    markDeceased: (id, cause, dateISO) => q.markAnimalDeceasedRow(supabase, userId, id, cause, dateISO),
    insertEvent: (animalId, type, event, patch) =>
      q.insertEventAndUpdateAnimal(supabase, userId, animalId, type, event, {
        ...(patch.lastFedWhen !== undefined && { last_fed_when: patch.lastFedWhen }),
        ...(patch.lastCheckWhen !== undefined && { last_check_when: patch.lastCheckWhen }),
        ...(patch.attentionFlag !== undefined && { attention_flag: patch.attentionFlag }),
      }),
    deleteEvent: (eventId) => q.deleteEventRow(supabase, userId, eventId),
  };
}