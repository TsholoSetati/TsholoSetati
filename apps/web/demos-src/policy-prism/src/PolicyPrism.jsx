import React, { useState } from 'react';

// ──────────────────────────────────────────────────────────────────────────
// Palette
// ──────────────────────────────────────────────────────────────────────────
const C = {
  bg: '#F4EFE6',
  bgWarm: '#EFE7D8',
  ink: '#1A1612',
  inkSoft: '#3F362C',
  inkMuted: '#6B6157',
  border: '#D4CDC0',
  borderSoft: '#E4DCCD',
  accent: '#8B5A2B',
};

// Five frameworks. Order is top-to-bottom on the prism diagram.
const FRAMEWORKS = [
  { id: 'eu',   name: 'EU AI Act',                  short: 'EU AI ACT',      region: 'European Union',             color: '#1E3A5F', tint: '#E5EBF2' },
  { id: 'nist', name: 'NIST AI RMF',                short: 'NIST RMF',       region: 'United States',              color: '#9C6B1F', tint: '#F2E8D2' },
  { id: 'au',   name: 'AU Continental AI Strategy', short: 'AU STRATEGY',    region: 'African Union',              color: '#9B2D20', tint: '#F0DBD7' },
  { id: 'sa',   name: 'SA POPIA + Draft AI Policy', short: 'SA POLICY',      region: 'South Africa',               color: '#4C2A5C', tint: '#E8E0EF' },
  { id: 'cn',   name: 'China AI Measures',          short: 'CHINA MEASURES', region: "People's Republic of China", color: '#1F5F4A', tint: '#DCE6E0' },
];

const USE_CASES = {
  credit: {
    id: 'credit',
    label: 'Retail credit scoring',
    title: 'AI-driven retail credit scoring',
    context: 'A South African retail bank deploys an ML model to automate personal loan decisions, drawing on bank transactions, demographic signals, and alternative data — mobile money, telco — to extend credit to thin-file customers.',
    facts: [
      'Affects credit access for ~2M customers',
      'Decisions are wholly or partly automated',
      'Trained on cross-border cloud infrastructure',
    ],
  },
  hiring: {
    id: 'hiring',
    label: 'AI hiring screen',
    title: 'AI-powered hiring screening tool',
    context: 'A multinational uses a vendor AI tool to screen CVs and rank candidates for interview shortlists across MEA, EU and APAC operations simultaneously.',
    facts: [
      'Used directly in employment decisions',
      'Vendor base model with company-tuned features',
      'Operates across multiple jurisdictions at once',
    ],
  },
  genai: {
    id: 'genai',
    label: 'GenAI customer agent',
    title: 'Generative AI customer service agent',
    context: 'A telco deploys a generative AI agent to handle Tier-1 customer queries in English and isiZulu, with limited transactional capability into the billing system.',
    facts: [
      'Direct-to-consumer generative AI',
      'Multilingual including indigenous language',
      'Routes some queries to billing-system actions',
    ],
  },
  healthcare: {
    id: 'healthcare',
    label: 'Diagnostic radiology AI',
    title: 'AI-assisted diagnostic radiology',
    context: 'A private hospital group operating in South Africa, Kenya and the UAE deploys an AI radiology system to assist clinicians with screening for tuberculosis, breast cancer and fractures, integrated into the clinical workflow and patient records.',
    facts: [
      'Clinical decision-support touching patient outcomes',
      'Cross-border patient data and model training',
      'Vendor model with regional fine-tuning',
    ],
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Lens content — 5 frameworks × 4 use cases = 20 entries
// ──────────────────────────────────────────────────────────────────────────
const LENSES = {
  eu: {
    credit: {
      classification: 'High-risk AI system — Annex III §5(b) creditworthiness assessment.',
      obligations: [
        'Risk-management system across the lifecycle',
        'Data governance with bias testing on protected groups',
        'Technical documentation and event logging',
        'Transparency to affected persons',
        'Human oversight and pre-market conformity assessment',
        'Registration in the EU database',
      ],
      timeline: 'High-risk obligations apply from 2 August 2026.',
      cost: 'Initial conformity programme typically €2–5M; ongoing audit overhead.',
      translation: 'If we touch EU customers or use EU-supplied models, the credit engine is regulated like a medical device — pre-market conformity, not just post-hoc review.',
    },
    hiring: {
      classification: 'High-risk AI system — Annex III §4 employment, workers management.',
      obligations: [
        'Provider and deployer obligations split asymmetrically',
        'Bias testing across protected groups',
        'Meaningful human oversight at the decision point',
        'Information rights for candidates',
        'Logging and post-market monitoring',
      ],
      timeline: 'High-risk obligations apply from 2 August 2026.',
      cost: 'Vendor contract re-papering plus internal oversight programme.',
      translation: 'A human glance over the AI-ranked shortlist is not human oversight under the Act. The "ratification" workflow most HR teams run does not pass.',
    },
    genai: {
      classification: 'General-purpose AI plus limited-risk transparency obligations under Article 50.',
      obligations: [
        'Disclose to users that they are interacting with AI',
        'Mark AI-generated content where applicable',
        'GPAI provider obligations flow upstream to the model supplier',
        'Higher obligations if the agent makes consequential decisions',
      ],
      timeline: 'Article 50 applies from 2 August 2026; GPAI obligations from 2 August 2025.',
      cost: 'Modest if disclosure is engineered into the agent contract pattern.',
      translation: 'A small text label on the chat window is the floor, not the ceiling. Any decision the agent makes for the customer can re-classify the system as high-risk.',
    },
    healthcare: {
      classification: 'High-risk under Annex III, layered with EU MDR (Medical Device Regulation 2017/745) where the system is software-as-a-medical-device.',
      obligations: [
        'Notified Body conformity assessment plus CE marking',
        'Clinical evaluation and post-market surveillance',
        'Risk management lifecycle aligned to ISO 14971',
        'Human oversight at the diagnostic decision',
        'Accuracy, robustness and cybersecurity testing',
      ],
      timeline: 'AI Act high-risk obligations from August 2026; MDR already in force.',
      cost: 'Notified Body conformity €500K–2M+ initial; ongoing post-market overhead.',
      translation: 'We are running both a medical-device programme and a high-risk AI programme, and they are not the same programme. Plan the parallel architecture or pay twice.',
    },
  },

  nist: {
    credit: {
      classification: 'Voluntary framework. Intersects with ECOA, FHA, OCC/FDIC SR 11-7 model risk management, and CFPB algorithmic underwriting positions.',
      obligations: [
        'GOVERN, MAP, MEASURE, MANAGE functions',
        'Profile against trustworthy AI characteristics',
        'Bias testing and fair-lending validation',
        'Sector-specific model risk management overlay',
      ],
      timeline: 'Voluntary, but de facto for federally regulated banks.',
      cost: 'Lower marginal cost where SR 11-7 governance is already in place.',
      translation: 'Principles-based today, but our US correspondent banks and cloud providers will increasingly contract for an RMF profile in writing.',
    },
    hiring: {
      classification: 'Voluntary, intersecting with EEOC guidance on AI hiring and Title VII disparate-impact analysis.',
      obligations: [
        'Validation studies for the selection device',
        'Disparate-impact testing — four-fifths rule and beyond',
        'Reasonable-accommodation considerations',
        'Vendor due diligence on model provenance',
      ],
      timeline: 'EEOC enforcement is an active priority.',
      cost: 'Embedded in HR governance budget if the function is mature.',
      translation: 'Treat the model like any other selection device — validation and adverse-impact analysis — with AI-specific layers on top.',
    },
    genai: {
      classification: 'NIST AI 600-1 Generative AI Profile applies as the audit baseline.',
      obligations: [
        'Twelve risk areas: hallucination, harmful content, IP, privacy, etc.',
        'Documentation of training-data provenance',
        'Red-teaming and adversarial testing',
        'Human-in-the-loop where consequences are material',
      ],
      timeline: 'In effect; voluntary.',
      cost: 'Variable; typically absorbed in the security and ML-Ops function.',
      translation: 'Even where it is not legally required, AI 600-1 is the playbook auditors will reach for when something goes wrong.',
    },
    healthcare: {
      classification: 'FDA AI/ML-enabled medical device pathway (510(k), De Novo, or PMA), HIPAA on patient data, ONC interoperability, NIST RMF as the AI overlay.',
      obligations: [
        'FDA submission with predetermined change-control plan for adaptive AI',
        'Subgroup performance testing across demographics',
        'HIPAA Privacy and Security Rule compliance',
        'Post-market surveillance and adverse event reporting',
      ],
      timeline: 'FDA pathway in force; AI/ML guidance finalising; NIST voluntary.',
      cost: 'FDA clearance typically $1–5M plus internal QMS overhead.',
      translation: 'FDA pathway is the binding regime; NIST gives us the AI-specific governance overlay that satisfies hospital risk committees.',
    },
  },

  au: {
    credit: {
      classification: 'AU Continental AI Strategy adopted July 2024. Member-state implementation primary; financial-inclusion priority area.',
      obligations: [
        'Data sovereignty and cross-border flow controls',
        'Indigenous-language access where relevant',
        'Ethical-AI principles and capacity-building emphasis',
        'Alignment with AfCFTA data norms as they emerge',
      ],
      timeline: 'AU strategy adopted; member-state operationalisation underway.',
      cost: 'Largely overlaps with national data-protection regimes already in production.',
      translation: 'AI for financial inclusion is strategically encouraged, but the AU framing makes data sovereignty and ethical alignment board-level posture, not a footnote.',
    },
    hiring: {
      classification: 'AU strategy on AI for workforce development; member-state employment law primary.',
      obligations: [
        'Member-state employment-equity rules',
        'Continental data-protection Convention (Malabo, where ratified)',
        'Indigenous-language considerations',
        'AU Champions on AI capacity-building expectations',
      ],
      timeline: 'In force; harmonisation early.',
      cost: 'Existing HR-compliance overhead.',
      translation: 'Continental harmonisation is aspirational; the binding rules are still national. Treat the model under each member-state EE regime.',
    },
    genai: {
      classification: 'AU strategy explicitly prioritises indigenous languages, cultural representation and data sovereignty.',
      obligations: [
        'Member-state data-protection compliance',
        'Indigenous-language coverage as strategic posture',
        'Consumer-protection alignment',
        'Cross-border data flow safeguards',
      ],
      timeline: 'In effect; member-state implementation accelerating.',
      cost: 'Higher where multi-language coverage and on-continent inference are required.',
      translation: 'Indigenous-language coverage is not a feature, it is an AU-aligned compliance posture. Frame it that way in board papers and the budget reads differently.',
    },
    healthcare: {
      classification: 'AI-for-health is a flagship priority. African Medicines Agency framework maturing; Africa CDC and WHO AFRO guidance applies.',
      obligations: [
        'Member-state medicines and devices regulator approval',
        'Population-representative training data — African cohorts',
        'Data sovereignty for patient information',
        'Alignment with continental health-data governance frameworks',
      ],
      timeline: 'AU strategy adopted; AMA in operationalisation.',
      cost: 'Variable; emphasis on local training data and regional infrastructure.',
      translation: 'Diagnostic AI not trained on African populations is a clinical and strategic liability. The AU framing makes local data a board-level question, not a data-science one.',
    },
  },

  sa: {
    credit: {
      classification: 'NCA on credit decisions; POPIA Section 71 on automated decision-making; FSCA Conduct Standards (TCF); draft National AI Policy framing; constitutional rights to equality and privacy.',
      obligations: [
        'NCA-compliant affordability and risk assessment',
        'POPIA lawful basis for personal and alternative data',
        'POPIA Section 71 safeguards on automated decisions',
        'FSCA outcomes-based conduct and complaints redress',
        'Bias and exclusion testing under Section 9 equality framing',
      ],
      timeline: 'POPIA, NCA, FSCA Standards all in force; National AI Policy in development.',
      cost: 'Largely embedded in existing credit and conduct compliance.',
      translation: 'POPIA Section 71 is the closest thing we have to a national AI rule for credit; the NCA still owns the substantive lending standard. Build the case there first.',
    },
    hiring: {
      classification: 'Employment Equity Act on selection fairness, POPIA on candidate data, BBBEE on workforce composition, LRA/CCMA jurisdiction, draft National AI Policy framing.',
      obligations: [
        'EE Act objective and fair selection',
        'POPIA consent, minimisation, Section 71 automated decision rules',
        'BBBEE-aligned designated-group considerations',
        'CCMA exposure on AI-driven exclusions',
      ],
      timeline: 'All in force.',
      cost: 'Embedded in existing HR-compliance overhead.',
      translation: 'EE Act fairness and POPIA Section 71 already constrain AI hiring before any new AI policy lands. Treat the algorithm as a selection device under EE law — that is the regime that will be enforced first.',
    },
    genai: {
      classification: 'POPIA on personal-information processing; Consumer Protection Act on commercial speech; ECT Act on automated electronic transactions; ICASA jurisdiction (telco); draft National AI Policy framing.',
      obligations: [
        'POPIA lawful basis and disclosure to consumers',
        'CPA fair-dealing and complaint mechanism',
        'ECT Act on electronic-agent contracting',
        'Indigenous-language coverage as AI Policy posture',
        'Sectoral conduct standards (FSCA TCF for financial agents)',
      ],
      timeline: 'POPIA, CPA, ECT all in force; National AI Policy in development.',
      cost: 'Modest if disclosure and complaint workflows are engineered in.',
      translation: 'POPIA + CPA + ECT already cover most consumer-protection ground. The National AI Policy when finalised will sharpen indigenous-language and explainability expectations specifically.',
    },
    healthcare: {
      classification: 'SAHPRA medical-device pathway; POPIA Section 26 special personal information (health); National Health Act on patient records; HPCSA professional liability; draft National AI Policy framing.',
      obligations: [
        'SAHPRA registration as a medical device',
        'POPIA Section 26 lawful basis and security safeguards',
        'POPIA Section 72 cross-border transfer rules',
        'HPCSA-aligned clinical workflow with practitioner accountability',
        'National Health Act records and consent rules',
      ],
      timeline: 'SAHPRA rules and NHA in force; National AI Policy in development.',
      cost: 'SAHPRA registration plus POPIA overhead; lower than EU Notified Body.',
      translation: 'SAHPRA registration is the gating approval; POPIA is the data spine; HPCSA accountability stays with the radiologist regardless of how good the AI is.',
    },
  },

  cn: {
    credit: {
      classification: 'PIPL on personal credit data; Algorithm Recommendation Provisions if scoring drives service offers; data-export rules on outbound flows.',
      obligations: [
        'Algorithm filing with the CAC where applicable',
        'Personal-information localisation',
        'Security assessment for outbound data transfers',
        'Sensitive-data consent and minimisation',
      ],
      timeline: 'In force; outbound rules tightened through 2024.',
      cost: 'Significant where any China nexus exists; data-localisation architecture.',
      translation: 'If we have China operations, the scoring algorithm is registrable, training data auditable, and any outbound flow to a SA-based model triggers a security review.',
    },
    hiring: {
      classification: 'PIPL on candidate data; Algorithm Recommendation rules if used for ranking.',
      obligations: [
        'Sensitive-personal-information consent',
        'Algorithm filing where ranking is in scope',
        'Localisation for in-country candidate data',
      ],
      timeline: 'In force.',
      cost: 'Operational overhead in China; separate vendor instance often required.',
      translation: 'Hiring AI in China is a personal-information-protection regime with algorithm filing on top. Different problem from the EU AI Act, with a different fix.',
    },
    genai: {
      classification: 'Generative AI Measures (2023) apply; deep-synthesis registration; algorithm filing.',
      obligations: [
        'Real-name verification of users',
        'Content moderation aligned to local standards',
        'Watermarking and labelling of synthetic content',
        'Security assessment before public-facing release',
      ],
      timeline: 'In force.',
      cost: 'Substantial; market-specific deployment is the norm.',
      translation: 'A China deployment of the agent is a different product — registered, watermarked, content-moderated to local standards. Do not assume one global agent satisfies it.',
    },
    healthcare: {
      classification: 'NMPA medical-device pathway (Class II/III); algorithm filing where applicable; PIPL on patient data; data-export security review.',
      obligations: [
        'NMPA registration with in-country clinical data',
        'PIPL sensitive personal information consent',
        'Personal-information localisation',
        'Security assessment for outbound transfers',
      ],
      timeline: 'In force; medical-AI pathway clarified through 2024.',
      cost: 'Substantial; market-specific deployment with localised data.',
      translation: 'China deployment is functionally a separate clinical product — registered with NMPA, trained on local data, and architecturally isolated from the SA and EU instances.',
    },
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Conflicts — 3 per use case
// ──────────────────────────────────────────────────────────────────────────
const CONFLICTS = {
  credit: [
    {
      title: 'Bias mitigation: balance vs. blindness',
      tension: 'EU AI Act expects demographic representativeness in training data and bias testing across protected groups. US fair-lending law (ECOA, FHA) prohibits using protected characteristics directly as features even for debiasing. SA has Section 9 equality framing layered on Employment Equity / NCA. A model balanced for EU compliance can technically violate US fair-lending principles, and the SA framing demands its own substantive justification.',
      strategic: 'Treat bias mitigation as a jurisdictional architecture decision, not a one-model fix.',
    },
    {
      title: 'Explainability: to the consumer or to the regulator?',
      tension: 'EU and GDPR Article 22 demand meaningful logic disclosure to affected persons. NIST encourages without prescribing. AU strategy emphasises transparency in indigenous-language contexts. SA POPIA Section 71 entitles the subject to representations on the decision. China requires transparency primarily to regulators. The audience for the explanation is fundamentally different across regimes.',
      strategic: 'Two explanation surfaces are needed: a regulator-grade audit trail and a consumer-grade reason code in the right language.',
    },
    {
      title: 'Data sovereignty vs. model portability',
      tension: 'AU emphasises data sovereignty; SA POPIA Section 72 conditions cross-border transfers on comparable protection or consent; China requires PI localisation and outbound security review; EU permits transfers under adequacy or SCCs; NIST is silent. A single global credit model is, in practice, illegal somewhere.',
      strategic: 'Federated training or jurisdictional model variants — the architectural call most banks defer until forced.',
    },
  ],
  hiring: [
    {
      title: 'Where does the "decision" sit?',
      tension: 'EU AI Act treats employment screening as high-risk regardless of whether a human ratifies. US guidance (EEOC) focuses on disparate impact regardless of automation depth. SA POPIA Section 71 specifically restricts decisions based solely on automated processing. AU and member-state EE rules emphasise outcome equity. The "is there a human in the loop?" question yields different answers, with different tests.',
      strategic: 'Define "decision" precisely. A human glance is not human oversight under EU rules; under POPIA s71, it is the closest thing to a safe harbour.',
    },
    {
      title: 'Vendor accountability split',
      tension: 'EU AI Act assigns obligations to providers and deployers separately and asymmetrically. NIST treats the deploying organisation as the risk owner. SA POPIA places responsibility on the responsible party (i.e., the deployer). The vendor contract that satisfies one regime under-protects the other.',
      strategic: 'Re-paper vendor contracts. The standard MSA does not carry EU AI Act allocation, and POPIA cannot be contracted away.',
    },
    {
      title: 'Provider vs. deployer threshold',
      tension: 'Substantial fine-tuning of a vendor model can convert a deployer into a provider under the EU AI Act, with full upstream obligations. NIST treats the deployer as risk owner regardless. SA and AU regimes are silent on the threshold. A reasonable retraining strategy in one regime is a regulatory conversion event in another.',
      strategic: 'The level of fine-tuning that converts you from deployer to provider differs by regime. Build the threshold definition into vendor selection and ML-Ops policy.',
    },
  ],
  genai: [
    {
      title: 'Synthetic-content disclosure — three different floors',
      tension: 'EU AI Act Article 50 requires AI-generated content to be disclosed to users. China requires explicit watermarking and labelling. NIST AI 600-1 recommends without mandating. SA approach is consent and disclosure under POPIA / CPA. AU member states are uneven. A "Generated by AI" notice that is sufficient in one market is non-compliant in another.',
      strategic: 'Bake disclosure into the agent contract pattern, not into the UI alone.',
    },
    {
      title: 'Indigenous-language obligation',
      tension: 'AU strategy and the SA draft AI Policy explicitly prioritise indigenous-language access. EU and NIST are language-neutral. The strategic choice — invest in isiZulu LLM tuning or default to English — is a compliance posture in one regime and an optional differentiator in another.',
      strategic: 'For MEA-headquartered enterprises, indigenous-language coverage is an AU-aligned compliance posture, not a feature. Frame the budget request that way.',
    },
    {
      title: 'Training-data provenance',
      tension: 'EU AI Act requires GPAI providers to publish training-data summaries. NIST AI 600-1 recommends provenance documentation. China Generative AI Measures requires lawful training data. POPIA constrains the use of personal data in training. The level of training-data disclosure required of the deployer organisation sits in a vendor-warranty grey zone the standard MSA does not cover.',
      strategic: 'Training-data provenance is a vendor-warranty question now. Re-paper the agent contract before scaling deployment.',
    },
  ],
  healthcare: [
    {
      title: 'Medical-device pathway vs. AI Act overlay',
      tension: 'EU stacks AI Act on top of MDR with parallel requirements. SA SAHPRA stands alone with POPIA layered. FDA has predetermined change-control plans for adaptive AI. China NMPA requires re-registration for material changes. The same model retraining cadence is routine MLOps in one regime and a regulatory conversion event in another.',
      strategic: 'Lock in the regulatory change-control architecture before clinical deployment, not after. Retraining cadence is a regulatory question, not just an MLOps one.',
    },
    {
      title: 'Population representativeness — regulatory vs. clinical',
      tension: 'AU strategy explicitly demands African-trained models for African populations. EU AI Act demands demographic representativeness in training data for the deployment market. FDA increasingly emphasises subgroup performance. SA SAHPRA is sharpening guidance. A model trained on European or US populations may technically pass EU AI Act conformity yet fail AU-aligned clinical validity for African deployment.',
      strategic: 'Distinguish between regulatory representativeness and clinical generalisability. The regimes converge on the question; they diverge on whose representativeness counts.',
    },
    {
      title: 'Cross-border patient data',
      tension: 'AU emphasises data sovereignty; SA POPIA Section 72 requires comparable protection or consent for cross-border processing; EU GDPR requires adequacy or SCCs; China requires security assessment and localisation; FDA/HIPAA permits with BAAs. A single regional radiology platform serving SA, Kenya and UAE patients triggers four cross-border data regimes simultaneously.',
      strategic: 'Federate the data layer or accept the complexity tax. The single-cloud-database pattern that works for EU/US patients usually does not work the same way for African and Gulf patients.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────────────────
// Prism diagram — refraction visual with rotation tied to the active lens
// ──────────────────────────────────────────────────────────────────────────
function PrismDiagram({ activeLens, setActiveLens }) {
  const prismLeft = 320;
  const prismRight = 460;
  const prismTop = 90;
  const prismBottom = 250;
  const prismMidY = 170;
  const centroidX = 367; // (320 + 320 + 460) / 3
  const centroidY = 170; // (90 + 250 + 170) / 3

  const beamYs = { eu: 50, nist: 110, au: 170, sa: 230, cn: 290 };
  const rotations = { eu: -10, nist: -5, au: 0, sa: 5, cn: 10 };
  const theta = rotations[activeLens] ?? 0;

  return (
    <div className="mb-12 md:mb-16" style={{ overflowX: 'auto' }}>
      <svg
        viewBox="0 0 800 340"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Policy prism with refraction beams"
        style={{ display: 'block', width: '100%', height: 'auto', minWidth: '480px', maxHeight: '360px' }}
      >
        <defs>
          {FRAMEWORKS.map((f) => (
            <linearGradient
              key={`grad-${f.id}`}
              id={`grad-${f.id}`}
              x1={prismRight}
              y1={prismMidY}
              x2={780}
              y2={beamYs[f.id]}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="22%" stopColor={f.color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={f.color} stopOpacity="1" />
            </linearGradient>
          ))}

          <linearGradient
            id="grad-input"
            x1="0"
            y1={prismMidY}
            x2={prismLeft}
            y2={prismMidY}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={C.ink} stopOpacity="0" />
            <stop offset="40%" stopColor={C.ink} stopOpacity="0.35" />
            <stop offset="90%" stopColor={C.inkSoft} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>

          <linearGradient
            id="grad-prism-body"
            x1={prismLeft}
            y1={prismTop}
            x2={prismRight}
            y2={prismBottom}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FBF7EE" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#EDE3D1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#CFC5B5" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient
            id="grad-spectrum"
            x1={prismRight}
            y1={prismTop}
            x2={prismRight}
            y2={prismBottom}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={FRAMEWORKS[0].color} stopOpacity="0.85" />
            <stop offset="25%" stopColor={FRAMEWORKS[1].color} stopOpacity="0.85" />
            <stop offset="50%" stopColor={FRAMEWORKS[2].color} stopOpacity="0.85" />
            <stop offset="75%" stopColor={FRAMEWORKS[3].color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={FRAMEWORKS[4].color} stopOpacity="0.85" />
          </linearGradient>

          <filter id="beam-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="apex-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>

          <filter id="prism-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        <line
          x1="0"
          y1={prismMidY}
          x2={prismLeft - 2}
          y2={prismMidY}
          stroke="url(#grad-input)"
          strokeWidth="3"
        />
        <text
          x="14"
          y={prismMidY - 14}
          fontSize="11"
          fontFamily="DM Sans, sans-serif"
          fill={C.inkMuted}
          letterSpacing="2.5"
        >
          USE CASE
        </text>

        <g filter="url(#beam-glow)">
          {FRAMEWORKS.map((f) => {
            const isActive = activeLens === f.id;
            return (
              <line
                key={`beam-${f.id}`}
                x1={prismRight}
                y1={prismMidY}
                x2={780}
                y2={beamYs[f.id]}
                stroke={`url(#grad-${f.id})`}
                strokeWidth={isActive ? 3.6 : 1.8}
                opacity={isActive ? 1 : 0.4}
                strokeLinecap="round"
                style={{ transition: 'all 450ms ease', cursor: 'pointer' }}
                onClick={() => setActiveLens(f.id)}
                className={isActive ? 'beam-pulse' : ''}
              />
            );
          })}
        </g>

        {/* Rotating prism group */}
        <g
          transform={`rotate(${theta} ${centroidX} ${centroidY})`}
          style={{ transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          <polygon
            points={`${prismLeft - 6},${prismTop - 6} ${prismLeft - 6},${prismBottom + 6} ${prismRight + 10},${prismMidY}`}
            fill="#FFFFFF"
            opacity="0.35"
            filter="url(#apex-glow)"
          />

          {FRAMEWORKS.map((f, i) => {
            const startY = prismTop + 25 + i * 30;
            const isActive = activeLens === f.id;
            return (
              <line
                key={`internal-${f.id}`}
                x1={prismLeft + 8}
                y1={startY}
                x2={prismRight - 3}
                y2={prismMidY}
                stroke={f.color}
                strokeWidth={isActive ? 1.8 : 1}
                opacity={isActive ? 0.9 : 0.45}
                strokeLinecap="round"
                style={{ transition: 'all 450ms ease' }}
              />
            );
          })}

          <polygon
            points={`${prismLeft},${prismTop} ${prismLeft},${prismBottom} ${prismRight},${prismMidY}`}
            fill="url(#grad-prism-body)"
            stroke={C.ink}
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.78"
          />

          <line
            x1={prismLeft + 4}
            y1={prismTop + 2}
            x2={prismRight - 2}
            y2={prismMidY}
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity="0.7"
            strokeLinecap="round"
            filter="url(#prism-soft)"
          />

          <line
            x1={prismLeft + 4}
            y1={prismBottom - 2}
            x2={prismRight - 2}
            y2={prismMidY}
            stroke={C.ink}
            strokeWidth="1"
            opacity="0.18"
          />

          <line
            x1={prismRight}
            y1={prismTop + 28}
            x2={prismRight}
            y2={prismBottom - 28}
            stroke="url(#grad-spectrum)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />

          <circle cx={prismRight} cy={prismMidY} r="11" fill="#FFFFFF" opacity="0.45" filter="url(#apex-glow)" />
          <circle cx={prismRight} cy={prismMidY} r="4.5" fill="#FFFFFF" opacity="0.95" />
        </g>

        {FRAMEWORKS.map((f) => {
          const y = beamYs[f.id];
          const isActive = activeLens === f.id;
          return (
            <g key={`label-${f.id}`} onClick={() => setActiveLens(f.id)} style={{ cursor: 'pointer' }}>
              <circle
                cx="780"
                cy={y}
                r={isActive ? 5.5 : 3}
                fill={f.color}
                style={{ transition: 'all 450ms ease' }}
              />
              <text
                x="770"
                y={y - 10}
                fontSize="11"
                fontFamily="DM Sans, sans-serif"
                fontWeight={isActive ? 700 : 500}
                textAnchor="end"
                fill={isActive ? f.color : C.inkSoft}
                letterSpacing="1.6"
                style={{ transition: 'all 450ms ease' }}
              >
                {f.short}
              </text>
            </g>
          );
        })}
      </svg>

      <p
        className="text-xs text-center font-mono mt-3"
        style={{ color: C.inkMuted, letterSpacing: '0.18em' }}
      >
        TAP A BEAM OR LABEL · THE PRISM ROTATES TOWARD THE ACTIVE REGIME
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Other components
// ──────────────────────────────────────────────────────────────────────────
function UseCasePicker({ useCaseId, setUseCaseId }) {
  return (
    <div className="mb-10">
      <p className="text-xs font-mono mb-3" style={{ color: C.inkMuted, letterSpacing: '0.2em' }}>
        STEP 1 · CHOOSE A USE CASE
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.values(USE_CASES).map((uc) => {
          const active = uc.id === useCaseId;
          return (
            <button
              key={uc.id}
              onClick={() => setUseCaseId(uc.id)}
              className="px-4 py-2 text-sm transition-all"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                backgroundColor: active ? C.ink : 'transparent',
                color: active ? C.bg : C.inkSoft,
                border: `1px solid ${active ? C.ink : C.border}`,
                borderRadius: 0,
              }}
            >
              {uc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UseCaseCard({ useCase }) {
  return (
    <div
      className="p-6 md:p-8 mb-12"
      style={{ backgroundColor: C.bgWarm, border: `1px solid ${C.borderSoft}` }}
    >
      <p className="text-xs font-mono mb-2" style={{ color: C.accent, letterSpacing: '0.2em' }}>
        AT THE CENTRE OF THE PRISM
      </p>
      <h2 className="font-display text-2xl md:text-3xl mb-3" style={{ color: C.ink, fontWeight: 500 }}>
        {useCase.title}
      </h2>
      <p className="text-base leading-relaxed mb-5 max-w-3xl" style={{ color: C.inkSoft }}>
        {useCase.context}
      </p>
      <div className="flex flex-col md:flex-row gap-2 md:gap-6">
        {useCase.facts.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-sm" style={{ color: C.inkMuted }}>
            <span style={{ color: C.accent, fontFamily: 'Fraunces, serif' }}>—</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LensRow({ activeLens, setActiveLens }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-mono mb-3" style={{ color: C.inkMuted, letterSpacing: '0.2em' }}>
        STEP 2 · REFRACT THROUGH A REGIME
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {FRAMEWORKS.map((f) => {
          const active = f.id === activeLens;
          return (
            <button
              key={f.id}
              onClick={() => setActiveLens(f.id)}
              className="p-4 text-left transition-all"
              style={{
                backgroundColor: active ? f.tint : 'transparent',
                border: `1px solid ${active ? f.color : C.border}`,
                borderRadius: 0,
              }}
            >
              <div className="w-2 h-2 mb-2" style={{ backgroundColor: f.color, borderRadius: '50%' }} />
              <div
                className="font-display text-base md:text-lg leading-tight"
                style={{ color: active ? f.color : C.ink, fontWeight: 500 }}
              >
                {f.name}
              </div>
              <div className="text-xs mt-1" style={{ color: C.inkMuted }}>
                {f.region}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="mb-6 last:mb-0">
      <p className="text-xs font-mono mb-2" style={{ color: C.inkMuted, letterSpacing: '0.18em' }}>
        {label.toUpperCase()}
      </p>
      {children}
    </div>
  );
}

function RefractionPanel({ framework, lensData, useCase }) {
  return (
    <div
      className="p-6 md:p-10 mb-12"
      style={{
        backgroundColor: framework.tint,
        border: `1px solid ${framework.color}33`,
        transition: 'background-color 400ms ease',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3" style={{ backgroundColor: framework.color, borderRadius: '50%' }} />
        <p className="text-xs font-mono" style={{ color: framework.color, letterSpacing: '0.2em' }}>
          {framework.name.toUpperCase()} · {useCase.label.toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <Section label="What this regime sees">
            <p className="font-display text-xl leading-snug" style={{ color: C.ink, fontWeight: 500 }}>
              {lensData.classification}
            </p>
          </Section>

          <Section label="Obligations triggered">
            <ul className="space-y-2">
              {lensData.obligations.map((o, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: C.inkSoft }}>
                  <span className="font-mono text-xs flex-shrink-0 mt-1" style={{ color: framework.color }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div>
          <Section label="Timeline">
            <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>
              {lensData.timeline}
            </p>
          </Section>

          <Section label="Compliance cost order">
            <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>
              {lensData.cost}
            </p>
          </Section>

          <Section label="Boardroom translation">
            <p
              className="font-display text-base md:text-lg leading-snug italic"
              style={{
                color: C.ink,
                fontWeight: 400,
                borderLeft: `2px solid ${framework.color}`,
                paddingLeft: '1rem',
              }}
            >
              {lensData.translation}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function ConflictSection({ conflicts, show, setShow }) {
  return (
    <div className="mb-12">
      <button
        onClick={() => setShow(!show)}
        className="w-full p-5 md:p-6 text-left transition-all"
        style={{
          backgroundColor: show ? C.ink : 'transparent',
          color: show ? C.bg : C.ink,
          border: `1px solid ${C.ink}`,
          borderRadius: 0,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono mb-1" style={{ letterSpacing: '0.2em', opacity: 0.7 }}>
              STEP 3 · WHERE STRATEGY LIVES
            </p>
            <p className="font-display text-xl md:text-2xl" style={{ fontWeight: 500 }}>
              {show ? 'Friction zones — where the regimes disagree' : 'Show framework conflicts'}
            </p>
          </div>
          <div
            className="text-2xl flex-shrink-0"
            style={{
              transform: show ? 'rotate(45deg)' : 'rotate(0)',
              transition: 'transform 200ms ease',
            }}
          >
            +
          </div>
        </div>
      </button>

      {show && (
        <div className="mt-2">
          {conflicts.map((c, i) => (
            <div
              key={i}
              className="p-6 md:p-8 mb-2"
              style={{ backgroundColor: C.bgWarm, border: `1px solid ${C.borderSoft}` }}
            >
              <p className="text-xs font-mono mb-3" style={{ color: C.accent, letterSpacing: '0.2em' }}>
                CONFLICT {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="font-display text-xl md:text-2xl mb-4" style={{ color: C.ink, fontWeight: 500 }}>
                {c.title}
              </h3>
              <p className="text-sm md:text-base leading-relaxed mb-5" style={{ color: C.inkSoft }}>
                {c.tension}
              </p>
              <div className="pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-xs font-mono mb-2" style={{ color: C.inkMuted, letterSpacing: '0.18em' }}>
                  STRATEGIC IMPLICATION
                </p>
                <p className="font-display text-base md:text-lg italic" style={{ color: C.ink, fontWeight: 400 }}>
                  {c.strategic}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────
export default function PolicyPrism() {
  const [useCaseId, setUseCaseId] = useState('credit');
  const [activeLens, setActiveLens] = useState('eu');
  const [showConflicts, setShowConflicts] = useState(false);

  const useCase = USE_CASES[useCaseId];
  const framework = FRAMEWORKS.find((f) => f.id === activeLens);
  const lensData = LENSES[activeLens][useCaseId];
  const conflicts = CONFLICTS[useCaseId];

  return (
    <div style={{ backgroundColor: C.bg, color: C.ink, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-optical-sizing: auto; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        body { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes beam-breathe {
          0%, 100% { opacity: 0.92; }
          50% { opacity: 1; }
        }
        .beam-pulse { animation: beam-breathe 2.6s ease-in-out infinite; }
      `}</style>

      <div className="max-w-5xl mx-auto px-5 py-12 md:px-12 md:py-20 font-body">
        <header className="mb-12 md:mb-16">
          <p className="text-xs font-mono mb-6" style={{ color: C.accent, letterSpacing: '0.25em' }}>
            POLICY PRISM · PROTOTYPE
          </p>
          <h1
            className="font-display mb-6"
            style={{
              color: C.ink,
              fontWeight: 400,
              fontSize: 'clamp(2.25rem, 6vw, 4rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Same AI system,
            <br />
            <em style={{ color: C.accent, fontStyle: 'italic', fontWeight: 400 }}>
              five legal universes.
            </em>
          </h1>
          <p
            className="max-w-2xl leading-relaxed"
            style={{ color: C.inkSoft, fontSize: 'clamp(1rem, 1.6vw, 1.125rem)' }}
          >
            One concrete use case sits at the centre. Five regulatory regimes refract it
            differently — different classifications, different obligations, different costs.
            The conflict zones are where strategy actually lives.
          </p>
        </header>

        <PrismDiagram activeLens={activeLens} setActiveLens={setActiveLens} />

        <UseCasePicker useCaseId={useCaseId} setUseCaseId={setUseCaseId} />

        <UseCaseCard useCase={useCase} />

        <LensRow activeLens={activeLens} setActiveLens={setActiveLens} />

        <RefractionPanel framework={framework} lensData={lensData} useCase={useCase} />

        <ConflictSection conflicts={conflicts} show={showConflicts} setShow={setShowConflicts} />

        <footer
          className="pt-10 mt-12 text-sm leading-relaxed"
          style={{ borderTop: `1px solid ${C.border}`, color: C.inkMuted }}
        >
          <p
            className="mb-2"
            style={{
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: '1.0625rem',
              color: C.inkSoft,
            }}
          >
            A prototype, built to think out loud.
          </p>
          <p className="max-w-2xl">
            Not legal advice. The classifications and timelines are simplifications drawn from
            the published instruments; an actual deployment requires regime-by-regime counsel.
            What the prism is for is sharpening the boardroom question — which is rarely
            <em>&nbsp;is this compliant?&nbsp;</em>
            and almost always
            <em>&nbsp;under whose definition?</em>
          </p>
        </footer>
      </div>
    </div>
  );
}
