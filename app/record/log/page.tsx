"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState, logTypeConfig, LogType, todayISO, yesterdayISO, formatWhen } from "@/lib/store";
import { TopBar } from "@/components/ui/TopBar";
import { Chip } from "@/components/ui/Chip";
import { Stepper } from "@/components/ui/Stepper";

function LogInner() {
  const router = useRouter();
  const params = useSearchParams();
  const type = (params.get("type") as LogType) || "feeding";
  const cfg = logTypeConfig[type];
  const { currentAnimalId, getAnimal, logEvent, isOnline, setLastSavedMessage } = useAppState();
  const animal = currentAnimalId ? getAnimal(currentAnimalId) : undefined;

  const [primary, setPrimary] = useState(cfg.primaryOptions[0] || null);
  const [when, setWhen] = useState<string>(todayISO());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState(cfg.startAmount || 0);

  if (!animal) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <TopBar />
        <p>No animal selected — go back and pick one first.</p>
      </div>
    );
  }

  function save() {
    if (!animal) return;
    const event = logEvent(animal.id, type, primary, cfg.showAmount ? amount : null, when);
    setLastSavedMessage(
      `${event.label} — saved for ${animal.name}. ${isOnline ? "Saved." : "Saved on this phone — will sync when you're back online."}`
    );
    router.push("/saved");
  }

  const isToday = when === todayISO();
  const isYesterday = when === yesterdayISO();

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-3">{cfg.title} for {animal.name}</h1>

      {cfg.primaryOptions.length > 0 && (
        <>
          <p className="mb-1.5">{cfg.primaryLabel}</p>
          <div className="flex gap-2.5 flex-wrap mb-1">
            {cfg.primaryOptions.map((o) => (
              <Chip key={o} label={o} selected={primary === o} onClick={() => setPrimary(o)} />
            ))}
          </div>
        </>
      )}

      {cfg.showAmount && (
        <>
          <p className="mt-3.5">{cfg.amountLabel}</p>
          <Stepper value={amount} unit={cfg.unit || ""} onChange={setAmount} />
        </>
      )}

      <p className="mt-3.5">When?</p>
      <div className="flex gap-2.5 flex-wrap mb-1 items-center">
        <Chip
          label="Today"
          selected={isToday}
          onClick={() => { setWhen(todayISO()); setShowDatePicker(false); }}
        />
        <Chip
          label="Yesterday"
          selected={isYesterday}
          onClick={() => { setWhen(yesterdayISO()); setShowDatePicker(false); }}
        />
        <Chip
          label={!isToday && !isYesterday ? formatWhen(when) : "Pick a date"}
          selected={showDatePicker || (!isToday && !isYesterday)}
          onClick={() => setShowDatePicker(true)}
        />
      </div>
      {showDatePicker && (
        <input
          type="date"
          value={when}
          max={todayISO()}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full p-4 text-xl rounded border-2 border-border bg-surface text-text mt-2"
        />
      )}

      <div className="mt-auto pt-4">
        <button onClick={save} className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px]">
          Save
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