"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppState, moduleById, formatWhen  } from "@/lib/store";
import { TopBar } from "@/components/ui/TopBar";
import { IconPaths } from "@/components/ui/IconPaths";
import { Chip } from "@/components/ui/Chip";

export default function AnimalProfile() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getAnimal, setCurrentAnimalId, updateAnimal,  deleteAnimal, deleteEvent } = useAppState();
  const animal = id ? getAnimal(id) : undefined;

  const [confirmDeleteAnimal, setConfirmDeleteAnimal] = useState(false);
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("Adult");
  const [saving, setSaving] = useState(false);

  const [showAllEvents, setShowAllEvents] = useState(false);
  const VISIBLE_COUNT = 2;
  const visibleEvents = animal
    ? showAllEvents ? animal.events : animal.events.slice(0, VISIBLE_COUNT)
    : [];

  useEffect(() => {
    if (id) setCurrentAnimalId(id);
  }, [id, setCurrentAnimalId]);

  function openEdit() {
    if (!animal) return;
    setEditName(animal.name);
    setEditAge(animal.ageLabel);
    setIsEditing(true);
  }

  function saveEdit() {
    if (!animal) return;
    setSaving(true);
    updateAnimal(animal.id, { name: editName.trim() || animal.name, ageLabel: editAge });
    setSaving(false);
    setIsEditing(false);
  }

  if (!animal) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <TopBar />
        <p>That animal couldn&apos;t be found.</p>
      </div>
    );
  }

  const m = moduleById(animal.module);

  return (
    <div className="flex flex-col flex-1 pb-5 relative">
      <TopBar />
      <div className="flex flex-col items-center text-center pt-2 pb-2.5">
        <div className="w-[88px] h-[88px] rounded-full bg-surface-2 flex items-center justify-center mb-3 text-secondary">
          <IconPaths paths={m.iconPaths} className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold mb-0">{animal.name}</h1>
        <p>{m.label} · {animal.ageLabel}</p>
      </div>

      <div className="flex justify-between py-3.5 border-b border-border text-[15px]">
        <span className="text-text-muted">Last fed</span>
        <span className="font-bold">{animal.lastFedWhen ? formatWhen(animal.lastFedWhen) : "—"}</span>
      </div>
      <div className="flex justify-between py-3.5 border-b border-border text-[15px]">
        <span className="text-text-muted">Last health check</span>
        <span className="font-bold">{animal.lastCheckWhen ? formatWhen(animal.lastCheckWhen) : "—"}</span>
      </div>
      <div className="flex justify-between py-3.5 border-b border-border text-[15px]">
        <span className="text-text-muted">Added</span>
        <span className="font-bold">Today</span>
      </div>

      <div className="text-[14px] font-bold text-text-muted mt-4 mb-2.5">Recent activity</div>
      {animal.events.length === 0 ? (
        <p className="py-2.5">No activity yet. Recording something will show up here.</p>
      ) : (
        <>
          {visibleEvents.map((e, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-border">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${e.flag ? "bg-flag" : "bg-primary"}`} />
              <div>
                <b className="block text-[15px]">{e.label}</b>
                <span className="text-[14px] text-text-muted">{formatWhen(e.when)}</span>
              </div>
            </div>
          ))}
          {animal.events.length > VISIBLE_COUNT && (
            <button
              onClick={() => setShowAllEvents((v) => !v)}
              className="flex items-center justify-center gap-1.5 w-full py-3 text-primary font-bold text-[14px]"
            >
              {showAllEvents ? "Show less" : `Show all ${animal.events.length}`}
              <svg
                viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showAllEvents ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          )}
        </>
      )}

      <div className="mt-auto pt-4 flex flex-col gap-2.5">
        <button onClick={() => router.push("/record")} className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px]">
          Record for {animal.name}
        </button>
        <button onClick={openEdit} className="text-primary font-bold py-2">
          Edit details
        </button>
        <button
          onClick={() => setConfirmDeleteAnimal(true)}
          className="text-danger font-bold py-2"
        >
          Delete animal
        </button>
      </div>

      {confirmDeleteAnimal && (
  <div className="fixed inset-0 z-50 flex items-end justify-center">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteAnimal(false)} />
    <div className="relative w-full max-w-md bg-surface rounded-t-2xl p-5 pb-6">
      <h2 className="text-xl font-bold mb-2">Delete {animal.name}?</h2>
      <p className="text-text-muted mb-5">This removes {animal.name} and all their records. This can&apos;t be undone.</p>
      <div className="flex gap-2.5">
        <button onClick={() => setConfirmDeleteAnimal(false)} className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]">
          Cancel
        </button>
        <button
          onClick={() => {
            deleteAnimal(animal.id);
            router.push("/dashboard");
          }}
          className="flex-1 py-4 rounded bg-danger text-on-primary font-bold text-[16px]"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

{confirmDeleteEventId && (
  <div className="fixed inset-0 z-50 flex items-end justify-center">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteEventId(null)} />
    <div className="relative w-full max-w-md bg-surface rounded-t-2xl p-5 pb-6">
      <h2 className="text-xl font-bold mb-2">Delete this record?</h2>
      <p className="text-text-muted mb-5">This can&apos;t be undone.</p>
      <div className="flex gap-2.5">
        <button onClick={() => setConfirmDeleteEventId(null)} className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]">
          Cancel
        </button>
        <button
          onClick={() => {
            deleteEvent(animal.id, confirmDeleteEventId);
            setConfirmDeleteEventId(null);
          }}
          className="flex-1 py-4 rounded bg-danger text-on-primary font-bold text-[16px]"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
      {visibleEvents.map((e) => (
        <div key={e.id} className="flex gap-3 py-3 border-b border-border items-start">
          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${e.flag ? "bg-flag" : "bg-primary"}`} />
          <div className="flex-1">
            <b className="block text-[15px]">{e.label}</b>
            <span className="text-[14px] text-text-muted">{formatWhen(e.when)}</span>
          </div>
          <button
            onClick={() => setConfirmDeleteEventId(e.id)}
            className="text-text-muted text-[13px] underline shrink-0"
            aria-label={`Delete ${e.label}`}
          >
            Delete
          </button>
        </div>
      ))}

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          />
          <div className="relative w-full max-w-md bg-surface rounded-t-2xl p-5 pb-6">
            <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4">Edit {animal.name}</h2>

            <label className="block text-[15px] font-bold mb-2">Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-4 text-xl rounded border-2 border-border bg-surface-2 text-text mb-4"
            />

            <label className="block text-[15px] font-bold mb-2">Age</label>
            <div className="flex gap-2.5 flex-wrap mb-5">
              {["Young", "Adult", "Not sure"].map((label) => (
                <Chip key={label} label={label} selected={editAge === label} onClick={() => setEditAge(label)} />
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 py-4 rounded bg-primary text-on-primary font-bold text-[16px] disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}