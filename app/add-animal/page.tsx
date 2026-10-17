"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState, moduleById, modules, ModuleId } from "@/lib/store";
import { TopBar } from "@/components/ui/TopBar";
import { Chip } from "@/components/ui/Chip";
import { IconPaths } from "@/components/ui/IconPaths";
import { SkipSetupButton } from "@/components/SkipSetupButton";

type Kind = "one" | "group";
type StepId = "type" | "kind" | "name" | "count" | "age";

const MAX_COUNT = 100000;

function AddAnimalInner() {
  const router = useRouter();
  const params = useSearchParams();
  const paramModule = params.get("module");
  const initialModule: ModuleId | null = modules.find((x) => x.id === paramModule)?.id ?? null;

  const { addAnimal, selectedModules, addSelectedModule } = useAppState();

  const [moduleId, setModuleId] = useState<ModuleId | null>(initialModule);
  const [kind, setKind] = useState<Kind | null>(
    initialModule && moduleById(initialModule).isBatch ? "group" : null
  );
  const [step, setStep] = useState<StepId>(() => {
    if (!initialModule) return "type";
    return moduleById(initialModule).isBatch ? "name" : "kind";
  });
  const [name, setName] = useState("");
  const [countText, setCountText] = useState("10");
  const [countError, setCountError] = useState("");
  const [age, setAge] = useState("Adult");
  const [savingType, setSavingType] = useState(false);

  const m = moduleId ? moduleById(moduleId) : null;
  const effectiveKind: Kind | null = m?.isBatch ? "group" : kind;
  const countNum = Number(countText) || 0;

  const flow: StepId[] = [];
  if (!initialModule) flow.push("type");
  if (!m?.isBatch) flow.push("kind");
  flow.push("name");
  if (effectiveKind !== "one") flow.push("count");
  flow.push("age");

  function goBack() {
    const i = flow.indexOf(step);
    if (i > 0) setStep(flow[i - 1]);
  }

  async function pickModule(id: ModuleId) {
    setModuleId(id);
    if (!selectedModules.includes(id)) {
      setSavingType(true);
      await addSelectedModule(id);
      setSavingType(false);
    }
    if (moduleById(id).isBatch) {
      setKind("group");
      setStep("name");
    } else {
      setStep("kind");
    }
  }

  function pickKind(k: Kind) {
    setKind(k);
    setStep("name");
  }

  function setCount(n: number) {
    setCountText(String(Math.min(MAX_COUNT, Math.max(0, n))));
    setCountError("");
  }

  function nextFromCount() {
    if (countNum < 2) {
      setCountError("A group needs at least 2 animals. To add just one, go back and choose One animal.");
      return;
    }
    setStep("age");
  }

  function save() {
    if (!m) return;
    if (!selectedModules.includes(m.id)) void addSelectedModule(m.id);
    const group = effectiveKind === "group";
    const finalName = name.trim() || (group && !m.isBatch ? `${m.label} group` : m.defaultName);
    addAnimal(finalName, m.id, age, group ? countNum : 1);
    router.push("/added");
  }

  const unit = m?.id === "fish" ? "fish" : m?.id === "poultry" ? "birds" : "animals";

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <div className="flex gap-2 justify-center mb-3">
        {flow.map((s) => (
          <span
            key={s}
            className="h-2 rounded-full"
            style={{
              width: step === s ? 22 : 8,
              background: flow.indexOf(s) <= flow.indexOf(step) ? "var(--primary)" : "var(--border)",
            }}
          />
        ))}
      </div>
      {flow.indexOf(step) > 0 && (
        <button onClick={goBack} className="self-start text-text-muted text-[14px] underline mb-2">
          Back
        </button>
      )}

      {step === "type" && (
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
              </button>
            ))}
          </div>
        </>
      )}

      {step === "kind" && m && (
        <>
          <h1 className="text-2xl font-bold mb-2">What are you adding?</h1>
          <div className="flex flex-col gap-2.5 mt-3">
            <button onClick={() => pickKind("one")} className="w-full text-left p-4 rounded-xl border-2 border-border bg-surface">
              <div className="font-bold text-[18px]">One animal</div>
              <div className="text-[14px] text-text-muted mt-0.5">A single animal you want to follow on its own, with its own name.</div>
            </button>
            <button onClick={() => pickKind("group")} className="w-full text-left p-4 rounded-xl border-2 border-border bg-surface">
              <div className="font-bold text-[18px]">A group</div>
              <div className="text-[14px] text-text-muted mt-0.5">Several animals kept together, like a pen. Feed and check them all at once.</div>
            </button>
          </div>
        </>
      )}

      {step === "name" && m && (
        <>
          <h1 className="text-2xl font-bold mb-2">
            {effectiveKind === "group" && !m.isBatch ? "What do you call this group?" : `What's this ${m.singular} called?`}
          </h1>
          <p>A name or a number — whatever you&apos;ll remember it by.</p>
          <div className="my-4">
            <label className="block text-[15px] font-bold mb-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={effectiveKind === "group" && !m.isBatch ? "e.g. Pen A" : `e.g. ${m.defaultName}`}
              className="w-full p-4 text-xl rounded border-2 border-border bg-surface text-text"
            />
          </div>
          <div className="mt-auto pt-4">
            <button
              onClick={() => setStep(effectiveKind === "one" ? "age" : "count")}
              className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px]"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === "count" && m && (
        <>
          <h1 className="text-2xl font-bold mb-2">
            How many {unit} are in this {m.isBatch ? m.singular : "group"}?
          </h1>
          <p>Type the number, or use the buttons.</p>
          <div className="flex items-center gap-3 my-5">
            <button
              onClick={() => setCount(countNum - 1)}
              aria-label="One less"
              className="w-14 h-14 shrink-0 rounded border-2 border-border text-2xl font-bold"
            >
              −
            </button>
            <input
              inputMode="numeric"
              aria-label={`How many ${unit}`}
              value={countText}
              onChange={(e) => {
                setCountText(e.target.value.replace(/\D/g, "").slice(0, 6));
                setCountError("");
              }}
              className="flex-1 min-w-0 p-4 text-center text-3xl font-bold rounded border-2 border-border bg-surface text-text"
            />
            <button
              onClick={() => setCount(countNum + 1)}
              aria-label="One more"
              className="w-14 h-14 shrink-0 rounded border-2 border-border text-2xl font-bold"
            >
              +
            </button>
          </div>
          {countError && <p className="text-danger text-sm" role="alert">{countError}</p>}
          <div className="mt-auto pt-4">
            <button onClick={nextFromCount} className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px]">
              Next
            </button>
          </div>
        </>
      )}

      {step === "age" && m && (
        <>
          <h1 className="text-2xl font-bold mb-2">
            {effectiveKind === "group" ? "How old are most of them?" : "How old, roughly?"}
          </h1>
          <p>Just your best guess is fine.</p>
          <div className="flex gap-2.5 flex-wrap my-3.5">
            {["Young", "Adult", "Not sure"].map((label) => (
              <Chip key={label} label={label} selected={age === label} onClick={() => setAge(label)} />
            ))}
          </div>
          <div className="mt-auto pt-4">
            <button onClick={save} className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px]">
              {effectiveKind === "group" ? "Save group" : "Save animal"}
            </button>
          </div>
        </>
      )}

      <SkipSetupButton />
    </div>
  );
}

export default function AddAnimal() {
  return (
    <Suspense fallback={null}>
      <AddAnimalInner />
    </Suspense>
  );
}