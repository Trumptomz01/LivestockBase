import { ReactNode } from "react";

export function EmptyState({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-8 px-4 border-2 border-border rounded mb-3">
      <div className="w-9 h-9 text-text-muted">{icon}</div>
      <p className="m-0">
        <strong>{title}</strong>
      </p>
      <p className="m-0 text-text-muted text-sm">{detail}</p>
    </div>
  );
}
