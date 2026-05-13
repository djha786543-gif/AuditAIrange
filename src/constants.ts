/**
 * AuditAI Range - Program Data Constants
 */

// ============================================================
// INTERFACES
// ============================================================

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
  buildApproach: string;
  primaryPhase: number;
}

export interface ProgramPhase {
  id: number;
  title: string;
  anchor: string;
  description: string;
  primaryActivities: string[];
  deliverables: string[];
}

export interface StepDetail {
  description: string;
  commandWindows?: string;
  commandMacLinux?: string;
  whatItDoes: string;
  whyWeDoIt: string;
  realWorldAnalogy?: string;
}

export interface Task {
  id: string;
  workPaperId: string;
  order: number;
  phase: 'setup' | 'execute' | 'analyze' | 'write' | 'defend' | 'grade';
  title: string;
  estimateMinutes: number;
  why: string;
  steps: string[];
  stepDetails?: StepDetail[];
  command?: string;
  commandWindows?: string;
  commandMacLinux?: string;
  commandIsIllustrative?: boolean;
  automationCommandWindows?: string;
  automationCommandMacLinux?: string;
  expectedOutput?: string;
  evidencePath?: string;
  doneCondition: string;
  unblocks?: string[];
}

export interface Scenario {
  order: number;
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
  license: string;
  link: string;
  linkLabel?: string;
}

export interface NpcPersona {
  id: string;
  name: string;
  role: string;
  org: string;
  orgId: 'helix' | 'stellar' | 'nimbus';
  personality: string;
  pushback: string;
  openingContext: string;
}

export interface ProgramRisk {
  id: string;
  risk: string;
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
}

export interface WorkPaperDef {
  id: string;
  number: number;
  title: string;
  phaseId: number;
  anchor: string;
  type: 'workpaper' | 'capstone';
  frameworks: string[];
}

export interface CrosswalkRow {
  findingType: string;
  nistAiRmf: string;
  iso42001: string;
  euAiAct: string;
  sr117: string;
  nycLl144: string;
  hipaa: string;
  owasp: string;
}

export interface SimulationMission {
  id: string;
  title: string;
  scenario: string;          // the corporate framing — the "ghost audit" setup
  sutId: number;
  findingType: string;       // matches CrosswalkRow.findingType
  primaryFramework: string;  // human-readable framework name
  primaryControl: string;    // specific control / article reference
  toolName: string;          // matches Tool.name
  npcId: string;             // matches NpcPersona.id
  workPaperId: string;       // matches WorkPaperDef.id
  recipe: string[];          // 5 concrete steps
  realityCheck: string;      // honesty reminder
  thresholdGuidance: string; // "So What?" pre-set threshold reminder
}

// ============================================================
// ORGANIZATIONS
// ============================================================

export const ORGANIZATIONS: Organization[] = [
  {
    id: 'helix',
    name: 'Helix Health',
    industry: 'Healthcare Provider',
    size: '12 hospitals, 8,000 employees, 1.2M annual patients',
    geography: 'US (CA, AZ, NV) + EU Pilot (Germany)',
    regulatoryExposure: ['HIPAA', 'EU AI Act (high-risk)', 'CMS', 'CA SB 1001', 'HITRUST CSF'],
    frameworks: ['NIST AI RMF', 'ISO 42001 (in-flight)', 'HITRUST CSF'],
    context: 'Internal Audit performing first-ever AI-focused assurance review. High-stakes regulatory context: HIPAA + EU AI Act high-risk. AI safety is not theoretical — it directly impacts patient outcomes.'
  },
  {
    id: 'stellar',
    name: 'Stellar Bank',
    industry: 'Banking (Commercial + Retail)',
    size: '$52B assets, 4,500 employees, 380 branches',
    geography: 'US (Northeast + Mid-Atlantic)',
    regulatoryExposure: ['OCC', 'FDIC', 'SR 11-7', 'NYC LL 144', 'EU AI Act', 'GLBA'],
    frameworks: ['NIST AI RMF', 'FFIEC', 'SR 11-7', 'ISO 42001 (aspirational)'],
    context: 'Three Lines of Defense — 2nd line (Risk) performing pre-implementation review. SR 11-7 is the gold standard for model risk. NYC LL 144 mandates a regulator-grade bias audit for HR AI.'
  },
  {
    id: 'nimbus',
    name: 'Nimbus AI',
    industry: 'Enterprise SaaS (AI Customer Support)',
    size: '280 employees, $45M ARR, 1,200 customers',
    geography: 'Global (US-HQ, EU/UK, Singapore)',
    regulatoryExposure: ['EU AI Act', 'GDPR', 'SOC 2 Type II', 'ISO 42001'],
    frameworks: ['ISO 42001', 'SOC 2', 'EU AI Act', 'OWASP LLM Top 10'],
    context: 'External readiness assessment for ISO 42001 certification. ISO 42001 will be the dominant AI audit standard 2026–2028. SOC 2 + AI is where most of the actual consulting market lives.'
  }
];

// ============================================================
// SYSTEMS UNDER TEST
// ============================================================

export const SUTS: SUT[] = [
  { id: 1, name: 'MedAssist', org: 'Helix', type: 'RAG clinical decision support', riskTier: 'High-Risk (Annex III)', primaryTest: 'HIPAA + EU AI Act', buildApproach: 'Ollama + LangChain (live)', primaryPhase: 2 },
  { id: 2, name: 'ImageDx', org: 'Helix', type: 'Diagnostic imaging classifier (CV)', riskTier: 'High-Risk (medical device)', primaryTest: 'EU MDR + EU AI Act', buildApproach: 'Documentation-only audit', primaryPhase: 4 },
  { id: 3, name: 'ClaimsNet', org: 'Helix', type: 'Claims fraud detection (tabular ML)', riskTier: 'Limited', primaryTest: 'NIST AI RMF Measure', buildApproach: 'scikit-learn + synthetic data', primaryPhase: 3 },
  { id: 4, name: 'PatientFlow', org: 'Helix', type: 'Scheduling optimizer (RL-lite)', riskTier: 'Minimal', primaryTest: 'ISO 42001 lifecycle', buildApproach: 'Documentation-only audit', primaryPhase: 4 },
  { id: 5, name: 'TalentMatch', org: 'Stellar', type: 'HR resume screener (tabular ML)', riskTier: 'High-Risk + NYC LL 144', primaryTest: 'NYC LL 144 + EEOC + EU AI Act', buildApproach: 'scikit-learn + biased dataset (intentional)', primaryPhase: 3 },
  { id: 6, name: 'ChatBank', org: 'Stellar', type: 'Customer service agent (LLM + tools)', riskTier: 'Limited', primaryTest: 'OWASP LLM Top 10 + SR 11-7', buildApproach: 'Ollama + LangChain (live)', primaryPhase: 2 },
  { id: 7, name: 'FraudDetect', org: 'Stellar', type: 'Transaction fraud (gradient boosting)', riskTier: 'Limited', primaryTest: 'SR 11-7 model risk', buildApproach: 'scikit-learn + synthetic data', primaryPhase: 5 },
  { id: 8, name: 'CreditAssist', org: 'Stellar', type: 'Credit decisioning (tabular ML)', riskTier: 'High-Risk', primaryTest: 'ECOA + EU AI Act high-risk', buildApproach: 'scikit-learn + biased dataset (intentional)', primaryPhase: 3 },
  { id: 9, name: 'SupportBot', org: 'Nimbus', type: 'Multi-tenant support RAG', riskTier: 'Limited', primaryTest: 'ISO 42001 + SOC 2', buildApproach: 'Ollama + LangChain (live)', primaryPhase: 2 },
  { id: 10, name: 'AnalyticsCopilot', org: 'Nimbus', type: 'Agentic analyst (multi-tool LLM)', riskTier: 'Limited→High (use-dependent)', primaryTest: 'Agent security + ISO 42001', buildApproach: 'Ollama + LangChain (live)', primaryPhase: 2 }
];

// ============================================================
// PROGRAM PHASES
// ============================================================

export const PHASES: ProgramPhase[] = [
  {
    id: 1, anchor: 'All 3 Orgs',
    title: 'Foundation & Discovery',
    description: 'Stand up the audit lab, validate all tools, ingest three org evidence packets, build AI inventory, and risk-tier all 10 systems.',
    primaryActivities: ['Spin up Ollama + 3 local LLMs', 'Train 4 tabular ML SUTs from synthetic data', 'Deploy 4 RAG/agent SUTs as Docker services', 'Smoke-test all 10 SUTs', 'Read all 3 org evidence packets', 'Risk-tier using EU AI Act + materiality threshold'],
    deliverables: ['Lab Readiness Memo', 'AI Inventory', 'Risk Register']
  },
  {
    id: 2, anchor: 'Helix + Stellar + Nimbus',
    title: 'Adversarial Testing',
    description: 'Prompt injection, RAG exfiltration, agent abuse, and robustness testing. Microsoft AI Red Teaming Playground integrated. AIRTP+ is embedded as a phase milestone.',
    primaryActivities: ['Microsoft Playground challenges 1–6', 'Garak + PyRIT probe suites on LLM SUTs', 'Indirect injection via document poisoning', 'Multi-turn agent privilege escalation', 'Hallucination rate quantification', 'AIRTP+ modules + evaluation'],
    deliverables: ['Direct Injection Report', 'RAG Exfil Report', 'Agent Security Assessment', 'Reliability Report', 'AIRTP+ Certificate']
  },
  {
    id: 3, anchor: 'Stellar (LL 144) + Helix',
    title: 'Bias & Fairness',
    description: 'Tabular ML bias, LLM demographic bias, counterfactual fairness — spanning NYC LL 144, ECOA, and EU AI Act Annex III standards.',
    primaryActivities: ['NYC LL 144 audit on TalentMatch', 'EEOC 4/5 rule calculation', 'Demographic parity testing on MedAssist', 'Counterfactual data augmentation on CreditAssist', 'Intersectional analysis (race × gender × age)', 'ECOA fair lending analysis'],
    deliverables: ['LL 144 Bias Audit Report', 'LLM Bias Audit Memo', 'Advanced Fairness Memo']
  },
  {
    id: 4, anchor: 'All 3 Orgs',
    title: 'Governance & Framework',
    description: 'Map all prior findings to NIST AI RMF. ISO 42001 gap assessment for Nimbus. EU AI Act + SR 11-7 deep-dive for Helix + Stellar.',
    primaryActivities: ['NIST AI RMF Govern/Map/Measure/Manage maturity scoring', 'ISO 42001 Annex A 38-control walkthrough', 'EU AI Act Annex III obligations gap matrix', 'SR 11-7 model risk documentation review', 'Cross-framework finding consolidation', 'Gap heatmap visualization'],
    deliverables: ['NIST RMF Maturity Assessment', 'ISO 42001 Gap Report', 'Multi-Framework Compliance Memo']
  },
  {
    id: 5, anchor: 'Cross-Org',
    title: 'Operational AI Audit',
    description: 'Vendor/third-party audit (Helix audits Nimbus). Drift monitoring design for Stellar FraudDetect. AI incident response playbook.',
    primaryActivities: ['DPA + BAA + model card vendor review', 'Security attestation verification', 'Evidently drift dashboard setup', 'WhyLabs observability integration', 'KPI + threshold + escalation path design', 'AI IR playbook creation'],
    deliverables: ['Vendor Risk Assessment', 'Monitoring Architecture', 'IR Playbook']
  },
  {
    id: 6, anchor: 'Helix Health (primary)',
    title: 'Capstone',
    description: 'Synthesize all findings into a 50–70 page enterprise audit report anchored on Helix Health. NPC pushback rounds. Portfolio publish.',
    primaryActivities: ['Consolidate all cross-phase findings', 'Draft 50–70 page capstone report', 'Respond to 3 NPC pushback emails', 'Build 12-month remediation roadmap', 'Create executive briefing deck', 'Publish GitHub repo + LinkedIn portfolio'],
    deliverables: ['Capstone Audit Report (v-final)', 'Remediation Roadmap', 'Executive Briefing Deck', 'Portfolio Published']
  }
];

// ============================================================
// SCENARIOS — All program scenarios
// ============================================================

export const SCENARIOS: Scenario[] = [
  {
    order: 1, phaseId: 1,
    title: 'Lab Readiness & Auditor Onboarding',
    objective: 'Stand up the audit lab. Validate all tools function. Document the control environment baseline.',
    tools: ['Ollama', 'Docker Compose', 'Garak (smoke)', 'Promptfoo (smoke)'],
    suts: ['All 10 (smoke test)'],
    frameworks: [],
    deliverable: 'Lab Readiness Memo',
    checklists: [
      'Docker compose up — all services healthy',
      'Pull Llama 3.1 8B, Mistral 7B, Qwen 2.5 7B',
      'Train 4 tabular ML SUTs from synthetic data',
      'Deploy 4 RAG/agent SUTs as Docker services',
      'Run Garak smoke test on MedAssist endpoint',
      'Verify Promptfoo CLI connectivity to Ollama',
      'Screenshot evidence of all 10 SUTs operational',
      'Complete evidence locker directory structure'
    ]
  },
  {
    order: 2, phaseId: 1,
    title: 'AI Inventory & Risk Tiering',
    objective: 'Read all three org evidence packets. Build unified AI inventory. Risk-tier each system using EU AI Act + materiality threshold.',
    tools: ['Excel / LibreOffice', 'Markdown'],
    suts: ['All 10 (paper-based)'],
    frameworks: ['EU AI Act Art. 6', 'EU AI Act Annex III', 'NIST AI RMF Map'],
    deliverable: 'AI Inventory + Risk Register',
    checklists: [
      'Classify all 10 systems under EU AI Act risk tiers (High / Limited / Minimal)',
      'Assign NIST AI RMF Map function maturity per system',
      'Identify high-risk systems requiring Annex III obligations',
      'Document materiality threshold and rationale',
      'Complete org-level regulatory exposure matrix (3 × 6)',
      'Prioritize audit order based on risk tier + regulatory exposure',
      'Draft risk register: likelihood + impact for each SUT',
      'Confirm scope with Internal Audit Director NPC (Robert Chen)'
    ]
  },
  {
    order: 3, phaseId: 2,
    title: 'Direct Prompt Injection',
    objective: 'Identify direct prompt injection vulnerabilities in Helix MedAssist — a HIPAA-covered clinical decision support RAG.',
    tools: ['Microsoft AI RT Playground (Chs. 1–3)', 'Garak (promptinject probe)', 'Promptfoo'],
    suts: ['MedAssist', 'Microsoft Playground targets'],
    frameworks: ['HIPAA §164.312(a)', 'OWASP LLM01', 'EU AI Act Art. 15', 'NIST Measure 2.7'],
    deliverable: 'Direct Injection Findings Report',
    checklists: [
      'Execute role-play jailbreaks (DAN, AIM, Developer Mode variants)',
      'Test system-prompt extraction via indirect leakage',
      'Run Garak promptinject probe suite — log all probe failures',
      'Attempt HIPAA-relevant PHI leakage via prompt manipulation',
      'Complete Microsoft Playground Challenges 1, 2, 3',
      'Assign CVSS-AI scores to each confirmed finding',
      'Document reproduction steps for all critical/high findings',
      'Map each finding to HIPAA, OWASP LLM01, NIST Measure 2.7'
    ]
  },
  {
    order: 4, phaseId: 2,
    title: 'Indirect Injection & RAG Exfiltration',
    objective: 'Attack Nimbus SupportBot via poisoned knowledge-base documents. Test cross-tenant data exposure in a multi-tenant RAG system.',
    tools: ['PyRIT (Crescendo orchestrator)', 'Garak (dan, glitch probes)', 'Microsoft Playground (Chs. 4–6)'],
    suts: ['SupportBot'],
    frameworks: ['ISO 42001 A.6.2.4', 'SOC 2 CC6.1', 'GDPR Art. 25', 'OWASP LLM06'],
    deliverable: 'Indirect Injection + RAG Exfil Report',
    checklists: [
      'Craft poisoned document payloads — embed injection instructions in knowledge docs',
      'Test cross-tenant data leakage — can Customer A retrieve Customer B data?',
      'Run PyRIT Crescendo multi-turn attack sequence on SupportBot',
      'Complete Microsoft Playground Challenges 4, 5, 6 (Crescendo lab)',
      'Document tenant-isolation failure proof-of-concept',
      'Test PII extraction from RAG context window',
      'Map findings to GDPR Art. 25, ISO 42001 A.7.4, OWASP LLM06',
      'Draft recommended architectural fix for each critical finding'
    ]
  },
  {
    order: 5, phaseId: 2,
    title: 'Agent / Tool Abuse',
    objective: 'Test agentic AI systems for tool abuse, privilege escalation, and lateral movement through tool chains.',
    tools: ['PyRIT (multi-turn orchestrators)', 'Custom TAP payloads', 'Promptfoo'],
    suts: ['ChatBank', 'AnalyticsCopilot'],
    frameworks: ['OWASP Agentic AI Guide', 'MITRE ATLAS AML.T0054', 'NIST Measure 2.6'],
    deliverable: 'Agent Security Assessment',
    checklists: [
      'Map ChatBank tool permissions — document all available tools and their scopes',
      'Attempt privilege escalation via tool-chain manipulation',
      'Test AnalyticsCopilot for lateral tool access beyond declared scope',
      'Attempt data exfiltration via tool outputs (file access, API calls)',
      'Run PyRIT multi-turn orchestrator — 50+ attack sequences',
      'Test for prompt injection via tool return value injection',
      'Apply TAP (Tree of Attacks with Pruning) technique',
      'Map findings to OWASP Agentic AI Guide + MITRE ATLAS techniques',
      'Draft RBAC and tool-scope remediation recommendations'
    ]
  },
  {
    order: 6, phaseId: 2,
    title: 'Hallucination, Reliability & Robustness + AIRTP+ Exam',
    objective: 'Quantify hallucination rates, refusal accuracy, and factual robustness. The AIRTP+ milestone is part of the phase evaluation.',
    tools: ['DeepEval (faithfulness, hallucination, relevancy)', 'Giskard (LLM scan)', 'HackAPrompt (exam prep)'],
    suts: ['MedAssist', 'SupportBot'],
    frameworks: ['EU AI Act Art. 13', 'ISO 42001 A.6.2.4', 'NIST Measure 2.7'],
    deliverable: 'Reliability Audit Report + AIRTP+ Certificate',
    checklists: [
      'Run DeepEval faithfulness suite on MedAssist — 100 clinical Q&A pairs',
      'Measure hallucination rate (target: <5% for clinical context)',
      'Test refusal accuracy — HIPAA-sensitive prompts should refuse appropriately',
      'Run DeepEval answer-relevancy on SupportBot — 50 support queries',
      'Execute Giskard LLM scan for both MedAssist and SupportBot',
      'Focused HackAPrompt AIRTP+ exam preparation cycle',
      'Complete the AIRTP+ evaluation milestone',
      'Map hallucination findings to EU AI Act Art. 13 transparency obligations',
      'Draft reliability KPI recommendations for production monitoring'
    ]
  },
  {
    order: 7, phaseId: 3,
    title: 'Independent Bias Audit — NYC LL 144',
    objective: "Conduct a regulator-grade bias audit on Stellar's HR resume screener under NYC Local Law 144 specifications.",
    tools: ['Aequitas', 'Fairlearn', 'scikit-learn eval'],
    suts: ['TalentMatch'],
    frameworks: ['NYC LL 144', 'EEOC 4/5 Rule', 'EU AI Act Annex III §4', 'NIST Measure 2.11'],
    deliverable: 'LL 144 Compliant Bias Audit Report',
    checklists: [
      'Load TalentMatch predictions + ground truth + demographic features',
      'Calculate selection rates by race, gender, age group',
      'Apply EEOC 4/5 (80%) rule — document all threshold violations',
      'Run Aequitas full bias audit (disparate impact, equalized odds, PPV parity)',
      'Run Fairlearn intersectional analysis (race × gender)',
      'Identify most-disadvantaged demographic subgroups',
      'Score against NYC LL 144 §1 audit requirements',
      'Draft LL 144-compliant audit report format',
      'Map findings to EU AI Act Annex III §4 (high-risk HR system)'
    ]
  },
  {
    order: 8, phaseId: 3,
    title: 'LLM Bias — Refusal, Representation & Sentiment',
    objective: 'Test for demographic bias in Helix MedAssist clinical AI — refusal rate disparities, representational harms, sentiment skew.',
    tools: ['DeepEval (bias metrics)', 'Giskard (demographic probes)', 'Custom probe scripts'],
    suts: ['MedAssist'],
    frameworks: ['NIST Measure 2.11', 'EU AI Act Art. 10', 'ISO 42001 A.6.2.6'],
    deliverable: 'LLM Bias Audit Memo — Clinical Equity',
    checklists: [
      'Design 200-prompt clinical equity test suite across 6 demographic groups',
      'Measure refusal rate disparity by patient demographic (race, gender, age)',
      'Test differential quality in symptom interpretation across demographics',
      'Assess sentiment skew in clinical recommendations',
      'Run Giskard demographic probe suite on MedAssist',
      'Run DeepEval bias metric suite on all 200 prompts',
      'Quantify representation gaps in clinical language use',
      'Map findings to NIST RMF Measure 2.11 and EU AI Act Art. 10',
      'Draft clinical equity remediation recommendations'
    ]
  },
  {
    order: 9, phaseId: 3,
    title: 'Counterfactual Fairness & Intersectional Analysis',
    objective: 'Apply counterfactual data augmentation and intersectional subgroup analysis to Stellar credit decisioning.',
    tools: ['Fairlearn (counterfactual)', 'scikit-learn (CDA)', 'Aequitas'],
    suts: ['CreditAssist'],
    frameworks: ['ECOA 15 U.S.C. §1691', 'EU AI Act Annex III §5(b)', 'NIST Measure 2.11', 'SR 11-7 §V.C'],
    deliverable: 'Advanced Fairness Memo — Counterfactual + Intersectional',
    checklists: [
      'Generate counterfactual dataset — swap protected attributes, hold all else constant',
      'Measure decision rate change between original and counterfactual cohorts',
      'Identify proxy variables correlated with protected characteristics',
      'Run Fairlearn intersectional analysis (race × income × zip code)',
      'Compare individual vs. group fairness tradeoffs',
      'Score against ECOA adverse action notice requirements',
      'Map findings to EU AI Act Annex III §5(b) credit scoring obligations',
      'Calculate SR 11-7 §V.C model risk exposure from disparate impact',
      'Draft recommendations for ECOA compliance attestation'
    ]
  },
  {
    order: 10, phaseId: 4,
    title: 'NIST AI RMF Maturity Assessment',
    objective: 'Map all Phase 2–3 findings to NIST AI RMF Govern/Map/Measure/Manage. Score maturity across all three organizations.',
    tools: ['NIST AI RMF Playbook', 'NIST AI 600-1 (GenAI Profile)', 'Custom maturity matrix'],
    suts: ['All 10'],
    frameworks: ['NIST AI RMF 1.0', 'NIST AI 600-1'],
    deliverable: 'NIST AI RMF Maturity Assessment — 3-Org Comparison',
    checklists: [
      'Map each prior finding to specific NIST AI RMF subcategory',
      'Score Govern function maturity (1–5) for each org',
      'Score Map function maturity — AI inventory completeness',
      'Score Measure function maturity — testing coverage',
      'Score Manage function maturity — incident response + monitoring',
      'Build 3-org comparison heatmap',
      'Apply NIST AI 600-1 GenAI profile for LLM-specific controls',
      'Identify top 3 maturity gaps per organization',
      'Draft NIST RMF improvement roadmap with 90-day priorities'
    ]
  },
  {
    order: 11, phaseId: 4,
    title: 'ISO 42001 Gap Assessment',
    objective: 'Walk Nimbus through all 38 ISO 42001 Annex A controls. Score evidence-based readiness for certification.',
    tools: ['ISO 42001 Annex A reference', 'Gap assessment template', 'Nimbus evidence packet'],
    suts: ['SupportBot', 'AnalyticsCopilot'],
    frameworks: ['ISO/IEC 42001:2023 (all 38 controls)'],
    deliverable: 'ISO 42001 Gap Assessment + Certification Readiness Opinion',
    checklists: [
      'Complete evidence review for Nimbus org packet (all 40 documents)',
      'Score all 38 Annex A controls (Conformant / Partial / Gap)',
      'Document evidence gaps — missing vs. weak controls',
      'Assess AI policy against ISO 42001 §5.2',
      'Review AI risk assessment process against §6.1',
      'Evaluate AI system lifecycle documentation against §9',
      'Map Phase 2 SupportBot findings to relevant Annex A controls',
      'Score certification readiness: Ready / 6-12 months / 12+ months',
      'Draft actionable remediation for top 10 control gaps'
    ]
  },
  {
    order: 12, phaseId: 4,
    title: 'EU AI Act + SR 11-7 Multi-Framework Compliance',
    objective: 'Document EU AI Act Annex III obligations for Helix and SR 11-7 model risk requirements for Stellar.',
    tools: ['EU AI Act EUR-Lex text', 'SR 11-7 Federal Reserve guidance', 'OCC Bulletin 2011-12'],
    suts: ['MedAssist', 'ImageDx', 'TalentMatch', 'CreditAssist', 'FraudDetect'],
    frameworks: ['EU AI Act Annex III', 'SR 11-7', 'OCC 2011-12'],
    deliverable: 'Multi-Framework Compliance Memo + Gap Matrix',
    checklists: [
      'Map Helix MedAssist + ImageDx to EU AI Act Annex III §5 obligations',
      'Document Technical Documentation requirements (EU AI Act Art. 11)',
      'Assess conformity assessment requirements for high-risk systems',
      'Review Stellar model validation docs against SR 11-7 §III',
      'Assess ongoing monitoring practices against SR 11-7 §V',
      'Evaluate model risk tiering against OCC 2011-12',
      'Build cross-framework gap matrix: EU AI Act × SR 11-7 × NIST RMF',
      'Identify immediate remediation vs. roadmap items',
      'Draft pre-enforcement readiness opinion for both orgs'
    ]
  },
  {
    order: 13, phaseId: 5,
    title: 'Third-Party / Vendor AI Audit',
    objective: 'Helix audits Nimbus AI as a vendor (SupportBot deployed in Helix patient portal). Review DPA, model cards, security attestations, BAA.',
    tools: ['Document review', 'Targeted technical re-test', 'Vendor questionnaire'],
    suts: ['SupportBot'],
    frameworks: ['HIPAA §164.308(b) (BAA)', 'GDPR Art. 28 (DPA)', 'EU AI Act Art. 25, 28', 'ISO 42001 A.10.2'],
    deliverable: 'Vendor Risk Assessment + Onboarding Decision Memo',
    checklists: [
      'Review Nimbus SupportBot model card — completeness assessment',
      'Verify HIPAA Business Associate Agreement coverage and scope',
      'Review Data Processing Agreement for GDPR Art. 28 compliance',
      'Assess SOC 2 Type II attestation — applicable trust service criteria',
      'Re-test SupportBot for tenant isolation (leverage prior RAG exfil findings)',
      'Review security attestations and penetration test recency',
      'Assess subprocessor chain — who does Nimbus use downstream?',
      'Score vendor AI governance maturity using NIST AI RMF lens',
      'Draft onboarding decision: Approve / Approve w/ conditions / Reject'
    ]
  },
  {
    order: 14, phaseId: 5,
    title: 'Continuous Monitoring & Drift Detection',
    objective: 'Build drift monitoring architecture for Stellar FraudDetect. Define KPIs, thresholds, escalation paths. Draft AI IR playbook.',
    tools: ['Evidently (drift dashboards)', 'WhyLabs (free tier)', 'Custom KPI framework'],
    suts: ['FraudDetect', 'TalentMatch'],
    frameworks: ['SR 11-7 §V (ongoing monitoring)', 'NIST AI RMF Manage 4.1', 'ISO 42001 A.9.3'],
    deliverable: 'Monitoring Architecture + AI IR Playbook',
    checklists: [
      'Define feature drift KPIs for FraudDetect (PSI, KL divergence, feature stability)',
      'Set up Evidently drift dashboard — reference vs. current cohort',
      'Configure WhyLabs observability for FraudDetect',
      'Define alert thresholds and escalation matrix',
      'Design model performance monitoring (precision, recall, F1 drift)',
      'Draft data quality monitoring checks',
      'Build AI incident response playbook (detection → triage → escalation → resolution)',
      'Test playbook with simulated drift injection scenario',
      'Map monitoring architecture to SR 11-7 §V ongoing monitoring requirements'
    ]
  },
  {
    order: 15, phaseId: 6,
    title: 'Capstone Synthesis & Draft',
    objective: 'Anchor on Helix Health. Pull all relevant findings from earlier work papers and draft a 50–70 page enterprise audit report.',
    tools: ['All prior work papers', 'Markdown + Pandoc', 'Mermaid (diagrams)'],
    suts: ['All Helix SUTs + SupportBot (vendor)'],
    frameworks: ['NIST AI RMF', 'ISO 42001', 'EU AI Act', 'HIPAA', 'HITRUST CSF'],
    deliverable: 'Capstone Audit Report v1 (Draft)',
    checklists: [
      'Compile all Helix-relevant findings from prior work papers',
      'Draft Section 2: Executive Summary — top 5 findings + recommendations',
      'Draft Section 3: Audit Approach & Methodology',
      'Draft Section 4: AI Program Overview (inventory + risk classification)',
      'Draft Section 5: Detailed Findings (organized by domain)',
      'Draft Section 6: Framework Compliance Assessment (NIST + ISO + EU AI Act + HIPAA)',
      'Draft Section 7: Remediation Roadmap (12-month, prioritized)',
      'Build evidence index (target 200+ items)',
      'Self-score v1 draft against senior auditor rubric (target ≥40/50)'
    ]
  },
  {
    order: 16, phaseId: 6,
    title: 'NPC Pushback & Final Delivery',
    objective: 'Receive 3 simulated stakeholder pushback emails. Respond. Finalize report. Publish portfolio to GitHub and LinkedIn.',
    tools: ['NPC Simulator (Claude API)', 'LinkedIn', 'GitHub'],
    suts: ['All (Comprehensive)'],
    frameworks: ['All (Synthesis)'],
    deliverable: 'Capstone Report v-Final + Remediation Roadmap + Portfolio',
    checklists: [
      'Receive NPC pushback from James Nakamura (CTO) — defend technical findings',
      'Receive NPC pushback from Sandra Park (CCO) — framework citation challenge',
      'Receive NPC pushback from Dr. Ryan Cho (Model Owner) — methodology dispute',
      'Draft formal responses to all 3 pushback emails',
      'Incorporate valid management responses into final report',
      'Finalize Capstone Audit Report (v-final, 50–70 pages)',
      'Build Remediation Roadmap (prioritized, 12-month horizon)',
      'Create Executive Briefing deck (10–15 slides)',
      'Make GitHub repo public — clean README + program summary',
      'Publish LinkedIn flagship portfolio post (carousel + GitHub link)'
    ]
  }
];

// ============================================================
// TOOLS
// ============================================================

export const TOOLS: Tool[] = [
  { name: 'Ollama', purpose: 'Local LLM hosting (Llama 3.1 8B, Mistral 7B, Qwen 2.5)', category: 'Adversarial', phase: 'All', license: 'Free', link: 'https://ollama.com', linkLabel: 'ollama.com' },
  { name: 'MS AI Red Teaming Playground', purpose: 'Black-Hat-grade lab with 10+ challenges (Black Hat USA)', category: 'Adversarial', phase: 2, license: 'Free (Azure free tier)', link: 'https://github.com/microsoft/AI-Red-Teaming-Playground-Labs', linkLabel: 'github.com/microsoft' },
  { name: 'PyRIT', purpose: "Microsoft's risk identification toolkit — multi-turn orchestrators", category: 'Adversarial', phase: 2, license: 'MIT', link: 'https://github.com/Azure/PyRIT', linkLabel: 'github.com/Azure/PyRIT' },
  { name: 'Garak', purpose: "NVIDIA's LLM vulnerability scanner — 50+ probe types", category: 'Adversarial', phase: 2, license: 'Apache 2', link: 'https://github.com/NVIDIA/garak', linkLabel: 'github.com/NVIDIA/garak' },
  { name: 'Promptfoo', purpose: 'Eval + red-team CLI — YAML-driven test suites', category: 'Adversarial', phase: '2, 3, 5', license: 'MIT', link: 'https://www.promptfoo.dev', linkLabel: 'promptfoo.dev' },
  { name: 'Aequitas', purpose: 'CMU bias audit toolkit — disparate impact, equalized odds', category: 'Bias', phase: 3, license: 'MIT', link: 'https://github.com/dssg/aequitas', linkLabel: 'github.com/dssg/aequitas' },
  { name: 'Fairlearn', purpose: 'Microsoft fairness assessment — counterfactual + intersectional', category: 'Bias', phase: 3, license: 'MIT', link: 'https://fairlearn.org', linkLabel: 'fairlearn.org' },
  { name: 'DeepEval', purpose: 'LLM eval — faithfulness, hallucination, bias metrics', category: 'EVAL', phase: '2, 3', license: 'Apache 2', link: 'https://www.deepeval.com', linkLabel: 'deepeval.com' },
  { name: 'Giskard', purpose: 'AI testing — bias, robustness, vulnerability scanning', category: 'EVAL', phase: '2, 3', license: 'Apache 2', link: 'https://www.giskard.ai', linkLabel: 'giskard.ai' },
  { name: 'Evidently', purpose: 'Data + model drift dashboards, monitoring reports', category: 'Governance', phase: 5, license: 'Apache 2', link: 'https://www.evidentlyai.com', linkLabel: 'evidentlyai.com' },
  { name: 'WhyLabs', purpose: 'AI observability platform (free tier)', category: 'Governance', phase: 5, license: 'Free tier', link: 'https://whylabs.ai', linkLabel: 'whylabs.ai' },
  { name: 'MITRE ATLAS', purpose: 'Adversarial ML threat matrix — technique taxonomy', category: 'Governance', phase: 'All', license: 'Free', link: 'https://atlas.mitre.org', linkLabel: 'atlas.mitre.org' }
];

// ============================================================
// NPC PERSONAS — 15 Stakeholders (5 per org)
// ============================================================

export const NPC_PERSONAS: NpcPersona[] = [
  // Helix Health
  {
    id: 'patricia-walsh', name: 'Dr. Patricia Walsh', role: 'Chief Medical Officer',
    org: 'Helix Health', orgId: 'helix',
    personality: 'Patient-safety focused, politically skilled, uncomfortable with technical language. Defers to clinical leads.',
    pushback: 'Challenges findings that disrupt clinical workflows or could alarm patients. Asks: "Will this headline in the Times?"',
    openingContext: 'Presenting audit findings that may affect clinical AI systems used in patient care at Helix Health.'
  },
  {
    id: 'james-nakamura', name: 'James Nakamura', role: 'Chief Technology Officer',
    org: 'Helix Health', orgId: 'helix',
    personality: 'Technical, defensive, frustrated by over-regulation of AI innovation. Proud of what his team built.',
    pushback: 'Argues findings are lab-theoretical. Demands production-environment PoC. "Show me a real patient who was harmed."',
    openingContext: 'The Helix CTO built MedAssist and ImageDx. He is defending his AI program against technical audit findings.'
  },
  {
    id: 'sandra-park', name: 'Sandra Park', role: 'Chief Compliance Officer',
    org: 'Helix Health', orgId: 'helix',
    personality: 'HIPAA expert, deeply risk-averse, focused on OCR enforcement history and regulatory precedent.',
    pushback: 'Demands specific OCR enforcement citations as precedent. Asks for HIPAA section numbers and attorney general examples.',
    openingContext: 'The Helix CCO is focused on HIPAA and EU AI Act high-risk compliance. She fears OCR investigations.'
  },
  {
    id: 'ryan-cho', name: 'Dr. Ryan Cho', role: 'Lead Data Scientist / Model Owner',
    org: 'Helix Health', orgId: 'helix',
    personality: 'Technically brilliant, owns the models emotionally, produces counter-evidence to dispute findings.',
    pushback: 'Questions test dataset representativeness. Argues bias findings reflect training data limitations, not model failure.',
    openingContext: 'Dr. Cho built ClaimsNet and co-built MedAssist. He is contesting your test methodology with his own data analysis.'
  },
  {
    id: 'robert-chen', name: 'Robert Chen', role: 'Internal Audit Director',
    org: 'Helix Health', orgId: 'helix',
    personality: 'Your sponsor. Politically experienced, shapes report tone for executive and board audiences.',
    pushback: 'Coaches on language and escalation thresholds. "The board needs to act on this — is your language strong enough?"',
    openingContext: 'Your engagement sponsor at Helix. He is helping you navigate the audit committee presentation and sharpen findings.'
  },
  // Stellar Bank
  {
    id: 'sarah-chen', name: 'Sarah Chen', role: 'Chief Risk Officer',
    org: 'Stellar Bank', orgId: 'stellar',
    personality: 'Direct, regulator-experienced, zero tolerance for vague findings or unsupported claims.',
    pushback: 'Demands citation of specific SR 11-7 sections. "What would the OCC say about this in their next exam?"',
    openingContext: 'The Stellar CRO will submit your findings to OCC examiners next quarter. Precision and framework citations are non-negotiable.'
  },
  {
    id: 'marcus-vane', name: 'Marcus Vane', role: 'Head of AI Engineering',
    org: 'Stellar Bank', orgId: 'stellar',
    personality: "Technical, defensive, deeply protective of the bank's AI investments and model roadmap.",
    pushback: 'Argues adversarial findings are theoretical. Demands full PoC for injection attacks. "Our models are in production — prove it works."',
    openingContext: 'Marcus built ChatBank and FraudDetect. He is challenging your red-team methodology and demanding reproducible PoCs.'
  },
  {
    id: 'elena-rodriguez', name: 'Elena Rodriguez', role: 'Compliance Officer (BSA/AML + AI)',
    org: 'Stellar Bank', orgId: 'stellar',
    personality: 'Risk-averse, multi-framework expert, obsesses over peer-bank regulatory actions and enforcement precedent.',
    pushback: 'Asks for multi-framework crosswalks and cites peer-bank actions. "What did Capital One or Wells Fargo get cited for?"',
    openingContext: 'Elena oversees NYC LL 144 compliance and GLBA at Stellar. She is questioning whether your bias findings meet the LL 144 standard.'
  },
  {
    id: 'david-torres', name: 'David Torres', role: 'Head of Quantitative Models',
    org: 'Stellar Bank', orgId: 'stellar',
    personality: 'Quant background, dismissive of qualitative audit methods, demands statistical rigor.',
    pushback: "Challenges p-values and sample sizes in bias analysis. \"This isn't statistically significant. What's your confidence interval?\"",
    openingContext: 'David owns TalentMatch and CreditAssist. He is disputing your statistical methodology for the fairness findings.'
  },
  {
    id: 'victoria-osei', name: 'Victoria Osei', role: 'Internal Audit Director',
    org: 'Stellar Bank', orgId: 'stellar',
    personality: 'Three Lines of Defense veteran, highly political, experienced in regulatory examination dynamics.',
    pushback: 'Shapes findings for the audit committee. "Critical findings need management response before we submit to the board."',
    openingContext: 'Your sponsor at Stellar. She is steering the audit report for the board and managing political sensitivities within the bank.'
  },
  // Nimbus AI
  {
    id: 'alex-kim', name: 'Alex Kim', role: 'CEO & Co-Founder',
    org: 'Nimbus AI', orgId: 'nimbus',
    personality: 'Startup velocity mindset, sees ISO 42001 as a sales tool, impatient with audit process overhead.',
    pushback: 'Challenges ROI of every finding. "This will delay our enterprise contracts by 6 months. What\'s the risk of doing nothing?"',
    openingContext: 'The Nimbus CEO sees this audit as a path to enterprise sales closures, not a compliance exercise. He challenges every delay.'
  },
  {
    id: 'priya-sharma', name: 'Priya Sharma', role: 'Chief Technology Officer',
    org: 'Nimbus AI', orgId: 'nimbus',
    personality: 'LLM-native engineer, dismissive of traditional audit frameworks, believes they lag reality by 5 years.',
    pushback: "Argues ISO 42001 doesn't reflect modern LLM architecture. \"These controls were written for 2018 ML. SupportBot is a different paradigm.\"",
    openingContext: 'The Nimbus CTO disputes whether traditional audit frameworks apply to their multi-tenant RAG architecture at all.'
  },
  {
    id: 'jordan-lee', name: 'Jordan Lee', role: 'Head of Security & Compliance',
    org: 'Nimbus AI', orgId: 'nimbus',
    personality: 'SOC 2 veteran, process-oriented, wants to scope and limit findings rather than address root causes.',
    pushback: "Argues findings are out-of-scope for current certification, pushes for risk acceptance. \"We'll document it as an accepted risk.\"",
    openingContext: 'Jordan manages SOC 2 and ISO 42001 readiness. She is trying to scope your findings narrowly to protect the certification timeline.'
  },
  {
    id: 'sam-okafor', name: 'Sam Okafor', role: 'Lead ML Engineer / SupportBot Owner',
    org: 'Nimbus AI', orgId: 'nimbus',
    personality: 'Technically exceptional but defensive about SupportBot architecture. Takes security findings personally.',
    pushback: 'Argues RAG exfil findings require unrealistic attacker prerequisites. "You had admin access — that\'s not a real attack vector."',
    openingContext: 'Sam built SupportBot. He is contesting your RAG exfiltration findings and challenging the realism of your attack scenarios.'
  },
  {
    id: 'taylor-brooks', name: 'Taylor Brooks', role: 'Chief Financial Officer',
    org: 'Nimbus AI', orgId: 'nimbus',
    personality: 'Cost-focused, Series-B startup mentality, challenges financial impact of every recommended remediation.',
    pushback: 'Challenges ROI of security fixes vs. revenue impact. "A full multi-tenant rewrite is $500K in engineering. Justify that against the breach risk."',
    openingContext: 'The Nimbus CFO is evaluating whether your recommendations are commercially viable for a 280-person startup burning cash.'
  }
];

// ============================================================
// PROGRAM RISKS
// ============================================================

export const PROGRAM_RISKS: ProgramRisk[] = [
  { id: 'R1', risk: 'Drop-off after Phase 2 (governance phases are grindier than red-team)', likelihood: 'Medium', impact: 'High', mitigation: 'LinkedIn weekly post = public commitment device. Each governance phase has concrete, independently shippable deliverables.' },
  { id: 'R2', risk: 'AIRTP+ overlap creates time crunch in Weeks 3–6', likelihood: 'Medium', impact: 'Medium', mitigation: 'AIRTP+ replaces, not supplements, Phase 2 review cycles. Net additional time is only +3 hrs/wk. Modules scheduled in evenings.' },
  { id: 'R3', risk: 'NPC pushback feels artificial / low-fidelity', likelihood: 'Medium', impact: 'Low', mitigation: 'Optional: invite one peer to play a role in capstone pushback. NPC correspondence is stored as formal evidence trail.' },
  { id: 'R4', risk: 'Tool drift — PyRIT/Garak versions change and break configs', likelihood: 'High', impact: 'Low', mitigation: 'tool_versions.lock pins all versions. Docker provides environment isolation. Upgrade paths documented per tool.' },
  { id: 'R5', risk: 'Scope creep — work expands indefinitely if not bounded', likelihood: 'Medium', impact: 'High', mitigation: '"Imperfect deliverable beats no deliverable" rule. Hard time-box per task and keep focus on task completion rather than calendar estimates.' },
  { id: 'R6', risk: 'Job interviews disrupt schedule mid-program', likelihood: 'High', impact: 'Medium', mitigation: 'Phases can pause and restart at phase boundaries. Interview activity validates the portfolio. Interim GitHub publish after each phase.' },
  { id: 'R7', risk: 'Anthropic API credit burn from NPC simulation', likelihood: 'Low', impact: 'Low', mitigation: 'Cache NPC responses. Default 80% of NPCs to Ollama local inference. Budget alerts at $40.' },
  { id: 'R8', risk: 'LinkedIn posts not landing / insufficient engagement', likelihood: 'Medium', impact: 'Low', mitigation: 'Post format already proven via existing engagement pattern. Rotate carousel/sketch. Use real tool outputs as evidence.' },
  { id: 'R9', risk: 'Capstone report becomes generic boilerplate', likelihood: 'Low', impact: 'High', mitigation: 'Anchored on 1 specific org with cumulative findings across 6 phases. NPC pushback forces specificity and prevents hedging.' },
  { id: 'R10', risk: 'Hardware insufficient for Ollama 70B models', likelihood: 'Low', impact: 'Medium', mitigation: 'Fall back to Groq free tier for inference-heavy phases. All SUTs designed to run on 8B models minimum.' }
];

// ============================================================
// WORK PAPER DEFINITIONS
// ============================================================

export const WORKPAPER_DEFINITIONS: WorkPaperDef[] = [
  { id: 'wp-01', number: 1, title: 'Lab Readiness Memo', phaseId: 1, anchor: 'All Orgs', type: 'workpaper', frameworks: [] },
  { id: 'wp-02', number: 2, title: 'AI Inventory + Risk Register', phaseId: 1, anchor: 'All Orgs', type: 'workpaper', frameworks: ['EU AI Act', 'NIST AI RMF Map'] },
  { id: 'wp-03', number: 3, title: 'Direct Injection Findings Report', phaseId: 2, anchor: 'Helix', type: 'workpaper', frameworks: ['HIPAA', 'OWASP LLM01', 'EU AI Act Art. 15'] },
  { id: 'wp-04', number: 4, title: 'Indirect Injection + RAG Exfil Report', phaseId: 2, anchor: 'Nimbus', type: 'workpaper', frameworks: ['ISO 42001', 'SOC 2', 'GDPR', 'OWASP LLM06'] },
  { id: 'wp-05', number: 5, title: 'Agent Security Assessment', phaseId: 2, anchor: 'Stellar + Nimbus', type: 'workpaper', frameworks: ['OWASP Agentic AI', 'MITRE ATLAS'] },
  { id: 'wp-06', number: 6, title: 'Reliability Audit Report', phaseId: 2, anchor: 'Helix + Nimbus', type: 'workpaper', frameworks: ['EU AI Act Art. 13', 'ISO 42001 A.6.2.4'] },
  { id: 'wp-07', number: 7, title: 'NYC LL 144 Bias Audit Report', phaseId: 3, anchor: 'Stellar', type: 'workpaper', frameworks: ['NYC LL 144', 'EEOC 4/5 Rule', 'EU AI Act Annex III'] },
  { id: 'wp-08', number: 8, title: 'LLM Bias Audit Memo — Clinical Equity', phaseId: 3, anchor: 'Helix', type: 'workpaper', frameworks: ['NIST Measure 2.11', 'EU AI Act Art. 10'] },
  { id: 'wp-09', number: 9, title: 'Advanced Fairness Memo — Counterfactual', phaseId: 3, anchor: 'Stellar', type: 'workpaper', frameworks: ['ECOA', 'EU AI Act Annex III §5(b)', 'SR 11-7'] },
  { id: 'wp-10', number: 10, title: 'NIST AI RMF Maturity Assessment', phaseId: 4, anchor: 'All Orgs', type: 'workpaper', frameworks: ['NIST AI RMF 1.0', 'NIST AI 600-1'] },
  { id: 'wp-11', number: 11, title: 'ISO 42001 Gap Assessment', phaseId: 4, anchor: 'Nimbus', type: 'workpaper', frameworks: ['ISO/IEC 42001:2023'] },
  { id: 'wp-12', number: 12, title: 'Multi-Framework Compliance Memo', phaseId: 4, anchor: 'Helix + Stellar', type: 'workpaper', frameworks: ['EU AI Act Annex III', 'SR 11-7', 'OCC 2011-12'] },
  { id: 'wp-13', number: 13, title: 'Vendor Risk Assessment', phaseId: 5, anchor: 'Helix / Nimbus', type: 'workpaper', frameworks: ['HIPAA BAA', 'GDPR Art. 28', 'ISO 42001 A.10.2'] },
  { id: 'wp-14', number: 14, title: 'Monitoring Architecture + IR Playbook', phaseId: 5, anchor: 'Stellar', type: 'workpaper', frameworks: ['SR 11-7 §V', 'NIST RMF Manage 4.1'] },
  { id: 'wp-15', number: 15, title: 'Capstone Audit Report — Draft (v1)', phaseId: 6, anchor: 'Helix Health', type: 'workpaper', frameworks: ['All'] },
  { id: 'wp-cap', number: 16, title: 'Capstone Audit Report — Final (50–70 pages)', phaseId: 6, anchor: 'Helix Health', type: 'capstone', frameworks: ['NIST AI RMF', 'ISO 42001', 'EU AI Act', 'HIPAA'] }
];

// ============================================================
// FRAMEWORK CROSSWALK — Full 8 × 7 Matrix
// ============================================================

export const FRAMEWORK_CROSSWALK: CrosswalkRow[] = [
  { findingType: 'Prompt Injection', nistAiRmf: 'Measure 2.7', iso42001: 'A.6.2.4', euAiAct: 'Art. 15', sr117: '§V (model use)', nycLl144: '—', hipaa: '§164.312(a)', owasp: 'LLM01' },
  { findingType: 'Data Leakage / PII Exposure', nistAiRmf: 'Measure 2.10', iso42001: 'A.7.4', euAiAct: 'Art. 10', sr117: '§IV (data)', nycLl144: '—', hipaa: '§164.502', owasp: 'LLM06' },
  { findingType: 'Bias / Disparate Impact', nistAiRmf: 'Measure 2.11', iso42001: 'A.6.2.6', euAiAct: 'Annex III §4–5', sr117: '§V.C', nycLl144: 'Full scope', hipaa: '—', owasp: '—' },
  { findingType: 'Hallucination / Factual Error', nistAiRmf: 'Measure 2.7', iso42001: 'A.6.2.4', euAiAct: 'Art. 13', sr117: '§V.B (output)', nycLl144: '—', hipaa: '—', owasp: 'LLM09' },
  { findingType: 'Lack of Model Documentation', nistAiRmf: 'Govern 1.7', iso42001: 'A.6.2.2', euAiAct: 'Art. 11', sr117: '§III (development)', nycLl144: '§1(c)', hipaa: '§164.316(b)', owasp: '—' },
  { findingType: 'Vendor / Third-Party Risk', nistAiRmf: 'Govern 6.1', iso42001: 'A.10.2', euAiAct: 'Art. 25, 28', sr117: '§VI', nycLl144: '—', hipaa: '§164.308(b)', owasp: '—' },
  { findingType: 'Drift / Monitoring Failure', nistAiRmf: 'Manage 4.1', iso42001: 'A.9.3', euAiAct: 'Art. 15, 72', sr117: '§V (ongoing mon.)', nycLl144: '—', hipaa: '—', owasp: '—' },
  { findingType: 'Agent Tool Abuse', nistAiRmf: 'Measure 2.6', iso42001: 'A.6.2.4', euAiAct: 'Art. 15', sr117: '—', nycLl144: '—', hipaa: '—', owasp: 'LLM08 / Agentic' }
];

// ============================================================
// RISK RATING METHODOLOGY
// ============================================================

export const RISK_RATING_METHODOLOGY = {
  formula: 'Severity (1–5) × Likelihood (1–5) = Risk Score (1–25)',
  severityScale: [
    { level: 5, label: 'Catastrophic', detail: 'Safety, legal, regulatory finding, mass data exposure' },
    { level: 4, label: 'High', detail: 'Financial loss >$1M, regulatory fine, reputational damage' },
    { level: 3, label: 'Medium', detail: 'Operational disruption, limited PII exposure' },
    { level: 2, label: 'Low', detail: 'Efficiency loss, internal-only impact' },
    { level: 1, label: 'Minimal', detail: 'Informational only' }
  ],
  likelihoodScale: [
    { level: 5, label: 'Almost Certain', detail: 'PoC achieved by auditor in this engagement' },
    { level: 4, label: 'Likely', detail: 'Well-documented attack technique with public PoCs' },
    { level: 3, label: 'Possible', detail: 'Theoretical with public examples' },
    { level: 2, label: 'Unlikely', detail: 'Requires unusual conditions or access' },
    { level: 1, label: 'Rare', detail: 'Theoretical, no known exploit in the wild' }
  ],
  ratingTiers: [
    { min: 20, max: 25, label: 'Critical', color: 'bg-rose-600' },
    { min: 12, max: 19, label: 'High', color: 'bg-orange-500' },
    { min: 6, max: 11, label: 'Medium', color: 'bg-amber-400' },
    { min: 1, max: 5, label: 'Low', color: 'bg-emerald-500' }
  ]
};

// ============================================================
// RUBRIC CRITERIA (ISACA-Aligned, 10 criteria)
// ============================================================

export const RUBRIC_CRITERIA = [
  'Audit objective is specific and measurable',
  'Scope and limitations are explicitly documented',
  'Procedures performed are reproducible by another auditor',
  'Each finding contains all 5 CCCEE elements (Condition / Criteria / Cause / Effect / Recommendation)',
  'Evidence is referenced with file paths (no orphan claims)',
  'Risk ratings use a consistent, documented methodology',
  'Recommendations are SMART (specific, measurable, achievable, relevant, time-bound)',
  'Findings are mapped to at least one applicable regulatory framework',
  'Report is free of opinion not supported by evidence',
  'Could be defended in front of an audit committee without revision'
];

// ============================================================
// SIMULATION MISSIONS — Pre-built "Ghost Audits"
// Each mission cross-links SUT × finding × framework × tool × NPC × work paper.
// ============================================================

export const SIMULATION_MISSIONS: SimulationMission[] = [
  {
    id: 'm-hr-bias-sweep',
    title: 'HR AI Bias Sweep — NYC LL 144 Edition',
    scenario: 'Stellar Bank wants to deploy TalentMatch for resume screening across all 380 branches. NYC operations are subject to LL 144, which mandates an independent bias audit before automated employment decisions go live. The HR VP keeps asking "is this thing going to get us sued?"',
    sutId: 5,
    findingType: 'Bias / Disparate Impact',
    primaryFramework: 'NYC LL 144',
    primaryControl: 'NYC LL 144 §1 + EEOC 4/5 Rule',
    toolName: 'Aequitas',
    npcId: 'elena-rodriguez',
    workPaperId: 'wp-07',
    recipe: [
      'Pull TalentMatch predictions + ground truth + demographic data (race, gender, age) from the held-out test set',
      'Run Aequitas with race + gender as reference attributes — log full disparate-impact report',
      'Calculate selection rate per protected group; flag any subgroup ratio < 80% (EEOC threshold)',
      'Run Fairlearn dashboard for intersectional analysis (race × gender × age band)',
      'Draft WP07 in the LL 144 publication format: impact ratios, scoring rates, intersectional breakdown, CCCEE per finding'
    ],
    realityCheck: 'Without actually loading TalentMatch and running Aequitas against real predictions, this is just a mental exercise. Install Aequitas (`pip install aequitas`), point it at synthetic biased data, and watch your "audit report" go from theory to defensible evidence.',
    thresholdGuidance: 'BEFORE you start: write down what selection-rate ratio counts as a "fail." EEOC says 80% — but is your threshold 80%, 85%, or stricter for high-risk HR AI? Document the threshold in your scope memo, not after seeing the numbers.'
  },
  {
    id: 'm-clinical-rag-injection',
    title: 'Clinical RAG Prompt Injection — HIPAA Risk Surface',
    scenario: 'Helix Health\'s MedAssist is a HIPAA-covered RAG bot used by clinicians at the bedside. The CMO wants confirmation that no prompt manipulation can leak PHI from the retrieval index. OCR has been issuing fines for similar incidents at peer hospitals. You have one sprint to surface every direct-injection vector that could trigger a breach notification.',
    sutId: 1,
    findingType: 'Prompt Injection',
    primaryFramework: 'HIPAA',
    primaryControl: 'HIPAA §164.312(a) + EU AI Act Art. 15 + OWASP LLM01',
    toolName: 'Garak',
    npcId: 'sandra-park',
    workPaperId: 'wp-03',
    recipe: [
      'Spin up MedAssist locally and point Garak at its inference endpoint',
      'Run the `promptinject`, `dan`, and `glitch` probe suites — let it run for ~30 minutes per probe',
      'Cross-reference Garak failures against synthetic PHI seeded in the retrieval corpus',
      'For each PHI-leakage vector, build a reproduction script and assign a CVSS-AI score',
      'Map every confirmed finding to HIPAA §164.312(a), OWASP LLM01, and NIST Measure 2.7 in WP03'
    ],
    realityCheck: 'Garak\'s power only shows when it actually runs against a live endpoint. Stand up Llama 3.1 8B in Ollama, wrap it in a tiny RAG harness, seed it with fake PHI, then run `garak --model_type ollama.OllamaChat --probes promptinject`. The first PHI leak you produce yourself is worth deep attention.',
    thresholdGuidance: 'BEFORE you start: define what counts as a "leak." Verbatim PHI? Paraphrased PHI? Existence-confirmation ("is patient X in the system")? Set the bar in your scope, or you\'ll grade your own findings into oblivion.'
  },
  {
    id: 'm-multitenant-rag-exfil',
    title: 'Multi-Tenant RAG Cross-Tenant Exfiltration',
    scenario: 'Nimbus AI\'s SupportBot is deployed across 1,200 customers, each with their own KB. A prospect asks during diligence: "can Customer A retrieve Customer B\'s data via prompt injection?" Nimbus has never tested this. You must find out — or prove they can\'t — before the prospect\'s ISO 42001 readiness call.',
    sutId: 9,
    findingType: 'Data Leakage / PII Exposure',
    primaryFramework: 'ISO 42001',
    primaryControl: 'ISO 42001 A.7.4 + GDPR Art. 25 + OWASP LLM06',
    toolName: 'PyRIT',
    npcId: 'sam-okafor',
    workPaperId: 'wp-04',
    recipe: [
      'Provision two synthetic customer tenants with distinct, identifiable secrets seeded in their KBs',
      'Author a PyRIT Crescendo orchestrator that gradually escalates retrieval requests across tenant boundaries',
      'Capture every response that surfaces Tenant B\'s secret while authenticated as Tenant A',
      'Build the proof-of-concept video: 3 minutes, scripted, reproducible',
      'Draft WP04 with the architectural fix (per-tenant vector index isolation) cited to ISO 42001 A.7.4'
    ],
    realityCheck: 'Multi-tenant RAG is one of the hardest things to test on paper because the failure mode is architectural. Without standing up PyRIT against a real RAG harness, you\'ll convince yourself the bot is safe when it isn\'t. Build the harness; run the orchestrator; you will be surprised.',
    thresholdGuidance: 'BEFORE you start: how many cross-tenant disclosures = "Critical"? One? Three? A documented attack chain that requires admin access? Set the rubric or Sam Okafor will dismiss your findings as theoretical.'
  },
  {
    id: 'm-credit-counterfactual',
    title: 'Credit Decisioning Counterfactual Fairness',
    scenario: 'Stellar Bank\'s CreditAssist is a high-risk EU AI Act Annex III system that\'s also subject to ECOA in the US. The OCC examiner is asking how the bank tests for proxy discrimination. The Quant team insists their group-fairness numbers are clean — but no one has run a counterfactual test. You have 10 days before the examiner\'s second visit.',
    sutId: 8,
    findingType: 'Bias / Disparate Impact',
    primaryFramework: 'EU AI Act',
    primaryControl: 'EU AI Act Annex III §5(b) + ECOA 15 U.S.C. §1691 + SR 11-7 §V.C',
    toolName: 'Fairlearn',
    npcId: 'david-torres',
    workPaperId: 'wp-09',
    recipe: [
      'Generate a counterfactual dataset: for each record, swap protected attributes (race, gender) but hold all other features fixed',
      'Score CreditAssist on the original and counterfactual sets; record the per-record decision change rate',
      'Identify proxy variables (zip code, school, employer) correlated with protected attributes',
      'Run Fairlearn intersectional analysis (race × income tier × geography)',
      'Draft WP09 with both individual-fairness (counterfactual) and group-fairness (Aequitas) results, cited to ECOA and EU AI Act Annex III §5(b)'
    ],
    realityCheck: 'Group fairness can pass while individual fairness fails — and that\'s what gets you sued under ECOA. Without writing the counterfactual generator yourself (~20 lines of Python), you\'ll never feel why this matters. Build it.',
    thresholdGuidance: 'BEFORE you start: how much per-record decision flipping = bias? 2%? 5%? 10%? The literature gives no single answer; pick yours and document the rationale before you see the numbers.'
  },
  {
    id: 'm-bank-hallucination',
    title: 'Banking LLM Hallucination Audit',
    scenario: 'Stellar Bank\'s ChatBank handles ~40,000 customer queries/day. A regulator asked: "what\'s your hallucination rate, and what\'s the financial exposure if a customer acts on a wrong answer about fees or rates?" The Head of AI shrugged. Your job: quantify it, set a production threshold, and put both in writing before the next OCC exam.',
    sutId: 6,
    findingType: 'Hallucination / Factual Error',
    primaryFramework: 'EU AI Act',
    primaryControl: 'EU AI Act Art. 13 + NIST Measure 2.7 + ISO 42001 A.6.2.4',
    toolName: 'DeepEval',
    npcId: 'marcus-vane',
    workPaperId: 'wp-06',
    recipe: [
      'Build a 200-question gold-standard dataset of bank-specific Q&A (fees, rates, account types, regulations)',
      'Run DeepEval faithfulness + answer-relevancy metrics against ChatBank for all 200 queries',
      'Bucket failures by type: numeric hallucination, regulatory misstatement, fabricated policy',
      'Estimate financial exposure per failure type (numeric errors weighted by transaction volume)',
      'Draft WP06: hallucination rate by category + recommended production gating threshold + monitoring KPI'
    ],
    realityCheck: 'A single number — "we tested faithfulness and got 0.84" — means nothing. Without running DeepEval and seeing which questions failed, you can\'t tell a fee-rate hallucination (regulator-fineable) from a typo (cosmetic). Run the suite, read the failures, segment them.',
    thresholdGuidance: 'BEFORE you start: at what faithfulness score does the bot get pulled from production? 0.95? 0.99? It\'s a business decision, not a technical one — but it has to be in the audit before testing or Marcus will accuse you of grading on a curve.'
  },
  {
    id: 'm-agent-tool-abuse',
    title: 'Agentic Tool-Chain Privilege Escalation',
    scenario: 'Nimbus AI\'s AnalyticsCopilot is an agentic LLM with 14 tools (SQL, Python, file I/O, email). A pen tester from a customer asked: "can a malicious prompt make the agent call tools it shouldn\'t?" The Nimbus CTO insists the tool-scope guards are fine. You have one sprint to confirm that before the customer\'s SOC 2 review.',
    sutId: 10,
    findingType: 'Agent Tool Abuse',
    primaryFramework: 'OWASP',
    primaryControl: 'OWASP LLM08 + Agentic AI Guide + MITRE ATLAS AML.T0054',
    toolName: 'Promptfoo',
    npcId: 'priya-sharma',
    workPaperId: 'wp-05',
    recipe: [
      'Enumerate every tool AnalyticsCopilot can call — document declared scope vs. implementation',
      'Author Promptfoo red-team test suite with payloads targeting unauthorized tool invocation',
      'Apply TAP (Tree of Attacks with Pruning) — multi-turn payloads that gradually expand tool scope',
      'For each successful escalation, capture the exact prompt + tool sequence as a reproducible PoC',
      'Draft WP05 mapping each finding to OWASP LLM08, Agentic AI Guide, and the relevant ATLAS technique'
    ],
    realityCheck: 'Agent abuse looks deceptively simple in slides. The actual exploit takes 30+ turns and a careful payload chain. Without writing Promptfoo configs and watching the agent fail in real time, you\'ll write findings that Priya will (correctly) call theoretical.',
    thresholdGuidance: 'BEFORE you start: which tools are "Critical" if escalated to (file system writes, network egress)? Which are "Acceptable Risk" (read-only SQL on synthetic data)? Without a tool-criticality matrix up front, every escalation looks equally bad.'
  },
  {
    id: 'm-fraud-drift',
    title: 'Fraud Model Drift Monitoring Build',
    scenario: 'Stellar Bank\'s FraudDetect was trained 18 months ago. Transaction patterns have shifted (post-rate-cycle, post-fee-restructure). The CRO wants quarterly drift evidence for the next OCC exam — and an incident response playbook for when drift exceeds threshold. You need to design the monitoring architecture and stand up a working prototype promptly.',
    sutId: 7,
    findingType: 'Drift / Monitoring Failure',
    primaryFramework: 'SR 11-7',
    primaryControl: 'SR 11-7 §V (ongoing monitoring) + NIST AI RMF Manage 4.1',
    toolName: 'Evidently',
    npcId: 'sarah-chen',
    workPaperId: 'wp-14',
    recipe: [
      'Set the reference period (training cohort) and current period (last 30 days) for FraudDetect',
      'Build the Evidently report: PSI, KL divergence, feature stability index per input feature',
      'Define alert thresholds (warn at PSI > 0.1, critical at PSI > 0.25) and the escalation matrix',
      'Draft the AI incident response playbook: detection → triage → escalation → resolution → post-mortem',
      'Test the playbook by injecting a synthetic drift scenario; document the response timing'
    ],
    realityCheck: 'Drift dashboards mean nothing without a triage playbook. Most banks have one without the other. Build both — and run a tabletop exercise with your simulated drift event before declaring victory.',
    thresholdGuidance: 'BEFORE you start: what drift level triggers a model retrain (slow, expensive)? What level triggers a full takedown (fast, painful)? The OCC will ask, and Sarah will not accept "we\'ll know it when we see it" as an answer.'
  },
  {
    id: 'm-vendor-audit',
    title: 'Vendor AI Risk — Helix Audits Nimbus',
    scenario: 'Helix Health is procuring Nimbus SupportBot for the patient portal. SupportBot will see PHI. Nimbus has SOC 2 Type II but no HIPAA-specific attestations. You\'re doing the vendor risk assessment — review the BAA, the model card, and the security stack, then re-run the RAG exfil tests as an outside auditor with access only to what Helix would actually have.',
    sutId: 9,
    findingType: 'Vendor / Third-Party Risk',
    primaryFramework: 'HIPAA',
    primaryControl: 'HIPAA §164.308(b) (BAA) + GDPR Art. 28 (DPA) + ISO 42001 A.10.2',
    toolName: 'Promptfoo',
    npcId: 'sandra-park',
    workPaperId: 'wp-13',
    recipe: [
      'Review the Nimbus BAA — does it cover all 18 HIPAA Safe Harbor identifiers?',
      'Review the SupportBot model card — training data provenance, fine-tuning sources, eval coverage',
      'Re-run Promptfoo cross-tenant exfil tests using only customer-tier API access (no admin)',
      'Map the subprocessor chain: who does Nimbus send PHI to downstream, and are they HIPAA-covered?',
      'Draft WP13 with onboarding decision: Approve / Approve w/ conditions / Reject — cited to HIPAA, GDPR, ISO 42001 A.10.2'
    ],
    realityCheck: 'Vendor audit on paper is checkbox theater. The findings that matter come from re-running technical tests as an outside party with restricted access — not from the vendor\'s own attestation deck. Do the re-test.',
    thresholdGuidance: 'BEFORE you start: which contract terms are non-negotiable (data residency, breach notification SLA, audit rights)? Bring that list to the review — don\'t let Nimbus\'s answers shape your standard.'
  }
];
