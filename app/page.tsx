"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";

export default function RootRedirect() {
  const router = useRouter();
  const { hydrated, syncStatus, onboardingCompleted } = useAppState();

  useEffect(() => {
    if (!hydrated || syncStatus === "loading") return;
    if (syncStatus === "signed-out") {
      router.replace("/login");
    } else if (syncStatus === "ready" && onboardingCompleted === false) {
      router.replace("/onboarding/modules");
    } else if (syncStatus === "ready" && onboardingCompleted === true) {
      router.replace("/dashboard");
    }
  }, [hydrated, syncStatus, onboardingCompleted, router]);

  if (syncStatus === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="font-bold">We couldn't load your account.</p>
        <p className="text-[14px] text-text-muted">Check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" role="status" aria-label="Loading" />
    </div>
  );
}