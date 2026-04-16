"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Send, Sparkles, Mic, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useVoiceChat } from "@/hooks/useVoiceChat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AlloraFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Voice mode state -------------------------------------------------
  // Gate the mic button behind an authenticated session. Voice is a
  // members-only perk in v1 — keeps API cost contained and gives us a
  // natural metering story if we ever swap to a paid provider.
  const [isAuthed, setIsAuthed] = useState(false);
  // Voice is opt-in per-session. We remember whether the user pressed the
  // mic so we only auto-speak assistant replies for turns they initiated
  // by voice. Text conversations stay silent.
  const [voiceModeOn, setVoiceModeOn] = useState(false);
  // Tracks the assistant reply we've already spoken so we don't read the
  // same message twice on re-renders or when history is rehydrated.
  const lastSpokenIndexRef = useRef(-1);

  // --- Free-tier message cap ---------------------------------------------
  // Visitors get a taste of Allora (2 user turns) before we lock the input
  // behind a signup CTA. Members get unlimited access + voice.
  const FREE_MESSAGE_LIMIT = 2;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isLocked = !isAuthed && userMessageCount >= FREE_MESSAGE_LIMIT;

  // Different suggestion chips for visitors vs. members. Visitor prompts
  // funnel toward learning about the firm; member prompts start real work.
  const visitorSuggestions = [
    "How does Available Law work?",
    "What does a subscription cost?",
    "What is the FAIIR framework?",
    "Can AI help with my contract?",
  ];

  const memberSuggestions = [
    "Review my contract for red flags",
    "Help me draft an NDA",
    "Walk me through Colorado AI Act compliance",
    "What should my LLC operating agreement include?",
  ];

  const suggestions = isAuthed ? memberSuggestions : visitorSuggestions;

  // Auto-trigger typing bubble + greeting based on scroll
  useEffect(() => {
    if (hasTriggered || dismissed) return;

    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;

      // Trigger after user scrolls past ~15% of the page
      if (scrollPercentage > 15 && !hasTriggered) {
        setHasTriggered(true);
        setShowTyping(true);

        // After typing animation, show greeting
        setTimeout(() => {
          setShowTyping(false);
          setShowGreeting(true);
        }, 2200);

        // Auto-hide greeting after 12 seconds if not interacted with
        setTimeout(() => {
          setShowGreeting(false);
        }, 14000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasTriggered, dismissed]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Watch Supabase auth state so we can reveal the mic button only to
  // signed-in members. onAuthStateChange fires for every login/logout so
  // the gate stays in sync if the user signs out in another tab.
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthed(Boolean(data.session?.user));
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthed(Boolean(session?.user));
      },
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowGreeting(false);
    setShowTyping(false);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGreeting(false);
    setShowTyping(false);
    setDismissed(true);
  };

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? message).trim();
      if (!content) return;
      // Enforce free-tier cap — belt + suspenders with the hidden input.
      if (!isAuthed) {
        const currentUserCount = messages.filter((m) => m.role === "user").length;
        if (currentUserCount >= FREE_MESSAGE_LIMIT) return;
      }

      const userMsg: ChatMessage = { role: "user", content };
      setMessages((prev) => {
        const nextHistory = [...prev, userMsg];
        // Fire the backend call from inside the setter so we always use
        // the latest messages snapshot — critical for voice turns where
        // multiple sends can stack up faster than React commits state.
        (async () => {
          setMessage("");
          setIsTyping(true);
          try {
            const { data, error } = await supabase.functions.invoke(
              "allora-chat",
              {
                body: {
                  messages: nextHistory.map((m) => ({
                    role: m.role,
                    content: m.content,
                  })),
                },
              },
            );

            if (error) throw error;

            const reply =
              (data as { reply?: string } | null)?.reply ??
              "I'm having trouble reaching the assistant right now — please try again in a moment.";

            setMessages((cur) => [...cur, { role: "assistant", content: reply }]);
          } catch (err) {
            console.error("allora-chat error", err);
            setMessages((cur) => [
              ...cur,
              {
                role: "assistant",
                content:
                  "I'm having trouble connecting right now. You can also reach the team directly at zachariah@availablelaw.com — sorry about that.",
              },
            ]);
          } finally {
            setIsTyping(false);
          }
        })();
        return nextHistory;
      });
    },
    [message, isAuthed, messages],
  );

  // --- Voice hook wiring -----------------------------------------------
  // The hook hands us the final transcript when SpeechRecognition decides a
  // turn is done (silence or explicit stop). We pipe it straight into the
  // existing handleSend path so voice turns are indistinguishable from text
  // turns on the backend. No new endpoint, no new spend.
  const voice = useVoiceChat({
    onFinalTranscript: (finalText) => {
      handleSend(finalText);
    },
  });

  // When a new assistant message arrives AND the user's last turn was by
  // voice, speak the reply out loud. We track lastSpokenIndexRef so we
  // never read the same message twice across re-renders.
  useEffect(() => {
    if (!voiceModeOn) return;
    if (messages.length === 0) return;
    const lastIdx = messages.length - 1;
    const last = messages[lastIdx];
    if (last.role !== "assistant") return;
    if (lastSpokenIndexRef.current >= lastIdx) return;
    lastSpokenIndexRef.current = lastIdx;
    voice.speak(last.content);
  }, [messages, voiceModeOn, voice]);

  // Click handler for the mic button. Toggles between idle and listening.
  // Also toggles voiceModeOn so subsequent assistant replies get spoken —
  // flipping the mic off mid-session is effectively "I'm done talking".
  const handleMicToggle = useCallback(() => {
    if (voice.status === "listening") {
      voice.stop();
      return;
    }
    if (voice.status === "speaking") {
      // Interrupt Allora and immediately start listening.
      voice.cancelSpeak();
    }
    setVoiceModeOn(true);
    voice.start();
  }, [voice]);

  // Explicit "mute" button for when voice mode is on but the user wants to
  // silence the current TTS playback without disabling voice entirely.
  const handleMuteToggle = useCallback(() => {
    if (voice.status === "speaking") {
      voice.cancelSpeak();
    } else {
      setVoiceModeOn((on) => !on);
    }
  }, [voice]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button + Speech Bubbles */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Typing bubble */}
        {showTyping && !isOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border border-[#1F1810]/10 rounded-2xl rounded-br-sm shadow-lg px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[#C17832]/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#C17832]/40 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-[#C17832]/40 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}

        {/* Greeting message bubble */}
        {showGreeting && !isOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[280px]">
            <div className="relative bg-white border border-[#1F1810]/10 rounded-2xl rounded-br-sm shadow-lg px-4 py-3">
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 w-5 h-5 bg-[#1F1810] text-white rounded-full flex items-center justify-center hover:bg-[#C17832] transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="text-xs font-semibold text-[#C17832] mb-1">
                Allora · AI Legal Assistant
              </p>
              <p className="text-sm text-[#1F1810] leading-relaxed">
                Hi there! Let me know if I can help you with anything legal.
              </p>
              <button
                onClick={handleOpenChat}
                className="mt-3 text-xs font-medium text-[#C17832] hover:text-[#1F1810] transition-colors"
              >
                Start a conversation →
              </button>
            </div>
          </div>
        )}

        {/* The Circle Button */}
        {!isOpen && (
          <button
            onClick={handleOpenChat}
            className="group relative w-16 h-16 bg-white border-2 border-[#C17832] rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
            aria-label="Chat with Allora"
          >
            <Image
              src="/images/logo-arrow.png"
              alt="Allora"
              width={36}
              height={36}
              loading="lazy"
              className="object-contain"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(48%) sepia(53%) saturate(789%) hue-rotate(348deg) brightness(91%) contrast(91%)",
              }}
            />
            {/* Pulse ring on first appearance */}
            {hasTriggered && !showGreeting && !showTyping && (
              <span className="absolute inset-0 rounded-full border-2 border-[#C17832] animate-ping opacity-30" />
            )}
          </button>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-3rem)] bg-white border border-[#1F1810]/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F1810]/8 bg-[#FAF8F5]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-white border-2 border-[#C17832] rounded-full flex items-center justify-center">
                <Image
                  src="/images/logo-arrow.png"
                  alt="Allora"
                  width={22}
                  height={22}
                  loading="lazy"
                  className="object-contain"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(48%) sepia(53%) saturate(789%) hue-rotate(348deg) brightness(91%) contrast(91%)",
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#7A8B6F] border-2 border-white rounded-full" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1F1810]">Allora</p>
                <p className="text-[10px] text-[#6B5B4E]">
                  AI Legal Assistant · Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-[#1F1810]/5 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-[#6B5B4E]" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <>
                {/* Welcome */}
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-[#C17832]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#C17832]" />
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#1F1810]/8 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-[#1F1810] leading-relaxed">
                      {isAuthed
                        ? "Welcome back! I\u2019m Allora \u2014 your AI legal assistant. I can help you with contracts, compliance, formation, and more."
                        : "Hi! I\u2019m Allora \u2014 Available Law\u2019s AI legal assistant. Ask me a couple of questions to see how I can help your business."}
                    </p>
                    {!isAuthed && (
                      <p className="text-[11px] text-[#A89279] mt-2">
                        Members get unlimited access, voice mode, and
                        attorney-reviewed answers.
                      </p>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-2 pt-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="w-full text-left px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-xs text-[#6B5B4E] hover:border-[#C17832]/40 hover:bg-[#FAF8F5] hover:text-[#1F1810] transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 bg-[#C17832]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-[#C17832]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.role === "user"
                          ? "bg-[#1F1810] text-white rounded-tr-sm"
                          : "bg-[#FAF8F5] border border-[#1F1810]/8 text-[#1F1810] rounded-tl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-[#C17832]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-[#C17832]" />
                    </div>
                    <div className="bg-[#FAF8F5] border border-[#1F1810]/8 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#C17832]/50 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-[#C17832]/50 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <div className="w-1.5 h-1.5 bg-[#C17832]/50 rounded-full animate-bounce [animation-delay:0.3s]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Locked-state CTA — replaces the input for visitors who
                    have used their free turns. */}
                {isLocked && !isTyping && (
                  <div className="pt-3 space-y-2">
                    <div className="bg-[#FAF8F5] border border-[#C17832]/20 rounded-xl px-4 py-4 text-center">
                      <p className="text-sm font-semibold text-[#1F1810] mb-1">
                        Want to keep going?
                      </p>
                      <p className="text-xs text-[#6B5B4E] leading-relaxed mb-3">
                        Members get unlimited Allora access, voice mode, document
                        reviews, and attorney consultations.
                      </p>
                      <Link
                        href="/#pricing"
                        className="block w-full text-center px-4 py-2.5 bg-[#C17832] text-white rounded-lg text-sm font-medium hover:bg-[#1F1810] transition-colors"
                      >
                        See plans →
                      </Link>
                      <Link
                        href="/login"
                        className="block mt-2 text-xs text-[#6B5B4E] hover:text-[#C17832] transition-colors"
                      >
                        Already a member? Sign in
                      </Link>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input — hidden entirely when the visitor's free turns are used */}
          <div className={`border-t border-[#1F1810]/8 px-4 py-3 bg-white ${isLocked ? "hidden" : ""}`}>
            {/* Voice mode status pill — only shown when something voice-y
                is happening, so it doesn't add visual noise by default. */}
            {isAuthed && voice.supported && voice.status !== "idle" && (
              <div className="mb-2 flex items-center justify-center gap-2 px-3 py-1.5 bg-[#FAF8F5] border border-[#C17832]/30 rounded-full">
                {voice.status === "listening" && (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#C17832] opacity-60 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C17832]" />
                    </span>
                    <span className="text-[11px] font-medium text-[#C17832]">
                      Listening
                      {voice.transcript ? ` · "${voice.transcript}"` : "…"}
                    </span>
                  </>
                )}
                {voice.status === "speaking" && (
                  <>
                    <Volume2 className="w-3 h-3 text-[#7A8B6F]" />
                    <span className="text-[11px] font-medium text-[#7A8B6F]">
                      Allora is speaking
                    </span>
                    <button
                      onClick={voice.cancelSpeak}
                      className="ml-2 text-[10px] text-[#6B5B4E] hover:text-[#1F1810] underline"
                    >
                      stop
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Voice error surface — user-friendly, self-dismissing on next
                successful turn because `error` resets inside start(). */}
            {voice.error && (
              <div className="mb-2 px-3 py-1.5 bg-[#FFF4EA] border border-[#C17832]/30 rounded-lg text-[11px] text-[#6B5B4E] leading-snug">
                {voice.error}
              </div>
            )}

            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  voice.status === "listening"
                    ? "Listening…"
                    : "Ask Allora a legal question..."
                }
                disabled={voice.status === "listening"}
                className="flex-1 px-3 py-2.5 bg-[#FAF8F5] border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all disabled:opacity-60"
              />

              {/* Mic button — members-only, feature-gated by the hook.
                  Hidden entirely when the browser doesn't support Web
                  Speech OR the visitor isn't signed in. */}
              {isAuthed && voice.supported && (
                <button
                  onClick={handleMicToggle}
                  className={`w-10 h-10 rounded-lg transition-all flex items-center justify-center flex-shrink-0 border ${
                    voice.status === "listening"
                      ? "bg-[#C17832] text-white border-[#C17832] animate-pulse"
                      : "bg-white text-[#6B5B4E] border-[#1F1810]/15 hover:border-[#C17832]/60 hover:text-[#C17832]"
                  }`}
                  aria-label={
                    voice.status === "listening"
                      ? "Stop listening"
                      : "Start voice input"
                  }
                  aria-pressed={voice.status === "listening"}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}

              {/* TTS mute toggle — only shown once voice mode has been used
                  this session, so first-timers aren't confused by two
                  similar-looking buttons. */}
              {isAuthed && voice.supported && voiceModeOn && (
                <button
                  onClick={handleMuteToggle}
                  className="w-10 h-10 rounded-lg border border-[#1F1810]/15 bg-white text-[#6B5B4E] hover:text-[#C17832] hover:border-[#C17832]/60 transition-all flex items-center justify-center flex-shrink-0"
                  aria-label={
                    voice.status === "speaking"
                      ? "Stop Allora from speaking"
                      : "Mute voice replies"
                  }
                >
                  {voice.status === "speaking" ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              )}

              <button
                onClick={() => handleSend()}
                disabled={!message.trim() || voice.status === "listening"}
                className="w-10 h-10 bg-[#1F1810] text-white rounded-lg hover:bg-[#C17832] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-[#A89279] text-center mt-2">
              {isAuthed && voice.supported
                ? "Powered by AI · Tap the mic to talk to Allora"
                : "Powered by AI · Attorney-reviewed answers for members"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
