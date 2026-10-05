export function Stepper({
  value,
  unit,
  onChange,
}: {
  value: number;
  unit: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-5 my-4">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="Decrease"
        className="w-[52px] h-[52px] rounded-full border-2 border-border bg-surface text-text text-2xl"
      >
        –
      </button>
      <span className="text-2xl font-bold min-w-[64px] text-center">
        {value} {unit}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
        className="w-[52px] h-[52px] rounded-full border-2 border-border bg-surface text-text text-2xl"
      >
        +
      </button>
    </div>
  );
}
