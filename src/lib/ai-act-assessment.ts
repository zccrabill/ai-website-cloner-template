/**
 * Colorado AI Act Readiness Assessment
 *
 * A 10-question business-facing assessment mapped to Colorado SB24-205
 * (the Colorado AI Act) and adjacent best practices. Used on /ai-act-checker
 * to generate a readiness score, RAG status, and a list of specific gaps
 * that feeds the FAIIR sales funnel.
 *
 * Design notes:
 * - All questions are framed in plain business language — no legal jargon.
 * - Every question has exactly 3 answer options worth 10 / 5 / 0 points,
 *   giving a 0–100 maximum score.
 * - Each option has an associated `gap` string that describes what's missing
 *   when the respondent chooses that option. These are concatenated into the
 *   final report. "Best answer" options have empty gap strings.
 * - The `category` field lets us group gaps in the final report ("Governance,"
 *   "Disclosure," etc.) without hardcoding that grouping elsewhere.
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
    | "Governance"
    | "Impact Assessment"
    | "Disclosure"
    | "Human Review"
    | "Bias & Fairness"
    | "Documentation"
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
      "Does your business use AI systems to make or inform decisions that affect people?",
    helpText:
      "Examples: hiring tools, loan or pricing decisions, content moderation, fraud detection, eligibility screening, or employee monitoring.",
    answers: [
      {
        key: "best",
        label: "Yes, and we have a list of which systems and what they decide",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Yes, but we haven't formally inventoried them",
        points: 5,
        gap: "You haven't built an AI inventory. Colorado's AI Act requires deployers of high-risk AI to know which systems they operate and what decisions those systems influence. Without an inventory, you can't meet the disclosure or impact-assessment duties.",
      },
      {
        key: "none",
        label: "Not sure / probably",
        points: 0,
        gap: "The first step under the Colorado AI Act is knowing whether you're a 'deployer' of a 'high-risk AI system.' Without that determination, every other duty under the statute is impossible to meet.",
      },
    ],
  },
  {
    id: "high_risk_classification",
    category: "Scope",
    prompt:
      "Do you know which of your AI tools would qualify as 'high-risk' under state AI laws like Colorado's AI Act?",
    helpText:
      "'High-risk' generally includes AI used in employment, lending, housing, insurance, healthcare, education, legal services, and essential government services.",
    answers: [
      {
        key: "best",
        label: "Yes, we've classified them in writing",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "We've discussed it but not documented the classification",
        points: 5,
        gap: "You've identified high-risk systems informally but haven't created a written classification. The statute's duties attach to high-risk systems specifically, and regulators will expect a documented basis for the classifications you've made.",
      },
      {
        key: "none",
        label: "No — we haven't looked at it",
        points: 0,
        gap: "Without classifying your AI systems against the 'high-risk' definition, you can't scope your compliance program. This is the single highest-priority action for most Colorado businesses right now.",
      },
    ],
  },
  {
    id: "governance_policy",
    category: "Governance",
    prompt: "Do you have a written AI governance or risk management policy?",
    helpText:
      "A policy covering how you procure, deploy, monitor, and retire AI systems in your business.",
    answers: [
      {
        key: "best",
        label: "Yes, we have a written policy that's actively used",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "We have a draft or an informal approach",
        points: 5,
        gap: "The Colorado AI Act requires deployers of high-risk AI to implement a risk management policy 'reasonable' in light of the NIST AI Risk Management Framework or an equivalent standard. A draft policy that hasn't been finalized and adopted will likely not satisfy the duty of care.",
      },
      {
        key: "none",
        label: "No",
        points: 0,
        gap: "An AI risk management policy is one of the core obligations under the Colorado AI Act for deployers of high-risk AI. Without one, you have no defensible position if something goes wrong with an AI-driven decision.",
      },
    ],
  },
  {
    id: "impact_assessment",
    category: "Impact Assessment",
    prompt:
      "Before deploying a new AI system, do you conduct a documented impact assessment?",
    helpText:
      "An impact assessment looks at what the AI will do, what data it uses, who it affects, and what could go wrong.",
    answers: [
      {
        key: "best",
        label: "Always, and we store the documentation",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Sometimes, or informally",
        points: 5,
        gap: "Impact assessments are required under the Colorado AI Act for deployers of high-risk AI, and they must be documented and periodically updated. Informal assessments are unlikely to meet the statutory standard.",
      },
      {
        key: "none",
        label: "Never",
        points: 0,
        gap: "Colorado's AI Act requires deployers of high-risk AI to complete and document an impact assessment before deployment and annually thereafter. Not doing this is one of the most common and most citable compliance gaps.",
      },
    ],
  },
  {
    id: "disclosure",
    category: "Disclosure",
    prompt:
      "Do you disclose to the people affected when AI is involved in a decision about them?",
    helpText:
      "For example, notifying job applicants that AI is used in resume screening, or telling customers that AI generated a pricing decision.",
    answers: [
      {
        key: "best",
        label: "Yes, clearly and in plain language",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Sometimes, or buried in a privacy policy",
        points: 5,
        gap: "Disclosure obligations under the Colorado AI Act require clear, consumer-facing notice when a high-risk AI system is used to make a consequential decision. Privacy-policy burial is generally insufficient because consumers do not read those policies.",
      },
      {
        key: "none",
        label: "We don't disclose this",
        points: 0,
        gap: "Failure to disclose the use of AI in consequential decisions is a direct violation of the Colorado AI Act's consumer-notice provisions. This is also the gap most likely to trigger a consumer complaint.",
      },
    ],
  },
  {
    id: "human_review",
    category: "Human Review",
    prompt:
      "When AI makes a consequential decision about a person, do you offer them a way to get a human to review it?",
    helpText:
      "A 'consequential decision' is anything that affects someone's access to employment, housing, credit, healthcare, insurance, or essential services.",
    answers: [
      {
        key: "best",
        label: "Yes, with a clear process and response time",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Yes, but the process is ad-hoc or undocumented",
        points: 5,
        gap: "The right to human review under the Colorado AI Act must be meaningful — the statute expects a documented process with reasonable response times. Ad-hoc review does not demonstrate compliance.",
      },
      {
        key: "none",
        label: "No — the AI decision is final",
        points: 0,
        gap: "The Colorado AI Act creates a right to human review of adverse consequential decisions made by AI. Not offering one exposes the business to both statutory liability and individual discrimination claims.",
      },
    ],
  },
  {
    id: "bias_audit",
    category: "Bias & Fairness",
    prompt:
      "Do you audit your AI systems for bias or discriminatory outcomes?",
    helpText:
      "Checking whether the system produces different outcomes across race, gender, age, disability, or other protected groups.",
    answers: [
      {
        key: "best",
        label: "Yes, on a regular schedule",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Only when a problem comes up",
        points: 5,
        gap: "Reactive bias auditing is not enough under the Colorado AI Act's duty to use 'reasonable care' to avoid algorithmic discrimination. Ongoing, scheduled audits are the expected standard of care.",
      },
      {
        key: "none",
        label: "No",
        points: 0,
        gap: "The Colorado AI Act imposes a duty of reasonable care on deployers to prevent algorithmic discrimination. A business that has never audited its AI for bias will have no defense if disparate outcomes surface later.",
      },
    ],
  },
  {
    id: "documentation",
    category: "Documentation",
    prompt:
      "Do you keep records of the data your AI systems were trained on and how they operate?",
    helpText:
      "Training data sources, vendor documentation, model versions, and decision logs.",
    answers: [
      {
        key: "best",
        label: "Yes, comprehensive records for each system",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Some records, mostly from the vendor",
        points: 5,
        gap: "Vendor documentation alone is not enough — the Colorado AI Act places independent documentation duties on deployers, including records sufficient to show the business is meeting its risk-management and disclosure obligations.",
      },
      {
        key: "none",
        label: "No records",
        points: 0,
        gap: "Documentation is the backbone of every AI compliance regime. Without records, you can't demonstrate compliance, respond to a consumer complaint, or defend a regulatory inquiry.",
      },
    ],
  },
  {
    id: "incident_response",
    category: "Incident Response",
    prompt:
      "Do you have an incident response plan for AI system failures or harmful outputs?",
    helpText:
      "What happens when the AI makes a wrong call, produces a harmful output, or affects a protected group disproportionately?",
    answers: [
      {
        key: "best",
        label: "Yes, with clear escalation and notification steps",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "Informal — we'd handle it case by case",
        points: 5,
        gap: "Informal incident handling does not meet the Colorado AI Act's risk management expectations. Deployers of high-risk AI must have a documented response process, including timelines for notifying affected individuals and, in some cases, the Attorney General.",
      },
      {
        key: "none",
        label: "No plan",
        points: 0,
        gap: "A documented incident response plan is a core requirement of any AI risk management program. The Colorado AI Act's notification duties give regulators and consumers a right to prompt, structured responses to AI harms.",
      },
    ],
  },
  {
    id: "vendor_contracts",
    category: "Vendor Management",
    prompt:
      "Have you reviewed your contracts with AI vendors for compliance and liability protections?",
    helpText:
      "Including indemnification for IP, data rights, bias audits, and who bears the cost of a regulatory failure.",
    answers: [
      {
        key: "best",
        label: "Yes, every AI vendor contract has been reviewed",
        points: 10,
        gap: "",
      },
      {
        key: "partial",
        label: "We've reviewed some, not all",
        points: 5,
        gap: "Partial vendor contract review leaves gaps — a single unreviewed vendor can introduce liability you haven't accounted for. The Colorado AI Act assumes deployers have contractual visibility into vendor practices.",
      },
      {
        key: "none",
        label: "No — we use standard vendor terms as-is",
        points: 0,
        gap: "Standard vendor terms almost always push risk onto the customer. Without a targeted review, you are likely bearing indemnification risk, data liability, and regulatory exposure that belongs on the vendor's side of the contract.",
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
        ? "Material gaps to close before 2026"
        : "High exposure under the Colorado AI Act";

  const summary =
    rag === "green"
      ? "Your business has the core elements of an AI compliance program in place. The remaining work is mostly maintenance, documentation refinement, and periodic audit. Our FAIIR certification can formalize what you already have and give you a defensible certificate to show customers, partners, and regulators."
      : rag === "amber"
        ? "You have some of the pieces but not a cohesive program. The Colorado AI Act takes effect in 2026 and most of the missing work takes 4–8 weeks to stand up properly. A FAIIR assessment will prioritize which gaps to close first and give you a written roadmap."
        : "You are running AI in ways that the Colorado AI Act will regulate, without the policies, disclosures, or documentation the statute requires. This is a material legal and reputational risk. A FAIIR assessment is the fastest way to get organized, document what you already do, and build the missing pieces before the enforcement window opens.";

  const ctaText =
    rag === "green"
      ? "Get FAIIR certified"
      : rag === "amber"
        ? "Start a FAIIR assessment"
        : "Book an urgent FAIIR consultation";

  return { score, maxScore: MAX_SCORE, rag, gaps, headline, summary, ctaText };
}
