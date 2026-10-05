"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const SLIDES = [
  {
    title: "Add an animal in seconds",
    body: "No long forms. Just the basics, with pictures to guide you.",
    color: "var(--primary)",
    icon: (
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6">
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
        <circle cx="17" cy="17" r="3.4" fill="var(--surface)" />
        <path d="M17 15.6v1.4l1 .8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "See what needs your attention",
    body: "Plain, simple alerts — no charts to read.",
    color: "var(--flag)",
    icon: (
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--flag)" strokeWidth="1.6">
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />
        <path d="M12 8v5" strokeLinecap="round" />
        <circle cx="12" cy="16.3" r="0.9" fill="var(--flag)" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Works even without internet",
    body: "Everything saves on your phone first, and syncs when you're back online.",
    color: "var(--primary)",
    icon: (
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.6">
        <path d="M2 18c2-3 5-4 10-4s8 1 10 4" strokeLinecap="round" />
        <path d="M4 13c2-2.5 4.5-3.5 8-3.5s6 1 8 3.5" strokeLinecap="round" />
        <path d="M7 8c1.7-1.6 3.2-2 5-2s3.3.4 5 2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function WalkthroughInner() {
  const router = useRouter();
  const params = useSearchParams();
  const step = Math.min(Math.max(parseInt(params.get("step") || "1", 10), 1), 3);
  const slide = SLIDES[step - 1];
  const isLast = step === 3;

  return (
    <div className="flex flex-col flex-1 pb-5">
      <div className="flex justify-end pt-3">
        <button onClick={() => router.push("/signup")} className="text-primary font-bold py-2 px-2.5">
          Skip
        </button>
      </div>
      <div className="flex flex-col items-center text-center flex-1 justify-center">
        {slide.icon}
        <h2 className="text-xl font-bold mt-4 mb-1">{slide.title}</h2>
        <p>{slide.body}</p>
      </div>
      <div className="flex gap-2 justify-center my-3">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-2 rounded-full"
            style={{
              width: i === step ? 22 : 8,
              background: i === step ? "var(--primary)" : "var(--border)",
            }}
          />
        ))}
      </div>
      <div className="pt-4">
        <button
          onClick={() =>
            isLast ? router.push("/signup") : router.push(`/onboarding/walkthrough?step=${step + 1}`)
          }
          className="w-full cursor-pointer active:scale-98 transition-all py-4 rounded bg-primary text-on-primary font-bold text-[17px]"
        >
          {isLast ? "Get started" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default function Walkthrough() {
  return (
    <Suspense fallback={null}>
      <WalkthroughInner />
    </Suspense>
  );
}
