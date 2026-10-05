import { ReactNode } from "react";

export function Card({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 p-3.5 border border-border rounded bg-surface mb-2.5 w-full text-left"
    >
      <div className="w-[52px] h-[52px] rounded-full bg-surface-2 flex items-center justify-center shrink-0 text-secondary">
        {icon}
      </div>
      <div>
        <div className="text-[16px] font-bold text-text">{title}</div>
        <div className="text-[14px] text-text-muted">{subtitle}</div>
      </div>
    </button>
  );
}
