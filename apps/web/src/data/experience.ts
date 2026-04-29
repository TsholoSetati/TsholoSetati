export interface Role {
  title: string;
  period?: string;
  body: string;
}

export interface Company {
  name: string;
  location?: string;
  roles: Role[];
}

export const experience: Company[] = [
  {
    name: 'Global Hyperscaler (Big Tech)',
    location: 'Middle East & Africa',
    roles: [
      {
        title: 'Senior Cloud & AI Solution Engineer',
        body:
          'Lead strategic AI transformation initiatives for top regional enterprise accounts. Acting as a trusted executive advisor, I orchestrate cross-functional teams to design and deliver scalable, high-impact AI solutions, bridging the gap between frontier technology and measurable business value, establishing AI Centres of Excellence and guiding C-suite executives through their digital evolution.',
      },
      {
        title: 'Senior Cross-Solution Technical Architect (Africa)',
        body:
          'Drove digital innovation within enterprise innovation hubs across Africa, focusing on advanced AI and data strategies. Led rapid prototyping and proof-of-concept development to help customers visualise and realise the potential of emerging technologies against complex business challenges.',
      },
    ],
  },
  {
    name: 'Big 4 Professional Services Firm',
    roles: [
      {
        title: 'Technology Consulting',
        body:
          'Managed end-to-end digital transformation programmes, helping clients operationalise technology investments. From developing ROI models to leading high-performing delivery teams, I guided enterprises through modernisation, ensuring technology alignment with core business objectives and fostering a culture of innovation.',
      },
    ],
  },
  {
    name: 'Research & Policy Analysis',
    roles: [
      {
        title: 'Economic & Quantitative Research',
        body:
          'At leading economic research institutions — including a centre of excellence for inequality research, a development policy think-tank, and a labour and development research unit — I conducted rigorous economic analysis and policy research. The work involved synthesising complex data into actionable insights, designing surveys, and authoring reports that informed decision-making across mental health economics, industrial policy, and inequality.',
      },
    ],
  },
  {
    name: 'Foundational Roles',
    roles: [
      {
        title: 'Early Career',
        body:
          'A diverse foundation ranging from quantitative analysis at a Buy-Side Asset Manager to operational roles in network administration and audit. These experiences honed analytical precision and built a holistic understanding of organisational dynamics across finance, technology, and operations.',
      },
    ],
  },
];
