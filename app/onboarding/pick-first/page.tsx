"use client";
import { useRouter } from "next/navigation";
import { useAppState, modules } from "@/lib/store";
import { Tile } from "@/components/ui/Tile";
import { useEffect } from "react";   
import { SkipSetupButton } from "@/components/SkipSetupButton";

export default function PickFirst() {
  const router = useRouter();
  const { selectedModules, firstAnimalModule, setFirstAnimalModule, syncStatus, onboardingCompleted } = useAppState();  
  const picked = selectedModules.length ? selectedModules : ["cattle" as const];
  const current = picked.includes(firstAnimalModule) ? firstAnimalModule : picked[0];

  useEffect(() => {
    if (syncStatus === "ready" && onboardingCompleted === true) router.replace("/dashboard");
  }, [syncStatus, onboardingCompleted, router]);

  return (
    <div className="flex flex-col flex-1 pb-5">
        <SkipSetupButton />
      <div style={{ flexGrow: 0.15 }} />
      <h1 className="text-2xl font-bold mb-2">Which one should we add first?</h1>
      <p>You picked more than one — let&apos;s start with just one, then add the rest after.</p>
      <div className="grid grid-cols-2 gap-3 my-4">
        {modules
          .filter((m) => picked.includes(m.id))
          .map((m) => (
            <Tile
              key={m.id}
              label={m.label}
              iconPaths={m.iconPaths}
              selected={current === m.id}
              onClick={() => setFirstAnimalModule(m.id)}
            />
          ))}
      </div>
      <div className="mt-auto pt-4">
        <button
          onClick={() => router.push(`/add-animal?module=${current}`)}
          className="w-full py-4 cursor-pointer active:scale-98 transition-all rounded bg-primary text-on-primary font-bold text-[17px]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}