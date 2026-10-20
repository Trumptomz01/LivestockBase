"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState, todayISO } from "@/lib/store";
import type { EventDetails } from "@/lib/store";
import { aliveCount, sickCount } from "@/lib/group";
import { TopBar } from "@/components/ui/TopBar";
import { CountInput } from "@/components/ui/CountInput";
import { WhenPicker } from "@/components/WhenPicker";

export default function ReportSick() {
  const router = useRouter();
  const { currentAnimalId, getAnimal, recordGroupEvent, isOnline, setLastSavedMessage } = useAppState();
  const animal = currentAnimalId ? getAnimal(currentAnimalId) : undefined;

  const alive = animal ? aliveCount(animal) : 0;
  const current = animal ? sickCount(animal) : 0;

  const [sickNow, setSickNow] = useState(current > 0 ? current : 1);
  const [which, setWhich] = useState("");
  const [problem, setProblem] = useState("");
  const [when, setWhen] = useState(todayISO());

  if (!animal) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <TopBar />
        <p>No animal selected — go back and pick one first.</p>
      </div>
    );
  }

  const tooMany = sickNow > alive;

  function save() {
    if (!animal || tooMany) return;
    const details: EventDetails = {};
    if (sickNow > 0 && which.trim()) details.animal = which.trim();
    if (sickNow > 0 && problem.trim()) details.problem = problem.trim();

    const event = recordGroupEvent({
      animalId: animal.id,
      type: "health",
      count: sickNow,
      when,
      label: sickNow === 0 ? "Health check — all well" : `Health check — ${sickNow} sick`,
      flag: sickNow > 0,
      details: Object.keys(details).length ? details : null,
    });
    setLastSavedMessage(
      `${event.label} — saved for ${animal.name}. ${isOnline ? "Saved." : "Saved on this phone — will sync when you're back online."}`
    );
    router.push("/saved");
  }

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-1">How many are sick now?</h1>
      <p className="text-text-muted text-[14px]">
        {animal.name}: {current} sick out of {alive} right now. Type 0 if they are all well.
      </p>

      <CountInput value={sickNow} onChange={setSickNow} min={0} max={alive} label="How many are sick" />
      {tooMany && (
        <p className="text-danger text-sm" role="alert">
          There are only {alive} animals in this group.
        </p>
      )}

      {sickNow > 0 && (
        <>
          <label className="block text-[15px] font-bold mt-2 mb-2">Which animal? (optional)</label>
          <input
            value={which}
            onChange={(e) => setWhich(e.target.value)}
            placeholder="e.g. the brown one with the torn ear"
            className="w-full p-4 text-[16px] rounded border-2 border-border bg-surface text-text mb-3"
          />
          <label className="block text-[15px] font-bold mb-2">What is wrong? (optional)</label>
          <input
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. limping, not eating"
            className="w-full p-4 text-[16px] rounded border-2 border-border bg-surface text-text mb-1"
          />
        </>
      )}

      <WhenPicker value={when} onChange={setWhen} />

      <div className="mt-auto pt-4">
        <button
          onClick={save}
          disabled={tooMany}
          className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px] disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </div>
  );
}