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
 * Colorado AI Act (SB24-205) — the 2026 business explainer.
 *
 * Editorial notes:
 * - Primary keyword targets: "Colorado AI Act", "SB24-205", "Colorado AI Act 2026",
 *   "Colorado AI Act compliance", "high-risk AI Colorado".
 * - Written for business owners, not lawyers. No Latin, no section numbers in the
 *   body (they go in the sidebar). Plain-language summaries first; statutory
 *   specificity second.
 * - Everything material here is already reflected in /ai-act-checker and
 *   /faiir — keep in sync when the statute's implementing rules land.
 */
export default function ColoradoAiAct2026Article() {
  return (
    <>
      <Lead>
        Colorado is about to become the first U.S. state to enforce a
        comprehensive law regulating how businesses use artificial
        intelligence. If you run a Colorado company and any AI system helps
        decide who gets hired, fired, approved for a loan, priced for
        insurance, admitted to a program, or evaluated for housing or
        healthcare, the Colorado AI Act almost certainly applies to you.
      </Lead>

      <P>
        This is the plain-language walkthrough we wish every small-business
        owner in Colorado had read six months ago. We will cover what the
        statute actually requires, who it applies to, what happens if you
        ignore it, and what a realistic compliance plan looks like for a
        business that does not have a general counsel on staff.
      </P>

      <H2>What is the Colorado AI Act?</H2>

      <P>
        The Colorado AI Act is the shorthand name for{" "}
        <Strong>Senate Bill 24-205</Strong>, passed in 2024 and set to take
        effect in 2026. It is the first state-level law in the United States
        that imposes ongoing duties on any business using so-called{" "}
        <Strong>high-risk AI systems</Strong> to make decisions about real
        people. Other states are watching closely and several have already
        introduced copycat legislation, which means whatever Colorado businesses
        build to comply is likely to double as a template for the rest of the
        country.
      </P>

      <P>
        The core idea of the statute is borrowed from the European Union&apos;s
        AI Act, but applied with a Colorado accent: instead of banning certain
        uses outright, it says that if your business deploys AI in a
        high-stakes context, you have to treat it the way a regulated industry
        would — with governance, documentation, disclosure, human oversight,
        and a paper trail that a regulator can audit.
      </P>

      <H2>Who does it apply to?</H2>

      <P>
        The Colorado AI Act splits the world into two categories of regulated
        parties:
      </P>

      <UL>
        <LI>
          <Strong>Developers</Strong> — the businesses that build or
          meaningfully modify an AI system. If your company trains a model, or
          licenses one and fine-tunes it for a specific use, you are probably a
          developer.
        </LI>
        <LI>
          <Strong>Deployers</Strong> — the businesses that use an AI system to
          make or substantially assist in making a consequential decision about
          a consumer. Most Colorado small businesses will end up in this
          bucket.
        </LI>
      </UL>

      <P>
        Both categories carry duties, but the deployer duties are the ones most
        Colorado businesses will need to worry about. A SaaS company that uses
        an off-the-shelf applicant-tracking tool with AI resume screening is a
        deployer. A lender that uses a third-party model to evaluate credit
        risk is a deployer. A landlord running tenant applications through an
        AI-powered background check is a deployer.
      </P>

      <Callout title="Quick gut check">
        <P>
          If your business uses any AI system — including tools from a third
          party — to make or influence decisions about hiring, firing,
          promotion, credit, insurance, housing, healthcare access, education,
          legal services, or essential government services, you are very
          likely a <Strong>deployer of high-risk AI</Strong> under the
          Colorado AI Act.
        </P>
      </Callout>

      <H2>What counts as &ldquo;high-risk AI&rdquo;?</H2>

      <P>
        The statute defines a high-risk AI system as one that is a substantial
        factor in a consequential decision about a consumer. &ldquo;Consequential
        decision&rdquo; is a term of art and it covers the categories the
        legislature singled out as high-stakes:
      </P>

      <UL>
        <LI>Employment and employment opportunities</LI>
        <LI>Education and vocational training</LI>
        <LI>Financial and lending services</LI>
        <LI>Essential government services</LI>
        <LI>Healthcare services</LI>
        <LI>Housing</LI>
        <LI>Insurance</LI>
        <LI>Legal services</LI>
      </UL>

      <P>
        A couple of things to notice. First, the list covers a huge portion of
        the economy. Second, the statute uses the phrase{" "}
        <Strong>substantial factor</Strong>, not &ldquo;sole factor.&rdquo; That
        means if an AI system meaningfully contributes to a decision — even
        alongside human judgment — you are still in scope. You do not get out
        of the statute by having a human rubber-stamp the AI&apos;s output.
      </P>

      <H2>The seven duties you will owe as a deployer</H2>

      <P>
        If the statute applies to your business, you owe a set of ongoing
        duties that together make up a basic AI governance program. We think of
        them as the seven pillars:
      </P>

      <H3>1. Risk management policy</H3>
      <P>
        You need a written AI risk management policy. The statute explicitly
        points to the{" "}
        <Strong>NIST AI Risk Management Framework</Strong> as a reasonable
        standard, so if you model your policy on NIST AI RMF 1.0 you are in
        the fairway. The policy has to cover procurement, deployment,
        monitoring, and retirement of AI systems, and it has to be actually
        used — a draft in a shared drive does not count.
      </P>

      <H3>2. Impact assessments</H3>
      <P>
        Before deploying a high-risk AI system, you have to complete a written
        impact assessment describing what the system does, what data it uses,
        who it affects, what could go wrong, and what mitigations you have in
        place. You have to update these assessments at least annually and any
        time the system is meaningfully modified. These are the single most
        common compliance gap we see in assessments of existing Colorado
        businesses.
      </P>

      <H3>3. Consumer notice and disclosure</H3>
      <P>
        You have to tell people when AI is being used to make or meaningfully
        influence a decision about them, in clear, plain language — not buried
        at the bottom of a 12,000-word privacy policy. If a consumer asks what
        the system considered, you generally need to be able to explain it.
      </P>

      <H3>4. Right to human review</H3>
      <P>
        When an AI system produces an adverse consequential decision, the
        affected consumer has a right to request human review, to correct data,
        and in some cases to appeal. You need a documented process with
        reasonable response times — ad-hoc review is not enough.
      </P>

      <H3>5. Duty of reasonable care to avoid algorithmic discrimination</H3>
      <P>
        This is the heart of the statute. Deployers have an affirmative duty
        to use reasonable care to protect consumers from algorithmic
        discrimination — defined as unlawful differential treatment based on a
        protected class. In practice this looks like scheduled bias audits,
        disparate-impact testing, and documented remediation when issues
        surface.
      </P>

      <H3>6. Documentation</H3>
      <P>
        You need records. Training data sources, vendor attestations, model
        versions, audit results, decision logs for consequential decisions, and
        the minutes of whatever internal governance you put in place. If a
        regulator comes calling after 2026, your documentation is the first
        thing they will ask for. If it does not exist, you are already in
        trouble.
      </P>

      <H3>7. Incident response and Attorney General notification</H3>
      <P>
        You need an incident response plan. When something goes wrong — a
        harmful output, a disparate impact, a systemic error — you need a
        documented process for triage, remediation, consumer notice, and in
        some cases notification to the Colorado Attorney General&apos;s office
        within a defined window. Having this plan in writing is the whole
        point; &ldquo;we would have figured it out&rdquo; is not a defense.
      </P>

      <H2>Who enforces it and what are the penalties?</H2>

      <P>
        The Colorado Attorney General is the primary enforcement authority.
        The statute creates civil enforcement powers and the AG&apos;s office
        can bring actions for injunctive relief and civil penalties. There is
        no private right of action in the statute itself, but unlawful
        algorithmic discrimination can still give rise to separate claims
        under federal and state anti-discrimination laws, and consumer
        complaints can trigger AG investigations.
      </P>

      <P>
        Practically, the most immediate risk for a small business is not a
        direct AG enforcement action on day one. It is the chain reaction that
        starts when a job applicant, tenant, or customer files a complaint,
        the AG&apos;s office asks to see your documentation, and you have
        nothing to hand over.
      </P>

      <Callout title="What enforcement actually looks like">
        <P>
          The first wave of Colorado AI Act enforcement is unlikely to target
          businesses that made a good-faith effort and have a defensible
          paper trail. It is going to target businesses that ignored the
          statute entirely and cannot show any evidence of governance,
          assessment, or oversight. The goal of your compliance program is
          not perfection — it is to have real, dated, documented work product
          you can point to.
        </P>
      </Callout>

      <H2>What to do right now</H2>

      <P>
        You do not need to become an AI compliance expert. You need to take
        five concrete steps, in roughly this order:
      </P>

      <OL>
        <LI>
          <Strong>Inventory your AI systems.</Strong> Make a written list of
          every tool your business uses that has AI or machine-learning
          components, and what decisions each one influences. Include
          third-party tools — your HR platform, your credit model, your
          customer support copilot, your pricing engine.
        </LI>
        <LI>
          <Strong>Classify them against the statute.</Strong> For each system,
          decide in writing whether it is a substantial factor in a
          consequential decision. If the answer is yes, it is high-risk and
          the full deployer duties attach.
        </LI>
        <LI>
          <Strong>Stand up a governance policy.</Strong> You can start with a
          NIST AI RMF-aligned template. The first version does not need to be
          perfect — it needs to exist, be adopted, and actually be used.
        </LI>
        <LI>
          <Strong>Write an impact assessment for each high-risk system.</Strong>{" "}
          Keep it short and honest. A three-page assessment that accurately
          describes the system, the data, the risks, and the mitigations is
          worth more than a thirty-page assessment full of boilerplate.
        </LI>
        <LI>
          <Strong>Review your vendor contracts.</Strong> Every AI vendor
          contract should be re-read with three questions in mind: who owns the
          training data, who indemnifies you for regulatory failures, and do
          you have the audit rights you need to meet your own deployer duties.
          (<InlineLink href="/blog/5-ai-vendor-contract-clauses">
            More on that in our AI vendor contract clauses article.
          </InlineLink>
          )
        </LI>
      </OL>

      <P>
        If you want to know how your business would score against these duties
        right now, take our{" "}
        <InlineLink href="/ai-act-checker">
          free Colorado AI Act Readiness Checker
        </InlineLink>
        . It takes about two minutes and produces a specific, prioritized gap
        list mapped to the statute.
      </P>

      <H2>The honest bottom line</H2>

      <P>
        The Colorado AI Act is serious but it is not scary. Most of the duties
        it imposes are things a well-run business would want to do anyway:
        know what tools you are using, be honest with customers, have a
        paper trail, plan for what happens when something breaks. The businesses
        that get hurt by this statute in 2026 will not be the ones that got
        every detail right — they will be the ones that ignored it until the
        enforcement window opened and then tried to back-date a compliance
        program under pressure.
      </P>

      <P>
        Available Law built{" "}
        <InlineLink href="/faiir">
          FAIIR — the Foundation for AI Integrity &amp; Regulation
        </InlineLink>{" "}
        specifically to get Colorado businesses through this statute without
        paying big-firm rates. If your business is running AI in any of the
        high-risk categories above and you do not yet have governance,
        assessments, or documentation in place, that is what we are here for.
      </P>

      <LegalDisclaimer />
    </>
  );
}
