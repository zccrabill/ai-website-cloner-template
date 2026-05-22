import {
  H2,
  H3,
  P,
  Lead,
  UL,
  OL,
  LI,
  Strong,
  InlineLink,
  Callout,
  LegalDisclaimer,
} from "./typography";

/**
 * FAIIR framework explainer — what it stands for, how it works, why it
 * matters for Colorado businesses.
 *
 * Editorial notes:
 * - Primary keyword targets: "FAIIR framework", "FAIIR certification",
 *   "AI compliance framework Colorado", "AI risk assessment framework",
 *   "FAIIR readiness assessment".
 * - This is a pillar page for the /faiir landing — heavy internal linking.
 * - Written for business owners evaluating whether they need a formal
 *   compliance program, not for attorneys already familiar with the Act.
 * - FAIIR pre-dates SB 26-189 (the 2026 repeal-and-replace of SB 24-205) —
 *   the five pillars are deliberately broader than the new statute requires
 *   so the framework provides defense-in-depth, not just minimum compliance.
 */
export default function WhatIsFaiirFrameworkArticle() {
  return (
    <>
      <Lead>
        FAIIR stands for <Strong>Fairness, Accountability,
        Impact&nbsp;assessment, Informed&nbsp;consent,</Strong> and{" "}
        <Strong>Risk&nbsp;management</Strong>. It is the compliance
        framework we built at Available Law to help Colorado businesses
        meet — and go past — the requirements of the new Colorado AI Act
        (SB 26-189), without drowning in legalese or six-figure consulting
        engagements.
      </Lead>

      <P>
        SB 26-189 creates obligations for businesses that deploy{" "}
        <Strong>covered ADMT</Strong> — automated decision-making
        technology that materially influences a consequential decision
        about a consumer. The statute tells you what to disclose, when to
        send notices, and how to handle adverse outcomes — but it leaves
        the operational details (who reviews what, what to document, how
        to monitor for disparate impact) to the deployer. FAIIR fills that
        gap and adds best-practice pillars the statute doesn&apos;t require
        but that any well-run business should have anyway.
      </P>

      <H2>The five pillars</H2>

      <H3>F — Fairness</H3>
      <P>
        Fairness is the foundation. SB 26-189 dropped the prior law&apos;s
        algorithmic-discrimination duty of care, but it expressly preserved
        liability under state anti-discrimination laws for outcomes
        materially influenced by ADMT — and made indemnity for the deployer&apos;s
        own discriminatory conduct unenforceable. FAIIR operationalizes
        fairness with a structured disparate-impact review: we identify the
        decision categories your AI touches, map the protected classes at
        risk, and test for differential outcomes using the data you
        actually have. The output is a documented fairness analysis that
        gives you a real defense, not a vague promise that your vendor
        &ldquo;tested for bias.&rdquo;
      </P>

      <H3>A — Accountability</H3>
      <P>
        Accountability means someone in your organization owns AI
        compliance — and can prove it. FAIIR establishes a clear chain of
        responsibility: who approved the covered ADMT, who monitors its
        performance, who reviews consumer complaints, who conducts the
        meaningful human review of adverse outcomes, and who has authority
        to shut a system down. Even though SB 26-189 doesn&apos;t mandate
        a formal accountability program, having one is how you survive a
        60-day AG cure notice without scrambling.
      </P>

      <H3>I — Impact assessment</H3>
      <P>
        Before you deploy (or continue deploying) covered ADMT, you need
        to understand the impact it has on consumers. FAIIR walks you
        through a structured assessment that documents the purpose of the
        system, the categories of decisions it influences, the data it
        ingests, the populations it affects, and the potential for harm.
        SB 26-189 did away with the mandatory annual impact assessment of
        the prior law — but the document itself remains the single most
        useful artifact you can produce when a regulator or plaintiff
        comes asking how your AI works.
      </P>

      <Callout title="Why a voluntary assessment still matters">
        <P>
          Many businesses read the SB 26-189 repeal-and-replace as
          permission to skip the documentation work. That&apos;s a
          mistake. The statute&apos;s recordkeeping requirement is three
          years. Anti-discrimination liability still attaches. And the AG
          can still demand records during a cure window. The businesses
          that come through enforcement clean are the ones that wrote
          things down — even when the statute didn&apos;t strictly require
          it.
        </P>
      </Callout>

      <H3>I — Informed consent</H3>
      <P>
        SB 26-189 makes this pillar concrete. Deployers must post a{" "}
        <Strong>clear and conspicuous pre-use notice</Strong> that covered
        ADMT is in use and send a{" "}
        <Strong>30-day adverse-outcome notice</Strong> in plain language
        when ADMT contributes to a denial or unfavorable decision. FAIIR
        delivers templates calibrated to your actual systems — the
        consumer-facing language has to track what your ADMT does and what
        inputs it relies on. Generic privacy policy language is not
        sufficient, and the AG will know the difference.
      </P>

      <H3>R — Risk management</H3>
      <P>
        Risk management ties everything together. FAIIR produces a
        documented risk management program that covers ongoing monitoring,
        complaint handling, employee orientation, vendor oversight, and
        periodic re-assessment. SB 26-189 doesn&apos;t require a formal
        risk-management program — but it does require three years of
        records and a meaningful human-review process, which together
        functionally demand one. This is not a static document — it is a
        living program that evolves as your AI usage changes and
        regulatory expectations sharpen.
      </P>

      <H2>How the FAIIR process works</H2>

      <OL>
        <LI>
          <Strong>Discovery call</Strong> — We learn about your business,
          your AI systems, and your current compliance posture. This is
          free and takes about 30 minutes. You can{" "}
          <InlineLink href="https://calendly.com/availablelaw/free-faiir-discovery-call">
            book one here
          </InlineLink>.
        </LI>
        <LI>
          <Strong>Readiness assessment</Strong> — We audit your ADMT
          inventory, vendor documentation, consumer notices, human-review
          process, and records against each of the five FAIIR pillars.
          You get a scored report that tells you exactly where you stand
          and what needs to change.
        </LI>
        <LI>
          <Strong>Remediation plan</Strong> — We build a prioritized
          action plan: what to fix now, what to fix next quarter, and what
          can wait. Every item maps to a specific SB 26-189 duty or a
          best-practice pillar so you can see why it matters.
        </LI>
        <LI>
          <Strong>Implementation support</Strong> — We help you execute.
          That might mean drafting pre-use and adverse-outcome notices,
          negotiating vendor contract amendments to secure developer
          documentation, building human-review workflows, or writing
          internal governance policies. We do the legal work; you focus on
          running your business.
        </LI>
        <LI>
          <Strong>Ongoing membership</Strong> — After the initial
          assessment, our{" "}
          <InlineLink href="/faiir">FAIIR Compliance Membership</InlineLink>{" "}
          keeps you current with quarterly notice and process reviews,
          regulatory update briefings, on-call attorney Q&amp;A, and
          refreshed risk documentation.
        </LI>
      </OL>

      <H2>Who needs FAIIR?</H2>

      <P>
        Not every business needs a full compliance program. SB 26-189
        targets <Strong>covered ADMT</Strong> — technology that
        materially influences consequential decisions in education,
        employment, housing, lending, insurance, healthcare, or
        government services. If your AI usage is limited to internal
        productivity tools (scheduling, spell-check, code completion),
        you are likely outside the scope.
      </P>

      <P>
        You probably need FAIIR if your business:
      </P>

      <UL>
        <LI>
          Uses AI to screen job applicants, evaluate employees, or make
          hiring recommendations
        </LI>
        <LI>
          Uses AI to assess creditworthiness, set insurance rates, or
          approve loans
        </LI>
        <LI>
          Uses AI to determine eligibility for housing, education, or
          government services
        </LI>
        <LI>
          Deploys consumer-facing AI that provides personalized
          recommendations with material consequences
        </LI>
        <LI>
          Contracts with AI vendors whose tools make decisions about your
          customers
        </LI>
      </UL>

      <P>
        Not sure whether your AI systems qualify as covered ADMT? Our free{" "}
        <InlineLink href="/ai-act-checker">
          Colorado AI Act Checker
        </InlineLink>{" "}
        walks you through a quick self-assessment.
      </P>

      <H2>FAIIR vs. other frameworks</H2>

      <P>
        You may have seen references to the NIST AI Risk Management
        Framework, the EU AI Act, or ISO 42001. Those are valuable
        standards — and they are designed for multinational enterprises
        with dedicated compliance teams. FAIIR is different because it is:
      </P>

      <UL>
        <LI>
          <Strong>Colorado-specific</Strong> — mapped directly to the
          statutory language of SB 26-189, not generalized across fifty
          jurisdictions
        </LI>
        <LI>
          <Strong>Built for small and mid-size businesses</Strong> — the
          companies most affected by the Act and least likely to have
          in-house AI counsel
        </LI>
        <LI>
          <Strong>Attorney-delivered</Strong> — every assessment is
          conducted by a licensed Colorado attorney, not a software tool
          or a compliance vendor selling certifications
        </LI>
        <LI>
          <Strong>Actionable</Strong> — the output is a remediation plan
          you can execute, not a 200-page risk register you file and forget
        </LI>
      </UL>

      <H2>Get started</H2>

      <P>
        SB 26-189 takes effect January 1, 2027, and enforcement discretion
        runs out fast: the AG&apos;s 60-day cure window sunsets entirely
        on January 1, 2030. If your business deploys covered ADMT, the
        cost of compliance now is a fraction of the cost of an enforcement
        action later. Start with a{" "}
        <InlineLink href="https://calendly.com/availablelaw/free-faiir-discovery-call">
          free FAIIR discovery call
        </InlineLink>{" "}
        or explore the full{" "}
        <InlineLink href="/faiir">FAIIR Compliance Membership</InlineLink>.
      </P>

      <LegalDisclaimer />
    </>
  );
}
