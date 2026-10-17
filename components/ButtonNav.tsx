"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// To change the order, just reorder this list.
const tabs: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <Icon>
        <path d="M3 11.5L12 4l9 7.5" />
        <path d="M5.5 10v10h13V10" />
      </Icon>
    ),
  },
  {
    href: "/settings",
    label: "You",
    icon: (
      <Icon>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </Icon>
    ),
  },
  {
    href: "/farm",
    label: "Farm",
    icon: (
      <Icon>
        <path d="M3 21V9l9-6 9 6v12" />
        <path d="M8 21v-8h8v8" />
        <path d="M8 13l8 8M16 13l-8 8" />
      </Icon>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [pending, setPending] = useState<string | null>(null);

  // The real route has caught up, so stop overriding it.
  useEffect(() => {
    setPending(null);
  }, [pathname]);

  // Safety net: if a navigation never finishes, don't leave the bar on the wrong tab.
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(null), 1500);
    return () => clearTimeout(t);
  }, [pending]);

  // Only the three main screens get the bar, not the add/record/onboarding flows.
  if (!tabs.some((t) => t.href === pathname)) return null;

  // Move the highlight as soon as a tab is tapped, without waiting for the page to load.
  const current = pending ?? pathname;
  const index = Math.max(0, tabs.findIndex((t) => t.href === current));

  return (
    <>
      {/* Keeps page content from hiding behind the bar */}
      <div aria-hidden className="h-[calc(4.5rem+env(safe-area-inset-bottom))] shrink-0" />

      <nav
        aria-label="Main"
        className="fixed left-1/2 z-40 w-68 -translate-x-1/2"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
      >
        <div className="relative rounded-full border border-border/60 bg-surface/70 p-1 shadow-lg backdrop-blur-xl backdrop-saturate-150">
          {/* The highlight that slides between tabs */}
          <div
            aria-hidden
            className="absolute bottom-1 left-1 top-1 rounded-full bg-success-bg transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
            style={{
              width: `calc((100% - 0.5rem) / ${tabs.length})`,
              transform: `translateX(${index * 100}%)`,
            }}
          />
         <ul className="relative flex items-center">
               {tabs.map((t) => (
               <li key={t.href} className="flex-1">
                  <Link
                     href={t.href}
                     replace
                     onClick={() => setPending(t.href)}
                     aria-current={pathname === t.href ? "page" : undefined}
                     className={`flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-bold transition-colors duration-300 active:scale-95 ${
                     current === t.href ? "text-primary" : "text-text-muted"
                     }`}
                  >
                     {t.icon}
                     {t.label}
                  </Link>
               </li>
               ))}
            </ul>
        </div>
      </nav>
    </>
  );
}