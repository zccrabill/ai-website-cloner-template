'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FaiirModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FaiirModal({ isOpen, onClose }: FaiirModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* Dark Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300 pointer-events-none ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
      >
        {/* Modal Content */}
        <div
          className="relative w-full max-w-2xl bg-gradient-to-br from-[#0f0f14] to-[#1a1a22] rounded-lg border border-white/8 shadow-2xl transform transition-transform duration-300 max-h-[90vh] overflow-y-auto"
          style={{
            transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-b from-[#0f0f14] to-transparent p-6 border-b border-white/8 flex items-center justify-between">
            <div className="flex-1" />
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-8">
            {/* Logo and Title Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-20 h-20 mb-6">
                <Image
                  src="/images/faiir-logo.png"
                  alt="FAIIR Certification"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>

              <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                FAIIR AI Certification
              </h2>
              <p className="text-gray-400 text-sm">
                Foundation for AI Integrity &amp; Regulation
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-base leading-relaxed mb-8 font-sans">
              The FAIIR certification program provides organizations with a structured,
              independent pathway to demonstrate that their AI policies, data handling
              practices, and attorney oversight frameworks meet the standards established
              by Colorado law and federal guidelines.
            </p>

            {/* Key Points Section */}
            <div className="mb-8 space-y-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                How It Works
              </h3>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20">
                    <span className="h-2 w-2 bg-amber-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Audit &amp; Assessment</h4>
                  <p className="text-gray-400 text-sm">
                    Comprehensive evaluation of your current AI tools, data handling practices, and policy gaps.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20">
                    <span className="h-2 w-2 bg-amber-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Guided Remediation</h4>
                  <p className="text-gray-400 text-sm">
                    Structured coaching and policy development to build your AI use framework and oversight structure.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20">
                    <span className="h-2 w-2 bg-amber-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Certification</h4>
                  <p className="text-gray-400 text-sm">
                    Earn the FAIIR AI Trained &amp; Certified seal — a demonstrable credential for clients, carriers, and regulators.
                  </p>
                </div>
              </div>
            </div>

            {/* Why Now Section */}
            <div className="bg-white/5 border border-amber-500/20 rounded-lg p-6 mb-8">
              <h3 className="text-white font-semibold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Why Now?
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Colorado's AI Act (CAIA) is in effect. Organizations that cannot demonstrate
                compliance face enforcement by the Colorado Attorney General. FAIIR certification
                is built around CAIA's compliance structure.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#pricing"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Schedule a FAIIR Consultation
              </Link>
              <a
                href="https://faiir.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border border-gray-400 text-gray-300 hover:text-white hover:border-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Learn More at FAIIR.org
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FaiirModal;
