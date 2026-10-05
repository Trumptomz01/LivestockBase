"use client";
import { TopBar } from "@/components/ui/TopBar";
import { ReactNode } from "react";

function HelpRow({ icon, title, detail, last }: { icon: ReactNode; title: string; detail: string; last?: boolean }) {
  return (
    <div className={`flex gap-3.5 py-3.5 items-start ${last ? "" : "border-b border-border"}`}>
      <div className="w-[26px] h-[26px] text-primary shrink-0 mt-0.5">{icon}</div>
      <div>
        <b className="block text-[15px]">{title}</b>
        <span className="text-[14px] text-text-muted">{detail}</span>
      </div>
    </div>
  );
}

const strokeProps = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export default function Help() {
  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-2">Help</h1>
      <p className="mb-5">We&apos;re here if you get stuck — any time.</p>
      <button className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px] mb-3">Call support</button>
      <button className="w-full py-4 rounded bg-surface-2 border border-border text-text font-bold text-[17px] mb-2">
        Message us on WhatsApp
      </button>
      <div className="text-[14px] font-bold text-text-muted mt-5 mb-1">How to use this app</div>
      <HelpRow
        icon={<svg viewBox="0 0 24 24" {...strokeProps}><ellipse cx="12" cy="15" rx="7" ry="5" /><circle cx="6" cy="10" r="3.4" /></svg>}
        title="My Animals is home"
        detail="This is the first screen you'll see every time you open the app."
      />
      <HelpRow
        icon={<svg viewBox="0 0 24 24" {...strokeProps}><circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" /></svg>}
        title="Record something"
        detail="Tap this big button any time to log feeding, a health check, breeding or weight."
      />
      <HelpRow
        icon={<svg viewBox="0 0 24 24" {...strokeProps}><ellipse cx="12" cy="15" rx="6" ry="5" /><circle cx="6.5" cy="9.5" r="3" /></svg>}
        title="Switch animal type"
        detail="Tap Cattle, Goat, Sheep, Fish or Poultry near the top to switch between them."
      />
      <HelpRow
        icon={<svg viewBox="0 0 24 24" {...strokeProps}><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M9 9h6M9 13h6M9 17h3" /></svg>}
        title="Tap an animal to see more"
        detail="See its full history, and record something just for that one."
      />
      <HelpRow
        icon={<svg viewBox="0 0 24 24" {...strokeProps}><circle cx="12" cy="12" r="4.5" /><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>}
        title="See today's report"
        detail={'Tap the "Good morning" banner to see everything recorded today.'}
      />
      <HelpRow
        icon={<svg viewBox="0 0 24 24" {...strokeProps}><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" /><path d="M12 8v5" /><circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none" /></svg>}
        title="An amber flag"
        detail="Means an animal needs a check soon — tap it to see who."
      />
      <HelpRow
        last
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>}
        title="A green check"
        detail="Means your record was saved — even without internet. It will sync later."
      />
    </div>
  );
}
