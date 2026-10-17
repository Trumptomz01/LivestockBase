import type { ReactNode } from "react";

export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-t-2xl p-5 pb-6 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-4" />
        {children}
      </div>
    </div>
  );
}