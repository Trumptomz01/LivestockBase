"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState, todayISO } from "@/lib/store";
import { aliveCount } from "@/lib/group";
import { TopBar } from "@/components/ui/TopBar";
import { CountInput } from "@/components/ui/CountInput";

export default function Recount() {
  const router = useRouter();
  const { currentAnimalId, getAnimal, recordGroupEvent, isOnline, setLastSavedMessage } = useAppState();
  const animal = currentAnimalId ? getAnimal(currentAnimalId) : undefined;
  const alive = animal ? aliveCount(animal) : 0;

  const [counted, setCounted] = useState(alive);

  if (!animal) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <TopBar />
        <p>No animal selected — go back and pick one first.</p>
      </div>
    );
  }

  const delta = counted - alive;

  function save() {
    if (!animal || delta === 0) return;
    const event = recordGroupEvent({
      animalId: animal.id,
      type: "recount",
      count: delta,
      when: todayISO(),
      label: `Counted again — ${counted} (was ${alive})`,
      details: { counted },
    });
    setLastSavedMessage(
      `${event.label} — saved for ${animal.name}. ${isOnline ? "Saved." : "Saved on this phone — will sync when you're back online."}`
    );
    router.push("/saved");
  }

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-1">Count again</h1>
      <p className="text-text-muted text-[14px]">
        Count the animals in {animal.name}, then type the number. The app has {alive}.
      </p>

      <CountInput value={counted} onChange={setCounted} min={0} label="How many are there now" />

      <p className="text-[15px] text-text-muted">
        {delta === 0
          ? "Same as the app. Nothing to change."
          : delta > 0
          ? `That is ${delta} more than the app has.`
          : `That is ${-delta} fewer than the app has.`}
      </p>

      <div className="mt-auto pt-4">
        <button
          onClick={save}
          disabled={delta === 0}
          className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px] disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </div>
  );
}