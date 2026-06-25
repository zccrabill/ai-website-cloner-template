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
 * Subscription legal services — the plain-language explainer + commercial page.
 *
 * Editorial notes:
 * - Primary keyword targets: "subscription legal services", "subscription law
 *   firm", "flat-rate legal services", "legal subscription for small business",
 *   "flat fee lawyer", "monthly legal plan", "outside counsel subscription".
 * - Intent is mid-funnel commercial: the reader is comparing how to pay for a
 *   lawyer. The job of the post is to explain the model honestly (including who
 *   it is NOT for) and let Available Law's actual tiers be the worked example.
 * - Tier prices/terms mirror src/lib/tiers.ts exactly. If pricing changes there,
 *   update the "How the pricing works" section here.
 */
export default function SubscriptionLegalServicesArticle() {
  return (
    <>
      <Lead>
        Subscription legal services replace the unpredictable hourly bill with a
        flat monthly fee for the legal work a small business actually uses —
        contracts, document review, and quick questions to an attorney who
        already knows your business. The model has quietly become the default
        way modern small companies buy law. Here is how it works, what it costs,
        and how to tell whether it fits your business.
      </Lead>

      <P>
        For most of the last century, there was one way to hire a lawyer: by the
        hour. You called when something was on fire, a meter started running,
        and a bill showed up weeks later for an amount you could not have
        predicted. That model works fine for a corporation with a legal budget.
        It works badly for a small business that needs a contract reviewed today
        and cannot afford a surprise four-figure invoice for the privilege.
      </P>

      <P>
        Subscription legal services exist to fix that mismatch. Instead of
        buying lawyer time in six-minute increments, you buy access to legal
        help on a predictable monthly plan — the same way you already buy your
        accounting software, your payroll service, and your email.
      </P>

      <H2>What &ldquo;subscription legal services&rdquo; actually means</H2>

      <P>
        A subscription law firm charges a flat, recurring fee — monthly or
        annual — in exchange for a defined bundle of legal services each
        period. The exact bundle varies by firm and by plan, but it almost
        always includes some combination of:
      </P>

      <UL>
        <LI>
          <Strong>A set number of attorney work items per month</Strong> — a
          contract drafted or reviewed, a letter sent, a document marked up, or
          a short consultation.
        </LI>
        <LI>
          <Strong>Unlimited or generous quick questions</Strong> — the
          &ldquo;can I do this?&rdquo; emails that used to feel too small to be
          worth a phone call and a bill.
        </LI>
        <LI>
          <Strong>Access to a template library</Strong> — vetted starting points
          for the agreements a business signs over and over.
        </LI>
        <LI>
          <Strong>A relationship with an attorney who keeps your context</Strong>{" "}
          — so you are not re-explaining your business every time something comes
          up.
        </LI>
      </UL>

      <P>
        The defining feature is predictability. You know exactly what you will
        pay before you pick up the phone, which means you actually pick up the
        phone — and small legal problems get handled before they become large,
        expensive ones.
      </P>

      <H2>Why the hourly model fails small businesses</H2>

      <P>
        The billable hour is not evil. It is just badly matched to how a small
        business experiences legal risk. Three things go wrong:
      </P>

      <H3>1. The meter discourages you from calling</H3>
      <P>
        When every question costs money you cannot predict, you ration your
        questions. You sign the lease without having anyone read the personal
        guarantee. You use the contract template you found online instead of
        asking whether it protects you. The hourly model quietly trains small
        business owners to avoid their own lawyer — which is the opposite of
        what good legal help is for.
      </P>

      <H3>2. The bill arrives after the decision</H3>
      <P>
        By the time you see the invoice, the work is done and the choice is
        made. There is no shopping, no budgeting, no comparing. You find out
        what it cost after it is too late to decide it was too much.
      </P>

      <H3>3. Incentives point the wrong way</H3>
      <P>
        Hourly billing rewards time spent, not problems solved. That does not
        make hourly lawyers dishonest — most are not — but it does mean the
        pricing model and the client&apos;s interest are pulling in opposite
        directions. A flat fee flips that: the firm is rewarded for solving your
        problem efficiently, because its revenue is fixed whether the matter
        takes one hour or three.
      </P>

      <Callout title="The quiet cost of avoiding your lawyer">
        <P>
          The most expensive legal problems small businesses face are almost
          never the ones they paid a lawyer to look at. They are the
          handshake deal that was never papered, the contractor agreement that
          was never read, the AI tool that started making decisions about real
          people before anyone asked whether that was allowed. A subscription
          removes the reason to look away.
        </P>
      </Callout>

      <H2>How the pricing works — a real example</H2>

      <P>
        The cleanest way to understand subscription legal services is to look at
        an actual plan structure. Available Law runs four flat-rate tiers, and
        the math is deliberately simple:
      </P>

      <UL>
        <LI>
          <Strong>Explore — free.</Strong> Chat with Ava, our AI legal
          assistant, and store documents in an encrypted vault. No attorney
          tasks, no commitment. It exists so you can get value before you ever
          pay anything.
        </LI>
        <LI>
          <Strong>Build — $50/month.</Strong> Everything in Explore plus one
          attorney task each month — a document our AI drafts and a licensed
          Colorado attorney reviews and sends you, or a 30-minute attorney
          consult. Your choice each time.
        </LI>
        <LI>
          <Strong>Grow — $150/month.</Strong> Two attorney tasks a month,
          priority attorney replies within two business days, the contract
          template library, and a monthly practice letter.
        </LI>
        <LI>
          <Strong>Lead — $300/month.</Strong> Three attorney tasks a month, the
          fastest replies (one business day), a quarterly legal roadmap review,
          and early access to new tools. This is the on-call outside legal
          department tier.
        </LI>
      </UL>

      <P>
        Pay annually and you get two months free — Build is $500 a year instead
        of $600, and the same ten-for-twelve math runs up the line. The point of
        showing you the actual numbers is this: at $50 to $300 a month, a small
        business gets a real attorney relationship for less than it spends on
        most of its software subscriptions.
      </P>

      <Callout title="What counts as one &ldquo;attorney task&rdquo;">
        <P>
          One attorney task is a document our AI drafts and a licensed attorney
          reviews and sends you, or a 30-minute attorney consult — your choice
          each time. The allotment is yours to spend however the month
          demands.
        </P>
      </Callout>

      <H2>Subscription vs. retainer vs. hourly vs. legal insurance</H2>

      <P>
        &ldquo;Subscription&rdquo; gets confused with a few older models. Here
        is how they actually differ:
      </P>

      <UL>
        <LI>
          <Strong>Hourly.</Strong> You pay for time, billed after the fact, at a
          rate that commonly runs from a few hundred dollars an hour up. Maximum
          flexibility, minimum predictability.
        </LI>
        <LI>
          <Strong>Traditional retainer.</Strong> You pre-pay a lump sum into a
          trust account, and the firm draws against it at its hourly rate. It is
          really just prepaid hourly — when the balance runs out, you refill it.
          The meter is still running; you just paid in advance.
        </LI>
        <LI>
          <Strong>Subscription (sometimes called a &ldquo;subscription
          retainer&rdquo;).</Strong> A flat recurring fee for a defined bundle
          of work. The price does not move with the clock. This is the model in
          this article.
        </LI>
        <LI>
          <Strong>Legal insurance / prepaid legal plans.</Strong> You pay a
          small premium for access to a network of lawyers and discounted rates.
          Useful for some consumers, but the &ldquo;lawyer&rdquo; is usually
          whoever is available in the network, not a consistent relationship,
          and business coverage is often thin.
        </LI>
      </UL>

      <P>
        For an ongoing small business that signs contracts, hires people, and
        increasingly uses AI tools, the subscription model wins on the two
        things that matter most day to day: a predictable cost and a lawyer who
        already knows you.
      </P>

      <H2>Who subscription legal services are right for — and who they are not</H2>

      <H3>A good fit if you are</H3>
      <UL>
        <LI>
          A small business or startup with a steady drip of contracts, vendor
          agreements, hiring questions, and compliance issues.
        </LI>
        <LI>
          A founder who has been avoiding legal questions because you cannot
          predict the bill.
        </LI>
        <LI>
          A company adopting AI tools and unsure where the legal lines are —
          which is most companies in 2026.
        </LI>
      </UL>

      <H3>Probably not the right fit if you are</H3>
      <UL>
        <LI>
          In active, high-stakes litigation — that is hourly or contingency
          work, not subscription work.
        </LI>
        <LI>
          Doing a single one-time transaction (one LLC formation, one contract)
          with no ongoing need — a flat-fee project may be cheaper than a
          subscription you would cancel next month.
        </LI>
        <LI>
          A large company with an in-house legal team and a real budget for
          specialized outside counsel.
        </LI>
      </UL>

      <P>
        Honest subscription firms will tell you when you are in one of those
        categories. If a plan is wrong for your situation, paying monthly for it
        is not a deal.
      </P>

      <H2>How AI changes the economics</H2>

      <P>
        Flat-rate legal pricing used to be hard to sustain, because a lawyer
        could only do so much in a month and the math only worked at high
        prices. AI changes that equation. When an AI assistant handles the first
        draft, the research, and the document assembly, the attorney spends
        their time on judgment and review instead of typing — and the same
        attorney can serve more clients well at a lower price.
      </P>

      <P>
        The critical guardrail: the AI is an assistant, not the lawyer. At
        Available Law, Ava drafts and prepares, but every deliverable is
        reviewed by a licensed Colorado attorney before it reaches you, and Ava
        never autonomously gives legal advice. That is what makes a $50 plan
        possible without it being a $50 robot pretending to be a lawyer.
      </P>

      <H2>How to choose a subscription law firm</H2>

      <P>
        If you are comparing plans, ask:
      </P>

      <UL>
        <LI>
          <Strong>What exactly is included each month, in writing?</Strong> A
          number of attorney tasks beats a vague promise of &ldquo;access.&rdquo;
        </LI>
        <LI>
          <Strong>Is a licensed attorney reviewing the work?</Strong> Especially
          where AI is involved — you want a named, barred human accountable for
          what you receive.
        </LI>
        <LI>
          <Strong>How fast do they respond?</Strong> A guaranteed reply window
          is worth more than it sounds.
        </LI>
        <LI>
          <Strong>Can you cancel?</Strong> A real subscription does not trap
          you. If leaving is hard, that tells you something.
        </LI>
      </UL>

      <P>
        We wrote a full guide to this decision —{" "}
        <InlineLink href="/blog/how-to-choose-business-attorney-colorado">
          how to choose a small business attorney in Colorado
        </InlineLink>{" "}
        — that walks through the seven criteria that actually predict whether an
        attorney will be useful to your business.
      </P>

      <H2>Frequently asked questions</H2>

      <H3>What are subscription legal services?</H3>
      <P>
        Subscription legal services are a flat-fee model where a law firm
        provides a defined bundle of legal work — contract drafting and review,
        quick attorney questions, and consultations — for a predictable monthly
        or annual price, instead of billing by the hour.
      </P>

      <H3>How much do subscription legal services cost?</H3>
      <P>
        Plans for small businesses commonly run from around $50 to a few hundred
        dollars a month, scaling with how much attorney work is included.
        Available Law&apos;s tiers are $0 (Explore), $50 (Build), $150 (Grow),
        and $300 (Lead) per month, with two months free on annual billing.
      </P>

      <H3>Is a legal subscription cheaper than hiring a lawyer hourly?</H3>
      <P>
        For a business with ongoing, routine legal needs, almost always — and
        more importantly, it is predictable. A single hourly matter can cost
        more than a year of a subscription. For a one-time transaction with no
        follow-on work, a flat-fee project may be cheaper. We break the numbers
        down in our guide to{" "}
        <InlineLink href="/blog/small-business-lawyer-cost-colorado">
          what a small business lawyer costs
        </InlineLink>
        .
      </P>

      <H3>Do I still get a real attorney with a subscription plan?</H3>
      <P>
        Yes. A legitimate subscription firm pairs you with a licensed attorney
        who reviews your work and is accountable for it. AI may speed up the
        drafting, but a barred attorney should be reviewing every deliverable
        before it reaches you.
      </P>

      <H2>The bottom line</H2>

      <P>
        Subscription legal services turn law from an emergency purchase into a
        standing relationship — predictable, affordable, and there before the
        problem gets expensive. If your business signs contracts, hires people,
        or uses AI, that standing relationship is worth more than the occasional
        panicked hourly call.
      </P>

      <P>
        You can{" "}
        <InlineLink href="/#pricing">
          compare Available Law&apos;s flat-rate plans
        </InlineLink>{" "}
        in about two minutes, start free on the Explore tier, and talk to Ava
        before you ever pay anything. If your business uses AI, our{" "}
        <InlineLink href="/ai-act-checker">free AI Act readiness checker</InlineLink>{" "}
        will show you in a few questions where your compliance gaps are.
      </P>

      <LegalDisclaimer />
    </>
  );
}
