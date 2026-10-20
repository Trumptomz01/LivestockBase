"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAppState, formatWhen, moduleById } from "@/lib/store";
import { periodOptions, periodPhrase } from "@/lib/farmStats";
import type { Period } from "@/lib/farmStats";
import { healthReport, addDaysISO } from "@/lib/health";
import { animalHref, eventDetailText } from "@/lib/group";
import { Chip } from "@/components/ui/Chip";

function Title({ children }: { children: ReactNode }) {
  return <div className="text-[14px] font-bold text-text-muted mt-7 mb-2">{children}</div>;
}

function Stat({ value, label, alert = false }: { value: number; label: string; alert?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${alert ? "bg-flag-bg border-flag/40" : "bg-surface border-border"}`}>
      <div className={`text-[36px] font-bold leading-none ${alert ? "text-flag" : ""}`}>{value}</div>
      <div className="text-[14px] text-text-muted mt-2">{label}</div>
    </div>
  );
}

function More({ open, total, shown, onClick }: { open: boolean; total: number; shown: number; onClick: () => void }) {
  if (total <= shown) return null;
  return (
    <button onClick={onClick} className="w-full py-3 text-primary font-bold text-[14px]">
      {open ? "Show less" : `Show all ${total}`}
    </button>
  );
}

export default function Health() {
  const router = useRouter();
  const { hydrated, syncStatus, animals, retrySync } = useAppState();
  const [period, setPeriod] = useState<Period>("month");
  const [allTreatments, setAllTreatments] = useState(false);
  const [allDeaths, setAllDeaths] = useState(false);
  const [allTimeline, setAllTimeline] = useState(false);

  if (!hydrated || syncStatus === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" role="status" aria-label="Loading" />
      </div>
    );
  }
  if (syncStatus === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="font-bold">We couldn&apos;t load your health records.</p>
        <button onClick={retrySync} className="rounded bg-primary px-5 py-3 font-bold text-on-primary">
          Try again
        </button>
      </div>
    );
  }

  const r = healthReport(animals, period);
  const phrase = periodPhrase(period);
  const healthy = r.alive - r.sick;
  const maxCause = r.byCause[0]?.count ?? 1;
  const maxBar = Math.max(1, ...r.monthly.flatMap((m) => [m.deaths, m.sickReports]));
  const barH = (v: number) => (v === 0 ? 0 : Math.max(4, Math.round((v / maxBar) * 72)));
  const deaths6 = r.monthly.reduce((n, m) => n + m.deaths, 0);
  const sick6 = r.monthly.reduce((n, m) => n + m.sickReports, 0);

  const rateText =
    r.deathRate === null
      ? null
      : r.died === 0
      ? `No deaths recorded ${phrase}.`
      : `About ${r.deathRate} of every 100 animals died ${phrase}.`;

  return (
    <div className="flex flex-col flex-1 pb-5 pt-6">
      <h1 className="text-2xl font-bold">Health</h1>
      <p className="text-text-muted text-[14px] mt-0.5">Sick animals, treatments and deaths across your farm.</p>

      {r.withdrawals.length > 0 && (
        <div className="mt-4 rounded-2xl border border-flag/40 bg-flag-bg p-4">
          <div className="font-bold text-flag text-[16px]">Do not sell meat or milk yet</div>
          {r.withdrawals.map((w) => (
            <button
              key={w.id}
              onClick={() => router.push(animalHref(w.animal.id))}
              className="block w-full text-left mt-2.5"
            >
              <span className="block text-[15px] font-bold">
                {w.animal.name}: {w.treated} treated with {w.medicine}
              </span>
              <span className="block text-[14px] text-text-muted">
                {w.daysLeft === 0 ? "Waiting period ends today" : `${w.daysLeft} more day${w.daysLeft > 1 ? "s" : ""}`} · until{" "}
                {formatWhen(w.endsOn)}
              </span>
            </button>
          ))}
          <p className="text-[12px] text-text-muted mt-3">
            The app only counts the days you entered. Follow the medicine label or your vet.
          </p>
        </div>
      )}

      <div className="text-[14px] font-bold text-text-muted mt-5 mb-2">Show deaths and treatments for</div>
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {periodOptions.map((o) => (
          <Chip key={o.id} label={o.label} selected={period === o.id} onClick={() => setPeriod(o.id)} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stat value={r.alive} label="Animals alive" />
        <Stat value={healthy} label="Healthy now" />
        <Stat value={r.sick} label="Sick now" alert={r.sick > 0} />
        <Stat value={r.died} label={`Died ${phrase}`} />
      </div>
      {rateText && <p className="text-[15px] mt-3">{rateText}</p>}

      <Title>Sick now</Title>
      {r.sickGroups.length === 0 ? (
        <p className="text-[15px]">No animals are sick right now.</p>
      ) : (
        r.sickGroups.map((g) => (
          <button
            key={g.animal.id}
            onClick={() => router.push(animalHref(g.animal.id))}
            className="w-full text-left rounded-xl border border-border bg-surface p-3.5 mb-2.5"
          >
            <div className="flex justify-between gap-3">
              <b className="text-[16px]">{g.animal.name}</b>
              <span className="text-flag font-bold text-[14px] shrink-0">
                {g.sick} sick of {g.alive}
              </span>
            </div>
            <div className="text-[13px] text-text-muted mt-0.5">{moduleById(g.animal.module).label}</div>
            {g.which && <div className="text-[14px] mt-1.5">Which: {g.which}</div>}
            {g.problem && <div className="text-[14px]">Problem: {g.problem}</div>}
            {g.since && <div className="text-[13px] text-text-muted mt-1">Last reported {formatWhen(g.since)}</div>}
          </button>
        ))
      )}

      <Title>By group</Title>
      {r.groupRows.length === 0 ? (
        <p className="text-[15px]">No groups yet.</p>
      ) : (
        r.groupRows.map((g) => (
          <button
            key={g.animal.id}
            onClick={() => router.push(animalHref(g.animal.id))}
            className="w-full text-left py-3 border-b border-border"
          >
            <div className="flex justify-between gap-3 text-[16px]">
              <span>{g.animal.name}</span>
              <span className="text-[14px] text-text-muted shrink-0">
                {g.alive} alive{g.sick > 0 ? ` · ${g.sick} sick` : ""}
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 mt-2 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${g.healthyPct}%` }} />
            </div>
            <div className="text-[12px] text-text-muted mt-1">{g.healthyPct}% healthy</div>
          </button>
        ))
      )}

      <Title>Treatments {phrase}</Title>
      {r.treatments.length === 0 ? (
        <p className="text-[15px]">No treatments recorded {phrase}.</p>
      ) : (
        <>
          {(allTreatments ? r.treatments : r.treatments.slice(0, 3)).map((t) => {
            const days = t.event.details?.withdrawalDays ?? 0;
            return (
              <button
                key={t.id}
                onClick={() => router.push(animalHref(t.animal.id))}
                className="flex w-full justify-between gap-3 py-3 border-b border-border text-left"
              >
                <div>
                  <b className="block text-[15px]">{t.event.label}</b>
                  <span className="block text-[13px] text-text-muted">
                    {[t.animal.name, eventDetailText(t.event)].filter(Boolean).join(" · ")}
                  </span>
                  {days > 0 && (
                    <span className="block text-[13px] text-text-muted">
                      Waiting period until {formatWhen(addDaysISO(t.event.when, days))}
                    </span>
                  )}
                </div>
                <span className="text-[13px] text-text-muted shrink-0">{formatWhen(t.event.when)}</span>
              </button>
            );
          })}
          <More open={allTreatments} total={r.treatments.length} shown={3} onClick={() => setAllTreatments((v) => !v)} />
        </>
      )}

      <Title>Deaths {phrase}</Title>
      {r.died === 0 ? (
        <p className="text-[15px]">No deaths recorded {phrase}.</p>
      ) : (
        <>
          <div className="text-[13px] font-bold text-text-muted mb-1">What happened</div>
          {r.byCause.map((c) => (
            <div key={c.cause} className="py-2.5 border-b border-border">
              <div className="flex justify-between text-[16px]">
                <span>{c.cause}</span>
                <span className="font-bold">{c.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 mt-1.5 overflow-hidden">
                <div className="h-full bg-flag" style={{ width: `${(c.count / maxCause) * 100}%` }} />
              </div>
            </div>
          ))}

          <div className="text-[13px] font-bold text-text-muted mt-4 mb-1">Where it happened</div>
          <div className="flex justify-between py-2.5 border-b border-border text-[16px]">
            <span>Inside the enclosure</span>
            <b>{r.place.inside}</b>
          </div>
          <div className="flex justify-between py-2.5 border-b border-border text-[16px]">
            <span>Outside the enclosure</span>
            <b>{r.place.outside}</b>
          </div>
          <div className="flex justify-between py-2.5 border-b border-border text-[16px] text-text-muted">
            <span>Not recorded</span>
            <b>{r.place.unknown}</b>
          </div>

          <div className="text-[13px] font-bold text-text-muted mt-4 mb-1">Records</div>
          {(allDeaths ? r.deaths : r.deaths.slice(0, 3)).map((d) => (
            <button
              key={d.id}
              onClick={() => router.push(animalHref(d.animal.id))}
              className="flex w-full justify-between gap-3 py-3 border-b border-border text-left"
            >
              <div>
                <b className="block text-[15px]">
                  {d.count} died · {d.cause}
                </b>
                <span className="block text-[13px] text-text-muted">
                  {[
                    d.animal.name,
                    d.place === "outside" ? "Outside the enclosure" : d.place === "inside" ? "Inside the enclosure" : null,
                    d.killer,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
              <span className="text-[13px] text-text-muted shrink-0">{formatWhen(d.when)}</span>
            </button>
          ))}
          <More open={allDeaths} total={r.deaths.length} shown={3} onClick={() => setAllDeaths((v) => !v)} />
        </>
      )}

      <Title>Last 6 months</Title>
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex gap-4 text-[13px]">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-primary" />
            Sick reports
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-flag" />
            Deaths
          </span>
        </div>
        <div
          className="flex items-end justify-between h-[80px] mt-4"
          role="img"
          aria-label={`Deaths and sick reports for the last 6 months: ${deaths6} deaths, ${sick6} sick reports`}
        >
          {r.monthly.map((m) => (
            <div key={m.key} className="flex w-7 items-end justify-center gap-1">
              <div className="w-3 rounded-t bg-primary" style={{ height: barH(m.sickReports) }} />
              <div className="w-3 rounded-t bg-flag" style={{ height: barH(m.deaths) }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[12px] text-text-muted mt-1.5">
          {r.monthly.map((m) => (
            <span key={m.key} className="w-7 text-center">
              {m.label}
            </span>
          ))}
        </div>
        <p className="text-[14px] mt-3">
          {deaths6} death{deaths6 === 1 ? "" : "s"} and {sick6} sick report{sick6 === 1 ? "" : "s"} in the last 6 months.
        </p>
      </div>

      <Title>Everything recorded {phrase}</Title>
      {r.timeline.length === 0 ? (
        <p className="text-[15px]">Nothing recorded {phrase}.</p>
      ) : (
        <>
          {(allTimeline ? r.timeline : r.timeline.slice(0, 6)).map((t) => (
            <button
              key={t.id}
              onClick={() => router.push(animalHref(t.animal.id))}
              className="flex w-full gap-3 py-3 border-b border-border text-left items-start"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  t.event.type === "death" || t.event.flag ? "bg-flag" : "bg-primary"
                }`}
              />
              <div className="flex-1">
                <b className="block text-[15px]">{t.event.label}</b>
                <span className="block text-[13px] text-text-muted">
                  {[t.animal.name, eventDetailText(t.event)].filter(Boolean).join(" · ")}
                </span>
              </div>
              <span className="text-[13px] text-text-muted shrink-0">{formatWhen(t.event.when)}</span>
            </button>
          ))}
          <More open={allTimeline} total={r.timeline.length} shown={6} onClick={() => setAllTimeline((v) => !v)} />
        </>
      )}

      <p className="text-[12px] text-text-muted mt-6">
        These numbers come from what you record. Report sick animals, treatments and deaths to keep this page right.
      </p>
    </div>
  );
}