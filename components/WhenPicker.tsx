"use client";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { todayISO, yesterdayISO, formatWhen } from "@/lib/store";

export function WhenPicker({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const isToday = value === todayISO();
  const isYesterday = value === yesterdayISO();

  return (
    <>
      <p className="mt-3.5">When?</p>
      <div className="flex gap-2.5 flex-wrap mb-1 items-center">
        <Chip
          label="Today"
          selected={isToday}
          onClick={() => {
            onChange(todayISO());
            setOpen(false);
          }}
        />
        <Chip
          label="Yesterday"
          selected={isYesterday}
          onClick={() => {
            onChange(yesterdayISO());
            setOpen(false);
          }}
        />
        <Chip
          label={!isToday && !isYesterday ? formatWhen(value) : "Pick a date"}
          selected={open || (!isToday && !isYesterday)}
          onClick={() => setOpen(true)}
        />
      </div>
      {open && (
        <input
          type="date"
          value={value}
          max={todayISO()}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="w-full p-4 text-xl rounded border-2 border-border bg-surface text-text mt-2"
        />
      )}
    </>
  );
}