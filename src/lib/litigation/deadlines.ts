/**
 * Litigation deadline engine.
 *
 * Computes rule-based deadlines for Colorado state court (C.R.C.P.) and the
 * District of Colorado (FRCP + local rules), with weekend/holiday rollover per
 * C.R.C.P. 6(a) / Fed. R. Civ. P. 6(a).
 *
 * PROFESSIONAL-RESPONSIBILITY DESIGN CONSTRAINT: every date this engine
 * produces is a *suggestion*. The UI must require explicit attorney
 * confirmation (litigation_deadlines.attorney_confirmed) before a deadline is
 * treated as calendared — rule text, amendments, and case-specific orders can
 * change the math, and Colo. RPC 1.1/1.3 keep that responsibility with the
 * lawyer, not the software.
 *
 * Dates are handled as "YYYY-MM-DD" strings; all arithmetic happens at UTC
 * noon so DST shifts can never move a date across midnight.
 */

export type Jurisdiction = "co_state" | "d_colo" | "tenth_cir" | "other";

export type ServiceMethod = "personal" | "efiling" | "mail";

export interface DeadlineRule {
  id: string;
  jurisdiction: Jurisdiction;
  /** What this deadline is, e.g. "Answer to complaint" */
  name: string;
  /** Citation, e.g. "C.R.C.P. 12(a)(1)" */
  ruleRef: string;
  /** What the trigger date is, e.g. "Date of service of the complaint" */
  trigger: string;
  /** Calendar days from (or before) the trigger. */
  days?: number;
  /** Anniversary-style periods (statutes of limitation). */
  years?: number;
  /** "after" counts forward from the trigger; "before" counts backward. */
  direction: "after" | "before";
  /**
   * Whether FRCP 6(d) mail-service days can apply (federal only — C.R.C.P.
   * 6(e) was REPEALED eff. 2012-01-01; Colorado state court gets no +3 for
   * mail or e-service, and federal e-service lost its +3 in 2016). Only
   * meaningful for "after" periods that run from service.
   */
  serviceExtension?: boolean;
  /** One-line practice note shown in the UI. */
  note?: string;
}

// ---------------------------------------------------------------------------
// Holidays
// ---------------------------------------------------------------------------

/** nth (1-based) occurrence of a weekday (0=Sun..6=Sat) in a month (1-12). */
function nthWeekday(year: number, month: number, weekday: number, n: number): string {
  const first = new Date(Date.UTC(year, month - 1, 1, 12));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return iso(new Date(Date.UTC(year, month - 1, 1 + offset + (n - 1) * 7, 12)));
}

function lastWeekday(year: number, month: number, weekday: number): string {
  const last = new Date(Date.UTC(year, month, 0, 12)); // last day of month
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  return iso(new Date(Date.UTC(year, month, -offset, 12)));
}

/** Fixed-date holiday with Sat→Fri / Sun→Mon observation shift. */
function observed(year: number, month: number, day: number): string {
  const d = new Date(Date.UTC(year, month - 1, day, 12));
  if (d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() - 1);
  else if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return iso(d);
}

/**
 * Court holidays for a year. Colorado Judicial Department and federal
 * calendars mostly overlap; the differences are Cabrini Day (CO only, first
 * Monday in October) vs Columbus Day (federal only, second Monday in October).
 * Verify against the court's published calendar each year — courts
 * occasionally add closure days.
 */
export function courtHolidays(year: number, jurisdiction: Jurisdiction): Set<string> {
  const shared = [
    observed(year, 1, 1), // New Year's Day
    nthWeekday(year, 1, 1, 3), // MLK Day
    nthWeekday(year, 2, 1, 3), // Washington-Lincoln / Presidents' Day
    lastWeekday(year, 5, 1), // Memorial Day
    observed(year, 6, 19), // Juneteenth
    observed(year, 7, 4), // Independence Day
    nthWeekday(year, 9, 1, 1), // Labor Day
    observed(year, 11, 11), // Veterans Day
    nthWeekday(year, 11, 4, 4), // Thanksgiving
    observed(year, 12, 25), // Christmas
  ];
  if (jurisdiction === "co_state") {
    shared.push(nthWeekday(year, 10, 1, 1)); // Frances Xavier Cabrini Day
  } else {
    shared.push(nthWeekday(year, 10, 1, 2)); // Columbus Day (federal)
  }
  return new Set(shared);
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parse(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`);
}

function addDays(isoDate: string, days: number): string {
  const d = parse(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}

function isWeekendOrHoliday(isoDate: string, jurisdiction: Jurisdiction): boolean {
  const d = parse(isoDate);
  const dow = d.getUTCDay();
  if (dow === 0 || dow === 6) return true;
  return courtHolidays(d.getUTCFullYear(), jurisdiction).has(isoDate);
}

/**
 * Roll a landing date off weekends/holidays per C.R.C.P. 6(a) / FRCP 6(a):
 * forward-counted periods extend to the next court day; backward-counted
 * periods continue in the same (earlier) direction, per FRCP 6(a)(5)'s
 * "next day" definition.
 */
function roll(isoDate: string, jurisdiction: Jurisdiction, direction: "after" | "before"): string {
  let d = isoDate;
  const step = direction === "after" ? 1 : -1;
  while (isWeekendOrHoliday(d, jurisdiction)) d = addDays(d, step);
  return d;
}

export interface ComputedDeadline {
  dueDate: string;
  /** Human-readable audit trail of how the date was computed. */
  basis: string;
}

export function computeDeadline(opts: {
  rule: DeadlineRule;
  triggerDate: string; // YYYY-MM-DD
  serviceMethod?: ServiceMethod;
}): ComputedDeadline {
  const { rule, triggerDate, serviceMethod } = opts;
  const steps: string[] = [];

  let due: string;
  if (rule.years) {
    const d = parse(triggerDate);
    d.setUTCFullYear(d.getUTCFullYear() + rule.years);
    due = iso(d);
    steps.push(`${rule.years} year(s) from ${triggerDate}`);
  } else {
    const days = rule.days ?? 0;
    const mailDays =
      rule.serviceExtension && rule.direction === "after" && serviceMethod === "mail" ? 3 : 0;
    const total = days + mailDays;
    due = addDays(triggerDate, rule.direction === "after" ? total : -total);
    steps.push(
      `${days} days ${rule.direction} ${triggerDate}` +
        (mailDays ? ` + ${mailDays} days for service by mail (FRCP 6(d))` : "")
    );
  }

  const rolled = roll(due, rule.jurisdiction, rule.direction);
  if (rolled !== due) {
    steps.push(
      `${due} falls on a weekend/court holiday → ${rule.direction === "after" ? "next" : "preceding"} court day ${rolled}`
    );
    due = rolled;
  }

  return { dueDate: due, basis: `${rule.ruleRef}: ${steps.join("; ")}` };
}

// ---------------------------------------------------------------------------
// Rules library — starter set.
//
// Each entry carries its citation so the attorney can verify before
// confirming. Keep this list conservative: it is a calendaring aid, not an
// authority. Rule amendments happen — recheck citations periodically.
// ---------------------------------------------------------------------------

export const DEADLINE_RULES: DeadlineRule[] = [
  // --- Colorado state court (C.R.C.P.) ---
  {
    id: "co_answer",
    jurisdiction: "co_state",
    name: "Answer or responsive pleading",
    ruleRef: "C.R.C.P. 12(a)(1)",
    trigger: "Service of the summons and complaint",
    days: 21,
    direction: "after",
    note: "No +3-day mail extension — C.R.C.P. 6(e) was repealed effective 2012. 35 days if served outside Colorado or by publication (12(a)(2)).",
  },
  {
    id: "co_answer_out_of_state",
    jurisdiction: "co_state",
    name: "Answer — service outside Colorado / by publication",
    ruleRef: "C.R.C.P. 12(a)(2)",
    trigger: "Service of process",
    days: 35,
    direction: "after",
  },
  {
    id: "co_answer_after_denial",
    jurisdiction: "co_state",
    name: "Answer after Rule 12 motion denied",
    ruleRef: "C.R.C.P. 12(a)(1)(A)",
    trigger: "Notice of the court's denial of the Rule 12 motion",
    days: 14,
    direction: "after",
  },
  {
    id: "co_motion_response",
    jurisdiction: "co_state",
    name: "Response to a motion",
    ruleRef: "C.R.C.P. 121 § 1-15(1)(b)",
    trigger: "Filing of the motion",
    days: 21,
    direction: "after",
    note: "Drops to 14 days if the motion was filed 42 days or less before trial.",
  },
  {
    id: "co_motion_reply",
    jurisdiction: "co_state",
    name: "Reply in support of a motion (non-Rule 56)",
    ruleRef: "C.R.C.P. 121 § 1-15(1)(c)",
    trigger: "Filing of the responsive brief",
    days: 7,
    direction: "after",
    note: "7 days for ordinary motions; Rule 56 replies get 14 days (use the summary-judgment reply entry).",
  },
  {
    id: "co_sj_reply",
    jurisdiction: "co_state",
    name: "Reply in support of a Rule 56 motion",
    ruleRef: "C.R.C.P. 121 § 1-15(1)(c)",
    trigger: "Filing of the responsive brief",
    days: 14,
    direction: "after",
  },
  {
    id: "co_discovery_responses",
    jurisdiction: "co_state",
    name: "Responses to interrogatories / RFPs / RFAs",
    ruleRef: "C.R.C.P. 33, 34, 36",
    trigger: "Service of the discovery requests",
    days: 35,
    direction: "after",
  },
  {
    id: "co_amend_join",
    jurisdiction: "co_state",
    name: "Amend pleadings / join parties (latest)",
    ruleRef: "C.R.C.P. 16(b)(8)",
    trigger: "Case at issue",
    days: 105,
    direction: "after",
    note: "15 weeks after at-issue (2015 amendment; the older 119-day figure is superseded). The CMO controls if it sets a different date.",
  },
  {
    id: "co_initial_disclosures",
    jurisdiction: "co_state",
    name: "Initial disclosures",
    ruleRef: "C.R.C.P. 26(a)(1)",
    trigger: "Case at issue",
    days: 28,
    direction: "after",
  },
  {
    id: "co_proposed_cmo",
    jurisdiction: "co_state",
    name: "Proposed case management order",
    ruleRef: "C.R.C.P. 16(b)",
    trigger: "Case at issue",
    days: 42,
    direction: "after",
    note: "Case-management conference / CMO timing varies by district — confirm the division's practice standards.",
  },
  {
    id: "co_expert_affirmative",
    jurisdiction: "co_state",
    name: "Affirmative expert disclosures (claiming party)",
    ruleRef: "C.R.C.P. 26(a)(2)(C)(I)",
    trigger: "Trial date",
    days: 126,
    direction: "before",
  },
  {
    id: "co_expert_defending",
    jurisdiction: "co_state",
    name: "Defending party expert disclosures",
    ruleRef: "C.R.C.P. 26(a)(2)(C)(II)",
    trigger: "Trial date",
    days: 98,
    direction: "before",
  },
  {
    id: "co_expert_rebuttal",
    jurisdiction: "co_state",
    name: "Rebuttal expert disclosures",
    ruleRef: "C.R.C.P. 26(a)(2)(C)(III)",
    trigger: "Trial date",
    days: 77,
    direction: "before",
  },
  {
    id: "co_discovery_cutoff",
    jurisdiction: "co_state",
    name: "Discovery cutoff",
    ruleRef: "C.R.C.P. 16(b)(11)",
    trigger: "Trial date",
    days: 49,
    direction: "before",
    note: "Default under the rule; the case management order controls if it sets a different date.",
  },
  {
    id: "co_summary_judgment",
    jurisdiction: "co_state",
    name: "Summary judgment motion (latest filing)",
    ruleRef: "C.R.C.P. 56(c) / 16(c)",
    trigger: "Trial date",
    days: 91,
    direction: "before",
    note: "13 weeks before trial; a cross-motion may be filed up to 70 days (10 weeks) before trial.",
  },
  {
    id: "co_sj_cross",
    jurisdiction: "co_state",
    name: "Cross-motion for summary judgment (latest filing)",
    ruleRef: "C.R.C.P. 56(c)",
    trigger: "Trial date",
    days: 70,
    direction: "before",
  },
  {
    id: "co_cre702",
    jurisdiction: "co_state",
    name: "C.R.E. 702 motions (latest filing)",
    ruleRef: "C.R.C.P. 16(c)",
    trigger: "Trial date",
    days: 70,
    direction: "before",
  },
  {
    id: "co_motions_in_limine",
    jurisdiction: "co_state",
    name: "Pretrial motions / motions in limine (latest filing)",
    ruleRef: "C.R.C.P. 16(c)",
    trigger: "Trial date",
    days: 35,
    direction: "before",
  },
  {
    id: "co_posttrial_59",
    jurisdiction: "co_state",
    name: "Post-trial motion (C.R.C.P. 59)",
    ruleRef: "C.R.C.P. 59(a)",
    trigger: "Entry of judgment",
    days: 14,
    direction: "after",
    note: "An undecided Rule 59 motion is deemed denied 63 days after filing (59(j)); the appeal clock runs from that date.",
  },
  {
    id: "co_notice_of_appeal",
    jurisdiction: "co_state",
    name: "Notice of appeal",
    ruleRef: "C.A.R. 4(a)",
    trigger: "Entry of judgment or final order",
    days: 49,
    direction: "after",
  },
  {
    id: "co_cgia_notice",
    jurisdiction: "co_state",
    name: "CGIA notice of claim (public entity)",
    ruleRef: "C.R.S. § 24-10-109",
    trigger: "Discovery of the injury",
    days: 182,
    direction: "after",
    note: "Jurisdictional. Do not rely on rollover — file early.",
  },
  {
    id: "co_sol_negligence",
    jurisdiction: "co_state",
    name: "Statute of limitations — negligence / personal injury",
    ruleRef: "C.R.S. § 13-80-102",
    trigger: "Accrual of the claim",
    years: 2,
    direction: "after",
    note: "Accrual and tolling analysis required — treat the computed date as the outer marker only.",
  },
  {
    id: "co_sol_mva",
    jurisdiction: "co_state",
    name: "Statute of limitations — motor vehicle",
    ruleRef: "C.R.S. § 13-80-101(1)(n)",
    trigger: "Accrual of the claim",
    years: 3,
    direction: "after",
  },
  {
    id: "co_sol_contract",
    jurisdiction: "co_state",
    name: "Statute of limitations — contract",
    ruleRef: "C.R.S. § 13-80-101 / § 13-80-103.5",
    trigger: "Accrual of the claim",
    years: 3,
    direction: "after",
    note: "6 years for liquidated debts / determinable amounts under § 13-80-103.5 — classify the claim first.",
  },

  // --- District of Colorado (FRCP + local rules) ---
  {
    id: "fed_answer",
    jurisdiction: "d_colo",
    name: "Answer or responsive pleading",
    ruleRef: "Fed. R. Civ. P. 12(a)(1)(A)(i)",
    trigger: "Service of the summons and complaint",
    days: 21,
    direction: "after",
    serviceExtension: true,
    note: "United States / its agencies / officers: 60 days (12(a)(2)-(3)). Waived service: 60 days after the waiver request was sent (90 if sent outside the U.S.). Mail service adds 3 days (6(d)); electronic service adds nothing.",
  },
  {
    id: "fed_motion_response",
    jurisdiction: "d_colo",
    name: "Response to a motion",
    ruleRef: "D.C.COLO.LCivR 7.1(d)",
    trigger: "Service of the motion",
    days: 21,
    direction: "after",
    note: "Runs from SERVICE of the motion (unlike C.R.C.P. 121 § 1-15, which runs from filing).",
  },
  {
    id: "fed_motion_reply",
    jurisdiction: "d_colo",
    name: "Reply in support of a motion",
    ruleRef: "D.C.COLO.LCivR 7.1(d)",
    trigger: "Service of the response",
    days: 14,
    direction: "after",
  },
  {
    id: "fed_removal",
    jurisdiction: "d_colo",
    name: "Notice of removal",
    ruleRef: "28 U.S.C. § 1446(b)",
    trigger: "Service of the initial pleading",
    days: 30,
    direction: "after",
  },
  {
    id: "fed_initial_disclosures",
    jurisdiction: "d_colo",
    name: "Initial disclosures",
    ruleRef: "Fed. R. Civ. P. 26(a)(1)(C)",
    trigger: "Rule 26(f) conference",
    days: 14,
    direction: "after",
  },
  {
    id: "fed_expert",
    jurisdiction: "d_colo",
    name: "Expert disclosures",
    ruleRef: "Fed. R. Civ. P. 26(a)(2)(D)(i)",
    trigger: "Trial date",
    days: 90,
    direction: "before",
    note: "The scheduling order controls if it sets different dates (it usually does).",
  },
  {
    id: "fed_expert_rebuttal",
    jurisdiction: "d_colo",
    name: "Rebuttal expert disclosures",
    ruleRef: "Fed. R. Civ. P. 26(a)(2)(D)(ii)",
    trigger: "Other party's expert disclosure",
    days: 30,
    direction: "after",
  },
  {
    id: "fed_posttrial",
    jurisdiction: "d_colo",
    name: "Post-trial motions (JMOL / new trial / amend judgment)",
    ruleRef: "Fed. R. Civ. P. 50(b), 59(b), 59(e)",
    trigger: "Entry of judgment",
    days: 28,
    direction: "after",
    note: "Not extendable — Fed. R. Civ. P. 6(b)(2).",
  },
  {
    id: "fed_notice_of_appeal",
    jurisdiction: "d_colo",
    name: "Notice of appeal",
    ruleRef: "Fed. R. App. P. 4(a)(1)(A)",
    trigger: "Entry of judgment",
    days: 30,
    direction: "after",
    note: "60 days when the United States is a party — Fed. R. App. P. 4(a)(1)(B).",
  },
];

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  co_state: "Colorado state court",
  d_colo: "U.S. District Court (D. Colo.)",
  tenth_cir: "Tenth Circuit",
  other: "Other",
};
