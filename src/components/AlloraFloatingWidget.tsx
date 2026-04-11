"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Send, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

  const suggestions = [
    "How does Available Law work?",
    "Can you review my contract?",
    "What does a subscription cost?",
    "Help me form an LLC in Colorado",
  ];

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

  const handleSend = async (text?: string) => {
    const content = (text ?? message).trim();
    if (!content) return;

    const userMsg: ChatMessage = { role: "user", content };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setMessage("");
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke("allora-chat", {
        body: {
          messages: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const reply =
        (data as { reply?: string } | null)?.reply ??
        "I'm having trouble reaching the assistant right now — please try again in a moment.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("allora-chat error", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. You can also reach the team directly at zachariah@availablelaw.com — sorry about that.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

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
                      Hi! I&apos;m Allora — Available Law&apos;s AI legal
                      assistant. I help Colorado businesses with contracts,
                      compliance, formation, and more.
                    </p>
                    <p className="text-sm text-[#1F1810] leading-relaxed mt-2">
                      What can I help you with today?
                    </p>
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

                {/* CTA after first exchange */}
                {messages.length >= 2 && !isTyping && (
                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="block w-full text-center px-4 py-2.5 bg-[#C17832] text-white rounded-lg text-sm font-medium hover:bg-[#1F1810] transition-colors"
                    >
                      Sign up free to continue →
                    </Link>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#1F1810]/8 px-4 py-3 bg-white">
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Allora a legal question..."
                className="flex-1 px-3 py-2.5 bg-[#FAF8F5] border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!message.trim()}
                className="w-10 h-10 bg-[#1F1810] text-white rounded-lg hover:bg-[#C17832] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-[#A89279] text-center mt-2">
              Powered by AI · Attorney-reviewed answers for members
            </p>
          </div>
        </div>
      )}
    </>
  );
}
