/**
 * AuditAI Range - Program Data Constants
 */

export interface Organization {
  id: string;
  name: string;
  industry: string;
  size: string;
  geography: string;
  regulatoryExposure: string[];
  frameworks: string[];
  context: string;
}

export interface SUT {
  id: number;
  name: string;
  org: string;
  type: string;
  riskTier: string;
  primaryTest: string;
}

export interface ProgramPhase {
  id: number;
  title: string;
  weeks: string;
  description: string;
  primaryActivities: string[];
  deliverables: string[];
}

export const ORGANIZATIONS: Organization[] = [
  {
    id: 'helix',
    name: 'Helix Health',
    industry: 'Healthcare Provider',
    size: '12 hospitals, 8,000 employees',
    geography: 'US (CA, AZ, NV) + EU Pilot (Germany)',
    regulatoryExposure: ['HIPAA', 'EU AI Act (high-risk)', 'CMS', 'CA SB 1001'],
    frameworks: ['NIST AI RMF', 'ISO 42001 (in-flight)', 'HITRUST CSF'],
    context: 'Internal Audit performing first-ever AI-focused assurance review.'
  },
  {
    id: 'stellar',
    name: 'Stellar Bank',
    industry: 'Banking (Commercial + Retail)',
    size: '$52B assets, 4,500 employees',
    geography: 'US (Northeast + Mid-Atlantic)',
    regulatoryExposure: ['OCC', 'FDIC', 'SR 11-7', 'NYC LL 144', 'EU AI Act', 'GLBA'],
    frameworks: ['NIST AI RMF', 'FFIEC', 'SR 11-7', 'ISO 42001 (aspirational)'],
    context: 'Three Lines of Defense - 2nd Line (Risk) doing pre-implementation review.'
  },
  {
    id: 'nimbus',
    name: 'Nimbus AI',
    industry: 'Enterprise SaaS (AI Support)',
    size: '280 employees, $45M ARR',
    geography: 'Global (US-HQ, EU/UK, Singapore)',
    regulatoryExposure: ['EU AI Act', 'GDPR', 'SOC 2 Type II', 'ISO 42001'],
    frameworks: ['ISO 42001', 'SOC 2', 'EU AI Act', 'OWASP LLM Top 10'],
    context: 'External readiness assessment for ISO 42001 certification.'
  }
];

export const SUTS: SUT[] = [
  { id: 1, name: 'MedAssist', org: 'Helix', type: 'RAG clinical decision support', riskTier: 'High-Risk (Annex III)', primaryTest: 'HIPAA + EU AI Act' },
  { id: 2, name: 'ImageDx', org: 'Helix', type: 'Diagnostic imaging classifier', riskTier: 'High-Risk (medical device)', primaryTest: 'EU MDR + EU Act' },
  { id: 3, name: 'ClaimsNet', org: 'Helix', type: 'Claims fraud detection', riskTier: 'Limited', primaryTest: 'NIST AI RMF' },
  { id: 4, name: 'PatientFlow', org: 'Helix', type: 'Scheduling optimizer', riskTier: 'Minimal', primaryTest: 'ISO 42001 lifecycle' },
  { id: 5, name: 'TalentMatch', org: 'Stellar', type: 'HR resume screener', riskTier: 'High-Risk + NYC LL 144', primaryTest: 'NYC LL 144 + EEOC' },
  { id: 6, name: 'ChatBank', org: 'Stellar', type: 'Customer service agent', riskTier: 'Limited', primaryTest: 'OWASP LLM Top 10 + SR 11-7' },
  { id: 7, name: 'FraudDetect', org: 'Stellar', type: 'Transaction fraud', riskTier: 'Limited', primaryTest: 'SR 11-7 model risk' },
  { id: 8, name: 'CreditAssist', org: 'Stellar', type: 'Credit decisioning', riskTier: 'High-Risk', primaryTest: 'ECOA + EU AI Act' },
  { id: 9, name: 'SupportBot', org: 'Nimbus', type: 'Multi-tenant support RAG', riskTier: 'Limited', primaryTest: 'ISO 42001 + SOC 2' },
  { id: 10, name: 'AnalyticsCopilot', org: 'Nimbus', type: 'Agentic analyst LLM', riskTier: 'Limited to High', primaryTest: 'Agent security + ISO 42001' }
];


export const PHASES: ProgramPhase[] = [
  {
    id: 1,
    weeks: '1-2',
    title: 'Foundation & Discovery',
    description: 'Stand up lab, ingest evidence, build AI inventory, risk-tier.',
    primaryActivities: ['Ollama setup', 'Evidence ingestion', 'Materiality assessment'],
    deliverables: ['Lab Readiness Memo', 'AI Inventory', 'Risk Register']
  },
  {
    id: 2,
    weeks: '3-6',
    title: 'Adversarial Testing',
    description: 'Prompt injection, RAG exfiltration, agent abuse, robustness.',
    primaryActivities: ['Red-teaming', 'AIRTP+ Prep', 'Microsoft Playground Integration'],
    deliverables: ['4 Red-team reports', 'AIRTP+ pass certificate']
  },
  {
    id: 3,
    weeks: '7-9',
    title: 'Bias & Fairness',
    description: 'Tabular ML bias, LLM bias, counterfactual fairness.',
    primaryActivities: ['NYC LL 144 audit', 'Demographic parity testing'],
    deliverables: ['3 Bias audit reports']
  },
  {
    id: 4,
    weeks: '10-12',
    title: 'Governance & Framework',
    description: 'NIST AI RMF, ISO 42001, EU AI Act, SR 11-7.',
    primaryActivities: ['Gap assessment', 'Maturity mapping'],
    deliverables: ['NIST RMF assessment', 'ISO 42001 gap report']
  },
  {
    id: 5,
    weeks: '13-14',
    title: 'Operational AI Audit',
    description: 'Vendor / third-party audit, monitoring & drift.',
    primaryActivities: ['Vendor risk assessment', 'Drift monitoring setup'],
    deliverables: ['Vendor risk memo', 'Monitoring playbook']
  },
  {
    id: 6,
    weeks: '15-16',
    title: 'Capstone',
    description: 'Synthesis, NPC pushback, full audit report, portfolio publish.',
    primaryActivities: ['Report drafting', 'Stakeholder presentation'],
    deliverables: ['Full Capstone Audit Report', 'Portfolio Published']
  }
];

export interface Scenario {
  week: number;
  phaseId: number;
  title: string;
  objective: string;
  tools: string[];
  suts: string[];
  deliverable: string;
  frameworks?: string[];
  checklists: string[];
}

export interface Tool {
  name: string;
  purpose: string;
  category: 'Adversarial' | 'Bias' | 'EVAL' | 'Governance' | 'Reporting';
  phase: number | string;
}

export const TOOLS: Tool[] = [
  { name: 'Ollama', purpose: 'Local LLM hosting', category: 'Adversarial', phase: 'All' },
  { name: 'PyRIT', purpose: 'Microsoft risk identification toolkit', category: 'Adversarial', phase: 2 },
  { name: 'Garak', purpose: 'NVIDIA LLM vulnerability scanner', category: 'Adversarial', phase: 2 },
  { name: 'Promptfoo', purpose: 'Eval + red-team CLI', category: 'Adversarial', phase: '2, 3, 5' },
  { name: 'Aequitas', purpose: 'Bias audit toolkit (CMU)', category: 'Bias', phase: 3 },
  { name: 'Fairlearn', purpose: 'Microsoft fairness assessment', category: 'Bias', phase: 3 },
  { name: 'DeepEval', purpose: 'LLM eval with bias metrics', category: 'EVAL', phase: '2, 3' },
  { name: 'Giskard', purpose: 'AI testing - bias/robustness', category: 'EVAL', phase: '2, 3' },
  { name: 'Evidently', purpose: 'Data + model drift monitoring', category: 'Governance', phase: 5 },
  { name: 'WhyLabs', purpose: 'Observability (free tier)', category: 'Governance', phase: 5 },
  { name: 'MITRE ATLAS', purpose: 'Adversarial threat matrix', category: 'Governance', phase: 'All' }
];

export const SCENARIOS: Scenario[] = [
  {
    week: 1,
    phaseId: 1,
    title: 'Lab Readiness & Onboarding',
    objective: 'Stand up audit lab and validate tool function.',
    tools: ['Ollama', 'Docker'],
    suts: ['All 10 (Smoke Test)'],
    deliverable: 'Lab Readiness Memo',
    checklists: ['Docker compose up', 'Model pull Llama 3.1', 'Smoke test API endpoints']
  },
  {
    week: 2,
    phaseId: 1,
    title: 'AI Inventory & Risk Tiering',
    objective: 'Read evidence packets and build unified inventory.',
    tools: ['Excel', 'Markdown'],
    suts: ['All 10'],
    frameworks: ['EU AI Act Art 6', 'NIST AI RMF Map'],
    deliverable: 'AI Inventory + Risk Register',
    checklists: ['Classify 10 systems', 'Assign EU AI Act tiers', 'Establish materiality threshold']
  },
  {
    week: 3,
    phaseId: 2,
    title: 'Direct Prompt Injection',
    objective: 'Identify direct vulnerabilities in Helix MedAssist.',
    tools: ['Promptfoo', 'Microsoft Playground'],
    suts: ['MedAssist'],
    frameworks: ['HIPAA', 'OWASP LLM01'],
    deliverable: 'Direct Injection Findings Report',
    checklists: ['Execute jailbreak probes', 'Map findings to CVSS-AI', 'Document reproduction steps']
  },
  {
    week: 4,
    phaseId: 2,
    title: 'Indirect Injection & RAG Exfil',
    objective: 'Attack Nimbus SupportBot via poisoned documents.',
    tools: ['PyRIT', 'Garak'],
    suts: ['SupportBot'],
    frameworks: ['ISO 42001', 'SOC 2'],
    deliverable: 'Indirect Injection Report',
    checklists: ['Test tenant isolation', 'Simulate document poisoning', 'Verify PII leakage']
  },
  {
    week: 5,
    phaseId: 2,
    title: 'Agent / Tool Abuse',
    objective: 'Test agentic systems for privilege escalation.',
    tools: ['PyRIT', 'Custom Payloads'],
    suts: ['ChatBank', 'AnalyticsCopilot'],
    frameworks: ['OWASP Agentic AI Guide', 'MITRE ATLAS'],
    deliverable: 'Agent Security Assessment',
    checklists: ['Test lateral movement', 'Verify tool-chain boundary', 'Escalate privileges']
  },
  {
    week: 6,
    phaseId: 2,
    title: 'Hallucination & Robustness',
    objective: 'Quantify hallucination rates and refusal accuracy.',
    tools: ['DeepEval', 'Giskard'],
    suts: ['MedAssist', 'SupportBot'],
    frameworks: ['AIRTP+ Exam Prep'],
    deliverable: 'Reliability Audit Report',
    checklists: ['Measure answer relevancy', 'Test refusal boundaries', 'Sit AIRTP+ exam']
  },
  {
    week: 7,
    phaseId: 3,
    title: 'Independent Bias Audit',
    objective: 'Conduct NYC LL 144 audit on Stellar TalentMatch.',
    tools: ['Aequitas', 'Fairlearn'],
    suts: ['TalentMatch'],
    frameworks: ['NYC LL 144', 'EEOC 4/5 rule'],
    deliverable: 'LL 144 Compliant Audit Report',
    checklists: ['Calculate impact ratios', 'Test intersectional bias', 'Review automated thresholds']
  },
  {
    week: 10,
    phaseId: 4,
    title: 'NIST AI RMF Maturity',
    objective: 'Map findings to NIST AI RMF Govern/Map/Measure/Manage.',
    tools: ['NIST Playbook'],
    suts: ['All 10'],
    frameworks: ['NIST AI RMF 1.0'],
    deliverable: 'NIST AI RMF Maturity Assessment',
    checklists: ['Map phase 2-3 findings', 'Conduct gap heatmap', 'Compare maturity cross-org']
  },
  {
    week: 13,
    phaseId: 5,
    title: 'Third-Party / Vendor Audit',
    objective: 'Helix audits Nimbus as a vendor.',
    tools: ['Document Review'],
    suts: ['SupportBot'],
    frameworks: ['GDPR', 'DPA', 'BAA'],
    deliverable: 'Vendor Risk Assessment',
    checklists: ['Review model card', 'Verify security attestations', 'Assess HIPAA considerations']
  },
  {
    week: 16,
    phaseId: 6,
    title: 'NPC Pushback & Delivery',
    objective: 'Simulated stakeholder pushback emails and final delivery.',
    tools: ['NPC Simulator'],
    suts: ['All (Comprehensive)'],
    frameworks: ['All (Synthesis)'],
    deliverable: 'Final Capstone Report + LinkedIn Post',
    checklists: ['Address Sarah Chen pushback', 'Finalize remediation roadmap', 'Publish portfolio summary']
  }
];

export const RISK_RATING_METHODOLOGY = {
  formula: 'Severity (1-5) x Likelihood (1-5) = Risk Score (1-25)',
  severityScale: [
    { level: 5, label: 'Catastrophic', detail: 'Safety, legal, regulatory finding, mass data exposure' },
    { level: 4, label: 'High', detail: 'Financial loss >$1M, regulatory fine, reputational' },
    { level: 3, label: 'Medium', detail: 'Operational disruption, limited PII exposure' },
    { level: 2, label: 'Low', detail: 'Efficiency loss, internal-only' },
    { level: 1, label: 'Minimal', detail: 'Informational' }
  ],
  likelihoodScale: [
    { level: 5, label: 'Almost Certain', detail: 'PoC achieved by auditor' },
    { level: 4, label: 'Likely', detail: 'Well-documented attack technique' },
    { level: 3, label: 'Possible', detail: 'Theoretical w/ public examples' },
    { level: 2, label: 'Unlikely', detail: 'Requires unusual conditions' },
    { level: 1, label: 'Rare', detail: 'Theoretical, no known exploit' }
  ],
  ratingTiers: [
    { min: 20, max: 25, label: 'Critical', color: 'bg-rose-600' },
    { min: 12, max: 19, label: 'High', color: 'bg-orange-500' },
    { min: 6, max: 11, label: 'Medium', color: 'bg-amber-400' },
    { min: 1, max: 5, label: 'Low', color: 'bg-emerald-500' }
  ]
};

export const RUBRIC_CRITERIA = [
  'Audit objective is specific and measurable',
  'Scope and limitations are explicitly documented',
  'Procedures performed are reproducible',
  'Each finding contains all 5 elements (CCCEE)',
  'Evidence is referenced with paths (no orphan claims)',
  'Risk ratings use a consistent methodology',
  'Recommendations are SMART',
  'Findings mapped to frameworks',
  'Report free of opinion not supported by evidence'
];
