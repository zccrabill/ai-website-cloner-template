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
 * Is the Colorado AI Act in effect? The July 2026 status check.
 *
 * Editorial notes:
 * - Primary keyword targets: "is the Colorado AI Act in effect", "Colorado AI
 *   Act effective date", "Colorado AI Act enforcement", "SB 24-205 in effect",
 *   "Colorado AI Act 2026 status", "xAI v Weiser".
 * - News-adjacent post pegged to the June 30, 2026 effective date. Question-form
 *   title + FAQ block for AI Overviews. Links up to the evergreen pillar
 *   (colorado-ai-act-2026) and across to the rulemaking + hiring posts.
 * - All timeline facts must stay consistent with the verified SB 26-189 record:
 *   old act (SB 24-205) on the books June 30 → Dec 31, 2026 with enforcement
 *   paused by the xAI v. Weiser stipulation; SB 26-189 governs from Jan 1, 2027.
 */
export default function ColoradoAiActInEffect2026Article() {
  return (
    <>
      <Lead>
        As of June 30, 2026, the original Colorado AI Act — SB 24-205, the 2024
        law everyone spent two years arguing about — is officially on the books.
        And almost nothing happened, because enforcement is paused by a federal
        court order while its replacement waits in the wings. Here is the honest
        July 2026 status check: what is technically in effect, what is actually
        being enforced, and what a Colorado business should do about the gap.
      </Lead>

      <H2>The short answer</H2>

      <P>
        Yes, the Colorado AI Act is technically in effect. No, it is not being
        enforced right now. And no, that is not a reason to ignore it — because
        the law that will be enforced, SB 26-189, arrives on January 1, 2027,
        and the habits it requires take longer than a holiday weekend to build.
      </P>

      <H2>What actually happened on June 30</H2>

      <P>
        SB 24-205 — the Consumer Protections for Artificial Intelligence Act,
        passed back in 2024 — was originally supposed to take effect February 1,
        2026. An August 2025 special session pushed that to June 30, 2026. Then,
        in May 2026, the legislature passed{" "}
        <InlineLink href="https://leg.colorado.gov/bills/sb26-189">
          SB 26-189
        </InlineLink>
        , a full repeal-and-replace — but wrote both the new framework and the
        repeal to take effect January 1, 2027, and did not cancel the June 30
        date.
      </P>

      <P>
        The result is a six-month interim window, June 30 through December 31,
        2026, in which the <Strong>old</Strong> act is the statute on Colorado&apos;s
        books. That is the window we are in right now.
      </P>

      <H2>Why nobody is being enforced against</H2>

      <P>
        In April 2026, xAI sued the Colorado Attorney General in federal court
        (<em>xAI v. Weiser</em>, D. Colo.), arguing the act is unconstitutional,
        and the U.S. Department of Justice intervened on xAI&apos;s side. Before
        the effective date ever arrived, the parties agreed — and the court
        ordered — that the state will not enforce or investigate under the act
        while xAI&apos;s challenge is pending. The order even protects alleged
        violations occurring up to fourteen days after the court eventually
        rules on a preliminary injunction, and the state has said the pause
        extends to any legislation replacing or amending SB 24-205.
      </P>

      <P>
        So the practical picture in July 2026: a law is in effect, and the only
        entity with authority to enforce it — the Attorney General has exclusive
        enforcement power; there is no private right of action — has agreed in
        court not to.
      </P>

      <Callout title="Paused is not repealed">
        <P>
          The enforcement pause is a litigation posture, not a policy decision.
          It exists because of a stipulation in a live federal case, and it can
          end on roughly two weeks&apos; runway once the court rules. Treat the
          pause as time to prepare, not permission to forget.
        </P>
      </Callout>

      <H2>One trap worth knowing about the old act</H2>

      <P>
        The interim statute is broader in at least one way that matters: SB
        24-205 lists <Strong>legal services</Strong> as a consequential-decision
        category, alongside employment, housing, lending, insurance, healthcare,
        education, and government services. SB 26-189 drops legal services from
        the list. So for the rest of 2026, the law on the books technically
        reaches more industries than the law that takes over in January. With
        enforcement paused this is mostly a paper distinction — but it is why
        &ldquo;which version are we talking about?&rdquo; is always the first
        question when someone tells you what the Colorado AI Act requires.
      </P>

      <H2>What governs from January 1, 2027</H2>

      <P>
        SB 26-189 — the Automated Decision-Making Technology Act — repeals the
        old law and applies to consequential decisions made on or after January
        1, 2027. If your business deploys covered ADMT (AI that materially
        influences a consequential decision about a person in education,
        employment, housing, lending or financial services, insurance,
        healthcare, or essential government services), you owe five things:
      </P>

      <UL>
        <LI>
          <Strong>A clear and conspicuous pre-use notice</Strong> telling people
          AI is involved in the decision, before it is used.
        </LI>
        <LI>
          <Strong>A 30-day adverse-outcome notice</Strong> when the technology
          contributes to a decision that goes against someone.
        </LI>
        <LI>
          <Strong>Meaningful human review</Strong> of adverse outcomes, where
          commercially reasonable.
        </LI>
        <LI>
          <Strong>Data access and correction</Strong> — a way for consumers to
          see and fix the personal data the system used.
        </LI>
        <LI>
          <Strong>Three years of records</Strong> documenting the above.
        </LI>
      </UL>

      <P>
        The Attorney General enforces exclusively, with a 60-day cure period for
        most violations (that grace period sunsets January 1, 2030). For the
        full plain-language walkthrough, see our{" "}
        <InlineLink href="/blog/colorado-ai-act-2026">
          guide to the Colorado AI Act
        </InlineLink>{" "}
        and the story of{" "}
        <InlineLink href="/blog/colorado-ai-act-rewrite-2026-smb-impact">
          how the rewrite happened
        </InlineLink>
        .
      </P>

      <H2>What to actually do during the pause</H2>

      <UL>
        <LI>
          <Strong>Find out if you are covered.</Strong> Most small businesses
          are not deployers of covered ADMT; some are without realizing it —
          usually through hiring software. The free{" "}
          <InlineLink href="/ai-act-checker">AI Act readiness checker</InlineLink>{" "}
          answers this in a few minutes.
        </LI>
        <LI>
          <Strong>Build to the 2027 law, not the paused one.</Strong> The five
          duties above are the compliance target worth investing in. If you use
          AI in hiring, start with{" "}
          <InlineLink href="/blog/ai-hiring-tools-colorado-law">
            our breakdown of AI hiring tools under Colorado law
          </InlineLink>
          .
        </LI>
        <LI>
          <Strong>Weigh in on the rules while you still can.</Strong> The
          Attorney General opened public comment on the implementing rules on
          June 23, and the window closes July 13.{" "}
          <InlineLink href="/blog/colorado-ai-rules-public-comment-2026">
            Here is how to submit a comment that matters
          </InlineLink>
          .
        </LI>
        <LI>
          <Strong>Watch the case.</Strong> If <em>xAI v. Weiser</em> resolves,
          the interim posture changes on short notice. (We watch it so our
          clients do not have to.)
        </LI>
      </UL>

      <H2>Frequently asked questions</H2>

      <H3>Is the Colorado AI Act in effect right now?</H3>
      <P>
        Technically yes — the original act (SB 24-205) took effect June 30,
        2026. But enforcement is suspended by a federal court order in{" "}
        <em>xAI v. Weiser</em>, and the act will be repealed and replaced by SB
        26-189 on January 1, 2027.
      </P>

      <H3>Can my business be fined under the Colorado AI Act in 2026?</H3>
      <P>
        Not while the enforcement pause holds. The Attorney General — the only
        party who can enforce the act — has agreed in court not to enforce or
        investigate while xAI&apos;s constitutional challenge is pending, with a
        14-day protective buffer after the court rules. There is no private
        right of action.
      </P>

      <H3>Should I just wait until 2027 to think about this?</H3>
      <P>
        No. The SB 26-189 duties — pre-use notice, adverse-outcome notice, human
        review, data access, and recordkeeping — apply to decisions made on or
        after January 1, 2027, and they require an inventory, vendor
        conversations, and process changes that take months, not days. The pause
        is preparation time.
      </P>

      <H3>What is the difference between SB 24-205 and SB 26-189?</H3>
      <P>
        SB 24-205 (2024) was a broad algorithmic-discrimination law with risk
        management, impact assessment, and bias-audit style duties. SB 26-189
        (2026) replaces it with a narrower disclosure-and-human-review
        framework aimed at automated decision-making technology, drops the
        legal-services category, and takes effect January 1, 2027.
      </P>

      <H2>The bottom line</H2>

      <P>
        June 30 came and went without sirens because the courts froze the old
        law before it could bite. The date that should be on your calendar is
        January 1, 2027 — and the cheapest way to meet it is to start now, while
        the regulator is writing rules instead of writing citations.
      </P>

      <P>
        Run the free{" "}
        <InlineLink href="/ai-act-checker">AI Act readiness checker</InlineLink>{" "}
        to see if you are covered, or{" "}
        <InlineLink href="/#pricing">
          put a Colorado attorney in your corner
        </InlineLink>{" "}
        for a flat monthly rate.
      </P>

      <LegalDisclaimer />
    </>
  );
}
