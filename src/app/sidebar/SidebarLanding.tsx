"use client";

import { useState } from "react";
import {
  HeartHandshake,
  Users,
  Coffee,
  Mic,
  MapPin,
  LifeBuoy,
  ArrowRight,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AvaFloatingWidget from "@/components/AvaFloatingWidget";

interface Faq {
  question: string;
  answer: string;
}

interface SidebarLandingProps {
  faqs: Faq[];
}

/** Open Ava with a Sidebar-specific seed prompt — used for every waitlist CTA
 *  while the first circles are forming (same pattern as the YLab waitlist). */
function openSidebarWaitlist(seed: string) {
  window.dispatchEvent(new CustomEvent("ava:open", { detail: { seed } }));
}

const WAITLIST_SEED =
  "I'm an attorney interested in Sidebar, Available Law's community for lawyers. How do I join the founding circle waitlist?";

export default function SidebarLanding({ faqs }: SidebarLandingProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <Header />
      <main className="bg-[#FAF8F5] text-[#1F1810]">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(900px 400px at 50% -10%, rgba(193,120,50,0.14), transparent 70%)",
            }}
          />
          <div className="max-w-[920px] mx-auto px-6 pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C17832]/30 bg-white/60 px-4 py-1.5 mb-7">
              <HeartHandshake className="w-4 h-4 text-[#C17832]" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B5B4E]">
                Sidebar · A Community for Attorneys
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl leading-[1.05] mb-6">
              The conversation this profession
              <br className="hidden md:block" /> needs happens off the record.
            </h1>

            <p className="text-base md:text-xl text-[#6B5B4E] leading-relaxed max-w-[680px] mx-auto mb-9">
              Sidebar is a community where attorneys talk to attorneys like
              human beings — small peer circles, casual gatherings, and an open
              conversation about the weight this work puts on the people who do
              it. No networking agenda. No CLE pitch. Just colleagues who get
              it.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openSidebarWaitlist(WAITLIST_SEED)}
                className="btn-al btn-al-primary text-sm px-7 py-3"
              >
                Join the founding circle
              </button>
              <a
                href="#why"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F1810] border border-[#C17832] rounded-full px-7 py-3 hover:bg-[#C17832] hover:text-white transition-colors"
              >
                Why Sidebar exists
              </a>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Why we call it Sidebar                                           */}
        {/* ---------------------------------------------------------------- */}
        <section id="why" className="max-w-[1080px] mx-auto px-6 py-14">
          <div className="text-center max-w-[720px] mx-auto mb-12">
            <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-3">
              Why we call it Sidebar
            </p>
            <h2 className="font-heading text-3xl md:text-4xl leading-tight mb-4">
              A sidebar is where lawyers drop the performance.
            </h2>
            <p className="text-base md:text-lg text-[#6B5B4E] leading-relaxed">
              In a courtroom, the sidebar is the conversation that happens away
              from the jury — quieter, more candid, human. That&apos;s the room
              we&apos;re building. Being a lawyer means carrying other
              people&apos;s worst days and pretending it doesn&apos;t weigh
              anything. In here, you can set it down.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Users,
                title: "Small circles, real colleagues",
                body: "Recurring peer groups of six to eight attorneys who actually know each other's names and stories — not a listserv, not a happy hour with strangers.",
              },
              {
                icon: Coffee,
                title: "No agenda, no posturing",
                body: "Nobody's rainmaking, nobody's recruiting, and nobody's selling CLE credits. You don't have to be impressive here. You just have to show up.",
              },
              {
                icon: HeartHandshake,
                title: "We look out for each other",
                body: "The point is to make “how are you actually doing?” a normal question between lawyers — and to notice when a colleague's answer needs more than a nod.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#D9CCBC] bg-white p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C17832]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#C17832]" />
                </div>
                <h3 className="font-heading text-xl mb-2">{title}</h3>
                <p className="text-sm text-[#6B5B4E] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* The mission — say the quiet part out loud                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 py-4">
          <div className="max-w-[1080px] mx-auto rounded-3xl bg-[#1F1810] text-[#FAF8F5] px-7 py-12 md:px-14 md:py-16">
            <div className="max-w-[760px]">
              <p className="text-sm font-semibold text-[#E0A567] uppercase tracking-wide mb-4">
                The mission
              </p>
              <h2 className="font-heading text-3xl md:text-[2.6rem] leading-[1.1] mb-6">
                Make it normal for lawyers to be human.
              </h2>
              <p className="text-base md:text-lg text-[#D9CCBC] leading-relaxed mb-5">
                The numbers aren&apos;t a secret — they&apos;re just not said
                out loud. A landmark 2016 study of nearly 13,000 practicing
                attorneys found <em>28% struggling with depression</em>, 19%
                with anxiety, and roughly one in five drinking at problematic
                levels — rates far above the general population. The profession
                that argues for everyone else mostly suffers in silence.
              </p>
              <p className="text-base md:text-lg text-[#D9CCBC] leading-relaxed mb-8">
                Zachariah has been open — on podcasts and everywhere else —
                about his own hardest seasons in this profession, because
                silence is the part of the problem we can actually fix. Sidebar
                is that conversation made into a place: attorneys connecting
                before the breaking point, not after.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <Check className="w-4 h-4 text-[#E0A567]" /> Peer circles, not
                  networking
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <Check className="w-4 h-4 text-[#E0A567]" /> Off the record,
                  always
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <Check className="w-4 h-4 text-[#E0A567]" /> Free — a mission,
                  not a product
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* What Sidebar looks like                                          */}
        {/* ---------------------------------------------------------------- */}
        <section className="max-w-[1080px] mx-auto px-6 py-16">
          <div className="text-center max-w-[720px] mx-auto mb-10">
            <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-3">
              What Sidebar looks like
            </p>
            <h2 className="font-heading text-3xl md:text-4xl leading-tight">
              Three rooms, one conversation.
            </h2>
          </div>

          <div className="space-y-5">
            {[
              {
                icon: Users,
                kicker: "Peer circles",
                title: "A standing hour with people who get it",
                body: "Small virtual groups that meet on a regular rhythm. Same faces every time, so trust actually builds. Attorneys anywhere can join a circle.",
                cta: "Get matched with a founding circle",
                seed: WAITLIST_SEED,
              },
              {
                icon: MapPin,
                kicker: "Front Range gatherings",
                title: "In person, off the clock",
                body: "Casual meetups around Colorado Springs, Denver, and the Front Range. Coffee, trails, tables — venues where nobody hands out a business card.",
                cta: "Hear about the first gathering",
                seed: "I'm an attorney in Colorado and I'd like to hear about Sidebar's first in-person gathering on the Front Range.",
              },
              {
                icon: Mic,
                kicker: "The conversation",
                title: "Saying it out loud, on the record too",
                body: "Zachariah takes this conversation to podcasts and stages — his story and the profession's numbers — so the stigma loses ground in public, not just in private. If you heard him on a show and ended up here: this is that, made real.",
                cta: "Share your story or suggest a show",
                seed: "I heard about Sidebar and the mental-health conversation for attorneys. I'd like to share my story or suggest a podcast collaboration.",
              },
            ].map(({ icon: Icon, kicker, title, body, cta, seed }) => (
              <div
                key={kicker}
                className="rounded-3xl border border-[#D9CCBC] bg-white p-7 md:p-10 flex flex-col md:flex-row items-center gap-7"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-3xl bg-[#C17832]/10 flex items-center justify-center">
                  <Icon className="w-9 h-9 text-[#C17832]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-1.5">
                    {kicker}
                  </p>
                  <h3 className="font-heading text-2xl md:text-3xl mb-2">
                    {title}
                  </h3>
                  <p className="text-sm md:text-base text-[#6B5B4E] leading-relaxed mb-4">
                    {body}
                  </p>
                  <button
                    type="button"
                    onClick={() => openSidebarWaitlist(seed)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#C17832] hover:text-[#1F1810] transition-colors"
                  >
                    {cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Crisis resources — community, not crisis care                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="max-w-[1080px] mx-auto px-6 pb-16">
          <div className="rounded-2xl bg-[#F5F0EB] border border-[#D9CCBC] px-6 py-5 flex items-start gap-3">
            <LifeBuoy className="w-5 h-5 text-[#C17832] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#6B5B4E] leading-relaxed">
              <span className="font-semibold text-[#1F1810]">
                Sidebar is community, not crisis care.
              </span>{" "}
              If you&apos;re struggling right now, call or text{" "}
              <span className="font-semibold text-[#1F1810]">988</span> — the
              Suicide &amp; Crisis Lifeline. And the{" "}
              <a
                href="https://www.coloradolap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#C17832] hover:text-[#1F1810] underline underline-offset-2 transition-colors"
              >
                Colorado Lawyer Assistance Program (COLAP)
              </a>{" "}
              offers free, confidential support built specifically for legal
              professionals. Reaching out is a strength this profession should
              treat like one.
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ                                                              */}
        {/* ---------------------------------------------------------------- */}
        <section className="max-w-[760px] mx-auto px-6 pb-16">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-10">
            Questions, answered
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-[#D9CCBC] bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-semibold text-[#1F1810] text-[15px]">
                      {faq.question}
                    </span>
                    {open ? (
                      <Minus className="w-4 h-4 text-[#C17832] flex-shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-[#C17832] flex-shrink-0" />
                    )}
                  </button>
                  {open && (
                    <p className="px-5 pb-5 -mt-1 text-sm text-[#6B5B4E] leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 pb-20">
          <div className="max-w-[1080px] mx-auto rounded-3xl border border-[#C17832]/30 bg-[radial-gradient(700px_300px_at_50%_0%,rgba(193,120,50,0.12),transparent)] px-7 py-14 text-center">
            <h2 className="font-heading text-3xl md:text-4xl mb-4">
              You don&apos;t have to carry this profession alone.
            </h2>
            <p className="text-base md:text-lg text-[#6B5B4E] leading-relaxed max-w-[620px] mx-auto mb-8">
              The founding circles are forming now. Tell us a little about
              where you are in your career, and we&apos;ll reach out as your
              circle comes together and the first gatherings land on the
              calendar.
            </p>
            <button
              type="button"
              onClick={() => openSidebarWaitlist(WAITLIST_SEED)}
              className="btn-al btn-al-primary text-sm px-8 py-3"
            >
              Join the founding circle
            </button>
          </div>
        </section>
      </main>
      <Footer />
      <AvaFloatingWidget />
    </>
  );
}
