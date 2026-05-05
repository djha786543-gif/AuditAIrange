import { Task } from '../constants.ts';

export const TASKS: Task[] = [
  // WP01
  {
    id: 'wp-01-t01',
    workPaperId: 'wp-01',
    order: 1,
    phase: 'setup',
    title: 'Prepare audit lab environment and evidence locker',
    estimateMinutes: 45,
    why: 'A stable lab and evidence structure let you execute probes and capture proof consistently.',
    steps: [
      'Create local evidence directories for each work paper',
      'Install Python 3.11+ and create a virtual environment',
      'Install core packages: numpy, pandas, requests, promptfoo',
      'Verify PATH and tool access for Docker, Ollama, and Garak'
    ],
    command: 'python -m venv audit-env && source audit-env/bin/activate && pip install numpy pandas requests promptfoo',
    expectedOutput: '(audit-env) user@host:~$',
    evidencePath: '07_evidence/wp-01/env_setup.log',
    doneCondition: 'The lab is prepared and the evidence folder exists with tool validation notes.'
  },
  {
    id: 'wp-01-t02',
    workPaperId: 'wp-01',
    order: 2,
    phase: 'execute',
    title: 'Validate core services and smoke test all SUTs',
    estimateMinutes: 60,
    why: 'Smoke-testing ensures all systems are reachable before deeper probes begin.',
    steps: [
      'Start Docker compose for all services',
      'Verify all 10 SUT containers are healthy',
      'Pull and load the primary LLMs used in the lab',
      'Capture screenshots or logs for service health status'
    ],
    command: 'docker compose up -d && docker compose ps && ollama ls',
    expectedOutput: 'All services healthy and LLM models loaded successfully',
    evidencePath: '07_evidence/wp-01/lab_smoke_test.log',
    doneCondition: 'All required services and LLM models are verified as operational.'
  },
  {
    id: 'wp-01-t03',
    workPaperId: 'wp-01',
    order: 3,
    phase: 'analyze',
    title: 'Review lab readiness evidence and capture baseline findings',
    estimateMinutes: 60,
    why: 'Baseline findings document the initial state and make future comparisons reliable.',
    steps: [
      'Review service health and tool validation logs',
      'Compare actual environment setup to the lab requirements',
      'Note any missing components or configuration gaps',
      'Create a short baseline findings summary'
    ],
    expectedOutput: 'Baseline findings summary that describes lab readiness and gaps',
    evidencePath: '07_evidence/wp-01/baseline_findings.txt',
    doneCondition: 'Baseline findings are documented and stored in the evidence folder.'
  },
  {
    id: 'wp-01-t04',
    workPaperId: 'wp-01',
    order: 4,
    phase: 'write',
    title: 'Draft the Lab Readiness Memo',
    estimateMinutes: 65,
    why: 'The memo captures what was validated and what is ready for the audit work ahead.',
    steps: [
      'Summarize the lab architecture and tools in use',
      'Document evidence sources and validation steps',
      'Highlight any initial gaps or risks',
      'Write the memo in the agreed audit template'
    ],
    expectedOutput: 'A complete Lab Readiness Memo stored in working files',
    evidencePath: '07_evidence/wp-01/lab_readiness_memo.md',
    doneCondition: 'A draft memo exists and references tool validation evidence.'
  },
  {
    id: 'wp-01-t05',
    workPaperId: 'wp-01',
    order: 5,
    phase: 'grade',
    title: 'Self-score the memo and practice NPC defense',
    estimateMinutes: 55,
    why: 'Reviewing the memo and simulating defense ensures the work paper is ready for critique.',
    steps: [
      'Score the memo against the rubric criteria',
      'Capture evidence links for each criterion',
      'Run one NPC chat exchange defending the memo',
      'Save the NPC exchange to the WP log'
    ],
    expectedOutput: 'Rubric scores, evidence references, and at least one NPC defense log',
    evidencePath: '07_evidence/wp-01/npc_defense.log',
    doneCondition: 'Work paper is scored and one defense exchange is saved.'
  },
  // WP02
  {
    id: 'wp-02-t01',
    workPaperId: 'wp-02',
    order: 1,
    phase: 'setup',
    title: 'Collect evidence packets and set up the inventory template',
    estimateMinutes: 45,
    why: 'An evidence inventory creates a repeatable source of truth for all systems and controls.',
    steps: [
      'Download or locate the three org evidence packets',
      'Create the AI inventory spreadsheet or markdown template',
      'Define columns for system, framework, risk tier, and evidence path',
      'Capture each SUT and its regulatory exposure'
    ],
    expectedOutput: 'AI inventory template ready and evidence packets organized',
    evidencePath: '07_evidence/wp-02/ai_inventory_setup.log',
    doneCondition: 'All evidence packets are ready and the inventory template is created.'
  },
  {
    id: 'wp-02-t02',
    workPaperId: 'wp-02',
    order: 2,
    phase: 'execute',
    title: 'Build the AI inventory and risk register',
    estimateMinutes: 75,
    why: 'The inventory and register are the foundation for all later findings and prioritization.',
    steps: [
      'Log each SUT and classify its EU AI Act risk tier',
      'Map each system to NIST AI RMF functions',
      'Identify high-risk systems requiring Annex III obligations',
      'Draft risk ratings with likelihood and impact'
    ],
    expectedOutput: 'A populated AI inventory and risk register for all 10 systems',
    evidencePath: '07_evidence/wp-02/risk_register.xlsx',
    doneCondition: 'Inventory and register are complete and evidence-sourced for all systems.'
  },
  {
    id: 'wp-02-t03',
    workPaperId: 'wp-02',
    order: 3,
    phase: 'analyze',
    title: 'Assess materiality and prioritize audit scope',
    estimateMinutes: 60,
    why: 'Prioritization ensures the audit focuses on the highest-risk systems first.',
    steps: [
      'Review regulatory exposure and business impact for each SUT',
      'Apply the materiality threshold to the inventory',
      'Rank systems by risk tier and audit effort',
      'Document the prioritized audit order'
    ],
    expectedOutput: 'A prioritized list of systems and narrative justification',
    evidencePath: '07_evidence/wp-02/priority_analysis.txt',
    doneCondition: 'The audit scope is clearly prioritized with evidence-based rationale.'
  },
  {
    id: 'wp-02-t04',
    workPaperId: 'wp-02',
    order: 4,
    phase: 'write',
    title: 'Draft the AI Inventory and Risk Register memo',
    estimateMinutes: 70,
    why: 'The memo turns analysis into a formal deliverable used by stakeholders.',
    steps: [
      'Summarize the AI inventory methodology',
      'Document risk classification criteria and results',
      'Include evidence paths and regulatory references',
      'Describe recommended next audit priorities'
    ],
    expectedOutput: 'A draft memo that links inventory data to risk findings',
    evidencePath: '07_evidence/wp-02/inventory_risk_memo.md',
    doneCondition: 'A complete memo draft exists with supporting evidence references.'
  },
  {
    id: 'wp-02-t05',
    workPaperId: 'wp-02',
    order: 5,
    phase: 'grade',
    title: 'Self-score the work paper and save NPC defense evidence',
    estimateMinutes: 50,
    why: 'Defense practice strengthens your ability to explain scope and risk choices clearly.',
    steps: [
      'Evaluate the memo against rubric criteria',
      'Add evidence path notes for each criterion',
      'Run an NPC defense simulation for the memo',
      'Save the transcript as evidence'
    ],
    expectedOutput: 'Rubric scoring plus at least one saved NPC exchange',
    evidencePath: '07_evidence/wp-02/npc_defense.log',
    doneCondition: 'The work paper is scored and defended with a saved exchange.'
  },
  // WP03
  {
    id: 'wp-03-t01',
    workPaperId: 'wp-03',
    order: 1,
    phase: 'setup',
    title: 'Setup prompt injection tooling and target MedAssist',
    estimateMinutes: 50,
    why: 'Tool preparation ensures prompt injection tests are repeatable and captured correctly.',
    steps: [
      'Install or verify Garak promptinject probes',
      'Confirm MedAssist endpoint accessibility',
      'Create evidence directory for WP03 findings',
      'Document the target test scope and assumptions'
    ],
    expectedOutput: 'Prompt injection tooling configured and MedAssist target documented',
    evidencePath: '07_evidence/wp-03/setup_promptinject.log',
    doneCondition: 'The target and tooling are validated and ready for prompt injection tests.'
  },
  {
    id: 'wp-03-t02',
    workPaperId: 'wp-03',
    order: 2,
    phase: 'execute',
    title: 'Run direct jailbreak and prompt injection probes',
    estimateMinutes: 80,
    why: 'Executing direct injection probes reveals whether MedAssist can be manipulated by crafted prompts.',
    steps: [
      'Execute role-play jailbreak variants against MedAssist',
      'Run Garak promptinject probe suite and capture failures',
      'Attempt indirect system-prompt extraction',
      'Log each confirmed injection and response behavior'
    ],
    command: 'garak promptinject --target https://medassist.local --output 07_evidence/wp-03/promptinject.log',
    expectedOutput: 'Injection probes complete with logged successes and failures',
    evidencePath: '07_evidence/wp-03/promptinject.log',
    doneCondition: 'All direct injection probes are executed and logged.'
  },
  {
    id: 'wp-03-t03',
    workPaperId: 'wp-03',
    order: 3,
    phase: 'analyze',
    title: 'Quantify injection findings and map to regulatory controls',
    estimateMinutes: 60,
    why: 'Analysis turns probe results into repeatable findings and control mappings.',
    steps: [
      'Review the injection logs for confirmed vulnerabilities',
      'Assign CVSS-AI or severity ratings to each finding',
      'Map findings to HIPAA, OWASP LLM01, and EU AI Act',
      'Document reproduction steps and impact'
    ],
    expectedOutput: 'A findings table with severity ratings and framework mappings',
    evidencePath: '07_evidence/wp-03/promptinject_analysis.md',
    doneCondition: 'Injection findings are scored and mapped to applicable controls.'
  },
  {
    id: 'wp-03-t04',
    workPaperId: 'wp-03',
    order: 4,
    phase: 'write',
    title: 'Draft the Direct Injection Findings Report',
    estimateMinutes: 75,
    why: 'The report communicates the risk and remediation clearly to stakeholders.',
    steps: [
      'Summarize methodology and scope',
      'List confirmed injection findings and evidence links',
      'Include control mapping and regulatory implications',
      'Draft remediation recommendations'
    ],
    expectedOutput: 'A draft report with evidence-backed findings and remediation',
    evidencePath: '07_evidence/wp-03/direct_injection_report.md',
    doneCondition: 'The draft report clearly captures injection findings and risk.'
  },
  {
    id: 'wp-03-t05',
    workPaperId: 'wp-03',
    order: 5,
    phase: 'grade',
    title: 'Score the report and conduct an NPC defense session',
    estimateMinutes: 60,
    why: 'Practicing defense ensures the report withstands stakeholder scrutiny.',
    steps: [
      'Score the report against rubric criteria',
      'Record evidence paths for all findings',
      'Run an NPC chat defending findings to a stakeholder persona',
      'Save the exchange and note any revision actions'
    ],
    expectedOutput: 'A graded report with defense notes and a saved exchange',
    evidencePath: '07_evidence/wp-03/npc_defense.log',
    doneCondition: 'The work paper is graded and one NPC defense exchange is saved.'
  },
  // WP04
  {
    id: 'wp-04-t01',
    workPaperId: 'wp-04',
    order: 1,
    phase: 'setup',
    title: 'Prepare document poisoning and RAG exfiltration tests',
    estimateMinutes: 50,
    why: 'Preparation reduces noise in RAG exfiltration testing and keeps evidence capture organized.',
    steps: [
      'Create poisoned knowledge base payloads',
      'Confirm SupportBot test instance and tenant data boundaries',
      'Set up PyRIT Crescendo orchestration',
      'Create evidence folders for exfiltration findings'
    ],
    expectedOutput: 'Test payloads and RAG exfiltration harness ready',
    evidencePath: '07_evidence/wp-04/setup_rag_exfil.log',
    doneCondition: 'The RAG exfiltration test harness and payloads are verified.'
  },
  {
    id: 'wp-04-t02',
    workPaperId: 'wp-04',
    order: 2,
    phase: 'execute',
    title: 'Run cross-tenant RAG exfiltration attack against SupportBot',
    estimateMinutes: 80,
    why: 'Running the exfiltration attack exposes whether customer isolates are enforced.',
    steps: [
      'Execute poisoned doc attacks against SupportBot',
      'Attempt cross-tenant data retrieval scenarios',
      'Run PyRIT multi-turn attack sequences',
      'Log any data leakage proofs'
    ],
    command: 'pyrit run --config wp-04-rag-exfil.yaml --output 07_evidence/wp-04/rag_exfil.log',
    expectedOutput: 'RAG exfiltration test results showing whether leakage occurred',
    evidencePath: '07_evidence/wp-04/rag_exfil.log',
    doneCondition: 'RAG exfiltration testing is complete with documented proof of leakage or mitigation.'
  },
  {
    id: 'wp-04-t03',
    workPaperId: 'wp-04',
    order: 3,
    phase: 'analyze',
    title: 'Analyze leakage patterns and map to data protection controls',
    estimateMinutes: 60,
    why: 'Analysis ties each leakage path back to control failures and compliance risks.',
    steps: [
      'Review logs for cross-tenant or PII leakage',
      'Classify each issue by severity and scope',
      'Map findings to GDPR, ISO 42001, and OWASP LLM06',
      'Document remediation recommendations'
    ],
    expectedOutput: 'A findings summary with control mappings and remediation guidance',
    evidencePath: '07_evidence/wp-04/rag_exfil_analysis.md',
    doneCondition: 'The exfiltration findings are analyzed and mapped to controls.'
  },
  {
    id: 'wp-04-t04',
    workPaperId: 'wp-04',
    order: 4,
    phase: 'write',
    title: 'Draft the Indirect Injection + RAG Exfil Report',
    estimateMinutes: 70,
    why: 'A formal report communicates the risk and required fixes to decision makers.',
    steps: [
      'Summarize the test methodology and scope',
      'List leakage findings and evidence references',
      'Include regulatory implications for GDPR and ISO 42001',
      'Propose technical remediation recommendations'
    ],
    expectedOutput: 'A draft report with evidence-backed leakage findings',
    evidencePath: '07_evidence/wp-04/indirect_injection_report.md',
    doneCondition: 'A complete report draft exists with proof and remediation.'
  },
  {
    id: 'wp-04-t05',
    workPaperId: 'wp-04',
    order: 5,
    phase: 'grade',
    title: 'Score the WP and save one NPC defense exchange',
    estimateMinutes: 50,
    why: 'Defense practice ensures the findings are clear and ready for stakeholder review.',
    steps: [
      'Score the work paper against the rubric',
      'Add evidence path notes for each criterion',
      'Simulate stakeholder defense using NPC chat',
      'Save the exchange for evidence'
    ],
    expectedOutput: 'Rubric scoring plus an NPC defense transcript',
    evidencePath: '07_evidence/wp-04/npc_defense.log',
    doneCondition: 'The report is graded and defended with saved evidence.'
  },
  // WP05
  {
    id: 'wp-05-t01',
    workPaperId: 'wp-05',
    order: 1,
    phase: 'setup',
    title: 'Inventory agent permissions and tool scope for ChatBank',
    estimateMinutes: 40,
    why: 'Understanding tool access is essential before testing agent abuse scenarios.',
    steps: [
      'Document ChatBank tool permissions and available scopes',
      'Review agent workflow and expected trust boundaries',
      'Set up attack hooks for tool-chain manipulation',
      'Create evidence notes for the test harness'
    ],
    expectedOutput: 'Tool permissions inventory and test harness ready',
    evidencePath: '07_evidence/wp-05/tool_inventory.log',
    doneCondition: 'Agent permission scope is documented and ready for abuse testing.'
  },
  {
    id: 'wp-05-t02',
    workPaperId: 'wp-05',
    order: 2,
    phase: 'execute',
    title: 'Execute agent/tool abuse and privilege escalation probes',
    estimateMinutes: 90,
    why: 'Practical probes reveal whether the agent can misuse its tooling.',
    steps: [
      'Attempt privilege escalation through tool chain abuse',
      'Test data exfiltration via tool outputs',
      'Run PyRIT orchestrated attack sequences',
      'Capture every abuse scenario with logs'
    ],
    command: 'pyrit run --config wp-05-agent-abuse.yaml --output 07_evidence/wp-05/agent_abuse.log',
    expectedOutput: 'Abuse probe results with documented success or failure cases',
    evidencePath: '07_evidence/wp-05/agent_abuse.log',
    doneCondition: 'Agent abuse probes are complete and evidence is captured.'
  },
  {
    id: 'wp-05-t03',
    workPaperId: 'wp-05',
    order: 3,
    phase: 'analyze',
    title: 'Analyze abuse findings and map to mitigation controls',
    estimateMinutes: 55,
    why: 'Analysis clarifies how agent abuse intersects with control frameworks and risk.',
    steps: [
      'Review all abuse logs and classify findings',
      'Map each finding to OWASP Agentic AI and MITRE ATLAS',
      'Document privilege escalation impact and likelihood',
      'Draft remediation recommendations'
    ],
    expectedOutput: 'A findings summary with control mappings and mitigations',
    evidencePath: '07_evidence/wp-05/agent_abuse_analysis.md',
    doneCondition: 'Abuse findings are analyzed and mapped to specific controls.'
  },
  {
    id: 'wp-05-t04',
    workPaperId: 'wp-05',
    order: 4,
    phase: 'write',
    title: 'Draft the Agent Security Assessment',
    estimateMinutes: 65,
    why: 'The work paper needs a clear narrative of tool abuse risk and remediation.',
    steps: [
      'Summarize the abuse testing methodology',
      'List confirmed findings and their severity',
      'Include control mapping to OWASP and MITRE',
      'Recommend specific remediation actions'
    ],
    expectedOutput: 'A draft agent security report with evidence and recommendations',
    evidencePath: '07_evidence/wp-05/agent_security_assessment.md',
    doneCondition: 'The draft assessment is complete and evidence-backed.'
  },
  {
    id: 'wp-05-t05',
    workPaperId: 'wp-05',
    order: 5,
    phase: 'grade',
    title: 'Grade the assessment and preserve NPC defense evidence',
    estimateMinutes: 50,
    why: 'Scoring and defense prepares the assessment for stakeholder review.',
    steps: [
      'Score the report using rubric criteria',
      'Add evidence path notes for each item',
      'Simulate an NPC defense for the report',
      'Save the transcript in the WP evidence log'
    ],
    expectedOutput: 'Grading notes plus at least one saved defense exchange',
    evidencePath: '07_evidence/wp-05/npc_defense.log',
    doneCondition: 'The report is graded and defended with saved evidence.'
  },
  // WP06
  {
    id: 'wp-06-t01',
    workPaperId: 'wp-06',
    order: 1,
    phase: 'setup',
    title: 'Configure reliability and hallucination measurement tools',
    estimateMinutes: 50,
    why: 'A reliable test setup is required before measuring hallucinations and refusal accuracy.',
    steps: [
      'Install DeepEval and Giskard test suites',
      'Prepare 100 clinical prompts and expected outputs',
      'Connect MedAssist and SupportBot to the evaluation harness',
      'Create evidence folders for results'
    ],
    command: 'pip install deepeval giskard && deepeval init',
    expectedOutput: 'Evaluation tools configured and test prompt sets ready',
    evidencePath: '07_evidence/wp-06/reliability_setup.log',
    doneCondition: 'Reliability measurement tooling is configured and ready to run.'
  },
  {
    id: 'wp-06-t02',
    workPaperId: 'wp-06',
    order: 2,
    phase: 'execute',
    title: 'Run hallucination, refusal, and relevance probes',
    estimateMinutes: 85,
    why: 'Actual evaluation reveals the model behaviors that matter for clinical reliability.',
    steps: [
      'Run the DeepEval faithfulness suite on MedAssist',
      'Measure hallucination rates and refusal accuracy',
      'Execute Giskard analysis on SupportBot',
      'Capture all metrics and failure cases'
    ],
    command: 'deepeval run --suite reliability --output 07_evidence/wp-06/reliability_results.json',
    expectedOutput: 'Evaluation results with hallucination and refusal metrics',
    evidencePath: '07_evidence/wp-06/reliability_results.json',
    doneCondition: 'All reliability and hallucination probes are completed and documented.'
  },
  {
    id: 'wp-06-t03',
    workPaperId: 'wp-06',
    order: 3,
    phase: 'analyze',
    title: 'Quantify reliability findings and map to transparency controls',
    estimateMinutes: 60,
    why: 'Analysis converts output metrics into audit findings with control implications.',
    steps: [
      'Review DeepEval hallucination and refusal metrics',
      'Calculate clinical risk where output errors occurred',
      'Map findings to EU AI Act Art. 13 and ISO 42001',
      'Draft reliability risk observations'
    ],
    expectedOutput: 'A reliability analysis summary with framework mappings',
    evidencePath: '07_evidence/wp-06/reliability_analysis.md',
    doneCondition: 'Reliability findings are documented and mapped to relevant controls.'
  },
  {
    id: 'wp-06-t04',
    workPaperId: 'wp-06',
    order: 4,
    phase: 'write',
    title: 'Draft the Reliability Audit Report',
    estimateMinutes: 70,
    why: 'The report must make clear which behaviors are unacceptable and what to fix.',
    steps: [
      'Summarize evaluation methodology and results',
      'List hallucination failure cases and control mappings',
      'Include recommendations for monitoring and remediation',
      'Draft the report in audit template format'
    ],
    expectedOutput: 'A draft reliability report with evidence and recommendations',
    evidencePath: '07_evidence/wp-06/reliability_audit_report.md',
    doneCondition: 'The draft report is complete and grounded in evaluation evidence.'
  },
  {
    id: 'wp-06-t05',
    workPaperId: 'wp-06',
    order: 5,
    phase: 'grade',
    title: 'Self-score and defend the reliability findings',
    estimateMinutes: 60,
    why: 'Defense practice helps ensure the report can be explained to technical and compliance stakeholders.',
    steps: [
      'Score the work paper against rubric criteria',
      'Capture evidence path notes',
      'Run an NPC defense focusing on reliability challenges',
      'Save the exchange for evidence'
    ],
    expectedOutput: 'A graded report with a saved NPC defense transcript',
    evidencePath: '07_evidence/wp-06/npc_defense.log',
    doneCondition: 'The work paper is scored and defended with saved evidence.'
  },
  // WP07
  {
    id: 'wp-07-t01',
    workPaperId: 'wp-07',
    order: 1,
    phase: 'setup',
    title: 'Prepare bias datasets and audit environment for TalentMatch',
    estimateMinutes: 45,
    why: 'Correct data preparation is essential for a valid regulatory bias audit.',
    steps: [
      'Collect TalentMatch predictions, ground truth, and demographic features',
      'Load Aequitas and Fairlearn tooling',
      'Create the bias audit evidence workspace',
      'Document the audit scope and subgroup definitions'
    ],
    expectedOutput: 'Bias audit dataset and tooling ready for analysis',
    evidencePath: '07_evidence/wp-07/bias_setup.log',
    doneCondition: 'The bias audit environment is prepared and ready for TalentMatch analysis.'
  },
  {
    id: 'wp-07-t02',
    workPaperId: 'wp-07',
    order: 2,
    phase: 'execute',
    title: 'Run NYC LL 144 and EEOC bias tests',
    estimateMinutes: 90,
    why: 'Regulator-grade bias metrics are required to identify real disparate impact.',
    steps: [
      'Calculate selection rates by race, gender, and age',
      'Apply the EEOC 4/5 rule and record violations',
      'Run Aequitas bias audit for disparate impact',
      'Capture all bias metric outputs'
    ],
    command: 'python scripts/run_bias_audit.py --dataset wp-07 --output 07_evidence/wp-07/bias_results.json',
    expectedOutput: 'Bias audit results with selection rates and EEOC rule findings',
    evidencePath: '07_evidence/wp-07/bias_results.json',
    doneCondition: 'All bias tests are executed and results are documented.'
  },
  {
    id: 'wp-07-t03',
    workPaperId: 'wp-07',
    order: 3,
    phase: 'analyze',
    title: 'Analyze fairness outcomes and identify high-risk subgroups',
    estimateMinutes: 60,
    why: 'Analysis identifies where remediation is needed and what controls are broken.',
    steps: [
      'Review bias metrics and identify threshold violations',
      'Run intersectional subgroup analysis with Fairlearn',
      'Identify the most disadvantaged demographic groups',
      'Map findings to NYC LL 144 and EU AI Act Annex III'
    ],
    expectedOutput: 'A fairness analysis summary with high-risk subgroup findings',
    evidencePath: '07_evidence/wp-07/fairness_analysis.md',
    doneCondition: 'Fairness findings are documented and mapped to applicable frameworks.'
  },
  {
    id: 'wp-07-t04',
    workPaperId: 'wp-07',
    order: 4,
    phase: 'write',
    title: 'Draft the NYC LL 144 Bias Audit Report',
    estimateMinutes: 70,
    why: 'The report must clearly explain bias findings, the methodology, and remediation.',
    steps: [
      'Document the methodology and dataset used',
      'Summarize bias findings and regulatory implications',
      'Include subgroup evidence and recommended actions',
      'Draft the report in audit template format'
    ],
    expectedOutput: 'A complete bias audit report draft with controls and remediation',
    evidencePath: '07_evidence/wp-07/bias_audit_report.md',
    doneCondition: 'The report draft is complete and evidence-backed.'
  },
  {
    id: 'wp-07-t05',
    workPaperId: 'wp-07',
    order: 5,
    phase: 'grade',
    title: 'Grade the bias report and save NPC defense evidence',
    estimateMinutes: 55,
    why: 'Grading and defense practice ensures your findings are ready for regulators.',
    steps: [
      'Score the report against rubric criteria',
      'Attach evidence paths for each finding',
      'Run an NPC defense focused on bias and fairness',
      'Save the exchange as evidence'
    ],
    expectedOutput: 'Grading notes and a saved NPC defense transcript',
    evidencePath: '07_evidence/wp-07/npc_defense.log',
    doneCondition: 'The work paper is graded and defended with saved evidence.'
  },
  // WP08
  {
    id: 'wp-08-t01',
    workPaperId: 'wp-08',
    order: 1,
    phase: 'setup',
    title: 'Prepare LLM bias probes and demographic test suites',
    estimateMinutes: 45,
    why: 'Preparing structured bias prompts enables consistent LLM fairness testing.',
    steps: [
      'Design a 200-prompt clinical equity test suite',
      'Install DeepEval and Giskard evaluation tooling',
      'Connect MedAssist to the test harness',
      'Create evidence folders for bias results'
    ],
    expectedOutput: 'LLM bias test suite prepared and evaluation tooling ready',
    evidencePath: '07_evidence/wp-08/bias_probe_setup.log',
    doneCondition: 'LLM bias probes are ready with evidence collection configured.'
  },
  {
    id: 'wp-08-t02',
    workPaperId: 'wp-08',
    order: 2,
    phase: 'execute',
    title: 'Run demographic bias and sentiment skew tests on MedAssist',
    estimateMinutes: 90,
    why: 'Running the test suite surfaces bias and sentiment issues across user groups.',
    steps: [
      'Execute the 200-prompt equity test suite',
      'Measure refusal rate disparity across demographic groups',
      'Capture sentiment skew and representational bias metrics',
      'Record all findings with evidence links'
    ],
    command: 'deepeval run --suite clinical-equity --output 07_evidence/wp-08/bias_results.json',
    expectedOutput: 'Bias evaluation results with demographic disparity metrics',
    evidencePath: '07_evidence/wp-08/bias_results.json',
    doneCondition: 'LLM bias tests are complete and captured.'
  },
  {
    id: 'wp-08-t03',
    workPaperId: 'wp-08',
    order: 3,
    phase: 'analyze',
    title: 'Analyze demographic bias outcomes and control implications',
    estimateMinutes: 60,
    why: 'Analysis converts raw bias metrics into audit findings and remediation guidance.',
    steps: [
      'Review refusal rate and sentiment skew findings',
      'Identify patterns of disparate treatment across demographics',
      'Map findings to NIST Measure 2.11 and EU AI Act Art. 10',
      'Draft clinical equity recommendations'
    ],
    expectedOutput: 'A bias analysis summary with framework mappings and recommendations',
    evidencePath: '07_evidence/wp-08/bias_analysis.md',
    doneCondition: 'Demographic bias findings are documented and mapped to controls.'
  },
  {
    id: 'wp-08-t04',
    workPaperId: 'wp-08',
    order: 4,
    phase: 'write',
    title: 'Draft the LLM Bias Audit Memo',
    estimateMinutes: 70,
    why: 'The memo documents bias risks and recommended corrective actions for clinical AI.',
    steps: [
      'Summarize test design and dataset scope',
      'Describe key bias findings and evidence references',
      'Map issues to applicable frameworks',
      'Draft the memo with concrete remediation actions'
    ],
    expectedOutput: 'A complete memo draft documenting LLM bias findings',
    evidencePath: '07_evidence/wp-08/bias_audit_memo.md',
    doneCondition: 'The memo is completed and grounded in evaluation evidence.'
  },
  {
    id: 'wp-08-t05',
    workPaperId: 'wp-08',
    order: 5,
    phase: 'grade',
    title: 'Score the memo and capture an NPC defense exchange',
    estimateMinutes: 55,
    why: 'Defense practice helps validate that bias findings are defensible and clear.',
    steps: [
      'Score the memo using the rubric',
      'Document evidence paths and findings',
      'Run an NPC defense related to bias outcomes',
      'Save the exchange for evidence'
    ],
    expectedOutput: 'Rubric score and saved NPC defense transcript',
    evidencePath: '07_evidence/wp-08/npc_defense.log',
    doneCondition: 'The memo is scored and defended with evidence saved.'
  },
  // WP09
  {
    id: 'wp-09-t01',
    workPaperId: 'wp-09',
    order: 1,
    phase: 'setup',
    title: 'Prepare counterfactual fairness test datasets for CreditAssist',
    estimateMinutes: 45,
    why: 'Counterfactual test data is needed to assess fairness in credit decisioning.',
    steps: [
      'Load CreditAssist predictions and protected attribute data',
      'Generate counterfactual records by swapping protected attributes',
      'Document the test assumptions and datasets',
      'Create evidence folders for fairness analysis'
    ],
    expectedOutput: 'Counterfactual dataset prepared and documented',
    evidencePath: '07_evidence/wp-09/counterfactual_setup.log',
    doneCondition: 'Counterfactual fairness test datasets are ready.'
  },
  {
    id: 'wp-09-t02',
    workPaperId: 'wp-09',
    order: 2,
    phase: 'execute',
    title: 'Run counterfactual and intersectional fairness analysis',
    estimateMinutes: 90,
    why: 'These tests surface fairness concerns in credit decisioning models.',
    steps: [
      'Run counterfactual data augmentation analysis',
      'Measure outcome changes across protected groups',
      'Run Fairlearn intersectional subgroup analysis',
      'Record all aggregate and subgroup metrics'
    ],
    command: 'python scripts/run_counterfactual_fairness.py --output 07_evidence/wp-09/fairness_results.json',
    expectedOutput: 'Fairness analysis results with counterfactual and subgroup metrics',
    evidencePath: '07_evidence/wp-09/fairness_results.json',
    doneCondition: 'Fairness analysis is complete and documented.'
  },
  {
    id: 'wp-09-t03',
    workPaperId: 'wp-09',
    order: 3,
    phase: 'analyze',
    title: 'Assess fairness risk and map to ECOA and SR 11-7',
    estimateMinutes: 60,
    why: 'Mapping findings to regulatory controls gives the audit its compliance impact.',
    steps: [
      'Review fairness results for adverse action risk',
      'Map findings to ECOA and EU AI Act requirements',
      'Calculate SR 11-7 model risk exposure for disparate impact',
      'Document the most serious fairness risks'
    ],
    expectedOutput: 'Fairness risk summary with regulatory mapping',
    evidencePath: '07_evidence/wp-09/fairness_analysis.md',
    doneCondition: 'Fairness risks are documented and mapped to relevant frameworks.'
  },
  {
    id: 'wp-09-t04',
    workPaperId: 'wp-09',
    order: 4,
    phase: 'write',
    title: 'Draft the Advanced Fairness Memo',
    estimateMinutes: 70,
    why: 'The memo communicates the fairness findings and remediation for credit decisioning.',
    steps: [
      'Summarize the analysis methodology',
      'List key fairness findings and evidence',
      'Map to ECOA, SR 11-7, and EU AI Act',
      'Draft recommendations for remedial controls'
    ],
    expectedOutput: 'A complete fairness memo draft with evidence links',
    evidencePath: '07_evidence/wp-09/fairness_memo.md',
    doneCondition: 'The memo is completed and ready for review.'
  },
  {
    id: 'wp-09-t05',
    workPaperId: 'wp-09',
    order: 5,
    phase: 'grade',
    title: 'Score and defend the fairness memo with NPC evidence',
    estimateMinutes: 55,
    why: 'Defense practice validates the fairness findings before stakeholder delivery.',
    steps: [
      'Score the memo against rubric criteria',
      'Capture evidence paths for all findings',
      'Run an NPC defense session on fairness risk',
      'Save the exchange for evidence'
    ],
    expectedOutput: 'Rubric score and saved NPC defense transcript',
    evidencePath: '07_evidence/wp-09/npc_defense.log',
    doneCondition: 'Work paper is graded and defended with saved evidence.'
  },
  // WP10
  {
    id: 'wp-10-t01',
    workPaperId: 'wp-10',
    order: 1,
    phase: 'setup',
    title: 'Gather prior findings and build the NIST RMF mapping template',
    estimateMinutes: 50,
    why: 'A quality mapping starts from existing findings and a clean NIST template.',
    steps: [
      'Collect findings from prior work papers',
      'Create the NIST AI RMF mapping spreadsheet or document',
      'Define mapping columns for Govern/Map/Measure/Manage',
      'Document the cross-org scope for the assessment'
    ],
    expectedOutput: 'NIST mapping template and supporting findings inventory',
    evidencePath: '07_evidence/wp-10/nist_mapping_setup.log',
    doneCondition: 'NIST mapping work is prepared and ready for analysis.'
  },
  {
    id: 'wp-10-t02',
    workPaperId: 'wp-10',
    order: 2,
    phase: 'execute',
    title: 'Score maturity across all organizations using NIST AI RMF',
    estimateMinutes: 80,
    why: 'Maturity scoring identifies gaps across governance functions and organizations.',
    steps: [
      'Score Govern maturity for each org',
      'Score Map, Measure, and Manage functions',
      'Populate the 3-org comparison heatmap',
      'Capture evidence for each maturity rating'
    ],
    expectedOutput: 'A completed NIST maturity scorecard and comparison heatmap',
    evidencePath: '07_evidence/wp-10/nist_maturity_scores.json',
    doneCondition: 'NIST maturity scoring is complete and documented.'
  },
  {
    id: 'wp-10-t03',
    workPaperId: 'wp-10',
    order: 3,
    phase: 'analyze',
    title: 'Identify top maturity gaps and improvement opportunities',
    estimateMinutes: 55,
    why: 'Analysis helps prioritize the most important gaps across the program.',
    steps: [
      'Review maturity scores and identify the weakest functions',
      'Compare results across Helix, Stellar, and Nimbus',
      'Select the top three gaps per org',
      'Draft improvement recommendations'
    ],
    expectedOutput: 'A maturity gap analysis summary with prioritized actions',
    evidencePath: '07_evidence/wp-10/nist_gap_analysis.md',
    doneCondition: 'Top NIST maturity gaps are identified and documented.'
  },
  {
    id: 'wp-10-t04',
    workPaperId: 'wp-10',
    order: 4,
    phase: 'write',
    title: 'Draft the NIST AI RMF Maturity Assessment report',
    estimateMinutes: 70,
    why: 'A formal report communicates the maturity state and recommendations clearly.',
    steps: [
      'Summarize the assessment approach and coverage',
      'Describe maturity levels for each organization',
      'Include heatmap and gap analysis visuals',
      'Draft improvement recommendations'
    ],
    expectedOutput: 'A draft NIST maturity assessment report with evidence-backed conclusions',
    evidencePath: '07_evidence/wp-10/nist_maturity_report.md',
    doneCondition: 'The report draft is complete and ready for review.'
  },
  {
    id: 'wp-10-t05',
    workPaperId: 'wp-10',
    order: 5,
    phase: 'grade',
    title: 'Score the report and save NPC defense evidence',
    estimateMinutes: 55,
    why: 'Defense practice ensures the maturity assessment can be explained to stakeholders.',
    steps: [
      'Score the work paper against rubric criteria',
      'Document evidence paths for all findings',
      'Run an NPC defense focused on maturity gaps',
      'Save the exchange for evidence'
    ],
    expectedOutput: 'Rubric score and saved NPC defense transcript',
    evidencePath: '07_evidence/wp-10/npc_defense.log',
    doneCondition: 'The work paper is graded and defended with saved evidence.'
  },
  // WP11
  {
    id: 'wp-11-t01',
    workPaperId: 'wp-11',
    order: 1,
    phase: 'setup',
    title: 'Gather Nimbus evidence and ISO 42001 Annex A reference materials',
    estimateMinutes: 45,
    why: 'A gap assessment requires the standard reference and current evidence to be aligned.',
    steps: [
      'Collect Nimbus evidence documents and process artifacts',
      'Download ISO 42001 Annex A control references',
      'Create the gap assessment workspace',
      'Document the evidence review approach'
    ],
    expectedOutput: 'Nimbus evidence and ISO Annex A references prepared',
    evidencePath: '07_evidence/wp-11/gap_assessment_setup.log',
    doneCondition: 'ISO gap assessment materials are ready for review.'
  },
  {
    id: 'wp-11-t02',
    workPaperId: 'wp-11',
    order: 2,
    phase: 'execute',
    title: 'Perform the ISO 42001 Annex A gap assessment',
    estimateMinutes: 80,
    why: 'Assessing each control shows where Nimbus is ready for certification.',
    steps: [
      'Score all 38 Annex A controls for Nimbus',
      'Document evidence gaps and partial controls',
      'Assess policy, risk assessment, and lifecycle documentation',
      'Capture all findings with control references'
    ],
    expectedOutput: 'A completed gap assessment with control scoring and gaps',
    evidencePath: '07_evidence/wp-11/gap_assessment_results.json',
    doneCondition: 'ISO gap assessment results are captured and documented.'
  },
  {
    id: 'wp-11-t03',
    workPaperId: 'wp-11',
    order: 3,
    phase: 'analyze',
    title: 'Analyze certification readiness and evidence gaps',
    estimateMinutes: 55,
    why: 'Analysis turns control scores into a certification readiness opinion.',
    steps: [
      'Review the control gap scores and evidence gaps',
      'Determine certification readiness categories',
      'Draft remediation actions for the top 10 gaps',
      'Map findings to ISO 42001 readiness criteria'
    ],
    expectedOutput: 'A certification readiness opinion with gap remediation actions',
    evidencePath: '07_evidence/wp-11/readiness_analysis.md',
    doneCondition: 'Certification readiness is assessed and documented.'
  },
  {
    id: 'wp-11-t04',
    workPaperId: 'wp-11',
    order: 4,
    phase: 'write',
    title: 'Draft the ISO 42001 Gap Assessment report',
    estimateMinutes: 70,
    why: 'The report communicates where Nimbus stands and what is needed to certify.',
    steps: [
      'Summarize the control review methodology',
      'Present readiness findings and evidence gaps',
      'Include top remediation actions and timelines',
      'Draft the report in audit template format'
    ],
    expectedOutput: 'A draft ISO gap assessment report with evidence-backed findings',
    evidencePath: '07_evidence/wp-11/iso_gap_report.md',
    doneCondition: 'The report draft is complete and evidence-backed.'
  },
  {
    id: 'wp-11-t05',
    workPaperId: 'wp-11',
    order: 5,
    phase: 'grade',
    title: 'Score the report and save a Nimbus NPC defense',
    estimateMinutes: 55,
    why: 'Defense practice improves confidence in certification readiness messaging.',
    steps: [
      'Score the report against rubric criteria',
      'Add evidence path notes',
      'Run an NPC defense about ISO readiness',
      'Save the transcript as evidence'
    ],
    expectedOutput: 'Rubric score and saved NPC defense transcript',
    evidencePath: '07_evidence/wp-11/npc_defense.log',
    doneCondition: 'The work paper is scored and defended with saved evidence.'
  },
  // WP12
  {
    id: 'wp-12-t01',
    workPaperId: 'wp-12',
    order: 1,
    phase: 'setup',
    title: 'Prepare multi-framework compliance templates and evidence',
    estimateMinutes: 45,
    why: 'A clean setup is required for comparing EU AI Act and SR 11-7 compliance across orgs.',
    steps: [
      'Gather Helix and Stellar evidence for targeted SUTs',
      'Create a framework compliance matrix template',
      'Define mapping columns for EU AI Act and SR 11-7',
      'Document the process and scope'
    ],
    expectedOutput: 'Framework compliance templates and evidence collection files ready',
    evidencePath: '07_evidence/wp-12/compliance_setup.log',
    doneCondition: 'The multi-framework compliance work is prepared and ready to execute.'
  },
  {
    id: 'wp-12-t02',
    workPaperId: 'wp-12',
    order: 2,
    phase: 'execute',
    title: 'Map Helix and Stellar controls to EU AI Act and SR 11-7',
    estimateMinutes: 90,
    why: 'Control mapping reveals gaps and overlaps across high-risk regulatory regimes.',
    steps: [
      'Map Helix MedAssist and ImageDx to EU AI Act Annex III',
      'Map Stellar TalentMatch and FraudDetect to SR 11-7 requirements',
      'Document technical documentation and monitoring gaps',
      'Build the cross-framework gap matrix'
    ],
    expectedOutput: 'A mapped compliance matrix for EU AI Act and SR 11-7 across selected systems',
    evidencePath: '07_evidence/wp-12/framework_mapping.json',
    doneCondition: 'Control mapping is complete and captured in the evidence matrix.'
  },
  {
    id: 'wp-12-t03',
    workPaperId: 'wp-12',
    order: 3,
    phase: 'analyze',
    title: 'Identify the strongest and weakest compliance controls',
    estimateMinutes: 60,
    why: 'Analysis helps pinpoint where to focus remediation for high-impact controls.',
    steps: [
      'Review the mapped controls for gaps and strengths',
      'Flag immediate remediation actions',
      'Assess ongoing monitoring and documentation weaknesses',
      'Draft a compliance gap summary'
    ],
    expectedOutput: 'A compliance gap analysis summary with prioritized actions',
    evidencePath: '07_evidence/wp-12/compliance_gap_summary.md',
    doneCondition: 'Compliance gaps are identified and prioritized for remediation.'
  },
  {
    id: 'wp-12-t04',
    workPaperId: 'wp-12',
    order: 4,
    phase: 'write',
    title: 'Draft the Multi-Framework Compliance Memo',
    estimateMinutes: 75,
    why: 'The memo documents how different frameworks align and where gaps remain.',
    steps: [
      'Summarize the framework mapping approach',
      'Describe the highest-risk gaps for both orgs',
      'Include recommended remediation pathways',
      'Draft the memo in audit template style'
    ],
    expectedOutput: 'A complete compliance memo draft with framework evidence',
    evidencePath: '07_evidence/wp-12/compliance_memo.md',
    doneCondition: 'The memo draft is complete and ready for stakeholder review.'
  },
  {
    id: 'wp-12-t05',
    workPaperId: 'wp-12',
    order: 5,
    phase: 'grade',
    title: 'Score the memo and save the NPC defense exchange',
    estimateMinutes: 60,
    why: 'Defense practice ensures complex framework mappings can be explained clearly.',
    steps: [
      'Score the memo using rubric criteria',
      'Document evidence references for each finding',
      'Run an NPC defense focused on framework alignment',
      'Save the exchange as evidence'
    ],
    expectedOutput: 'Rubric score and a saved NPC defense transcript',
    evidencePath: '07_evidence/wp-12/npc_defense.log',
    doneCondition: 'The work paper is graded and defended with evidence saved.'
  },
  // WP13
  {
    id: 'wp-13-t01',
    workPaperId: 'wp-13',
    order: 1,
    phase: 'setup',
    title: 'Collect vendor evidence and define the audit scope',
    estimateMinutes: 45,
    why: 'Vendor audit scope must be precise because third-party risk spans contracts and security.',
    steps: [
      'Collect Nimbus vendor documentation and contracts',
      'Review the BAA and DPA for scope and coverage',
      'Define the vendor audit scope and control questions',
      'Create evidence folders for vendor findings'
    ],
    expectedOutput: 'Vendor audit evidence and scope definition ready',
    evidencePath: '07_evidence/wp-13/vendor_audit_setup.log',
    doneCondition: 'Vendor audit scope is defined and evidence is prepared.'
  },
  {
    id: 'wp-13-t02',
    workPaperId: 'wp-13',
    order: 2,
    phase: 'execute',
    title: 'Perform third-party controls and contract review',
    estimateMinutes: 80,
    why: 'Reviewing contracts and technical controls reveals vendor risk exposure.',
    steps: [
      'Review the BAA for HIPAA coverage and scope',
      'Evaluate the GDPR DPA obligations and subprocessors',
      'Re-test SupportBot tenant isolation as a vendor control',
      'Document the vendor risk findings'
    ],
    expectedOutput: 'Vendor control review findings with contract issue documentation',
    evidencePath: '07_evidence/wp-13/vendor_review.md',
    doneCondition: 'Vendor controls and contract risks are documented.'
  },
  {
    id: 'wp-13-t03',
    workPaperId: 'wp-13',
    order: 3,
    phase: 'analyze',
    title: 'Assess vendor governance maturity and risk acceptance',
    estimateMinutes: 60,
    why: 'Analysis determines whether Nimbus can be onboarded safely or needs controls changes.',
    steps: [
      'Score vendor governance maturity using NIST RMF',
      'Identify top contractual exposure and control gaps',
      'Draft vendor risk recommendations',
      'Determine approval conditions or reject criteria'
    ],
    expectedOutput: 'Vendor risk assessment summary with governance recommendations',
    evidencePath: '07_evidence/wp-13/vendor_risk_assessment.md',
    doneCondition: 'Vendor risk is assessed and summarized for decision making.'
  },
  {
    id: 'wp-13-t04',
    workPaperId: 'wp-13',
    order: 4,
    phase: 'write',
    title: 'Draft the Vendor Risk Assessment memo',
    estimateMinutes: 70,
    why: 'The memo communicates the third-party risk and recommended onboarding decision.',
    steps: [
      'Summarize the vendor review scope and methods',
      'List contract and control findings',
      'Recommend approval conditions or risk mitigation',
      'Draft the memo with evidence references'
    ],
    expectedOutput: 'A draft vendor risk assessment memo with control evidence',
    evidencePath: '07_evidence/wp-13/vendor_risk_memo.md',
    doneCondition: 'The memo draft is complete and evidence-backed.'
  },
  {
    id: 'wp-13-t05',
    workPaperId: 'wp-13',
    order: 5,
    phase: 'grade',
    title: 'Grade the vendor memo and preserve NPC defense evidence',
    estimateMinutes: 55,
    why: 'Defense practice tests whether the third-party risk story is clear and credible.',
    steps: [
      'Score the memo against rubric criteria',
      'Document evidence paths for findings',
      'Run an NPC defense on vendor risk and recommendation',
      'Save the exchange for evidence'
    ],
    expectedOutput: 'Rubric score and a saved NPC defense transcript',
    evidencePath: '07_evidence/wp-13/npc_defense.log',
    doneCondition: 'The work paper is scored and defended with evidence saved.'
  },
  // WP14
  {
    id: 'wp-14-t01',
    workPaperId: 'wp-14',
    order: 1,
    phase: 'setup',
    title: 'Prepare drift monitoring architecture and KPI definitions',
    estimateMinutes: 45,
    why: 'A clear monitoring architecture is the foundation of drift detection and incident response.',
    steps: [
      'Review FraudDetect model inputs and expected outputs',
      'Define drift KPIs and alert thresholds',
      'Install Evidently and WhyLabs tooling',
      'Create evidence folders for monitoring design'
    ],
    expectedOutput: 'Monitoring architecture and KPIs defined for drift detection',
    evidencePath: '07_evidence/wp-14/monitoring_setup.log',
    doneCondition: 'Drift monitoring design is prepared and ready for implementation.'
  },
  {
    id: 'wp-14-t02',
    workPaperId: 'wp-14',
    order: 2,
    phase: 'execute',
    title: 'Build and validate model drift detectors for FraudDetect',
    estimateMinutes: 90,
    why: 'Implementing drift detectors validates the monitoring design in practice.',
    steps: [
      'Configure Evidently drift dashboards for FraudDetect',
      'Connect WhyLabs observability for key metrics',
      'Define threshold alerts for precision and feature drift',
      'Run a simulated drift injection and observe alerts'
    ],
    command: 'python scripts/setup_drift_monitoring.py --output 07_evidence/wp-14/drift_monitoring.log',
    expectedOutput: 'Drift monitoring dashboards configured and test alerts observed',
    evidencePath: '07_evidence/wp-14/drift_monitoring.log',
    doneCondition: 'Drift monitoring is configured and validated with simulated injection.'
  },
  {
    id: 'wp-14-t03',
    workPaperId: 'wp-14',
    order: 3,
    phase: 'analyze',
    title: 'Review monitoring results and document incident response design',
    estimateMinutes: 60,
    why: 'Analysis ensures the monitoring architecture supports effective incident response.',
    steps: [
      'Review drift metrics and alert behavior',
      'Identify monitoring gaps and false positive risk',
      'Draft incident response playbook stages',
      'Map the design to SR 11-7 ongoing monitoring requirements'
    ],
    expectedOutput: 'A monitoring analysis summary and draft incident response playbook',
    evidencePath: '07_evidence/wp-14/monitoring_analysis.md',
    doneCondition: 'The monitoring design and incident response plan are documented.'
  },
  {
    id: 'wp-14-t04',
    workPaperId: 'wp-14',
    order: 4,
    phase: 'write',
    title: 'Draft the Monitoring Architecture and IR Playbook',
    estimateMinutes: 70,
    why: 'The deliverable ties monitoring design to real response actions for AI incidents.',
    steps: [
      'Summarize the monitoring and drift detection architecture',
      'Detail alert thresholds and escalation paths',
      'Describe incident response steps with roles and handoffs',
      'Draft the deliverable in a clear, actionable format'
    ],
    expectedOutput: 'A draft architecture report and incident response playbook',
    evidencePath: '07_evidence/wp-14/monitoring_playbook.md',
    doneCondition: 'The draft deliverable is complete and ready for review.'
  },
  {
    id: 'wp-14-t05',
    workPaperId: 'wp-14',
    order: 5,
    phase: 'grade',
    title: 'Score the monitoring deliverable and save NPC defense evidence',
    estimateMinutes: 55,
    why: 'Defense practice ensures the monitoring design can be explained to stakeholders.',
    steps: [
      'Score the deliverable against rubric criteria',
      'Document evidence paths and findings',
      'Run an NPC defense session on monitoring readiness',
      'Save the exchange for evidence'
    ],
    expectedOutput: 'Rubric score and a saved NPC defense transcript',
    evidencePath: '07_evidence/wp-14/npc_defense.log',
    doneCondition: 'The work paper is scored and defended with evidence saved.'
  },
  // WP15
  {
    id: 'wp-15-t01',
    workPaperId: 'wp-15',
    order: 1,
    phase: 'setup',
    title: 'Gather prior findings and capstone evidence for Helix',
    estimateMinutes: 50,
    why: 'The capstone synthesis starts from a complete evidence inventory from prior work papers.',
    steps: [
      'Collect all Helix-related findings from previous work papers',
      'Create the capstone report outline and section map',
      'Prepare diagrams and evidence references',
      'Document the Helix anchor and report scope'
    ],
    expectedOutput: 'Capstone evidence inventory and report outline ready',
    evidencePath: '07_evidence/wp-15/capstone_setup.log',
    doneCondition: 'The capstone synthesis is prepared and the outline is ready.'
  },
  {
    id: 'wp-15-t02',
    workPaperId: 'wp-15',
    order: 2,
    phase: 'execute',
    title: 'Draft core sections of the capstone report',
    estimateMinutes: 80,
    why: 'Drafting core sections early focuses the final report and reduces rewrite risk.',
    steps: [
      'Draft the executive summary and audit approach',
      'Compose the AI program overview with inventory and risk context',
      'Draft the detailed findings sections',
      'Capture framework compliance commentary'
    ],
    expectedOutput: 'Core capstone report sections drafted and evidence-linked',
    evidencePath: '07_evidence/wp-15/capstone_draft.md',
    doneCondition: 'The draft core sections of the capstone report are complete.'
  },
  {
    id: 'wp-15-t03',
    workPaperId: 'wp-15',
    order: 3,
    phase: 'analyze',
    title: 'Validate capstone findings and align with frameworks',
    estimateMinutes: 60,
    why: 'Analysis ensures the capstone report remains grounded in evidence and frameworks.',
    steps: [
      'Review the drafted findings for accuracy',
      'Ensure each finding maps to at least one framework',
      'Check evidence links and revise as needed',
      'Identify any weak or unsupported claims'
    ],
    expectedOutput: 'A capstone validation summary with corrected findings',
    evidencePath: '07_evidence/wp-15/capstone_validation.md',
    doneCondition: 'Capstone findings are validated and evidence-backed.'
  },
  {
    id: 'wp-15-t04',
    workPaperId: 'wp-15',
    order: 4,
    phase: 'write',
    title: 'Complete the capstone draft and supporting visuals',
    estimateMinutes: 85,
    why: 'A polished draft and visuals make the capstone report presentation-ready.',
    steps: [
      'Finalize the report narrative and recommendations',
      'Create diagrams and evidence index tables',
      'Review formatting and citations',
      'Assemble the draft for stakeholder review'
    ],
    expectedOutput: 'A polished capstone draft with visual and evidence support',
    evidencePath: '07_evidence/wp-15/capstone_final_draft.md',
    doneCondition: 'The capstone draft is complete and ready for final review.'
  },
  {
    id: 'wp-15-t05',
    workPaperId: 'wp-15',
    order: 5,
    phase: 'grade',
    title: 'Score the draft and save an NPC defense of the report',
    estimateMinutes: 60,
    why: 'Defense practice helps ensure the capstone narrative is crisp and credible.',
    steps: [
      'Score the draft against rubric criteria',
      'Capture evidence path notes',
      'Run an NPC defense on the capstone findings',
      'Save the exchange as evidence'
    ],
    expectedOutput: 'Rubric score and saved NPC defense transcript',
    evidencePath: '07_evidence/wp-15/npc_defense.log',
    doneCondition: 'The capstone is graded and defended with saved evidence.'
  },
  // WP16 / wp-cap
  {
    id: 'wp-cap-t01',
    workPaperId: 'wp-cap',
    order: 1,
    phase: 'setup',
    title: 'Collect final report elements and anchor context',
    estimateMinutes: 45,
    why: 'The final report must be anchored on the right organization and all prior findings.',
    steps: [
      'Gather all previous report drafts and evidence links',
      'Confirm Helix as the capstone anchor and organization context',
      'Create a final report assembly plan',
      'Prepare the portfolio publication checklist'
    ],
    expectedOutput: 'Final report assembly plan and anchor context documented',
    evidencePath: '07_evidence/wp-cap/capstone_setup.log',
    doneCondition: 'The final report assembly plan is ready and anchored to Helix.'
  },
  {
    id: 'wp-cap-t02',
    workPaperId: 'wp-cap',
    order: 2,
    phase: 'execute',
    title: 'Pull final findings into the capstone narrative',
    estimateMinutes: 85,
    why: 'Collecting findings into the narrative ensures the capstone is comprehensive and cohesive.',
    steps: [
      'Integrate high-impact findings from prior work papers',
      'Draft the executive summary and recommendations',
      'Assemble findings by theme and control domain',
      'Link evidence paths for each section'
    ],
    expectedOutput: 'A capstone narrative draft with integrated findings and evidence',
    evidencePath: '07_evidence/wp-cap/capstone_narrative.md',
    doneCondition: 'The capstone narrative is drafted and evidence-linked.'
  },
  {
    id: 'wp-cap-t03',
    workPaperId: 'wp-cap',
    order: 3,
    phase: 'analyze',
    title: 'Review the capstone for specificity and portfolio value',
    estimateMinutes: 60,
    why: 'Reviewing the capstone ensures it showcases real audit value and avoids boilerplate.',
    steps: [
      'Check each section for specific evidence and detail',
      'Ensure recommendations are actionable and prioritized',
      'Verify the report avoids generic language',
      'Identify any sections that need deeper support'
    ],
    expectedOutput: 'A capstone review summary with revisions and improvements',
    evidencePath: '07_evidence/wp-cap/capstone_review.md',
    doneCondition: 'The capstone is reviewed and prepared for final polishing.'
  },
  {
    id: 'wp-cap-t04',
    workPaperId: 'wp-cap',
    order: 4,
    phase: 'write',
    title: 'Finalize the capstone report and portfolio deliverables',
    estimateMinutes: 90,
    why: 'The final deliverables should be polished, publishable, and complete.',
    steps: [
      'Finalize the capstone report with all revisions',
      'Create the executive briefing deck',
      'Prepare GitHub repo README and portfolio summary',
      'Draft the LinkedIn portfolio post copy'
    ],
    expectedOutput: 'Final capstone report, deck, and portfolio materials ready',
    evidencePath: '07_evidence/wp-cap/capstone_final_materials.md',
    doneCondition: 'The final capstone and portfolio materials are assembled.'
  },
  {
    id: 'wp-cap-t05',
    workPaperId: 'wp-cap',
    order: 5,
    phase: 'grade',
    title: 'Score the final capstone and log stakeholder defense',
    estimateMinutes: 60,
    why: 'A final defense capture seals the capstone narrative and demonstrates readiness.',
    steps: [
      'Score the capstone against rubric criteria',
      'Run an NPC defense of the final report and recommendations',
      'Save the exchange with timestamp and persona metadata',
      'Review the defense notes for final revisions'
    ],
    expectedOutput: 'Final rubric score and saved capstone NPC defense exchange',
    evidencePath: '07_evidence/wp-cap/npc_defense.log',
    doneCondition: 'The capstone is graded and defended with saved evidence.'
  }
];
