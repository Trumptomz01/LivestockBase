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
      className={`rounded-2xl cursor-pointer text-[12px] py-1 animate-all px-2 flex text-center  border-2 font-bold  ${
        selected ? "bg-primary border-primary text-on-primary" : "bg-surface border-border "
      }`}
    >
      {label}
    </button>
  );
}
