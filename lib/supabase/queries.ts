import type { SupabaseClient } from "@supabase/supabase-js";
import type { Animal, AnimalEvent, LogType, ModuleId } from "@/lib/store";

type EventRow = {
  id: string; animal_id: string; type: string; label: string;
  when_label: "Today" | "Yesterday"; flag: boolean; created_at: string;
};
type AnimalRow = {
  id: string; farmer_id: string; module: ModuleId; name: string; age_label: string;
  last_fed_when: string | null; last_check_when: string | null;
  attention_flag: boolean; created_at: string; animal_events: EventRow[] | null;
  status: "active" | "deceased"; death_cause: string | null; death_date: string | null;

};
export type FarmerRow = {
  id: string; selected_modules: ModuleId[] | null; onboarding_completed: boolean;
};

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

function rowToAnimal(r: AnimalRow): Animal {
  return {
    id: r.id,
    name: r.name,
    module: r.module,
    ageLabel: r.age_label,
    lastFedWhen: r.last_fed_when,
    lastCheckWhen: r.last_check_when,
    attentionFlag: r.attention_flag,
    addedToday: isToday(r.created_at),
    events: (r.animal_events ?? []).map(
      (e): AnimalEvent => ({ label: e.label, id: e.id, when: e.when_label, flag: e.flag })
    ),
    status: r.status,
    deathCause: r.death_cause,
    deathDate: r.death_date,
  };
}

export async function fetchFarmer(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("farmers")
    .select("id, selected_modules, onboarding_completed")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as FarmerRow | null;
}

// Scoped by farmer_id in the query itself (and again by RLS).
export async function fetchAnimals(supabase: SupabaseClient, userId: string): Promise<Animal[]> {
  const { data, error } = await supabase
    .from("animals")
    .select("*, animal_events(*)")
    .eq("farmer_id", userId)
    .order("created_at", { ascending: true })
    .order("created_at", { referencedTable: "animal_events", ascending: false });
  if (error) throw error;
  return ((data ?? []) as AnimalRow[]).map(rowToAnimal);
}

export async function insertAnimal(supabase: SupabaseClient, userId: string, a: Animal) {
  const { error } = await supabase.from("animals").insert({
    id: a.id,
    farmer_id: userId,
    module: a.module,
    name: a.name,
    age_label: a.ageLabel,
    last_fed_when: null,
    last_check_when: null,
    attention_flag: false,
  });
  if (error) throw error;
}

export async function updateAnimalRow(
  supabase: SupabaseClient, userId: string, id: string,
  patch: { name?: string; age_label?: string }
) {
  const { data, error } = await supabase
    .from("animals")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id).eq("farmer_id", userId)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Update affected no rows"); // RLS/ownership failure is otherwise silent
}

export async function deleteAnimalRow(supabase: SupabaseClient, userId: string, id: string) {
  // Events first, in case the FK isn't ON DELETE CASCADE.
  const ev = await supabase.from("animal_events").delete().eq("animal_id", id);
  if (ev.error) throw ev.error;
  const { data, error } = await supabase
    .from("animals").delete().eq("id", id).eq("farmer_id", userId).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Delete affected no rows");
}

export async function markAnimalDeceasedRow(
  supabase: SupabaseClient, userId: string, id: string, cause: string, dateISO: string
) {
  const { data, error } = await supabase
    .from("animals")
    .update({ status: "deceased", death_cause: cause, death_date: dateISO })
    .eq("id", id).eq("farmer_id", userId)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Update affected no rows");
}

export async function insertEventAndUpdateAnimal(
  supabase: SupabaseClient, userId: string, animalId: string,
  type: LogType, event: AnimalEvent,
  animalPatch: { last_fed_when?: string; last_check_when?: string; attention_flag?: boolean }
) {
  const ins = await supabase.from("animal_events").insert({
    id: event.id,
    animal_id: animalId, type, label: event.label, when_label: event.when, flag: event.flag,
  });
  if (ins.error) throw ins.error;

  if (Object.keys(animalPatch).length) {
    const { data, error } = await supabase
      .from("animals")
      .update({ ...animalPatch, updated_at: new Date().toISOString() })
      .eq("id", animalId).eq("farmer_id", userId)
      .select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("Animal update affected no rows");
  }
}

export async function deleteEventRow(supabase: SupabaseClient, userId: string, eventId: string) {
  const { data, error } = await supabase
    .from("animal_events")
    .delete()
    .eq("id", eventId)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Delete affected no rows");
}

export async function ensureFarmer(supabase: SupabaseClient, userId: string): Promise<FarmerRow> {
  const { data, error } = await supabase
    .from("farmers")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true })
    .select("id, selected_modules, onboarding_completed")
    .single();
  if (error) throw error;
  return data as FarmerRow;
}

export async function saveSelectedModulesRow(
  supabase: SupabaseClient, userId: string, mods: ModuleId[]
) {
  const { data, error } = await supabase
    .from("farmers").update({ selected_modules: mods }).eq("id", userId).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Farmer update affected no rows");
}

export async function completeOnboardingRow(
  supabase: SupabaseClient, userId: string, mods: ModuleId[]
) {
  const { data, error } = await supabase
    .from("farmers")
    .update({ selected_modules: mods, onboarding_completed: true })
    .eq("id", userId).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Farmer update affected no rows");
}