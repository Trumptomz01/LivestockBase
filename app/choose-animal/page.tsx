"use client";
import { useRouter } from "next/navigation";
import { useAppState, moduleById } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { IconPaths } from "@/components/ui/IconPaths";
import { TopBar } from "@/components/ui/TopBar";

export default function ChooseAnimal() {
  const router = useRouter();
  const { activeModule, animalsInModule, setCurrentAnimalId } = useAppState();
  const list = animalsInModule(activeModule);

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-2">Who&apos;s this for?</h1>
      <p className="mb-4">Choose which one you&apos;re recording for.</p>
      {list.map((a) => {
        const m = moduleById(a.module);
        return (
          <Card
            key={a.id}
            icon={<IconPaths paths={m.iconPaths} className="w-[30px] h-[30px]" />}
            title={a.name}
            subtitle={a.lastFedWhen ? `Fed ${a.lastFedWhen.toLowerCase()}` : "No records yet"}
            onClick={() => {
              setCurrentAnimalId(a.id);
              router.push("/record");
            }}
          />
        );
      })}
    </div>
  );
}
