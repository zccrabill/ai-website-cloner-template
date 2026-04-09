'use client';

import React, { useState } from 'react';

export default function ConciergeButton() {
  const [isOpen, setIsOpen] = useState(false);

  const ChatIcon = () => (
    <svg
      className="w-6 h-6"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
      <path d="M3 7l3.293 3.293a1 1 0 001.414 0L10 8m0 0l3.293 3.293a1 1 0 001.414-0l3-3" />
    </svg>
  );

  const CloseIcon = () => (
    <svg
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  const SendIcon = () => (
    <svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-2.976 5.951 2.976a1 1 0 001.169-1.409l-7-14z" />
    </svg>
  );

  return (
    <>
      {/* Main floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#f59e0b] text-[#0f0f14] flex items-center justify-center shadow-lg hover:bg-[#fbbf24] transition-all hover:shadow-xl"
        title="Chat with our AI concierge"
      >
        <ChatIcon />
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50">
          <div
            className="w-[380px] h-[500px] bg-[#17171e] border border-white/10 rounded-lg shadow-2xl flex flex-col animate-in fade-in scale-95 duration-200"
            style={{
              animation: 'scaleIn 0.2s ease-out',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <h3 className="font-heading text-[16px] font-500 text-[#f0f0f5]">
                Av<span style={{ color: '#f59e0b' }}>{'{ai}'}</span>lable Law Concierge
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/5 rounded transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 px-4 py-4 overflow-y-auto">
              <div className="flex flex-col gap-3">
                <div className="bg-[#1f1f28] rounded-lg px-3 py-3 max-w-[280px]">
                  <p className="text-[14px] text-[#f0f0f5] leading-relaxed">
                    Hi! I'm the Available Law concierge. How can I help you today?
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-3 border-t border-white/10 bg-[#0f0f14]/50">
              <p className="text-[11px] text-[#71717a] leading-relaxed">
                <strong className="text-[#9898a8]">Disclaimer:</strong> This is an AI assistant providing general information, not legal advice.
              </p>
            </div>

            {/* Input area */}
            <div className="px-4 py-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-[#1f1f28] border border-white/10 rounded px-3 py-2 text-[14px] text-[#f0f0f5] placeholder-[#71717a] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/30 transition-colors"
              />
              <button className="bg-[#f59e0b] text-[#0f0f14] rounded px-3 py-2 hover:bg-[#fbbf24] transition-colors flex items-center justify-center">
                <SendIcon />
              </button>
            </div>

            {/* Note */}
            <div className="px-4 py-2 text-[10px] text-[#52525b] text-center">
              Connected to Claude agent agent_011CZsBXUSFAGVMkMqc2Y9o6
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
