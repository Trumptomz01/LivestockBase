"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";

export default function RootRedirect() {
  const router = useRouter();
  const { hydrated, syncStatus, onboardingCompleted, retrySync } = useAppState();

  useEffect(() => {
    if (!hydrated || syncStatus !== "ready") return;
    router.replace(onboardingCompleted ? "/dashboard" : "/onboarding/welcome");
  }, [hydrated, syncStatus, onboardingCompleted, router]);

  if (syncStatus === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="font-bold">We couldn&apos;t open the app.</p>
        <p className="text-[14px] text-text-muted">Check your connection and try again.</p>
        <button onClick={retrySync} className="rounded bg-primary px-5 py-3 font-bold text-on-primary">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}