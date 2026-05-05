# Changelog

## 2026-05-05 — Single-user workflow overhaul

### Part 1 · API key handling
- Removed `define: { 'process.env.GEMINI_API_KEY': ... }` from `vite.config.ts` so the key is never inlined into the GitHub Pages bundle.
- Settings has a "Gemini API Key" password input. Value persists to `localStorage['auditai-gemini-key']`.
- `NpcSimView` reads the key from localStorage on each send. When the key is missing, the input shows an amber banner with a "Settings" button that navigates directly to the Settings view.
- README updated: "Paste your Gemini key into Settings on first launch — stored locally, never transmitted anywhere except google.com/gemini."

### Part 2 · Backup & Restore
- Settings has an "Export Progress (JSON)" button that downloads `auditai-progress-YYYY-MM-DD.json` with `version: 1`, `exportedAt`, `progress`, `workpapers`, and `activity`.
- Settings has an "Import Progress" file input with version-validation, overwrite confirmation, and auto-reload after restore.
- Dashboard shows an amber "Backup your progress" banner if `auditai-last-export` is missing or older than 14 days, with a one-click export button.

### Part 3 · Dashboard stripped to essentials
- One-line header: "Week N of 16 — Phase X: title", with a 🔥 streak badge when activity > 0.
- "Next Up" card is the dominant element with three buttons: **Open scenario**, **Grade WP**, **Open NPC** (pre-loads the WP).
- Progress bar is one line, no phase markers.
- Phase map, AIRTP+ tracker, Top program risks, and Phase cards are now four independent `<details>` sections, all collapsed by default.
- Removed the Mission Mode preview from the dashboard (lives in the sidebar's Drills entry).

### Part 4 · Reference views consolidated
- New `Reference` sidebar entry replaces the four old entries (Org Hub / SUT Inventory / Framework Mapper / Tool Stack).
- Single `ReferenceView` with horizontally scrollable tabs: **Orgs / SUTs / Frameworks / Tools**.
- Sidebar order is now: Dashboard, How To Use, Drills, Reference, Work Papers, NPC Simulator, Settings.

### Part 5 · NPC Simulator wired to actual work
- "Defending which work paper?" dropdown above the org selector with all 16 WPs plus an "Open / generic" option. State persists to `auditai-selected-wp`.
- When a WP is selected, the org filter and persona auto-default from the WP's anchor, and the system prompt sent to Gemini includes WP title, anchor org, framework list, finding type (mapped per WP number), and the matching crosswalk row.
- Context pill above the chat: "Defending WPNN · framework · finding type".
- Each NPC response shows a "Save this exchange" button that appends `{timestamp, user, ai}` to `auditai-npc-log-{wpId}`.
- Work Papers rows show "N NPC exchanges saved" plus an "Open NPC for this WP" button that deep-links into the simulator with the WP pre-selected.

### Part 6 · Rubric evidence paths
- `WorkPaperRecord.criteria` migrated from `boolean[]` to `{ checked: boolean; evidence: string }[]`. Existing localStorage data is migrated on load (boolean → `{checked, evidence: ''}`).
- Each criterion now has a small evidence text input below the label (placeholder: `07_evidence/wp03/garak-run-2026-05-04.json`).
- Auto-promotion logic still counts only `checked === true`.
- Per-WP "Show evidence summary" toggle renders all 10 criteria and their evidence paths in a compact list — useful for capstone citation.

### Part 7 · Mission Mode → Drills
- Sidebar entry renamed from "Mission Mode" to **Drills**.
- Drills landing page shows a banner explaining that drills are scoped practice and **do not advance program progress**.
- Each drill detail view shows a "Linked Work Paper" callout pointing back to the corresponding WP.
- Mission Mode preview card removed from the dashboard.

### Part 8 · Mobile responsive
- Sidebar slides in/out as a drawer at `md` and below, behind a hamburger button (top-left) and a tap-to-close backdrop. Closes automatically on nav-item tap.
- Main content padding switched to `p-4 md:p-8 lg:p-10`.
- Dashboard "Next Up" card stacks vertically (icon → text → buttons) at narrow widths.
- NPC chat container uses `h-[calc(100dvh-180px)]` so it survives the mobile keyboard.
- Reference tabs are horizontally scrollable on narrow widths.
- SUT rows hide the org and risk-tier badges in the collapsed row at narrow widths; they reappear inside the expanded panel.

### Part 9 · Daily-use quality of life
- Keyboard shortcuts (only when no input is focused): `g d` Dashboard · `g w` Work Papers · `g n` NPC Simulator · `g r` Reference · `?` toggles a shortcut help modal. 800ms reset window for the chord prefix.
- Document title updates per view (`<View name> · AuditAI Range`, or `Week N of 16 · AuditAI Range` on the dashboard).
- Per-WP `lastModified` is stored on every status or criterion change. Work Paper rows show "Edited 3 days ago" via `Intl.RelativeTimeFormat`.
- Streak counter on the dashboard header counts distinct UTC days on which any rubric criterion was toggled or any NPC message was sent (stored in `auditai-activity-dates`).
- Guide view has a new "Daily routine" section: dashboard → next up → scenario → terminal → grade WP → optional NPC drill → export every Friday.

### Cleanup
- Deleted dead components `NPCPushbackArena` and `MissionView` (~360 lines) which were unreachable after the routing refactor.
- All localStorage keys preserved (`auditai-progress`, `auditai-workpapers`, `auditai-gemini-key`, `auditai-activity-dates`, `auditai-last-export`, `auditai-selected-wp`, `auditai-npc-log-{wpId}`); existing progress migrates gracefully.
- `npm run build` and `npm run lint` (tsc --noEmit) both pass clean.
