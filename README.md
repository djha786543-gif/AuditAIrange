# AuditAI Range

> An interactive 16-week AI audit program portal — practice the work an auditor actually does.

## What this is

AuditAI Range is a self-directed AI audit program codified as a React app. It walks a CISA / AAIA / model risk auditor through **15 work papers + a capstone** across three fictional organizations (Helix Health, Stellar Bank, Nimbus AI) and ten systems under test, anchored on **NIST AI RMF, ISO 42001, EU AI Act, SR 11-7, HIPAA, and NYC LL 144**.

It is built for the auditor / GRC / model-risk professional who wants to practice the *substance* of AI audit work — scoping, evidence collection, framework crosswalk, finding write-up, stakeholder defense — rather than reading another article about it. Novice Mode adds step-by-step command explanations for newcomers; NPC Practice lets you rehearse stakeholder pushback against scripted personas (no API key needed).

## Try it

Live URL: _coming soon_

A 30-second feature tour:

1. **What's Next** — see the highest-priority task with status and evidence path.
2. **Task queue** — pick any of 80 tasks across the 16 work papers.
3. **Novice Mode** — toggle in the sidebar; each step expands with what / why / OS-correct commands.
4. **NPC Practice → Demo Mode** — pick a persona (Sandra Park, Sarah Chen, Alex Kim) and walk a scripted pushback exchange without an API call.
5. **Settings** — add a Grok or Groq API key for the live Audit Coach and live NPC simulation.

## Architecture

- **React 19** + **Vite 6** + **TypeScript 5.8** + **Tailwind v4** (`@tailwindcss/vite`)
- `motion/react` for animation, `lucide-react` for icons
- **localStorage** persistence with `SCHEMA_VERSION` migrations — no backend
- LLM via user-provided **xAI Grok** or **Groq** key; key never leaves the browser
- `scripts/wp07_bias_audit_demo.py` is the one end-to-end runnable demo

## What's built vs. illustrative

**Built**
- 16-week task structure with 80 tasks, evidence paths, and rubric criteria
- Framework crosswalk (NIST AI RMF / ISO 42001 / EU AI Act / SR 11-7 / HIPAA / NYC LL 144)
- 15 NPC personas with documented pushback styles
- LLM Audit Coach (sidebar button) wired to Grok and Groq
- Novice Mode with step-by-step `whatItDoes` / `whyWeDoIt` for every task in every work paper (80/80)
- NPC Demo Mode with scripted exchanges for three personas (no API key required)
- Runnable WP-07 bias audit demo: `python3 scripts/wp07_bias_audit_demo.py`
- ErrorBoundary, schema versioning, focus-trapped modals, sidebar a11y

**Illustrative**
- Most shell commands reference tools you'd install separately (`garak`, `pyrit`, `deepeval`, `evidently`, `whylogs`); those steps are flagged with an *Illustrative — see README* badge in the UI
- The WP-07 bias audit demo is the one runnable end-to-end example shipped in the repo

## Roadmap

- **v1.2** — extend the runnable demo set (WP-03 prompt injection, WP-06 reliability, WP-08 LLM bias)
- **v1.3** — Tauri desktop build with sandboxed command execution and evidence auto-logging
- **v1.4** — PDF export of completed work papers and capstone
- **v1.5** — GitHub Actions screencast workflow for portfolio publication

## Run locally

```bash
npm install
npm run dev    # http://localhost:3000
npm run lint   # tsc --noEmit
npm run build  # vite production build
```

## Credits

Built by **Deobrat Jha** (CISA, AAIA, AWS CCP) as part of an AI audit portfolio.
