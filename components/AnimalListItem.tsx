"use client";
import { useRouter } from "next/navigation";
import { useAppState, moduleById, formatWhen } from "@/lib/store";
import type { Animal } from "@/lib/store";
import { aliveCount, sickCount, isGroup } from "@/lib/group";
import { Card } from "@/components/ui/Card";
import { IconPaths } from "@/components/ui/IconPaths";

function statusTag(a: Animal) {
  const alive = aliveCount(a);
  const sick = sickCount(a);
  const group = isGroup(a);
  if (alive === 0) {
    return { label: group ? "None left" : "Deceased", cls: "bg-surface-2 text-text-muted border border-border" };
  }
  if (sick > 0) return { label: group ? `${sick} sick` : "Sick", cls: "bg-flag-bg text-flag" };
  return { label: "Active", cls: "bg-success-bg text-primary" };
}

export function AnimalListItem({
  animal,
  mode = "profile",
}: {
  animal: Animal;
  mode?: "profile" | "record";
}) {
  const router = useRouter();
  const { setCurrentAnimalId } = useAppState();
  const m = moduleById(animal.module);
  const tag = statusTag(animal);
  const alive = aliveCount(animal);
  const group = isGroup(animal);
  const fed = animal.lastFedWhen ? `Last fed: ${formatWhen(animal.lastFedWhen)}` : "No feeding yet";

  const subtitle =
    alive === 0
      ? "Past records only"
      : group
      ? `${alive} alive · ${fed}`
      : animal.lastFedWhen
      ? fed
      : "No records yet";

  return (
    <Card
      icon={<IconPaths paths={m.iconPaths} className="w-[30px] h-[30px]" />}
      title={animal.name}
      subtitle={subtitle}
      onClick={() => {
        setCurrentAnimalId(animal.id);
        router.push(mode === "record" ? "/record" : `/animals/${animal.id}`);
      }}
      badge={
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${tag.cls}`}>
          {tag.label}
        </span>
      }
    />
  );
}