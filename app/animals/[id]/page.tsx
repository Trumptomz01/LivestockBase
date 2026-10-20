"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppState, moduleById, formatWhen, todayISO, deathCauseSuggestions } from "@/lib/store";
import { aliveCount, sickCount, isGroup, eventDetailText } from "@/lib/group";
import { TopBar } from "@/components/ui/TopBar";
import { IconPaths } from "@/components/ui/IconPaths";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";

const VISIBLE_COUNT = 3;

function StatBox({ value, label, alert = false }: { value: number; label: string; alert?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${alert ? "bg-flag-bg border-flag/40" : "bg-surface border-border"}`}>
      <div className={`text-[30px] font-bold leading-none ${alert ? "text-flag" : ""}`}>{value}</div>
      <div className="text-[13px] text-text-muted mt-1.5">{label}</div>
    </div>
  );
}

export default function AnimalProfile() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getAnimal, setCurrentAnimalId, updateAnimal, deleteAnimal, deleteEvent, markDeceased } = useAppState();
  const animal = id ? getAnimal(id) : undefined;

  // edit
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("Adult");
  const [saving, setSaving] = useState(false);
  // delete
  const [confirmDeleteAnimal, setConfirmDeleteAnimal] = useState(false);
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<string | null>(null);
  // deceased (single animals only)
  const [showDeathForm, setShowDeathForm] = useState(false);
  const [deathCause, setDeathCause] = useState("");
  const [customCause, setCustomCause] = useState("");
  const [deathDate, setDeathDate] = useState(todayISO());
  const [savingDeath, setSavingDeath] = useState(false);
  // activity list
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    if (id) setCurrentAnimalId(id);
  }, [id, setCurrentAnimalId]);

  if (!animal) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <TopBar />
        <p>That animal couldn&apos;t be found.</p>
      </div>
    );
  }

  const m = moduleById(animal.module);
  const deceased = animal.status === "deceased";
  const group = isGroup(animal);
  const alive = aliveCount(animal);
  const sick = sickCount(animal);
  const closed = deceased || alive === 0; // nothing left to record for
  const visibleEvents = showAllEvents ? animal.events : animal.events.slice(0, VISIBLE_COUNT);

  function openEdit() {
    if (!animal) return;
    setEditName(animal.name);
    setEditAge(animal.ageLabel);
    setIsEditing(true);
  }

  async function saveEdit() {
    if (!animal) return;
    setSaving(true);
    const ok = await updateAnimal(animal.id, { name: editName.trim() || animal.name, ageLabel: editAge });
    setSaving(false);
    if (ok) setIsEditing(false);
  }

  async function confirmDeath() {
    if (!animal) return;
    setSavingDeath(true);
    const ok = await markDeceased(animal.id, customCause.trim() || deathCause, deathDate);
    setSavingDeath(false);
    if (ok) setShowDeathForm(false);
  }

  return (
    <div className="flex flex-col flex-1 pb-5 relative">
      <TopBar />
      <div className="flex flex-col items-center text-center pt-2 pb-2.5">
        <div className="w-[88px] h-[88px] rounded-full bg-surface-2 flex items-center justify-center mb-3 text-secondary">
          <IconPaths paths={m.iconPaths} className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold mb-0">{animal.name}</h1>
        <p>
          {m.label}
          {group ? " group" : ""} · {animal.ageLabel}
        </p>
        {deceased && <p className="mt-1 text-[14px] font-bold text-text-muted">Deceased</p>}
      </div>

      {group && (
        <>
          <div className="grid grid-cols-3 gap-2.5 mt-1">
            <StatBox value={alive} label="Alive" />
            <StatBox value={sick} label="Sick" alert={sick > 0} />
            <StatBox value={alive - sick} label="Healthy" />
          </div>
          <p className="text-center text-[13px] text-text-muted mt-2 mb-1">Started with {animal.startCount}</p>
        </>
      )}

      <div className="flex justify-between py-3.5 border-b border-border text-[15px]">
        <span className="text-text-muted">Last fed</span>
        <span className="font-bold">{animal.lastFedWhen ? formatWhen(animal.lastFedWhen) : "—"}</span>
      </div>
      <div className="flex justify-between py-3.5 border-b border-border text-[15px]">
        <span className="text-text-muted">Last health check</span>
        <span className="font-bold">{animal.lastCheckWhen ? formatWhen(animal.lastCheckWhen) : "—"}</span>
      </div>
      {animal.addedToday && (
        <div className="flex justify-between py-3.5 border-b border-border text-[15px]">
          <span className="text-text-muted">Added</span>
          <span className="font-bold">Today</span>
        </div>
      )}
      {deceased && (
        <>
          <div className="flex justify-between py-3.5 border-b border-border text-[15px]">
            <span className="text-text-muted">What happened</span>
            <span className="font-bold">{animal.deathCause || "Not recorded"}</span>
          </div>
          <div className="flex justify-between py-3.5 border-b border-border text-[15px]">
            <span className="text-text-muted">Date</span>
            <span className="font-bold">{animal.deathDate ? formatWhen(animal.deathDate) : "—"}</span>
          </div>
        </>
      )}

      <div className="text-[14px] font-bold text-text-muted mt-4 mb-2.5">Recent activity</div>
      {animal.events.length === 0 ? (
        <p className="py-2.5">No activity yet. Recording something will show up here.</p>
      ) : (
        <>
          {visibleEvents.map((e) => (
            <div key={e.id} className="flex gap-3 py-3 border-b border-border items-start">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${e.flag ? "bg-flag" : "bg-primary"}`} />
              <div className="flex-1">
                <b className="block text-[15px]">{e.label}</b>
                {eventDetailText(e) && <span className="block text-[13px] text-text-muted">{eventDetailText(e)}</span>}
                <span className="text-[14px] text-text-muted">{formatWhen(e.when)}</span>
              </div>
              {!closed && (
                <button
                  onClick={() => setConfirmDeleteEventId(e.id)}
                  className="text-text-muted text-[13px] underline shrink-0"
                  aria-label={`Delete ${e.label}`}
                >
                  Delete
                </button>
              )}
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
        {closed ? (
          <p className="text-center text-[14px] text-text-muted">
            {group ? "No animals are left in this group." : "This animal is marked deceased."} You can still see its
            past records above.
          </p>
        ) : (
          <>
            <button onClick={() => router.push("/record")} className="w-full py-4 rounded bg-primary text-on-primary font-bold text-[17px]">
              Record for {animal.name}
            </button>
            <button onClick={openEdit} className="text-primary font-bold py-2">Edit details</button>
            {!group && (
              <button onClick={() => setShowDeathForm(true)} className="text-text-muted font-bold py-2">
                Mark as deceased
              </button>
            )}
            <button onClick={() => setConfirmDeleteAnimal(true)} className="text-danger font-bold py-2">
              {group ? "Delete group" : "Delete animal"}
            </button>
          </>
        )}
      </div>

      {isEditing && (
        <Sheet onClose={() => setIsEditing(false)}>
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
            <button onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]">
              Cancel
            </button>
            <button onClick={saveEdit} disabled={saving} className="flex-1 py-4 rounded bg-primary text-on-primary font-bold text-[16px] disabled:opacity-70">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </Sheet>
      )}

      {showDeathForm && (
        <Sheet onClose={() => setShowDeathForm(false)}>
          <h2 className="text-xl font-bold mb-1">Mark {animal.name} as deceased</h2>
          <p className="text-text-muted mb-4 text-[14px]">This can&apos;t be undone. You&apos;ll still see the past records.</p>

          <label className="block text-[15px] font-bold mb-2">What happened?</label>
          <div className="flex gap-2 flex-wrap mb-3">
            {deathCauseSuggestions.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={deathCause === c}
                onClick={() => {
                  setDeathCause(c);
                  setCustomCause("");
                }}
              />
            ))}
          </div>
          <input
            value={customCause}
            onChange={(e) => {
              setCustomCause(e.target.value);
              if (e.target.value) setDeathCause("");
            }}
            placeholder="Or write it yourself"
            className="w-full p-4 text-[16px] rounded border-2 border-border bg-surface-2 text-text mb-4"
          />

          <label className="block text-[15px] font-bold mb-2">When?</label>
          <input
            type="date"
            value={deathDate}
            max={todayISO()}
            onChange={(e) => setDeathDate(e.target.value)}
            className="w-full p-4 text-[16px] rounded border-2 border-border bg-surface-2 text-text mb-5"
          />

          <div className="flex gap-2.5">
            <button onClick={() => setShowDeathForm(false)} className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]">
              Cancel
            </button>
            <button
              onClick={confirmDeath}
              disabled={savingDeath || (!deathCause && !customCause.trim())}
              className="flex-1 py-4 rounded bg-danger text-on-primary font-bold text-[16px] disabled:opacity-60"
            >
              {savingDeath ? "Saving..." : "Confirm"}
            </button>
          </div>
        </Sheet>
      )}

      {confirmDeleteAnimal && (
        <Sheet onClose={() => setConfirmDeleteAnimal(false)}>
          <h2 className="text-xl font-bold mb-2">Delete {animal.name}?</h2>
          <p className="text-text-muted mb-5">
            This removes {animal.name} and all its records. This can&apos;t be undone.
          </p>
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
        </Sheet>
      )}

      {confirmDeleteEventId && (
        <Sheet onClose={() => setConfirmDeleteEventId(null)}>
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
        </Sheet>
      )}
    </div>
  );
}