"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState, moduleById, modules } from "@/lib/store";
import { TopBar } from "@/components/ui/TopBar";
import { Chip } from "@/components/ui/Chip";
import { IconPaths } from "@/components/ui/IconPaths";

export default function AddAnimal() {
  const router = useRouter();
  const { addAnimal, selectedModules, addSelectedModule } = useAppState();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [moduleId, setModuleId] = useState<typeof modules[number]["id"] | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("Adult");
  const [savingType, setSavingType] = useState(false);

  const m = moduleId ? moduleById(moduleId) : null;

  async function pickModule(id: typeof modules[number]["id"]) {
    setModuleId(id);
    if (!selectedModules.includes(id)) {
      setSavingType(true);
      await addSelectedModule(id); // expands the farmer's modules + persists to Supabase
      setSavingType(false);
    }
    setStep(1);
  }

  function save() {
    if (!m) return;
    const finalName = name.trim() || m.defaultName;
    addAnimal(finalName, m.id, age);
    router.push("/added");
  }

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <div className="flex gap-2 justify-center mb-3">
        {[0, 1, 2].map((s) => (
          <span
            key={s}
            className="h-2 rounded-full"
            style={{ width: step === s ? 22 : 8, background: step >= s ? "var(--primary)" : "var(--border)" }}
          />
        ))}
      </div>

      {step === 0 && (
        <>
          <h1 className="text-2xl font-bold mb-2">What kind of animal is this?</h1>
          <p className="mb-4">Pick the type you want to add.</p>
          <div className="flex flex-col gap-2.5">
            {modules.map((mm) => (
              <button
                key={mm.id}
                onClick={() => pickModule(mm.id)}
                disabled={savingType}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-surface text-left disabled:opacity-60"
              >
                <IconPaths paths={mm.iconPaths} className="w-8 h-8 text-secondary shrink-0" />
                <span className="font-bold text-[16px]">{mm.label}</span>
                {!selectedModules.includes(mm.id) && (
                  <span className="ml-auto text-[12px] text-text-muted">New</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 1 && m && (
        <>
          <h1 className="text-2xl font-bold mb-2">What&apos;s this {m.singular} called?</h1>
          <p>A name or a number — whatever you&apos;ll remember it by.</p>
          <div className="my-4">
            <label className="block text-[15px] font-bold mb-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={m.isBatch ? `e.g. ${m.label} Pen 1` : `e.g. ${m.defaultName}`}
              className="w-full p-4 text-xl rounded border-2 border-border bg-surface text-text"
            />
          </div>
          <div className="flex flex-col items-center gap-2.5 my-5">
            <div
              onClick={() => alert("Camera would open here")}
              className="w-[100px] h-[100px] rounded-full border-2 border-dashed border-border bg-surface-2 flex items-center justify-center text-text-muted cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13.5" r="3.5" />
              </svg>
            </div>
            <span className="text-sm text-text-muted">Add a photo (optional)</span>
          </div>
          <div className="mt-auto pt-4">
            <button onClick={() => setStep(2)} className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px]">
              Next
            </button>
          </div>
        </>
      )}

      {step === 2 && m && (
        <>
          <h1 className="text-2xl font-bold mb-2">How old, roughly?</h1>
          <p>Just your best guess is fine.</p>
          <div className="flex gap-2.5 flex-wrap my-3.5">
            {["Young", "Adult", "Not sure"].map((label) => (
              <Chip key={label} label={label} selected={age === label} onClick={() => setAge(label)} />
            ))}
          </div>
          <div className="mt-auto pt-4">
            <button onClick={save} className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px]">
              Save animal
            </button>
          </div>
        </>
      )}
    </div>
  );
}