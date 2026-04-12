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
 * AI employee training requirements under the Colorado AI Act.
 *
 * Editorial notes:
 * - Primary keyword targets: "AI training requirements Colorado",
 *   "employee AI training compliance", "Colorado AI Act training",
 *   "AI workforce training", "AI literacy requirements".
 * - Written for business owners and HR leaders who need to figure out
 *   what training they actually owe employees under the new law.
 * - Each section covers a specific obligation, then gives a practical
 *   step the reader can take immediately.
 */
export default function AiEmployeeTrainingRequirementsArticle() {
  return (
    <>
      <Lead>
        The Colorado AI Act doesn&apos;t just regulate the AI itself — it
        regulates the people who use it. If your employees interact with
        high-risk AI systems, you are required to train them. Here is what
        the law actually requires and how to build a training program that
        satisfies the statute without grinding your operations to a halt.
      </Lead>

      <P>
        Most businesses that deploy AI tools focus on the technology: model
        selection, vendor due diligence, data governance. Those matter. But
        the Colorado AI Act also imposes obligations on the humans in the
        loop — the employees who use AI outputs to make or inform decisions
        about consumers. If those employees are not properly trained, your
        business is exposed even if the underlying AI system is perfectly
        compliant.
      </P>

      <H2>Who needs to be trained?</H2>

      <P>
        The Act applies to <Strong>deployers</Strong> of high-risk AI
        systems — businesses that use AI to make &ldquo;consequential
        decisions&rdquo; about consumers in areas like employment, lending,
        insurance, housing, education, and access to essential services. If
        your business fits that description, every employee who interacts
        with the AI system or its outputs needs training. That includes
        people who:
      </P>

      <UL>
        <LI>
          Directly operate or configure the AI system (data entry, prompt
          engineering, threshold adjustments)
        </LI>
        <LI>
          Review, approve, or override AI-generated recommendations before
          they reach consumers
        </LI>
        <LI>
          Communicate AI-driven decisions to consumers (customer service
          reps, loan officers, claims adjusters)
        </LI>
        <LI>
          Manage or supervise teams that do any of the above
        </LI>
      </UL>

      <Callout title="Practical tip">
        <P>
          Start by mapping your AI systems to the roles that touch them.
          Most businesses overestimate how many employees need training
          because they conflate &ldquo;uses a computer&rdquo; with
          &ldquo;interacts with an AI system.&rdquo; A spreadsheet that
          lists each AI tool, the decisions it influences, and the employees
          in the chain is the fastest way to scope your training obligation.
        </P>
      </Callout>

      <H2>What does the training need to cover?</H2>

      <P>
        The statute does not prescribe a specific curriculum, but it does
        require that employees have sufficient knowledge to:
      </P>

      <OL>
        <LI>
          <Strong>Understand the AI system&apos;s intended use</Strong> —
          what the system does, what inputs it considers, and what kind of
          output or recommendation it generates.
        </LI>
        <LI>
          <Strong>Recognize the system&apos;s limitations</Strong> — known
          biases, accuracy rates, categories of errors, edge cases where the
          system performs poorly.
        </LI>
        <LI>
          <Strong>Exercise meaningful human oversight</Strong> — how to
          review AI outputs critically, when to override or escalate, and
          what documentation to create when they do.
        </LI>
        <LI>
          <Strong>Follow your organization&apos;s AI governance
          policies</Strong> — internal escalation paths, logging
          requirements, and consumer disclosure obligations.
        </LI>
      </OL>

      <P>
        In practice, this means your training program needs to be specific
        to each AI system, not a generic &ldquo;AI 101&rdquo; slide deck.
        An employee who reviews AI-scored loan applications needs different
        training than someone who uses an AI chatbot to triage customer
        support tickets.
      </P>

      <H2>How often do you need to retrain?</H2>

      <P>
        The Act requires &ldquo;reasonable&rdquo; ongoing training — not a
        one-and-done onboarding session. While the statute does not specify
        a cadence, regulators and courts will look at whether your training
        kept pace with changes to the AI system. At minimum, retrain when:
      </P>

      <UL>
        <LI>
          The AI vendor pushes a significant model update or version change
        </LI>
        <LI>
          Your business changes how it uses the AI system (new decision
          categories, new consumer populations)
        </LI>
        <LI>
          An audit, complaint, or incident reveals a gap in employee
          understanding
        </LI>
        <LI>
          Regulatory guidance or enforcement actions clarify new expectations
        </LI>
      </UL>

      <Callout title="Document everything">
        <P>
          The single most important thing you can do is keep records. Log
          who was trained, on what system, what material was covered, and
          when. If the Attorney General&apos;s office investigates, the
          first thing they will ask for is your training documentation.
          A signed attestation from each employee after each session is a
          low-effort, high-value defense.
        </P>
      </Callout>

      <H2>Building a practical training program</H2>

      <H3>Step 1: Inventory your AI systems</H3>
      <P>
        List every AI system your business deploys that touches consumer
        decisions. For each one, document what it does, what data it uses,
        and which employees interact with it. This is also the foundation
        of your{" "}
        <InlineLink href="/blog/document-ai-decision-making">
          AI decision documentation
        </InlineLink>{" "}
        obligations.
      </P>

      <H3>Step 2: Create system-specific training materials</H3>
      <P>
        For each AI system, draft a training module that covers the four
        elements above: intended use, limitations, oversight procedures,
        and internal governance policies. Keep it short and practical.
        Employees retain more from a 20-minute hands-on walkthrough than
        a 90-minute compliance lecture.
      </P>

      <H3>Step 3: Assign and track completion</H3>
      <P>
        Use whatever LMS or tracking system you already have. If you
        don&apos;t have one, a shared spreadsheet works — what matters is
        that you can prove, for any given employee on any given date,
        whether they had been trained on the AI system they were using.
      </P>

      <H3>Step 4: Schedule refreshers</H3>
      <P>
        Set calendar reminders to review your training materials quarterly.
        Most updates will be minor. But when your AI vendor ships a major
        model change, you need to update your materials and retrain affected
        employees before they start using the new version.
      </P>

      <H2>What happens if you don&apos;t train?</H2>

      <P>
        The Colorado AI Act gives the Attorney General enforcement
        authority. A failure to train employees is evidence that your
        business did not exercise &ldquo;reasonable care&rdquo; in
        deploying the AI system — which is the core standard the Act uses
        to determine liability. In practice, inadequate training is often
        the easiest thing for regulators to prove because it shows up (or
        doesn&apos;t) in your documentation.
      </P>

      <P>
        Beyond enforcement, untrained employees are a business risk
        independent of the statute. An employee who doesn&apos;t understand
        an AI system&apos;s limitations is more likely to rubber-stamp a
        bad recommendation, creating liability under existing consumer
        protection, employment, and lending laws — not just the AI Act.
      </P>

      <H2>Get compliant before enforcement begins</H2>

      <P>
        The good news: building a training program is one of the most
        straightforward compliance obligations under the Act. It does not
        require expensive technology or outside consultants. It requires
        organizational discipline — mapping your AI systems, writing clear
        materials, and tracking completion. Our{" "}
        <InlineLink href="/faiir">FAIIR compliance framework</InlineLink>{" "}
        includes training program templates and documentation checklists
        designed specifically for Colorado businesses deploying AI.
      </P>

      <LegalDisclaimer />
    </>
  );
}
