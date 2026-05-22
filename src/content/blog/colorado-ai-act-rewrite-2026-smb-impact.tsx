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
 * News + tactical post on the May 2026 SB 26-189 repeal-and-replace, written
 * specifically for Colorado SMBs (not lawyers, not enterprise compliance teams).
 *
 * Editorial notes:
 * - Primary keyword targets: "Colorado AI Act 2026", "SB 26-189 small business",
 *   "Colorado AI law repealed", "Colorado AI Act SMB", "Colorado AI compliance
 *   small business 2026".
 * - Tone is news-flash + immediate practical advice. Anyone who has been
 *   prepping for SB 24-205 has a sunk-cost feeling and we should acknowledge
 *   it directly.
 * - Pillar links into colorado-ai-act-2026 (the comprehensive explainer) and
 *   5-ai-vendor-contract-clauses.
 */
export default function ColoradoAiActRewrite2026SmbImpactArticle() {
  return (
    <>
      <Lead>
        On May 14, 2026, Governor Polis signed SB 26-189, repealing and
        replacing the Colorado AI Act that lawyers (including us) had been
        prepping Colorado businesses for since 2024. If you spent the last
        two years hearing about high-risk AI systems, risk management
        programs, and impact assessments — most of that is gone. What
        replaced it is shorter, more concrete, and much friendlier to small
        businesses.
      </Lead>

      <P>
        Here is what actually changed, what you should do this week, and
        what to ignore from the SB 24-205 prep cycle.
      </P>

      <H2>The short version of what happened</H2>

      <P>
        The Colorado General Assembly passed{" "}
        <Strong>Senate Bill 26-189</Strong> by a bipartisan 34-1 vote in
        the Senate and 57-6 in the House. The Governor signed it on May
        14, 2026. It <Strong>fully repeals</Strong> Senate Bill 24-205
        (the 2024 Colorado AI Act) before that law ever took effect. The
        new statute is effective <Strong>January 1, 2027</Strong>.
      </P>

      <P>
        SB 24-205 had been pushed to a June 30, 2026 effective date in an
        August 2025 special session and was widely expected to be the
        most demanding state AI law in the country. The legislature
        listened to two years of business and regulatory feedback and
        scrapped most of the framework. What replaced it is a
        disclosure-and-human-review regime that is far less expensive for
        small businesses to comply with — but still has teeth.
      </P>

      <Callout title="If you do nothing else this week">
        <P>
          The single highest-impact thing a Colorado SMB can do right now
          is post a clear, plain-language notice on the parts of its
          website that involve AI-assisted decisions about people. Hiring
          pages, online applications, pricing or scoring tools, customer
          intake forms. Tell visitors that you use AI in those decisions
          and how they can ask for more information. That single notice
          covers the duty that the AG is most likely to look for first.
        </P>
      </Callout>

      <H2>What changed (the short list)</H2>

      <H3>The terminology changed</H3>
      <P>
        Out: &ldquo;high-risk AI system.&rdquo; In: &ldquo;<Strong>covered
        ADMT</Strong>&rdquo; — automated decision-making technology that
        materially influences a consequential decision. The new term is
        narrower in some ways (spell-checkers, calculators, and
        administrative tools are explicitly excluded) and clearer in
        others (the law spells out what counts as &ldquo;materially
        influences&rdquo; and gives a list of nine sector exemptions).
      </P>

      <H3>The duties are shorter</H3>
      <P>
        The 2024 law had seven affirmative deployer duties stacked on
        top of an open-ended &ldquo;reasonable care&rdquo; standard. The
        2026 law has five concrete duties:
      </P>

      <OL>
        <LI>
          A <Strong>clear and conspicuous pre-use notice</Strong> that
          ADMT is used.
        </LI>
        <LI>
          A <Strong>30-day adverse-outcome notice</Strong> in plain
          language when ADMT contributes to a denial or other
          unfavorable outcome.
        </LI>
        <LI>
          A <Strong>meaningful human review process</Strong> for adverse
          outcomes, to the extent commercially reasonable.
        </LI>
        <LI>
          A process for consumers to{" "}
          <Strong>access and correct the personal data</Strong> ADMT
          relied on.
        </LI>
        <LI>
          <Strong>Three years of records</Strong> sufficient to
          demonstrate compliance.
        </LI>
      </OL>

      <H3>The sectors changed</H3>
      <P>
        Out: legal services. In: same as the 2024 law&apos;s other
        sectors — education, employment, residential real estate,
        financial and lending services, insurance, healthcare, and
        government services and public benefits.
      </P>

      <H3>The duty of care is gone</H3>
      <P>
        SB 24-205&apos;s &ldquo;reasonable care to avoid algorithmic
        discrimination&rdquo; was the single most uncertain piece of the
        old framework — nobody could tell you exactly what reasonable
        care looked like in advance. That standard is gone. But
        anti-discrimination liability did not disappear — see the next
        section.
      </P>

      <H3>The effective date moved out</H3>
      <P>
        Out: June 30, 2026. In: January 1, 2027. You got an extra six
        months of runway, and the new framework is faster to stand up.
      </P>

      <H2>What did not change</H2>

      <P>
        Three things matter here, and they are easy to miss if you only
        read the press releases.
      </P>

      <H3>Anti-discrimination law still applies</H3>
      <P>
        SB 26-189 expressly preserves liability under{" "}
        <Strong>existing state anti-discrimination laws</Strong> for
        consequential decisions materially influenced by ADMT. The
        statute also makes liability allocable by relative fault between
        developer and deployer. Translation: if your AI hiring tool
        produces a disparate impact, you can still get sued under
        Colorado anti-discrimination law — and the new statute makes
        clear that contracts purporting to{" "}
        <Strong>indemnify a party for its own discriminatory conduct</Strong>{" "}
        are void as a matter of public policy.
      </P>

      <H3>Documentation is still the spine of any defense</H3>
      <P>
        The AG&apos;s exclusive enforcement authority comes with a{" "}
        <Strong>60-day cure period</Strong> before any action — but the
        cure period sunsets entirely on January 1, 2030, and the right
        to cure does not apply to knowing or repeated violations. Without
        records, you cannot meaningfully use the cure window. And a
        three-year recordkeeping duty is now in the statute itself.
      </P>

      <H3>Vendor risk shifted further onto the deployer</H3>
      <P>
        Even with a lighter deployer regime, SB 26-189 assumes you have
        contractual visibility into what your AI vendors are doing.
        Developers now owe deployers a documentation package — intended
        uses, training data categories, limitations, and human-review
        instructions. If you have not asked for that from your vendors,
        you should.
      </P>

      <Callout title="If your vendor refuses to send developer documentation">
        <P>
          That refusal is a red flag and a contract-negotiation lever.
          You cannot draft an accurate pre-use notice or a meaningful
          human-review workflow without the documentation. Document the
          ask and the refusal. (
          <InlineLink href="/blog/5-ai-vendor-contract-clauses">
            More on which vendor clauses to negotiate here.
          </InlineLink>
          )
        </P>
      </Callout>

      <H2>What Colorado SMBs should actually do this week</H2>

      <P>
        If your business is small enough that you do not have an in-house
        attorney, here is the prioritized list:
      </P>

      <OL>
        <LI>
          <Strong>Pull together a one-page ADMT inventory.</Strong> List
          every AI-assisted tool your business uses that touches a
          decision about a person — hiring, lending, customer
          eligibility, pricing, anything in the seven covered sectors.
          Note the vendor, what it does, and who owns it internally.
        </LI>
        <LI>
          <Strong>Post a pre-use notice on the customer-facing surfaces.</Strong>{" "}
          You do not need a 12-page policy. You need a clearly-written
          notice at the points of consumer interaction explaining that
          ADMT is used and how to ask for more information. Plain
          English. Reasonably accessible.
        </LI>
        <LI>
          <Strong>Draft a templated adverse-outcome notice.</Strong> When
          someone is denied, declined, or priced unfavorably, you have
          30 days to send a plain-language explanation that covers what
          the system did, what inputs it considered, and how the
          consumer can request more information and exercise their
          rights. Template it once and reuse it.
        </LI>
        <LI>
          <Strong>Name a human reviewer.</Strong> Pick a person — or a
          short list — with the authority to override an adverse ADMT
          outcome. Train them. Make sure they have access to the system
          documentation the vendor gave you. Write down the workflow.
        </LI>
        <LI>
          <Strong>Ask every AI vendor for the developer documentation
          SB 26-189 requires.</Strong> Intended uses, training data
          categories, limitations, and human-review instructions. If
          they will not send it, log the request and start looking for
          alternatives.
        </LI>
        <LI>
          <Strong>Pick a place for your records.</Strong> Decision logs,
          notices sent, vendor documentation, review outcomes — all in
          one place, retained for at least three years.
        </LI>
      </OL>

      <P>
        That&apos;s the whole minimum-viable program. No risk management
        committee. No annual impact assessments. No Attorney General
        notification. The bar is real but it is achievable for a small
        business on a normal week.
      </P>

      <H2>What about everything we already built for SB 24-205?</H2>

      <P>
        If your business already started a SB 24-205 compliance program
        — drafted a risk management policy, ran impact assessments, set
        up bias auditing — none of it is wasted. Every one of those
        artifacts maps to a piece of either SB 26-189 or state
        anti-discrimination law. You may not need the formal
        risk-management program anymore, but the documentation it
        produced is exactly the paper trail that survives a cure notice.
        Keep it. Update what changed. Do not throw out the file cabinet
        because the law renamed the categories.
      </P>

      <H2>The honest take on what this means for Colorado SMBs</H2>

      <P>
        SB 26-189 is a meaningfully better law for small businesses than
        the one it replaced. The duties are shorter, more public, and
        more measurable. A regulator can tell at a glance whether you
        complied. That is a feature, not a bug — it means a small
        business that did the work has a real defense, and a small
        business that ignored the statute is going to be obvious.
      </P>

      <P>
        The businesses that get hurt after January 1, 2027 will not be
        the ones that got every detail right; they will be the ones that
        did not post a pre-use notice, did not respond to an
        adverse-outcome request, or could not produce three years of
        records when the AG asks.
      </P>

      <P>
        For the comprehensive walkthrough of every duty in the new
        statute, see our{" "}
        <InlineLink href="/blog/colorado-ai-act-2026">
          Colorado AI Act plain-language guide
        </InlineLink>
        . If you want a personalized two-minute readout on where your
        business stands against SB 26-189, our{" "}
        <InlineLink href="/ai-act-checker">
          free readiness checker
        </InlineLink>{" "}
        will produce a prioritized gap list mapped to the new framework.
        And if you want a fixed-fee, attorney-led assessment of your
        ADMT footprint, that is what{" "}
        <InlineLink href="/faiir">FAIIR certification</InlineLink> is
        for.
      </P>

      <LegalDisclaimer />
    </>
  );
}
