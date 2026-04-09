"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Send, Bot, Sparkles } from "lucide-react";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  const suggestions = [
    "Review my contractor agreement for red flags",
    "Help me form an LLC in Colorado",
    "What do I need for GDPR compliance?",
    "Draft a cease and desist letter",
    "Explain my non-compete clause",
    "What insurance does my startup need?",
  ];

  return (
    <DashboardShell title="Chat with Allora">
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Empty State */}
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
                onClick={() => setMessage(suggestion)}
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

        {/* Input */}
        <div className="border-t border-[#1F1810]/8 pt-4">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Allora a legal question..."
              className="flex-1 px-4 py-3 bg-white border border-[#1F1810]/8 rounded-lg text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
            />
            <button
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
