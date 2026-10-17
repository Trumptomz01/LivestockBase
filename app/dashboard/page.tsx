"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState, moduleById, modules } from "@/lib/store";
import { aliveCount, sickCount } from "../../lib/group";
import { useToast } from "@/lib/useToast";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconPaths } from "@/components/ui/IconPaths";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { AnimalListItem } from "@/components/AnimalListItem";
import { Settings } from "lucide-react";

const NUDGE_KEY = "hb360-signup-nudge-dismissed";
const NUDGE_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // hidden for 7 days after "Not now"

export default function Dashboard() {
  const router = useRouter();
  const { toast, showToast } = useToast();

  const {
    hydrated, animals, activeModule, setActiveModule,
    setCurrentAnimalId, animalsInModule, todayCounts, isOnline, farmerName, isSignedIn,
    syncStatus, onboardingCompleted, syncError, clearSyncError, retrySync,
  } = useAppState();

  const [dateLabel, setDateLabel] = useState("—");
  const [nudgeDismissed, setNudgeDismissed] = useState(true); // true until checked, so it never flashes

  useEffect(() => {
    setDateLabel(new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  useEffect(() => {
    try {
      const last = Number(localStorage.getItem(NUDGE_KEY) || 0);
      setNudgeDismissed(!!last && Date.now() - last < NUDGE_SNOOZE_MS);
    } catch {
      setNudgeDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (syncStatus === "ready" && onboardingCompleted === false) router.replace("/onboarding/modules");
  }, [syncStatus, onboardingCompleted, router]);

  useEffect(() => {
    if (syncError) { showToast(syncError, "error"); clearSyncError(); }
    // showToast intentionally omitted from deps (identity may change per render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncError]);

  const splash = (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" role="status" aria-label="Loading" />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );

  if (!hydrated || syncStatus === "loading") return splash;
  if (syncStatus === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="font-bold">We couldn&apos;t load your farm data.</p>
        <p className="text-[14px] text-text-muted">Check your connection and try again.</p>
        <button onClick={retrySync} className="rounded bg-primary px-5 py-3 font-bold text-on-primary">Try again</button>
      </div>
    );
  }
  if (syncStatus !== "ready" || onboardingCompleted !== true) return splash;

  const m = moduleById(activeModule);
  const list = animalsInModule(activeModule);
  const totalAlive = list.reduce((n, a) => n + aliveCount(a), 0);
  const sickGroups = animals.filter((a) => sickCount(a) > 0);
  const totalSick = animals.reduce((n, a) => n + sickCount(a), 0);
  const counts = todayCounts();
  const firstName = farmerName?.split(" ")[0] || "";
  const showNudge = !isSignedIn && animals.length >= 3 && !nudgeDismissed;

  function dismissNudge() {
    setNudgeDismissed(true);
    try {
      localStorage.setItem(NUDGE_KEY, String(Date.now()));
    } catch {}
  }

  function startRecord() {
    const active = list.filter((a) => aliveCount(a) > 0);
    if (active.length === 0) {
      router.push(`/add-animal?module=${activeModule}`);
    } else if (active.length === 1) {
      setCurrentAnimalId(active[0].id);
      router.push("/record");
    } else {
      router.push("/choose-animal");
    }
  }

  return (
    <div className="flex flex-col flex-1 pb-5">
      <div className="flex pt-2 items-start">
        <div>
          <h1 className="text-2xl tracking-wide leading-7 font-semibold mb-0.5">
            Good morning{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mb-0.5 text-text-muted">{dateLabel}</p>
          <p className="mb-3.5 text-[13px] text-text-muted">
            {isOnline ? "Online — connected" : "Offline — saved on this phone, will sync later"}
          </p>
        </div>
        <div className="flex cursor-pointer items-center border w-auto h-auto rounded-full border-border shadow justify-center py-[0.5] -mx-1 px-2 mr-1">
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="flex items-center justify-center rounded-full p-2 text-text-muted transition hover:bg-surface hover:text-text"
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={28} />
          </button>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-0.5">
        Good morning{firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mb-0.5 text-text-muted">{dateLabel}</p>
      <p className="mb-3.5 text-[13px] text-text-muted">
        {isOnline ? "Online — connected" : "Offline — saved on this phone, will sync later"}
      </p>

      {totalSick > 0 && (
        <button
          onClick={() => router.push("/attention")}
          className="flex gap-3 items-start bg-flag-bg border-l-4 border-flag rounded-lg p-3.5 mb-3 text-left text-text"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-flag shrink-0 mt-0.5">
            <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />
            <path d="M12 8v5" strokeLinecap="round" />
            <circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none" />
          </svg>
          <div>
            <strong className="block text-[15px]">
              {totalSick} animal{totalSick > 1 ? "s" : ""} need{totalSick > 1 ? "" : "s"} your attention
            </strong>
            <span className="text-[14px] text-text-muted">
              {sickGroups.length === 1
                ? `${sickGroups[0].name} needs a health check`
                : `${sickGroups[0].name} and ${sickGroups.length - 1} more`}
            </span>
          </div>
        </button>
      )}

      <button
        onClick={() => router.push("/today")}
        className="flex gap-3 items-start bg-success-bg border-l-4 border-primary rounded-lg p-3.5 mb-3.5 text-left text-text"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
        <div>
          <strong className="block text-[15px]">Today so far</strong>
          <span className="block text-[14px] text-text-muted">
            {counts.fed === 0 && counts.health === 0
              ? "Nothing recorded yet today"
              : `${counts.fed} fed, ${counts.health} health-checked today`}
          </span>
          <span className="text-[13px] text-primary font-bold">See full report</span>
        </div>
      </button>

      {showNudge && (
        <div className="rounded-lg border-2 border-border bg-surface p-3.5 mb-3.5">
          <p className="font-bold text-[15px] mb-0.5">Keep your records safe</p>
          <p className="text-[14px] text-text-muted mb-3">
            Your animals are only saved on this phone. Create an account to keep them online, even if you change phones.
          </p>
          <div className="flex items-center gap-5">
            <button onClick={() => router.push("/signup")} className="text-primary font-bold text-[14px] underline">
              Create account
            </button>
            <button onClick={dismissNudge} className="text-text-muted text-[14px]">
              Not now
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2.5 overflow-x-auto pb-3.5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {modules.map((mm) => (
          <button
            key={mm.id}
            onClick={() => setActiveModule(mm.id)}
            className={`flex flex-col items-center gap-1.5 min-w-[64px] px-2 py-2.5 rounded-2xl border-2 text-[13px] font-bold ${
              activeModule === mm.id ? "text-primary border-primary bg-success-bg" : "text-text-muted border-transparent"
            }`}
          >
            <IconPaths paths={mm.iconPaths} className="w-[30px] h-[30px]" />
            {mm.label}
          </button>
        ))}
      </div>

      <div className="text-[14px] font-bold text-text-muted mb-2.5">
        {m.label} ({totalAlive})
      </div>

      {list.slice(0, 2).map((a) => (
        <AnimalListItem key={a.id} animal={a} />
      ))}

      {list.length === 0 && (
        <EmptyState
          icon={<IconPaths paths={m.iconPaths} className="w-full h-full" />}
          title={`No ${m.label.toLowerCase()} yet`}
          detail="Add your first one below."
        />
      )}

      {list.length > 1 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => router.push("/animals")}
            className="text-primary font-bold text-[14px] underline"
          >
            {list.length > 10 ? "See all" : `See all (${list.length})`}
          </button>
        </div>
      )}

      <button
        onClick={() => router.push(`/add-animal?module=${activeModule}`)}
        className="border-2 border-dashed border-border rounded p-4 text-center text-primary font-bold w-full mb-2.5"
      >
        + Add {m.isBatch ? (list.length ? `another ${m.singular}` : m.singular) : "animals"}
      </button>

      <div className="mt-auto pt-3">
        <button onClick={startRecord} className="w-full active:scale-98 ease-in-out transition-all py-4 px-5 rounded bg-primary text-on-primary font-bold text-[17px]">
          Record something
        </button>
        <div className="text-center pt-3">
          <button onClick={() => router.push("/help")} className="text-text-muted active:scale-98 ease-in-out transition-all text-sm underline">
            Need help?
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}