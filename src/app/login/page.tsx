"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Cloudflare Turnstile site key — public, safe to commit. The matching secret
// lives only in Supabase (Auth → Attack Protection). Captcha is enforced on the
// password, signup, and recovery flows, so every submit needs a fresh token.
const TURNSTILE_SITE_KEY = "0x4AAAAAADKgYilWl-LRewOy";

type Mode = "signin" | "signup" | "forgot";

const MIN_PASSWORD = 8;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Load + mount the Turnstile widget once. Its token is passed to Supabase,
  // which verifies it server-side before processing the auth request.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const renderWidget = () => {
      const w = window as unknown as {
        turnstile?: {
          render: (el: HTMLElement, opts: Record<string, unknown>) => string;
          reset: (id: string) => void;
        };
      };
      if (!w.turnstile || !turnstileRef.current || widgetIdRef.current) return;
      widgetIdRef.current = w.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => setCaptchaToken(token),
        "error-callback": () => setCaptchaToken(null),
        "expired-callback": () => setCaptchaToken(null),
      });
    };

    if (!document.getElementById("cf-turnstile-script")) {
      const s = document.createElement("script");
      s.id = "cf-turnstile-script";
      s.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = renderWidget;
      document.head.appendChild(s);
    } else {
      renderWidget();
    }
  }, []);

  // Turnstile tokens are single-use; reset the widget after every attempt so a
  // retry (or a mode switch) gets a fresh token.
  const resetCaptcha = () => {
    const w = window as unknown as { turnstile?: { reset: (id: string) => void } };
    if (widgetIdRef.current && w.turnstile) w.turnstile.reset(widgetIdRef.current);
    setCaptchaToken(null);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setNotice("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setIsLoading(true);

    try {
      if (!email.trim()) throw new Error("Please enter your email address.");
      if (!captchaToken) {
        throw new Error("Please complete the verification challenge.");
      }

      if (mode === "forgot") {
        const { error: rErr } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { captchaToken, redirectTo: `${SITE_URL}/auth/reset` },
        );
        if (rErr) throw rErr;
        setNotice(
          "If an account exists for that email, a password-reset link is on its way. Check your inbox.",
        );
      } else if (mode === "signup") {
        if (password.length < MIN_PASSWORD) {
          throw new Error(`Password must be at least ${MIN_PASSWORD} characters.`);
        }
        const { data, error: sErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { captchaToken, emailRedirectTo: `${SITE_URL}/auth/callback` },
        });
        if (sErr) throw sErr;
        if (data.session) {
          router.push("/auth/callback");
          return;
        }
        // Email-confirmation is on: no session until they confirm.
        setNotice(
          "Account created. Check your email to confirm your address, then sign in below.",
        );
        switchMode("signin");
      } else {
        const { error: iErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
          options: { captchaToken },
        });
        if (iErr) throw iErr;
        router.push("/auth/callback");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      resetCaptcha();
      setIsLoading(false);
    }
  };

  const heading =
    mode === "signup"
      ? "Create your account"
      : mode === "forgot"
        ? "Reset your password"
        : "Member Login";
  const subtitle =
    mode === "signup"
      ? "Set up your Available Law portal access."
      : mode === "forgot"
        ? "We'll email you a link to set a new password."
        : "Sign in with your email and password.";
  const cta =
    mode === "signup"
      ? "Create account"
      : mode === "forgot"
        ? "Send reset link"
        : "Sign in";

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
              {heading}
            </h1>
            <p className="text-center text-[#6B5B4E] text-sm mb-8">{subtitle}</p>

            {notice && (
              <div className="mb-6 p-4 bg-[#7A8B6F]/10 border border-[#7A8B6F]/30 rounded-lg">
                <p className="text-sm text-[#5A6B53] text-center">{notice}</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-500 text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[#6B5B4E] mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 text-[#1F1810] placeholder-[#A89279] rounded-lg focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all disabled:opacity-50"
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-xs font-medium text-[#6B5B4E]">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-[#C17832] font-medium hover:text-[#D4893F] transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? `At least ${MIN_PASSWORD} characters` : "Your password"}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 text-[#1F1810] placeholder-[#A89279] rounded-lg focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all disabled:opacity-50"
                  />
                </div>
              )}

              <div className="flex justify-center">
                <div ref={turnstileRef} />
              </div>

              <button
                type="submit"
                disabled={isLoading || !captchaToken}
                className="btn-al btn-al-primary w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Please wait…" : cta}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1F1810]/8" />
              <span className="text-xs text-[#A89279]">
                {mode === "signin" ? "New to Available Law?" : "Already a member?"}
              </span>
              <div className="flex-1 h-px bg-[#1F1810]/8" />
            </div>

            <div className="text-center text-sm text-[#6B5B4E]">
              {mode === "signin" ? (
                <>
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="text-[#C17832] font-medium hover:text-[#D4893F] transition-colors"
                  >
                    Create an account
                  </button>
                  {" · "}
                  <Link href="/#pricing" className="text-[#6B5B4E] hover:text-[#1F1810] transition-colors">
                    View plans
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-[#C17832] font-medium hover:text-[#D4893F] transition-colors"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-[#A89279] mt-8">
            Protected by Cloudflare Turnstile. Your data is encrypted at rest and in transit.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
