"use client";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { TopBar } from "@/components/ui/TopBar";
import { LogType } from "@/lib/store";
import { JSX } from "react/jsx-runtime";

const ROWS: { type: LogType; label: string; icon: JSX.Element }[] = [
  {
    type: "feeding",
    label: "Feeding",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
  {
    type: "health",
    label: "Health check",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6a4.6 4.6 0 018.8-1.9 4.6 4.6 0 018.8 1.9z" />
      </svg>
    ),
  },
  {
    type: "breeding",
    label: "Breeding",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    type: "weight",
    label: "Weight / growth",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l5-5 4 4 8-8" /><path d="M15 8h5v5" />
      </svg>
    ),
  },
];

export default function RecordSheet() {
  const router = useRouter();
  const { currentAnimalId, getAnimal } = useAppState();
  const animal = currentAnimalId ? getAnimal(currentAnimalId) : undefined;

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h2 className="text-xl font-bold my-1.5 mb-3.5">
        What would you like to record{animal ? ` for ${animal.name}` : ""}?
      </h2>
      {ROWS.map((row) => (
        <button
          key={row.type}
          onClick={() => router.push(`/record/log?type=${row.type}`)}
          className="flex items-center gap-3.5 w-full py-4 border-b border-border text-[17px] font-bold text-text text-left"
        >
          <span className="text-primary shrink-0">{row.icon}</span>
          {row.label}
        </button>
      ))}
    </div>
  );
}
