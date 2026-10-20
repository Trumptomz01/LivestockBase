"use client";
import { useAppState } from "@/lib/store";
import { aliveCount } from "@/lib/group";
import { AnimalListItem } from "@/components/AnimalListItem";
import { TopBar } from "@/components/ui/TopBar";

export default function ChooseAnimal() {
  const { activeModule, animalsInModule } = useAppState();
  const list = animalsInModule(activeModule).filter((a) => aliveCount(a) > 0);

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-2">Who&apos;s this for?</h1>
      <p className="mb-4">Choose which animal or group you&apos;re recording for.</p>
      {list.map((a) => (
        <AnimalListItem key={a.id} animal={a} mode="record" />
      ))}
      {list.length === 0 && <p>Nothing to record for yet. Add an animal or a group first.</p>}
    </div>
  );
}