/**
 * Colorado AI Act Readiness Assessment
 *
 * A 10-question business-facing assessment mapped to Colorado SB 26-189
 * (the Colorado AI Act, repeal-and-replace of SB 24-205, signed May 14, 2026
 * by Governor Polis and effective January 1, 2027). Used on /ai-act-checker
 * to generate a readiness score, RAG status, and a list of specific gaps
 * that feeds the FAIIR sales funnel.
 *
 * Why this rewrite: SB 26-189 repeals SB 24-205 in full and replaces the
 * risk-management framework (duty of care, risk management programs, impact
 * assessments, AG notification of algorithmic discrimination) with a much
 * lighter disclosure-based framework. The new statute is built around
 * "covered ADMT" — automated decision-making technology that materially
 * influences a consequential decision — and the duties center on pre-use
 * notice, post-adverse-outcome notice, meaningful human review, developer
 * documentation, and 3-year recordkeeping.
 *
 * Design notes:
 * - All questions are framed in plain business language — no legal jargon.
 * - Every question has exactly 3 answer options worth 10 / 5 / 0 points,
 *   giving a 0–100 maximum score.
 * - Each option has an associated `gap` string that describes what's missing
 *   when the respondent chooses that option. These are concatenated into the
 *   final report. "Best answer" options have empty gap strings.
 * - The `category` field lets us group gaps in the final report ("Notice,"
 *   "Human Review," etc.) without hardcoding that grouping elsewhere.
 * - Nothing in this file is legal advice — language is intentionally general.
 */

export type AnswerKey = "best" | "partial" | "none";

export interface AssessmentAnswer {
  key: AnswerKey;
  label: string;
  points: number;
  gap: string; // empty string = no gap when this is selected
}

export interface AssessmentQuestion {
  id: string;
  category:
    | "Scope"
    | "Pre-Use Notice"
    | "Adverse-Outcome Notice"
    | "Human Review"
    | "Consumer Data Rights"
    | "Developer Documentation"
    | "Recordkeeping"
    | "Anti-Discrimination"
    | "Incident Response"
    | "Vendor Management";
  prompt: string;
  helpText?: string;
  answers: [AssessmentAnswer, AssessmentAnswer, AssessmentAnswer];
}

export const QUESTIONS: AssessmentQuestion[] = [
  {
    id: "ai_use",
    category: "Scope",
    prompt:
      "Does your business use automated decision-making technology (ADMT) to make or materially influence decisions that affect people?",
    helpText:
      "Examples: resume screening, loan or pricing models, content moderation, fraud scoring, eligibility decisions, tenant screening, or insurance underwriting.",
    answers: [
      {
        key: "best",
        label: "Yes, and we have a written list of which systems and what they decide",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Yes, but we haven't formally inventoried them",
        points: 5,
        gap: "You haven't built an ADMT inventory. SB 26-189 obligations attach to 'covered ADMT' — technology that processes personal data to materially influence a consequential decision. Without an inventory, you can't determine which of your systems are in scope or which notice and human-review duties apply.",
      },
      {
        key: "none",
        label: "Not sure / probably",
        points: 0,
        gap: "The first step under the new Colorado AI Act is identifying every ADMT your business uses and which consequential decisions each one influences. Without that determination, you cannot meet the statute's notice, human-review, or recordkeeping duties.",
      },
    ],
  },
  {
    id: "covered_admt_classification",
    category: "Scope",
    prompt:
      "Have you determined which of your tools count as 'covered ADMT' under the new Colorado AI Act?",
    helpText:
      "'Covered ADMT' is automated technology that materially influences a consequential decision in education, employment, housing, lending, insurance, healthcare, or government services. Spell-checkers, calculators, and incidental clerical uses are excluded.",
    answers: [
      {
        key: "best",
        label: "Yes, classified in writing for each system",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "We've discussed it but not documented the classification",
        points: 5,
        gap: "An informal classification is not enough. The statute's deployer duties attach to covered ADMT specifically, and the Attorney General will expect a documented basis for the classifications you've made — including which exemptions you relied on.",
      },
      {
        key: "none",
        label: "No — we haven't looked at it",
        points: 0,
        gap: "Without classifying your ADMT against the 'covered ADMT' definition, you can't scope your compliance program. This is the single highest-priority action for Colorado businesses ahead of the January 1, 2027 effective date.",
      },
    ],
  },
  {
    id: "pre_use_notice",
    category: "Pre-Use Notice",
    prompt:
      "Do you provide a clear and conspicuous notice that ADMT is used in decisions, and instructions for consumers to learn more?",
    helpText:
      "SB 26-189 requires a public-facing notice — typically on your website at points of consumer interaction — that ADMT is involved and how consumers can request additional information.",
    answers: [
      {
        key: "best",
        label: "Yes, posted publicly with clear instructions",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Buried in a privacy policy or only on some pages",
        points: 5,
        gap: "Privacy-policy burial does not satisfy the statute's 'clear and conspicuous' standard. The notice has to be reasonably accessible at points of consumer interaction and has to spell out how to get more information.",
      },
      {
        key: "none",
        label: "We don't disclose this",
        points: 0,
        gap: "Failure to provide pre-use notice is a direct violation of SB 26-189's core disclosure duty and is the gap most likely to surface in a consumer complaint or AG inquiry.",
      },
    ],
  },
  {
    id: "adverse_outcome_notice",
    category: "Adverse-Outcome Notice",
    prompt:
      "When ADMT contributes to an adverse outcome for a person, do you send them a plain-language explanation within 30 days?",
    helpText:
      "The notice must describe the decision, the ADMT's role, instructions for requesting additional information about the inputs, and the consumer's rights.",
    answers: [
      {
        key: "best",
        label: "Yes, on a documented 30-day timeline with templated language",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "We notify, but ad-hoc or beyond 30 days",
        points: 5,
        gap: "SB 26-189 requires a plain-language adverse-outcome notice within 30 days, with a defined set of contents (description, ADMT role, request-for-information instructions, consumer rights). Late or inconsistent notices do not meet the statutory standard.",
      },
      {
        key: "none",
        label: "We don't send adverse-outcome notices",
        points: 0,
        gap: "Adverse-outcome notice is one of the two affirmative deployer duties under SB 26-189. Not sending it is a direct compliance failure and exposes the business to enforcement once the statute takes effect on January 1, 2027.",
      },
    ],
  },
  {
    id: "human_review",
    category: "Human Review",
    prompt:
      "When ADMT contributes to an adverse outcome, can consumers request meaningful human review by a trained person with authority to overturn the decision?",
    helpText:
      "'Meaningful human review' requires a person with authority to approve, modify, or override the decision, who considers relevant evidence, is trained, and does not default to the system's output.",
    answers: [
      {
        key: "best",
        label: "Yes, with named reviewers, training, and a documented process",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Yes, but the process is informal or untrained",
        points: 5,
        gap: "Ad-hoc review does not meet the statute's 'meaningful human review' standard. SB 26-189 requires the reviewer to have authority, training, and access to enough information about the system to second-guess it — not just rubber-stamp it.",
      },
      {
        key: "none",
        label: "No — adverse ADMT outcomes are final",
        points: 0,
        gap: "Consumers have a right to meaningful human review of adverse consequential decisions to the extent commercially reasonable. Offering no review path is a direct violation and the surest way to draw an enforcement action.",
      },
    ],
  },
  {
    id: "data_access",
    category: "Consumer Data Rights",
    prompt:
      "Can consumers access and correct the personal data that ADMT uses about them?",
    helpText:
      "SB 26-189 ties access and correction rights to the Colorado Privacy Act. Consumers cannot correct opinions, predictions, scores, or protected evaluations — only factually incorrect or materially inaccurate personal data.",
    answers: [
      {
        key: "best",
        label: "Yes, we have a documented intake and response process",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Sometimes, or only on request to support",
        points: 5,
        gap: "Without a documented access-and-correction workflow, you cannot reliably meet the response windows the statute incorporates from the Colorado Privacy Act. Inconsistent handling is also a litigation risk if a consumer can show their request went unanswered.",
      },
      {
        key: "none",
        label: "No process for this",
        points: 0,
        gap: "Access and correction are the core consumer rights SB 26-189 preserves from the prior law. Not having a process exposes you to both AG enforcement and reputational damage when a consumer complains publicly.",
      },
    ],
  },
  {
    id: "developer_documentation",
    category: "Developer Documentation",
    prompt:
      "For each ADMT vendor, have you obtained the developer documentation the statute requires — intended uses, data categories, known limitations, and human-review instructions?",
    helpText:
      "SB 26-189 requires developers to give deployers documentation sufficient to comply, including a statement of intended uses, training data categories (to the extent known), limitations and risks, and instructions for meaningful human review.",
    answers: [
      {
        key: "best",
        label: "Yes, on file for every covered ADMT vendor",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Some vendors, not all",
        points: 5,
        gap: "Partial developer documentation leaves you without the inputs you need to draft accurate consumer notices, do meaningful human review, or defend a regulatory inquiry. The developer's documentation is the deployer's foundation.",
      },
      {
        key: "none",
        label: "We've never asked for this",
        points: 0,
        gap: "Without developer documentation, you cannot complete the deployer-side duties under SB 26-189. This is a gap most Colorado businesses don't realize they have because their vendors haven't proactively offered the documentation.",
      },
    ],
  },
  {
    id: "recordkeeping",
    category: "Recordkeeping",
    prompt:
      "Do you keep records for at least three years showing how each covered ADMT was used and what notices were sent?",
    helpText:
      "Decision logs, copies of notices sent, vendor documentation, human-review outcomes, and any consumer access or correction responses.",
    answers: [
      {
        key: "best",
        label: "Yes, on a documented 3-year retention schedule",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Some records, but not on a defined schedule",
        points: 5,
        gap: "Inconsistent recordkeeping makes it impossible to demonstrate compliance during the AG's 60-day cure window. The statute expects a 3-year retention floor and structured records.",
      },
      {
        key: "none",
        label: "No structured records",
        points: 0,
        gap: "Recordkeeping is the spine of SB 26-189 compliance. Without records, you cannot defend a consumer complaint or respond to an AG cure notice with anything other than 'trust us.'",
      },
    ],
  },
  {
    id: "anti_discrimination",
    category: "Anti-Discrimination",
    prompt:
      "Do you monitor ADMT outcomes for disparate impact across protected classes?",
    helpText:
      "SB 26-189 removed the prior law's algorithmic-discrimination duty, but state anti-discrimination law still applies — and the statute now expressly preserves liability for discriminatory outcomes materially influenced by ADMT.",
    answers: [
      {
        key: "best",
        label: "Yes, on a regular schedule with documented results",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Only when a problem comes up",
        points: 5,
        gap: "Reactive monitoring is not enough. Under SB 26-189, developers and deployers can still be held liable in discrimination actions arising from ADMT-influenced decisions, and indemnity clauses purporting to shift that liability are void. Ongoing monitoring is the practical defense.",
      },
      {
        key: "none",
        label: "No monitoring",
        points: 0,
        gap: "The new statute did not eliminate algorithmic-discrimination risk — it preserved it by tying liability into state anti-discrimination law. A business that has never tested its ADMT for disparate outcomes has no defense if disparate outcomes surface later.",
      },
    ],
  },
  {
    id: "vendor_contracts",
    category: "Vendor Management",
    prompt:
      "Have you reviewed your ADMT vendor contracts for developer-documentation, audit, and indemnity terms?",
    helpText:
      "Including the right to receive ongoing documentation, indemnification for vendor-caused failures, data ownership, and clarification that indemnity for the deployer's own discriminatory conduct is unenforceable in Colorado.",
    answers: [
      {
        key: "best",
        label: "Yes, every ADMT vendor contract has been reviewed",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "We've reviewed some, not all",
        points: 5,
        gap: "Partial review leaves gaps — a single unreviewed vendor can introduce documentation, audit, or indemnity risk you haven't accounted for. SB 26-189 expects deployers to have contractual visibility into the vendor's compliance posture.",
      },
      {
        key: "none",
        label: "No — we use standard vendor terms as-is",
        points: 0,
        gap: "Standard ADMT vendor terms almost always shift documentation and audit burdens to the deployer. Without a targeted review, you are likely bearing risks that should be on the vendor's side of the contract.",
      },
    ],
  },
];

export const MAX_SCORE = QUESTIONS.length * 10; // 100

export type RagStatus = "green" | "amber" | "red";

export interface AssessmentResult {
  score: number;
  maxScore: number;
  rag: RagStatus;
  gaps: Array<{ category: string; gap: string }>;
  headline: string;
  summary: string;
  ctaText: string;
}

/**
 * Score a set of answers. `responses` is a map of questionId -> AnswerKey.
 */
export function scoreAssessment(
  responses: Record<string, AnswerKey>,
): AssessmentResult {
  let score = 0;
  const gaps: Array<{ category: string; gap: string }> = [];

  for (const q of QUESTIONS) {
    const chosenKey = responses[q.id];
    const answer = q.answers.find((a) => a.key === chosenKey);
    if (!answer) continue;
    score += answer.points;
    if (answer.gap) {
      gaps.push({ category: q.category, gap: answer.gap });
    }
  }

  const rag: RagStatus = score >= 80 ? "green" : score >= 50 ? "amber" : "red";

  const headline =
    rag === "green"
      ? "Strong foundation — keep it maintained"
      : rag === "amber"
        ? "Material gaps to close before January 1, 2027"
        : "High exposure under the new Colorado AI Act";

  const summary =
    rag === "green"
      ? "Your business has the core elements of an ADMT compliance program in place. The remaining work is mostly maintenance, notice-language refinement, and periodic monitoring. Our FAIIR certification can formalize what you already have and give you a defensible certificate to show customers, partners, and regulators."
      : rag === "amber"
        ? "You have some of the pieces but not a cohesive program. Colorado SB 26-189 takes effect January 1, 2027 and the disclosure-based framework is much faster to stand up than the prior law's risk-management regime — typically 3–6 weeks. A FAIIR assessment will prioritize which gaps to close first and give you a written roadmap."
        : "You are running ADMT in ways that the new Colorado AI Act regulates, without the notices, human-review process, or documentation the statute requires. This is a material legal and reputational risk. A FAIIR assessment is the fastest way to get organized and build the missing pieces before the January 1, 2027 effective date.";

  const ctaText =
    rag === "green"
      ? "Get FAIIR certified"
      : rag === "amber"
        ? "Start a FAIIR assessment"
        : "Book an urgent FAIIR consultation";

  return { score, maxScore: MAX_SCORE, rag, gaps, headline, summary, ctaText };
}
