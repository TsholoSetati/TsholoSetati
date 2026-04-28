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
    name: 'Microsoft',
    location: 'Middle East & Africa',
    roles: [
      {
        title: 'Senior Cloud & AI Solution Engineer',
        body:
          "I lead strategic AI transformation initiatives for Microsoft's top enterprise accounts across the region. Acting as a trusted executive advisor, I orchestrate cross-functional teams to design and deliver scalable, high-impact AI solutions, bridging the gap between frontier technology and measurable business value, establishing AI Centres of Excellence and guiding C-suite executives through their digital evolution.",
      },
      {
        title: 'Senior Cross-Solution Technical Architect (Africa)',
        body:
          'I drove digital innovation within Microsoft Innovation Hubs, focusing on advanced AI and data strategies. Leading rapid prototyping and proof-of-concept development, I helped customers visualise and realise the potential of emerging technologies to solve complex business challenges.',
      },
    ],
  },
  {
    name: 'EY',
    roles: [
      {
        title: 'Technology Consulting',
        body:
          'I managed end-to-end digital transformation programmes, helping clients operationalise technology investments. From developing ROI models to leading high-performing delivery teams, I guided enterprises through modernisation, ensuring technology alignment with core business objectives and fostering a culture of innovation.',
      },
    ],
  },
  {
    name: 'Research & Policy Analysis',
    roles: [
      {
        title: 'Economic & Quantitative Research',
        body:
          'At institutions including the African Centre of Excellence for Inequality Research, TIPS, and SALDRU, I conducted rigorous economic analysis and policy research. My work involved synthesising complex data into actionable insights, designing surveys, and authoring reports that informed decision-making in sectors ranging from mental health to industrial policy.',
      },
    ],
  },
  {
    name: 'Foundational Roles',
    roles: [
      {
        title: 'Early Career',
        body:
          'My career is built on a diverse foundation ranging from quantitative analysis at Oasis Crescent to operational roles in network administration and auditing. These experiences honed my analytical precision and provided a holistic understanding of organisational dynamics across finance, technology, and operations.',
      },
    ],
  },
];
