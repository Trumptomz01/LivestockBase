"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { useState } from "react";

export default function Added() {
  const router = useRouter();
  const { currentAnimalId, getAnimal, completeOnboarding, syncError, clearSyncError } = useAppState();

  const [loading, setLoading] = useState(false);

  const animal = currentAnimalId
    ? getAnimal(currentAnimalId)
    : undefined;

  const name = animal?.name || "Your animal";

  async function finishOnboarding() {
    setLoading(true);
    clearSyncError();

    const ok = await completeOnboarding();

    setLoading(false);

    if (!ok) {
      // syncError is now set in state — shown below. Don't navigate on failure.
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col flex-1 pb-5">
      <div className="flex justify-center pt-8 pb-3">
        <div className="w-24 h-24 rounded-full bg-success-bg flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            width="52"
            height="52"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold mb-2">
          {name} added!
        </h1>

        <p>
          Nice work. You can see {name} any time in My Animals.
        </p>
      </div>

      {syncError && (
        <p className="text-center text-sm text-danger mt-4" role="alert">
          {syncError}
        </p>
      )}

      <div className="mt-auto pt-4">
        <button
          onClick={finishOnboarding}
          disabled={loading}
          className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Go to My Animals"}
        </button>
      </div>
    </div>
  );
}