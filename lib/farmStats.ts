import { modules, todayISO } from "@/lib/store";
import type { Animal } from "@/lib/store";

export type Period = "week" | "month" | "year" | "all";

export const periodOptions: { id: Period; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
];

export function periodPhrase(p: Period) {
  return p === "week" ? "this week" : p === "month" ? "this month" : p === "year" ? "this year" : "in total";
}

function localISO(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function periodStartISO(period: Period): string | null {
  const today = todayISO();
  if (period === "all") return null;
  if (period === "year") return `${today.slice(0, 4)}-01-01`;
  if (period === "month") return `${today.slice(0, 7)}-01`;
  const d = new Date(`${today}T00:00:00`);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // weeks start on Monday
  return localISO(d);
}

export function farmStats(animals: Animal[], period: Period) {
  const start = periodStartISO(period);
  const today = todayISO();
  const inPeriod = (iso: string | null) => !!iso && iso <= today && (start === null || iso >= start);

  const alive = animals.filter((a) => a.status === "active");
  return {
    alive: alive.length,
    attention: alive.filter((a) => a.attentionFlag).length,
    died: animals.filter((a) => a.status === "deceased" && inPeriod(a.deathDate)).length,
    births: animals.reduce(
      (n, a) => n + a.events.filter((e) => e.label.endsWith("Gave birth") && inPeriod(e.when)).length,
      0
    ),
    byType: modules.map((m) => ({ id: m.id, label: m.label, count: alive.filter((a) => a.module === m.id).length })),
  };
}