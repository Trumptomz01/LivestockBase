"use client";
import { useState } from "react";
import { useAppState } from "@/lib/store";

export function TransferPrompt() {
  const { pendingTransfer, acceptTransfer, discardTransfer } = useAppState();
  const [busy, setBusy] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!pendingTransfer) return null;
  const n = pendingTransfer.animalCount;
  const noun = n === 1 ? "animal" : "animals";

  async function run(action: () => Promise<boolean>) {
    setBusy(true);
    setFailed(false);
    const ok = await action();
    setBusy(false);
    if (!ok) setFailed(true);
  }

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-surface rounded-t-2xl p-5 pb-6">
        {!confirmingDiscard ? (
          <>
            <h2 className="text-xl font-bold mb-2">
              You have {n} {noun} on this phone
            </h2>
            <p className="text-text-muted mb-5">
              You added {n === 1 ? "it" : "them"} before logging in. Do you want to add{" "}
              {n === 1 ? "it" : "them"} to your existing account, or do you not need {n === 1 ? "it" : "them"}?
            </p>
            {failed && (
              <p className="text-danger text-sm mb-3" role="alert">
                Something went wrong. Your records are still safe on this phone. Please try again.
              </p>
            )}
            <div className="flex flex-col gap-2.5">
              <button
                disabled={busy}
                onClick={() => run(acceptTransfer)}
                className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[16px] disabled:opacity-70"
              >
                {busy ? "Adding..." : "Add them to my existing account"}
              </button>
              <button
                disabled={busy}
                onClick={() => setConfirmingDiscard(true)}
                className="w-full py-4 rounded border-2 border-border font-bold text-[16px] disabled:opacity-70"
              >
                I don&apos;t need {n === 1 ? "it" : "them"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">Remove from this phone?</h2>
            <p className="text-text-muted mb-5">
              The {n} {noun} will be deleted from this phone. This can&apos;t be undone.
            </p>
            {failed && (
              <p className="text-danger text-sm mb-3" role="alert">
                Something went wrong. Please try again.
              </p>
            )}
            <div className="flex gap-2.5">
              <button
                disabled={busy}
                onClick={() => { setConfirmingDiscard(false); setFailed(false); }}
                className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={() => run(discardTransfer)}
                className="flex-1 py-4 rounded bg-danger text-on-primary font-bold text-[16px] disabled:opacity-70"
              >
                {busy ? "Removing..." : "Yes, remove"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}