"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DashboardShell from "@/components/DashboardShell";
import { Send, Bot, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface PendingQuestion {
  text: string;
  options: string[];
  allow_custom: boolean;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [readyForReview, setReadyForReview] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<PendingQuestion | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Review my contractor agreement for red flags",
    "Help me form an LLC in Colorado",
    "What do I need for GDPR compliance?",
    "Draft a cease and desist letter",
    "Explain my non-compete clause",
    "What insurance does my startup need?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Reset in-memory chat state on any auth change so a signed-out user's
  // conversation can never bleed into a subsequent sign-in on the same tab.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      setMessages([]);
      setConversationId(null);
      setReadyForReview(false);
      setPendingQuestion(null);
      setMessage("");
      setIsTyping(false);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Lazily create a conversation row on first send so messages stay grouped.
  // Callers pass the id they currently consider active (not read from state,
  // which may be stale after an Option-B reset within the same event loop).
  const ensureConversation = async (
    firstMessage: string,
    existingId: string | null,
  ): Promise<string | null> => {
    if (existingId) return existingId;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return null;

      const { data: convo, error } = await supabase
        .from("conversations")
        .insert({
          user_id: uid,
          title: firstMessage.slice(0, 80),
        })
        .select("id")
        .single();

      if (error || !convo) return null;
      setConversationId(convo.id);
      return convo.id;
    } catch {
      return null;
    }
  };

  const handleSend = async (
    overrideText?: string,
    opts?: { forceReady?: boolean },
  ) => {
    const raw = (overrideText ?? message).trim();
    if (!raw) return;

    // Option B: once a matter has been sent to the attorney, the next message
    // from the user starts a brand-new intake thread rather than appending
    // onto a closed matter.
    let baseHistory: ChatMessage[] = messages;
    let activeConvId: string | null = conversationId;
    if (readyForReview) {
      baseHistory = [];
      activeConvId = null;
      setMessages([]);
      setConversationId(null);
    }

    const sentText = raw;
    const userMsg: ChatMessage = {
      role: "user",
      content: sentText,
      timestamp: new Date(),
    };

    const nextHistory = [...baseHistory, userMsg];
    setMessages(nextHistory);
    setMessage("");
    setIsTyping(true);
    setReadyForReview(false);
    setPendingQuestion(null);

    // If we just reset the thread we need a fresh conversation row; otherwise
    // reuse the one we already have.
    const convId = await ensureConversation(sentText, activeConvId);

    // Persist user message (best-effort)
    if (convId) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id;
        if (uid) {
          await supabase.from("messages").insert({
            conversation_id: convId,
            user_id: uid,
            role: "user",
            content: sentText,
          });
        }
      } catch {
        /* swallow — chat still works without history persistence */
      }
    }

    try {
      const { data, error } = await supabase.functions.invoke("allora-chat", {
        body: {
          conversation_id: convId,
          force_ready: opts?.forceReady ?? false,
          messages: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const result = (data ?? {}) as {
        reply?: string;
        ready_for_review?: boolean;
        pending_question?: PendingQuestion | null;
      };
      const reply =
        result.reply ??
        "I'm having trouble responding right now — please try again in a moment.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: new Date() },
      ]);

      if (result.ready_for_review) setReadyForReview(true);
      if (
        result.pending_question &&
        typeof result.pending_question.text === "string" &&
        Array.isArray(result.pending_question.options) &&
        result.pending_question.options.length > 0
      ) {
        setPendingQuestion(result.pending_question);
      } else {
        setPendingQuestion(null);
      }

      // Persist assistant message
      if (convId) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const uid = userData?.user?.id;
          if (uid) {
            await supabase.from("messages").insert({
              conversation_id: convId,
              user_id: uid,
              role: "assistant",
              content: reply,
            });
          }
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      console.error("allora-chat error", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting to the AI service. Please refresh and try again — if it keeps happening, email zachariah@availablelaw.com.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // Clicking a quick-reply chip sends that option immediately, without
  // requiring the user to type it into the input first.
  const handleChipClick = (option: string) => {
    setPendingQuestion(null);
    void handleSend(option);
  };

  // Manual escape hatch when the client is ready to hand the matter off
  // and Allora hasn't proactively summarized. Sends a one-liner AND sets
  // force_ready so the server nudges Allora to emit handoff tokens.
  const handleSendToAttorney = () => {
    void handleSend(
      "I'm ready — please finalize the intake and send this matter to the attorney for review now.",
      { forceReady: true },
    );
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
                  {msg.role === "assistant" ? (
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-[#1F1810]">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 mb-2 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 mb-2 space-y-1">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => <li>{children}</li>,
                          h1: ({ children }) => (
                            <h1 className="text-base font-semibold mt-2 mb-1">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-sm font-semibold mt-2 mb-1">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-semibold mt-2 mb-1">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-sm font-semibold mt-2 mb-1">
                              {children}
                            </h4>
                          ),
                          a: ({ children, href }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#C17832] underline"
                            >
                              {children}
                            </a>
                          ),
                          code: ({ children }) => (
                            <code className="bg-[#F5F0EB] px-1 py-0.5 rounded text-[0.85em]">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-[#F5F0EB] p-2 rounded text-[0.85em] overflow-x-auto mb-2">
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-[#D9CCBC] pl-3 italic my-2">
                              {children}
                            </blockquote>
                          ),
                          hr: () => (
                            <hr className="border-[#D9CCBC] my-2" />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  )}
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

            {/* Quick-reply chips — Allora asked a structured multiple-choice
                question. Clicking a chip sends that option immediately; the
                free-text input below still works for custom answers. */}
            {pendingQuestion && !isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 flex-shrink-0" />
                <div className="flex flex-wrap gap-2 max-w-[70%]">
                  {pendingQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(option)}
                      className="px-3 py-1.5 text-xs font-medium text-[#C17832] bg-white border border-[#C17832]/30 rounded-full hover:bg-[#C17832] hover:text-white hover:border-[#C17832] transition-all"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 24hr notice — shown when Allora signals a deliverable is
                queued for review. Sending another message starts a brand-new
                matter thread (Option B completion flow). */}
            {readyForReview && !isTyping && (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="flex items-center gap-2 bg-[#7A8B6F]/10 border border-[#7A8B6F]/20 rounded-full px-4 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7A8B6F]" />
                  <span className="text-xs text-[#7A8B6F] font-medium">
                    Sent to attorney for review · final answer within 24 hours
                  </span>
                  <Clock className="w-3.5 h-3.5 text-[#7A8B6F]" />
                </div>
                <p className="text-[11px] text-[#A89279]">
                  Need something else? Just type below to start a new matter.
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#1F1810]/8 pt-4">
          {/* Manual handoff escape hatch — shown once the conversation has
              a few substantive turns, in case Allora hasn't proactively
              wrapped up the intake. Hidden after a matter is sent. */}
          {messages.length >= 4 && !readyForReview && !isTyping && (
            <div className="flex justify-center mb-3">
              <button
                onClick={handleSendToAttorney}
                className="text-xs font-medium text-[#C17832] hover:text-[#1F1810] border border-[#C17832]/30 hover:border-[#1F1810] hover:bg-[#1F1810]/5 rounded-full px-4 py-1.5 transition-all"
              >
                Send this matter to the attorney for review →
              </button>
            </div>
          )}
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
              onClick={() => void handleSend()}
              disabled={!message.trim()}
              className="px-4 py-3 bg-[#1F1810] text-white rounded-lg hover:bg-[#C17832] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[#A89279] text-center mt-3">
            Allora gathers your details and hands the matter off to an
            attorney — you&apos;ll get a final answer within 24 hours.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
