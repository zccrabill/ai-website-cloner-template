"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSuccess(false);
    setIsLoading(true);

    try {
      if (!email) {
        throw new Error("Please enter your email address");
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setIsSuccess(true);
      setEmail("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white border border-[#1F1810]/8 rounded-2xl p-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/images/logo-arrow.png"
                alt="Av{ai}lable Law"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>

            {/* Heading */}
            <h1
              className="text-3xl font-bold text-[#1F1810] text-center mb-3"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              Member Login
            </h1>

            {/* Subtitle */}
            <p className="text-center text-[#6B5B4E] text-sm mb-8">
              Sign in with your email to access your dashboard
            </p>

            {/* Success Message */}
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400 text-center">
                  Check your email for a magic link to sign in
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[#6B5B4E] mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading || isSuccess}
                  className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 text-[#1F1810] placeholder-[#A89279] rounded-lg focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Send Magic Link Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="btn-al btn-al-primary w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1F1810]/8" />
              <span className="text-xs text-[#A89279]">or</span>
              <div className="flex-1 h-px bg-[#1F1810]/8" />
            </div>

            {/* Get Started Link */}
            <div className="text-center text-sm text-[#6B5B4E]">
              Not a member yet?{" "}
              <a
                href="/#pricing"
                className="text-[#C17832] font-medium hover:text-[#D4893F] transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-[#A89279] mt-8">
            We'll send you a secure magic link to sign in. No password needed.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
