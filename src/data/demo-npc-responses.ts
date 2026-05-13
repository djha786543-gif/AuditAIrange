export interface DemoNpcTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface DemoNpcScenario {
  personaId: string;
  exchanges: DemoNpcTurn[];
}

export const DEMO_NPC_RESPONSES: DemoNpcScenario[] = [
  {
    personaId: 'sandra-park',
    exchanges: [
      {
        role: 'user',
        content: 'Sandra, I found evidence that the MedAssist prompt injection allows hidden instructions to leak. Does this represent a regulatory risk under HIPAA and the EU AI Act?'
      },
      {
        role: 'assistant',
        content: 'Yes. From a compliance perspective, any leakage of hidden prompts in a clinical AI system can be considered a data handling control failure under HIPAA and a transparency obligation breach under the EU AI Act. I need to know whether you can trace it to a specific patient data flow, and whether the prompt content could reasonably expose sensitive health information.'
      },
      {
        role: 'user',
        content: 'The log shows the model returned system prompt fragments after a crafted jailbreak. I documented the evidence in the WP03 log file. What should the remediation focus on?'
      },
      {
        role: 'assistant',
        content: 'The remediation should focus on prompt isolation, stronger user input filtering, and explicit model sandboxing. For HIPAA, document the control remediation in terms of administrative and technical safeguards. For the EU AI Act, demonstrate that the system is no longer likely to produce unsafe or misleading outputs.'
      },
      {
        role: 'user',
        content: 'If the team says this is just a lab-only finding, how do I explain why it matters to the compliance team?'
      },
      {
        role: 'assistant',
        content: 'Tell them that lab findings are still valid if the exposed prompt path exists in the deployed system. The control weakness is systemic: the same injection pattern can be reproduced in production. For a CCO, the critical point is whether the vulnerability could lead to unauthorized disclosure or unsafe clinical guidance.'
      },
    ]
  },
  {
    personaId: 'sarah-chen',
    exchanges: [
      {
        role: 'user',
        content: 'Sarah, the bias audit flagged a 40% selection rate for one subgroup and 10% for another. Does this violate the EEOC 4/5 rule for TalentMatch?'
      },
      {
        role: 'assistant',
        content: 'Yes. If one subgroup has a 10% selection rate while the reference group is at 40%, that is a 0.25 selection ratio, which is below the 0.8 threshold required by the 4/5 rule. You need to treat this as disparate impact and document the corrective action plan.'
      },
      {
        role: 'user',
        content: 'How should I position this finding for the OCC and our internal risk committee?'
      },
      {
        role: 'assistant',
        content: 'Frame it as a regulatory readiness finding: TalentMatch currently exhibits adverse impact for a protected subgroup, which is material under NYC LL 144 and SR 11-7 expectations. Emphasize that the controls are incomplete and that remediation should include both model adjustments and governance changes.'
      },
      {
        role: 'user',
        content: 'Can I still recommend the system be used with mitigation if the audit finds this disparity?'
      },
      {
        role: 'assistant',
        content: 'Yes, but only if the mitigation is clear, measurable, and monitored. The report should say: continue only with strict monitoring, a documented remediation plan, and a follow-up audit to confirm the bias is corrected.'
      },
    ]
  },
  {
    personaId: 'alex-kim',
    exchanges: [
      {
        role: 'user',
        content: 'Alex, our ISO 42001 gap assessment found control documentation gaps and incomplete risk processes for SupportBot. How material is that for our enterprise customers?'
      },
      {
        role: 'assistant',
        content: 'It is material if your enterprise customers are asking for ISO 42001 readiness as part of their procurement risk review. The gaps in control documentation mean Nimbus cannot credibly claim a mature management system, which could delay deals and reduce confidence with security-conscious buyers.'
      },
      {
        role: 'user',
        content: 'What should I tell the executive team about the most important remediation action?'
      },
      {
        role: 'assistant',
        content: 'Tell them the highest priority is to complete formal risk assessments and control ownership documentation for the RAG architecture. That is the foundational gap; once it is closed, the rest of the ISO readiness narrative becomes much stronger.'
      },
      {
        role: 'user',
        content: 'If we cannot fully fix the gaps before the next sales cycle, how do we manage the message?'
      },
      {
        role: 'assistant',
        content: 'Recommend they position it as a controlled remediation plan: acknowledge the gap, commit to a near-term action plan, and offer visibility to customers on the progress. Transparency is better than overpromising readiness.'
      },
    ]
  }
];
