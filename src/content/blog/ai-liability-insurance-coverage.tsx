import {
  H2,
  H3,
  P,
  Lead,
  UL,
  LI,
  Strong,
  InlineLink,
  Callout,
  LegalDisclaimer,
} from "./typography";

/**
 * AI liability insurance — does your current policy cover AI-related claims?
 *
 * Editorial notes:
 * - Primary keyword targets: "AI liability insurance", "does insurance cover AI",
 *   "AI errors and omissions", "AI risk insurance", "technology E&O AI",
 *   "commercial general liability AI exclusion".
 * - Written for business owners and risk managers who assume their existing
 *   policies cover AI — and are usually wrong.
 * - Structured around common insurance categories and what they do / don't
 *   cover when AI is involved.
 */
export default function AiLiabilityInsuranceCoverageArticle() {
  return (
    <>
      <Lead>
        Your business insurance almost certainly does not cover AI-related
        claims the way you think it does. As AI tools become embedded in
        everyday business operations, a gap is opening between what
        companies assume their policies cover and what insurers will
        actually pay out. Here is how to find out where you stand before
        a claim forces the question.
      </Lead>

      <P>
        The conversation about AI risk usually focuses on regulation and
        compliance. But there is a parallel question most businesses are
        not asking: if something goes wrong with an AI system we deploy —
        a biased hiring recommendation, a hallucinated financial
        projection, a data breach through an AI vendor — will our
        insurance cover it? For most businesses, the honest answer is
        &ldquo;probably not fully, and possibly not at all.&rdquo;
      </P>

      <H2>The coverage gap is real</H2>

      <P>
        Traditional commercial insurance policies were written for a
        pre-AI world. They cover well-understood risks: bodily injury,
        property damage, professional negligence, data breaches. AI
        introduces categories of harm that do not map cleanly to existing
        policy language — algorithmic discrimination, autonomous decision
        errors, training data contamination, model hallucination. Insurers
        are aware of this mismatch and are increasingly adding exclusions
        or sub-limits for AI-related claims.
      </P>

      <H2>Policy-by-policy breakdown</H2>

      <H3>Commercial General Liability (CGL)</H3>
      <P>
        CGL policies cover bodily injury and property damage caused by
        your business operations. AI-related harm — a discriminatory
        lending decision, a wrongful denial of benefits — is almost never
        &ldquo;bodily injury&rdquo; or &ldquo;property damage&rdquo; under
        standard CGL definitions. Some CGL policies include
        &ldquo;personal and advertising injury&rdquo; coverage that might
        reach AI-generated content (defamation, copyright infringement),
        but carriers are already drafting AI-specific exclusions for this
        coverage part.
      </P>

      <Callout title="Watch for new exclusions">
        <P>
          Several major carriers began adding &ldquo;Artificial
          Intelligence Exclusion&rdquo; endorsements to CGL renewals in
          late 2025. If you have not reviewed your most recent policy
          renewal, check for new endorsements — they can fundamentally
          change what is covered without changing the premium.
        </P>
      </Callout>

      <H3>Professional Liability / Errors &amp; Omissions (E&amp;O)</H3>
      <P>
        E&amp;O policies cover claims arising from professional services
        you provide. If your business uses AI to deliver or enhance
        professional services — and an AI error causes client harm — this
        is the policy most likely to respond. But there are two common
        problems:
      </P>

      <UL>
        <LI>
          <Strong>The &ldquo;your work&rdquo; question</Strong> — E&amp;O
          policies typically cover errors in services you perform. If the
          error originated in a third-party AI system you licensed, the
          carrier may argue the error was in the vendor&apos;s product, not
          your professional service. This is where your{" "}
          <InlineLink href="/blog/5-ai-vendor-contract-clauses">
            AI vendor contract clauses
          </InlineLink>{" "}
          become critical — specifically the indemnification and liability
          allocation provisions.
        </LI>
        <LI>
          <Strong>Failure to supervise</Strong> — If the claim is that
          your employee blindly relied on an AI recommendation without
          exercising professional judgment, the carrier may deny coverage
          on the theory that the error was not in the AI but in the human
          failure to oversee it. This connects directly to your{" "}
          <InlineLink href="/blog/ai-employee-training-requirements">
            employee training obligations
          </InlineLink>.
        </LI>
      </UL>

      <H3>Cyber / Technology E&amp;O</H3>
      <P>
        Cyber policies cover data breaches, network security failures, and
        (in some forms) technology errors. If your AI system causes a data
        breach — for example, a large language model that memorizes and
        regurgitates PII from its training data — your cyber policy is the
        most likely to respond. Technology E&amp;O endorsements may also
        cover errors in technology products or services you deliver.
      </P>

      <P>
        However, cyber policies are evolving fast. Some carriers are
        carving out &ldquo;AI-generated content&rdquo; and
        &ldquo;algorithmic decision-making&rdquo; from their standard
        insuring agreements. Others are offering AI-specific endorsements
        at additional premium. Read your policy — do not assume last
        year&apos;s coverage language still applies.
      </P>

      <H3>Directors &amp; Officers (D&amp;O)</H3>
      <P>
        D&amp;O policies protect executives and board members against
        claims of mismanagement. If your company faces an enforcement
        action under the Colorado AI Act and the claim is that leadership
        failed to implement adequate AI governance, D&amp;O coverage may
        apply. But most D&amp;O policies exclude regulatory fines and
        penalties — they cover defense costs and settlements, not the
        fine itself.
      </P>

      <H2>What to do right now</H2>

      <H3>1. Read your current policies</H3>
      <P>
        Pull your CGL, E&amp;O, cyber, and D&amp;O policies. Search for
        &ldquo;artificial intelligence,&rdquo; &ldquo;algorithm,&rdquo;
        &ldquo;machine learning,&rdquo; and &ldquo;automated
        decision.&rdquo; Any exclusion, sublimit, or definition that
        references these terms tells you where your carrier has already
        identified AI as a coverage risk.
      </P>

      <H3>2. Ask your broker the hard questions</H3>
      <P>
        Most brokers will not proactively tell you about AI coverage gaps.
        Ask specifically: &ldquo;If our AI system makes a biased decision
        that harms a consumer and we get sued, which policy responds?
        Show me the insuring agreement.&rdquo; If the answer is vague,
        that is your answer.
      </P>

      <H3>3. Explore AI-specific coverage</H3>
      <P>
        A small but growing number of carriers are offering AI-specific
        liability products or endorsements. These are still early-stage
        and the terms vary widely, but they are worth evaluating —
        especially if your business relies heavily on AI for
        consumer-facing decisions. Your broker should be able to get
        quotes from specialty markets.
      </P>

      <H3>4. Reduce the risk insurance has to cover</H3>
      <P>
        Insurance is a backstop, not a strategy. The most cost-effective
        way to manage AI liability is to reduce the probability and
        severity of claims in the first place. That means proper{" "}
        <InlineLink href="/blog/document-ai-decision-making">
          documentation of AI decisions
        </InlineLink>,{" "}
        <InlineLink href="/blog/ai-employee-training-requirements">
          employee training
        </InlineLink>,{" "}
        <InlineLink href="/blog/5-ai-vendor-contract-clauses">
          vendor contract protections
        </InlineLink>, and a structured compliance framework like{" "}
        <InlineLink href="/faiir">FAIIR</InlineLink>. An insurer
        evaluating your risk profile will look at all of these — and
        businesses with documented compliance programs consistently get
        better terms.
      </P>

      <Callout title="The compliance-insurance connection">
        <P>
          Here is the practical reality: a documented AI compliance
          program reduces your insurance risk, which reduces your
          premiums, which funds the compliance program. Businesses that
          treat compliance and risk transfer as separate conversations
          are leaving money on the table.
        </P>
      </Callout>

      <H2>The bottom line</H2>

      <P>
        AI liability insurance is catching up to AI risk, but it has not
        caught up yet. Most businesses deploying AI today are operating
        with coverage gaps they do not know about. The fix is not
        complicated — review your policies, ask your broker pointed
        questions, and build the compliance infrastructure that both
        reduces claims and satisfies underwriters. If you want a
        structured approach to the compliance side, our{" "}
        <InlineLink href="/faiir">FAIIR readiness assessment</InlineLink>{" "}
        is designed for exactly that.
      </P>

      <LegalDisclaimer />
    </>
  );
}
