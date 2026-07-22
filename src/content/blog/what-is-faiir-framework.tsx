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
        FAIIR is the <Strong>Foundation of AI Integrity &amp;
        Regulation</Strong> — a compliance framework created by our founder
        and now maintained as an independent standard by FAIIR, LLC, built
        around five pillars:{" "}
        <Strong>Fitness&nbsp;for&nbsp;Purpose, Accountability,
        Integrity&nbsp;of&nbsp;Data, Informed&nbsp;Use,</Strong> and{" "}
        <Strong>Risk&nbsp;Management</Strong>. It exists to help Colorado
        businesses meet — and go past — the requirements of the new
        Colorado AI Act (SB 26-189), without drowning in legalese or
        six-figure consulting engagements.
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

      <H3>F — Fitness for Purpose</H3>
      <P>
        Most AI liability does not come from exotic failures. It comes
        from deploying a general-purpose model in a domain where it was
        never validated — a chatbot acting as a customer-service policy,
        a language model acting as a screener of real people. Fitness for
        Purpose asks you to prove you thought about the match between the
        tool and the job, and to test it. That includes bias: SB 26-189
        dropped the prior law&apos;s algorithmic-discrimination duty of
        care, but it expressly preserved liability under state
        anti-discrimination laws for outcomes materially influenced by
        ADMT — and made indemnity for the deployer&apos;s own
        discriminatory conduct unenforceable. FAIIR operationalizes this
        pillar with a structured fitness and disparate-impact review: we
        identify the decision categories your AI touches, map the
        protected classes at risk, and test for differential outcomes
        using the data you actually have. The output is a documented
        analysis that gives you a real defense, not a vague promise that
        your vendor &ldquo;tested for bias.&rdquo;
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

      <H3>I — Integrity of Data</H3>
      <P>
        This is the pillar most small businesses fail on — because most
        of their employees are pasting customer data, internal documents,
        and trade secrets into free AI tools every day without anyone
        tracking it. Integrity of Data is about knowing your data
        perimeter and enforcing it: which systems see what data, which
        vendors can train on it (and whether you opted out), and where
        personal data flows when an ADMT makes a decision. SB 26-189
        gives consumers the right to access and correct the personal
        data a covered ADMT relied on — a right you cannot honor if you
        do not know where that data lives.
      </P>

      <H3>I — Informed Use</H3>
      <P>
        Most AI liability cases turn on a surprised person — a customer
        surprised the chatbot was AI, an applicant surprised an
        algorithm screened them. Informed Use is the pillar that
        prevents surprise, and SB 26-189 makes it concrete. Deployers
        must post a{" "}
        <Strong>clear and conspicuous pre-use notice</Strong> that covered
        ADMT is in use and send a{" "}
        <Strong>30-day adverse-outcome notice</Strong> in plain language
        when ADMT contributes to a denial or unfavorable decision. FAIIR
        delivers templates calibrated to your actual systems — the
        consumer-facing language has to track what your ADMT does and what
        inputs it relies on. Generic privacy policy language is not
        sufficient, and the AG will know the difference.
      </P>

      <H3>R — Risk Management</H3>
      <P>
        Risk Management is the audit-trail pillar — it converts
        &ldquo;we&apos;re being careful&rdquo; into &ldquo;here is the
        evidence we were being careful.&rdquo; FAIIR produces a
        documented risk management program that covers ongoing
        monitoring, complaint handling, employee orientation, vendor
        oversight, periodic re-assessment, and written system reviews
        for each covered ADMT. SB 26-189 did away with the prior
        law&apos;s mandatory annual impact assessments and doesn&apos;t
        require a formal risk-management program — but it does require
        three years of records and a meaningful human-review process,
        which together functionally demand one. This is not a static
        document — it is a living program that evolves as your AI usage
        changes and regulatory expectations sharpen.
      </P>

      <Callout title="Why voluntary documentation still matters">
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
          <Strong>Evidence-based</Strong> — every assessment is conducted
          against published pass/fail controls with documented evidence,
          not a rubber-stamp badge from a software tool
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
