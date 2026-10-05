"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState, modules } from "@/lib/store";
import { Tile } from "@/components/ui/Tile";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/lib/useToast";

export default function ModulesPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    selectedModules,
    toggleSelectedModule,
    setFirstAnimalModule,
  } = useAppState();

  const { toast, showToast } = useToast();

  const picked = selectedModules.length ? selectedModules : [];

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      showToast(
        "Email confirmed! Continue setting up HerdBase360.",
        "success"
      );

      // Remove the query parameter after showing the toast
      router.replace("/onboarding/modules");
    }
  }, [searchParams, router, showToast]);

  function continueNext() {
    const list = picked.length ? picked : ["cattle" as const];

    if (list.length === 1) {
      setFirstAnimalModule(list[0]);
      router.push("/add-animal");
    } else {
      router.push("/onboarding/pick-first");
    }
  }

  return (
    <div className="flex flex-col flex-1 pb-5">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}

      <div style={{ flexGrow: 0.15 }} />

      <h1 className="text-2xl font-bold mb-2">
        What do you keep?
      </h1>

      <p>
        Choose all that apply. You can add more later.
      </p>

      <div className="grid grid-cols-2 gap-3 my-4">
        {modules.map((m) => (
          <Tile
            key={m.id}
            label={m.label}
            iconPaths={m.iconPaths}
            selected={picked.includes(m.id)}
            onClick={() => toggleSelectedModule(m.id)}
          />
        ))}
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={continueNext}
          className="w-full cursor-pointer active:scale-98 transition-all py-4 rounded bg-primary text-on-primary font-bold text-[17px]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}