"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState, todayISO, deathCauseSuggestions } from "@/lib/store";
import type { EventDetails } from "@/lib/store";
import { aliveCount } from "@/lib/group";
import { TopBar } from "@/components/ui/TopBar";
import { Chip } from "@/components/ui/Chip";
import { CountInput } from "@/components/ui/CountInput";
import { WhenPicker } from "@/components/WhenPicker";

export default function RecordDeaths() {
  const router = useRouter();
  const { currentAnimalId, getAnimal, recordGroupEvent, isOnline, setLastSavedMessage } = useAppState();
  const animal = currentAnimalId ? getAnimal(currentAnimalId) : undefined;
  const alive = animal ? aliveCount(animal) : 0;

  const [count, setCount] = useState(1);
  const [cause, setCause] = useState("");
  const [customCause, setCustomCause] = useState("");
  const [place, setPlace] = useState<"" | "inside" | "outside">("");
  const [killer, setKiller] = useState("");
  const [when, setWhen] = useState(todayISO());

  if (!animal) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <TopBar />
        <p>No animal selected — go back and pick one first.</p>
      </div>
    );
  }

  const finalCause = customCause.trim() || cause;
  const tooMany = count > alive;
  const invalid = count < 1 || tooMany || !finalCause;

  function save() {
    if (!animal || invalid) return;
    const details: EventDetails = { cause: finalCause };
    if (place) details.place = place;
    if (killer.trim()) details.killer = killer.trim();

    const event = recordGroupEvent({
      animalId: animal.id,
      type: "death",
      count,
      when,
      label: `${count} died — ${finalCause}`,
      flag: true,
      details,
    });
    setLastSavedMessage(
      `${event.label} — saved for ${animal.name}. ${isOnline ? "Saved." : "Saved on this phone — will sync when you're back online."}`
    );
    router.push("/saved");
  }

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-1">How many died?</h1>
      <p className="text-text-muted text-[14px]">{animal.name} has {alive} alive.</p>

      <CountInput value={count} onChange={setCount} min={1} max={alive} label="How many died" />
      {tooMany && (
        <p className="text-danger text-sm" role="alert">
          There are only {alive} animals in this group.
        </p>
      )}
      {!tooMany && count === alive && alive > 0 && (
        <p className="text-text-muted text-[14px]">This will leave no animals in the group.</p>
      )}

      <p className="mt-3 mb-1.5 font-bold">What happened?</p>
      <div className="flex gap-2 flex-wrap mb-3">
        {deathCauseSuggestions.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={cause === c}
            onClick={() => {
              setCause(c);
              setCustomCause("");
            }}
          />
        ))}
      </div>
      <input
        value={customCause}
        onChange={(e) => {
          setCustomCause(e.target.value);
          if (e.target.value) setCause("");
        }}
        placeholder="Or write it yourself"
        className="w-full p-4 text-[16px] rounded border-2 border-border bg-surface text-text mb-3"
      />

      <p className="mb-1.5 font-bold">Where did it happen? (optional)</p>
      <div className="flex gap-2.5 flex-wrap mb-3">
        <Chip label="Inside the enclosure" selected={place === "inside"} onClick={() => setPlace(place === "inside" ? "" : "inside")} />
        <Chip label="Outside the enclosure" selected={place === "outside"} onClick={() => setPlace(place === "outside" ? "" : "outside")} />
      </div>

      <label className="block text-[15px] font-bold mb-2">What killed it? (optional)</label>
      <input
        value={killer}
        onChange={(e) => setKiller(e.target.value)}
        placeholder="e.g. snake bite, a disease, a dog"
        className="w-full p-4 text-[16px] rounded border-2 border-border bg-surface text-text mb-1"
      />

      <WhenPicker value={when} onChange={setWhen} />

      <div className="mt-auto pt-4">
        <button
          onClick={save}
          disabled={invalid}
          className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px] disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </div>
  );
}