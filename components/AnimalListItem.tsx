"use client";
import { useRouter } from "next/navigation";
import { useAppState, moduleById, formatWhen } from "@/lib/store";
import type { Animal } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { IconPaths } from "@/components/ui/IconPaths";

function statusTag(a: Pick<Animal, "status" | "attentionFlag">) {
  if (a.status === "deceased") {
    return { label: "Deceased", cls: "bg-surface-2 text-text-muted border border-border" };
  }
  if (a.attentionFlag) return { label: "Sick", cls: "bg-flag-bg text-flag" };
  return { label: "Active", cls: "bg-success-bg text-primary" };
}

export function AnimalListItem({ animal }: { animal: Animal }) {
  const router = useRouter();
  const { setCurrentAnimalId } = useAppState();
  const m = moduleById(animal.module);
  const tag = statusTag(animal);

  const subtitle =
    animal.status === "deceased"
      ? "Past records only"
      : animal.lastFedWhen
      ? `Last fed: ${formatWhen(animal.lastFedWhen)}`
      : "No records yet";

   return (
      <Card
         icon={<IconPaths paths={m.iconPaths} className="w-7.5 h-7.5" />}
         title={animal.name}
         subtitle={subtitle}
         onClick={() => {
            setCurrentAnimalId(animal.id);
            router.push(`/animals/${animal.id}`);
         }}
         badge={
            <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${tag.cls}`}>
            {tag.label}
            </span>
         }
      />
   );
}