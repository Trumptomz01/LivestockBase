import { todayISO } from "@/lib/store";
import type { Animal, AnimalEvent } from "@/lib/store";
import { aliveCount, sickCount } from "@/lib/group";
import { periodStartISO } from "@/lib/farmStats";
import type { Period } from "@/lib/farmStats";

function localISO(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localISO(d);
}

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(`${fromISO}T00:00:00`).getTime();
  const b = new Date(`${toISO}T00:00:00`).getTime();
  return Math.round((b - a) / 86400000);
}

export type Withdrawal = {
  id: string;
  animal: Animal;
  medicine: string;
  treated: number;
  endsOn: string;
  daysLeft: number;
};

/** Treatments whose waiting period has not finished yet. The days are whatever the farmer entered. */
export function activeWithdrawals(a: Animal, today: string = todayISO()): Withdrawal[] {
  const out: Withdrawal[] = [];
  for (const e of a.events) {
    const days = e.details?.withdrawalDays ?? 0;
    if (e.type !== "treatment" || days <= 0) continue;
    const endsOn = addDaysISO(e.when, days);
    const daysLeft = daysBetween(today, endsOn);
    if (daysLeft >= 0) {
      out.push({ id: e.id, animal: a, medicine: e.details?.medicine ?? "Treatment", treated: e.count ?? 0, endsOn, daysLeft });
    }
  }
  return out;
}

export type DeathItem = {
  id: string;
  animal: Animal;
  count: number;
  when: string;
  cause: string;
  place: string | null;
  killer: string | null;
};

function deathsOf(a: Animal): DeathItem[] {
  const items: DeathItem[] = a.events
    .filter((e) => e.type === "death")
    .map((e) => ({
      id: e.id,
      animal: a,
      count: e.count ?? 0,
      when: e.when,
      cause: e.details?.cause ?? "Not recorded",
      place: e.details?.place ?? null,
      killer: e.details?.killer ?? null,
    }));
  // Older single-animal records marked deceased before groups existed.
  if (items.length === 0 && a.status === "deceased" && a.deathDate) {
    items.push({
      id: `legacy-${a.id}`,
      animal: a,
      count: 1,
      when: a.deathDate,
      cause: a.deathCause || "Not recorded",
      place: null,
      killer: null,
    });
  }
  return items;
}

export type TimelineItem = { id: string; animal: Animal; event: AnimalEvent };

export function healthReport(animals: Animal[], period: Period) {
  const start = periodStartISO(period);
  const today = todayISO();
  const inPeriod = (iso: string) => iso <= today && (start === null || iso >= start);

  const alive = animals.reduce((n, a) => n + aliveCount(a), 0);
  const sick = animals.reduce((n, a) => n + sickCount(a), 0);

  // Deaths
  const allDeaths = animals.flatMap(deathsOf);
  const deaths = allDeaths.filter((d) => inPeriod(d.when)).sort((a, b) => b.when.localeCompare(a.when));
  const died = deaths.reduce((n, d) => n + d.count, 0);
  const deathRate = alive + died > 0 ? Math.round((died / (alive + died)) * 1000) / 10 : null;

  const causeMap = new Map<string, number>();
  for (const d of deaths) causeMap.set(d.cause, (causeMap.get(d.cause) ?? 0) + d.count);
  const byCause = Array.from(causeMap.entries())
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count);

  const place = { inside: 0, outside: 0, unknown: 0 };
  for (const d of deaths) {
    if (d.place === "inside") place.inside += d.count;
    else if (d.place === "outside") place.outside += d.count;
    else place.unknown += d.count;
  }

  // Sick now
  const sickGroups = animals
    .filter((a) => sickCount(a) > 0)
    .map((a) => {
      const latest = a.events.find((e) => e.type === "health"); // newest first
      return {
        animal: a,
        sick: sickCount(a),
        alive: aliveCount(a),
        since: latest?.when ?? null,
        which: latest?.details?.animal ?? null,
        problem: latest?.details?.problem ?? null,
      };
    })
    .sort((x, y) => y.sick - x.sick);

  // Per group
  const groupRows = animals
    .filter((a) => aliveCount(a) > 0)
    .map((a) => {
      const n = aliveCount(a);
      const s = sickCount(a);
      return { animal: a, alive: n, sick: s, healthyPct: Math.round(((n - s) / n) * 100) };
    })
    .sort((x, y) => x.healthyPct - y.healthyPct);

  // Treatments and waiting periods
  const treatments: TimelineItem[] = animals
    .flatMap((a) =>
      a.events.filter((e) => e.type === "treatment" && inPeriod(e.when)).map((e) => ({ id: e.id, animal: a, event: e }))
    )
    .sort((x, y) => y.event.when.localeCompare(x.event.when));

  const withdrawals = animals
    .filter((a) => aliveCount(a) > 0)
    .flatMap((a) => activeWithdrawals(a, today))
    .sort((x, y) => y.daysLeft - x.daysLeft);

  // Timeline
  const timeline: TimelineItem[] = animals
    .flatMap((a) =>
      a.events
        .filter((e) => (e.type === "health" || e.type === "death" || e.type === "treatment") && inPeriod(e.when))
        .map((e) => ({ id: e.id, animal: a, event: e }))
    )
    .sort((x, y) => y.event.when.localeCompare(x.event.when));

  // Last six months
  const [y, m] = today.split("-").map(Number);
  const monthly: { key: string; label: string; deaths: number; sickReports: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    monthly.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString(undefined, { month: "short" }),
      deaths: 0,
      sickReports: 0,
    });
  }
  for (const d of allDeaths) {
    const mo = monthly.find((x) => x.key === d.when.slice(0, 7));
    if (mo) mo.deaths += d.count;
  }
  for (const a of animals) {
    for (const e of a.events) {
      if (e.type !== "health") continue;
      const sickAmount = e.count ?? (e.flag ? 1 : 0);
      const mo = monthly.find((x) => x.key === e.when.slice(0, 7));
      if (mo && sickAmount > 0) mo.sickReports += 1;
    }
  }

  return { alive, sick, died, deathRate, deaths, byCause, place, sickGroups, groupRows, treatments, withdrawals, timeline, monthly };
}