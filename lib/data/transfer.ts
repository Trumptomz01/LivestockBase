import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModuleId } from "@/lib/store";
import { saveSelectedModulesRow, completeOnboardingRow, saveFarmNameRow } from "@/lib/supabase/queries";
import type { LocalState } from "./localRepo";

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function countExisting(supabase: SupabaseClient, table: "animals" | "animal_events", ids: string[]) {
  let found = 0;
  for (const part of chunk(ids, 50)) {
    const { data, error } = await supabase.from(table).select("id").in("id", part);
    if (error) throw error;
    found += data?.length ?? 0;
  }
  return found;
}

export async function uploadSnapshot(
  supabase: SupabaseClient,
  userId: string,
  snap: LocalState,
  cloud: { selectedModules: ModuleId[]; onboardingCompleted: boolean; farmName: string | null }
): Promise<void> {
  const animalRows = snap.animals.map((a) => ({
    id: a.id,
    farmer_id: userId,
    module: a.module,
    name: a.name,
    age_label: a.ageLabel,
    last_fed_when: a.lastFedWhen,
    last_check_when: a.lastCheckWhen,
    attention_flag: a.attentionFlag,
    start_count: a.startCount ?? 1,
    status: a.status,
    death_cause: a.deathCause,
    death_date: a.deathDate,
    created_at: a.createdAt,
  }));

  // Events are stored newest-first. Records made before this update have no saved
  // timestamp, so they get one that keeps the same order.
  const now = Date.now();
  const eventRows = snap.animals.flatMap((a) =>
    a.events.map((e, i) => ({
      id: e.id,
      animal_id: a.id,
      type: e.type,
      label: e.label,
      when_label: e.when,
      count: e.count ?? null, details: e.details ?? null,
      flag: e.flag,
      created_at: e.createdAt ?? new Date(now - i * 1000).toISOString(),
    }))
  );

  for (const part of chunk(animalRows, 200)) {
    const { error } = await supabase.from("animals").upsert(part, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
  }
  for (const part of chunk(eventRows, 500)) {
    const { error } = await supabase.from("animal_events").upsert(part, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
  }

  // Don't trust "no error" alone: confirm everything is really in the database.
  const animalsFound = await countExisting(supabase, "animals", animalRows.map((r) => r.id));
  if (animalsFound !== animalRows.length) throw new Error("Some animals did not upload");
  const eventsFound = await countExisting(supabase, "animal_events", eventRows.map((r) => r.id));
  if (eventsFound !== eventRows.length) throw new Error("Some records did not upload");
  
  if (!cloud.farmName && snap.farmName) await saveFarmNameRow(supabase, userId, snap.farmName);

  const mods = Array.from(new Set<ModuleId>([...cloud.selectedModules, ...snap.selectedModules]));
  if (cloud.onboardingCompleted || snap.onboardingCompleted || snap.animals.length > 0) {
    await completeOnboardingRow(supabase, userId, mods);
  } else {
    await saveSelectedModulesRow(supabase, userId, mods);
  }
}