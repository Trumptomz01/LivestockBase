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

/** What was fed last time, so the feeding form can start filled in. */
export function lastFeeding(a: Animal): { feed: string; amount: number | null } | null {
  const e = a.events.find((x) => x.type === "feeding"); // newest first
  if (!e) return null;
  if (e.details?.feed) return { feed: e.details.feed, amount: e.details.amount ?? null };
  const m = e.label.match(/^Fed — (.+?)(?: \(([\d.]+)kg\))?$/); // older records only have the label
  return m ? { feed: m[1], amount: m[2] ? Number(m[2]) : null } : null;
}

/** Short extra line shown under a record, built from its details. */
export function eventDetailText(e: AnimalEvent): string | null {
  const d = e.details;
  if (!d) return null;
  const parts: string[] = [];
  if (e.type === "death") {
    if (d.place) parts.push(d.place === "outside" ? "Outside the enclosure" : "Inside the enclosure");
    if (d.killer) parts.push(d.killer);
  }
  if (e.type === "health") {
    if (d.animal) parts.push(d.animal);
    if (d.problem) parts.push(d.problem);
  }
  if (e.type === "recount" && d.counted !== undefined) parts.push(`Counted ${d.counted}`);
    if (e.type === "treatment") {
    if (d.dose) parts.push(d.dose);
    if (d.withdrawalDays) parts.push(`Wait ${d.withdrawalDays} days before selling meat or milk`);
  }

  if (d.note) parts.push(d.note);
  return parts.length ? parts.join(" · ") : null;
}

export const animalHref = (id: string) => `/animals/${id}`;