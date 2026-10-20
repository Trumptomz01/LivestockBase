"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState, todayISO, formatWhen } from "@/lib/store";
import type { EventDetails } from "@/lib/store";
import { aliveCount, sickCount, isGroup } from "@/lib/group";
import { addDaysISO } from "@/lib/health";
import { TopBar } from "@/components/ui/TopBar";
import { Chip } from "@/components/ui/Chip";
import { CountInput } from "@/components/ui/CountInput";
import { WhenPicker } from "@/components/WhenPicker";

const KINDS = ["Antibiotic", "Dewormer", "Vitamins", "Tick treatment"];

export default function RecordTreatment() {
  const router = useRouter();
  const { currentAnimalId, getAnimal, recordGroupEvent, isOnline, setLastSavedMessage } = useAppState();
  const animal = currentAnimalId ? getAnimal(currentAnimalId) : undefined;
  const alive = animal ? aliveCount(animal) : 0;
  const group = animal ? isGroup(animal) : false;

  const [kind, setKind] = useState("");
  const [custom, setCustom] = useState("");
  const [treated, setTreated] = useState(() => {
    const s = animal ? sickCount(animal) : 0;
    return s > 0 ? s : 1;
  });
  const [dose, setDose] = useState("");
  const [waitDays, setWaitDays] = useState(0);
  const [note, setNote] = useState("");
  const [when, setWhen] = useState(todayISO());

  if (!animal) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <TopBar />
        <p>No animal selected — go back and pick one first.</p>
      </div>
    );
  }

  const medicine = custom.trim() || kind;
  const count = group ? treated : 1;
  const tooMany = count > alive;
  const invalid = !medicine || count < 1 || tooMany;

  function save() {
    if (!animal || invalid) return;
    const details: EventDetails = { medicine };
    if (dose.trim()) details.dose = dose.trim();
    if (waitDays > 0) details.withdrawalDays = waitDays;
    if (note.trim()) details.note = note.trim();

    const event = recordGroupEvent({
      animalId: animal.id,
      type: "treatment",
      count,
      when,
      label: group ? `${count} treated — ${medicine}` : `Treated — ${medicine}`,
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
      <h1 className="text-2xl font-bold mb-1">Treatment given</h1>
      <p className="text-text-muted text-[14px]">{animal.name}{group ? ` has ${alive} alive` : ""}.</p>

      <p className="mt-4 mb-1.5 font-bold">What was given?</p>
      <div className="flex gap-2 flex-wrap mb-3">
        {KINDS.map((k) => (
          <Chip
            key={k}
            label={k}
            selected={kind === k}
            onClick={() => {
              setKind(k);
              setCustom("");
            }}
          />
        ))}
      </div>
      <input
        value={custom}
        onChange={(e) => {
          setCustom(e.target.value);
          if (e.target.value) setKind("");
        }}
        placeholder="Or write the medicine name"
        className="w-full p-4 text-[16px] rounded border-2 border-border bg-surface text-text mb-3"
      />

      {group && (
        <>
          <p className="mt-1 font-bold">How many were treated?</p>
          <CountInput value={treated} onChange={setTreated} min={1} max={alive} label="How many were treated" />
          {tooMany && (
            <p className="text-danger text-sm" role="alert">
              There are only {alive} animals in this group.
            </p>
          )}
        </>
      )}

      <label className="block text-[15px] font-bold mb-2">How much? (optional)</label>
      <input
        value={dose}
        onChange={(e) => setDose(e.target.value)}
        placeholder="e.g. 5 ml each"
        className="w-full p-4 text-[16px] rounded border-2 border-border bg-surface text-text mb-3"
      />

      <p className="font-bold">Days to wait before selling meat or milk (optional)</p>
      <p className="text-text-muted text-[13px]">Use the number on the medicine label or from your vet. 0 means no waiting.</p>
      <CountInput value={waitDays} onChange={setWaitDays} min={0} max={365} label="Days to wait" />
      {waitDays > 0 && (
        <p className="text-[15px] -mt-2 mb-2">
          Do not sell meat or milk from these animals until {formatWhen(addDaysISO(when, waitDays))}.
        </p>
      )}

      <label className="block text-[15px] font-bold mb-2">Note (optional)</label>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. given by the vet"
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