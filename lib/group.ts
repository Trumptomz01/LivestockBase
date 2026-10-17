import type { Animal, AnimalEvent } from "@/lib/store";

const sum = (events: AnimalEvent[], types: AnimalEvent["type"][]) =>
  events.reduce((n, e) => (types.includes(e.type) ? n + (e.count ?? 0) : n), 0);

/** How many animals are alive in this group right now. */
export function aliveCount(a: Animal): number {
  if (a.status === "deceased") return 0; // older single-animal records marked deceased
  const total =
    a.startCount + sum(a.events, ["birth", "added", "recount"]) - sum(a.events, ["death", "removed"]);
  return Math.max(0, total);
}

/** How many of the living are sick, from the latest health report. */
export function sickCount(a: Animal): number {
  const alive = aliveCount(a);
  if (alive === 0) return 0;
  const latest = a.events.find((e) => e.type === "health"); // events are newest first
  if (!latest) return 0;
  const sick = latest.count !== null ? latest.count : latest.flag ? 1 : 0; // older records: a flag means 1 sick
  return Math.min(sick, alive);
}

export function healthyCount(a: Animal): number {
  return aliveCount(a) - sickCount(a);
}

export function isGroup(a: Animal): boolean {
  return a.startCount > 1;
}