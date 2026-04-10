"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Send, Bot, Sparkles, Clock, CheckCircle2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    "Review my contractor agreement for red flags",
    "Help me form an LLC in Colorado",
    "What do I need for GDPR compliance?",
    "Draft a cease and desist letter",
    "Explain my non-compete clause",
    "What insurance does my startup need?",
  ];

  const generateResponse = (userInput: string): string => {
    const text = userInput.toLowerCase();

    if (/\b(contract|review|redline|nda|agreement|tos|terms|privacy policy|msa|sow|contractor)\b/.test(text)) {
      return `Got it — let's review your contract. To do this thoroughly, I'll need a few things:\n\n1. **Upload the document** — head to Documents in the sidebar and drop the file in. PDF, DOCX, or pasted text all work.\n2. **Tell me the context** — who's the counterparty, what's the deal, and what's your role?\n3. **Highlight any specific concerns** — are there clauses that worry you, or do you want a full top-to-bottom review?\n\nOnce I have those, I'll do a fast first-pass review flagging risk areas, ambiguous language, and missing protections. An attorney will then review my work and finalize the redlines within 24 hours.`;
    }

    if (/\b(llc|incorporate|formation|form a|form an|business entity|c-?corp|s-?corp)\b/.test(text)) {
      return `Forming a Colorado business — happy to help. A few questions to get us started:\n\n1. **What are you building?** A service business, a product company, raising venture capital, or something else?\n2. **Who's involved?** Solo founder or co-founders? Any planned employees soon?\n3. **Any tax considerations?** Do you want pass-through taxation, or are you optimizing for an investor-ready structure?\n\nIn most cases, an LLC is the best fit for early-stage Colorado businesses. If you're raising venture money, we'd lean toward a Delaware C-Corp. I can have an attorney prepare your filing, operating agreement, and EIN within 48 hours of getting your answers.`;
    }

    if (/\b(complian|gdpr|ccpa|cpa|hipaa|privacy|data)\b/.test(text)) {
      return `Compliance work is one of my favorite areas. To scope this out:\n\n1. **What regulation(s)** are you concerned with? Colorado Privacy Act, GDPR, CCPA, HIPAA, something else?\n2. **What does your business do** with personal or sensitive data — collection, storage, processing, sharing?\n3. **Where are your customers?** Colorado only, U.S., international?\n\nDepending on your answers, I can produce a compliance gap analysis, draft policy updates, and recommend next steps. An attorney will validate everything before delivery.`;
    }

    if (/\b(non.?compete|severance|termination|employment|employee|fired|laid off)\b/.test(text)) {
      return `Employment matters — important to handle carefully. A few things I need to know:\n\n1. **Are you the employer or the employee?**\n2. **What's the situation?** New offer, separation, dispute, or policy review?\n3. **Colorado-based?** Colorado has specific non-compete restrictions that may apply.\n\nNote: Colorado significantly limits non-compete enforceability for most employees. If you're the employee and were asked to sign one, it may not be enforceable. Send me the document and the context and I'll have an attorney review it within 24 hours.`;
    }

    if (/\b(cease.?and.?desist|trademark|copyright|infringement|ip|intellectual)\b/.test(text)) {
      return `IP and cease-and-desist matters move fast — let's get you what you need.\n\n1. **What happened?** Who's doing what to whom?\n2. **What do you want as the outcome?** Stop the activity, monetary damages, both?\n3. **Do you have evidence?** Screenshots, dates, communications?\n\nI can draft a cease-and-desist letter or an IP licensing agreement quickly. An attorney will review and finalize before it goes out under their signature, which gives the letter real weight.`;
    }

    if (/\b(insurance|liability|risk)\b/.test(text)) {
      return `Smart to think about insurance early. For most Colorado startups, the baseline coverage is:\n\n• **General liability** — covers third-party bodily injury and property damage\n• **Professional liability (E&O)** — covers mistakes in your professional services\n• **Cyber liability** — covers data breaches and cyber incidents\n• **Workers' comp** — required if you have W-2 employees in Colorado\n• **Directors & officers (D&O)** — important if you have a board or are raising capital\n\nI can help you understand what's required vs. recommended for your specific business. What's your industry and headcount?`;
    }

    if (/^\s*(hi|hey|hello|howdy|sup|yo|good (morning|afternoon|evening))/i.test(userInput.trim())) {
      return `Hey! Great to see you in the dashboard. I'm Allora, your AI legal assistant. I can help with contracts, formation, compliance, employment, IP, and more — all attorney-reviewed.\n\nWhat are you working on today?`;
    }

    if (/\b(thank|thanks|thx)\b/.test(text)) {
      return `Anytime! Let me know if you need anything else. I'm here 24/7 and an attorney is always one step behind me reviewing the substantive stuff.`;
    }

    return `Thanks for reaching out — I'd be happy to help with that.\n\nTo give you the most accurate guidance, I have a few questions:\n\n1. Could you tell me a bit more about your specific situation?\n2. Is this for a Colorado-based business?\n3. Is there a timeline or deadline I should be aware of?\n\nOnce I have those details, I'll draft a thorough response and have one of our attorneys review it. You can expect the attorney-reviewed answer within 24 hours.`;
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const sentText = message.trim();
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const alloraMsg: ChatMessage = {
        role: "assistant",
        content: generateResponse(sentText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, alloraMsg]);
      setIsTyping(false);
    }, 1200 + (messages.length % 4) * 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardShell title="Chat with Allora">
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#C17832]/10 rounded-2xl flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-[#C17832]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1F1810] mb-2">
              Chat with Allora
            </h2>
            <p className="text-[#6B5B4E] text-center max-w-md mb-8">
              Your AI legal assistant. Ask a legal question, request a document,
              or get guidance — Allora will gather what she needs and deliver an
              attorney-reviewed response within 24 hours.
            </p>

            {/* Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full mb-8">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMessage(suggestion);
                  }}
                  className="flex items-start gap-3 p-3 bg-white border border-[#1F1810]/8 rounded-lg text-left hover:border-[#C17832]/30 hover:bg-[#F5F0EB] transition-all group"
                >
                  <Sparkles className="w-4 h-4 text-[#C17832] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#6B5B4E] group-hover:text-[#1F1810]">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 overflow-y-auto space-y-6 pb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-[#C17832]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-[#C17832]" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-[#1F1810] text-white"
                      : "bg-white border border-[#1F1810]/8 text-[#1F1810]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-2 ${
                      msg.role === "user"
                        ? "text-white/50"
                        : "text-[#A89279]"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#C17832]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-[#C17832]" />
                </div>
                <div className="bg-white border border-[#1F1810]/8 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-[#C17832]/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#C17832]/40 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <div className="w-2 h-2 bg-[#C17832]/40 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}

            {/* 24hr notice after first exchange */}
            {messages.length >= 2 && !isTyping && (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="flex items-center gap-2 bg-[#7A8B6F]/10 border border-[#7A8B6F]/20 rounded-full px-4 py-2">
                  <Clock className="w-3.5 h-3.5 text-[#7A8B6F]" />
                  <span className="text-xs text-[#7A8B6F] font-medium">
                    Attorney-reviewed response within 24 hours
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7A8B6F]" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#1F1810]/8 pt-4">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Allora a legal question..."
              className="flex-1 px-4 py-3 bg-white border border-[#1F1810]/8 rounded-lg text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="px-4 py-3 bg-[#1F1810] text-white rounded-lg hover:bg-[#C17832] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[#A89279] text-center mt-3">
            Allora gathers your details, drafts a response, and an attorney
            reviews it before delivery.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
