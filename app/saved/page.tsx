"use client";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";

export default function Saved() {
  const router = useRouter();
  const { lastSavedMessage } = useAppState();

  return (
    <div className="flex flex-col flex-1 pb-5">
      <div className="flex justify-center pt-8 pb-3">
        <div className="w-24 h-24 rounded-full bg-success-bg flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold mb-2">Saved!</h1>
        <p>{lastSavedMessage || "Saved on your phone."}</p>
      </div>
      <div className="mt-auto pt-4">
        <button onClick={() => router.push("/dashboard")} className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px]">
          Done
        </button>
      </div>
    </div>
  );
}
