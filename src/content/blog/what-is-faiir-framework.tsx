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
  Blockquote,
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
 */
export default function WhatIsFaiirFrameworkArticle() {
  return (
    <>
      <Lead>
        FAIIR stands for <Strong>Fairness, Accountability,
        Impact&nbsp;assessment, Informed&nbsp;consent,</Strong> and{" "}
        <Strong>Risk&nbsp;management</Strong>. It is the compliance
        framework we built at Available Law to help Colorado businesses
        meet the requirements of the Colorado AI Act — without drowning in
        legalese or six-figure consulting engagements.
      </Lead>

      <P>
        The Colorado AI Act creates obligations for businesses that deploy
        &ldquo;high-risk AI systems&rdquo; — AI that influences
        consequential decisions about consumers. But the Act itself does
        not hand you a checklist. It tells you what outcomes to achieve
        (reasonable care, bias mitigation, documentation, consumer notice)
        without prescribing how to get there. FAIIR fills that gap.
      </P>

      <H2>The five pillars</H2>

      <H3>F — Fairness</H3>
      <P>
        Fairness is the foundation. The Act requires deployers to evaluate
        whether their AI systems produce discriminatory outcomes based on
        protected characteristics. FAIIR operationalizes this with a
        structured bias audit: we identify the decision categories your AI
        touches, map the protected classes at risk, and test for
        disparate impact using the data you actually have. The output is a
        documented fairness analysis you can hand to regulators, not a
        vague promise that your vendor &ldquo;tested for bias.&rdquo;
      </P>

      <H3>A — Accountability</H3>
      <P>
        Accountability means someone in your organization owns AI
        compliance — and can prove it. FAIIR establishes a clear chain of
        responsibility: who approved the AI system, who monitors its
        performance, who reviews consumer complaints, and who has authority
        to shut it down. This maps directly to the Act&apos;s requirement
        that deployers implement a{" "}
        <Strong>risk management policy and program</Strong>.
      </P>

      <H3>I — Impact assessment</H3>
      <P>
        Before you deploy (or continue deploying) a high-risk AI system,
        you need to assess the impact it has on consumers. FAIIR walks you
        through a structured impact assessment that documents the purpose
        of the system, the categories of decisions it influences, the data
        it ingests, the populations it affects, and the potential for harm.
        This is the document the Attorney General&apos;s office will ask
        for first.
      </P>

      <Callout title="Why impact assessments matter now">
        <P>
          Many businesses assume they can backfill documentation after an
          inquiry. They cannot. The Act expects impact assessments to be
          completed <Strong>before or at the time of deployment</Strong>,
          not retroactively constructed after a complaint. If you are
          already using AI systems and have not completed an assessment,
          the time to start is now.
        </P>
      </Callout>

      <H3>I — Informed consent</H3>
      <P>
        The Act requires deployers to notify consumers when AI is being
        used to make consequential decisions about them — and to give them
        enough information to understand and contest those decisions. FAIIR
        includes notice templates, disclosure language, and opt-out
        procedures calibrated to the specific AI systems you use. Generic
        privacy policy language is not sufficient.
      </P>

      <H3>R — Risk management</H3>
      <P>
        Risk management ties everything together. FAIIR produces a
        documented risk management program that covers ongoing monitoring,
        incident response, employee training, vendor oversight, and
        periodic re-assessment. This is not a static document — it is a
        living program that evolves as your AI usage changes and regulatory
        expectations sharpen.
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
          <Strong>Readiness assessment</Strong> — We audit your AI
          inventory, vendor contracts, employee training, consumer notices,
          and documentation against each of the five FAIIR pillars. You get
          a scored report that tells you exactly where you stand and what
          needs to change.
        </LI>
        <LI>
          <Strong>Remediation plan</Strong> — We build a prioritized action
          plan: what to fix now, what to fix next quarter, and what can
          wait. Every item maps to a specific statutory requirement so
          you can see why it matters.
        </LI>
        <LI>
          <Strong>Implementation support</Strong> — We help you execute.
          That might mean drafting consumer notices, negotiating vendor
          contract amendments, building training materials, or writing
          internal governance policies. We do the legal work; you focus on
          running your business.
        </LI>
        <LI>
          <Strong>Ongoing membership</Strong> — After the initial
          assessment, our{" "}
          <InlineLink href="/faiir">FAIIR Compliance Membership</InlineLink>{" "}
          keeps you current with quarterly policy reviews, regulatory
          update briefings, on-call attorney Q&amp;A, and refreshed risk
          documentation.
        </LI>
      </OL>

      <H2>Who needs FAIIR?</H2>

      <P>
        Not every business needs a full compliance program. The Colorado
        AI Act targets <Strong>high-risk AI systems</Strong> — those that
        make or substantially contribute to consequential decisions. If
        your AI usage is limited to internal productivity tools (scheduling,
        spell-check, code completion), you are likely outside the scope.
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
        Not sure whether your AI systems qualify as high-risk? Our free{" "}
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
          statutory language of the Colorado AI Act, not generalized across
          fifty jurisdictions
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
        The Colorado AI Act takes effect February 1, 2026, and enforcement
        discretion will not last forever. If your business deploys AI
        systems that touch consumer decisions, the cost of compliance now
        is a fraction of the cost of an enforcement action later. Start
        with a{" "}
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
