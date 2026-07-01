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
 * Colorado's Chatbot Safety Act (HB 26-1263) for business owners.
 *
 * Editorial notes:
 * - Primary keyword targets: "Colorado chatbot law", "HB 26-1263", "AI chatbot
 *   disclosure requirements", "chatbot law for businesses", "Colorado
 *   conversational AI law", "AI chatbot legal requirements 2027".
 * - First-in-nation angle = news/SEO gold; almost no plain-language coverage
 *   for SMBs exists yet. The "who is an operator" section is the load-bearing
 *   analysis — most SMBs embed a vendor's chatbot and are likely NOT operators,
 *   but need vendor diligence + marketing-copy hygiene either way.
 * - Facts: HB 26-1263 signed May 29, 2026; operator duties apply beginning
 *   Jan 1, 2027; same AG rulemaking/comment window (through July 13, 2026) as
 *   the ADMT Act. The licensed-professional prohibition is directly relevant
 *   to Available Law's own Ava setup — used as the worked example.
 */
export default function ColoradoChatbotLawArticle() {
  return (
    <>
      <Lead>
        Colorado quietly became the first state in the country to pass a law
        specifically regulating AI chatbots. House Bill 26-1263 — the Chatbot
        Safety Act — was signed May 29, 2026, and its duties kick in January 1,
        2027. Most of the headlines are about protecting minors, and rightly so.
        But two pieces of this law matter to ordinary businesses: who counts as
        a chatbot &ldquo;operator,&rdquo; and a prohibition on marketing your
        bot as the equivalent of a licensed professional. Here is the
        plain-language version.
      </Lead>

      <H2>What the law covers</H2>

      <P>
        <InlineLink href="https://leg.colorado.gov/bills/HB26-1263">
          HB 26-1263
        </InlineLink>{" "}
        regulates &ldquo;conversational artificial intelligence services&rdquo;
        — AI systems accessible to the general public that primarily simulate
        human conversation through adaptive text, visual, or audio
        communication. Think companion apps, general-purpose chat assistants,
        and character bots: software whose product <em>is</em> the
        conversation.
      </P>

      <P>Beginning January 1, 2027, operators of these services must:</P>

      <UL>
        <LI>
          <Strong>Disclose that the AI is AI.</Strong> Users must be told they
          are talking to artificial intelligence, not a human.
        </LI>
        <LI>
          <Strong>Run a self-harm protocol.</Strong> Operators need a real,
          documented protocol for responding when users express suicidal
          ideation or self-harm.
        </LI>
        <LI>
          <Strong>Estimate user age and protect minors.</Strong> Using
          commercially reasonable methods, operators must estimate age and, for
          minors, block sexually explicit content, avoid design that fosters
          simulated emotional dependence, skip engagement-bait rewards, and
          provide privacy and account-management tools.
        </LI>
        <LI>
          <Strong>Report annually to the Attorney General</Strong> on their
          protocols and safeguards.
        </LI>
        <LI>
          <Strong>Never claim the bot is a licensed professional.</Strong> An
          operator may not state that the chatbot&apos;s output is provided by,
          endorsed by, or equivalent to the services of a licensed or certified
          professional — a lawyer, doctor, therapist, accountant, and so on.
        </LI>
      </UL>

      <H2>The question that decides everything: are you an &ldquo;operator&rdquo;?</H2>

      <P>
        Here is the part that matters for the average business owner reading
        this with a support chatbot on their website: the act targets entities
        that <Strong>develop and make publicly available</Strong> a
        conversational AI service. A plumbing company that embeds a
        vendor&apos;s customer-service widget is in a very different position
        from the company that built the chatbot product. Most small businesses
        using an off-the-shelf chatbot are likely customers of an operator, not
        operators themselves — though where exactly the line falls (heavily
        customized bots, white-labeled bots, bots trained on your data) is one
        of the things the Attorney General&apos;s rulemaking should clarify.
      </P>

      <Callout title="Comment window open now">
        <P>
          The AG&apos;s office opened public comment on the rules implementing
          both this law and the ADMT Act on June 23, and the window runs through
          July 13, 2026. If you build, white-label, or heavily customize a
          chatbot, the &ldquo;who is an operator&rdquo; question is worth a
          two-page letter.{" "}
          <InlineLink href="/blog/colorado-ai-rules-public-comment-2026">
            Here is how to comment
          </InlineLink>
          .
        </P>
      </Callout>

      <H2>Even if you are not an operator, do these three things</H2>

      <UL>
        <LI>
          <Strong>Ask your chatbot vendor the compliance question.</Strong> Will
          the widget disclose it is AI? Does the vendor have a self-harm
          protocol and minor safeguards? Get it in writing — ideally in the
          contract, alongside{" "}
          <InlineLink href="/blog/5-ai-vendor-contract-clauses">
            the other AI vendor clauses you are probably missing
          </InlineLink>
          .
        </LI>
        <LI>
          <Strong>Audit your marketing copy.</Strong> The
          licensed-professional prohibition is about how the bot is presented.
          If your website says the chatbot gives &ldquo;expert legal
          answers,&rdquo; &ldquo;medical advice,&rdquo; or &ldquo;your AI
          therapist,&rdquo; fix that language now — it is also the kind of
          claim that invites consumer-protection trouble under existing law,
          chatbot act or not.
        </LI>
        <LI>
          <Strong>Label the bot.</Strong> Whatever the statute ultimately
          requires of you, &ldquo;you are chatting with an AI assistant&rdquo;
          is free, honest, and builds trust. There is no scenario where clear
          disclosure hurts you.
        </LI>
      </UL>

      <H2>How we handle this ourselves</H2>

      <P>
        Available Law runs a public-facing AI assistant — Ava — so this law is
        not hypothetical for us. Ava is labeled as an AI assistant, does not
        give legal advice, and everything she drafts for clients is reviewed by
        a licensed Colorado attorney before it goes anywhere. That last part is
        the design principle behind the statute&apos;s
        licensed-professional rule: the line between &ldquo;AI that helps a
        professional serve you&rdquo; and &ldquo;AI pretending to be the
        professional&rdquo; is exactly the line Colorado just drew. We wrote
        about that line long before this law in{" "}
        <InlineLink href="/blog/ai-business-consulting-vs-legal-counsel">
          AI business consulting vs. AI legal counsel
        </InlineLink>
        .
      </P>

      <H2>How this fits the bigger 2026–2027 picture</H2>

      <P>
        The Chatbot Safety Act is one of three moving pieces in Colorado right
        now: the original AI Act is{" "}
        <InlineLink href="/blog/colorado-ai-act-in-effect-2026">
          technically in effect with enforcement paused
        </InlineLink>
        , the replacement ADMT Act takes over January 1, 2027, and the chatbot
        duties arrive the same day. If your business both uses AI in decisions
        (hiring, lending, housing) and runs a public chatbot, you have two sets
        of duties landing on the same date — which is a reason to consolidate
        the work into one AI-governance effort, not two scrambles.
      </P>

      <H2>Frequently asked questions</H2>

      <H3>What is Colorado&apos;s new chatbot law?</H3>
      <P>
        HB 26-1263, the Chatbot Safety Act, signed May 29, 2026 and effective
        January 1, 2027. It requires operators of public conversational AI
        services to disclose that the AI is AI, run a self-harm response
        protocol, estimate user age and protect minors, report annually to the
        Attorney General, and never present the bot as equivalent to a licensed
        professional.
      </P>

      <H3>Does the chatbot law apply to the support widget on my website?</H3>
      <P>
        Probably not directly — the act targets those who develop and make
        publicly available a conversational AI service, and it is aimed at
        systems that primarily simulate human conversation. A business embedding
        a vendor&apos;s support bot is likely the operator&apos;s customer, not
        the operator. But the boundary will be sharpened in rulemaking, and you
        should confirm your vendor complies either way.
      </P>

      <H3>Can I market my chatbot as an &ldquo;AI lawyer&rdquo; or &ldquo;AI doctor&rdquo;?</H3>
      <P>
        Colorado&apos;s chatbot act prohibits operators from stating that a
        bot&apos;s output is provided by, endorsed by, or equivalent to a
        licensed or certified professional&apos;s services. Even outside the
        act, that kind of claim risks consumer-protection and
        unauthorized-practice problems. Present AI as a tool that supports
        professionals, not as the professional.
      </P>

      <H3>When do the chatbot rules take effect?</H3>
      <P>
        The operator duties apply beginning January 1, 2027 — the same day as
        Colorado&apos;s ADMT Act. The Attorney General&apos;s implementing
        rulemaking is underway now, with a public comment window through July
        13, 2026.
      </P>

      <H2>The bottom line</H2>

      <P>
        Colorado just wrote the country&apos;s first chatbot rulebook. If you
        build conversational AI, your compliance clock is running. If you just
        use it, your job is smaller but real: verify your vendor, fix your
        marketing language, and label the bot. All of it is easier now than
        after January 1.
      </P>

      <P>
        Want an attorney to look at your chatbot setup or vendor contract? It is
        one attorney task on any{" "}
        <InlineLink href="/#pricing">Available Law plan</InlineLink> — or start
        with the free{" "}
        <InlineLink href="/ai-act-checker">AI Act readiness checker</InlineLink>{" "}
        to map your overall exposure.
      </P>

      <LegalDisclaimer />
    </>
  );
}
