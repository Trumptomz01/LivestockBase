// A plain-language flag, e.g. "Bessie hasn't been checked in 10 days".
// Per the brief: no charts/dashboards for the primary farmer persona —
// just a short sentence and a clear affordance to tap through.
export function AttentionBanner({
  title,
  detail,
  onClick,
}: {
  title: string;
  detail: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex gap-3 items-start w-full text-left bg-flag-bg border-l-4 border-flag rounded-lg p-3.5"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" className="text-flag shrink-0 mt-0.5">
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />
        <path d="M12 8v5" strokeLinecap="round" />
        <circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none" />
      </svg>
      <div>
        <strong className="block text-[15px]">{title}</strong>
        <span className="text-[14px] text-text-muted">{detail}</span>
      </div>
    </button>
  );
}
