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
 * Colorado AI Act — the SB 26-189 explainer.
 *
 * Editorial notes:
 * - Primary keyword targets: "Colorado AI Act", "SB 26-189", "Colorado AI Act 2027",
 *   "Colorado AI Act compliance", "covered ADMT".
 * - Written for business owners, not lawyers. No Latin, no section numbers in the
 *   body (they go in the sidebar). Plain-language summaries first; statutory
 *   specificity second.
 * - SB 26-189 fully repealed SB 24-205 (signed May 14, 2026 by Gov. Polis) and
 *   replaced it with a disclosure-based regime. Everything material here is
 *   already reflected in /ai-act-checker and /faiir — keep in sync when
 *   implementing rules from the AG land.
 */
export default function ColoradoAiAct2026Article() {
  return (
    <>
      <Lead>
        In May 2026 Colorado scrapped its first AI law and replaced it with a
        much lighter one. If you run a Colorado business and any automated
        decision tool helps decide who gets hired, fired, approved for a loan,
        priced for insurance, admitted to a program, or evaluated for housing
        or healthcare, the new Colorado AI Act applies to you — but the
        obligations look very different from what the legal industry was
        bracing for.
      </Lead>

      <P>
        This is the plain-language walkthrough of what actually passed, what
        changed, and what a realistic compliance plan looks like now for a
        business that does not have a general counsel on staff.
      </P>

      <H2>What is the new Colorado AI Act?</H2>

      <P>
        The new Colorado AI Act is{" "}
        <Strong>Senate Bill 26-189</Strong>, signed by Governor Polis on{" "}
        <Strong>May 14, 2026</Strong> after passing the legislature by a
        bipartisan 34-1 vote in the Senate and 57-6 in the House. It{" "}
        <Strong>repeals and replaces</Strong> the prior Colorado AI Act
        (Senate Bill 24-205, the 2024 law that was scheduled to take effect
        first in February 2026 and then on June 30, 2026). The replacement
        is not instant, though. The repeal and the new framework both take
        effect <Strong>January 1, 2027</Strong>, and the new duties apply
        to consequential decisions made on or after that date — which
        means the 2024 statute still takes effect{" "}
        <Strong>June 30, 2026</Strong> and is technically the law on the
        books for the last six months of 2026. More on that interim window
        below.
      </P>

      <P>
        The core idea has shifted. SB 24-205 borrowed from the European Union&apos;s
        AI Act and treated high-risk AI like a regulated industry —
        ongoing risk management, written impact assessments, an affirmative
        duty of care to avoid algorithmic discrimination, and Attorney General
        notification when things went wrong. SB 26-189 throws most of that
        out. The new regime is a{" "}
        <Strong>disclosure-and-human-review framework</Strong>: tell people
        when you&apos;re using ADMT, tell them more after an adverse
        outcome, and give them a way to get a real person to look at the
        decision.
      </P>

      <Callout title="The short version of what changed">
        <P>
          <Strong>Gone:</Strong> duty of care, risk management programs,
          annual impact assessments, AG notification of algorithmic
          discrimination, consumer appeal rights, the &ldquo;high-risk AI
          system&rdquo; terminology.
        </P>
        <P>
          <Strong>Kept and refined:</Strong> pre-use notice that ADMT is being
          used; 30-day adverse-outcome notice; meaningful human review of
          adverse outcomes; developer documentation duties; three-year
          recordkeeping.
        </P>
      </Callout>

      <H2>Who does it apply to?</H2>

      <P>
        SB 26-189 keeps the same two categories of regulated parties from the
        old law:
      </P>

      <UL>
        <LI>
          <Strong>Developers</Strong> — the businesses that build or
          meaningfully modify the underlying technology. If your company
          trains a model, or licenses one and fine-tunes it for a specific
          use, you are probably a developer.
        </LI>
        <LI>
          <Strong>Deployers</Strong> — the businesses that use ADMT to make,
          or to materially influence, a consequential decision about a
          consumer. Most Colorado small businesses will end up in this bucket.
        </LI>
      </UL>

      <P>
        The deployer duties are the ones most Colorado businesses will need to
        worry about. A SaaS company that uses an off-the-shelf
        applicant-tracking tool with AI resume screening is a deployer. A
        lender that uses a third-party model to evaluate credit risk is a
        deployer. A landlord running tenant applications through an AI-powered
        background check is a deployer.
      </P>

      <H2>What is &ldquo;covered ADMT&rdquo;?</H2>

      <P>
        The new statute drops &ldquo;high-risk AI system&rdquo; and replaces
        it with <Strong>covered ADMT</Strong> — automated decision-making
        technology that processes personal data and{" "}
        <Strong>materially influences</Strong> a{" "}
        <Strong>consequential decision</Strong>. Three pieces have to line up
        before the duties attach:
      </P>

      <UL>
        <LI>
          <Strong>ADMT</Strong> — technology that processes personal data and
          uses computation to generate output that makes, guides, or assists a
          decision. The statute explicitly excludes spell-checkers,
          calculators, and tools used for human review or administrative
          processing.
        </LI>
        <LI>
          <Strong>Materially influences</Strong> — the ADMT&apos;s output is a
          non-de-minimis factor in the outcome. Incidental, trivial, or
          clerical uses do not count.
        </LI>
        <LI>
          <Strong>Consequential decision</Strong> — a decision about a
          consumer affecting access, eligibility, or terms in one of the seven
          covered sectors listed below.
        </LI>
      </UL>

      <H3>The seven covered sectors</H3>

      <UL>
        <LI>Education enrollment and opportunity</LI>
        <LI>Employment and the employer-employee relationship</LI>
        <LI>Residential real estate lease or purchase</LI>
        <LI>Financial and lending services</LI>
        <LI>Insurance underwriting, pricing, coverage, and claims</LI>
        <LI>Healthcare services</LI>
        <LI>Government services and public benefits</LI>
      </UL>

      <P>
        Two things to notice. First, this list covers a huge portion of the
        Colorado economy. Second, <Strong>legal services</Strong> — which is
        in the 2024 law&apos;s scope — is not on the 2026 list.{" "}
        <Strong>That drop does not happen until January 1, 2027.</Strong>{" "}
        Because the 2024 law takes effect June 30, 2026 and is not repealed
        until the new framework starts, AI used in decisions about
        consumers&apos; access to legal services remains covered for the
        rest of 2026. A business in that category should not treat itself
        as out of scope until the calendar actually turns.
      </P>

      <Callout title="Quick gut check">
        <P>
          If your business uses any automated tool — including software from a
          third party — to make or materially influence decisions about
          hiring, firing, promotion, credit, insurance, housing, healthcare
          access, education, or government services, you are very likely a{" "}
          <Strong>deployer of covered ADMT</Strong> under the new Colorado AI
          Act.
        </P>
      </Callout>

      <H2>The five duties deployers actually owe</H2>

      <P>
        If the statute applies to your business, the affirmative obligations
        are shorter and more concrete than under the 2024 law:
      </P>

      <H3>1. Pre-use notice (clear and conspicuous)</H3>
      <P>
        You have to tell people that covered ADMT is used in your
        consequential decisions, with instructions for how to request more
        information. The statute says &ldquo;clear and conspicuous&rdquo; —
        buried disclosure at the bottom of a privacy policy does not count. A
        public-facing notice that is reasonably accessible at the points of
        consumer interaction generally does.
      </P>

      <H3>2. Adverse-outcome notice within 30 days</H3>
      <P>
        When ADMT contributes to an adverse outcome — a denial, a rejection,
        an unfavorable price — the deployer has 30 days to send the affected
        person a plain-language notice describing the decision, the ADMT&apos;s
        role, how to request more information about the inputs the ADMT
        considered, and an explanation of the consumer&apos;s rights and how
        to exercise them.
      </P>

      <H3>3. Meaningful human review of adverse outcomes</H3>
      <P>
        After an adverse outcome, consumers have a right to a real human
        review — to the extent commercially reasonable. The statute defines{" "}
        <Strong>meaningful human review</Strong> as review by someone with
        authority to approve, modify, or override the decision, who is
        trained, who considers relevant evidence, who does not default to the
        system&apos;s output, and who has access to the system&apos;s intended
        use, material limitations, input categories, and principal factors.
        Ad-hoc rubber-stamping does not satisfy the duty.
      </P>

      <H3>4. Consumer access and correction of personal data</H3>
      <P>
        Consumers can request access to the personal data the ADMT relied on,
        and can ask to correct factually incorrect or materially inaccurate
        data. The rights are tied to the Colorado Privacy Act, which means
        regulated-entity exemptions (GLBA-covered financial institutions,
        public utilities, employment records in part, and higher education
        records) carry over. Consumers cannot correct opinions, predictions,
        scores, or protected evaluations — only the underlying facts.
      </P>

      <H3>5. Recordkeeping for three years</H3>
      <P>
        Deployers must keep records sufficient to demonstrate compliance for
        three years after the relevant consequential decision. That generally
        means decision logs, copies of notices sent, vendor documentation, and
        records of human-review outcomes and consumer-data requests.
      </P>

      <H2>What developers owe</H2>

      <P>
        Developer-side duties are lighter and primarily documentation-based.
        Developers must give deployers enough information to comply, including
        a statement of intended uses and known harmful or inappropriate uses,
        the categories of data used to train the system (to the extent
        known), known limitations and risks, and instructions for meaningful
        human review. Developers can satisfy the duty through public release
        notes plus direct notice to deployers. Developers also retain records
        for three years and must update deployers about material changes.
      </P>

      <H2>What you no longer have to do</H2>

      <P>
        If you were following the 2024 law&apos;s prep cycle, these duties
        are gone:
      </P>

      <UL>
        <LI>
          <Strong>No more duty of care</Strong> to avoid algorithmic
          discrimination as a freestanding statutory obligation.
        </LI>
        <LI>
          <Strong>No more risk management program</Strong> requirement under
          the AI statute (NIST AI RMF alignment is still good practice — just
          not legally compelled by this statute).
        </LI>
        <LI>
          <Strong>No more annual impact assessments</Strong> as a statutory
          deliverable.
        </LI>
        <LI>
          <Strong>No more Attorney General notification</Strong> of
          algorithmic discrimination incidents.
        </LI>
        <LI>
          <Strong>No more broad consumer appeal rights</Strong> — meaningful
          human review is now scoped to adverse outcomes.
        </LI>
      </UL>

      <H2>Anti-discrimination liability did not go away</H2>

      <P>
        This is the part the headlines miss. SB 26-189 deleted the
        algorithmic-discrimination language from the AI statute, but the bill
        expressly preserves liability under{" "}
        <Strong>existing state anti-discrimination laws</Strong> for
        consequential decisions materially influenced by covered ADMT.
        Liability is allocated by relative fault among developer, deployer,
        and any intermediary — and contracts trying to{" "}
        <Strong>indemnify a party for its own discriminatory conduct</Strong>{" "}
        are explicitly declared void.
      </P>

      <P>
        Translation: you can still get sued for discriminatory AI outcomes
        under Colorado&apos;s existing anti-discrimination laws, and you
        cannot contract out of that exposure. The practical defense is the
        same as it has always been — ongoing bias testing, documented
        remediation, and a human review path that actually works.
      </P>

      <H2>Who enforces it and what are the penalties?</H2>

      <P>
        The Colorado Attorney General is the exclusive enforcement authority,
        operating under the Colorado Consumer Protection Act. There is no
        private right of action under the AI statute. Before bringing an
        enforcement action, the AG must give a notice of violation and a{" "}
        <Strong>60-day cure period</Strong>, unless the violation is knowing
        or repeated. The cure period sunsets on January 1, 2030 — so after
        that, the AG can move straight to enforcement.
      </P>

      <Callout title="What enforcement actually looks like">
        <P>
          The first wave of SB 26-189 enforcement is unlikely to target
          businesses that made a good-faith effort and have a defensible
          paper trail. It is going to target businesses that ignored the
          statute and cannot show any evidence of notices sent,
          human-review processes, or vendor documentation. The goal of your
          compliance program is not perfection — it is to have real, dated,
          documented work product you can point to during a 60-day cure
          window.
        </P>
      </Callout>

      <H2>What governs the rest of 2026?</H2>

      <P>
        This is the part the press releases get wrong, so here is the
        timeline plainly. SB 26-189&apos;s repeal of the 2024 law is dated{" "}
        <Strong>January 1, 2027</Strong> — the same day the new framework
        begins. Nothing in the new bill cancels the 2024 law&apos;s June
        30, 2026 effective date. So from{" "}
        <Strong>June 30 through December 31, 2026</Strong>, the original
        Colorado AI Act — duty of care, impact assessments, legal services
        in scope, all of it — is technically the law of Colorado.
      </P>

      <P>
        What makes this less alarming than it sounds is the courtroom. In
        a pending federal challenge to the 2024 law (filed by xAI, with
        the U.S. Department of Justice intervening in support), the
        Colorado Attorney General agreed in an April 2026 court filing{" "}
        <Strong>not to initiate enforcement or investigate alleged
        violations</Strong> while that litigation plays out. The 2024 law
        also has no private right of action — the AG is the only
        enforcer. Paused enforcement, however, is not the same thing as
        repeal: the obligations exist on paper, and the prudent posture
        for the interim is the same work the 2027 framework requires
        anyway — notices, human review, vendor documentation, and
        records.
      </P>

      <Callout title="If your business touches legal services">
        <P>
          The interim window matters most if AI helps decide
          consumers&apos; access to <Strong>legal services</Strong> —
          the one covered category in the 2024 law that the 2027
          framework drops. For the rest of 2026 that use is inside the
          statute&apos;s scope, so keep it in your ADMT inventory and
          governance program now, and re-classify it in January.
        </P>
      </Callout>

      <H2>What to do right now</H2>

      <P>
        The compliance lift is significantly smaller than under the 2024
        law. Five concrete steps, roughly in this order:
      </P>

      <OL>
        <LI>
          <Strong>Inventory your ADMT.</Strong> Make a written list of every
          tool your business uses that has automated decision-making
          components, and what decisions each one influences. Include
          third-party tools — your HR platform, your credit model, your
          customer support copilot, your pricing engine.
        </LI>
        <LI>
          <Strong>Classify against the new definition.</Strong> For each
          system, decide in writing whether it materially influences a
          consequential decision in one of the seven covered sectors. Note
          any exemptions you relied on.
        </LI>
        <LI>
          <Strong>Draft the two notices.</Strong> A clear-and-conspicuous
          pre-use notice for your public-facing properties, and a templated
          plain-language adverse-outcome notice you can send within 30 days
          of any unfavorable decision.
        </LI>
        <LI>
          <Strong>Stand up a meaningful human review process.</Strong> Name
          who reviews, train them, document the workflow, and give them
          access to the developer documentation they need to second-guess
          the system. The process has to be real, not a rubber stamp.
        </LI>
        <LI>
          <Strong>Collect developer documentation from every ADMT vendor.</Strong>{" "}
          Intended uses, training data categories, limitations, risks, and
          human-review instructions. You need these on file to draft
          accurate consumer notices and to defend an AG inquiry.
          (
          <InlineLink href="/blog/5-ai-vendor-contract-clauses">
            More on the contract clauses that get you there.
          </InlineLink>
          )
        </LI>
      </OL>

      <P>
        If you want to know how your business would score against these
        duties right now, take our{" "}
        <InlineLink href="/ai-act-checker">
          free Colorado AI Act Readiness Checker
        </InlineLink>
        . It takes about two minutes and produces a specific, prioritized
        gap list mapped to SB 26-189.
      </P>

      <H2>The honest bottom line</H2>

      <P>
        The new Colorado AI Act is less onerous than the law it replaced,
        but it is also more concrete. The duties are shorter, more public,
        and more measurable — which means a regulator can tell at a glance
        whether you complied. The businesses that get hurt after January 1,
        2027 will not be the ones that got every detail right; they will be
        the ones that did not post a pre-use notice, did not respond to an
        adverse-outcome request, or could not produce three years of
        records.
      </P>

      <P>
        Available Law built{" "}
        <InlineLink href="/faiir">
          FAIIR — the Foundation for AI Integrity &amp; Regulation
        </InlineLink>{" "}
        specifically to get Colorado businesses through this statute without
        paying big-firm rates. If your business is running covered ADMT in
        any of the seven sectors above and you do not yet have notices,
        human review, or vendor documentation in place, that is what we are
        here for.
      </P>

      <LegalDisclaimer />
    </>
  );
}
