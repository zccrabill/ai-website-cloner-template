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
 * How much a small business lawyer costs — the pricing-model explainer.
 *
 * Editorial notes:
 * - Primary keyword targets: "how much does a small business lawyer cost",
 *   "small business attorney fees", "business lawyer cost", "flat fee vs hourly
 *   attorney", "legal retainer cost small business", "cost of a business
 *   attorney in Colorado".
 * - High commercial-research intent. The reader is trying to budget. We give
 *   honest ranges (hedged — no fabricated precise statistics), explain what
 *   drives cost, and route to the subscription model as the predictable option.
 * - Subscription tier numbers mirror src/lib/tiers.ts. Keep in sync.
 */
export default function SmallBusinessLawyerCostArticle() {
  return (
    <>
      <Lead>
        Small business legal costs range from a couple hundred dollars for a
        single document to five-figure bills for an ongoing dispute. The number
        that matters is not any single fee — it is how predictable your annual
        legal spend is. This is a plain breakdown of the four ways lawyers
        charge, what each actually costs, and how to estimate your year before
        you commit.
      </Lead>

      <P>
        &ldquo;How much does a small business lawyer cost?&rdquo; has the same
        honest answer as &ldquo;how much does a car cost?&rdquo; — it depends
        entirely on what you are buying and how you pay for it. The pricing model
        matters as much as the lawyer. Two attorneys of identical skill can leave
        you with wildly different bills depending on whether you hired them by
        the hour, by the project, or by the month.
      </P>

      <H2>The four ways lawyers charge</H2>

      <P>
        Almost every small business legal arrangement is one of these four:
      </P>

      <UL>
        <LI>
          <Strong>Hourly</Strong> — you pay for time spent, billed after the
          fact.
        </LI>
        <LI>
          <Strong>Flat fee</Strong> — a fixed price for a defined project.
        </LI>
        <LI>
          <Strong>Retainer</Strong> — a prepaid balance the firm draws against
          (usually at its hourly rate).
        </LI>
        <LI>
          <Strong>Subscription</Strong> — a flat recurring fee for an ongoing
          bundle of work.
        </LI>
      </UL>

      <P>
        Let us walk through what each one actually costs.
      </P>

      <H2>Hourly: maximum flexibility, minimum predictability</H2>

      <P>
        Hourly is the traditional default. Rates for small business attorneys
        vary widely by market, experience, and specialty, but for a solo or
        small-firm business lawyer they commonly run from a few hundred dollars
        an hour into the mid-hundreds, with big-firm, metro-market, and
        specialized rates climbing well beyond that. Specialized work — complex
        AI or technology matters, for instance — sits at the higher end because
        fewer lawyers do it.
      </P>

      <P>
        The trap is not the rate. It is the lack of a ceiling. A &ldquo;quick
        contract review&rdquo; can be one hour or four depending on what the
        lawyer finds, and you do not know which until the invoice arrives. For a
        single discrete question, hourly is fine. For an ongoing relationship,
        the unpredictability is the cost.
      </P>

      <Callout title="The six-minute increment">
        <P>
          Most hourly firms bill in tenths of an hour — six-minute units. A
          two-minute email about a question you were nervous to ask can show up
          on your bill as 0.1 hours. That rounding is standard and legal; it is
          also exactly why small business owners learn to stop emailing their
          lawyer.
        </P>
      </Callout>

      <H2>Flat fee: predictable, per project</H2>

      <P>
        For well-defined, repeatable work, many attorneys offer a flat fee:
        forming an LLC, drafting a standard contract, reviewing a lease. You
        know the price before you start. The figure depends heavily on
        complexity, but the value is the certainty — no meter, no surprise.
      </P>

      <P>
        Flat fees shine for one-time transactions. Their limit is that they only
        cover the defined scope: if the project grows, or you have a new question
        next month, that is a new fee. For a business with continuous legal
        needs, paying a fresh flat fee every time adds up and still leaves the
        in-between questions unanswered.
      </P>

      <H2>Retainer: two very different things share one word</H2>

      <P>
        &ldquo;Retainer&rdquo; causes more confusion than any other legal
        pricing term, because it means two different things:
      </P>

      <UL>
        <LI>
          <Strong>The classic (security) retainer</Strong> is a lump sum you
          pre-pay into a trust account. The firm bills its hourly rate against
          it and asks you to top it up when it runs low. This is just prepaid
          hourly — the meter is still running.
        </LI>
        <LI>
          <Strong>The subscription retainer</Strong> is a flat monthly fee for
          ongoing access and a defined bundle of work. The price does not move
          with the clock. This is the modern model — and it is what most people
          actually want when they say they want a lawyer &ldquo;on
          retainer.&rdquo;
        </LI>
      </UL>

      <P>
        If a firm quotes you a &ldquo;retainer,&rdquo; ask which one. The
        difference between prepaid hourly and a true flat subscription is the
        difference between a budget and a guess.
      </P>

      <H2>Subscription: the predictable option for ongoing needs</H2>

      <P>
        A subscription replaces the guess with a line item. You pay a flat
        monthly fee and get a defined amount of attorney work plus ongoing
        access. For a business that signs contracts, hires people, and uses
        software and AI tools, this is usually both the cheapest and the most
        predictable option over a year.
      </P>

      <P>
        Here is a real worked example. Available Law&apos;s flat tiers are:
      </P>

      <UL>
        <LI>
          <Strong>Explore — $0/month.</Strong> Ava AI legal assistant and
          encrypted document storage; no attorney tasks.
        </LI>
        <LI>
          <Strong>Build — $50/month ($500/year).</Strong> One attorney task a
          month.
        </LI>
        <LI>
          <Strong>Grow — $150/month ($1,500/year).</Strong> Two attorney tasks a
          month, two-business-day replies, template library.
        </LI>
        <LI>
          <Strong>Lead — $300/month ($3,000/year).</Strong> Three attorney tasks
          a month, one-business-day replies, quarterly roadmap review.
        </LI>
      </UL>

      <P>
        One attorney task is a document our AI drafts and a licensed attorney
        reviews and sends you, or a 30-minute consult — your choice. Annual
        billing gives you two months free. Put the Grow tier next to hourly: at
        $1,500 a year, it costs less than a handful of hours at a typical
        business-attorney rate — and it covers two attorney tasks every single
        month, plus the small questions in between.
      </P>

      <Callout title="Why the subscription math works">
        <P>
          Flat pricing used to force a high floor, because a lawyer&apos;s hours
          are finite. When an AI assistant handles the drafting and research and
          the attorney focuses on review and judgment, the same lawyer serves
          more clients well at a lower price. That is the whole reason a $50
          plan can include real attorney work.
        </P>
      </Callout>

      <H2>What drives your cost up</H2>

      <P>
        Regardless of model, four things push legal costs higher:
      </P>

      <UL>
        <LI>
          <Strong>Complexity.</Strong> A bespoke deal with unusual terms costs
          more than a standard agreement.
        </LI>
        <LI>
          <Strong>Urgency.</Strong> &ldquo;I need this today&rdquo; reorders
          someone&apos;s day, and you pay for that.
        </LI>
        <LI>
          <Strong>Specialization.</Strong> Niche areas — AI law, complex IP,
          regulated industries — command higher rates because fewer lawyers
          practice them.
        </LI>
        <LI>
          <Strong>Disputes.</Strong> Litigation is the great cost multiplier. It
          is open-ended by nature and lives outside the subscription model
          entirely.
        </LI>
      </UL>

      <H2>How to estimate your annual legal spend</H2>

      <P>
        A simple method that works for most small businesses:
      </P>

      <UL>
        <LI>
          List the legal events you can predict in a year — contracts you will
          sign, hires you will make, agreements that renew, compliance you owe.
        </LI>
        <LI>
          Count roughly how many would need an attorney task each month. For
          most small businesses the honest answer is one to three.
        </LI>
        <LI>
          Match that to a subscription tier, and treat anything unusual
          (litigation, a big M&amp;A-style transaction) as a separate,
          out-of-band cost.
        </LI>
      </UL>

      <P>
        If your honest answer is &ldquo;one to three attorney tasks a month plus
        some quick questions,&rdquo; a $50 to $300 subscription will almost
        always beat hourly on both total cost and predictability.
      </P>

      <H2>When cheaper is a false economy</H2>

      <P>
        The most expensive choice is usually skipping the lawyer entirely. The
        contract you did not have reviewed, the policy you copied off the
        internet, the AI tool you deployed without checking the law — those are
        the bills that arrive as lawsuits, not invoices. The point of an
        affordable, predictable model is to remove the reason to skip. For more
        on where DIY is genuinely fine and where it is not, see{" "}
        <InlineLink href="/blog/when-small-business-needs-lawyer">
          when your small business actually needs a lawyer
        </InlineLink>
        .
      </P>

      <H2>Frequently asked questions</H2>

      <H3>How much does a small business lawyer cost?</H3>
      <P>
        It depends on the pricing model. Hourly rates for small business
        attorneys commonly run from a few hundred dollars an hour up, with
        specialized and big-firm rates higher. Flat fees apply to defined
        projects. Subscription plans for ongoing needs commonly run about $50 to
        $300 a month. For a business with steady legal needs, a subscription is
        usually the lowest and most predictable total cost.
      </P>

      <H3>Is it cheaper to pay a lawyer hourly or on a flat fee?</H3>
      <P>
        For a single, well-defined task, a flat fee is usually cheaper and
        safer because the price is fixed up front. For ongoing needs, a flat
        monthly subscription typically beats both hourly and repeated
        flat-fee projects. Hourly only wins when the work is genuinely one-off
        and hard to scope.
      </P>

      <H3>What is a typical retainer for a small business lawyer?</H3>
      <P>
        It depends which kind of retainer. A classic security retainer is a
        prepaid balance billed against at the firm&apos;s hourly rate, so its
        size tracks expected hours. A subscription retainer is a flat monthly
        fee — commonly $50 to a few hundred dollars for small businesses — for a
        defined bundle of ongoing work.
      </P>

      <H3>How can a $50/month plan include real attorney work?</H3>
      <P>
        Because an AI legal assistant does the drafting and research, and the
        licensed attorney spends their time on review and judgment instead of
        typing. That leverage lets one attorney serve more clients well at a
        lower price — without removing the attorney from the loop.
      </P>

      <H2>The bottom line</H2>

      <P>
        Do not ask only &ldquo;how much per hour?&rdquo; Ask &ldquo;what will I
        spend this year, and how sure am I of that number?&rdquo; For most small
        businesses with steady, routine legal needs, a flat subscription answers
        both questions better than anything else — predictable cost, real
        attorney review, and no meter discouraging you from asking.
      </P>

      <P>
        You can{" "}
        <InlineLink href="/#pricing">compare Available Law&apos;s flat-rate plans</InlineLink>{" "}
        in a couple of minutes and start free on the Explore tier. If you want
        the deeper case for the model, read{" "}
        <InlineLink href="/blog/subscription-legal-services-small-business">
          how subscription legal services work for small business
        </InlineLink>
        .
      </P>

      <LegalDisclaimer />
    </>
  );
}
