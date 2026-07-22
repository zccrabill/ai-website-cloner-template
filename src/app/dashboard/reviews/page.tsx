"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import {
  Star,
  Loader2,
  CheckCircle2,
  Archive,
  Pencil,
  Sparkles,
  ShieldAlert,
  Undo2,
  Lock,
} from "lucide-react";

interface ClientReview {
  id: string;
  created_at: string;
  rating: number;
  chips: string[];
  practice_area: string | null;
  review_text: string;
  ai_drafting_used: boolean;
  ai_draft_text: string | null;
  first_name: string;
  last_name: string;
  business_name: string | null;
  consent_level: "full" | "first_initial" | "anonymous" | "private";
  consent_text: string;
  consent_agreed_at: string;
  display_name: string;
  status: "pending" | "approved" | "archived";
  published_text: string | null;
  admin_edited: boolean;
  reconsent_needed: boolean;
  approved_at: string | null;
}

const CONSENT_LABELS: Record<ClientReview["consent_level"], string> = {
  full: "Full name + business",
  first_initial: "First name + initial",
  anonymous: "Anonymous",
  private: "Private — do not publish",
};

type Tab = "pending" | "approved" | "archived";

export default function ClientReviewsAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }
        const { data: member } = await supabase
          .from("members")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        const isAdmin = member?.role === "admin" || member?.role === "attorney";
        if (!isAdmin) {
          router.push("/dashboard");
          return;
        }
        setAuthorized(true);
        await loadReviews();
      } catch (err) {
        console.error(err);
        setError("Failed to load client reviews.");
      } finally {
        setLoading(false);
      }
    };
    init();

    // Same wipe-on-auth-change hygiene as the Ava review queue: if the admin
    // signs out, clear moderation data from memory immediately.
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      setAuthorized(false);
      setReviews([]);
      setEditingId(null);
      setEditedText("");
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReviews = async () => {
    const { data, error: qErr } = await supabase
      .from("client_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (qErr) {
      console.error(qErr);
      setError(qErr.message);
      return;
    }
    setReviews((data ?? []) as ClientReview[]);
  };

  const updateReview = async (id: string, patch: Partial<ClientReview>) => {
    setSavingId(id);
    setError(null);
    const { error: uErr } = await supabase
      .from("client_reviews")
      .update(patch)
      .eq("id", id);
    setSavingId(null);
    if (uErr) {
      console.error(uErr);
      setError(uErr.message);
      return false;
    }
    await loadReviews();
    return true;
  };

  const approve = async (review: ClientReview) => {
    // Approve as-submitted: publish the client's exact adopted words.
    await updateReview(review.id, {
      status: "approved",
      published_text: review.review_text,
      admin_edited: false,
      reconsent_needed: false,
      approved_at: new Date().toISOString(),
    });
  };

  const approveWithEdits = async (review: ClientReview) => {
    const text = editedText.trim();
    if (text.length < 5) return;
    // Material-change check: anything beyond whitespace differences flags the
    // row for client re-consent — the published words must stay the client's.
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
    const materiallyChanged = normalize(text) !== normalize(review.review_text);
    const ok = await updateReview(review.id, {
      status: "approved",
      published_text: text,
      admin_edited: materiallyChanged,
      reconsent_needed: materiallyChanged,
      approved_at: new Date().toISOString(),
    });
    if (ok) {
      setEditingId(null);
      setEditedText("");
    }
  };

  const archive = (review: ClientReview) =>
    updateReview(review.id, { status: "archived" });

  const backToPending = (review: ClientReview) =>
    updateReview(review.id, {
      status: "pending",
      published_text: null,
      approved_at: null,
    });

  const visible = reviews.filter((r) => r.status === tab);
  const counts: Record<Tab, number> = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    archived: reviews.filter((r) => r.status === "archived").length,
  };

  if (loading) {
    return (
      <DashboardShell title="Client Reviews">
        <div className="flex items-center justify-center py-24 text-[#6B5B4E]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading reviews…
        </div>
      </DashboardShell>
    );
  }
  if (!authorized) return null;

  return (
    <DashboardShell title="Client Reviews">
      <div className="max-w-[900px]">
        <p className="text-sm text-[#6B5B4E] mb-6">
          Submissions from{" "}
          <span className="font-mono text-xs bg-[#1F1810]/5 px-1.5 py-0.5 rounded">
            availablelaw.com/review
          </span>
          . Nothing publishes until you approve it here; approved reviews render
          in the site&apos;s testimonials section.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "archived"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? "bg-[#1F1810] text-white"
                  : "bg-white border border-[#1F1810]/10 text-[#6B5B4E] hover:border-[#1F1810]/30"
              }`}
            >
              {t} ({counts[t]})
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {visible.length === 0 && (
          <div className="bg-white border border-[#1F1810]/8 rounded-2xl p-10 text-center text-[#A89279] text-sm">
            {tab === "pending"
              ? "No pending reviews. Text a client the link: availablelaw.com/review"
              : `No ${tab} reviews yet.`}
          </div>
        )}

        <div className="space-y-4">
          {visible.map((review) => {
            const isEditing = editingId === review.id;
            const isSaving = savingId === review.id;
            const isPrivate = review.consent_level === "private";
            return (
              <div
                key={review.id}
                className="bg-white border border-[#1F1810]/8 rounded-2xl p-6"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: review.rating }, (_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-[#C17832] text-[#C17832]"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#A89279]">
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#1F1810]">
                      {review.first_name} {review.last_name}
                      {review.business_name ? ` — ${review.business_name}` : ""}
                    </p>
                    <p className="text-xs text-[#A89279]">
                      Will display as: {review.display_name}
                      {review.practice_area ? ` · ${review.practice_area}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
                        isPrivate
                          ? "bg-[#1F1810]/8 text-[#1F1810]"
                          : "bg-[#C17832]/10 text-[#C17832]"
                      }`}
                    >
                      {isPrivate && <Lock className="w-3 h-3" />}
                      {CONSENT_LABELS[review.consent_level]}
                    </span>
                    {review.ai_drafting_used && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-[#1F1810]/5 text-[#6B5B4E]">
                        <Sparkles className="w-3 h-3" />
                        AI draft used
                      </span>
                    )}
                    {review.reconsent_needed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                        <ShieldAlert className="w-3 h-3" />
                        Re-consent needed
                      </span>
                    )}
                  </div>
                </div>

                {/* Chips */}
                {review.chips.length > 0 && (
                  <p className="text-xs text-[#6B5B4E] mb-3">
                    {review.chips.join(" · ")}
                  </p>
                )}

                {/* Text (or editor) */}
                {isEditing ? (
                  <>
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={5}
                      maxLength={2000}
                      className="w-full border border-[#1F1810]/15 rounded-xl p-3 text-sm text-[#1F1810] leading-relaxed focus:border-[#C17832] focus:outline-none focus:ring-2 focus:ring-[#C17832]/20 mb-2"
                    />
                    <p className="text-xs text-[#A89279] mb-3">
                      Any wording change beyond whitespace flags the review for
                      client re-consent — the published words must remain the
                      client&apos;s own adopted statement.
                    </p>
                  </>
                ) : (
                  <blockquote className="text-[15px] text-[#1F1810] leading-relaxed border-l-2 border-[#C17832]/40 pl-4 mb-3 whitespace-pre-wrap">
                    {review.status === "approved" && review.published_text
                      ? review.published_text
                      : review.review_text}
                  </blockquote>
                )}

                {/* AI original, when it differs from the adopted text */}
                {review.ai_drafting_used &&
                  review.ai_draft_text &&
                  review.ai_draft_text !== review.review_text &&
                  !isEditing && (
                    <details className="mb-3">
                      <summary className="text-xs text-[#A89279] cursor-pointer hover:text-[#6B5B4E]">
                        View original AI draft (client edited before adopting)
                      </summary>
                      <p className="text-xs text-[#6B5B4E] leading-relaxed mt-2 pl-4 border-l border-[#1F1810]/10 whitespace-pre-wrap">
                        {review.ai_draft_text}
                      </p>
                    </details>
                  )}

                {/* Consent record */}
                <details className="mb-4">
                  <summary className="text-xs text-[#A89279] cursor-pointer hover:text-[#6B5B4E]">
                    Consent record
                  </summary>
                  <p className="text-xs text-[#6B5B4E] leading-relaxed mt-2 pl-4 border-l border-[#1F1810]/10">
                    &ldquo;{review.consent_text}&rdquo;
                    <br />
                    <span className="text-[#A89279]">
                      Agreed{" "}
                      {new Date(review.consent_agreed_at).toLocaleString("en-US")}
                    </span>
                  </p>
                </details>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {review.status === "pending" && !isPrivate && !isEditing && (
                    <>
                      <button
                        onClick={() => approve(review)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1F1810] text-white hover:bg-[#C17832] transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve &amp; publish
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(review.id);
                          setEditedText(review.review_text);
                        }}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-[#1F1810]/15 text-[#6B5B4E] hover:border-[#1F1810]/40 transition-colors disabled:opacity-50"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit, then approve
                      </button>
                    </>
                  )}

                  {isEditing && (
                    <>
                      <button
                        onClick={() => approveWithEdits(review)}
                        disabled={isSaving || editedText.trim().length < 5}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1F1810] text-white hover:bg-[#C17832] transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Save &amp; approve
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditedText("");
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-[#A89279] hover:text-[#1F1810] transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {review.status === "pending" && isPrivate && (
                    <p className="text-xs text-[#A89279] self-center mr-2">
                      Feedback only — the client declined publication.
                    </p>
                  )}

                  {review.status === "approved" && !isEditing && (
                    <button
                      onClick={() => backToPending(review)}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-[#1F1810]/15 text-[#6B5B4E] hover:border-[#1F1810]/40 transition-colors disabled:opacity-50"
                    >
                      <Undo2 className="w-4 h-4" />
                      Unpublish (back to pending)
                    </button>
                  )}

                  {review.status !== "archived" && !isEditing && (
                    <button
                      onClick={() => archive(review)}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#A89279] hover:text-[#1F1810] transition-colors disabled:opacity-50"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  )}

                  {review.status === "archived" && (
                    <button
                      onClick={() => backToPending(review)}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-[#1F1810]/15 text-[#6B5B4E] hover:border-[#1F1810]/40 transition-colors disabled:opacity-50"
                    >
                      <Undo2 className="w-4 h-4" />
                      Restore to pending
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
