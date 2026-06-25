import {
  H2,
  H3,
  P,
  Lead,
  OL,
  UL,
  LI,
  Strong,
  InlineLink,
  Callout,
  LegalDisclaimer,
} from "./typography";

/**
 * Using AI in your small business — a 2026 legal checklist.
 *
 * Editorial notes:
 * - Primary keyword targets: "using AI in small business legal", "AI legal
 *   checklist", "is it legal to use AI in business", "AI policy for small
 *   business", "AI compliance small business", "AI acceptable use policy",
 *   "legal risks of AI for business 2026".
 * - Top-of-funnel and built for AI Overviews / "People Also Ask": a numbered,
 *   extractable checklist plus an FAQ block. Each step links to the deeper post
 *   that covers it, building the topical cluster.
 * - Colorado AI Act facts mirror src/lib/seo.ts HOMEPAGE_FAQS. Keep in sync.
 */
export default function AiSmallBusinessLegalChecklistArticle() {
  return (
    <>
      <Lead>
        Adopting AI tools is easy. Staying on the right side of the law while you
        do it is the part most small businesses skip — usually without realizing
        there was a part to skip. This 2026 checklist walks through the legal
        questions to answer before and after you roll out AI, from vendor
        contracts and data privacy to the Colorado AI Act, in plain language.
      </Lead>

      <P>
        Here is the uncomfortable truth heading into the back half of 2026: the
        gap between &ldquo;we started using an AI tool&rdquo; and &ldquo;we
        thought about the legal side of using an AI tool&rdquo; is where most
        small business AI risk lives. The tools are friendly and the sign-up is
        instant, so the legal questions never feel urgent — until one of them
        is. This checklist closes that gap.
      </P>

      <H2>First: &ldquo;we just use ChatGPT&rdquo; is still a legal decision</H2>

      <P>
        The moment an AI tool touches customer data, employee data, or a
        decision about a real person, you have made a decision with legal
        consequences — whether or not you framed it that way. You do not need to
        panic, and you do not need to stop using AI. You need to run through the
        questions below once, fix what needs fixing, and keep a record that you
        did. That is the whole game.
      </P>

      <H2>The checklist</H2>

      <OL>
        <LI>
          <Strong>Inventory where AI already touches your business.</Strong> You
          cannot manage what you have not listed. Write down every AI tool in
          use — the obvious ones (chat assistants, copywriting, image tools) and
          the embedded ones (AI features inside your CRM, your hiring software,
          your support desk). Note what data each one sees and what decisions it
          influences. Most businesses are surprised by how long this list is.
        </LI>
        <LI>
          <Strong>Read the vendor contract before you rely on the tool.</Strong>{" "}
          Who owns the outputs? Is your data being used to train the
          vendor&apos;s model? Who is liable if the model produces something
          infringing? The defaults usually favor the vendor. We break down the
          exact language to look for in{" "}
          <InlineLink href="/blog/5-ai-vendor-contract-clauses">
            five AI vendor contract clauses your company is missing
          </InlineLink>
          .
        </LI>
        <LI>
          <Strong>Lock down data and privacy.</Strong> Decide — and write down —
          what your team may and may not paste into AI tools. Customer
          personal information, employee records, confidential business data,
          and anything covered by a confidentiality agreement generally should
          not go into a tool that may train on it or retain it. This is the
          single most common way small businesses create a privacy problem with
          AI.
        </LI>
        <LI>
          <Strong>Write an AI acceptable use policy for your team.</Strong> A
          short, plain document that says which tools are approved, what data is
          off-limits, when a human has to review AI output, and who to ask when
          in doubt. It does not need to be long. It needs to exist, be read, and
          be followed — because &ldquo;we had no policy&rdquo; is a bad answer to
          every question that follows an incident.
        </LI>
        <LI>
          <Strong>Check whether you are a &ldquo;deployer&rdquo; under the
          Colorado AI Act.</Strong> If AI materially influences a consequential
          decision — hiring, firing, lending, housing, insurance, healthcare,
          education, government services — you may be a covered deployer with
          real duties. Our free{" "}
          <InlineLink href="/ai-act-checker">AI Act readiness checker</InlineLink>{" "}
          tells you in a few questions, and our{" "}
          <InlineLink href="/blog/colorado-ai-act-2026">
            plain-language guide to the Colorado AI Act
          </InlineLink>{" "}
          explains the duties in full.
        </LI>
        <LI>
          <Strong>Put a human in the loop on consequential decisions.</Strong>{" "}
          Where AI influences a decision about a real person, a person should be
          able to review and override it — and you should document that review.
          This is both good practice and, for covered deployers, a legal duty.
          See{" "}
          <InlineLink href="/blog/document-ai-decision-making">
            how to document AI decision-making for compliance
          </InlineLink>
          .
        </LI>
        <LI>
          <Strong>Check your insurance.</Strong> Most business policies were
          written before AI risk existed, and many have gaps or exclusions for
          it. Find out what your general liability, professional liability, and
          cyber policies actually cover before you need them. We did a
          policy-by-policy breakdown in{" "}
          <InlineLink href="/blog/ai-liability-insurance-coverage">
            does your business insurance cover AI liability
          </InlineLink>
          .
        </LI>
        <LI>
          <Strong>Keep records.</Strong> Save your AI inventory, your policy,
          your vendor documentation, and your human-review logs. If a regulator
          or a plaintiff ever asks &ldquo;how did you use this responsibly?&rdquo;
          the answer is a folder, not a shrug. For covered deployers, the
          Colorado AI Act requires keeping certain records for three years
          anyway.
        </LI>
      </OL>

      <Callout title="The two-hour version">
        <P>
          If you do nothing else: list your AI tools, decide what data is
          off-limits, write a one-page use policy, and run the free AI Act
          checker. That is an afternoon of work that handles the large majority
          of small business AI risk — and it puts you ahead of most companies
          your size.
        </P>
      </Callout>

      <H2>The 2026 Colorado timeline you should have on your radar</H2>

      <P>
        Colorado businesses are operating in a live regulatory environment, so
        the dates matter:
      </P>

      <UL>
        <LI>
          <Strong>June 30, 2026</Strong> — the original Colorado AI Act (SB
          24-205) technically takes effect, with enforcement paused.
        </LI>
        <LI>
          <Strong>January 1, 2027</Strong> — Senate Bill 26-189, the
          repeal-and-replace signed May 14, 2026, takes effect and becomes the
          governing framework. It regulates covered ADMT and requires deployers
          to give a pre-use notice, send a 30-day adverse-outcome notice, offer
          meaningful human review, and keep three years of records. The Colorado
          Attorney General has exclusive enforcement authority, with a 60-day
          cure period that sunsets January 1, 2030.
        </LI>
      </UL>

      <P>
        The takeaway is not &ldquo;wait until 2027.&rdquo; It is &ldquo;build
        the habits now,&rdquo; because the checklist above is what compliance
        looks like in practice, and it is far cheaper to set up before AI is
        woven through your operations than to retrofit after.
      </P>

      <H2>How to do all this without a big-firm budget</H2>

      <P>
        Nothing on this list requires a five-figure legal engagement. It
        requires a relationship with an attorney who can review your vendor
        contracts, help you write your policy, tell you whether you are a covered
        deployer, and keep your records defensible — on a predictable budget.
      </P>

      <P>
        That is what Available Law is built for. Our{" "}
        <InlineLink href="/#pricing">flat-rate subscription plans</InlineLink>{" "}
        ($50 to $300 a month) include AI vendor contract review and Colorado AI
        Act guidance, and{" "}
        <InlineLink href="/faiir">FAIIR certification</InlineLink> gives
        businesses that want a full, attorney-led governance program a structured
        way to get there. An AI assistant does the heavy lifting; a licensed
        Colorado attorney reviews everything before it reaches you.
      </P>

      <H2>Frequently asked questions</H2>

      <H3>Is it legal to use AI in my business?</H3>
      <P>
        Yes — using AI is legal. What is regulated is how you use it: whether you
        protect personal data, what your vendor contracts say, and whether AI is
        influencing consequential decisions about real people in ways that
        trigger laws like the Colorado AI Act. The tool is fine; the obligations
        attach to specific uses.
      </P>

      <H3>Do small businesses need an AI policy?</H3>
      <P>
        Practically, yes. A short written AI acceptable use policy — which tools
        are approved, what data is off-limits, and when humans must review
        output — is the cheapest risk reduction available, and &ldquo;we had no
        policy&rdquo; is a weak position after an incident. It does not need to
        be long to be effective.
      </P>

      <H3>What is the most common legal mistake small businesses make with AI?</H3>
      <P>
        Putting confidential or personal data into an AI tool that may retain or
        train on it, without checking the vendor&apos;s terms first. It is easy
        to do, hard to undo, and it can create privacy, confidentiality, and
        compliance problems all at once.
      </P>

      <H3>Does the Colorado AI Act apply to my small business?</H3>
      <P>
        It applies if you deploy automated decision-making technology that
        materially influences a consequential decision — in employment, housing,
        lending, insurance, healthcare, education, or government services. Many
        small businesses are not covered; some are without realizing it. The free{" "}
        <InlineLink href="/ai-act-checker">AI Act readiness checker</InlineLink>{" "}
        gives you a fast answer.
      </P>

      <H2>The bottom line</H2>

      <P>
        AI is a legal decision dressed up as a productivity tool. Run the
        checklist once, fix the gaps, write the things down, and you have handled
        the large majority of the risk — at a fraction of the cost of cleaning it
        up later.
      </P>

      <P>
        Start with the free{" "}
        <InlineLink href="/ai-act-checker">AI Act readiness checker</InlineLink>,
        then{" "}
        <InlineLink href="/#pricing">
          compare Available Law&apos;s subscription plans
        </InlineLink>{" "}
        if you want an attorney in your corner as you build.
      </P>

      <LegalDisclaimer />
    </>
  );
}
