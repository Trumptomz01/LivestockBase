"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/lib/useToast";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast, showToast } = useToast();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    // Empty field validation
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
            
        emailRedirectTo: `${window.location.origin}/onboarding/modules?confirmed=true`,

      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Account created successfully
    if (data.user) {
      showToast("Account successfully created! Check your email to confirm your account.", "success");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
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
              Create your account
            </h1>

            <p className="mt-2 text-text-muted">
              Start managing your farm with confidence.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">

            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-bold"
              >
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError("");
                }}
                className="w-full rounded border border-border bg-surface px-4 py-3.5 text-text outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");

                    if (
                      confirmPassword &&
                      e.target.value !== confirmPassword
                    ) {
                      setPasswordError("Passwords do not match.");
                    } else {
                      setPasswordError("");
                    }
                  }}
                  placeholder="Create a password"
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

            {/* General error */}
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-bold"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);

                    if (value && password !== value) {
                      setPasswordError("Passwords do not match.");
                    } else {
                      setPasswordError("");
                    }
                  }}
                  className="w-full rounded border border-border bg-surface px-4 py-3.5 pr-12 text-text outline-none transition placeholder:text-text-muted focus:border-primary"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Password mismatch */}
            {passwordError && (
              <p className="text-sm text-danger">
                {passwordError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded bg-primary py-4 text-[17px] font-bold text-on-primary transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Login */}
          <p className="mt-7 text-center text-sm text-text-muted">
            Already have an account{" "}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}