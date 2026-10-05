"use client";
import { useRouter } from "next/navigation";
import { useAppState, moduleById } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { IconPaths } from "@/components/ui/IconPaths";

export default function Attention() {
  const router = useRouter();
  const { attentionList, setCurrentAnimalId } = useAppState();
  const flagged = attentionList();

  return (
    <div className="flex flex-col flex-1 pb-5">
      <div className="py-4"><button onClick={() => router.back()} aria-label="Back">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button></div>
      <h1 className="text-2xl font-bold mb-2">Needs attention</h1>
      <p className="mb-4">These animals could use a check.</p>
      {flagged.length === 0 ? (
        <p>Nothing needs attention right now.</p>
      ) : (
        flagged.map((a) => {
          const m = moduleById(a.module);
          return (
            <Card
              key={a.id}
              icon={<IconPaths paths={m.iconPaths} className="w-[30px] h-[30px]" />}
              title={a.name}
              subtitle="Needs a health check"
              onClick={() => {
                setCurrentAnimalId(a.id);
                router.push(`/animals/${a.id}`);
              }}
            />
          );
        })
      )}
    </div>
  );
}
