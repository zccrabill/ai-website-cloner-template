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
 * AI hiring tools under Colorado law.
 *
 * Editorial notes:
 * - Primary keyword targets: "AI hiring tools legal", "is it legal to use AI
 *   to screen resumes", "Colorado AI Act hiring", "AI in hiring Colorado",
 *   "ATS AI compliance", "AI recruiting law 2026".
 * - Employment is the covered domain small businesses hit most often (usually
 *   through embedded ATS features they never chose), so this is the highest-
 *   intent commercial post of the July 2026 batch.
 * - Legal accuracy notes: SB 26-189 duties apply to consequential decisions on
 *   or after Jan 1, 2027; anti-discrimination liability (Title VII, CADA) is
 *   preserved and was never paused; §1707 voids indemnity for one's own
 *   discriminatory conduct. Keep consistent with colorado-ai-act-2026.
 */
export default function AiHiringToolsColoradoLawArticle() {
  return (
    <>
      <Lead>
        If your business uses AI anywhere in hiring — a résumé screener, an
        applicant-ranking feature inside your ATS, a chatbot that pre-screens
        candidates, video-interview scoring — you are standing in the exact spot
        Colorado&apos;s new AI law was written for. Employment is the covered
        category small businesses trip over most, usually through software
        features they never consciously chose. Here is what is legal, what
        changes on January 1, 2027, and the playbook to run before then.
      </Lead>

      <H2>First: yes, using AI in hiring is legal</H2>

      <P>
        Nothing in Colorado law bans AI hiring tools. What the law regulates is{" "}
        <Strong>how</Strong> you use them: whether candidates know AI is
        involved, whether a human meaningfully reviews adverse outcomes, whether
        you keep records — and, under anti-discrimination laws that have been on
        the books for decades, whether the tool produces biased results. The
        tool is fine. The obligations attach to the use.
      </P>

      <H2>Do you even have an AI hiring tool? (Check before you answer)</H2>

      <P>
        Most owners answer &ldquo;no&rdquo; and are wrong. AI hiring features
        ship embedded in mainstream software, on by default:
      </P>

      <UL>
        <LI>
          <Strong>Applicant tracking systems</Strong> that score, rank, or
          &ldquo;match&rdquo; candidates to the job description.
        </LI>
        <LI>
          <Strong>Job-board features</Strong> that decide which applicants you
          see first — or at all.
        </LI>
        <LI>
          <Strong>Screening chatbots</Strong> that ask knockout questions and
          filter people out before a human looks.
        </LI>
        <LI>
          <Strong>Video-interview tools</Strong> that score communication or
          &ldquo;fit.&rdquo;
        </LI>
        <LI>
          <Strong>Background-check and assessment platforms</Strong> with
          algorithmic scoring layers.
        </LI>
      </UL>

      <P>
        If software influences who gets hired, promoted, disciplined, or fired
        at your company, it belongs on your AI inventory — step one of{" "}
        <InlineLink href="/blog/ai-small-business-legal-checklist-2026">
          our AI legal checklist
        </InlineLink>
        .
      </P>

      <H2>What the Colorado AI Act requires from January 1, 2027</H2>

      <P>
        <InlineLink href="https://leg.colorado.gov/bills/sb26-189">
          SB 26-189
        </InlineLink>{" "}
        applies when automated decision-making technology{" "}
        <Strong>materially influences</Strong> a consequential decision — and
        employment decisions (hiring, firing, promotion, discipline,
        compensation-affecting calls) are squarely on the list. For decisions
        made on or after January 1, 2027, a covered employer-deployer owes:
      </P>

      <OL>
        <LI>
          <Strong>Pre-use notice.</Strong> A clear and conspicuous notice —
          before the AI is used — that AI will play a role in the decision. In
          practice: language in your job postings, application flow, or careers
          page.
        </LI>
        <LI>
          <Strong>A 30-day adverse-outcome notice.</Strong> When covered AI
          contributes to rejecting, passing over, or otherwise deciding against
          a candidate or employee, they get a notice within 30 days.
        </LI>
        <LI>
          <Strong>Meaningful human review.</Strong> A real person, with real
          authority to change the outcome, reviewing adverse decisions where
          commercially reasonable — not a rubber stamp on the model&apos;s
          output.
        </LI>
        <LI>
          <Strong>Data access and correction.</Strong> A way for the person to
          see and correct the personal data the system relied on.
        </LI>
        <LI>
          <Strong>Records for three years.</Strong> Documentation of the above —
          which is easier to build as a habit now than to reconstruct under a
          60-day cure letter later. Our{" "}
          <InlineLink href="/blog/document-ai-decision-making">
            AI decision-documentation guide
          </InlineLink>{" "}
          shows the system we use with clients.
        </LI>
      </OL>

      <P>
        Whether a given tool &ldquo;materially influences&rdquo; your decisions
        is the threshold question — and it is being defined in the Attorney
        General&apos;s rulemaking <Strong>right now</Strong>.{" "}
        <InlineLink href="/blog/colorado-ai-rules-public-comment-2026">
          Comments are open through July 13
        </InlineLink>
        , and employers with real fact patterns should be in that file.
      </P>

      <Callout title="The part that was never paused">
        <P>
          Enforcement of the Colorado AI Act is{" "}
          <InlineLink href="/blog/colorado-ai-act-in-effect-2026">
            currently suspended by a federal court
          </InlineLink>
          , but discrimination law never paused. If an AI tool screens out
          candidates in a way that lands unevenly on a protected class, Title
          VII and the Colorado Anti-Discrimination Act apply today, exactly as
          they would to a biased human recruiter. &ldquo;The algorithm did
          it&rdquo; is not a defense — and SB 26-189 expressly preserves that
          liability. It even voids contract clauses that would make someone
          else indemnify you for your own discriminatory conduct.
        </P>
      </Callout>

      <H2>The vendor conversation to have this quarter</H2>

      <P>
        Most small businesses do not build hiring AI; they license it. That
        makes your vendor contract your main compliance instrument. Before
        renewal, ask your ATS or screening vendor:
      </P>

      <UL>
        <LI>Which features in our plan use AI to score, rank, or filter candidates — and can we configure or disable them?</LI>
        <LI>What documentation will you give us to support our pre-use and adverse-outcome notices?</LI>
        <LI>Has the tool been tested for adverse impact, and will you share the results?</LI>
        <LI>Who is liable if the tool produces discriminatory outcomes?</LI>
      </UL>

      <P>
        If the contract is silent on these,{" "}
        <InlineLink href="/blog/5-ai-vendor-contract-clauses">
          these are the five clauses to add
        </InlineLink>
        .
      </P>

      <H2>Frequently asked questions</H2>

      <H3>Is it legal to use AI to screen résumés in Colorado?</H3>
      <P>
        Yes. But starting January 1, 2027, if the AI materially influences
        hiring decisions, the Colorado AI Act requires a pre-use notice to
        candidates, a 30-day notice after adverse outcomes, meaningful human
        review, data access and correction, and three years of records. And
        anti-discrimination law applies to AI-driven screening today.
      </P>

      <H3>Does the Colorado AI Act apply to my applicant tracking system?</H3>
      <P>
        It depends on whether the ATS&apos;s AI features materially influence
        your hiring decisions — a threshold the Attorney General is defining in
        rulemaking due by January 1, 2027. A scoring feature a human always
        overrides may land differently than an auto-reject filter. When in
        doubt, inventory the feature and treat it as potentially covered.
      </P>

      <H3>Do I have to tell candidates I use AI in hiring?</H3>
      <P>
        From January 1, 2027, yes — covered deployers owe a clear and
        conspicuous pre-use notice before the AI is used, plus a notice within
        30 days when AI contributes to an adverse decision. Adding plain
        AI-disclosure language to your application flow now is cheap and
        candidate-friendly.
      </P>

      <H3>Can my business be sued if an AI hiring tool is biased?</H3>
      <P>
        The Colorado AI Act itself has no private right of action — only the
        Attorney General enforces it. But a biased hiring outcome can support
        ordinary discrimination claims under Title VII and the Colorado
        Anti-Discrimination Act, which individuals can and do bring. The AI act
        preserves that liability and voids indemnity for your own
        discriminatory conduct.
      </P>

      <H2>The bottom line</H2>

      <P>
        AI hiring tools are legal, useful, and — as of January 1, 2027 —
        regulated. The employers who will have a painless 2027 are the ones who
        spend 2026 doing four cheap things: inventory the tools, fix the vendor
        contract, add the notices, and put a human with real authority in the
        loop.
      </P>

      <P>
        Not sure whether you are covered? The free{" "}
        <InlineLink href="/ai-act-checker">AI Act readiness checker</InlineLink>{" "}
        takes a few minutes. Want it handled? Every{" "}
        <InlineLink href="/#pricing">Available Law plan</InlineLink> includes
        attorney review of your hiring-tool setup as an attorney task.
      </P>

      <LegalDisclaimer />
    </>
  );
}
