export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 border-2 font-bold text-[15px] ${
        selected ? "bg-primary border-primary text-on-primary" : "bg-surface border-border text-text"
      }`}
    >
      {label}
    </button>
  );
}
