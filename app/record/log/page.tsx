"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState, logTypeConfig, LogType, todayISO } from "@/lib/store";
import type { EventDetails } from "@/lib/store";
import { aliveCount, isGroup, lastFeeding } from "@/lib/group";
import { TopBar } from "@/components/ui/TopBar";
import { Chip } from "@/components/ui/Chip";
import { Stepper } from "@/components/ui/Stepper";
import { CountInput } from "@/components/ui/CountInput";
import { WhenPicker } from "@/components/WhenPicker";

function LogInner() {
  const router = useRouter();
  const params = useSearchParams();
  const type = (params.get("type") as LogType) || "feeding";
  const cfg = logTypeConfig[type];
  const { currentAnimalId, getAnimal, animalsInModule, logEvent, isOnline, setLastSavedMessage } = useAppState();
  const animal = currentAnimalId ? getAnimal(currentAnimalId) : undefined;
  const group = animal ? isGroup(animal) : false;

  // For groups, births are recorded on their own screen (with a number).
  const options =
    group && type === "breeding" ? cfg.primaryOptions.filter((o) => o !== "Gave birth") : cfg.primaryOptions;

  // Feeding starts filled in from last time.
  const last = animal && type === "feeding" ? lastFeeding(animal) : null;
  const startFeed = last && options.includes(last.feed) ? last.feed : options[0] || null;

  const [primary, setPrimary] = useState<string | null>(startFeed);
  const [when, setWhen] = useState<string>(todayISO());
  const [amount, setAmount] = useState(() => {
    const a = last?.amount ?? cfg.startAmount ?? 0;
    return group ? Math.round(a) : a;
  });
  const [skipped, setSkipped] = useState<string[]>([]);

  if (!animal) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <TopBar />
        <p>No animal selected — go back and pick one first.</p>
      </div>
    );
  }

  // Feeding can cover every group of this type in one go.
  const others =
    type === "feeding"
      ? animalsInModule(animal.module).filter((a) => a.id !== animal.id && aliveCount(a) > 0)
      : [];
  const targets = [animal, ...others];
  const selected = targets.filter((t) => !skipped.includes(t.id));
  const bulk = type === "feeding" && (group || others.length > 0);

  function toggle(id: string) {
    setSkipped((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    if (selected.length === 0) return;
    const details: EventDetails | null =
      type === "feeding" && primary
        ? { feed: primary, amount: cfg.showAmount ? amount : undefined, unit: cfg.unit }
        : null;

    let firstLabel = "";
    for (const t of selected) {
      const ev = logEvent(t.id, type, primary, cfg.showAmount ? amount : null, when, details);
      if (!firstLabel) firstLabel = ev.label;
    }
    const where =
      selected.length === 1
        ? selected[0].name
        : `${selected.length} ${selected.every((t) => !isGroup(t)) ? "animals" : "groups"}`;
    setLastSavedMessage(
      `${firstLabel} — saved for ${where}. ${isOnline ? "Saved." : "Saved on this phone — will sync when you're back online."}`
    );
    router.push("/saved");
  }

  const amountLabel =
    type === "feeding" && selected.length > 1
      ? "How much for each one?"
      : group && type === "feeding"
      ? "How much, in total?"
      : cfg.amountLabel;

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-1">{cfg.title} for {animal.name}</h1>
      {group && selected.length <= 1 && (
        <p className="text-text-muted text-[14px] mb-1">
          This record covers all {aliveCount(animal)} animals in the group.
        </p>
      )}
      {last && (
        <p className="text-text-muted text-[14px] mb-1">Filled in from last time. Change anything that is different.</p>
      )}

      {options.length > 0 && (
        <>
          <p className="mt-2.5 mb-1.5">{cfg.primaryLabel}</p>
          <div className="flex gap-2.5 flex-wrap mb-1">
            {options.map((o) => (
              <Chip key={o} label={o} selected={primary === o} onClick={() => setPrimary(o)} />
            ))}
          </div>
        </>
      )}

      {cfg.showAmount && (
        <>
          <p className="mt-3.5">{amountLabel}</p>
          {bulk ? (
            <>
              <CountInput value={Math.round(amount)} onChange={setAmount} min={0} label={amountLabel ?? "Amount"} />
              <p className="text-center text-text-muted -mt-3">{cfg.unit}</p>
            </>
          ) : (
            <Stepper value={amount} unit={cfg.unit || ""} onChange={setAmount} />
          )}
        </>
      )}

      {others.length > 0 && (
        <>
          <p className="mt-3.5 mb-1.5">Who did you feed?</p>
          <div className="flex flex-col gap-2 mb-1">
            {targets.map((t) => {
              const on = !skipped.includes(t.id);
              const n = aliveCount(t);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggle(t.id)}
                  aria-pressed={on}
                  className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left ${
                    on ? "border-primary bg-success-bg" : "border-border"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 ${
                        on ? "border-primary bg-primary text-on-primary" : "border-border"
                      }`}
                    >
                      {on && (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="font-bold text-[16px]">{t.name}</span>
                  </span>
                  <span className="text-[14px] text-text-muted">
                    {n} {n === 1 ? "animal" : "animals"}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <WhenPicker value={when} onChange={setWhen} />

      <div className="mt-auto pt-4">
        <button
          onClick={save}
          disabled={selected.length === 0}
          className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px] disabled:opacity-60"
        >
          {selected.length > 1 ? `Save for ${selected.length}` : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function LogForm() {
  return (
    <Suspense fallback={null}>
      <LogInner />
    </Suspense>
  );
}