"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState, todayISO } from "@/lib/store";
import { aliveCount } from "@/lib/group";
import { TopBar } from "@/components/ui/TopBar";
import { Chip } from "@/components/ui/Chip";
import { CountInput } from "@/components/ui/CountInput";
import { WhenPicker } from "@/components/WhenPicker";

export default function RecordBorn() {
  const router = useRouter();
  const { currentAnimalId, getAnimal, recordGroupEvent, isOnline, setLastSavedMessage } = useAppState();
  const animal = currentAnimalId ? getAnimal(currentAnimalId) : undefined;

  const [kind, setKind] = useState<"birth" | "added">("birth");
  const [count, setCount] = useState(1);
  const [when, setWhen] = useState(todayISO());

  if (!animal) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <TopBar />
        <p>No animal selected — go back and pick one first.</p>
      </div>
    );
  }

  function save() {
    if (!animal || count < 1) return;
    const event = recordGroupEvent({
      animalId: animal.id,
      type: kind,
      count,
      when,
      label: kind === "birth" ? `${count} born` : `${count} added to the group`,
    });
    setLastSavedMessage(
      `${event.label} — saved for ${animal.name}. ${isOnline ? "Saved." : "Saved on this phone — will sync when you're back online."}`
    );
    router.push("/saved");
  }

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-1">Births or new arrivals</h1>
      <p className="text-text-muted text-[14px]">{animal.name} has {aliveCount(animal)} alive. These will join the group.</p>

      <div className="flex gap-2.5 flex-wrap mt-4">
        <Chip label="Born here" selected={kind === "birth"} onClick={() => setKind("birth")} />
        <Chip label="Brought in or bought" selected={kind === "added"} onClick={() => setKind("added")} />
      </div>

      <p className="mt-4 font-bold">How many?</p>
      <CountInput value={count} onChange={setCount} min={1} label="How many" />

      <WhenPicker value={when} onChange={setWhen} />

      <div className="mt-auto pt-4">
        <button
          onClick={save}
          disabled={count < 1}
          className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px] disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </div>
  );
}