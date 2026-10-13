"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";

export function SkipSetupButton() {
  const router = useRouter();
  const { completeOnboarding, syncStatus } = useAppState();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function skip() {
    setBusy(true);
    setFailed(false);
    const ok = await completeOnboarding();
    if (ok) {
      router.replace("/dashboard");
      return;
    }
    setBusy(false);
    setFailed(true);
  }

  return (
    <div className="text-center">
      <button
        onClick={skip}
        disabled={busy || syncStatus !== "ready"}
        className="text-text-muted text-[15px] underline py-2 cursor-pointer disabled:opacity-60"
      >
        {busy ? "Please wait..." : "Skip for now"}
      </button>
      {failed && (
        <p className="text-danger text-sm" role="alert">
          Couldn&apos;t skip right now. Please try again.
        </p>
      )}
    </div>
  );
}