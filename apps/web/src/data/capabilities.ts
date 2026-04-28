export interface Capability {
  title: string;
  summary: string;
  bullets: string[];
}

export const capabilities: Capability[] = [
  {
    title: 'AI Strategy & Transformation',
    summary:
      'Defining the AI ambition, the operating model, and the multi-year roadmap that takes an enterprise from pilot to production at scale.',
    bullets: [
      'AI ambition statement and value-themed roadmap',
      'AI Centre of Excellence design and stand-up',
      'Responsible-AI bar, model governance, and evaluation harnesses',
      'Talent and capability blueprint',
    ],
  },
  {
    title: 'Innovation Economics & Value Realization',
    summary:
      'Building the business cases, financial models, and measurement systems that prove AI investment is creating durable value.',
    bullets: [
      'IRR / NPV models with explicit risk adjustment',
      'Real-options analysis for frontier-technology bets',
      'Run-cost forecasting and FinOps for AI workloads',
      'Post-implementation re-baselining against actuals',
    ],
  },
  {
    title: 'Frontier Technology Architecture',
    summary:
      'Designing the platform, integration, and delivery patterns that turn GenAI and Agentic AI from demos into dependable enterprise systems.',
    bullets: [
      'Reference architectures on Azure AI and Microsoft Fabric',
      'LLM gateway, evaluation, and observability tooling',
      'Agentic workflow design and orchestration',
      'Cross-platform integration with the existing data estate',
    ],
  },
];
