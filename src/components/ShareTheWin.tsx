"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, Check, Loader2 } from "lucide-react";

// The built-in close-of-engagement marketing asks: (1) a testimonial, (2)
// permission to post it — named or anonymous, the client's choice, (3)
// permission to list the firm on the site as FAIIR-certified. Shown on the
// Certification page once a cert is issued, and on the Overview page when an
// engagement closes without a certification component — there the directory
// ask is hidden (certified={false}) because "FAIIR-certified" wouldn't be
// true. Entirely optional and revocable: re-saving with different choices
// overwrites the prior consent (latest choice governs). Writes go through
// save_marketing_preferences (member-only SECURITY DEFINER).

type Display = "undecided" | "named" | "anonymous" | "none";

interface ConsentRow {
  testimonial: string | null;
  testimonial_display: Display;
  directory_listing: boolean | null;
}

export default function ShareTheWin({
  engagementId,
  firmName,
  certified = true,
}: {
  engagementId: string;
  firmName: string;
  certified?: boolean;
}) {
  const [testimonial, setTestimonial] = useState("");
  const [display, setDisplay] = useState<Display>("undecided");
  const [directory, setDirectory] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("engagement_marketing_consents")
      .select("testimonial, testimonial_display, directory_listing")
      .eq("engagement_id", engagementId)
      .maybeSingle();
    const row = data as ConsentRow | null;
    if (row) {
      setTestimonial(row.testimonial ?? "");
      setDisplay(row.testimonial_display ?? "undecided");
      setDirectory(row.directory_listing === true);
    }
    setLoaded(true);
  }, [engagementId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const wantsToShare = display === "named" || display === "anonymous";
  const canSave =
    loaded && !saving && (!wantsToShare || testimonial.trim().length >= 10);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("save_marketing_preferences", {
      p_engagement_id: engagementId,
      p_testimonial: testimonial.trim() || null,
      p_display: display,
      p_directory_listing: directory,
      p_granted_by_name: null,
    });
    if (rpcError) {
      setError("We couldn't save your preferences just now — please try again.");
    } else {
      setSavedAt(Date.now());
    }
    setSaving(false);
  };

  const displayOptions: { value: Display; label: string; detail: string }[] = [
    {
      value: "named",
      label: `Share it with ${firmName}'s name`,
      detail: "Your words, credited to your firm.",
    },
    {
      value: "anonymous",
      label: "Share it anonymously",
      detail: 'Posted as, e.g., "a Colorado law firm" — nothing that identifies you.',
    },
    {
      value: "none",
      label: "Keep it private",
      detail: "For our eyes only — still genuinely appreciated.",
    },
  ];

  return (
    <div className="bg-white border border-[#C17832]/25 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5">
      <p className="text-sm font-semibold text-[#1F1810] mb-1 flex items-center gap-2">
        <Heart className="w-4 h-4 text-[#C17832]" />
        Share the win <span className="text-xs font-normal text-[#A89279]">(optional)</span>
      </p>
      <p className="text-xs text-[#6B5B4E] mb-4">
        If this engagement earned it, a few words help other firms find their way here. Entirely
        your call, changeable any time — nothing is published without the permission you give
        below.
      </p>

      <label className="block text-[11px] font-medium text-[#6B5B4E] mb-1">
        A sentence or two about working with us
      </label>
      <textarea
        value={testimonial}
        onChange={(e) => setTestimonial(e.target.value)}
        rows={3}
        placeholder="What was the experience like? What would you tell another managing partner?"
        className="w-full px-3 py-2.5 border border-[#1F1810]/15 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832] focus:ring-1 focus:ring-[#C17832]/30 mb-4"
      />

      <p className="text-[11px] font-medium text-[#6B5B4E] mb-2">How may we use it?</p>
      <div className="space-y-2 mb-4">
        {displayOptions.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              display === opt.value
                ? "border-[#C17832]/50 bg-[#C17832]/5"
                : "border-[#1F1810]/10 hover:border-[#C17832]/30"
            }`}
          >
            <input
              type="radio"
              name="testimonial-display"
              checked={display === opt.value}
              onChange={() => setDisplay(opt.value)}
              className="mt-0.5 accent-[#C17832]"
            />
            <span>
              <span className="block text-[13px] font-medium text-[#1F1810]">{opt.label}</span>
              <span className="block text-[11px] text-[#6B5B4E]">{opt.detail}</span>
            </span>
          </label>
        ))}
      </div>

      {certified && (
        <label className="flex items-start gap-3 p-3 rounded-lg border border-[#1F1810]/10 hover:border-[#C17832]/30 cursor-pointer transition-colors mb-4">
          <input
            type="checkbox"
            checked={directory}
            onChange={(e) => setDirectory(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#C17832] shrink-0"
          />
          <span className="text-[13px] text-[#4a4036] leading-relaxed">
            You may list <span className="font-semibold text-[#1F1810]">{firmName}</span> by name on
            availablelaw.com as a FAIIR-certified firm.
          </span>
        </label>
      )}

      {wantsToShare && testimonial.trim().length < 10 && (
        <p className="text-[11px] text-amber-700 mb-3">
          Add a short testimonial above to share it.
        </p>
      )}
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1810] text-white rounded-lg text-xs font-semibold hover:bg-[#C17832] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {saving ? "Saving…" : "Save my preferences"}
        </button>
        {savedAt && !saving && (
          <span className="text-[11px] text-[#7A8B6F] flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Saved — thank you.
          </span>
        )}
      </div>
    </div>
  );
}
