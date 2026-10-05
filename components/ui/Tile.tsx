import { IconPaths } from "./IconPaths";

export function Tile({
  label,
  iconPaths,
  selected,
  onClick,
}: {
  label: string;
  iconPaths: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2.5 rounded border-2 p-4 font-bold text-[16px] ${
        selected ? "border-primary bg-success-bg text-primary" : "border-border bg-surface text-text"
      }`}
    >
      <IconPaths paths={iconPaths} className={`w-9 h-9 ${selected ? "text-primary" : "text-secondary"}`} />
      {label}
    </button>
  );
}
