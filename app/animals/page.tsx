"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState, modules, moduleById, ModuleId } from "@/lib/store";
import { TopBar } from "@/components/ui/TopBar";
import { Card } from "@/components/ui/Card";
import { IconPaths } from "@/components/ui/IconPaths";
import { EmptyState } from "@/components/ui/EmptyState";

type FilterId = "all" | ModuleId;

export default function AllAnimals() {
  const router = useRouter();
  const { animals, selectedModules, setCurrentAnimalId } = useAppState();
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");

  const picked: ModuleId[] = selectedModules.length ? selectedModules : ["cattle"];

  const filtered = useMemo(() => {
    let list = animals;
    if (filter !== "all") list = list.filter((a) => a.module === filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((a) => a.name.toLowerCase().includes(q));
    return list;
  }, [animals, filter, query]);

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-3">All animals</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name"
        className="w-full p-3.5 rounded border-2 border-border bg-surface text-text mb-3"
      />

      <div className="flex gap-2.5 overflow-x-auto pb-3.5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 min-w-14 px-3 py-2.5 rounded-2xl border-2 text-[13px] font-bold ${
            filter === "all" ? "text-primary border-primary bg-success-bg" : "text-text-muted border-transparent"
          }`}
        >
          All
        </button>
        {modules.map((mm) => (
            <button
              key={mm.id}
              onClick={() => setFilter(mm.id)}
              className={`flex flex-col items-center gap-1.5 min-w-16 px-2 py-2.5 rounded-2xl border-2 text-[13px] font-bold ${
                filter === mm.id ? "text-primary border-primary bg-success-bg" : "text-text-muted border-transparent"
              }`}
            >
              <IconPaths paths={mm.iconPaths} className="w-6.5 h-6.5" />
              {mm.label}
            </button>
          ))}
      </div>

      <div className="text-[14px] font-bold text-text-muted mb-2.5">
        {filtered.length} {filtered.length === 1 ? "animal" : "animals"}
      </div>

      {filtered.map((a) => {
        const m = moduleById(a.module);
        return (
          <Card
            key={a.id}
            icon={<IconPaths paths={m.iconPaths} className="w-[30px] h-[30px]" />}
            title={a.name}
            subtitle={a.lastFedWhen ? `Fed ${a.lastFedWhen.toLowerCase()}` : "No records yet"}
            onClick={() => {
              setCurrentAnimalId(a.id);
              router.push(`/animals/${a.id}`);
            }}
          />
        );
      })}

      {filtered.length === 0 && (
        <EmptyState
          icon={<IconPaths paths={moduleById(filter === "all" ? picked[0] : filter).iconPaths} className="w-full h-full" />}
          title="No animals found"
          detail={query ? "Try a different search." : "Nothing here yet."}
        />
      )}
    </div>
  );
}