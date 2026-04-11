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
 * AI vendor contract clauses — the practical business owner's guide.
 *
 * Editorial notes:
 * - Primary keyword targets: "AI vendor contract", "AI vendor agreement",
 *   "AI contract review", "AI vendor clauses", "AI vendor indemnification".
 * - Written for business owners who are signing SaaS and AI contracts, not
 *   for lawyers negotiating master services agreements.
 * - Each clause explains (a) what the default language usually says, (b) why
 *   the default is a problem, and (c) what to ask for instead.
 */
export default function AiVendorContractClausesArticle() {
  return (
    <>
      <Lead>
        Every AI vendor contract we review has at least one landmine buried in
        it. The vendors who draft them know what they are doing — the contracts
        are designed to protect the vendor, not you. Here are the five clauses
        every business should pay attention to before signing an AI vendor
        agreement, and the specific language to negotiate in each one.
      </Lead>

      <P>
        If your business deploys AI — whether you built it or you are just a
        customer of a SaaS tool with AI features — you are responsible for
        what that AI does to your customers, your employees, and anyone else
        who interacts with it. The Colorado AI Act and similar laws emerging
        in other states assume that the business deploying the AI has
        contractual visibility into what the vendor built. If your contract
        does not give you that visibility, you are taking on risk the vendor
        should be bearing.
      </P>

      <P>
        Here is what to look for before you sign.
      </P>

      <H2>1. Training data indemnification</H2>

      <H3>What the default usually says</H3>
      <P>
        Most AI vendor contracts have a generic IP indemnification clause that
        promises to defend you if someone sues you for infringement based on
        the vendor&apos;s product. That sounds fine until you read the
        exclusions, which frequently carve out{" "}
        <Strong>training data</Strong>, <Strong>model outputs</Strong>, and
        &ldquo;derivative uses&rdquo; by the customer.
      </P>

      <H3>Why that matters</H3>
      <P>
        AI models are trained on enormous corpora of text, images, or code. A
        meaningful amount of the litigation in 2024 and 2025 over generative
        AI has been about whether that training data was lawfully used. If a
        right-holder sues you because an output from the vendor&apos;s model
        allegedly reproduces copyrighted material, and the vendor&apos;s
        indemnification carves out training data, you are on your own.
      </P>

      <H3>What to ask for instead</H3>
      <P>
        Push for an indemnification that explicitly covers third-party claims
        arising out of the training data the vendor used, the outputs the
        model produces in response to customer inputs, and the use of those
        outputs in the customer&apos;s ordinary course of business. Get
        specific dollar limits in writing — uncapped indemnification is
        better, but a cap pegged to contract value (for example, 12 months of
        fees) is a reasonable middle ground for smaller deals.
      </P>

      <Callout title="Red flag language">
        <P>
          Watch out for clauses that tie indemnification to &ldquo;customer
          providing reasonable assistance&rdquo; or &ldquo;vendor&apos;s sole
          control of the defense.&rdquo; Those are fine in principle but often
          get weaponized to withdraw indemnification the moment the customer
          disagrees with the vendor&apos;s litigation strategy. Add language
          requiring good-faith cooperation and reasonable defense.
        </P>
      </Callout>

      <H2>2. Ownership of model outputs</H2>

      <H3>What the default usually says</H3>
      <P>
        Many AI vendor contracts are ambiguous about who owns the outputs the
        model produces in response to the customer&apos;s inputs. Some say the
        customer owns &ldquo;customer content,&rdquo; which is then defined in
        a way that arguably excludes model outputs. Others grant the customer a
        license to use outputs &ldquo;subject to the vendor&apos;s terms of
        service,&rdquo; which is a moving target.
      </P>

      <H3>Why that matters</H3>
      <P>
        If your business is using AI outputs in customer-facing work product —
        contracts, marketing copy, customer support responses, analyses,
        designs — you need clean ownership. You cannot build your work on top
        of content that is subject to a license the vendor can revoke or
        change.
      </P>

      <H3>What to ask for instead</H3>
      <P>
        The contract should say, in plain English, that the customer owns all
        outputs the model generates in response to the customer&apos;s inputs,
        subject only to the intellectual property rights of third parties. The
        vendor should explicitly disclaim any ongoing license or retained
        rights in those outputs. If the vendor insists on a license-back for
        model improvement, it should be narrowly scoped and the customer
        should have the right to opt out.
      </P>

      <H2>3. Data rights and training opt-out</H2>

      <H3>What the default usually says</H3>
      <P>
        A surprising number of AI vendors reserve the right to use customer
        data — including the prompts, queries, and documents the customer
        uploads — to train or improve their models. The language is usually
        buried in a section called &ldquo;service improvement&rdquo; or
        &ldquo;aggregated data,&rdquo; and it often does not require any
        additional consent.
      </P>

      <H3>Why that matters</H3>
      <P>
        If your customers&apos; or employees&apos; data is flowing into a
        vendor&apos;s training pipeline, you have a privacy problem, a
        confidentiality problem, and a Colorado AI Act documentation problem
        all at once. You cannot demonstrate compliance with disclosure and
        documentation duties if you do not know what the vendor is doing with
        your data.
      </P>

      <H3>What to ask for instead</H3>
      <P>
        Get a written commitment that customer data will not be used to train
        any model — not the vendor&apos;s main model, not a fine-tune, not an
        embeddings database — without separate, written consent. If the
        vendor wants the right to use aggregated and de-identified data for
        analytics, define exactly what counts as de-identification and
        require contractual commitments on the de-identification process.
      </P>

      <Callout title="What &ldquo;anonymized&rdquo; actually means">
        <P>
          Vendors love the word &ldquo;anonymized.&rdquo; It usually means
          very little. Modern re-identification research has shown that even
          robustly anonymized datasets can frequently be linked back to
          individuals with a surprisingly small amount of auxiliary data.
          Insist on a specific, standards-based de-identification method —
          not a marketing word.
        </P>
      </Callout>

      <H2>4. Bias audits and transparency</H2>

      <H3>What the default usually says</H3>
      <P>
        Most AI vendor contracts are silent on bias auditing and model
        transparency. Some have aspirational language in a &ldquo;responsible
        AI&rdquo; section that commits the vendor to industry best practices,
        but that language is rarely operational. You cannot enforce
        &ldquo;we take responsible AI seriously&rdquo; in a courtroom.
      </P>

      <H3>Why that matters</H3>
      <P>
        The Colorado AI Act requires deployers to use reasonable care to
        avoid algorithmic discrimination. If you cannot get the vendor to
        share bias audit results, disparate-impact testing, or at least the
        structure of the model, you cannot meet that duty. A deployer who
        argues &ldquo;the vendor wouldn&apos;t tell us&rdquo; is making a
        compliance argument, not a defense.
      </P>

      <H3>What to ask for instead</H3>
      <P>
        Require the vendor to share, at least annually, a written summary of
        the bias audits and fairness testing they have run on the model. For
        high-risk use cases, require them to run additional testing against
        the specific demographics and outcome categories your business cares
        about. Require prompt notice if the vendor discovers a material
        disparate-impact issue in production.
      </P>

      <H2>5. Termination for regulatory change</H2>

      <H3>What the default usually says</H3>
      <P>
        AI vendor contracts almost always include a termination clause that
        lets the vendor walk away with notice, and a separate one that lets
        the customer walk away only for material breach. There is often no
        provision at all for what happens if the regulatory environment
        changes in a way that makes the product unusable in your jurisdiction.
      </P>

      <H3>Why that matters</H3>
      <P>
        2026 is going to see a lot of new state AI legislation. Colorado is
        first, but California, New York, Connecticut, Texas, and several
        others have drafts in circulation. If a new law makes the
        vendor&apos;s product non-compliant in a key jurisdiction for your
        business, and your contract is a three-year lock-in, you are paying
        for something you cannot lawfully use.
      </P>

      <H3>What to ask for instead</H3>
      <P>
        Add a regulatory-change termination right. If new federal, state, or
        local legislation makes the product unlawful or materially impractical
        to use in a jurisdiction where the customer operates, the customer
        should have the right to terminate with pro-rata refund of any prepaid
        fees. Pair this with a vendor obligation to notify the customer
        promptly when the vendor becomes aware of such a change.
      </P>

      <H2>How to actually do this review</H2>

      <P>
        You do not need to renegotiate every AI vendor contract from scratch.
        A realistic approach for a small business looks like this:
      </P>

      <UL>
        <LI>
          Start with your most-used AI tools — the ones processing employee
          data, customer data, or decisions about real people.
        </LI>
        <LI>
          Pull the contracts and read them against the five clauses above.
        </LI>
        <LI>
          Flag every clause where the default falls short. Send a redline to
          the vendor or ask for a side letter.
        </LI>
        <LI>
          If the vendor refuses to negotiate and the contract is materially
          problematic, document that fact. That documentation is part of the
          paper trail that proves you exercised reasonable care.
        </LI>
        <LI>
          On every new AI vendor procurement going forward, bake the five
          clauses into your standard negotiation playbook.
        </LI>
      </UL>

      <P>
        Available Law reviews AI vendor contracts as a standard part of{" "}
        <InlineLink href="/faiir">FAIIR certification</InlineLink> and as a
        standalone work item under our{" "}
        <InlineLink href="/#pricing">flat-rate subscription plans</InlineLink>
        . If you want to see how your current AI vendor contracts stack up
        against the Colorado AI Act&apos;s deployer duties, our{" "}
        <InlineLink href="/ai-act-checker">
          free readiness checker
        </InlineLink>{" "}
        will flag vendor management as a specific gap when it applies to your
        situation.
      </P>

      <P>
        And if you have not yet read our{" "}
        <InlineLink href="/blog/colorado-ai-act-2026">
          plain-language walkthrough of the Colorado AI Act
        </InlineLink>
        , that is the place to start — the clauses above exist because the
        statute&apos;s duties exist, and understanding the duties makes the
        contract review make sense.
      </P>

      <LegalDisclaimer />
    </>
  );
}
