/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Fragment, useMemo, useRef, type ChangeEvent, type ReactNode } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  Users,
  Target,
  CheckCircle2,
  X,
  Download,
  Menu,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Keyboard,
  Circle,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ORGANIZATIONS,
  SUTS,
  TOOLS,
  FRAMEWORK_CROSSWALK,
  NPC_PERSONAS,
  RUBRIC_CRITERIA,
  WORKPAPER_DEFINITIONS,
} from './constants';
import { callLlm, PROVIDER_DEFAULTS, GROQ_MODELS, GROK_MODELS, type LlmConfig, type LlmProvider } from './lib/llm.ts';
import { TASKS } from './data/tasks.ts';
import { DEMO_NPC_RESPONSES } from './data/demo-npc-responses.ts';
import { FeedbackView } from './components/FeedbackView.tsx';
import { useVisitorCount } from './lib/analytics.ts';

// ============================================================
// TYPES
// ============================================================

type View = 'now' | 'queue' | 'reference' | 'npc' | 'settings' | 'workpapers' | 'feedback';
type ReferenceTab = 'orgs' | 'suts' | 'frameworks' | 'tools';
type WorkPaperStatus = 'not-started' | 'in-progress' | 'needs-revision' | 'complete' | 'redo';

interface WorkpaperCriterion {
  checked: boolean;
  evidence: string;
}

interface WorkPaperRecord {
  criteria: WorkpaperCriterion[];
  lastModified: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ============================================================
// STORAGE HELPERS
// ============================================================

function loadJsonArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function loadWorkpapers(): Record<string, WorkPaperRecord> {
  try {
    const raw = localStorage.getItem('auditai-workpapers');
    return raw ? (JSON.parse(raw) as Record<string, WorkPaperRecord>) : {};
  } catch {
    return {};
  }
}

const APP_VERSION = '1.1';
const SCHEMA_VERSION = 2;

function formatWpTitle(workPaperId: string) {
  if (workPaperId === 'wp-cap') return 'Capstone';
  return workPaperId.toUpperCase().replace('WP-', 'WP ');
}

const WORKPAPER_BY_ID: Record<string, typeof WORKPAPER_DEFINITIONS[number]> =
  WORKPAPER_DEFINITIONS.reduce((acc, wp) => {
    acc[wp.id] = wp;
    return acc;
  }, {} as Record<string, typeof WORKPAPER_DEFINITIONS[number]>);

function getWpPurpose(workPaperId: string): string | undefined {
  return WORKPAPER_BY_ID[workPaperId]?.purpose;
}

const PHASE_LABELS = {
  setup: 'Setup',
  execute: 'Execute',
  analyze: 'Analyze',
  write: 'Write',
  grade: 'Grade',
} as const;

function useModalFocusTrap(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;
    const focusables = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);
  return containerRef;
}

// ============================================================
// UI COMPONENTS
// ============================================================

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function SidebarItem(props: SidebarItemProps) {
  const { icon: Icon, label, active, onClick, badge } = props;
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
        active
          ? 'text-zinc-900 bg-gradient-to-r from-indigo-50 via-white to-pink-50 shadow-[0_1px_2px_rgba(79,70,229,0.06),0_6px_18px_-10px_rgba(79,70,229,0.25)] border border-indigo-100/70'
          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-pink-500" />
      )}
      <Icon size={17} className={active ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-700'} />
      <span className="font-medium text-sm flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            active ? 'bg-indigo-600 text-white' : 'bg-zinc-200/80 text-zinc-600 group-hover:bg-zinc-300'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

interface CardProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  action?: ReactNode;
}

const Card = ({ children, title, subtitle, className = '', action }: CardProps) => (
  <div
    className={`soft-card overflow-hidden transition-all duration-300 hover:shadow-[0_2px_4px_rgba(24,24,27,0.04),0_18px_36px_-18px_rgba(24,24,27,0.18)] hover:border-zinc-300/70 ${className}`}
  >
    {(title || subtitle || action) && (
      <div className="px-6 py-4 border-b border-zinc-100/80 flex items-center justify-between bg-gradient-to-b from-white/60 to-transparent">
        <div>
          {title && <h3 className="font-semibold text-zinc-900 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

function CopyableCode({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onCopy}
        aria-label={label ? `Copy ${label}` : 'Copy command'}
        className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${
          copied ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
        }`}
      >
        {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
      </button>
      <code className="block bg-zinc-900 text-zinc-100 p-3 pr-20 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </code>
    </div>
  );
}

const StatusBadge = ({ status }: { status: WorkPaperStatus }) => {
  const config = {
    'not-started': { label: 'Not Started', className: 'bg-zinc-100 text-zinc-500', icon: Circle },
    'in-progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border border-blue-200', icon: RefreshCw },
    'needs-revision': { label: 'Needs Revision', className: 'bg-amber-50 text-amber-700 border border-amber-200', icon: AlertTriangle },
    complete: { label: 'Complete', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
    redo: { label: 'Redo', className: 'bg-rose-50 text-rose-700 border border-rose-200', icon: AlertTriangle },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md ${config.className}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
};

// ============================================================
// VIEW COMPONENTS
// ============================================================

const NowView = ({
  nextTask,
  upcomingTasks,
  completedCount,
  totalTasks,
  completedWPs,
  totalWPs,
  onJumpToTask,
  showIntro,
  onDismissIntro,
}: {
  nextTask?: typeof TASKS[0];
  upcomingTasks: typeof TASKS;
  completedCount: number;
  totalTasks: number;
  completedWPs: number;
  totalWPs: number;
  onJumpToTask: (taskId: string) => void;
  showIntro: boolean;
  onDismissIntro: () => void;
}) => (
  <div className="space-y-6">
    {showIntro && (
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6 flex flex-col sm:flex-row gap-4 sm:items-start">
        <div className="flex-1 space-y-2 text-sm text-zinc-700">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">Welcome</p>
          <p>
            This is <strong>AuditAI Range</strong>, a 16-week AI audit program with 15 work papers across 3 fictional orgs
            (Helix Health, Stellar Bank, Nimbus AI).
          </p>
          <p>
            Toggle <strong>Novice Mode</strong> in the sidebar for step-by-step explanations. Try <strong>Demo Mode</strong> in
            NPC Practice to see stakeholder pushback without an API key.
          </p>
          <p className="text-xs text-zinc-500 pt-1">
            Your progress is saved only in this browser — nothing is sent to a server, and other visitors have their own
            private workspace.
          </p>
        </div>
        <button
          onClick={onDismissIntro}
          className="self-start inline-flex items-center gap-1 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800"
        >
          Got it
        </button>
      </div>
    )}
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow">What&apos;s Next</p>
        <h1 className="text-3xl md:text-[2.1rem] font-bold mt-1.5 tracking-tight gradient-text leading-tight">
          Focus on one task. Finish the next deliverable.
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card title="Tasks completed" subtitle={`${completedCount}/${totalTasks}`} className="!p-4" />
        <Card title="Work papers complete" subtitle={`${completedWPs}/${totalWPs}`} className="!p-4" />
        <Card title="Remaining tasks" subtitle={`${totalTasks - completedCount}`} className="!p-4" />
      </div>
    </header>

    {nextTask ? (
      <Card
        title={`Next task: ${formatWpTitle(nextTask.workPaperId)} • ${PHASE_LABELS[nextTask.phase]}`}
        subtitle={nextTask.title}
        action={
          <button className="btn-accent" onClick={() => onJumpToTask(nextTask.id)}>
            Open task
            <ArrowRight size={16} />
          </button>
        }
      >
        <div className="space-y-4 text-sm text-zinc-600">
          <p>{nextTask.why}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Estimate</p>
              <p className="font-semibold text-zinc-900">{nextTask.estimateMinutes} minutes</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Deliverable</p>
              <p className="font-semibold text-zinc-900">{formatWpTitle(nextTask.workPaperId)}</p>
              {getWpPurpose(nextTask.workPaperId) && (
                <p className="text-xs text-zinc-500 mt-1 leading-snug">{getWpPurpose(nextTask.workPaperId)}</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2">What to do</p>
            <ol className="list-decimal list-inside space-y-2">
              {nextTask.steps.map(step => (
                <li key={step} className="text-zinc-700">{step}</li>
              ))}
            </ol>
          </div>
          <p className="text-xs text-zinc-500">{nextTask.doneCondition}</p>
        </div>
      </Card>
    ) : (
      <Card title="All caught up" subtitle="You have completed every task in the queue.">
        <p className="text-sm text-zinc-600">Great work. Use the NPC practice space to rehearse defenses and keep the audit story sharp.</p>
      </Card>
    )}

    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Upcoming tasks</h2>
        <p className="text-sm text-zinc-500">Next three items in your queue</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {upcomingTasks.slice(0, 3).map(task => (
          <div
            key={task.id}
            className="group relative p-5 soft-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(24,24,27,0.04),0_24px_40px_-20px_rgba(79,70,229,0.25)]"
          >
            <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] uppercase tracking-[0.22em] text-indigo-500/80 mb-3 font-semibold">
              {formatWpTitle(task.workPaperId)} · {PHASE_LABELS[task.phase]}
            </p>
            <h3 className="font-semibold text-zinc-900 mb-3 text-sm tracking-tight">{task.title}</h3>
            <p className="text-sm text-zinc-600 mb-4 line-clamp-3">{task.why}</p>
            <button
              onClick={() => onJumpToTask(task.id)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-pink-600 transition-colors"
            >
              Open task <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const NoviceTaskDetail = ({
  task,
  onToggleTask,
  isCompleted,
  osType,
}: {
  task: typeof TASKS[0];
  onToggleTask: (taskId: string) => void;
  isCompleted: boolean;
  osType: 'windows' | 'macos-linux';
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const stepDetails = task.stepDetails || task.steps.map((step, idx) => ({
    description: step,
    commandWindows: task.commandWindows,
    commandMacLinux: task.commandMacLinux,
    whatItDoes: 'See command to run section below.',
    whyWeDoIt: 'See task description for context.',
  }));

  return (
    <Card title={`${formatWpTitle(task.workPaperId)} · ${PHASE_LABELS[task.phase]}`} subtitle={task.title}>
      <div className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-semibold">Why this task matters</p>
          <p className="text-sm text-zinc-700 leading-relaxed">{task.why}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-semibold">Estimate & Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-zinc-400">Time needed</p>
              <p className="font-semibold text-zinc-900">{task.estimateMinutes} minutes</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Work Paper</p>
              <p className="font-semibold text-zinc-900">{formatWpTitle(task.workPaperId)}</p>
            </div>
          </div>
          {getWpPurpose(task.workPaperId) && (
            <p className="text-xs text-zinc-600 mt-3 leading-snug bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
              <span className="font-semibold text-zinc-700">What this work paper is for:</span> {getWpPurpose(task.workPaperId)}
            </p>
          )}
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Step-by-step guide (Novice Mode)</p>
            <span className="text-[9px] font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded">ELI5 Mode</span>
          </div>

          <div className="space-y-3">
            {stepDetails.map((detail, idx) => (
              <div key={idx} className="border border-zinc-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors">
                <button
                  onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                  className="w-full p-4 flex items-start gap-3 hover:bg-zinc-50 transition-colors text-left"
                >
                  <span className="text-lg font-bold text-indigo-600 shrink-0 mt-0.5">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-900 text-sm">{detail.description}</h4>
                    {expandedStep !== idx && (
                      <p className="text-[12px] text-zinc-500 mt-1 line-clamp-1">Click to see the command and explanation</p>
                    )}
                  </div>
                  <span className={`text-zinc-400 transition-transform shrink-0 ${expandedStep === idx ? 'rotate-180' : ''}`}>
                    {expandedStep === idx ? '▲' : '▼'}
                  </span>
                </button>

                <AnimatePresence>
                  {expandedStep === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-zinc-100 bg-zinc-50 p-4 space-y-4"
                    >
                      {/* What it does */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">What this does</p>
                        <p className="text-sm text-zinc-700 leading-relaxed bg-white p-3 rounded-lg border border-zinc-100">
                          {detail.whatItDoes}
                        </p>
                      </div>

                      {/* Why we do it */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">Why we're doing this</p>
                        <p className="text-sm text-zinc-700 leading-relaxed bg-white p-3 rounded-lg border border-zinc-100">
                          {detail.whyWeDoIt}
                        </p>
                      </div>

                      {/* Real-world analogy */}
                      {detail.realWorldAnalogy && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">Real-world analogy</p>
                          <p className="text-sm text-zinc-700 italic bg-blue-50 p-3 rounded-lg border border-blue-100">
                            {detail.realWorldAnalogy}
                          </p>
                        </div>
                      )}

                      {/* OS Selector and Command */}
                      {(detail.commandWindows || detail.commandMacLinux) && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Command to run</p>
                            <span className="text-[10px] text-zinc-500">
                              Showing {osType === 'windows' ? 'Windows · PowerShell' : 'macOS / Linux · Bash'} — change in Settings
                            </span>
                          </div>
                          {task.commandIsIllustrative && (
                            <span className="inline-flex items-center gap-1 mb-3 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">
                              Illustrative — see README
                            </span>
                          )}
                          <CopyableCode
                            label={`step ${idx + 1} command`}
                            code={osType === 'windows' ? (detail.commandWindows || '') : (detail.commandMacLinux || '')}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Consolidated command block */}
        {(task.commandWindows || task.commandMacLinux) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Complete command (all steps combined)</p>
              <span className="text-[9px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {osType === 'windows' ? 'Windows · PowerShell' : 'macOS / Linux · Bash'}
              </span>
            </div>
            {task.commandIsIllustrative && (
              <span className="inline-flex items-center gap-1 mb-3 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">
                Illustrative — see README
              </span>
            )}
            <CopyableCode
              label="combined command"
              code={(osType === 'windows' ? task.commandWindows : task.commandMacLinux) || ''}
            />
          </div>
        )}

        {(task.commandWindows || task.commandMacLinux || task.command || task.automationCommandWindows) && (
          <div className="rounded-lg p-3 border bg-amber-50 border-amber-200">
            <p className="text-[10px] uppercase tracking-wider text-amber-800 font-bold flex items-center gap-2 mb-1">
              <AlertTriangle size={12} /> Terminal tip
            </p>
            <p className="text-xs text-amber-800">
              Run these commands in your <strong>{osType === 'windows' ? 'PowerShell' : 'Terminal (bash/zsh)'}</strong>, <strong>NOT</strong> inside Python REPL (the prompt with <code className="bg-amber-200/60 px-1 rounded">&gt;&gt;&gt;</code>). If stuck in REPL, type <code className="bg-amber-200/60 px-1 rounded">exit()</code>.
            </p>
          </div>
        )}

        {task.expectedOutput && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Expected output when done</p>
            <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg font-mono border border-zinc-100">{task.expectedOutput}</p>
          </div>
        )}

        {task.evidencePath && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Where to save evidence</p>
            <p className="text-sm text-zinc-700 font-mono bg-amber-50 p-3 rounded-lg border border-amber-200">{task.evidencePath}</p>
          </div>
        )}

        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Task is complete when...</p>
          <p className="text-sm text-zinc-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">{task.doneCondition}</p>
        </div>

        <button
          onClick={() => onToggleTask(task.id)}
          className={`w-full rounded-full py-3 text-sm font-semibold transition-all duration-200 ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'text-white shadow-[0_8px_22px_-12px_rgba(79,70,229,0.5)] hover:-translate-y-0.5'
          }`}
          style={
            !isCompleted
              ? { backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' }
              : undefined
          }
        >
          {isCompleted ? '✓ Mark incomplete' : 'Mark complete'}
        </button>
      </div>
    </Card>
  );
};

const TaskQueueView = ({
  tasks,
  completedTasks,
  selectedTaskId,
  onToggleTask,
  onSelectTask,
  osType,
  noviceMode,
}: {
  tasks: typeof TASKS;
  completedTasks: string[];
  selectedTaskId: string | null;
  onToggleTask: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  osType: 'windows' | 'macos-linux';
  noviceMode: boolean;
}) => {
  const groups = Array.from(
    tasks.reduce((map, task) => {
      if (!map.has(task.workPaperId)) map.set(task.workPaperId, []);
      map.get(task.workPaperId)!.push(task);
      return map;
    }, new Map<string, typeof TASKS>())
  );

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  const isSelectedCompleted = selectedTask && completedTasks.includes(selectedTask.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,380px)_1fr] gap-7 mb-20 w-full">
      <div className="space-y-6 min-w-0">
        <div className="lg:sticky lg:top-6 z-20 p-5 rounded-[2rem] border border-zinc-200/70 bg-white/95 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
          <p className="eyebrow">Task queue</p>
          <h2 className="text-2xl font-semibold mt-2 tracking-tight text-slate-900">
            Your current workflow
          </h2>
          <p className="text-sm text-zinc-500 mt-2">Select a work paper to see details and commands in the main panel.</p>
        </div>
        <div className="space-y-6 max-h-[calc(100vh-210px)] overflow-y-auto pr-2">
          {groups.map(([workPaperId, groupTasks]) => {
            const completedCount = groupTasks.filter(task => completedTasks.includes(task.id)).length;
            return (
              <Fragment key={workPaperId}>
              <Card
                title={formatWpTitle(workPaperId)}
                subtitle={`${completedCount}/${groupTasks.length} complete`}
                className="!p-4"
              >
                {getWpPurpose(workPaperId) && (
                  <p className="text-[11px] leading-snug text-zinc-600 mb-3 -mt-1">
                    {getWpPurpose(workPaperId)}
                  </p>
                )}
                <div className="space-y-2">
                  {groupTasks.map(task => {
                    const isCompleted = completedTasks.includes(task.id);
                    const isSelected = selectedTaskId === task.id;
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onSelectTask(task.id)}
                        className={`group w-full text-left p-4 rounded-3xl border transition-all duration-200 text-xs ${
                          isSelected
                            ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-pink-50 shadow-[0_2px_6px_rgba(79,70,229,0.12),0_12px_30px_-18px_rgba(79,70,229,0.20)]'
                            : 'border-zinc-200/70 bg-white/90 hover:border-indigo-200 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <p className={`text-[9px] uppercase font-semibold tracking-wider mb-1 ${isSelected ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-indigo-500'}`}>
                          {PHASE_LABELS[task.phase]}
                        </p>
                        <h4 className={`font-semibold line-clamp-2 ${isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
                          {task.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-2 flex items-center gap-2">
                          <span className="inline-flex shrink-0 h-1.5 w-1.5 rounded-full bg-zinc-400 mt-[2px]" />
                          <span>{task.estimateMinutes} min</span>
                          {isCompleted && <span className="ml-auto text-emerald-600 font-semibold">✓ done</span>}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>
              </Fragment>
            );
          })}
        </div>
      </div>

      <div className="min-w-0">
        {selectedTask ? (
          noviceMode ? (
            <NoviceTaskDetail 
              task={selectedTask}
              onToggleTask={onToggleTask}
              isCompleted={isSelectedCompleted}
              osType={osType}
            />
          ) : (
            <Card title={`${formatWpTitle(selectedTask.workPaperId)} · ${PHASE_LABELS[selectedTask.phase]}`} subtitle={selectedTask.title}>
              <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-semibold">Why this task matters</p>
                <p className="text-sm text-zinc-700 leading-relaxed">{selectedTask.why}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-semibold">Key details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400">Estimate</p>
                    <p className="font-semibold text-zinc-900">{selectedTask.estimateMinutes} minutes</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">Work Paper</p>
                    <p className="font-semibold text-zinc-900">{formatWpTitle(selectedTask.workPaperId)}</p>
                  </div>
                </div>
                {getWpPurpose(selectedTask.workPaperId) && (
                  <p className="text-xs text-zinc-600 mt-3 leading-snug bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
                    <span className="font-semibold text-zinc-700">What this work paper is for:</span> {getWpPurpose(selectedTask.workPaperId)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-semibold">Steps to complete</p>
                <ol className="space-y-2">
                  {selectedTask.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-zinc-700">
                      <span className="font-bold text-zinc-400 shrink-0">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedTask.automationCommandWindows && selectedTask.automationCommandMacLinux && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Create evidence folders (one-click)</p>
                    <span className="text-[9px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {osType === 'windows' ? 'PowerShell' : 'Bash'}
                    </span>
                  </div>
                  <CopyableCode
                    label="evidence folder script"
                    code={osType === 'windows' ? selectedTask.automationCommandWindows : selectedTask.automationCommandMacLinux}
                  />
                </div>
              )}

              {(selectedTask.commandWindows || selectedTask.commandMacLinux) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Command to run</p>
                    <span className="text-[9px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {osType === 'windows' ? 'Windows · PowerShell' : 'macOS / Linux · Bash'}
                    </span>
                  </div>
                  <CopyableCode
                    label="command"
                    code={(osType === 'windows' ? selectedTask.commandWindows : selectedTask.commandMacLinux) || ''}
                  />
                </div>
              )}

              {selectedTask.command && !selectedTask.commandWindows && !selectedTask.commandMacLinux && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Command to run</p>
                  <CopyableCode label="command" code={selectedTask.command} />
                </div>
              )}

              {(selectedTask.commandWindows || selectedTask.commandMacLinux || selectedTask.command || selectedTask.automationCommandWindows) && (
                <div
                  className={`rounded-lg p-3 border ${
                    selectedTask.phase === 'setup'
                      ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-200/60 shadow-sm'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-amber-800 font-bold flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} /> REPL Warning {selectedTask.phase === 'setup' && <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">Setup task</span>}
                  </p>
                  <p className="text-xs text-amber-800">
                    Run these commands in your <strong>{osType === 'windows' ? 'PowerShell' : 'Terminal (bash/zsh)'}</strong>, <strong>NEVER</strong> inside a Python REPL (the prompt that starts with <code className="bg-amber-200/60 px-1 rounded">&gt;&gt;&gt;</code>). If you see <code className="bg-amber-200/60 px-1 rounded">&gt;&gt;&gt;</code>, type <code className="bg-amber-200/60 px-1 rounded">exit()</code> first.
                  </p>
                </div>
              )}

              {selectedTask.expectedOutput && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Expected output</p>
                  <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg font-mono">{selectedTask.expectedOutput}</p>
                </div>
              )}

              {selectedTask.evidencePath && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Evidence path</p>
                  <p className="text-sm text-zinc-700 font-mono bg-amber-50 p-3 rounded-lg">{selectedTask.evidencePath}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Done condition</p>
                <p className="text-sm text-zinc-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">{selectedTask.doneCondition}</p>
              </div>

              <button
                onClick={() => onToggleTask(selectedTask.id)}
                className={`w-full rounded-full py-3 text-sm font-semibold transition-all duration-200 ${
                  isSelectedCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'text-white shadow-[0_8px_22px_-12px_rgba(79,70,229,0.5)] hover:-translate-y-0.5'
                }`}
                style={
                  !isSelectedCompleted
                    ? { backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)' }
                    : undefined
                }
              >
                {isSelectedCompleted ? '✓ Mark incomplete' : 'Mark complete'}
              </button>
            </div>
            </Card>
          )
        ) : (
          <Card title="Select a task" subtitle="Choose a task from the queue to see full details.">
            <p className="text-sm text-zinc-600">The right panel will show all task information including steps, commands, evidence paths, and completion criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

const ReferenceView = ({
  tab,
  setTab,
}: {
  tab: ReferenceTab;
  setTab: (tab: ReferenceTab) => void;
}) => (
  <div className="space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">Reference</p>
        <h1 className="text-3xl font-bold mt-1.5 tracking-tight gradient-text leading-tight">
          Tools, systems, and audit context.
        </h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {([ 'orgs', 'suts', 'tools', 'frameworks' ] as ReferenceTab[]).map(item => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border ${
              tab === item
                ? 'border-transparent text-white shadow-[0_8px_22px_-12px_rgba(79,70,229,0.5)]'
                : 'border-zinc-200/70 bg-white/70 text-zinc-700 hover:border-indigo-200 hover:text-indigo-700'
            }`}
            style={tab === item ? { backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #ec4899 100%)' } : undefined}
          >
            {item === 'orgs' ? 'Organizations' : item === 'suts' ? 'SUTs' : item === 'tools' ? 'Tools' : 'Frameworks'}
          </button>
        ))}
      </div>
    </header>

    {tab === 'orgs' && (
      <div className="grid gap-4 xl:grid-cols-3">
        {ORGANIZATIONS.map(org => (
          <Fragment key={org.id}>
          <Card title={org.name} subtitle={org.industry}>
            <div className="text-sm text-zinc-600 space-y-3">
              <p><strong>Size:</strong> {org.size}</p>
              <p><strong>Region:</strong> {org.geography}</p>
              <p><strong>Exposure:</strong> {org.regulatoryExposure.join(', ')}</p>
              <p>{org.context}</p>
            </div>
          </Card>
          </Fragment>
        ))}
      </div>
    )}

    {tab === 'suts' && (
      <div className="grid gap-4 xl:grid-cols-2">
        {SUTS.map(sut => (
          <Fragment key={sut.id}>
          <Card title={sut.name} subtitle={sut.type}>
            <div className="text-sm text-zinc-600 space-y-2">
              <p><strong>Org:</strong> {sut.org}</p>
              <p><strong>Risk tier:</strong> {sut.riskTier}</p>
              <p><strong>Primary test:</strong> {sut.primaryTest}</p>
              <p><strong>Build approach:</strong> {sut.buildApproach}</p>
            </div>
          </Card>
          </Fragment>
        ))}
      </div>
    )}

    {tab === 'tools' && (
      <div className="grid gap-4 xl:grid-cols-2">
        {TOOLS.map(tool => (
          <Fragment key={tool.name}>
          <Card title={tool.name} subtitle={tool.category}>
            <div className="text-sm text-zinc-600 space-y-2">
              <p>{tool.purpose}</p>
              <p><strong>Phase:</strong> {tool.phase}</p>
              <p><strong>License:</strong> {tool.license}</p>
              {tool.link && (
                <a href={tool.link} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-900 text-sm font-semibold">
                  {tool.linkLabel || 'Learn more'}
                </a>
              )}
            </div>
          </Card>
          </Fragment>
        ))}
      </div>
    )}

    {tab === 'frameworks' && (
      <Card title="Framework crosswalk" subtitle="Reference mapping for findings.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-600 border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="pb-2 font-semibold">Finding type</th>
                <th className="pb-2 font-semibold">NIST AI RMF</th>
                <th className="pb-2 font-semibold">ISO 42001</th>
                <th className="pb-2 font-semibold">EU AI Act</th>
              </tr>
            </thead>
            <tbody>
              {FRAMEWORK_CROSSWALK.map(row => (
                <tr key={row.findingType} className="border-t border-zinc-100">
                  <td className="py-3 pr-4 font-medium text-zinc-900">{row.findingType}</td>
                  <td className="py-3 pr-4">{row.nistAiRmf}</td>
                  <td className="py-3 pr-4">{row.iso42001}</td>
                  <td className="py-3 pr-4">{row.euAiAct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )}
  </div>
);

const NpcSimView = ({
  llmConfig,
  selectedTask,
  onActivity,
}: {
  llmConfig: LlmConfig;
  selectedTask?: typeof TASKS[0] | null;
  onActivity: () => void;
}) => {
  const providerLabel = PROVIDER_DEFAULTS[llmConfig.provider].label;
  const [personaId, setPersonaId] = useState(NPC_PERSONAS[0]?.id || '');
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  const persona = NPC_PERSONAS.find(p => p.id === personaId) ?? NPC_PERSONAS[0];
  const demoScenario = DEMO_NPC_RESPONSES.find(demo => demo.personaId === personaId);
  const isDemoComplete = demoMode && demoScenario ? demoIndex >= demoScenario.exchanges.length : false;

  const openChat = async () => {
    if (!draft.trim()) return;
    setError(null);
    const userMessage = draft.trim();
    const nextHistory = [...history, { role: 'user', content: userMessage }];
    setHistory(nextHistory);
    setDraft('');
    setLoading(true);
    try {
      const promptParts = [
        `You are ${persona.name}, a ${persona.role} at ${persona.org}.`,
        persona.openingContext,
        persona.pushback,
        selectedTask ? `The auditor is working on task ${formatWpTitle(selectedTask.workPaperId)}: ${selectedTask.title}. Provide challenging but constructive stakeholder feedback based on that task.` : 'The auditor may ask you to role-play stakeholder pushback for their audit work.',
      ];
      const response = await callLlm(llmConfig, promptParts.join(' '), userMessage, nextHistory);
      setHistory(prev => [...prev, { role: 'assistant', content: response }]);
      onActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to contact ${providerLabel}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoNext = () => {
    if (!demoScenario || isDemoComplete) return;
    const nextMessage = demoScenario.exchanges[demoIndex];
    setHistory(prev => [...prev, nextMessage]);
    setDemoIndex(demoIndex + 1);
    setError(null);
    onActivity();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">NPC practice</p>
          <h1 className="text-3xl font-bold mt-1.5 tracking-tight gradient-text leading-tight">
            Practice audit defense with a coach.
          </h1>
          <p className="text-sm text-zinc-500 max-w-2xl mt-2">Select a persona and use Demo Mode for scripted exchanges without an API key.</p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          <p className="font-semibold">Selected persona</p>
          <p>{persona.name}</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card title="Persona" subtitle="Choose the stakeholder role for pushback.">
          <div className="space-y-4">
            <select
              value={personaId}
              onChange={e => setPersonaId(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm"
            >
              {NPC_PERSONAS.map(personaOption => (
                <option key={personaOption.id} value={personaOption.id}>{personaOption.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={e => {
                  setDemoMode(e.target.checked);
                  setHistory([]);
                  setDemoIndex(0);
                  setError(null);
                }}
                className="h-4 w-4 rounded border border-zinc-300 bg-white"
              />
              <span className="font-medium">Demo Mode — pre-scripted exchange (no API call)</span>
            </label>
            <div className="text-sm text-zinc-600 space-y-2">
              <p><strong>Role:</strong> {persona.role}</p>
              <p><strong>Context:</strong> {persona.openingContext}</p>
              <p><strong>Pushback style:</strong> {persona.pushback}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {demoMode ? (
            <Card title="Demo Mode" subtitle="Pre-scripted persona exchange with no API call.">
              <div className="space-y-4">
                <p className="text-sm text-zinc-600">Demo Mode walks through a fixed stakeholder exchange. Use the button below to advance each turn.</p>
                <button
                  onClick={handleDemoNext}
                  disabled={isDemoComplete || !demoScenario}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {demoScenario ? (isDemoComplete ? 'Demo complete' : 'Next exchange') : 'No demo script for this persona'}
                </button>
                {!demoScenario && (
                  <p className="text-sm text-rose-700">No demo script has been authored for this persona yet.</p>
                )}
              </div>
            </Card>
          ) : !llmConfig.apiKey ? (
            <Card title={`${providerLabel} key required`} subtitle={`Enter your ${providerLabel} API key in Settings to use this simulator.`}>
              <p className="text-sm text-zinc-600">NPC simulation needs a live {providerLabel} API key. It is stored in your browser only.</p>
            </Card>
          ) : (
            <Card title="Conversation" subtitle="Send a prompt and get a realistic response.">
              <div className="space-y-4">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  rows={5}
                  placeholder="Ask for feedback on your audit memo, risk finding, or evidence summary."
                  disabled={demoMode}
                  className="w-full rounded-3xl border border-zinc-200 p-4 text-sm text-zinc-700 resize-none disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
                {error && <p className="text-sm text-rose-700">{error}</p>}
                <button
                  onClick={openChat}
                  disabled={loading || demoMode}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Thinking…' : `Send to ${providerLabel}`}
                </button>
              </div>
            </Card>
          )}

          <Card title="Chat history" subtitle={selectedTask ? `Task: ${formatWpTitle(selectedTask.workPaperId)}` : 'No task selected'}>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
              {history.length === 0 ? (
                <p className="text-sm text-zinc-500">No messages yet. Start by asking a question or advancing the demo.</p>
              ) : (
                history.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`rounded-3xl p-4 ${message.role === 'assistant' ? 'bg-zinc-100' : 'bg-blue-50'}`}>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-2">{message.role === 'assistant' ? persona.name : 'You'}</p>
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({
  provider,
  setProvider,
  grokKey,
  setGrokKey,
  groqKey,
  setGroqKey,
  grokModel,
  setGrokModel,
  groqModel,
  setGroqModel,
  lastExport,
  onExportProgress,
  onImportProgress,
  onReset,
  osType,
  setOsType,
}: {
  provider: LlmProvider;
  setProvider: (p: LlmProvider) => void;
  grokKey: string;
  setGrokKey: (key: string) => void;
  groqKey: string;
  setGroqKey: (key: string) => void;
  grokModel: string;
  setGrokModel: (model: string) => void;
  groqModel: string;
  setGroqModel: (model: string) => void;
  lastExport: string | null;
  onExportProgress: () => void;
  onImportProgress: (e: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  osType: 'windows' | 'macos-linux';
  setOsType: (os: 'windows' | 'macos-linux') => void;
}) => (
  <div className="space-y-8">
    <header>
      <p className="eyebrow">Preferences</p>
      <h1 className="text-3xl font-bold mt-1.5 tracking-tight gradient-text leading-tight">Settings</h1>
      <p className="text-zinc-500 mt-2">Manage persistence, API access, and recovery options.</p>
    </header>

    <Card title="Operating System" subtitle="Select your platform for command syntax.">
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 mb-4">Commands will display with the correct syntax for your OS.</p>
        <div className="grid grid-cols-2 gap-3">
          {(['macos-linux', 'windows'] as const).map(os => (
            <button
              key={os}
              onClick={() => setOsType(os)}
              className={`relative rounded-2xl px-4 py-4 text-sm font-semibold transition-all duration-200 border text-left ${
                osType === os
                  ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-pink-50 shadow-[0_2px_4px_rgba(79,70,229,0.06),0_12px_28px_-14px_rgba(79,70,229,0.35)]'
                  : 'border-zinc-200/80 bg-white/70 text-zinc-700 hover:border-indigo-200 hover:bg-white'
              }`}
            >
              <p className={`text-[10px] uppercase tracking-wider mb-1 ${osType === os ? 'text-indigo-600' : 'text-zinc-400'}`}>
                {os === 'macos-linux' ? 'Bash · zsh' : 'PowerShell'}
              </p>
              <p className="text-zinc-900 font-bold">{os === 'macos-linux' ? 'macOS / Linux' : 'Windows'}</p>
              {osType === os && (
                <span className="absolute top-3 right-3 inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white">
                  <Check size={12} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </Card>

    <Card title="Provider settings" subtitle="Choose which model powers the coach and NPC simulator.">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {(['grok', 'groq'] as const).map(p => {
            const meta = PROVIDER_DEFAULTS[p];
            const active = provider === p;
            return (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`relative rounded-2xl px-4 py-4 text-sm transition-all duration-200 border text-left ${
                  active
                    ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-pink-50 shadow-[0_2px_4px_rgba(79,70,229,0.06),0_12px_28px_-14px_rgba(79,70,229,0.35)]'
                    : 'border-zinc-200/80 bg-white/70 text-zinc-700 hover:border-indigo-200 hover:bg-white'
                }`}
              >
                <p className={`text-[10px] uppercase tracking-wider mb-1 font-semibold ${active ? 'text-indigo-600' : 'text-zinc-400'}`}>
                  {p === 'grok' ? 'xAI · Grok' : 'Groq · Llama / Mixtral'}
                </p>
                <p className="text-zinc-900 font-bold">{meta.label}</p>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">{meta.keyPrefix}…</p>
                {active && (
                  <span className="absolute top-3 right-3 inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white">
                    <Check size={12} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-zinc-500">
          Grok ≠ Groq. Different products. Grok keys start with <code className="font-mono">xai-</code>; Groq keys start with <code className="font-mono">gsk_</code>.
        </p>
      </div>
    </Card>

    <Card title={`${PROVIDER_DEFAULTS[provider].label} API key`} subtitle="Stored in your browser only.">
      <div className="space-y-4">
        <div className={provider === 'grok' ? '' : 'opacity-60'}>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2 mb-1">
            xAI Grok key
            {provider === 'grok' && <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">Active</span>}
          </label>
          <input
            type="password"
            value={grokKey}
            onChange={(e) => setGrokKey(e.target.value.trim())}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-mono"
            placeholder="xai-..."
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Get one at <a href={PROVIDER_DEFAULTS.grok.consoleUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-pink-600">console.x.ai</a>.
          </p>
        </div>

        <div className={provider === 'groq' ? '' : 'opacity-60'}>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2 mb-1">
            Groq key
            {provider === 'groq' && <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">Active</span>}
          </label>
          <input
            type="password"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value.trim())}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-mono"
            placeholder="gsk_..."
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Get one at <a href={PROVIDER_DEFAULTS.groq.consoleUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-pink-600">console.groq.com/keys</a>.
          </p>
        </div>

        {provider === 'grok' && grokKey && !grokKey.startsWith('xai-') && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
            ⚠️ Your key doesn&apos;t start with <code className="font-mono">xai-</code>. If it starts with <code className="font-mono">gsk_</code>, switch the provider to Groq above.
          </p>
        )}
        {provider === 'groq' && groqKey && !groqKey.startsWith('gsk_') && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
            ⚠️ Your key doesn&apos;t start with <code className="font-mono">gsk_</code>. If it starts with <code className="font-mono">xai-</code>, switch the provider to Grok above.
          </p>
        )}
      </div>
    </Card>

    <Card title="Model" subtitle={`Pick which ${PROVIDER_DEFAULTS[provider].label} model to call.`}>
      <div className="space-y-3">
        {provider === 'grok' ? (
          <select
            value={grokModel}
            onChange={(e) => setGrokModel(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm"
          >
            {GROK_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label} — {m.hint}</option>
            ))}
          </select>
        ) : (
          <select
            value={groqModel}
            onChange={(e) => setGroqModel(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm"
          >
            {GROQ_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label} — {m.hint}</option>
            ))}
          </select>
        )}
        <p className="text-[11px] text-zinc-500">
          Default: <code className="font-mono">{PROVIDER_DEFAULTS[provider].defaultModel}</code>. Changes apply on the next message.
        </p>
      </div>
    </Card>

    <Card title="Backup & restore" subtitle="Export your task progress and workpaper data.">
      <div className="space-y-4">
        <button onClick={onExportProgress} className="btn-primary">
          <Download size={14} /> Export progress
        </button>
        {lastExport && <p className="text-xs text-zinc-500">Last exported: {new Date(lastExport).toLocaleString()}</p>}
        <label className="block text-sm font-medium text-zinc-700">
          Import JSON file
          <input
            type="file"
            accept=".json"
            onChange={onImportProgress}
            className="mt-2 block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
          />
        </label>
      </div>
    </Card>

    <Card title="Progress reset" subtitle="Clear all tracked progress.">
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 border border-rose-200 hover:bg-rose-100"
      >
        Reset all progress
      </button>
    </Card>
  </div>
);

const AiTutorButton = ({
  llmConfig,
  onClick,
}: {
  llmConfig: LlmConfig;
  onClick: () => void;
}) => {
  const hasKey = Boolean(llmConfig.apiKey);
  const providerLabel = PROVIDER_DEFAULTS[llmConfig.provider].label;
  return (
    <button
      onClick={onClick}
      className="group fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
        boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.55), 0 1px 2px rgba(24,24,27,0.08)',
      }}
      title={hasKey ? `Open Audit Coach (${providerLabel}) — press T` : `Add a ${providerLabel} API key in Settings to chat with the coach`}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-white/20 group-hover:bg-white/30 transition" />
        <Sparkles size={13} className="relative" />
      </span>
      {hasKey ? 'Ask Coach' : 'Set up Coach'}
      {!hasKey && (
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white animate-pulse" />
      )}
      <kbd className="ml-1 hidden md:inline-flex items-center justify-center h-5 w-5 rounded bg-white/15 text-[10px] font-bold">T</kbd>
    </button>
  );
};

const AiTutorModal = ({
  isOpen,
  onClose,
  llmConfig,
  osType,
}: {
  isOpen: boolean;
  onClose: () => void;
  llmConfig: LlmConfig;
  osType: 'windows' | 'macos-linux';
}) => {
  const providerLabel = PROVIDER_DEFAULTS[llmConfig.provider].label;
  const grokKey = llmConfig.apiKey;
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoScenarioId, setDemoScenarioId] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);

  const demoScenario = useMemo(
    () => DEMO_NPC_RESPONSES.find(s => s.personaId === demoScenarioId) ?? null,
    [demoScenarioId]
  );
  const demoExhausted = demoScenario ? demoStep >= demoScenario.exchanges.length : false;

  const startDemo = (personaId: string) => {
    const scenario = DEMO_NPC_RESPONSES.find(s => s.personaId === personaId);
    if (!scenario) return;
    setDemoScenarioId(personaId);
    setDemoStep(0);
    setMessages([]);
    setError(null);
  };

  const advanceDemo = () => {
    if (!demoScenario) return;
    const nextPair = demoScenario.exchanges.slice(demoStep, demoStep + 2);
    if (nextPair.length === 0) return;
    setMessages(prev => [...prev, ...nextPair]);
    setDemoStep(demoStep + nextPair.length);
  };

  const exitDemo = () => {
    setDemoScenarioId(null);
    setDemoStep(0);
    setMessages([]);
  };

  const systemPrompt = useMemo(() => {
    const workPapersList = WORKPAPER_DEFINITIONS
      .map(wp => `- ${wp.id.toUpperCase()} (#${wp.number}): ${wp.title} — anchor: ${wp.anchor}${wp.frameworks?.length ? ` — frameworks: ${wp.frameworks.join(', ')}` : ''}`)
      .join('\n');
    const osLabel = osType === 'windows' ? 'Windows / PowerShell (use backslashes and `;` separators; activate venv with `.\\audit-env\\Scripts\\activate`)' : 'macOS / Linux / Bash (use forward slashes and `&&` separators; activate venv with `source audit-env/bin/activate`)';

    return `You are the Audit Range Coach — an expert helping a self-directed auditor work through a 16-week program of 15 work papers plus a capstone.

# Work Papers
${workPapersList}

# User Platform
${osLabel}

# STRICT RULE — Python REPL
If the user is trying to run terminal commands, you MUST warn them:
"⚠️ NEVER use the Python >>> prompt to run terminal commands. The >>> prompt is the Python REPL — only Python expressions work there. Run shell commands in ${osType === 'windows' ? 'PowerShell' : 'Terminal (bash/zsh)'} instead. If you see >>>, type exit() first."
Apply this rule any time the user pastes a shell command, asks how to run pip / docker / python -m venv / source / activate, or shows confusion about prompts.

# Style
Be terse, technical, supportive. Render commands in fenced code blocks, formatted for the user's OS. Cite the relevant WP id when applicable. Encourage evidence-locker hygiene (paths under 07_evidence/wp-XX/).`;
  }, [osType]);

  const sendMessage = async () => {
    if (!draft.trim() || loading) return;
    setLoading(true);
    setError(null);
    const userMsg = draft.trim();
    const nextMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(nextMessages);
    setDraft('');

    try {
      const response = await callLlm(llmConfig, systemPrompt, userMsg, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to contact ${providerLabel}`);
    } finally {
      setLoading(false);
    }
  };

  const trapRef = useModalFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Audit Coach"
    >
      <motion.div
        ref={trapRef}
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-zinc-950 text-zinc-100 w-full md:w-[420px] md:rounded-2xl md:mr-6 h-[80vh] md:h-[640px] flex flex-col shadow-2xl border border-zinc-800"
      >
        <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            <h3 className="font-bold text-white">Audit Coach</h3>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {providerLabel}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {osType === 'windows' ? 'PowerShell' : 'Bash'}
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white" aria-label="Close coach">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!grokKey && !demoScenarioId ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-amber-950/40 border border-amber-700/40 p-3 text-sm text-amber-200">
                Add your <strong>{providerLabel}</strong> API key in <strong>Settings</strong> to chat with the live coach. The key stays in your browser only.
              </div>
              <div className="rounded-lg bg-indigo-950/40 border border-indigo-700/40 p-3 text-sm text-indigo-200 space-y-2">
                <p className="font-semibold text-indigo-100">No key? Try a scripted demo.</p>
                <p className="text-xs text-indigo-300">Walk through a sample audit conversation with one of the program personas — no API call, no quota.</p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button onClick={() => startDemo('sandra-park')} className="text-left rounded bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-700/50 px-2 py-1.5 text-xs">
                    <span className="font-bold text-indigo-100">Sandra Park</span> <span className="text-indigo-300">— HIPAA / EU AI Act on MedAssist</span>
                  </button>
                  <button onClick={() => startDemo('sarah-chen')} className="text-left rounded bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-700/50 px-2 py-1.5 text-xs">
                    <span className="font-bold text-indigo-100">Sarah Chen</span> <span className="text-indigo-300">— EEOC 4/5 rule on TalentMatch</span>
                  </button>
                  <button onClick={() => startDemo('alex-kim')} className="text-left rounded bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-700/50 px-2 py-1.5 text-xs">
                    <span className="font-bold text-indigo-100">Alex Kim</span> <span className="text-indigo-300">— ISO 42001 on SupportBot</span>
                  </button>
                </div>
              </div>
            </div>
          ) : demoScenarioId ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-indigo-950/40 border border-indigo-700/40 px-3 py-2 text-xs text-indigo-200">
                <span><strong>Demo mode</strong> · scripted exchange · step {Math.min(demoStep, demoScenario?.exchanges.length ?? 0)} / {demoScenario?.exchanges.length ?? 0}</span>
                <button onClick={exitDemo} className="text-indigo-300 hover:text-white text-[10px] uppercase tracking-wider">Exit demo</button>
              </div>
              {messages.length === 0 && (
                <p className="text-xs text-zinc-500 italic">Press &ldquo;Advance demo&rdquo; below to reveal the next exchange.</p>
              )}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-zinc-400 space-y-2">
              <p>Ask me anything about the 15 work papers, evidence collection, or commands for your platform.</p>
              <p className="text-xs text-zinc-500">Tip: I&apos;ll always remind you not to paste shell commands into a Python <code className="bg-zinc-800 px-1 rounded">&gt;&gt;&gt;</code> prompt.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-3 text-sm ${
                  msg.role === 'assistant' ? 'bg-zinc-900 border border-zinc-800' : 'bg-blue-600/20 border border-blue-700/40'
                }`}
              >
                <p className="font-semibold text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                  {msg.role === 'assistant' ? 'Coach' : 'You'}
                </p>
                <p className="whitespace-pre-wrap text-zinc-100">{msg.content}</p>
              </div>
            ))
          )}
          {loading && <p className="text-xs text-zinc-500 italic">Coach is thinking…</p>}
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>

        <div className="border-t border-zinc-800 p-3 space-y-2">
          {demoScenarioId ? (
            <button
              onClick={advanceDemo}
              disabled={demoExhausted}
              className="w-full rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {demoExhausted ? 'Demo complete — add an API key for live questions' : 'Advance demo'}
            </button>
          ) : (
            <>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={3}
                placeholder={grokKey ? 'Ask about WP-03 prompt injection, evidence paths, etc. (Ctrl+Enter to send)' : `Add a ${providerLabel} API key in Settings first.`}
                disabled={!grokKey || loading}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 p-2 text-sm resize-none focus:border-blue-500 focus:outline-none disabled:opacity-60"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !draft.trim() || !grokKey}
                className="w-full rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending…' : `Send to ${providerLabel}`}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================
// APP
// ============================================================

function applyFreshParamIfPresent() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('fresh') !== '1') return false;
  Object.keys(localStorage)
    .filter(k => k.startsWith('auditai-'))
    .forEach(k => localStorage.removeItem(k));
  sessionStorage.removeItem('auditai-visit-counted');
  params.delete('fresh');
  const qs = params.toString();
  const next = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
  window.history.replaceState(null, '', next);
  return true;
}

applyFreshParamIfPresent();

export default function App() {
  const [currentView, setCurrentView] = useState<View>('now');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => localStorage.getItem('auditai-selected-task') || null);
  const [provider, setProvider] = useState<LlmProvider>(() => {
    const saved = localStorage.getItem('auditai-llm-provider');
    return saved === 'groq' || saved === 'grok' ? saved : 'grok';
  });
  const [grokKey, setGrokKey] = useState(() => localStorage.getItem('auditai-grok-key') || localStorage.getItem('auditai-gemini-key') || '');
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('auditai-groq-key') || '');
  const [grokModel, setGrokModel] = useState(() => localStorage.getItem('auditai-grok-model') || PROVIDER_DEFAULTS.grok.defaultModel);
  const [groqModel, setGroqModel] = useState(() => localStorage.getItem('auditai-groq-model') || PROVIDER_DEFAULTS.groq.defaultModel);
  const [activityDates, setActivityDates] = useState<string[]>(() => loadJsonArray('auditai-activity-dates'));
  const [lastExport, setLastExport] = useState<string | null>(() => localStorage.getItem('auditai-last-export'));
  const [referenceTab, setReferenceTab] = useState<ReferenceTab>('orgs');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const shortcutTrapRef = useModalFocusTrap(showShortcutHelp, () => setShowShortcutHelp(false));
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [noviceMode, setNoviceMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('auditai-novice-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [osType, setOsType] = useState<'windows' | 'macos-linux'>(() => {
    const saved = localStorage.getItem('auditai-os-type');
    return (saved as 'windows' | 'macos-linux') || 'macos-linux';
  });

  const [completedTasks, setCompletedTasks] = useState<string[]>(() => loadJsonArray('auditai-progress'));
  const [workpaperData, setWorkpaperData] = useState<Record<string, WorkPaperRecord>>(() => loadWorkpapers());
  const [hasVisited, setHasVisited] = useState<boolean>(() => Boolean(localStorage.getItem('auditai-has-visited')));
  const [schemaWarning, setSchemaWarning] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('auditai-schema-version');
    if (!raw) {
      localStorage.setItem('auditai-schema-version', String(SCHEMA_VERSION));
      return;
    }
    const stored = Number(raw);
    if (Number.isNaN(stored)) {
      localStorage.setItem('auditai-schema-version', String(SCHEMA_VERSION));
      return;
    }
    if (stored < SCHEMA_VERSION) {
      // Migration placeholder: when SCHEMA_VERSION bumps in future, add migration steps here.
      localStorage.setItem('auditai-schema-version', String(SCHEMA_VERSION));
    } else if (stored > SCHEMA_VERSION) {
      setSchemaWarning('Saved progress is from a newer version — some data may not load correctly.');
    }
  }, []);

  const dismissIntro = () => {
    localStorage.setItem('auditai-has-visited', '1');
    setHasVisited(true);
  };

  useEffect(() => {
    localStorage.setItem('auditai-progress', JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem('auditai-workpapers', JSON.stringify(workpaperData));
  }, [workpaperData]);

  useEffect(() => {
    if (selectedTaskId) {
      localStorage.setItem('auditai-selected-task', selectedTaskId);
    } else {
      localStorage.removeItem('auditai-selected-task');
    }
  }, [selectedTaskId]);

  useEffect(() => {
    if (grokKey) localStorage.setItem('auditai-grok-key', grokKey);
    else localStorage.removeItem('auditai-grok-key');
  }, [grokKey]);

  useEffect(() => {
    if (groqKey) localStorage.setItem('auditai-groq-key', groqKey);
    else localStorage.removeItem('auditai-groq-key');
  }, [groqKey]);

  useEffect(() => {
    localStorage.setItem('auditai-llm-provider', provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem('auditai-grok-model', grokModel);
  }, [grokModel]);

  useEffect(() => {
    localStorage.setItem('auditai-groq-model', groqModel);
  }, [groqModel]);

  const llmConfig: LlmConfig = useMemo(() => ({
    provider,
    apiKey: provider === 'grok' ? grokKey : groqKey,
    model: provider === 'grok' ? grokModel : groqModel,
  }), [provider, grokKey, groqKey, grokModel, groqModel]);

  useEffect(() => {
    localStorage.setItem('auditai-activity-dates', JSON.stringify(activityDates));
  }, [activityDates]);

  useEffect(() => {
    if (lastExport) {
      localStorage.setItem('auditai-last-export', lastExport);
    }
  }, [lastExport]);

  useEffect(() => {
    localStorage.setItem('auditai-os-type', osType);
  }, [osType]);

  useEffect(() => {
    localStorage.setItem('auditai-novice-mode', JSON.stringify(noviceMode));
  }, [noviceMode]);

  useEffect(() => {
    const existingGrok = localStorage.getItem('auditai-grok-key');
    const existingGemini = localStorage.getItem('auditai-gemini-key');
    if (!existingGrok && existingGemini) {
      localStorage.setItem('auditai-grok-key', existingGemini);
      setGrokKey(existingGemini);
    }
  }, []);

  const trackActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    setActivityDates(prev => (prev.includes(today) ? prev : [...prev, today]));
  };

  const calculateStreak = () => {
    if (activityDates.length === 0) return 0;
    const dates = [...activityDates].sort((a, b) => a.localeCompare(b));
    let streak = 0;
    let current = new Date();
    current.setUTCHours(0, 0, 0, 0);
    for (let i = dates.length - 1; i >= 0; i -= 1) {
      const date = new Date(`${dates[i]}T00:00:00Z`);
      const diff = Math.round((current.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === streak) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => (prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]));
    trackActivity();
  };

  const onSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCurrentView('queue');
  };

  const currentTask = selectedTaskId ? TASKS.find(task => task.id === selectedTaskId) : undefined;
  const nextTask = TASKS.find(task => !completedTasks.includes(task.id));
  const upcomingTasks = TASKS.filter(task => !completedTasks.includes(task.id));

  const totalTasks = TASKS.length;
  const completedCount = completedTasks.filter(id => TASKS.some(task => task.id === id)).length;
  const workPaperIds = Array.from(new Set(TASKS.map(task => task.workPaperId)));
  const totalWPs = workPaperIds.length;
  const completedWPs = workPaperIds.filter(wpId => {
    const wpTasks = TASKS.filter(task => task.workPaperId === wpId);
    return wpTasks.every(task => completedTasks.includes(task.id));
  }).length;

  const exportProgress = () => {
    const payload = {
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      progress: completedTasks,
      workpapers: workpaperData,
      activity: activityDates,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditai-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setLastExport(payload.exportedAt);
  };

  const importProgress = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data.version !== 'number') {
          alert('Unsupported file version.');
          return;
        }
        if (data.version > SCHEMA_VERSION) {
          alert(`This file is from a newer version (v${data.version}); some data may not import correctly.`);
        }
        if (!confirm('This will overwrite current progress. Continue?')) return;
        setCompletedTasks(Array.isArray(data.progress) ? data.progress : []);
        setWorkpaperData(typeof data.workpapers === 'object' && data.workpapers !== null ? data.workpapers as Record<string, WorkPaperRecord> : {});
        setActivityDates(Array.isArray(data.activity) ? data.activity : []);
        setLastExport(typeof data.exportedAt === 'string' ? data.exportedAt : new Date().toISOString());
        window.location.reload();
      } catch {
        alert('Invalid progress file.');
      }
    };
    reader.readAsText(file);
  };

  const goTo = (view: View) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const streak = calculateStreak();

  const nav = [
    { view: 'now' as View, icon: LayoutDashboard, label: "What's Next", badge: totalTasks - completedCount },
    { view: 'queue' as View, icon: ClipboardCheck, label: 'Task queue', badge: completedCount },
    { view: 'npc' as View, icon: Users, label: 'NPC practice' },
    { view: 'reference' as View, icon: BookOpen, label: 'Reference' },
    { view: 'feedback' as View, icon: MessageSquare, label: 'Feedback' },
  ];

  const visitor = useVisitorCount();

  useEffect(() => {
    let firstKey: string | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutHelp(s => !s);
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTutorOpen(o => !o);
        return;
      }

      if (firstKey === 'g') {
        firstKey = null;
        if (resetTimer) clearTimeout(resetTimer);
        const map: Record<string, View> = { n: 'now', q: 'queue', p: 'npc', r: 'reference', s: 'settings', f: 'feedback' };
        const next = map[e.key.toLowerCase()];
        if (next) {
          e.preventDefault();
          goTo(next);
        }
        return;
      }

      if (e.key === 'g') {
        firstKey = 'g';
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { firstKey = null; }, 800);
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return (
    <div className="flex h-screen app-canvas font-sans selection:bg-indigo-500 selection:text-white">
      <button
        onClick={() => setShowShortcutHelp(true)}
        className="md:hidden fixed top-3 right-3 z-30 bg-white border border-zinc-200 rounded-lg p-2 shadow-sm"
        aria-label="Open keyboard help"
      >
        <Keyboard size={18} />
      </button>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-3 left-3 z-30 bg-white border border-zinc-200 rounded-lg p-2 shadow-sm"
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isSidebarOpen}
        aria-controls="primary-sidebar"
      >
        <Menu size={18} />
      </button>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-30"
        />
      )}

      <aside
        id="primary-sidebar"
        role="navigation"
        aria-label="Primary"
        className={`fixed md:static z-40 inset-y-0 left-0 w-60 border-r border-zinc-200/80 bg-white/85 backdrop-blur-md px-4 py-6 flex flex-col shrink-0 transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <span className="relative inline-flex items-center justify-center h-8 w-8 rounded-xl text-white shadow-[0_6px_18px_-8px_rgba(79,70,229,0.6)]"
                style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #ec4899 100%)' }}>
            <ShieldAlert size={16} />
          </span>
          <span className="font-bold tracking-tight text-lg text-zinc-900">Audit Range</span>
          <span className="text-[9px] font-bold bg-gradient-to-r from-indigo-100 via-fuchsia-100 to-pink-100 text-indigo-700 px-1.5 py-0.5 rounded ml-auto tracking-wider">
            PORTAL
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <Fragment key={item.view}>
              <SidebarItem
                icon={item.icon}
                label={item.label}
                active={currentView === item.view}
                badge={item.badge}
                onClick={() => goTo(item.view)}
              />
            </Fragment>
          ))}
        </nav>

        <div className="border-t border-zinc-100 pt-3 mt-3 space-y-2">
          <button
            onClick={() => setNoviceMode(!noviceMode)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
              noviceMode
                ? 'text-zinc-900 bg-gradient-to-r from-purple-50 via-white to-pink-50 shadow-[0_1px_2px_rgba(168,85,247,0.06),0_6px_18px_-10px_rgba(168,85,247,0.25)] border border-purple-100/70'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
            }`}
          >
            <Sparkles size={17} className={noviceMode ? 'text-purple-600' : 'text-zinc-400'} />
            <span>Novice Mode {noviceMode && '✓'}</span>
          </button>
          <SidebarItem
            icon={Target}
            label="Settings"
            active={currentView === 'settings'}
            onClick={() => goTo('settings')}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pt-14 md:pt-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (selectedTaskId ?? '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {currentView === 'now' && (
                <NowView
                  nextTask={currentTask ?? nextTask}
                  upcomingTasks={upcomingTasks}
                  completedCount={completedCount}
                  totalTasks={totalTasks}
                  completedWPs={completedWPs}
                  totalWPs={totalWPs}
                  onJumpToTask={onSelectTask}
                  showIntro={!hasVisited}
                  onDismissIntro={dismissIntro}
                />
              )}

              {currentView === 'queue' && (
                <TaskQueueView
                  tasks={TASKS}
                  completedTasks={completedTasks}
                  selectedTaskId={selectedTaskId}
                  onToggleTask={toggleTask}
                  onSelectTask={onSelectTask}
                  osType={osType}
                  noviceMode={noviceMode}
                />
              )}

              {currentView === 'reference' && (
                <ReferenceView tab={referenceTab} setTab={setReferenceTab} />
              )}

              {currentView === 'npc' && (
                <NpcSimView llmConfig={llmConfig} selectedTask={currentTask ?? nextTask ?? null} onActivity={trackActivity} />
              )}

              {currentView === 'feedback' && <FeedbackView />}

              {currentView === 'settings' && (
                <SettingsView
                  provider={provider}
                  setProvider={setProvider}
                  grokKey={grokKey}
                  setGrokKey={setGrokKey}
                  groqKey={groqKey}
                  setGroqKey={setGroqKey}
                  grokModel={grokModel}
                  setGrokModel={setGrokModel}
                  groqModel={groqModel}
                  setGroqModel={setGroqModel}
                  lastExport={lastExport}
                  onExportProgress={exportProgress}
                  onImportProgress={importProgress}
                  onReset={() => {
                    if (confirm('Reset all progress? This cannot be undone.')) {
                      setCompletedTasks([]);
                      setWorkpaperData({});
                    }
                  }}
                  osType={osType}
                  setOsType={setOsType}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <footer className="text-center text-xs text-zinc-400 py-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>AuditAI Range v{APP_VERSION}</span>
            <span aria-hidden>·</span>
            <a
              href="https://github.com/djha786543-gif/AuditAIrange"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-600 underline-offset-2 hover:underline"
            >
              GitHub
            </a>
            <span aria-hidden>·</span>
            <span>Built by Deobrat Jha</span>
            {visitor.configured && visitor.count !== null && (
              <Fragment>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1" title="Total portal visits">
                  <Eye size={11} />
                  {visitor.count.toLocaleString()} visits
                </span>
              </Fragment>
            )}
          </footer>
        </div>
      </main>

      {schemaWarning && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-lg flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-700 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-900 flex-1">{schemaWarning}</p>
            <button
              onClick={() => setSchemaWarning(null)}
              className="text-amber-700 hover:text-amber-900"
              aria-label="Dismiss warning"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <AiTutorButton llmConfig={llmConfig} onClick={() => setIsTutorOpen(true)} />

      <AnimatePresence>
        {isTutorOpen && (
          <AiTutorModal
            isOpen={isTutorOpen}
            onClose={() => setIsTutorOpen(false)}
            llmConfig={llmConfig}
            osType={osType}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShortcutHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcutHelp(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <motion.div
              ref={shortcutTrapRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2"><Keyboard size={16} /> Keyboard shortcuts</h3>
                <button onClick={() => setShowShortcutHelp(false)} className="text-zinc-400 hover:text-zinc-900">
                  <X size={16} />
                </button>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  { keys: ['g', 'n'], label: "Go to What's Next" },
                  { keys: ['g', 'q'], label: 'Go to Task queue' },
                  { keys: ['g', 'p'], label: 'Go to NPC practice' },
                  { keys: ['g', 'r'], label: 'Go to Reference' },
                  { keys: ['g', 'f'], label: 'Go to Feedback' },
                  { keys: ['g', 's'], label: 'Go to Settings' },
                  { keys: ['?'], label: 'Toggle this help' },
                ].map(s => (
                  <li key={s.label} className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
                    <span className="text-zinc-600">{s.label}</span>
                    <span className="flex gap-1">
                      {s.keys.map(k => (
                        <kbd key={k} className="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-xs font-mono">{k}</kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-zinc-400 mt-3 italic">Shortcuts are disabled while a text field is focused.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
