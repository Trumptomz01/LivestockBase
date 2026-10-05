"use client";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();
  return (
    <div className="flex relative flex-col flex-1 items-center justify-center text-center pb-5">

      <div className="absolute inset flex flex-col items-center justify-center text-center">
        <div className="text-[26px] font-bold text-primary">HerdBase360</div>
        <p className="mt-1.5 text-text-muted">Know your farm, every day.</p>
      </div>

      <button
        onClick={() => router.push("/onboarding/welcome")}
        className="w-full py-4 cursor-pointer active:scale-98 transition-all rounded bg-primary text-on-primary font-bold text-[17px] mt-auto"
      >
        Continue
      </button>
    </div>
  );
}