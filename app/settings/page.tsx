"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppState, modules } from "@/lib/store";
import { useToast } from "@/lib/useToast";
import { TopBar } from "@/components/ui/TopBar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Toast } from "@/components/ui/Toast";
import { Sheet } from "@/components/ui/Sheet";
import { Eye, EyeOff } from "lucide-react";

function Section({ title }: { title: string }) {
  return <div className="text-[14px] font-bold text-text-muted mt-6 mb-1">{title}</div>;
}

function Row({ label, value }: { label: string; value: string }) {
   const [showEmail, setShowEmail] = useState(false);
   function maskEmail(email: string) {
      const [username, domain] = email.split("@");
      if (!domain || !username) return email;
      if (username.length <= 3) {
         return `${username[0]}***@${domain}`;
      }
      return `${username.slice(0, 3)}****${username.slice(-1)}@${domain}`;
   }

  const isEmail = label.toLowerCase() === "email";
  const displayValue = isEmail && !showEmail ? maskEmail(value) : value;

  return (
    <div className="flex justify-between gap-4 py-3.5 border-b border-border text-[15px]">
      <span className="text-text-muted">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-right text-sm break-all">
          {" "}
          {displayValue}{" "}
        </span>
        {isEmail && value !== "—" && (
          <button
            type="button"
            onClick={() => setShowEmail((prev) => !prev)}
            aria-label={showEmail ? "Hide email" : "Show email"}
            title={showEmail ? "Hide email" : "Show email"}
            className="shrink-0 text-text-muted hover:text-text"
          >
            {" "}
            {showEmail ? <EyeOff size={16} /> : <Eye size={16} />}{" "}
          </button>
        )}{" "}
      </div>{" "}
    </div>
  );
}

export default function Settings() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const { toast, showToast } = useToast();
  const { hydrated, syncStatus, isSignedIn, isOnline, farmerName, animals, retrySync, updateFarmerName } =
    useAppState();

  const [email, setEmail] = useState<string | null>(null);

  const [showName, setShowName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setEmail(null);
      return;
    }
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [isSignedIn, supabase]);

  async function saveName() {
    if (!nameDraft.trim()) {
      setNameError("Please enter your name.");
      return;
    }
    setSavingName(true);
    setNameError("");
    const ok = await updateFarmerName(nameDraft);
    setSavingName(false);
    if (!ok) {
      setNameError("Could not save your name. Please try again.");
      return;
    }
    setShowName(false);
    showToast("Name updated.", "success");
  }

  async function savePassword() {
    if (pw.length < 6) {
      setPwError("Use at least 6 characters.");
      return;
    }
    if (pw !== pw2) {
      setPwError("Passwords do not match.");
      return;
    }
    setSavingPw(true);
    setPwError("");
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSavingPw(false);
    if (error) {
      setPwError(error.message);
      return;
    }
    setShowPw(false);
    setPw("");
    setPw2("");
    showToast("Password changed.", "success");
  }

  async function handleLogout() {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLoggingOut(false);
      setShowLogout(false);
      showToast("Could not log out. Please try again.", "error");
      return;
    }
    localStorage.removeItem("hb360-state");
    router.replace("/onboarding/welcome");
  }

  const spinner = (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" role="status" aria-label="Loading" />
    </div>
  );

  if (loggingOut) return spinner; // no flash of the no-account view while signing out
  if (!hydrated || syncStatus === "loading") return spinner;

  if (syncStatus === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="font-bold">We couldn&apos;t load your settings.</p>
        <button onClick={retrySync} className="rounded bg-primary px-5 py-3 font-bold text-on-primary">
          Try again
        </button>
      </div>
    );
  }

  const activeCount = animals.filter((a) => a.status === "active").length;
  const deceasedCount = animals.length - activeCount;
  const perModule = modules
    .map((m) => ({ label: m.label, count: animals.filter((a) => a.module === m.id && a.status === "active").length }))
    .filter((x) => x.count > 0);

  return (
    <div className="flex flex-col flex-1 pb-5">
      <TopBar />
      <h1 className="text-2xl font-bold mb-1">Settings</h1>

      <Section title="Account" />
      {isSignedIn ? (
        <>
          <div className="flex justify-between items-center gap-4 py-3.5 border-b border-border text-[15px]">
            <span className="text-text-muted">Name</span>
            <span className="flex items-center gap-3">
              <span className="font-bold text-sm ">{farmerName || "—"}</span>
              <button
                onClick={() => {
                  setNameDraft(farmerName || "");
                  setNameError("");
                  setShowName(true);
                }}
                className="text-primary cursor-pointer font-bold text-[14px] underline"
              >
                Edit
              </button>
            </span>
          </div>
          <Row label="Email" value={email || "—"} />
          <div className="flex justify-between items-center py-3.5 border-b border-border text-[15px]">
            <span className="text-text-muted ">Password</span>
            <button
              onClick={() => {
                setPw("");
                setPw2("");
                setPwError("");
                setShowPw(true);
              }}
              className="text-primary cursor-pointer font-bold text-[14px] underline"
            >
              Change password
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-lg border-2 border-border bg-surface p-4">
          <p className="font-bold mb-1">Your records are only on this phone</p>
          <p className="text-[14px] text-text-muted mb-4">
            Create an account to save them online. If you change phones or clear this browser, records that are
            only on this phone can be lost.
          </p>
          <div className="flex flex-col gap-2.5">
            <button onClick={() => router.push("/signup")} className="w-full py-3.5 rounded bg-primary text-on-primary font-bold text-[16px]">
              Create account
            </button>
            <button onClick={() => router.push("/login")} className="w-full py-3.5 rounded border-2 border-border font-bold text-[16px]">
              I already have an account
            </button>
          </div>
        </div>
      )}

      <Section title="Your farm" />
      <Row label="Total Animals" value={String(activeCount)} />
      {perModule.map((x) => (
        <Row key={x.label} label={x.label} value={String(x.count)} />
      ))}
      {deceasedCount > 0 && <Row label="Marked deceased" value={String(deceasedCount)} />}
      <Row label="Records are saved" value={isSignedIn ? "In your account" : "On this phone only"} />
      <Row label="Connection" value={isOnline ? "Online" : "Offline"} />

      <Section title="Appearance" />
      <div className="flex justify-between items-center py-3.5 border-b border-border text-[15px]">
        <span>Light or dark mode</span>
        <ThemeToggle />
      </div>

      <Section title="Help" />
      <button
        onClick={() => router.push("/help")}
        className="flex justify-between items-center w-full py-3.5 border-b border-border text-[15px] text-left"
      >
        <span>Need help?</span>
        <span className="text-primary font-bold text-[14px] underline">Open</span>
      </button>

      {isSignedIn && (
        <div className="mt-auto pt-8">
          <button
            onClick={() => setShowLogout(true)}
            className="w-full py-4 rounded border-2 border-border text-danger font-bold text-[17px]"
          >
            Log out
          </button>
        </div>
      )}

      {showName && (
        <Sheet onClose={() => setShowName(false)}>
          <h2 className="text-xl font-bold mb-4">Change your name</h2>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            className="w-full p-4 text-xl rounded border-2 border-border bg-surface-2 text-text mb-3"
          />
          {nameError && <p className="text-danger text-sm mb-3" role="alert">{nameError}</p>}
          <div className="flex gap-2.5">
            <button onClick={() => setShowName(false)} className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]">
              Cancel
            </button>
            <button onClick={saveName} disabled={savingName} className="flex-1 py-4 rounded bg-primary text-on-primary font-bold text-[16px] disabled:opacity-70">
              {savingName ? "Saving..." : "Save"}
            </button>
          </div>
        </Sheet>
      )}

      {showPw && (
        <Sheet onClose={() => setShowPw(false)}>
          <h2 className="text-xl font-bold mb-4">Change password</h2>
          <label className="block text-[15px] font-bold mb-2">New password</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full p-4 text-[17px] rounded border-2 border-border bg-surface-2 text-text mb-3"
          />
          <label className="block text-[15px] font-bold mb-2">Type it again</label>
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className="w-full p-4 text-[17px] rounded border-2 border-border bg-surface-2 text-text mb-3"
          />
          {pwError && <p className="text-danger text-sm mb-3" role="alert">{pwError}</p>}
          <div className="flex gap-2.5">
            <button onClick={() => setShowPw(false)} className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]">
              Cancel
            </button>
            <button onClick={savePassword} disabled={savingPw} className="flex-1 py-4 rounded bg-primary text-on-primary font-bold text-[16px] disabled:opacity-70">
              {savingPw ? "Saving..." : "Change"}
            </button>
          </div>
        </Sheet>
      )}

      {showLogout && (
        <Sheet onClose={() => setShowLogout(false)}>
          <h2 className="text-xl font-bold mb-2">Log out?</h2>
          <p className="text-text-muted mb-5">Your records stay safe in your account. Log in again any time to see them.</p>
          <div className="flex gap-2.5">
            <button onClick={() => setShowLogout(false)} className="flex-1 py-4 rounded border-2 border-border font-bold text-[16px]">
              Cancel
            </button>
            <button onClick={handleLogout} className="flex-1 py-4 rounded bg-primary text-on-primary font-bold text-[16px]">
              Log out
            </button>
          </div>
        </Sheet>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}