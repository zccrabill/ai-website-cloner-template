"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MIN_PASSWORD = 8;

/**
 * Password-reset landing. The user arrives here from the reset email link, which
 * carries a recovery token. supabase-js (detectSessionInUrl) processes it on
 * mount and establishes a short-lived recovery session, after which the user can
 * set a new password via updateUser. If they land here without a recovery
 * session (e.g. typed the URL directly), we tell them to use the email link.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setChecking(false);
      }
    });

    // Also check directly, in case the session was processed before this mounts.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) setReady(true);
      setChecking(false);
    });

    // Give the URL-token processing a beat before declaring "no recovery session".
    const t = setTimeout(() => mounted && setChecking(false), 4000);

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    const { error: uErr } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (uErr) {
      setError(uErr.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/auth/callback"), 1400);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-[#1F1810]/8 rounded-2xl p-8">
            <div className="flex justify-center mb-8">
              <Image
                src="/images/logo-arrow.png"
                alt="Av{ai}lable Law"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <h1
              className="text-3xl font-bold text-[#1F1810] text-center mb-3"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              Set a new password
            </h1>

            {done ? (
              <div className="mt-6 p-4 bg-[#7A8B6F]/10 border border-[#7A8B6F]/30 rounded-lg">
                <p className="text-sm text-[#5A6B53] text-center">
                  Password updated — signing you in…
                </p>
              </div>
            ) : checking ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin mx-auto" />
              </div>
            ) : ready ? (
              <>
                <p className="text-center text-[#6B5B4E] text-sm mb-8">
                  Choose a new password for your account.
                </p>
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-500 text-center">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-[#6B5B4E] mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={`At least ${MIN_PASSWORD} characters`}
                      className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 text-[#1F1810] placeholder-[#A89279] rounded-lg focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B5B4E] mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 text-[#1F1810] placeholder-[#A89279] rounded-lg focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-al btn-al-primary w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving…" : "Update password"}
                  </button>
                </form>
              </>
            ) : (
              <div className="mt-2 text-center">
                <p className="text-sm text-[#6B5B4E] mb-6">
                  This page only works when opened from the password-reset link in
                  your email. Request one from the sign-in screen.
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="btn-al btn-al-primary py-2.5 px-6 rounded-lg text-sm font-semibold"
                >
                  Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
