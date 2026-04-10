"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Send, Sparkles } from "lucide-react";

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

  const generateResponse = (userInput: string): string => {
    const text = userInput.toLowerCase();

    // Pricing / cost
    if (
      /\b(price|pricing|cost|how much|fee|fees|subscription|plan|tier|payment|monthly|annual)\b/.test(
        text
      )
    ) {
      return "Available Law uses a transparent subscription model with four tiers:\n\n• **Explore** — Free. Try Allora and access basic legal info.\n• **Build** — $25/mo. For early-stage founders. AI-assisted contract review, compliance Q&A, and document templates.\n• **Grow** — $100/mo. For growing companies. Priority attorney review, monthly consultation, fractional GC support.\n• **Lead** — $300/mo. For established businesses. Unlimited contracts, dedicated counsel, and strategic advisory.\n\nAnnual plans save 17%. Want me to help you pick the right tier for your business?";
    }

    // How it works / what is Available Law
    if (
      /\b(how does|how do you|how it works|what is|what's|tell me about|what does|explain|overview)\b/.test(
        text
      )
    ) {
      return "Available Law is the first FAIIR-certified AI-powered law firm in Colorado. Here's how it works:\n\n1. **Subscribe** to a tier that matches your needs (Explore is free)\n2. **Chat with me** anytime — I'm Allora, your AI legal assistant trained on Colorado business law\n3. **Attorney review** — every meaningful deliverable is reviewed by a licensed attorney before it reaches you\n4. **Get work done fast** — contracts, formation docs, compliance answers, and more\n\nWe combine AI speed with attorney judgment, and we're transparent about both. What kind of legal work are you facing right now?";
    }

    // Contracts / contract review
    if (
      /\b(contract|review|redline|nda|agreement|tos|terms|privacy policy|msa|sow)\b/.test(
        text
      )
    ) {
      return "Contract review is one of our most popular services. Here's what we can do:\n\n• **Draft** new contracts (NDAs, MSAs, SOWs, employment agreements, ToS, privacy policies, etc.)\n• **Review & redline** contracts you've received — flag risky terms, suggest improvements\n• **Negotiate** key terms with the other side\n• **Plain-English summaries** so you actually understand what you're signing\n\nI can give you a quick first pass and an attorney finalizes it. Want to share what kind of contract you're working on?";
    }

    // Business formation / LLC
    if (
      /\b(llc|incorporate|incorporation|formation|form a|form an|start a business|business entity|c-?corp|s-?corp|partnership|nonprofit)\b/.test(
        text
      )
    ) {
      return "Forming a business in Colorado is one of the most common things we help with. The basics:\n\n• **LLC** — most flexible, pass-through taxation, simple admin (popular for small businesses)\n• **C-Corp** — needed if you're raising venture capital or issuing equity\n• **S-Corp** — tax election, not an entity type; can save on self-employment tax\n\nWe handle the full filing with the Colorado Secretary of State, draft your operating agreement, and walk you through tax elections, EIN, and ongoing compliance.\n\nWhat are you trying to build? I can help you pick the right structure.";
    }

    // Compliance / regulation
    if (
      /\b(complian|regulat|gdpr|ccpa|cpa|hipaa|sox|data privacy|policy|policies|audit)\b/.test(
        text
      )
    ) {
      return "Compliance is where AI shines — we can audit your current posture against CO law, federal requirements, and industry standards quickly.\n\nCommon things we help with:\n• Colorado Privacy Act (CPA) compliance for businesses handling consumer data\n• Privacy policies and ToS aligned to CCPA, GDPR, and CPA\n• Data processing agreements with vendors\n• AI-specific risk assessments and disclosure language\n• Employment compliance (offer letters, handbooks, equity)\n\nWhat regulation or area is on your mind?";
    }

    // Allora / AI specific
    if (/\b(allora|ai|artificial intelligence|chatbot|bot|model|llm)\b/.test(text)) {
      return "I'm Allora — Available Law's AI legal assistant. I'm trained on Colorado business law and the firm's playbooks, so I can help you draft, review, research, and answer common questions fast.\n\nA few important things about how I work:\n\n• **I'm AI** — I move fast but I can make mistakes\n• **Attorneys review my work** — anything substantive gets a licensed attorney's eyes before it goes out\n• **You always know when I'm involved** — full AI transparency is part of FAIIR certification\n\nWhat would you like to chat about?";
    }

    // FAIIR / certification
    if (/\b(faiir|cert|certif|standard|trust|verified)\b/.test(text)) {
      return "FAIIR stands for Framework for AI Integration & Industry Responsibility. It's the certification standard for attorneys who responsibly use AI in legal practice.\n\nFAIIR-certified firms commit to:\n• Verified AI competence (we know how the tools actually work)\n• Mandatory human attorney review of AI output\n• Transparent disclosure when AI is used\n• Ongoing AI ethics education\n\nAvailable Law is proudly FAIIR Certified — you can scroll up to see the seal in the header. Want to learn more about a specific pillar?";
    }

    // Greetings
    if (/^\s*(hi|hey|hello|howdy|sup|yo|good (morning|afternoon|evening))/i.test(userInput.trim())) {
      return "Hey there! 👋 I'm Allora, the AI legal assistant for Available Law. I help Colorado businesses with contracts, formation, compliance, and a bunch of other legal stuff — all backed by attorney review.\n\nWhat brings you here today?";
    }

    // Lawyer / attorney / talk to a human
    if (
      /\b(lawyer|attorney|human|real person|talk to|speak (to|with)|consult|consultation|book|schedule|meet)\b/.test(
        text
      )
    ) {
      return "Absolutely — you can book time directly with one of our Colorado attorneys. Members on the Build tier and above get priority scheduling, and Grow/Lead members get monthly or unlimited consultations included.\n\nIf you sign up for a free Explore account, you can also book a 30-minute introductory call. Want me to walk you to the signup?";
    }

    // Thanks
    if (/\b(thank|thanks|thx|appreciate)\b/.test(text)) {
      return "You're very welcome! Is there anything else I can help you with — maybe pricing, contract review, or how the FAIIR certification works?";
    }

    // Default fallback — vary by message count so it doesn't feel canned
    const fallbacks = [
      "That's a good question. I can definitely help with that — but to give you a full answer (and to have it reviewed by a licensed attorney), you'll want to start a free Explore account. It only takes a minute. Want me to point you there?",
      "Happy to dig into that. Available Law handles a wide range of business legal work in Colorado, from contracts and formation to compliance and disputes. Could you tell me a bit more about your situation so I can point you to the right tier or service?",
      "I can help! Could you give me a little more context? For example: are you an early-stage founder, an established business, or somewhere in between? That'll help me tailor the answer.",
    ];
    return fallbacks[messages.filter((m) => m.role === "user").length % fallbacks.length];
  };

  const handleSend = (text?: string) => {
    const content = (text ?? message).trim();
    if (!content) return;

    const userMsg: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setIsTyping(true);

    // Variable delay for realism (cycles based on conversation length)
    const delay = 1000 + (messages.length % 4) * 200;
    setTimeout(() => {
      const alloraMsg: ChatMessage = {
        role: "assistant",
        content: generateResponse(content),
      };
      setMessages((prev) => [...prev, alloraMsg]);
      setIsTyping(false);
    }, delay);
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
