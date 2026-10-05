"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { TopBar } from "@/components/ui/TopBar";

export default function Today() {
  const router = useRouter();
  const { todayCounts } = useAppState();
  const counts = todayCounts();
  const [dateLabel, setDateLabel] = useState("—");

  useEffect(() => {
    setDateLabel(new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const Row = ({ label, value, linked }: { label: string; value: string; linked?: boolean }) =>
    linked ? (
      <button onClick={() => router.push("/attention")} className="flex justify-between items-center py-4 border-b border-border w-full text-left text-text">
        <span>{label}</span>
        <span className="text-lg font-bold text-flag">{value}</span>
      </button>
    ) : (
      <div className="flex justify-between items-center py-4 border-b border-border">
        <span>{label}</span>
        <span className="text-lg font-bold">{value}</span>
      </div>
    );

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-2">Today&apos;s report</h1>
      <p className="mb-2.5">{dateLabel} · across your whole farm</p>
      <Row label="Fed" value={`${counts.fed} animals`} />
      <Row label="Health checks logged" value={`${counts.health} animals`} />
      <Row label="Needs attention" value={`${counts.attention} animals`} linked />
      <Row label="New animals added" value={`${counts.newToday}`} />
      <div className="mt-auto pt-4">
        <button onClick={() => router.push("/dashboard")} className="w-full py-4 rounded bg-surface-2 border border-border text-text font-bold text-[17px]">
          Back to My Animals
        </button>
      </div>
    </div>
  );
}
