"use client";
import { useRouter } from "next/navigation";

export default function Welcome() {
  const router = useRouter();
  return (
    <div className="flex flex-col flex-1 pt-6 pb-5">
      <div className="flex justify-center py-7">
        <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
          <g stroke="var(--primary)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="45" cy="80" rx="26" ry="18" /><circle cx="20" cy="62" r="13" />
            <ellipse cx="130" cy="85" rx="24" ry="16" /><circle cx="152" cy="70" r="11" />
            <path d="M85 55c0-14 10-20 10-20s10 6 10 20-10 22-10 22-10-8-10-22z" />
          </g>
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Track your animals, the easy way</h1>
      <p>Record feeding, health and more — right from your phone, even without internet.</p>
      <div className="mt-auto flex flex-col gap-2.5 pt-4">
        <button onClick={() => router.push("/signup")} className="w-full cursor-pointer active:scale-98 transition-all py-4 rounded bg-primary text-on-primary font-bold text-[17px]">
          Get started
        </button>
        <button onClick={() => router.push("/login")} className=" cursor-pointer active:scale-98 transition-all hover:border hover rounded text-primary font-bold py-2">
          I already have an account
        </button>
      </div>
    </div>
  );
}
