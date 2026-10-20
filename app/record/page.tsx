"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAppState } from "@/lib/store";
import { isGroup } from "@/lib/group";
import { TopBar } from "@/components/ui/TopBar";

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

type Row = { href: string; label: string; icon: ReactNode };

const feeding: Row = {
  href: "/record/log?type=feeding",
  label: "Feeding",
  icon: (
    <Svg>
      <circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" />
    </Svg>
  ),
};
const health: Row = {
  href: "/record/log?type=health",
  label: "Health check",
  icon: (
    <Svg>
      <path d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6a4.6 4.6 0 018.8-1.9 4.6 4.6 0 018.8 1.9z" />
    </Svg>
  ),
};
const breeding: Row = {
  href: "/record/log?type=breeding",
  label: "Breeding",
  icon: (
    <Svg>
      <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" />
    </Svg>
  ),
};

const treat: Row = {
  href: "/record/treat",
  label: "Treatment given",
  icon: (
    <Svg>
      <path d="M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3" /><path d="M8 3h8" />
    </Svg>
  ),
};

const weight: Row = {
  href: "/record/log?type=weight",
  label: "Weight / growth",
  icon: (
    <Svg>
      <path d="M3 17l5-5 4 4 8-8" /><path d="M15 8h5v5" />
    </Svg>
  ),
};
const sick: Row = {
  href: "/record/sick",
  label: "Report sick",
  icon: (
    <Svg>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v6" /><circle cx="12" cy="16.5" r="0.6" />
    </Svg>
  ),
};
const death: Row = {
  href: "/record/death",
  label: "Record deaths",
  icon: (
    <Svg>
      <circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" />
    </Svg>
  ),
};
const born: Row = {
  href: "/record/born",
  label: "Births or new arrivals",
  icon: (
    <Svg>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </Svg>
  ),
};
const recount: Row = {
  href: "/record/recount",
  label: "Count again",
  icon: (
    <Svg>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </Svg>
  ),
};

const SINGLE_ROWS = [feeding, health, treat, breeding, weight];
const GROUP_ROWS = [feeding, sick, treat, death, born, breeding, weight, recount];


export default function RecordSheet() {
  const router = useRouter();
  const { currentAnimalId, getAnimal } = useAppState();
  const animal = currentAnimalId ? getAnimal(currentAnimalId) : undefined;
  const rows = animal && isGroup(animal) ? GROUP_ROWS : SINGLE_ROWS;

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h2 className="text-xl font-bold my-1.5 mb-3.5">
        What would you like to record{animal ? ` for ${animal.name}` : ""}?
      </h2>
      {rows.map((row) => (
        <button
          key={row.href}
          onClick={() => router.push(row.href)}
          className="flex items-center gap-3.5 w-full py-4 border-b border-border text-[17px] font-bold text-text text-left"
        >
          <span className="text-primary shrink-0">{row.icon}</span>
          {row.label}
        </button>
      ))}
    </div>
  );
}