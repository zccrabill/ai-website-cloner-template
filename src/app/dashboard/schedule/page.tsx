"use client";

import DashboardShell from "@/components/DashboardShell";
import { Calendar, Clock, Video, Phone } from "lucide-react";

export default function SchedulePage() {
  const consultationTypes = [
    {
      icon: Video,
      title: "Video Consultation",
      duration: "30 minutes",
      description:
        "Face-to-face with an attorney via secure video call. Best for complex matters.",
    },
    {
      icon: Phone,
      title: "Phone Consultation",
      duration: "15 minutes",
      description:
        "Quick attorney call for straightforward questions or follow-ups.",
    },
    {
      icon: Calendar,
      title: "Strategy Session",
      duration: "60 minutes",
      description:
        "Deep-dive legal strategy session. Available on Grow and Lead plans.",
    },
  ];

  return (
    <DashboardShell title="Schedule">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1F1810] mb-1">
          Schedule a Consultation
        </h2>
        <p className="text-sm text-[#6B5B4E]">
          Book time with one of our licensed Colorado attorneys
        </p>
      </div>

      {/* Consultation Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {consultationTypes.map((type, idx) => {
          const Icon = type.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-[#1F1810]/8 rounded-lg p-6 hover:border-[#C17832]/30 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 bg-[#C17832]/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-[#C17832]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F1810] mb-1">
                {type.title}
              </h3>
              <div className="flex items-center gap-1.5 mb-3">
                <Clock className="w-3.5 h-3.5 text-[#A89279]" />
                <span className="text-xs text-[#A89279]">{type.duration}</span>
              </div>
              <p className="text-sm text-[#6B5B4E] mb-4">{type.description}</p>
              <a
                href="https://calendly.com/availablelaw/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 px-4 border border-[#C17832] text-[#C17832] rounded-lg text-sm font-medium hover:bg-[#C17832] hover:text-white transition-all text-center"
              >
                Book Now
              </a>
            </div>
          );
        })}
      </div>

      {/* Upcoming */}
      <div>
        <h3 className="text-lg font-semibold text-[#1F1810] mb-4">
          Upcoming Consultations
        </h3>
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6">
          <div className="text-center py-8">
            <p className="text-[#6B5B4E] text-sm">
              No upcoming consultations
            </p>
            <p className="text-[#A89279] text-xs mt-1">
              Book a consultation above to get started
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
