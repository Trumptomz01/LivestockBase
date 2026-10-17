import { ReactNode } from "react";

export function Card({
  icon,
  title,
  subtitle,
  onClick,
  badge,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  badge?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-3.5 p-3.5 border border-border rounded bg-surface mb-2.5 w-full text-left"
    >
      <div className="w-13 h-13 rounded-full bg-surface-2 flex items-center justify-center shrink-0 text-secondary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-[16px] font-bold text-text ${badge ? "pr-20" : ""}`}>{title}</div>
        <div className="text-[14px] text-text-muted">{subtitle}</div>
      </div>
      {badge && <span className="absolute top-2 right-3">{badge}</span>}
    </button>
  );
}