"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

// Back caret + theme toggle, shared by every screen except Home.
export function TopBar({ showBack = true }: { showBack?: boolean }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between py-4 px-1 -mx-1">
      {showBack ? (
        <button onClick={() => router.back()} aria-label="Back" className="p-1.5 rounded text-text">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      ) : (
        <span />
      )}
      <ThemeToggle />
    </div>
  );
}
