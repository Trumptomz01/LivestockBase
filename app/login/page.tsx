"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/lib/useToast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { toast, showToast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    // Empty field validation
    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Login successful
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Unable to verify your account.");
      setLoading(false);
      return;
    }

    const { data: farmer, error: farmerError } = await supabase
      .from("farmers")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    if (farmerError) {
      setError("Unable to load your account.");
      setLoading(false);
      return;
    }

    showToast("Welcome back!", "success");

    setTimeout(() => {
      if (farmer.onboarding_completed) {
        router.push("/");
      } else {
        router.push("/onboarding/modules");
      }
    }, 1000);
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}

      <main className="min-h-screen bg-bg px-5 py-8 text-text">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="text-[26px] font-bold text-primary">
              HerdBase360
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              Welcome back
            </h1>

            <p className="mt-2 text-text-muted">
              Log in to continue managing your farm.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="w-full rounded-[14px] border border-border bg-surface px-4 py-3.5 text-text outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-[14px] border border-border bg-surface px-4 py-3.5 pr-12 text-text outline-none transition placeholder:text-text-muted focus:border-primary"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded bg-primary py-4 text-[17px] font-bold text-on-primary transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Signup */}
          <p className="mt-7 text-center text-sm text-text-muted">
            Don't have an account{" "}
            <Link
              href="/signup"
              className="font-bold text-primary hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}