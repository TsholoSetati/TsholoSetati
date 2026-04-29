export interface Capability {
  title: string;
  summary: string;
  bullets: string[];
}

export const capabilities: Capability[] = [
  {
    title: 'AI & Technology Governance',
    summary:
      'How institutions — public, private, government and non-profit — set the rules under which AI and emerging technology can be trusted, deployed, and held accountable.',
    bullets: [
      'Responsible-AI frameworks and assurance models',
      'Model risk, evaluation, and audit harnesses',
      'Cross-border data and AI policy interpretation',
      'Board- and regulator-grade reporting',
    ],
  },
  {
    title: 'Frontier Technology Transformation',
    summary:
      'The discipline of turning frontier technology — GenAI, agentic systems, advanced analytics — into transformations that actually ship and survive their first executive review.',
    bullets: [
      'Pilot-to-production patterns that hold under load',
      'Operating-model design for AI-native delivery',
      'Capability and talent architectures',
      'Honest diagnostics on why transformations stall',
    ],
  },
  {
    title: 'Innovation Economics',
    summary:
      'Applying economic theory and quantitative method to the question of whether innovation investments compound — or quietly destroy value.',
    bullets: [
      'Real-options analysis for frontier-technology bets',
      'IRR, NPV, and risk-adjusted return modelling',
      'Productivity, diffusion and adoption dynamics',
      'Public-good and externality framing for policy contexts',
    ],
  },
  {
    title: 'Technology Economics & Cloud FinSecOps',
    summary:
      'The unit economics of running modern technology at scale — where cloud, security, AI workload cost, and engineering productivity meet on the same balance sheet.',
    bullets: [
      'FinOps for AI inference, training, and data platforms',
      'Security-as-cost and shift-left economics',
      'Total cost of ownership across hybrid estates',
      'Run-cost forecasting and re-baselining',
    ],
  },
  {
    title: 'Automation & Operating Models',
    summary:
      'Where automation, AI agents, and human work are recomposed — the design choices that decide whether productivity gains are realised, captured, or evaporate.',
    bullets: [
      'Process re-architecture vs. naive automation',
      'Human-in-the-loop design for high-stakes work',
      'Agentic workflow orchestration patterns',
      'Measurement systems for productivity claims',
    ],
  },
  {
    title: 'Strategy for the Public, Private & Civic Sectors',
    summary:
      'A cross-sector view on how technology, economics, and governance intersect — written for enterprises, governments, multilaterals, and the non-profit institutions that work alongside them.',
    bullets: [
      'Long-horizon strategy under technological uncertainty',
      'Sector-specific roadmaps (financial services, public sector, energy, telco)',
      'Africa- and emerging-market context as first-class input',
      'Policy-to-implementation translation',
    ],
  },
];
