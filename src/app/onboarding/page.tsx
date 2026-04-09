"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  User,
  Building2,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

type Step = "profile" | "terms" | "engagement" | "complete";

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Your Profile", icon: User },
  { key: "terms", label: "Terms of Service", icon: FileText },
  { key: "engagement", label: "Engagement Agreement", icon: Building2 },
  { key: "complete", label: "All Set", icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [industry, setIndustry] = useState("");
  const [state, setState] = useState("Colorado");
  const [referralSource, setReferralSource] = useState("");

  // Agreements
  const [tosAgreed, setTosAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [engagementAgreed, setEngagementAgreed] = useState(false);
  const [engagementSignature, setEngagementSignature] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setEmail(session.user.email || "");
      setUserId(session.user.id);
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case "profile":
        return fullName.trim() && businessName.trim() && businessType;
      case "terms":
        return tosAgreed && privacyAgreed;
      case "engagement":
        return engagementAgreed && engagementSignature.trim();
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep === "engagement") {
      // Save everything to Supabase
      try {
        const { error } = await supabase.from("members").upsert({
          user_id: userId,
          email,
          full_name: fullName,
          business_name: businessName,
          business_type: businessType,
          industry: industry || null,
          state,
          referral_source: referralSource || null,
          tos_agreed_at: new Date().toISOString(),
          privacy_agreed_at: new Date().toISOString(),
          engagement_agreed_at: new Date().toISOString(),
          engagement_signature: engagementSignature,
          onboarding_complete: true,
        }, { onConflict: "user_id" });

        if (error) {
          console.error("Save error:", error);
          // Still proceed — data can be re-collected
        }
      } catch (err) {
        console.error("Onboarding save error:", err);
      }
      setCurrentStep("complete");
    } else {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) {
        setCurrentStep(STEPS[nextIndex].key);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1F1810]/8 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-arrow.png"
              alt="Available Law"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-sm font-semibold text-[#1F1810]">
              Member Setup
            </span>
          </div>
          <span className="text-xs text-[#A89279]">{email}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-6 py-6 w-full">
        <div className="flex items-center gap-2">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isComplete = idx < currentStepIndex;
            return (
              <div key={step.key} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isComplete
                      ? "bg-[#7A8B6F] text-white"
                      : isActive
                        ? "bg-[#C17832] text-white"
                        : "bg-[#EDE5DB] text-[#A89279]"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive ? "text-[#1F1810]" : "text-[#A89279]"
                  }`}
                >
                  {step.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px ${
                      isComplete ? "bg-[#7A8B6F]" : "bg-[#EDE5DB]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto px-6 pb-8 w-full">
        <div className="bg-white border border-[#1F1810]/8 rounded-2xl p-8">
          {/* Step 1: Profile */}
          {currentStep === "profile" && (
            <div>
              <h2 className="text-2xl font-bold text-[#1F1810] mb-2">
                Welcome to Available Law
              </h2>
              <p className="text-sm text-[#6B5B4E] mb-8">
                Tell us about yourself and your business so we can tailor our
                legal services to your needs.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full legal name"
                    className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business or company name"
                    className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                    Business Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                  >
                    <option value="">Select business type</option>
                    <option value="llc">LLC</option>
                    <option value="corporation">Corporation</option>
                    <option value="sole_proprietorship">
                      Sole Proprietorship
                    </option>
                    <option value="partnership">Partnership</option>
                    <option value="nonprofit">Nonprofit</option>
                    <option value="pre_formation">
                      Not yet formed / Pre-formation
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Technology, Healthcare"
                      className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                    How did you hear about us?
                  </label>
                  <select
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                  >
                    <option value="">Select one</option>
                    <option value="google">Google Search</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social Media</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Terms of Service */}
          {currentStep === "terms" && (
            <div>
              <h2 className="text-2xl font-bold text-[#1F1810] mb-2">
                Terms of Service &amp; Privacy Policy
              </h2>
              <p className="text-sm text-[#6B5B4E] mb-6">
                Please review and agree to our terms to continue.
              </p>

              {/* Terms of Service */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#1F1810] mb-3">
                  Terms of Service
                </h3>
                <div className="bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg p-4 h-48 overflow-y-auto text-xs text-[#6B5B4E] leading-relaxed space-y-3">
                  <p className="font-semibold text-[#1F1810]">
                    AVAILABLE LAW, LLC — TERMS OF SERVICE
                  </p>
                  <p>
                    Effective Date: April 9, 2026
                  </p>
                  <p>
                    These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the services provided by Available Law, LLC (&ldquo;Available Law,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a Colorado limited liability company, through our website at availablelaw.com and related platforms (collectively, the &ldquo;Platform&rdquo;).
                  </p>
                  <p className="font-semibold text-[#1F1810]">1. NATURE OF SERVICES</p>
                  <p>
                    Available Law provides AI-assisted legal services through our proprietary assistant, Allora, combined with oversight and review by licensed Colorado attorneys. All legal advice, document drafting, and legal opinions delivered through the Platform are reviewed by a licensed attorney before delivery to you.
                  </p>
                  <p className="font-semibold text-[#1F1810]">2. MEMBERSHIP TIERS</p>
                  <p>
                    Our services are offered through subscription membership tiers (Explore, Build, Grow, and Lead), each with defined scope, pricing, and service levels. Your selected tier determines the services available to you. Tier details and pricing are described on our pricing page and may be updated from time to time with reasonable notice.
                  </p>
                  <p className="font-semibold text-[#1F1810]">3. AI-ASSISTED SERVICES DISCLOSURE</p>
                  <p>
                    You acknowledge that our Platform utilizes artificial intelligence technology to assist in legal research, document drafting, and preliminary analysis. All AI-generated work product is reviewed by a licensed attorney before delivery. The use of AI technology does not diminish our professional obligations or the quality of legal services provided. You consent to the use of AI tools in the provision of your legal services.
                  </p>
                  <p className="font-semibold text-[#1F1810]">4. NOT A SUBSTITUTE FOR INDEPENDENT LEGAL COUNSEL</p>
                  <p>
                    While Available Law provides legal services through licensed attorneys, our subscription-based model may not be appropriate for all legal matters. Complex litigation, regulatory proceedings, or matters requiring court appearances may require engagement beyond the scope of your membership tier. We will advise you when a matter exceeds your tier&apos;s scope.
                  </p>
                  <p className="font-semibold text-[#1F1810]">5. BILLING &amp; CANCELLATION</p>
                  <p>
                    Subscription fees are billed in advance on a monthly or annual basis through Stripe. You may cancel at any time; cancellation takes effect at the end of the current billing period. No refunds are provided for partial billing periods. We reserve the right to modify pricing with 30 days&apos; notice.
                  </p>
                  <p className="font-semibold text-[#1F1810]">6. CONFIDENTIALITY</p>
                  <p>
                    All information you share through the Platform is treated as confidential and is protected by attorney-client privilege to the extent applicable under Colorado law. We implement industry-standard security measures to protect your data. Our use of AI tools does not waive any applicable privilege protections.
                  </p>
                  <p className="font-semibold text-[#1F1810]">7. LIMITATION OF LIABILITY</p>
                  <p>
                    To the maximum extent permitted by law, Available Law&apos;s total liability for any claim arising from these Terms or our services shall not exceed the total fees paid by you in the twelve (12) months preceding the claim. This limitation does not apply to liability arising from gross negligence or willful misconduct.
                  </p>
                  <p className="font-semibold text-[#1F1810]">8. DISPUTE RESOLUTION</p>
                  <p>
                    Any disputes arising under these Terms shall be resolved through binding arbitration in Denver, Colorado, under the rules of the American Arbitration Association, except that either party may seek injunctive relief in the courts of Colorado.
                  </p>
                  <p className="font-semibold text-[#1F1810]">9. GOVERNING LAW</p>
                  <p>
                    These Terms are governed by the laws of the State of Colorado. You consent to the exclusive jurisdiction of the courts of Colorado for any matters not subject to arbitration.
                  </p>
                  <p className="font-semibold text-[#1F1810]">10. MODIFICATIONS</p>
                  <p>
                    We may modify these Terms at any time by providing notice through the Platform or via email. Continued use of the Platform after such notice constitutes acceptance of the modified Terms.
                  </p>
                </div>
                <label className="flex items-start gap-3 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tosAgreed}
                    onChange={(e) => setTosAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#1F1810]/20 text-[#C17832] focus:ring-[#C17832]/20"
                  />
                  <span className="text-sm text-[#1F1810]">
                    I have read and agree to the Terms of Service
                  </span>
                </label>
              </div>

              {/* Privacy Policy */}
              <div>
                <h3 className="text-sm font-semibold text-[#1F1810] mb-3">
                  Privacy Policy
                </h3>
                <div className="bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg p-4 h-48 overflow-y-auto text-xs text-[#6B5B4E] leading-relaxed space-y-3">
                  <p className="font-semibold text-[#1F1810]">
                    AVAILABLE LAW, LLC — PRIVACY POLICY
                  </p>
                  <p>Effective Date: April 9, 2026</p>
                  <p className="font-semibold text-[#1F1810]">INFORMATION WE COLLECT</p>
                  <p>
                    We collect information you provide directly: name, email, business information, and legal matter details shared through our Platform. We also collect usage data including pages visited, features used, and interaction patterns to improve our services.
                  </p>
                  <p className="font-semibold text-[#1F1810]">HOW WE USE YOUR INFORMATION</p>
                  <p>
                    Your information is used to: provide legal services, process payments through Stripe, communicate about your account and services, improve our AI-assisted tools, and comply with legal obligations. We do not sell your personal information.
                  </p>
                  <p className="font-semibold text-[#1F1810]">AI PROCESSING</p>
                  <p>
                    Information you share may be processed by our AI assistant, Allora, to facilitate legal research and document drafting. This processing occurs within secure, encrypted environments. AI-processed content is always reviewed by a licensed attorney before delivery. We do not use your confidential legal information to train general AI models.
                  </p>
                  <p className="font-semibold text-[#1F1810]">DATA SECURITY</p>
                  <p>
                    We implement industry-standard encryption, access controls, and security practices to protect your information. Data is stored in SOC 2 compliant infrastructure provided by Supabase. Payment processing is handled by Stripe, a PCI-DSS Level 1 certified provider.
                  </p>
                  <p className="font-semibold text-[#1F1810]">DATA RETENTION</p>
                  <p>
                    We retain your information for as long as your account is active and for a period of seven (7) years thereafter to comply with legal and professional obligations. You may request deletion of your account data, subject to our legal retention requirements.
                  </p>
                  <p className="font-semibold text-[#1F1810]">YOUR RIGHTS</p>
                  <p>
                    You have the right to access, correct, or delete your personal information. You may also request a copy of your data in a portable format. To exercise these rights, contact us at privacy@availablelaw.com.
                  </p>
                  <p className="font-semibold text-[#1F1810]">CONTACT</p>
                  <p>
                    For privacy inquiries, contact: Available Law, LLC, privacy@availablelaw.com.
                  </p>
                </div>
                <label className="flex items-start gap-3 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#1F1810]/20 text-[#C17832] focus:ring-[#C17832]/20"
                  />
                  <span className="text-sm text-[#1F1810]">
                    I have read and agree to the Privacy Policy
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Engagement Agreement */}
          {currentStep === "engagement" && (
            <div>
              <h2 className="text-2xl font-bold text-[#1F1810] mb-2">
                Engagement Agreement
              </h2>
              <p className="text-sm text-[#6B5B4E] mb-6">
                This agreement establishes the attorney-client relationship and
                defines the scope of services under your membership.
              </p>

              <div className="bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg p-4 h-64 overflow-y-auto text-xs text-[#6B5B4E] leading-relaxed space-y-3">
                <p className="font-semibold text-[#1F1810]">
                  AVAILABLE LAW, LLC — ENGAGEMENT AGREEMENT FOR LEGAL SERVICES
                </p>
                <p>Effective Date: {new Date().toLocaleDateString()}</p>
                <p>
                  This Engagement Agreement (&ldquo;Agreement&rdquo;) is entered into between Available Law, LLC (&ldquo;Firm&rdquo;), a Colorado limited liability company providing legal services, and you (&ldquo;Client&rdquo;), the individual or entity identified in your member profile.
                </p>
                <p className="font-semibold text-[#1F1810]">1. SCOPE OF REPRESENTATION</p>
                <p>
                  The Firm agrees to provide legal services to Client as defined by Client&apos;s selected membership tier. Services include AI-assisted legal research, document drafting, contract review, and attorney consultations as specified in your tier. Each discrete legal matter will be handled as a separate engagement within the scope of your membership. The Firm reserves the right to decline representation on specific matters that fall outside our practice areas or that present conflicts of interest.
                </p>
                <p className="font-semibold text-[#1F1810]">2. ATTORNEY-CLIENT RELATIONSHIP</p>
                <p>
                  By executing this Agreement, an attorney-client relationship is established between you and Available Law, LLC for matters within the scope of your membership tier. All communications regarding legal matters through the Platform are privileged and confidential to the extent provided by Colorado law. This relationship continues for the duration of your active membership.
                </p>
                <p className="font-semibold text-[#1F1810]">3. AI-ASSISTED PRACTICE DISCLOSURE</p>
                <p>
                  Client acknowledges and consents to the Firm&apos;s use of artificial intelligence tools, including the proprietary assistant known as &ldquo;Allora,&rdquo; in the provision of legal services. Client understands that: (a) AI tools assist attorneys in research, drafting, and analysis; (b) all AI-generated work product is reviewed and approved by a licensed Colorado attorney before delivery; (c) the supervising attorney maintains professional responsibility for all work product; and (d) the use of AI does not diminish the Firm&apos;s professional obligations or duty of care.
                </p>
                <p className="font-semibold text-[#1F1810]">4. FEES</p>
                <p>
                  Client agrees to pay the subscription fees associated with their selected membership tier. Fees are billed through Stripe on a recurring monthly or annual basis. Services beyond the scope of Client&apos;s tier may be available at additional cost, which will be communicated and agreed upon before work begins. The Firm does not charge hourly rates for services within your tier&apos;s scope.
                </p>
                <p className="font-semibold text-[#1F1810]">5. CLIENT RESPONSIBILITIES</p>
                <p>
                  Client agrees to: (a) provide accurate and complete information relevant to legal matters; (b) respond to attorney inquiries in a timely manner; (c) inform the Firm of any changes in circumstances that may affect ongoing matters; and (d) maintain the confidentiality of legal advice received.
                </p>
                <p className="font-semibold text-[#1F1810]">6. TERMINATION</p>
                <p>
                  Either party may terminate this Agreement at any time. Client may terminate by canceling their membership subscription. The Firm may terminate for cause, including non-payment, conflicts of interest, or Client&apos;s failure to cooperate. Upon termination, the Firm will take reasonable steps to protect Client&apos;s interests and provide transition assistance.
                </p>
                <p className="font-semibold text-[#1F1810]">7. COLORADO PROFESSIONAL RESPONSIBILITY</p>
                <p>
                  Available Law, LLC and its attorneys are bound by the Colorado Rules of Professional Conduct. Nothing in this Agreement limits the Firm&apos;s professional obligations under those Rules. Client has the right to file a complaint with the Colorado Attorney Regulation Counsel if Client believes the Firm has violated its professional obligations.
                </p>
              </div>

              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={engagementAgreed}
                  onChange={(e) => setEngagementAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#1F1810]/20 text-[#C17832] focus:ring-[#C17832]/20"
                />
                <span className="text-sm text-[#1F1810]">
                  I have read and agree to the Engagement Agreement for Legal
                  Services
                </span>
              </label>

              <div className="mt-6">
                <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                  Digital Signature *
                </label>
                <p className="text-xs text-[#A89279] mb-2">
                  Type your full legal name to sign this agreement
                </p>
                <input
                  type="text"
                  value={engagementSignature}
                  onChange={(e) => setEngagementSignature(e.target.value)}
                  placeholder="Type your full legal name"
                  className="w-full px-4 py-2.5 bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all italic font-serif"
                />
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === "complete" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#7A8B6F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#7A8B6F]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F1810] mb-2">
                You&apos;re all set, {fullName.split(" ")[0]}!
              </h2>
              <p className="text-sm text-[#6B5B4E] mb-8 max-w-md mx-auto">
                Your account is ready. You can now access your dashboard, chat
                with Allora, and start getting legal support for{" "}
                {businessName}.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F1810] text-white rounded-lg font-medium hover:bg-[#C17832] transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation */}
          {currentStep !== "complete" && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1F1810]/8">
              {currentStepIndex > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-medium hover:bg-[#C17832] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {currentStep === "engagement" ? "Complete Setup" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
