/**
 * AI Maturity Diagnostic — deterministic rubric.
 * No runtime LLM. Each question maps to a dimension with weighted answers.
 * The output is a profile + tailored recommendations from a pre-authored matrix.
 */

export type Dimension =
  | 'strategy'
  | 'governance'
  | 'platform'
  | 'data'
  | 'talent'
  | 'value';

export interface Choice {
  label: string;
  /** 0–4 — higher is more mature. */
  score: number;
}

export interface Question {
  id: string;
  dimension: Dimension;
  prompt: string;
  choices: Choice[];
}

export const dimensions: Record<Dimension, { name: string; description: string }> = {
  strategy: {
    name: 'AI Strategy',
    description: 'Clarity of ambition, prioritisation and executive sponsorship.',
  },
  governance: {
    name: 'Governance & Responsible AI',
    description: 'Risk, model lifecycle, evaluation and policy maturity.',
  },
  platform: {
    name: 'Platform & Architecture',
    description: 'Shared infrastructure, golden paths and reusability.',
  },
  data: {
    name: 'Data Foundations',
    description: 'Quality, accessibility and lineage of the data estate.',
  },
  talent: {
    name: 'Talent & Operating Model',
    description: 'Roles, ways of working and capability development.',
  },
  value: {
    name: 'Value Realisation',
    description: 'Business cases, measurement and post-implementation discipline.',
  },
};

export const questions: Question[] = [
  {
    id: 'q1',
    dimension: 'strategy',
    prompt: 'How clearly defined is your enterprise AI ambition?',
    choices: [
      { label: 'No formal ambition exists', score: 0 },
      { label: 'A few teams have AI plans, no enterprise view', score: 1 },
      { label: 'A documented AI strategy exists but is not actively used', score: 2 },
      { label: 'A board-endorsed strategy guides funding decisions', score: 3 },
      { label: 'Strategy is reviewed quarterly and tied to enterprise OKRs', score: 4 },
    ],
  },
  {
    id: 'q2',
    dimension: 'strategy',
    prompt: 'Who owns AI outcomes at the executive level?',
    choices: [
      { label: 'Nobody — AI is a side initiative', score: 0 },
      { label: 'IT leadership, by default', score: 1 },
      { label: 'A nominated AI lead reporting to the CIO', score: 2 },
      { label: 'A dedicated executive (Chief AI Officer or equivalent)', score: 3 },
      { label: 'Distributed across the C-suite with shared accountability', score: 4 },
    ],
  },
  {
    id: 'q3',
    dimension: 'governance',
    prompt: 'How are AI use cases assessed for risk before deployment?',
    choices: [
      { label: 'They are not', score: 0 },
      { label: 'Ad hoc legal review', score: 1 },
      { label: 'A risk checklist exists but is rarely enforced', score: 2 },
      { label: 'A risk gate is part of the delivery process', score: 3 },
      { label: 'Tiered risk model with mandatory evaluation harnesses', score: 4 },
    ],
  },
  {
    id: 'q4',
    dimension: 'governance',
    prompt: 'How do you evaluate model and system quality in production?',
    choices: [
      { label: 'We do not', score: 0 },
      { label: 'Spot checks by the delivery team', score: 1 },
      { label: 'Manual review on a defined cadence', score: 2 },
      { label: 'Automated evaluation suites for each release', score: 3 },
      { label: 'Continuous evaluation tied to alerting and rollback', score: 4 },
    ],
  },
  {
    id: 'q5',
    dimension: 'platform',
    prompt: 'Do teams share a common AI platform?',
    choices: [
      { label: 'Every team builds from scratch', score: 0 },
      { label: 'Some shared libraries, no platform team', score: 1 },
      { label: 'Shared LLM gateway and observability', score: 2 },
      { label: 'Opinionated platform with golden paths', score: 3 },
      { label: 'Platform is product-managed with SLOs and a roadmap', score: 4 },
    ],
  },
  {
    id: 'q6',
    dimension: 'data',
    prompt: 'How accessible is high-quality data to AI delivery teams?',
    choices: [
      { label: 'Major friction; data is siloed', score: 0 },
      { label: 'Possible but slow; bespoke pipelines per use case', score: 1 },
      { label: 'A central data catalogue exists', score: 2 },
      { label: 'Self-service access through governed products', score: 3 },
      { label: 'Productised, contract-backed data with lineage', score: 4 },
    ],
  },
  {
    id: 'q7',
    dimension: 'talent',
    prompt: 'How do you staff AI delivery?',
    choices: [
      { label: 'Whoever is available', score: 0 },
      { label: 'A small central team that takes on every use case', score: 1 },
      { label: 'Embedded squads with shared platform support', score: 2 },
      { label: 'Squads paired with business owners and SREs', score: 3 },
      { label: 'Rotating staffing model with deliberate capability transfer', score: 4 },
    ],
  },
  {
    id: 'q8',
    dimension: 'value',
    prompt: 'How are AI investment cases evaluated?',
    choices: [
      { label: 'Strategic value statements only', score: 0 },
      { label: 'Single-point ROI estimates', score: 1 },
      { label: 'Scenario-based business cases', score: 2 },
      { label: 'Risk-adjusted IRR with explicit assumptions', score: 3 },
      { label: 'IRR + kill-switch + 6/12-month re-baselining', score: 4 },
    ],
  },
  {
    id: 'q9',
    dimension: 'value',
    prompt: 'Are run costs (inference, observability, retraining) modelled?',
    choices: [
      { label: 'No', score: 0 },
      { label: 'Estimated as a % of build cost', score: 1 },
      { label: 'Modelled per use case', score: 2 },
      { label: 'Modelled with sensitivity analysis', score: 3 },
      { label: 'Modelled, monitored against actuals, FinOps embedded', score: 4 },
    ],
  },
  {
    id: 'q10',
    dimension: 'platform',
    prompt: 'What is the typical idea-to-production cycle time for an approved use case?',
    choices: [
      { label: 'Over 12 months', score: 0 },
      { label: '6–12 months', score: 1 },
      { label: '3–6 months', score: 2 },
      { label: '6–12 weeks', score: 3 },
      { label: 'Under 6 weeks', score: 4 },
    ],
  },
];

export interface DimensionScore {
  dimension: Dimension;
  name: string;
  description: string;
  score: number;
  maxScore: number;
  pct: number;
  tier: 'Nascent' | 'Emerging' | 'Operational' | 'Scaling' | 'Leading';
}

export interface DiagnosticResult {
  overallPct: number;
  overallTier: DimensionScore['tier'];
  dimensions: DimensionScore[];
  recommendations: string[];
}

const tierFor = (pct: number): DimensionScore['tier'] => {
  if (pct < 20) return 'Nascent';
  if (pct < 40) return 'Emerging';
  if (pct < 60) return 'Operational';
  if (pct < 80) return 'Scaling';
  return 'Leading';
};

const recommendationMatrix: Record<Dimension, Record<DimensionScore['tier'], string>> = {
  strategy: {
    Nascent: 'Author a one-page AI ambition aligned to two to three enterprise OKRs and secure executive sponsorship before any further pilots.',
    Emerging: 'Consolidate scattered AI plans into a single funded portfolio with a documented prioritisation rubric.',
    Operational: 'Tie the existing AI strategy to the annual planning cycle and publish a quarterly progress dashboard to the board.',
    Scaling: 'Refresh the strategy against measured outcomes, sunset use cases that are not delivering and reallocate funding.',
    Leading: 'Use scenario planning to position for the next capability wave (agents, embodied AI, foundation-model commoditisation).',
  },
  governance: {
    Nascent: 'Stand up a tiered risk model and a basic evaluation checklist before approving any production deployment.',
    Emerging: 'Make the risk gate mandatory in your delivery lifecycle and assign accountable owners for each tier.',
    Operational: 'Automate evaluations as part of CI/CD and link results to deployment approval.',
    Scaling: 'Introduce continuous production monitoring with automatic rollback on drift or quality regression.',
    Leading: 'Publish model cards externally and benchmark your governance against emerging regulation (EU AI Act, ISO/IEC 42001).',
  },
  platform: {
    Nascent: 'Stand up a thin platform team and a shared LLM gateway before authorising further pilots.',
    Emerging: 'Define golden paths for the three most common use-case archetypes in your portfolio.',
    Operational: 'Product-manage the platform with explicit SLOs, a roadmap and an internal customer council.',
    Scaling: 'Optimise platform economics: caching, batching, model routing, regional residency.',
    Leading: 'Publish platform usage telemetry and benchmark cycle time against external peers.',
  },
  data: {
    Nascent: 'Address the top three data-access blockers identified by your delivery teams before scaling AI investment.',
    Emerging: 'Establish a central data catalogue with clear ownership and quality SLAs.',
    Operational: 'Move from project-led pipelines to productised data products with documented contracts.',
    Scaling: 'Embed data lineage and quality checks into the AI evaluation harness.',
    Leading: 'Treat data products as first-class platform assets with their own roadmap and customer base.',
  },
  talent: {
    Nascent: 'Form one embedded squad combining engineering, business and risk to deliver a single high-value use case end-to-end.',
    Emerging: 'Move from a single central team to embedded delivery squads supported by a shared platform.',
    Operational: 'Pair delivery squads with named business owners and SREs to harden production operations.',
    Scaling: 'Introduce deliberate rotation to spread platform thinking and avoid key-person risk.',
    Leading: 'Develop a public capability framework and integrate it with internal mobility and external recruiting.',
  },
  value: {
    Nascent: 'Author a defensible IRR/NPV template and require it for every AI funding decision above a defined threshold.',
    Emerging: 'Add explicit risk adjustment and a kill-switch threshold to every business case.',
    Operational: 'Re-baseline production use cases against actuals at six and twelve months.',
    Scaling: 'Aggregate use-case economics into a portfolio view to inform the strategy refresh cycle.',
    Leading: 'Publish ROI realisation rates internally and incentivise honest reporting over optimistic forecasting.',
  },
};

export function score(answers: Record<string, number>): DiagnosticResult {
  const buckets = new Map<Dimension, { sum: number; max: number }>();
  for (const q of questions) {
    const v = answers[q.id];
    if (typeof v !== 'number') continue;
    const bucket = buckets.get(q.dimension) ?? { sum: 0, max: 0 };
    bucket.sum += v;
    bucket.max += 4;
    buckets.set(q.dimension, bucket);
  }

  const dims: DimensionScore[] = (Object.keys(dimensions) as Dimension[])
    .filter((d) => buckets.has(d))
    .map((d) => {
      const b = buckets.get(d)!;
      const pct = (b.sum / b.max) * 100;
      return {
        dimension: d,
        name: dimensions[d].name,
        description: dimensions[d].description,
        score: b.sum,
        maxScore: b.max,
        pct,
        tier: tierFor(pct),
      };
    })
    .sort((a, b) => a.pct - b.pct);

  const totalSum = dims.reduce((s, d) => s + d.score, 0);
  const totalMax = dims.reduce((s, d) => s + d.maxScore, 0);
  const overallPct = totalMax ? (totalSum / totalMax) * 100 : 0;

  const recommendations = dims.slice(0, 3).map((d) => recommendationMatrix[d.dimension][d.tier]);

  return {
    overallPct,
    overallTier: tierFor(overallPct),
    dimensions: dims,
    recommendations,
  };
}
