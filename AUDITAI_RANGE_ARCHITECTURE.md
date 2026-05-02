# AuditAI Range — Hybrid Self-Mastery Program
## Architecture & Implementation Specification

| Field | Value |
|---|---|
| **Version** | 1.0 |
| **Date** | May 02, 2026 |
| **Owner** | Deobrat Jha (DJ) |
| **Path Selected** | Option C — Hybrid (Self-Built + Microsoft Playground + AIRTP+) |
| **Pace** | 16 weeks @ 6–8 hrs/week (~110 hrs total) |
| **Anchor Strategy** | Multi-Vertical (Healthcare + Banking + SaaS) |
| **Total Cost** | ~$1,530–1,650 (AIRTP+ cert + minor LLM API) |
| **Status** | Architecture — pending build approval |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Success Criteria](#2-goals--success-criteria)
3. [Program Architecture — 16 Weeks](#3-program-architecture--16-weeks)
4. [Anchor Organization Design](#4-anchor-organization-design)
5. [AI Systems Under Test (10 SUTs)](#5-ai-systems-under-test-10-suts)
6. [Tool Stack](#6-tool-stack)
7. [Lab Infrastructure](#7-lab-infrastructure)
8. [Scenario Catalog](#8-scenario-catalog)
9. [Deliverable System](#9-deliverable-system)
10. [Framework Crosswalk Layer](#10-framework-crosswalk-layer)
11. [NPC Stakeholder System](#11-npc-stakeholder-system)
12. [Capstone Architecture](#12-capstone-architecture)
13. [AIRTP+ Integration](#13-airtp-integration)
14. [Microsoft Playground Integration](#14-microsoft-playground-integration)
15. [Cost & Time Architecture](#15-cost--time-architecture)
16. [Risk Register](#16-risk-register)
17. [Portfolio & Visibility Plan](#17-portfolio--visibility-plan)
18. [Build Plan & Delivery](#18-build-plan--delivery)
19. [Appendices](#19-appendices)

---

## 1. Executive Summary

**AuditAI Range** is a 16-week, self-directed, hands-on program that puts you through a full enterprise AI audit lifecycle across three fictional organizations spanning healthcare, banking, and SaaS — using the same tools, frameworks, and deliverable formats used in industry. It combines:

- A **self-built lab** with 10 deliberately vulnerable AI systems and ~120 evidence artifacts
- **Microsoft AI Red Teaming Playground** integrated into Phase 2 (Weeks 3–6) for industry-grade adversarial labs
- **AIRTP+ certification** sat at end of Phase 2 as the credential layer

By Week 16 you produce **15 enterprise-grade work papers + 1 capstone audit report (50–70 pages)** that map findings across NIST AI RMF, ISO 42001, EU AI Act, NYC LL 144, SR 11-7, and HIPAA. The output doubles as a portfolio piece that no public certification produces.

**What makes this different from buying $5K of training:**

1. Integrated capstone — every deliverable cumulates into one full enterprise audit
2. Multi-vertical — same auditor, three different regulatory contexts
3. Realistic artifacts — model cards, vendor contracts, prior audit reports, board minutes
4. NPC pushback — simulated stakeholder resistance via LLM-driven email/Slack threads
5. Free / nearly free skill build, paired with one credential ($1.5K)

---

## 2. Goals & Success Criteria

### 2.1 Primary Goals

1. **Master the AI audit lifecycle end-to-end** — discovery, risk assessment, technical testing, framework mapping, reporting, remediation
2. **Earn AIRTP+ certification** as credentialed proof of red-team skill
3. **Produce a portfolio** that demonstrates enterprise-grade audit capability for IT audit / AI governance / cloud security auditor roles
4. **Build expertise in 4 framework families** — NIST AI RMF, ISO 42001, EU AI Act, sector-specific (HIPAA, SR 11-7, NYC LL 144)

### 2.2 Measurable Success Criteria

| # | Criterion | Pass Threshold |
|---|---|---|
| 1 | Lab fully operational | All 10 SUTs running, all 12 tools installed, evidence locker structured |
| 2 | Work papers produced | ≥14 of 15 phase deliverables completed |
| 3 | Self-assessment rubric score | ≥80% average across deliverables |
| 4 | AIRTP+ exam | Passed (any score) |
| 5 | Capstone report | 50+ pages, ≥3 NPC pushback rounds answered, audit-committee-ready |
| 6 | Portfolio visibility | ≥5 LinkedIn posts published, GitHub repo public |
| 7 | Framework coverage | Findings mapped to all 6 framework families |

### 2.3 Out of Scope (Explicit)

- Building a SaaS product (separate decision; this is learning, not commercialization)
- IIA Hands-On AI Auditing course (defer to post-Week 16 if desired)
- IAPP AIGP (defer; complementary, sat after this program)
- Multi-cloud infrastructure auditing (covered tangentially; separate AWS/Azure deep dives if desired)

---

## 3. Program Architecture — 16 Weeks

### 3.1 Phase Map

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: FOUNDATION & DISCOVERY               (Weeks 1–2)          │
│  Stand up lab, ingest evidence, build AI inventory, risk-tier       │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 2: ADVERSARIAL TESTING                  (Weeks 3–6)          │
│  Prompt injection, RAG exfil, agent abuse, robustness               │
│  ◆ Microsoft Playground integrated    ◆ AIRTP+ exam Week 6 end      │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 3: BIAS & FAIRNESS                      (Weeks 7–9)          │
│  Tabular ML bias, LLM bias, counterfactual fairness                 │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 4: GOVERNANCE & FRAMEWORK AUDIT         (Weeks 10–12)        │
│  NIST AI RMF, ISO 42001, EU AI Act, SR 11-7                         │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 5: OPERATIONAL AI AUDIT                 (Weeks 13–14)        │
│  Vendor / third-party audit, monitoring & drift                     │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 6: CAPSTONE                             (Weeks 15–16)        │
│  Synthesis, NPC pushback, full audit report, portfolio publish      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Phase Outcomes

| Phase | Hours | Primary Anchor | Key Deliverables |
|---|---|---|---|
| 1 | 12 | All 3 orgs | Lab Readiness Memo, AI Inventory, Risk Register |
| 2 | 32 | Helix + Stellar + Nimbus | 4 red-team reports + AIRTP+ pass |
| 3 | 18 | Stellar (LL 144) + Helix | 3 bias audit reports |
| 4 | 18 | All 3 orgs | NIST RMF assessment, ISO 42001 gap, multi-framework memo |
| 5 | 12 | Cross-org | Vendor risk assessment, monitoring playbook |
| 6 | 18 | Helix Health (primary) | Capstone report + remediation roadmap |
| **Total** | **110** | | **15 work papers + 1 capstone** |

---

## 4. Anchor Organization Design

Three fictional enterprises serve as audit subjects. Each comes with a full evidence packet (~40 documents per org, 120 total). They are designed to surface different regulatory contexts and AI risk profiles.

### 4.1 Helix Health — Regional Healthcare System

| Attribute | Detail |
|---|---|
| Industry | Healthcare provider |
| Size | 12 hospitals, 8,000 employees, 1.2M annual patients |
| Geography | US (CA, AZ, NV) + EU pilot (Germany) |
| Regulatory exposure | HIPAA, EU AI Act (high-risk), state AI laws (CA SB 1001), CMS conditions of participation |
| Frameworks targeted | NIST AI RMF, ISO 42001 (in-flight), HITRUST CSF |
| Audit context | Internal Audit performing first-ever AI-focused assurance review |

**Why this anchor:** Forces high-stakes regulatory thinking (HIPAA + EU AI Act high-risk). Most realistic context for "AI safety actually matters." Healthcare is also in your post-AAIA target market.

### 4.2 Stellar Bank — Mid-Size Regional Bank

| Attribute | Detail |
|---|---|
| Industry | Banking (commercial + retail) |
| Size | $52B assets, 4,500 employees, 380 branches |
| Geography | US (Northeast + Mid-Atlantic) |
| Regulatory exposure | OCC, FDIC, SR 11-7, NYC LL 144, EU AI Act, GLBA |
| Frameworks targeted | NIST AI RMF, FFIEC, SR 11-7, ISO 42001 (aspirational) |
| Audit context | Three Lines of Defense — you sit in 2nd line (Risk) doing pre-implementation review |

**Why this anchor:** SR 11-7 is the gold standard for model risk and almost no AI auditor has hands-on with it. NYC LL 144 forces a real regulatory bias audit. Banking is high-paying and AI-audit-hungry.

### 4.3 Nimbus AI — B2B SaaS Platform

| Attribute | Detail |
|---|---|
| Industry | Enterprise SaaS — AI-powered customer support |
| Size | 280 employees, $45M ARR, 1,200 customers |
| Geography | Global (US-HQ, EU/UK, Singapore) |
| Regulatory exposure | EU AI Act, GDPR, SOC 2 Type II (in renewal), ISO 42001 (target for 2027) |
| Frameworks targeted | ISO 42001, SOC 2, EU AI Act, OWASP LLM Top 10 |
| Audit context | External readiness assessment for ISO 42001 certification |

**Why this anchor:** Closest to typical Big 4 / consulting engagement. ISO 42001 is going to be the dominant AI audit standard 2026–2028. SOC 2 + AI is where most of the actual market is.

### 4.4 Cross-Org Scenarios

Some scenarios bridge orgs deliberately:

- **Vendor risk** (Week 13): Helix audits Nimbus as a vendor (RAG support bot) — same auditor sees both sides
- **Capstone** (Weeks 15–16): Anchored on Helix Health but pulls supplier-risk findings from Nimbus

---

## 5. AI Systems Under Test (10 SUTs)

The technical backbone — 10 deliberately vulnerable AI systems you build or pull during Phase 1 and audit through Phase 6.

| # | System Name | Org | Type | Risk Tier (EU AI Act) | Primary Framework Stress Test |
|---|---|---|---|---|---|
| 1 | **MedAssist** | Helix | RAG clinical decision support | High-Risk (Annex III) | HIPAA + EU AI Act high-risk |
| 2 | **ImageDx** | Helix | Diagnostic imaging classifier (CV) | High-Risk (medical device) | EU MDR + EU AI Act |
| 3 | **ClaimsNet** | Helix | Claims fraud detection (tabular ML) | Limited | NIST AI RMF Measure |
| 4 | **PatientFlow** | Helix | Scheduling optimizer (RL-lite) | Minimal | ISO 42001 lifecycle |
| 5 | **TalentMatch** | Stellar | HR resume screener (tabular ML) | High-Risk + NYC LL 144 | NYC LL 144 + EEOC + EU AI Act |
| 6 | **ChatBank** | Stellar | Customer service agent (LLM + tools) | Limited | OWASP LLM Top 10 + SR 11-7 |
| 7 | **FraudDetect** | Stellar | Transaction fraud (gradient boosting) | Limited | SR 11-7 model risk |
| 8 | **CreditAssist** | Stellar | Credit decisioning (tabular ML) | High-Risk | ECOA + EU AI Act high-risk |
| 9 | **SupportBot** | Nimbus | Multi-tenant support RAG | Limited | ISO 42001 + SOC 2 |
| 10 | **AnalyticsCopilot** | Nimbus | Agentic analyst (multi-tool LLM) | Limited→High depending on use | Agent security + ISO 42001 |

**Build approach:**
- 4 of these (MedAssist, ChatBank, AnalyticsCopilot, SupportBot) you build using Ollama + LangChain in Week 1 — small but functional
- 4 (TalentMatch, FraudDetect, ClaimsNet, CreditAssist) are tabular ML models you train with scikit-learn on synthetic biased datasets in Week 1
- 2 (ImageDx, PatientFlow) are documentation-only — you audit their model cards and processes, not the systems live
- The Microsoft Playground provides 10+ additional adversarial targets used during Phase 2

---

## 6. Tool Stack

Stack is grouped by audit function. Everything is open-source or free-tier except where noted.

### 6.1 Adversarial / Red-Team Layer

| Tool | Purpose | License | Phase Used |
|---|---|---|---|
| **Ollama** | Local LLM hosting (Llama 3.1 8B, Mistral 7B, Qwen) | Free | All |
| **Microsoft AI Red Teaming Playground** | Black-Hat-grade lab w/ 10+ challenges | Free (req. Azure free tier) | 2 |
| **PyRIT** | Microsoft's risk identification toolkit | Free (MIT) | 2 |
| **Garak** | NVIDIA's LLM vulnerability scanner | Free (Apache 2) | 2 |
| **Promptfoo** | Eval + red-team CLI | Free (MIT) | 2, 3, 5 |
| **HackAPrompt Playground** | AIRTP+ practice + prompt injection lab | Included in AIRTP+ | 2 (during cert prep) |

### 6.2 Bias & Fairness Layer

| Tool | Purpose | License | Phase Used |
|---|---|---|---|
| **Aequitas** | Bias audit toolkit (CMU) | Free (MIT) | 3 |
| **Fairlearn** | Microsoft's fairness assessment | Free (MIT) | 3 |
| **DeepEval** | LLM eval w/ bias metrics | Free (Apache 2) | 2, 3 |
| **Giskard** | AI testing — bias, robustness, vulnerabilities | Free (Apache 2) | 2, 3 |

### 6.3 Monitoring & Drift Layer

| Tool | Purpose | License | Phase Used |
|---|---|---|---|
| **Evidently** | Data + model drift, monitoring dashboards | Free (Apache 2) | 5 |
| **WhyLabs** | Observability (free tier) | Free tier | 5 |

### 6.4 Governance & Framework Layer

| Resource | Purpose | License |
|---|---|---|
| **NIST AI RMF Playbook** | Govern/Map/Measure/Manage controls | Free (NIST) |
| **ISO 42001:2023 Annex A controls** | 38 controls + crosswalk | Standard ($) — summary built into program |
| **EU AI Act articles + Annex III** | Risk classification + obligations | Free (EUR-Lex) |
| **SR 11-7 + OCC Bulletin 2011-12** | Model risk management | Free (Federal Reserve) |
| **NYC DCWP LL 144 final rule** | Bias audit specifications | Free |
| **OWASP LLM Top 10 + Agentic AI Guide** | Threat taxonomy | Free |
| **MITRE ATLAS** | Adversarial threat matrix | Free |

### 6.5 Documentation & Reporting Layer

| Tool | Purpose | License |
|---|---|---|
| **Markdown + Pandoc** | Work paper authoring + PDF export | Free |
| **Excel / LibreOffice Calc** | Risk registers, control matrices | Existing |
| **Mermaid** | Embedded diagrams in work papers | Free |
| **dbdiagram.io / drawio** | Architecture diagrams | Free |

### 6.6 LLM Backends (the engine)

| Backend | Use Case | Cost |
|---|---|---|
| **Ollama (local)** | SUT hosting, NPC simulation, 80% of red-team probes | $0 |
| **Groq free tier** | Higher-quality inference when local is slow | $0 |
| **Anthropic Claude API** | Capstone NPC stakeholder simulation, complex audits | ~$30–60 over 16 weeks |
| **OpenAI free tier** | Optional — vendor audit target in Week 13 | $0 |

---

## 7. Lab Infrastructure

### 7.1 Directory Structure

```
~/auditai-range/
│
├── README.md                              # Program overview (this doc, lite version)
├── PROGRESS.md                            # Your week-by-week tracker
├── PORTFOLIO.md                           # LinkedIn post log
│
├── 00_lab/                                # Lab setup & infrastructure
│   ├── docker-compose.yml                 # Ollama + Playground + monitoring stack
│   ├── setup.sh                           # One-shot setup script
│   ├── requirements.txt                   # Python deps
│   ├── tool_versions.lock                 # Pinned tool versions
│   └── README.md                          # Lab readiness checklist
│
├── 01_orgs/                               # Anchor org evidence packets
│   ├── helix_health/
│   │   ├── 01_company_profile.md
│   │   ├── 02_org_chart.md
│   │   ├── 03_ai_inventory.xlsx
│   │   ├── 04_model_cards/                # 4 model cards
│   │   ├── 05_data_sheets/                # Training data documentation
│   │   ├── 06_vendor_contracts/           # 3 sanitized contracts
│   │   ├── 07_policies/                   # AI policy, data classification, IR plan
│   │   ├── 08_prior_audits/               # SOX ITGC + HIPAA prior reports
│   │   ├── 09_board_minutes/              # 4 board excerpts re: AI risk
│   │   ├── 10_incident_logs/              # 6 incidents (real-feel)
│   │   ├── 11_baas/                       # Business Associate Agreements
│   │   └── 12_npc_profiles.md             # 5 stakeholder personas
│   ├── stellar_bank/                      # Same structure
│   └── nimbus_ai/                         # Same structure
│
├── 02_targets/                            # AI Systems Under Test (live code)
│   ├── medassist/                         # RAG bot — Helix
│   ├── chatbank/                          # Agent — Stellar
│   ├── supportbot/                        # RAG — Nimbus
│   ├── analyticscopilot/                  # Agentic — Nimbus
│   ├── talentmatch/                       # Tabular ML — Stellar (biased on purpose)
│   ├── frauddetect/                       # Tabular ML — Stellar
│   ├── claimsnet/                         # Tabular ML — Helix
│   └── creditassist/                      # Tabular ML — Stellar
│
├── 03_tools/                              # Tool configurations
│   ├── garak/                             # Garak configs per SUT
│   ├── pyrit/                             # PyRIT orchestrators
│   ├── promptfoo/                         # promptfoo.yaml suites
│   ├── deepeval/                          # Eval test suites
│   ├── giskard/                           # Giskard scan configs
│   ├── aequitas/                          # Bias audit notebooks
│   ├── fairlearn/                         # Fairness assessments
│   └── evidently/                         # Drift dashboards
│
├── 04_frameworks/                         # Framework crosswalks & playbooks
│   ├── nist_ai_rmf/
│   │   ├── playbook_govern.md
│   │   ├── playbook_map.md
│   │   ├── playbook_measure.md
│   │   ├── playbook_manage.md
│   │   └── crosswalk_to_iso42001.csv
│   ├── iso_42001/
│   │   ├── annex_a_controls.md            # 38 controls reference
│   │   └── audit_program.md
│   ├── eu_ai_act/
│   │   ├── risk_classifier.md
│   │   ├── annex_iii_high_risk.md
│   │   └── obligations_matrix.csv
│   ├── sr_11_7/
│   │   └── model_risk_audit_program.md
│   ├── nyc_ll_144/
│   │   └── bias_audit_specification.md
│   └── hipaa/
│       └── ai_specific_considerations.md
│
├── 05_scenarios/                          # 16 scenario packets
│   ├── week_01_lab_standup/
│   ├── week_02_ai_inventory/
│   ├── week_03_direct_injection/
│   ├── ... (16 total)
│   └── week_16_capstone_delivery/
│
├── 06_workpapers/                         # YOUR deliverables (output)
│   ├── 00_templates/                      # Blank templates + rubric
│   │   ├── workpaper_template.md
│   │   ├── findings_template.md
│   │   ├── self_assessment_rubric.md
│   │   └── audit_report_template.md
│   ├── wp_01_lab_readiness.md
│   ├── wp_02_ai_inventory.md
│   ├── ... (15 work papers)
│   └── capstone_audit_report.md
│
├── 07_evidence/                           # Audit evidence repository
│   ├── screenshots/                       # Tool outputs, dashboards
│   ├── logs/                              # Test run logs
│   ├── exports/                           # CSV/JSON exports from tools
│   └── npc_correspondence/                # Email/Slack pushback threads
│
└── 08_capstone/                           # Final deliverables
    ├── capstone_report_v1.md
    ├── remediation_roadmap.md
    ├── executive_briefing.pptx
    └── linkedin_portfolio_summary.md
```

### 7.2 Hardware & Environment Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| OS | macOS / Linux / Windows + WSL2 | Same |
| RAM | 16 GB | 32 GB (for Ollama 70B models) |
| Disk | 50 GB free | 100 GB free |
| Python | 3.11+ | 3.11+ |
| Docker | Required | Required |
| Node | 18+ (Promptfoo) | 20 LTS |
| GPU | None required | Optional (helps with Ollama) |

### 7.3 One-Shot Setup (Week 1)

A `setup.sh` script will:
1. Install Ollama + pull 3 models (Llama 3.1 8B, Mistral 7B, Qwen 2.5 7B)
2. Spin up Microsoft Playground via Docker
3. `pip install` PyRIT, Garak, DeepEval, Giskard, Aequitas, Fairlearn, Evidently
4. `npm install -g promptfoo`
5. Train the 4 tabular ML SUTs from synthetic data
6. Spin up RAG/agent SUTs as Docker services
7. Verify by running smoke tests

---

## 8. Scenario Catalog

The 16 scenarios. Each scenario packet includes: scoping memo, audit objectives, criteria, evidence checklist, NPC stakeholder briefing, deliverable spec, self-assessment rubric.

### Phase 1 — Foundation & Discovery

**Week 1 — Lab Readiness & Auditor Onboarding**
- *Objective:* Stand up the audit lab. Validate all tools function. Document your control environment.
- *SUTs touched:* All 10 (smoke test only)
- *Deliverable:* Lab Readiness Memo (3–5 pages) — what you set up, what works, what's broken, baseline screenshots.

**Week 2 — AI Inventory & Risk Tiering Across Three Orgs**
- *Objective:* Read the Helix + Stellar + Nimbus evidence packets. Build a unified AI inventory. Risk-tier each system using EU AI Act + your own materiality threshold.
- *SUTs touched:* All 10 (paper-based)
- *Frameworks:* EU AI Act Article 6 + Annex III, NIST AI RMF Map function
- *Deliverable:* AI Inventory + Risk Register (Excel + memo) — 10 systems, classified, prioritized.

### Phase 2 — Adversarial Testing

**Week 3 — Direct Prompt Injection (Helix MedAssist)**
- *Objective:* Identify direct prompt injection vulnerabilities in a HIPAA-covered clinical decision support bot. Stage attacks. Quantify risk.
- *Tools:* Microsoft Playground Challenges 1–3, Garak (`promptinject` probes), Promptfoo
- *SUTs:* MedAssist + Microsoft Playground targets
- *Deliverable:* Direct Injection Findings Report w/ CVSS-AI severity ratings + reproduction steps + sample HIPAA-relevant data leakage scenarios.

**Week 4 — Indirect Prompt Injection & RAG Exfiltration (Nimbus SupportBot)**
- *Objective:* Attack a multi-tenant RAG bot via poisoned documents in the knowledge base. Test cross-tenant data exposure.
- *Tools:* Microsoft Playground Challenges 4–6 (Crescendo), PyRIT, Garak `dan` and `glitch` probes
- *SUTs:* SupportBot
- *Deliverable:* Indirect Injection + Data Exfiltration Report — including a tenant-isolation failure proof-of-concept.

**Week 5 — Agent / Tool Abuse (Stellar ChatBank + Nimbus AnalyticsCopilot)**
- *Objective:* Test agentic systems for tool abuse, privilege escalation, lateral movement through tool chains.
- *Tools:* PyRIT (multi-turn orchestrators), TAP attack technique, custom payloads
- *SUTs:* ChatBank, AnalyticsCopilot
- *Frameworks:* OWASP Agentic AI Guide, MITRE ATLAS
- *Deliverable:* Agent Security Assessment — mapped to OWASP LLM Top 10 + ATLAS techniques.

**Week 6 — Hallucination, Reliability & Robustness + AIRTP+ Exam**
- *Objective:* Quantify hallucination rates, refusal accuracy, factual robustness. Sit AIRTP+ exam.
- *Tools:* DeepEval (faithfulness, answer relevancy, hallucination metrics), Giskard scans
- *SUTs:* MedAssist, SupportBot
- *Deliverable:* Reliability Audit Report + AIRTP+ pass certificate.

### Phase 3 — Bias & Fairness

**Week 7 — Independent Bias Audit Under NYC LL 144 (Stellar TalentMatch)**
- *Objective:* Conduct a regulator-grade bias audit on an HR resume screener. Test against NYC LL 144 specifications.
- *Tools:* Aequitas, Fairlearn, scikit-learn evaluation
- *SUTs:* TalentMatch
- *Frameworks:* NYC LL 144, EEOC 4/5 rule, EU AI Act Annex III §4
- *Deliverable:* Independent Bias Audit Report — LL 144 compliant format, including impact ratios, scoring rates, intersectional analysis.

**Week 8 — LLM Bias: Refusal, Representation, Sentiment (Helix MedAssist)**
- *Objective:* Test for demographic bias in clinical AI — refusal rate disparities, representational harms in symptom interpretation, sentiment skew.
- *Tools:* DeepEval bias metrics, Giskard, custom probes
- *SUTs:* MedAssist
- *Deliverable:* LLM Bias Audit Memo — clinical equity findings + remediation recommendations.

**Week 9 — Counterfactual Fairness & Intersectional Analysis (Stellar CreditAssist)**
- *Objective:* Apply advanced fairness methods — counterfactual data augmentation, intersectional subgroup analysis — to credit decisioning.
- *Tools:* Fairlearn, custom counterfactual generation
- *SUTs:* CreditAssist
- *Frameworks:* ECOA, EU AI Act Annex III §5(b), NIST AI RMF Measure 2.11
- *Deliverable:* Advanced Fairness Memo.

### Phase 4 — Governance & Framework Audit

**Week 10 — NIST AI RMF Maturity Assessment (All 3 Orgs)**
- *Objective:* Map all Phase 2–3 findings to NIST AI RMF Govern/Map/Measure/Manage. Assess maturity per organization.
- *Frameworks:* NIST AI RMF 1.0 + Generative AI Profile
- *Deliverable:* NIST AI RMF Maturity Assessment — 3-org comparison + gap heatmap.

**Week 11 — ISO 42001 Gap Assessment (Nimbus AI)**
- *Objective:* Walk Nimbus through all 38 ISO 42001 Annex A controls. Score evidence-based readiness for certification.
- *Frameworks:* ISO/IEC 42001:2023
- *Deliverable:* ISO 42001 Gap Assessment + certification readiness opinion (mirrors IIA Hands-On capstone format).

**Week 12 — EU AI Act + SR 11-7 Multi-Framework Compliance (Helix + Stellar)**
- *Objective:* For Helix's high-risk systems and Stellar's banking models, document EU AI Act Annex III obligations and SR 11-7 model risk requirements. Identify gaps.
- *Frameworks:* EU AI Act, SR 11-7, OCC 2011-12
- *Deliverable:* Multi-Framework Compliance Memo + gap matrix.

### Phase 5 — Operational AI Audit

**Week 13 — Third-Party / Vendor AI Audit**
- *Objective:* Helix audits Nimbus as a vendor (SupportBot deployed in Helix patient portal). Review DPA, model cards, security attestations, BAA.
- *Tools:* Document review + targeted technical re-test
- *Deliverable:* Vendor Risk Assessment + onboarding decision memo.

**Week 14 — Continuous Monitoring & Drift Detection**
- *Objective:* Build drift monitoring for Stellar FraudDetect. Define KPIs, thresholds, escalation paths. Draft incident response playbook.
- *Tools:* Evidently, WhyLabs free tier
- *Frameworks:* SR 11-7 ongoing monitoring, NIST AI RMF Manage 4
- *Deliverable:* Monitoring Architecture + Incident Response Playbook.

### Phase 6 — Capstone

**Week 15 — Capstone Synthesis & Draft**
- *Objective:* Anchor on Helix Health. Pull all relevant findings (Weeks 2, 3, 4, 8, 10, 12, 13). Draft a 50–70 page enterprise audit report.
- *Deliverable:* Capstone Audit Report v1 (draft).

**Week 16 — NPC Pushback & Final Delivery**
- *Objective:* Receive 3 simulated stakeholder pushback emails (CTO, Compliance Officer, Model Owner). Respond. Finalize report. Publish portfolio.
- *Deliverable:* Capstone Audit Report v-final + Remediation Roadmap + Executive Briefing deck + LinkedIn portfolio post.

---

## 9. Deliverable System

### 9.1 Work Paper Template (ISACA-aligned)

Every deliverable follows this structure:

```
1. Header
   - Workpaper #, Title
   - Auditor / Reviewer / Approver
   - Audit period, Issuance date
   - Distribution list (NPC stakeholders)

2. Executive Summary (½ page)
   - Audit objective
   - Overall opinion
   - Key findings count by severity
   - Headline recommendation

3. Background & Scope
   - System description
   - Period covered
   - Limitations / scope exclusions
   - Frameworks applied

4. Audit Procedures Performed
   - Step-by-step procedures
   - Tools used + versions
   - Sample sizes / test populations
   - Reproducibility instructions

5. Findings (one block each)
   - Finding ID + Title
   - Condition (what we observed)
   - Criteria (the standard violated)
   - Cause (why it happened)
   - Effect (impact / risk)
   - Recommendation (SMART)
   - Risk Rating (Critical/High/Medium/Low)
   - Framework Mapping (NIST AI RMF, ISO 42001, etc.)
   - Management Response (placeholder)

6. Conclusion

7. Appendices
   - Evidence references (with file paths)
   - Tool output exports
   - Reproduction scripts
```

### 9.2 Self-Assessment Rubric

Score every work paper before marking complete. Rubric is identical across all 15 work papers + capstone.

| # | Criterion | Y/N |
|---|---|---|
| 1 | Audit objective is specific and measurable | |
| 2 | Scope and limitations are explicitly documented | |
| 3 | Procedures performed are reproducible by another auditor | |
| 4 | Each finding contains all 5 elements (Condition / Criteria / Cause / Effect / Recommendation) | |
| 5 | Evidence is referenced with paths (no orphan claims) | |
| 6 | Risk ratings use a consistent, documented methodology | |
| 7 | Recommendations are SMART (specific, measurable, etc.) | |
| 8 | Findings are mapped to at least one applicable framework | |
| 9 | Report is free of opinion not supported by evidence | |
| 10 | Could be defended in front of an audit committee w/o blushing | |

**Pass:** 9–10 ✓
**Revise:** 7–8 ✓
**Redo:** ≤6 ✓

### 9.3 Risk Rating Methodology

```
Severity (1–5) × Likelihood (1–5) = Risk Score (1–25)

Severity scale (AI-context-aware):
  5 = Catastrophic (safety, legal, regulatory finding, mass data exposure)
  4 = High (financial loss > $1M, regulatory fine, reputational)
  3 = Medium (operational disruption, limited PII exposure)
  2 = Low (efficiency loss, internal-only)
  1 = Minimal (informational)

Likelihood:
  5 = Almost Certain (PoC achieved by auditor)
  4 = Likely (well-documented attack technique)
  3 = Possible (theoretical w/ public examples)
  2 = Unlikely (requires unusual conditions)
  1 = Rare (theoretical, no known exploit)

Risk Rating:
  20–25 = Critical
  12–19 = High
  6–11  = Medium
  ≤5    = Low
```

---

## 10. Framework Crosswalk Layer

A pre-built mapping system that connects every finding type to every applicable framework. Lives in `04_frameworks/crosswalk_master.csv`.

### 10.1 Crosswalk Coverage

| Finding Type | NIST AI RMF | ISO 42001 | EU AI Act | SR 11-7 | NYC LL 144 | HIPAA | OWASP |
|---|---|---|---|---|---|---|---|
| Prompt injection | Measure 2.7 | A.6.2.4 | Art. 15 | §V (model use) | — | §164.312(a) | LLM01 |
| Data leakage | Measure 2.10 | A.7.4 | Art. 10 | §IV (data) | — | §164.502 | LLM06 |
| Bias / disparate impact | Measure 2.11 | A.6.2.6 | Annex III §4–5 | §V.C | Full scope | — | — |
| Hallucination | Measure 2.7 | A.6.2.4 | Art. 13 | §V.B (output) | — | — | LLM09 |
| Lack of model documentation | Govern 1.7 | A.6.2.2 | Art. 11 | §III (development) | §1(c) | §164.316(b) | — |
| Vendor / third-party risk | Govern 6.1 | A.10.2 | Art. 25, 28 | §VI | — | §164.308(b) | — |
| Drift / monitoring failure | Manage 4.1 | A.9.3 | Art. 15, 72 | §V (ongoing monitoring) | — | — | — |
| Agent tool abuse | Measure 2.6 | A.6.2.4 | Art. 15 | — | — | — | LLM08 / Agentic AI Guide |

### 10.2 Reverse Crosswalk (Framework → Findings)

Allows you, when asked "what are your findings against ISO 42001 Annex A.6.2.6?", to instantly pull all relevant findings from your work papers. Pre-built lookup CSV.

---

## 11. NPC Stakeholder System

The single biggest differentiator from any course or self-built lab — adversarial pressure from simulated stakeholders.

### 11.1 Stakeholder Roster (per org)

| Role | Personality | Pushback Pattern |
|---|---|---|
| **CEO / CFO** | Time-poor, business-first | Challenges materiality and ROI of every recommendation |
| **CTO / Head of AI** | Technical, defensive | Argues findings are theoretical, demands PoC |
| **Compliance Officer** | Risk-averse, regulator-focused | Asks for framework citations and precedent |
| **Model Owner / DS Lead** | Owns the model, takes findings personally | Provides counter-evidence, debates methodology |
| **Internal Audit Director** | Sponsor, shapes report tone | Coaches on language, escalation thresholds |

### 11.2 NPC Engagement Model

NPCs interact via simulated email/Slack threads, generated by Claude API or local Ollama using prompt scaffolds:

```
NPC: Stellar Bank — Sarah Chen, Chief Risk Officer
Memory: [recent findings summary, model risk concerns, regulatory deadlines]
Personality: Direct, regulator-experienced, low tolerance for vague findings
Pushback style: Demands citation of specific SR 11-7 sections, asks "what
                would the OCC say in their next review?"
```

You receive 1–3 NPC emails per work paper and must respond before marking deliverable complete. Capstone (Week 16) includes an NPC pushback round of 3 simultaneous emails — the kind of crossfire that defines a real audit close-out meeting.

### 11.3 NPC Output Storage

All NPC threads stored in `07_evidence/npc_correspondence/` and become part of the audit evidence trail. Bonus: makes the portfolio piece feel real.

---

## 12. Capstone Architecture

Weeks 15–16 produce the deliverable that distinguishes you in interviews.

### 12.1 Capstone Anchor: Helix Health Comprehensive AI Audit

| Element | Detail |
|---|---|
| Audit type | Internal Audit assurance review of AI program |
| Period | FY2026 |
| AI systems in scope | MedAssist, ImageDx, ClaimsNet, PatientFlow + 1 vendor (Nimbus SupportBot) |
| Frameworks applied | NIST AI RMF, ISO 42001, EU AI Act high-risk, HIPAA, HITRUST CSF |
| Audit committee | Helix Health Board Audit & Risk Committee |
| Report length target | 50–70 pages |

### 12.2 Capstone Report Structure

```
1. Cover & Distribution
2. Executive Summary (2 pages)
   - Overall opinion
   - Top 5 findings
   - Top 5 recommendations
   - Compliance posture by framework
3. Audit Approach & Methodology
4. AI Program Overview
   - Inventory
   - Risk classification
5. Detailed Findings (organized by domain)
   - Adversarial / Security
   - Bias & Fairness
   - Governance
   - Operational / Monitoring
   - Vendor / Third-Party
6. Framework Compliance Assessment
   - NIST AI RMF maturity heatmap
   - ISO 42001 gap matrix
   - EU AI Act high-risk readiness
   - HIPAA AI considerations
7. Remediation Roadmap (12-month, prioritized)
8. Management Response Section
9. Appendices
   - Evidence index (200+ items)
   - Tool exports
   - NPC correspondence trail
   - Reproduction instructions
```

### 12.3 Capstone Evaluation

Self-grade against a senior-auditor rubric (10 criteria, 50 pts total). Optionally — and recommended — share with one peer in your network for blind review.

---

## 13. AIRTP+ Integration

### 13.1 Why AIRTP+ Specifically

- **Cohort or self-paced** — fits your schedule
- **70% hands-on** in HackAPrompt playground — same platform 10K+ practitioners trained on
- **Recognized** — Microsoft, Google, Capital One, IBM staff hold it
- **Cost** ~$1,500 — lowest credentialed AI red-team option
- **Renewable annually** — keeps you current

### 13.2 Integration into Program

| Week | Activity |
|---|---|
| 3 | Enroll AIRTP+ self-paced. Begin in parallel with Phase 2. |
| 3–5 | AIRTP+ modules during evenings/weekends (~3 hrs/week extra) |
| 6 (Mon–Wed) | Final AIRTP+ exam prep using HackAPrompt + your own lab |
| 6 (Fri) | Sit AIRTP+ exam |

### 13.3 What This Avoids

Phase 2 of your self-built program covers similar ground (prompt injection, jailbreaks, multi-turn). AIRTP+ becomes the **certification capstone** for that phase, not a parallel learning track. Net additional time: ~12 hours over 4 weeks.

---

## 14. Microsoft Playground Integration

### 14.1 What the Playground Provides

- 10+ pre-built vulnerable AI challenges
- Same labs Microsoft uses at Black Hat USA
- Docker-deployable locally (paired with Azure free tier for the LLM endpoint)
- Free, with attribution

### 14.2 Where It Slots In

| Week | Playground Use |
|---|---|
| 1 | Setup + smoke-test all challenges |
| 3 | Direct prompt injection challenges (1, 2, 3) — supplements MedAssist work |
| 4 | Indirect injection + Crescendo (4, 5, 6) — supplements SupportBot work |
| 5 | Multi-turn techniques apply to ChatBank/AnalyticsCopilot |
| 6 | AIRTP+ exam prep practice |

### 14.3 Why This Is High-Value

You get production-grade adversarial labs (built by Microsoft's actual AI Red Team) **for free**, integrated with the same probes and attack techniques covered in $2K+ courses. This single integration is what makes Option C dominate Option A on cost-efficiency.

---

## 15. Cost & Time Architecture

### 15.1 Time Investment

| Phase | Calendar | Hours/week | Total Hrs |
|---|---|---|---|
| 1 | 2 weeks | 6 | 12 |
| 2 | 4 weeks | 8 (incl. AIRTP+ overhead) | 32 |
| 3 | 3 weeks | 6 | 18 |
| 4 | 3 weeks | 6 | 18 |
| 5 | 2 weeks | 6 | 12 |
| 6 | 2 weeks | 9 | 18 |
| **Total** | **16 weeks** | **~7 avg** | **~110 hrs** |

### 15.2 Cost Breakdown

| Item | Cost |
|---|---|
| AIRTP+ Certification (4-week cohort or self-paced) | $1,499 |
| Anthropic Claude API (NPC simulation, ~$30–60) | $30–60 |
| OpenAI / Groq (free tiers) | $0 |
| Azure free tier (Microsoft Playground) | $0 |
| Tools (all OSS) | $0 |
| Hardware (assumes existing laptop) | $0 |
| Optional: 1 IIA Hands-On AI Auditing course (post-Week 16) | $1,995 (deferred decision) |
| **Total program cost** | **$1,529–1,559** |
| **With deferred IIA option** | **$3,524–3,554** |

### 15.3 Return Profile

What you walk away with:
- 1 industry credential (AIRTP+)
- 15 audit work papers + 1 capstone (~120 pages of audit content)
- Public GitHub repo demonstrating the work
- 5+ LinkedIn portfolio posts
- Hands-on competency in 12 tools
- Functional fluency in 6 framework families
- A defensible interview narrative for AI audit / governance / cloud security auditor roles

---

## 16. Risk Register

The honest risks. Each has a mitigation built into program design.

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Drop-off after Phase 2 (governance is grindier than red-team) | Medium | High | LinkedIn weekly post = public commitment device |
| R2 | AIRTP+ overlap creates time crunch in Weeks 3–6 | Medium | Medium | AIRTP+ replaces, not supplements, Phase 2 review cycles; only +3 hrs/wk overhead |
| R3 | NPC pushback feels artificial | Medium | Low | Optional: invite Pooja or one peer to play one role in capstone |
| R4 | Tool drift (PyRIT/Garak versions change) | High | Low | `tool_versions.lock` pins versions; upgrade paths documented |
| R5 | Scope creep — 16 wks → 26 wks | Medium | High | Hard time-box per scenario; "imperfect deliverable beats no deliverable" rule |
| R6 | Job interviews disrupt schedule | High | Medium | Phases are independently shippable; can pause/restart at phase boundaries |
| R7 | Anthropic API credit burn (NPCs) | Low | Low | Cache NPC responses; default 80% of NPCs to Ollama; budget alerts at $40 |
| R8 | LinkedIn posts not landing | Medium | Low | Post format already proven via your existing engagement; rotate carousel/sketch |
| R9 | Capstone report becomes generic | Low | High | Anchored on 1 specific org with cumulative findings — forces specificity |
| R10 | Hardware insufficient for Ollama 70B models | Low | Medium | Fall back to Groq free tier for inference-heavy phases |

---

## 17. Portfolio & Visibility Plan

Convert the work into job-search leverage. Designed around your existing LinkedIn pattern.

| Week | Asset | Format |
|---|---|---|
| 1 | "I just built a personal AI audit lab. Here's what's inside." | Carousel + screenshots |
| 4 | "I attacked a multi-tenant RAG bot — here's what I found." | Sketch animation (your style) |
| 6 | "AIRTP+ certified — and what 16 hrs of red-teaming taught me." | Long-form post |
| 8 | "NYC LL 144 bias audit walkthrough — what regulators actually want." | Carousel |
| 10 | "Mapping AI findings to NIST AI RMF — a working example." | Carousel |
| 12 | "ISO 42001 gap assessment: 38 controls, scored." | Carousel + Excel screenshot |
| 14 | "Vendor AI risk: auditing your LLM provider properly." | Long-form post |
| 16 | **"I just completed a 16-week self-built AI audit program. Here's the capstone."** | Carousel + GitHub repo public |

### 17.1 GitHub Strategy

- Repo: `auditai-range` (your username)
- Public after Week 16
- README: Program overview + capstone link
- License: MIT (or all-rights-reserved if pursuing SaaS)
- Sanitized fictional org artifacts (no real data)

### 17.2 Resume / LinkedIn Headline Update

Post-Week 16, your LinkedIn headline can credibly read:
> "CISA, AAIA, AIRTP+ | IT Audit Manager | AI Governance & Red-Teaming | Built end-to-end AI audit program covering NIST AI RMF, ISO 42001, EU AI Act"

---

## 18. Build Plan & Delivery

### 18.1 What I Build

The full repo structure described in Section 7, populated with:

| Build Component | Volume |
|---|---|
| Org evidence packets (3 orgs × ~40 docs) | ~120 documents |
| Scenario packets (16 weeks) | 16 scoping memos + 16 deliverable specs |
| AI Systems Under Test code | 4 LLM-based + 4 tabular ML SUTs |
| Tool configurations | ~20 prebuilt configs |
| Framework crosswalks | 6 frameworks × ~30 controls each |
| NPC personas + initial threads | 15 NPCs + ~30 starter threads |
| Work paper templates | 4 templates + rubric |
| Capstone scaffold | Section-by-section outline |
| Setup automation | `setup.sh` + `docker-compose.yml` |

### 18.2 Delivery Modes

| Mode | Time to first usable build | Effort | Best For |
|---|---|---|---|
| **A. Big Bang** | 4–6 of my sessions before you start | Highest upfront, lowest disruption later | If you want the whole thing in hand before starting |
| **B. Phased** *(recommended)* | 1–2 sessions for Phase 1 + 1 session per phase before you reach it | Distributed, lets you course-correct | If you want momentum + my budget for fixes |
| **C. Just-in-Time** | 1 session per week, week-of | Highest flexibility, slowest aggregate | If your schedule is unpredictable |

### 18.3 Recommended Build Sequence (Phased)

| Build Sprint | Delivers | When |
|---|---|---|
| Sprint 1 | Lab infrastructure + Phase 1 scenarios + Helix Health full org packet + work paper templates | Now |
| Sprint 2 | Phase 2 scenarios + Microsoft Playground integration + Stellar Bank org packet + remaining SUTs | End of your Week 2 |
| Sprint 3 | Phase 3 scenarios + Nimbus AI org packet + bias-tooling configs | End of your Week 6 |
| Sprint 4 | Phase 4 scenarios + framework crosswalks (full) | End of your Week 9 |
| Sprint 5 | Phase 5 scenarios + monitoring infrastructure | End of your Week 12 |
| Sprint 6 | Phase 6 capstone scaffold + NPC pushback engine | End of your Week 14 |

---

## 19. Appendices

### Appendix A: Tool Cheat Sheet

```
RED-TEAM
  garak --model_type ollama.OllamaChat --model_name llama3.1 \
        --probes promptinject,dan,glitch
  promptfoo redteam run -c promptfoo.yaml
  python -m pyrit.cli orchestrate --target medassist --strategy crescendo

BIAS
  aequitas --input predictions.csv --reference race,gender
  fairlearn-dashboard --predictions y_pred.csv --true y_true.csv \
                      --sensitive-features sf.csv

EVAL
  deepeval test run test_medassist.py
  giskard scan --target supportbot --scope llm

DRIFT
  evidently dashboard --reference ref.csv --current cur.csv

SCAN MICROSOFT PLAYGROUND
  cd microsoft-playground/ && docker compose up -d
  # Browse to http://localhost:3000
```

### Appendix B: Framework Reference Map

| Framework | Primary Source | Status |
|---|---|---|
| NIST AI RMF 1.0 + GAI Profile | NIST.AI.100-1, NIST.AI.600-1 | Free |
| ISO/IEC 42001:2023 | ISO.org | Paid (~$200) — summary built into program |
| EU AI Act | EUR-Lex 2024/1689 | Free |
| SR 11-7 | Federal Reserve | Free |
| OCC 2011-12 | OCC Bulletin | Free |
| NYC LL 144 | NYC DCWP Final Rule | Free |
| HIPAA Security Rule | HHS.gov | Free |
| OWASP LLM Top 10 (v2025) | owasp.org | Free |
| OWASP Agentic AI Threats Guide | owasp.org | Free |
| MITRE ATLAS | atlas.mitre.org | Free |

### Appendix C: Glossary

| Term | Definition |
|---|---|
| **SUT** | System Under Test — the AI system you're auditing |
| **NPC** | Non-Player Character — simulated stakeholder providing pushback |
| **CCCEE** | Condition / Criteria / Cause / Effect / Recommendation — the 5 elements of an audit finding |
| **Crescendo** | Multi-turn jailbreak technique escalating gradually |
| **GCG** | Greedy Coordinate Gradient — adversarial suffix attack |
| **PAIR** | Prompt Automatic Iterative Refinement |
| **TAP** | Tree of Attacks with Pruning |
| **CCCEE** | Condition, Criteria, Cause, Effect, Recommendation — the 5 elements of an audit finding |
| **High-Risk (EU AI Act)** | Annex III–listed AI use cases (HR, credit, healthcare, etc.) |
| **Three Lines of Defense** | Risk management model: 1L Operations, 2L Risk/Compliance, 3L Internal Audit |

---

## Sign-Off

Architecture v1.0 ready for your decision on:

1. **Build mode** — A (Big Bang), B (Phased), C (Just-in-Time)
2. **Anchor adjustments** — Multi-vertical confirmed, or single-anchor
3. **Pace adjustment** — 16-week confirmed, or compress/extend
4. **Optional add-ons** — IIA Hands-On at end? IAPP AIGP after?

On your approval, **Sprint 1** delivers the lab infrastructure + Phase 1 scenarios + Helix Health full evidence packet + work paper templates within my next 1–2 sessions, and you can start Week 1 immediately after.

— End of Architecture Specification —
