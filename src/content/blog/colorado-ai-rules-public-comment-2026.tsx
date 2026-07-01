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
 * Colorado's AI rulemaking — the July 13 public comment window.
 *
 * Editorial notes:
 * - Primary keyword targets: "Colorado AI rulemaking", "Colorado ADMT rules",
 *   "materially influence Colorado AI Act", "Colorado attorney general AI
 *   rules", "Colorado AI Act public comment", "SB 26-189 rules".
 * - Deadline-driven post (comments close July 13, 2026) with lasting SEO value:
 *   the "materially influence" section answers a durable definitional query
 *   that will keep getting searched after the window closes.
 * - Facts: AG pre-rulemaking opened June 23, 2026; comments through July 13
 *   via coag.gov/ai; final rules due Jan 1, 2027; covers both the ADMT Act
 *   (SB 26-189) and the Chatbot Safety Act (HB 26-1263); xAI must renew its
 *   PI motion within 28 days after final rules or replacement legislation.
 */
export default function ColoradoAiRulesPublicComment2026Article() {
  return (
    <>
      <Lead>
        The Colorado AI Act you will actually have to comply with is being
        written right now — not in the legislature, but in the Attorney
        General&apos;s rulemaking. On June 23, 2026, the AG&apos;s office opened
        a public comment period on the rules that will implement both the new
        ADMT Act and the new Chatbot Safety Act, and comments are due July 13.
        Here is what is at stake, why small business voices are usually missing
        from this process, and how to submit a comment that actually gets read.
      </Lead>

      <H2>Wait — didn&apos;t the legislature already write the law?</H2>

      <P>
        It wrote the skeleton.{" "}
        <InlineLink href="https://leg.colorado.gov/bills/sb26-189">
          SB 26-189
        </InlineLink>{" "}
        says deployers of AI that &ldquo;materially influences&rdquo; a
        consequential decision owe notices, human review, and records. But the
        statute deliberately hands the hard definitional work to the Colorado
        Attorney General, who must adopt implementing rules by January 1, 2027 —
        the same day the law takes effect. Those rules will decide questions
        like:
      </P>

      <UL>
        <LI>
          <Strong>What &ldquo;materially influence&rdquo; means.</Strong> This
          is the whole ballgame. A narrow definition means only AI that
          effectively makes the decision is covered; a broad one could sweep in
          any tool that scores, ranks, or flags. Whether your résumé screener,
          underwriting assistant, or tenant-scoring tool is covered ADMT will
          largely be decided here, including through presumptions and worked
          examples the AG is directed to provide.
        </LI>
        <LI>
          <Strong>What the adverse-outcome notice must contain.</Strong> The
          statute requires a notice within 30 days when covered ADMT contributes
          to a decision against someone. The rules will spell out what that
          notice says, sector by sector, and how it interacts with existing
          notice laws (like adverse-action notices in lending and hiring).
        </LI>
        <LI>
          <Strong>How the Chatbot Safety Act works in practice.</Strong> The
          same rulemaking covers{" "}
          <InlineLink href="/blog/colorado-chatbot-law-hb26-1263">
            HB 26-1263, Colorado&apos;s new chatbot law
          </InlineLink>{" "}
          — including what counts as reasonable age estimation and what the
          annual reports to the AG must include.
        </LI>
      </UL>

      <H2>The timeline</H2>

      <UL>
        <LI>
          <Strong>June 23, 2026</Strong> — the AG&apos;s office opened
          pre-rulemaking and began accepting written public comments through an
          online form at{" "}
          <InlineLink href="https://coag.gov/ai/">coag.gov/ai</InlineLink>.
        </LI>
        <LI>
          <Strong>July 13, 2026</Strong> — the current comment window closes.
        </LI>
        <LI>
          <Strong>Later in 2026</Strong> — formal rulemaking follows, which by
          statute must include public notice, written comment, and at least one
          public hearing. More chances to weigh in, but the early input shapes
          the draft everyone reacts to.
        </LI>
        <LI>
          <Strong>January 1, 2027</Strong> — final rules due; the ADMT Act and
          the chatbot duties take effect.
        </LI>
      </UL>

      <P>
        There is a second reason these rules matter: the federal court in{" "}
        <em>xAI v. Weiser</em> — the case that has{" "}
        <InlineLink href="/blog/colorado-ai-act-in-effect-2026">
          enforcement of Colorado&apos;s AI law paused
        </InlineLink>{" "}
        — set the final rules as a trigger. Once the AG issues them (or the
        legislature replaces the law again), xAI has 28 days to renew its
        constitutional challenge. The rules will not just define your
        obligations; they will restart the fight over whether the law survives.
      </P>

      <H2>Why your comment matters more than you think</H2>

      <P>
        Rulemaking comment files are dominated by two groups: large companies
        with regulatory counsel, and advocacy organizations. The businesses that
        will feel these rules most acutely — the 12-person company whose hiring
        software quietly ranks applicants, the lender whose loan-origination
        system has an AI module it never asked for — are almost never in the
        record. Regulators write rules against the fact patterns they are shown.
        If small business fact patterns are not in the file, the rules will be
        calibrated to enterprises, and the compliance burden will be too.
      </P>

      <Callout title="You do not need a lawyer to comment">
        <P>
          A public comment is not a legal brief. It is a letter. The AG&apos;s
          office is asking, in effect, &ldquo;how would these rules land in the
          real world?&rdquo; — and a specific, concrete answer from an actual
          Colorado business is exactly what the process is starved for.
        </P>
      </Callout>

      <H2>How to write a comment that gets used</H2>

      <OL>
        <LI>
          <Strong>Say who you are and what you run.</Strong> Industry, headcount,
          and the AI tools you actually use. Specificity is credibility.
        </LI>
        <LI>
          <Strong>Describe one real workflow.</Strong> &ldquo;Our applicant
          tracking system scores résumés before a human sees them; a human makes
          every final call&rdquo; is worth more than ten paragraphs of opinion.
          Then say what you need to know: does that score &ldquo;materially
          influence&rdquo; the decision?
        </LI>
        <LI>
          <Strong>Ask for examples and presumptions.</Strong> The statute
          directs the AG to consider illustrative examples. Ask for ones at
          small-business scale — not just the Fortune 500 hiring pipeline.
        </LI>
        <LI>
          <Strong>Flag double-notice problems.</Strong> If you already send
          adverse-action notices under lending or employment law, ask the AG to
          harmonize the new 30-day notice with the ones you send today.
        </LI>
        <LI>
          <Strong>Keep it to two pages.</Strong> Submit through the form at{" "}
          <InlineLink href="https://coag.gov/ai/">coag.gov/ai</InlineLink> before
          July 13.
        </LI>
      </OL>

      <H2>Frequently asked questions</H2>

      <H3>What is the deadline to comment on Colorado&apos;s AI rules?</H3>
      <P>
        The current pre-rulemaking comment window, opened June 23, 2026, runs
        through July 13, 2026, via the Attorney General&apos;s online form at
        coag.gov/ai. The formal rulemaking that follows must include additional
        notice, written comment, and at least one public hearing before rules
        are finalized by January 1, 2027.
      </P>

      <H3>What does &ldquo;materially influence&rdquo; mean under SB 26-189?</H3>
      <P>
        The statute does not fully define it — that is the point of the
        rulemaking. It is the threshold that decides whether AI involved in a
        consequential decision (hiring, lending, housing, insurance, healthcare,
        education, government services) makes you a covered deployer. The AG is
        expected to clarify the definition with presumptions and examples.
      </P>

      <H3>Do the rules cover chatbots too?</H3>
      <P>
        Yes. The same rulemaking covers the Chatbot Safety Act (HB 26-1263),
        which takes effect January 1, 2027 and imposes disclosure, self-harm
        protocol, minor-protection, and annual reporting duties on operators of
        conversational AI services.
      </P>

      <H3>Will commenting put my business on the AG&apos;s radar?</H3>
      <P>
        Comments are public records, but describing your use of AI in a comment
        is not a confession — using AI is legal, and enforcement of the current
        act is paused anyway. If you would rather raise a sensitive fact pattern
        anonymously or through counsel, an attorney can frame and file it for
        you.
      </P>

      <H2>The bottom line</H2>

      <P>
        Between now and January 1, the most important Colorado AI document is
        not the statute — it is the rule the AG writes under it. You get a say
        in that rule until July 13. Use it, or accept rules written around
        somebody else&apos;s business.
      </P>

      <P>
        Want help figuring out whether you are covered before you comment? Run
        the free{" "}
        <InlineLink href="/ai-act-checker">AI Act readiness checker</InlineLink>
        , or have us draft your comment as an attorney task on any{" "}
        <InlineLink href="/#pricing">subscription plan</InlineLink>.
      </P>

      <LegalDisclaimer />
    </>
  );
}
