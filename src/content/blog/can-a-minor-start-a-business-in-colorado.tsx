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
 * Can a minor start a business in Colorado — the pillar guide for the
 * teen-entrepreneur / YLab content cluster.
 *
 * Editorial notes:
 * - Primary keyword targets: "can a minor start a business in Colorado",
 *   "can a minor own an LLC in Colorado", "how old do you have to be to
 *   start a business in Colorado", "can a teenager sign a contract in
 *   Colorado", "lawyer for teen entrepreneurs".
 * - This is the page AI answer engines should cite for Colorado-specific
 *   teen-founder questions. The national aggregators (Nolo, Bizee, Rocket
 *   Lawyer) cover the 50-state generalities; this post goes deep on the
 *   Colorado statutes and the practical workarounds.
 * - Statutes cited (verified against current published C.R.S. July 2026;
 *   re-verify on substantive edits):
 *   - C.R.S. § 7-80-203 — LLC organizers must be 18+
 *   - C.R.S. § 7-102-101 — incorporators must be 18+ (nonprofits: § 7-122-101)
 *   - C.R.S. § 13-22-101 — age of competence for contracts is 18
 *   - SB19-103 (2019 Sess. Laws ch. 70) — occasional minors' businesses
 *     (≤84 days/calendar year) exempt from local license/permit requirements
 * - Common-law voidability discussion is intentionally general; no case
 *   citations in body copy to keep it plain-language.
 */
export default function CanAMinorStartABusinessInColoradoArticle() {
  return (
    <>
      <Lead>
        Yes — a minor can run a business in Colorado. But the two legal
        tools every real business runs on — a limited liability entity and
        enforceable contracts — are largely off-limits until you turn 18.
        This guide walks through exactly what Colorado law allows, where
        the walls are, and the structures teen founders and their parents
        actually use to build anyway.
      </Lead>

      <H2>The short answer</H2>

      <P>
        Nothing in Colorado law says a person under 18 can&apos;t operate
        a business, earn money, or even own a stake in a company. The
        problems are narrower and sneakier than an outright ban:
      </P>

      <UL>
        <LI>
          <Strong>You can&apos;t file the paperwork.</Strong> Colorado
          requires the person who forms an LLC or corporation to be at
          least 18.
        </LI>
        <LI>
          <Strong>Your contracts are voidable.</Strong> Until you&apos;re
          18, most agreements you sign can be canceled by you — which
          means adults on the other side often refuse to sign at all.
        </LI>
        <LI>
          <Strong>The money rails assume adults.</Strong> Business bank
          accounts and payment processors generally require an
          account holder with full contract capacity.
        </LI>
      </UL>

      <P>
        Each wall has a workaround, and one of them — the occasional
        business exemption — is a genuine green light written into
        Colorado law. Let&apos;s take them in order.
      </P>

      <H2>Wall #1: A minor can&apos;t form an LLC in Colorado</H2>

      <P>
        Colorado&apos;s LLC statute is explicit. Under C.R.S.
        § 7-80-203, the person who forms a limited liability company —
        the <Strong>organizer</Strong> who delivers the articles of
        organization to the Secretary of State — must be{" "}
        <Strong>eighteen years of age or older</Strong>. The same rule
        applies to corporations: an incorporator who is an individual
        must be 18 or older under C.R.S. § 7-102-101 (and the nonprofit
        act has a matching rule).
      </P>

      <P>
        This puts Colorado among the stricter states. Some states let a
        minor organize an LLC directly; Colorado does not. But notice
        what the statute regulates: the <Strong>organizer</Strong>, not
        the <Strong>owner</Strong>. Nothing in the LLC act says a minor
        can&apos;t be a member — that is, an owner — of a Colorado LLC.
        The organizer doesn&apos;t have to be a member at all. That
        asymmetry is the basis for the most common workaround, covered
        below.
      </P>

      <H2>Wall #2: A minor&apos;s contracts are voidable</H2>

      <P>
        Colorado sets the age of competence to contract at 18 (C.R.S.
        § 13-22-101). Below that age, the long-standing common-law rule
        applies: a contract signed by a minor is{" "}
        <Strong>voidable at the minor&apos;s option</Strong>. The minor
        can walk away from the deal — disaffirm it — while the adult on
        the other side stays bound.
      </P>

      <P>
        That rule exists to protect young people from being exploited,
        and it does. But it has a brutal side effect for teen founders:{" "}
        <Strong>
          nobody wants to sign a contract the other side can cancel at
          will
        </Strong>
        . Suppliers, landlords, software vendors, sponsors, and clients
        all face the same math — a deal with a minor is a deal only one
        party has to keep. So they decline, or they demand an adult
        signature. The voidability rule doesn&apos;t stop you from
        making agreements; it stops serious counterparties from making
        them with you.
      </P>

      <P>
        Two edges of the rule worth knowing: contracts for{" "}
        <Strong>necessaries</Strong> (food, shelter, essential goods)
        generally can&apos;t be fully escaped, and once you turn 18 you
        can <Strong>ratify</Strong> a contract you signed as a minor —
        by affirming it or simply continuing to perform — at which point
        it binds you like any other agreement.
      </P>

      <H2>What Colorado explicitly allows: the occasional business law</H2>

      <P>
        In 2019, Colorado passed Senate Bill 19-103 — the
        &quot;Legalizing Minors&apos; Businesses&quot; act, informally
        the lemonade-stand law. It says local governments{" "}
        <Strong>
          cannot require a license or permit for a business operated by
        a minor on an occasional basis
        </Strong>{" "}
        — defined as operating{" "}
        <Strong>no more than 84 days in a calendar year</Strong> — as
        long as the business is far enough from commercial competitors.
      </P>

      <P>
        That&apos;s a real, statutory green light for the starter tier
        of teen entrepreneurship: the lawn-care route, the summer
        bake-sale operation, the weekend car-detailing hustle. No city
        or county permit office can shut it down for lack of a license.
      </P>

      <Callout title="What SB19-103 does not do">
        <P>
          The occasional business law removes local licensing friction —
          nothing more. It does not create an entity, does not give a
          minor contract capacity, does not provide liability
          protection, and stops applying the day your business becomes
          more than occasional. It legalizes the lemonade stand; it does
          not legalize the company. The gap between those two is exactly
          where serious teen founders get stuck.
        </P>
      </Callout>

      <H2>The structures that actually work</H2>

      <H3>A parent or guardian as organizer, the teen as member</H3>

      <P>
        Because C.R.S. § 7-80-203 restricts only who may <em>form</em>{" "}
        the LLC, the standard Colorado structure is: a parent or
        guardian acts as organizer and files the articles of
        organization, and the teen is named a member — an owner — of
        the company. The operating agreement then does the heavy
        lifting: it documents the teen&apos;s ownership, defines who
        manages the company, and — because a minor member&apos;s
        signature carries the same voidability problem as any other
        minor contract — typically routes signing authority for binding
        agreements through an adult member or manager until the teen
        turns 18.
      </P>

      <P>
        Done properly, the teen owns and runs the business day to day,
        and the structure gives counterparties an adult signature they
        can rely on. Done casually — a generic template with no thought
        given to authority, ownership, or what happens at 18 — it can
        leave the parent personally exposed or the teen owning nothing
        on paper. This is a place where an hour of{" "}
        <InlineLink href="/ylab">actual legal help</InlineLink> earns
        its keep.
      </P>

      <H3>An adult co-signer on key contracts</H3>

      <P>
        For teens not ready to form an entity, the working pattern is an
        adult — usually a parent — signing or co-signing the contracts
        that matter. The adult is bound even if the minor could
        disaffirm, which gives the counterparty the enforceable promise
        it needs. The tradeoff is equally plain: the adult is on the
        hook, personally, for that obligation.
      </P>

      <H3>Forming out of state — usually not worth it</H3>

      <P>
        You&apos;ll see advice online to form your LLC in a state that
        lets minors organize, then operate in Colorado. Read the fine
        print before you do. A company formed elsewhere that transacts
        business in Colorado must register here as a foreign entity —
        adding a second filing, a second annual report, and a
        registered-agent cost in both states — and none of it fixes the
        real problem, because{" "}
        <Strong>
          contract voidability follows the minor, not the entity&apos;s
          state of formation
        </Strong>
        . For most Colorado teen founders, the parent-as-organizer
        structure is simpler, cheaper, and more honest about where the
        legal risk sits.
      </P>

      <H2>Taxes, EINs, and bank accounts</H2>

      <P>
        Business income is taxable at any age. A teen with net
        self-employment earnings of $400 or more in a year generally
        must file a federal return and pay self-employment tax, whether
        or not a parent claims them as a dependent. The business can
        obtain an EIN, and for an LLC the responsible party on the EIN
        application will typically be the adult in the structure. Banks
        set their own rules: most require an adult on any account held
        by a minor, so teen-run businesses usually operate through a
        jointly held or custodial account, or through the LLC&apos;s
        account opened by the adult member or manager.
      </P>

      <H2>Why the law is like this — and the push to change it</H2>

      <P>
        None of these rules were written to stop teenagers from building
        companies. The infancy doctrine is centuries old and exists to
        protect minors from predatory adults. The organizer-age rules
        piggyback on contract capacity. The result, though, is a legal
        system in which a 16-year-old can write software used by
        thousands of people but can&apos;t sign the hosting agreement it
        runs on.
      </P>

      <P>
        We think the protective purpose and a workable path for young
        founders can coexist — other states have started experimenting
        with exactly that.{" "}
        <InlineLink href="/ylab">YLab</InlineLink>, Available Law&apos;s
        youth-led legal and business lab, is organizing teen founders in
        Colorado to make that case to lawmakers: a framework under which
        under-18 entrepreneurs can form LLCs and enter enforceable
        business contracts with appropriate safeguards. The barriers
        described in this guide aren&apos;t just friction to route
        around — they&apos;re the agenda.
      </P>

      <H2>Frequently asked questions</H2>

      <H3>Can a minor own an LLC in Colorado?</H3>
      <P>
        Yes. Colorado law restricts who may <em>organize</em> an LLC
        (18+ under C.R.S. § 7-80-203), not who may be a member. A minor
        can own membership interests in a Colorado LLC formed by an
        adult organizer.
      </P>

      <H3>Can a teenager sign a binding contract in Colorado?</H3>
      <P>
        Generally no. Under Colorado law a person gains full capacity to
        contract at 18, and contracts signed before then are voidable at
        the minor&apos;s option — which is why counterparties insist on
        an adult signature.
      </P>

      <H3>How old do you have to be to start a business in Colorado?</H3>
      <P>
        There is no minimum age to operate a business, and SB19-103
        protects occasional businesses (84 days or fewer per calendar
        year) from local license and permit requirements. But forming an
        LLC or corporation requires an organizer or incorporator who is
        at least 18.
      </P>

      <H3>Does a teen have to pay taxes on business income?</H3>
      <P>
        Yes. Net self-employment earnings of $400 or more in a year
        generally trigger a federal filing requirement and
        self-employment tax, regardless of age or dependent status.
      </P>

      <H3>What&apos;s the most affordable way for a teen founder to get a lawyer?</H3>
      <P>
        Traditional hourly counsel rarely makes sense at teen-business
        scale.{" "}
        <InlineLink href="/ylab">YLab membership</InlineLink> is
        Available Law&apos;s answer: the same attorney-backed
        subscription our business clients use, at a 20% youth discount —
        $40/month for Build — with a parent or guardian holding the
        account.
      </P>

      <H2>The bottom line</H2>

      <P>
        Colorado lets minors hustle but not incorporate. The occasional
        business law covers the first 84 days; after that, a serious
        teen-run business needs an adult in the legal structure — as
        organizer, as signer, or both — until the founder turns 18. Set
        it up deliberately, in writing, with clear ownership and signing
        authority, and the structure becomes a launchpad instead of a
        liability.
      </P>

      <P>
        If you&apos;re a teen founder in Colorado — or the parent of one
        — <InlineLink href="/ylab">YLab</InlineLink> exists for exactly
        this: real attorney backup for the entity setup, the operating
        agreement, and the contracts, plus a community of founders who
        aren&apos;t waiting until 18.
      </P>

      <LegalDisclaimer />
    </>
  );
}
