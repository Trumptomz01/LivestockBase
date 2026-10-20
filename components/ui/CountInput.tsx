"use client";
import { useEffect, useState } from "react";

export function CountInput({
  value,
  onChange,
  min = 0,
  max = 100000,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText((t) => (Number(t) === value ? t : String(value)));
  }, [value]);

  function step(delta: number) {
    const next = Math.min(max, Math.max(min, value + delta));
    onChange(next);
    setText(String(next));
  }

  return (
    <div className="flex items-center gap-3 my-5">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="One less"
        className="w-14 h-14 shrink-0 rounded border-2 border-border text-2xl font-bold"
      >
        −
      </button>
      <input
        inputMode="numeric"
        aria-label={label}
        value={text}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
          setText(digits);
          onChange(Number(digits) || 0);
        }}
        className="flex-1 min-w-0 p-4 text-center text-3xl font-bold rounded border-2 border-border bg-surface text-text"
      />
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="One more"
        className="w-14 h-14 shrink-0 rounded border-2 border-border text-2xl font-bold"
      >
        +
      </button>
    </div>
  );
}