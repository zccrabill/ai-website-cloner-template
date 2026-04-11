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
 * Documenting AI decision-making for compliance — the practical guide.
 *
 * Editorial notes:
 * - Primary keyword targets: "document AI decisions", "AI compliance
 *   documentation", "AI decision log", "Colorado AI Act documentation",
 *   "AI audit trail".
 * - Written for operators: the person who actually has to stand up the
 *   logging and retention system, not the attorney who signed off on the
 *   policy.
 * - Cross-linked to the Colorado AI Act explainer and vendor contracts
 *   article so readers have the full trio.
 */
export default function DocumentAiDecisionMakingArticle() {
  return (
    <>
      <Lead>
        The single most common compliance gap we see at Available Law is not a
        missing policy or a bad contract — it is the absence of any real
        record of what the business&apos;s AI tools actually did. Documentation
        is the quiet half of AI compliance. It is also the half that determines
        whether a regulator, auditor, or plaintiff&apos;s lawyer walks away
        satisfied or starts asking harder questions.
      </Lead>

      <P>
        This article is the practical guide to building an AI decision-making
        paper trail that will hold up under scrutiny — without drowning your
        team in process. It is written for the person who is going to have to
        actually implement the logging and retention, not just approve the
        policy.
      </P>

      <H2>Why documentation is the load-bearing beam</H2>

      <P>
        The Colorado AI Act, like most emerging AI regulation, imposes duties
        that are difficult to prove you met without a paper trail. You have to
        demonstrate reasonable care. You have to show you ran impact
        assessments. You have to prove the human review process actually
        happened when a consumer asked for it. You have to be able to explain,
        after the fact, why a specific decision was made.
      </P>

      <P>
        Documentation is how you do all of those things. It is the difference
        between &ldquo;we have a governance program&rdquo; and &ldquo;here is
        the governance program, here is the date it was adopted, here are the
        assessments we ran, here are the decisions we logged, and here is the
        incident report from the one time something went wrong.&rdquo; One of
        those is a defense. The other is a hope.
      </P>

      <Callout title="The regulator&apos;s first question">
        <P>
          In every AI compliance enforcement action we have studied — federal,
          state, and in the EU — the first question the investigator asks is
          some version of &ldquo;show us your records.&rdquo; If the records
          exist and are contemporaneous and honest, the posture of the
          investigation changes immediately. If they do not exist, everything
          that follows is downhill.
        </P>
      </Callout>

      <H2>What you actually need to document</H2>

      <P>
        There are seven categories of documentation every deployer of
        high-risk AI should maintain. They map loosely to the seven duties in
        the Colorado AI Act, but they also reflect what a reasonable business
        would want for its own risk management — regardless of the statute.
      </P>

      <H3>1. The AI inventory</H3>
      <P>
        A written list of every AI system your business uses, including
        third-party tools. For each entry, record the vendor, the product name
        and version, the business function it serves, the decisions it
        influences, the categories of data it touches, the department that
        owns it, and the date it was added. An inventory is the backbone that
        everything else hangs off of — if a system is not in the inventory,
        no one is auditing it, documenting it, or monitoring it.
      </P>

      <H3>2. Impact assessments</H3>
      <P>
        For each high-risk AI system, a written impact assessment that
        describes the system, the data it uses, the decisions it influences,
        the foreseeable harms, the mitigations in place, and the residual risk.
        These have to be dated and signed. They have to be updated at least
        annually and any time the system is meaningfully changed. The common
        failure mode is treating an impact assessment as a one-time intake
        form rather than a living document.
      </P>

      <H3>3. Decision logs</H3>
      <P>
        For every consequential decision the system influences, a log entry
        that captures what the system considered and what it produced. You do
        not have to store every intermediate neural network activation — you
        have to be able to reconstruct, after the fact, what inputs the system
        saw and what output it produced. At a minimum: timestamp, system
        version, a reference to the inputs, the output, and a reference to
        whatever downstream action the business took as a result.
      </P>

      <H3>4. Human review records</H3>
      <P>
        When a consumer asks for human review of an adverse decision, the
        request, the review, the reviewer, the outcome, and any data
        corrections have to be logged. This is one of the most visible
        surfaces of your compliance program because it is consumer-facing — if
        a complaint eventually lands at the Attorney General&apos;s office, the
        human review log is often the first artifact requested.
      </P>

      <H3>5. Bias audits and fairness testing</H3>
      <P>
        Any testing you run — whether on your own or through the vendor —
        should be logged with the date, scope, methodology, results, and
        remediation actions. If you rely on the vendor&apos;s bias audits,
        keep copies of the vendor&apos;s reports and note when you received
        them. If you ran your own disparate-impact testing, keep the raw data,
        the analysis, and the written conclusions.
      </P>

      <H3>6. Vendor attestations and contract artifacts</H3>
      <P>
        Vendor data sheets, model cards, DPAs, SOC 2 reports, indemnification
        confirmations, and any written commitments the vendor has made about
        training data, opt-outs, or bias testing. When a regulator asks how
        you diligenced a vendor, these are the documents you point to. For
        more on what to negotiate into these contracts,{" "}
        <InlineLink href="/blog/5-ai-vendor-contract-clauses">
          see our guide on the five AI vendor contract clauses every business
          should pay attention to
        </InlineLink>
        .
      </P>

      <H3>7. Incident reports</H3>
      <P>
        When something goes wrong — a harmful output, a disparate impact
        finding, a data exposure, a vendor compromise — you open an incident
        record. It captures what happened, when it was detected, who was
        notified, what the triage looked like, what remediation was performed,
        and when the incident was closed. If the statute requires notification
        to the Attorney General or to affected consumers, the notification
        artifacts attach to this record.
      </P>

      <H2>How to actually build the logging system</H2>

      <P>
        You do not need a purpose-built AI governance platform. Most small
        businesses can stand up a perfectly adequate documentation system with
        tools they already have. What matters is the structure, not the
        software.
      </P>

      <H3>Pick a single source of truth</H3>
      <P>
        Everything above should live in one place. A shared drive with a
        well-structured folder tree is fine. A Notion or Confluence workspace
        is fine. A GRC tool is fine. What is not fine is having the inventory
        in one place, the impact assessments in another, the decision logs in
        a third, and the incident reports scattered across Slack. Fragmented
        documentation is the most common way we see compliance programs fail
        under scrutiny.
      </P>

      <H3>Make logging automatic wherever you can</H3>
      <P>
        The single biggest predictor of whether a logging system survives its
        first year is whether the logging is automatic or manual. Decision
        logs, in particular, should be captured by the system itself — not
        typed in by a human after the fact. If your AI vendor does not give
        you a way to pull logs, that is a red flag and a negotiation point at
        renewal. For internal systems, build logging into the code path that
        calls the model, not as a separate step.
      </P>

      <H3>Set retention periods in writing</H3>
      <P>
        Documentation is only useful if it exists for as long as you might
        need it. For most of the artifacts above, a reasonable default is the
        longer of the applicable statute of limitations for the underlying
        claim or the regulator&apos;s explicit retention requirement. For
        consequential decisions in employment, credit, housing, and
        healthcare, four to six years is a typical floor. Write the retention
        schedule down, apply it consistently, and do not delete early just to
        save storage.
      </P>

      <Callout title="Retention is not the same as access">
        <P>
          Long retention periods do not mean everyone in the company should
          be able to read the records. Decision logs often contain sensitive
          personal data, and you should lock them down accordingly — access
          should be limited to the people who need it for compliance,
          investigations, or audit response. Document who has access and
          review it at least annually.
        </P>
      </Callout>

      <H3>Appoint a human owner</H3>
      <P>
        Every artifact category needs a named owner. The inventory might be
        owned by the operations lead. The impact assessments might be owned
        by the compliance officer or fractional general counsel. The decision
        logs might be owned by the engineering manager responsible for the
        system. The point is not to create bureaucracy — it is to make sure
        that when something needs updating, a specific person&apos;s name is
        on the hook. Systems without owners decay.
      </P>

      <H2>What a minimum viable paper trail looks like</H2>

      <P>
        If you are starting from zero and you want to know what the smallest
        defensible version of this looks like for a Colorado small business,
        here is our current working answer:
      </P>

      <OL>
        <LI>
          A <Strong>one-page AI inventory</Strong> listing every tool, owner,
          and whether it is classified as high-risk under the Colorado AI Act.
        </LI>
        <LI>
          A <Strong>two-to-three-page impact assessment</Strong> for each
          high-risk system, using a consistent template, dated and signed.
        </LI>
        <LI>
          An <Strong>automatic decision log</Strong> for each high-risk system
          capturing timestamp, system version, a reference to inputs, and the
          output. Retained for at least four years.
        </LI>
        <LI>
          A <Strong>human review workflow</Strong> with a defined response
          time, a template for consumer-facing explanations, and a log that
          captures each request and its resolution.
        </LI>
        <LI>
          A <Strong>vendor file</Strong> for each AI vendor holding the DPA,
          the relevant contract sections, any bias audit summaries the vendor
          has shared, and the date of the last review.
        </LI>
        <LI>
          An <Strong>incident response runbook</Strong>, even if it is a one
          page document, naming the triage lead, escalation contacts, and
          notification obligations.
        </LI>
        <LI>
          A <Strong>written risk management policy</Strong> that references
          all of the above and is signed by an owner.
        </LI>
      </OL>

      <P>
        If all seven of those exist, are current, and are actually used, you
        have a defensible compliance posture. You do not need a consultant, a
        platform, or a committee. You need the seven artifacts, honestly
        maintained.
      </P>

      <H2>Common failure modes to avoid</H2>

      <UL>
        <LI>
          <Strong>Drafting without adopting.</Strong> A policy or assessment
          that lives in a draft folder and has never been formally adopted by
          the business is not documentation — it is a writing sample. Adoption
          needs a date, a signer, and a place it lives.
        </LI>
        <LI>
          <Strong>One-time assessments.</Strong> An impact assessment you wrote
          in 2026 and never touched again will be worse than useless in 2028.
          Annual review, with the date of review on the document itself, is
          the minimum.
        </LI>
        <LI>
          <Strong>Copy-paste boilerplate.</Strong> Templates are fine as a
          starting point but the content has to reflect your actual systems.
          A regulator who reads three impact assessments and sees identical
          risk language is going to get suspicious.
        </LI>
        <LI>
          <Strong>Logging without retention.</Strong> Capturing decision logs
          and deleting them after 30 days to save storage defeats the purpose.
          Set the retention period before you turn the logging on.
        </LI>
        <LI>
          <Strong>Hiding incidents.</Strong> An incident that is not documented
          because no one wants it on the record is the worst possible
          combination — the harm still happened, but now there is no paper
          trail showing you responded to it. Honest incident records, even
          embarrassing ones, are an asset in an enforcement action.
        </LI>
      </UL>

      <H2>How this fits with the rest of your compliance program</H2>

      <P>
        Documentation is not a freestanding workstream. It works because it
        connects everything else: the statute (which creates the duties), the
        vendor contracts (which allocate the risk), and the operations team
        (who actually runs the systems). If you have not yet read our{" "}
        <InlineLink href="/blog/colorado-ai-act-2026">
          plain-language walkthrough of the Colorado AI Act
        </InlineLink>{" "}
        or our guide to{" "}
        <InlineLink href="/blog/5-ai-vendor-contract-clauses">
          AI vendor contract clauses
        </InlineLink>
        , those are the other two legs of the same stool. Documentation is
        how the duties and the contracts become something you can actually
        defend.
      </P>

      <P>
        Available Law builds and maintains this documentation system for
        clients as part of{" "}
        <InlineLink href="/faiir">FAIIR certification</InlineLink>. If you
        want a fast readout of which of the seven artifacts you have today
        and which ones you are missing, our{" "}
        <InlineLink href="/ai-act-checker">
          free Colorado AI Act Readiness Checker
        </InlineLink>{" "}
        will walk you through the gap in about two minutes.
      </P>

      <LegalDisclaimer />
    </>
  );
}
