// Shot list for the AuditAI Range walkthrough video.
// Each shot has a narration line and an `action` key the recorder script
// knows how to perform. `padAfter` adds a quiet beat at the end of the shot
// so the visual lingers a moment past the voice line.

export const SHOTS = [
  {
    id: 1,
    action: 'open-now',
    text: "AuditAI Range is a self-paced tracker I built for a sixteen week AI audit program. Fifteen work papers plus a capstone, all running entirely in the browser.",
    padAfter: 0.4,
  },
  {
    id: 2,
    action: 'open-queue',
    text: "It's organized around what to do next. Five phases per work paper — setup, execute, analyze, write, grade — and the queue picks up wherever I left off.",
    padAfter: 0.4,
  },
  {
    id: 3,
    action: 'open-wp01-show-script',
    text: "Take work paper one — lab readiness. The portal hands me a one-click script to spin up the entire evidence directory tree for all sixteen work papers.",
    padAfter: 0.6,
  },
  {
    id: 4,
    action: 'toggle-windows',
    text: "I work across operating systems, so the command engine is platform-aware. Toggle Windows, and every command in every work paper is rewritten in PowerShell — backslashes, semicolons, the right virtual environment activation.",
    padAfter: 0.6,
  },
  {
    id: 5,
    action: 'highlight-repl-warning',
    text: "Because new auditors keep pasting shell commands into the Python REPL, every setup task carries a hardened warning that meets you where the mistake happens.",
    padAfter: 0.5,
  },
  {
    id: 6,
    action: 'open-tutor',
    text: "When I get stuck, the integrated Tutor takes over. It runs on either xAI's Grok or Groq's Llama models — my key, my browser, no backend — and it knows every work paper, my OS, and the strict rule never to suggest commands inside a Python prompt.",
    padAfter: 0.6,
  },
  {
    id: 7,
    action: 'close-and-finish',
    text: "Sixteen work papers, fifteen weeks, one focused screen. AuditAI Range — on GitHub.",
    padAfter: 1.0,
  },
];
