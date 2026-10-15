"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { farmStats, periodOptions, periodPhrase } from "@/lib/farmStats";
import type { Period } from "@/lib/farmStats";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";

function Stat({
  value,
  label,
  alert = false,
  onClick,
}: {
  value: number;
  label: string;
  alert?: boolean;
  onClick?: () => void;
}) {
  const cls = `rounded-2xl border p-4 text-left ${alert ? "bg-flag-bg border-flag/40" : "bg-surface border-border"}`;
  const inner = (
    <>
      <div className={`text-[40px] font-bold leading-none ${alert ? "text-flag" : ""}`}>{value}</div>
      <div className="text-[15px] text-text-muted mt-2">{label}</div>
    </>
  );
  return onClick ? (
    <button onClick={onClick} className={cls}>{inner}</button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export default function Farm() {
  const router = useRouter();
  const { hydrated, syncStatus, animals, farmName, updateFarmName, retrySync } = useAppState();

  const [period, setPeriod] = useState<Period>("month");
  const [showName, setShowName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);

  if (!hydrated || syncStatus === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (syncStatus === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="font-bold">We couldn&apos;t load your farm.</p>
        <button onClick={retrySync} className="rounded bg-primary px-5 py-3 font-bold text-on-primary">
          Try again
        </button>
      </div>
    );
  }

  const stats = farmStats(animals, period);
  const phrase = periodPhrase(period);

  async function saveName() {
    if (!nameDraft.trim()) {
      setNameError("Please enter a name.");
      return;
    }
    setSavingName(true);
    setNameError("");
    const ok = await updateFarmName(nameDraft);
    setSavingName(false);
    if (!ok) {
      setNameError("Could not save. Please try again.");
      return;
    }
    setShowName(false);
  }

  return (
    <div className="flex flex-col flex-1 pb-5 pt-6">
      <div className="text-[14px] text-text-muted">Your farm</div>
      <div className="flex items-center justify-between gap-3 mt-1">
        <h1 className={`text-2xl font-bold leading-tight ${farmName ? "" : "text-text-muted"}`}>
          {farmName?.toUpperCase() || "Add your farm name"}
        </h1>
        <button
          onClick={() => {
            setNameDraft(farmName || "");
            setNameError("");
            setShowName(true);
          }}
          className="text-primary font-bold text-[15px] underline px-1 min-h-11"
        >
          {farmName ? "Edit" : "Add"}
        </button>
      </div>

      <div className="text-[14px] font-bold text-text-muted mt-5 mb-2">Show deaths and births for</div>
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {periodOptions.map((o) => (
          <Chip key={o.id} label={o.label} selected={period === o.id} onClick={() => setPeriod(o.id)} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stat value={stats.alive} label="Animals alive" />
        <Stat
          value={stats.attention}
          label="Need attention"
          alert={stats.attention > 0}
          onClick={stats.attention > 0 ? () => router.push("/attention") : undefined}
        />
        <Stat value={stats.died} label={`Died ${phrase}`} />
        <Stat value={stats.births} label={`Births recorded ${phrase}`} />
      </div>

      <div className="text-[14px] font-bold text-text-muted mt-6 mb-1">By type</div>
      {stats.byType.map((t) => (
        <div key={t.id} className="flex justify-between items-center py-3.5 border-b border-border text-[17px]">
          <span>{t.label}</span>
          {t.count > 0 ? <span className="font-bold">{t.count}</span> : <span className="text-text-muted">None yet</span>}
        </div>
      ))}

      <button
        onClick={() => router.push("/animals")}
        className="mt-5 w-full min-h-13.5 rounded border-2 border-border font-bold text-[17px]"
      >
        View all animals
      </button>

      {showName && (
        <Sheet onClose={() => setShowName(false)}>
          <h2 className="text-xl font-bold mb-4">Your farm name</h2>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="e.g. Green Valley Farm"
            className="w-full p-4 text-xl rounded border-2 border-border bg-surface-2 text-text mb-3"
          />
          {nameError && <p className="text-danger text-sm mb-3" role="alert">{nameError}</p>}
          <div className="flex gap-2.5">
            <button onClick={() => setShowName(false)} className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]">
              Cancel
            </button>
            <button onClick={saveName} disabled={savingName} className="flex-1 py-4 rounded bg-primary text-on-primary font-bold text-[16px] disabled:opacity-70">
              {savingName ? "Saving..." : "Save"}
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}