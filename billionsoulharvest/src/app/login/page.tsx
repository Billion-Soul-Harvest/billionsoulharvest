"use client";

import { useState } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-800 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-20 -left-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-32 right-10 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <Image
            src="/bsh-logo.png"
            alt="Billion Soul Harvest"
            width={360}
            height={120}
            className="w-72 h-auto brightness-0 invert drop-shadow-lg"
            priority
          />
          <p className="text-white/80 text-lg mt-6 text-center max-w-sm leading-relaxed">
            Accelerating the Great Commission through strategic ministry management
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mt-12">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">1B+</p>
              <p className="text-sm text-white/60 mt-1">Souls Reached</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">180+</p>
              <p className="text-sm text-white/60 mt-1">Countries</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">5M+</p>
              <p className="text-sm text-white/60 mt-1">Churches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 relative">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image
              src="/bsh-logo.png"
              alt="Billion Soul Harvest"
              width={240}
              height={80}
              className="h-14 w-auto"
              priority
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your admin dashboard
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-white rounded-2xl border shadow-sm p-7 space-y-5"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Billion Soul Harvest Ministry Platform
          </p>
        </div>
      </div>
    </div>
  );
}
