/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Fragment, type ChangeEvent } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  Users,
  Target,
  CheckCircle2,
  CircleCheck,
  ChevronRight,
  X,
  Download,
  Menu,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Keyboard,
  Circle,
  Clock,
  Building2,
  Flame,
  FileCheck2,
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
import { callGrok } from './lib/grok.ts';
import { TASKS } from './data/tasks.ts';

// ============================================================
// TYPES
// ============================================================

type View = 'now' | 'queue' | 'reference' | 'npc' | 'settings' | 'workpapers';
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

function formatWpTitle(workPaperId: string) {
  return workPaperId.toUpperCase().replace('WP-', 'WP ');
}

function getPhaseLabel(phase: string) {
  return {
    setup: 'Setup',
    execute: 'Execute',
    analyze: 'Analyze',
    write: 'Write',
    grade: 'Grade',
  }[phase as keyof typeof PHASE_LABELS] ?? phase;
}

const PHASE_LABELS = {
  setup: 'Setup',
  execute: 'Execute',
  analyze: 'Analyze',
  write: 'Write',
  grade: 'Grade',
} as const;

// ============================================================
// UI COMPONENTS
// ============================================================

function SidebarItem(props: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  const { icon: Icon, label, active, onClick, badge } = props;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium text-sm flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-200 text-zinc-600'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

const Card = ({ children, title, subtitle, className = '', action }: any) => (
  <div className={`bg-white border border-zinc-200 rounded-xl overflow-hidden ${className}`}>
    {(title || subtitle || action) && (
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div>
          {title && <h3 className="font-semibold text-zinc-900">{title}</h3>}
          {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

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
}: {
  nextTask?: typeof TASKS[0];
  upcomingTasks: typeof TASKS;
  completedCount: number;
  totalTasks: number;
  completedWPs: number;
  totalWPs: number;
  onJumpToTask: (taskId: string) => void;
}) => (
  <div className="space-y-6">
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">What&apos;s Next</p>
        <h1 className="text-3xl font-bold text-zinc-900 mt-1">Focus on one task. Finish the next deliverable.</h1>
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
          <button
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white px-4 py-2 text-sm font-bold hover:bg-zinc-800"
            onClick={() => onJumpToTask(nextTask.id)}
          >
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
        <h2 className="text-xl font-bold text-zinc-900">Upcoming tasks</h2>
        <p className="text-sm text-zinc-500">Next three items in your queue</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {upcomingTasks.slice(0, 3).map(task => (
          <div key={task.id} className="p-5 bg-white border border-zinc-200 rounded-3xl shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-3">{formatWpTitle(task.workPaperId)} · {PHASE_LABELS[task.phase]}</p>
            <h3 className="font-semibold text-zinc-900 mb-3 text-sm">{task.title}</h3>
            <p className="text-sm text-zinc-600 mb-4 line-clamp-3">{task.why}</p>
            <button
              onClick={() => onJumpToTask(task.id)}
              className="text-sm font-bold text-blue-700 hover:text-blue-900"
            >
              Open task
            </button>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const TaskQueueView = ({
  tasks,
  completedTasks,
  selectedTaskId,
  onToggleTask,
  onSelectTask,
  osType,
}: {
  tasks: typeof TASKS;
  completedTasks: string[];
  selectedTaskId: string | null;
  onToggleTask: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  osType: 'windows' | 'macos-linux';
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
      <div className="lg:col-span-1 space-y-6">
        <header className="lg:sticky lg:top-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Task queue</p>
          <h1 className="text-3xl font-bold text-zinc-900 mt-1">Complete tasks at your own pace.</h1>
          <p className="text-sm text-zinc-500 mt-3">Tap a task to see full details.</p>
        </header>
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {groups.map(([workPaperId, groupTasks]) => {
            const completedCount = groupTasks.filter(task => completedTasks.includes(task.id)).length;
            return (
              <Card
                key={workPaperId}
                title={formatWpTitle(workPaperId)}
                subtitle={`${completedCount}/${groupTasks.length} complete`}
                className="!p-3"
              >
                <div className="space-y-2">
                  {groupTasks.map(task => {
                    const isCompleted = completedTasks.includes(task.id);
                    const isSelected = selectedTaskId === task.id;
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onSelectTask(task.id)}
                        className={`w-full text-left p-3 rounded-lg border transition text-xs ${
                          isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-zinc-100 bg-white hover:border-blue-300'
                        }`}
                      >
                        <p className="text-[9px] uppercase text-zinc-400 mb-1">{PHASE_LABELS[task.phase]}</p>
                        <h4 className={`font-semibold line-clamp-2 ${isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
                          {task.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-2">{task.estimateMinutes} min</p>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedTask ? (
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
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Create evidence folders</p>
                  <code className="block bg-zinc-900 text-zinc-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {osType === 'windows' ? selectedTask.automationCommandWindows : selectedTask.automationCommandMacLinux}
                  </code>
                </div>
              )}

              {(selectedTask.commandWindows || selectedTask.commandMacLinux) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Command to run</p>
                    <span className="text-[9px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {osType === 'windows' ? 'Windows' : 'macOS / Linux'}
                    </span>
                  </div>
                  <code className="block bg-zinc-900 text-zinc-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {osType === 'windows' ? selectedTask.commandWindows : selectedTask.commandMacLinux}
                  </code>
                </div>
              )}

              {selectedTask.command && !selectedTask.commandWindows && !selectedTask.commandMacLinux && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Command to run</p>
                  <code className="block bg-zinc-900 text-zinc-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {selectedTask.command}
                  </code>
                </div>
              )}

              {(selectedTask.commandWindows || selectedTask.commandMacLinux || selectedTask.command) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} /> REPL Warning
                  </p>
                  <p className="text-xs text-amber-700">Run these commands in Terminal or PowerShell, NOT inside a Python REPL (prompt with &gt;&gt;&gt;).</p>
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
                className={`w-full rounded-full py-3 text-sm font-bold transition ${
                  isSelectedCompleted
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                }`}
              >
                {isSelectedCompleted ? '✓ Mark incomplete' : 'Mark complete'}
              </button>
            </div>
          </Card>
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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Reference</p>
        <h1 className="text-3xl font-bold text-zinc-900 mt-1">Tools, systems, and audit context.</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {([ 'orgs', 'suts', 'tools', 'frameworks' ] as ReferenceTab[]).map(item => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {item === 'orgs' ? 'Organizations' : item === 'suts' ? 'SUTs' : item === 'tools' ? 'Tools' : 'Frameworks'}
          </button>
        ))}
      </div>
    </header>

    {tab === 'orgs' && (
      <div className="grid gap-4 xl:grid-cols-3">
        {ORGANIZATIONS.map(org => (
          <Card key={org.id} title={org.name} subtitle={org.industry}>
            <div className="text-sm text-zinc-600 space-y-3">
              <p><strong>Size:</strong> {org.size}</p>
              <p><strong>Region:</strong> {org.geography}</p>
              <p><strong>Exposure:</strong> {org.regulatoryExposure.join(', ')}</p>
              <p>{org.context}</p>
            </div>
          </Card>
        ))}
      </div>
    )}

    {tab === 'suts' && (
      <div className="grid gap-4 xl:grid-cols-2">
        {SUTS.map(sut => (
          <Card key={sut.id} title={sut.name} subtitle={sut.type}>
            <div className="text-sm text-zinc-600 space-y-2">
              <p><strong>Org:</strong> {sut.org}</p>
              <p><strong>Risk tier:</strong> {sut.riskTier}</p>
              <p><strong>Primary test:</strong> {sut.primaryTest}</p>
              <p><strong>Build approach:</strong> {sut.buildApproach}</p>
            </div>
          </Card>
        ))}
      </div>
    )}

    {tab === 'tools' && (
      <div className="grid gap-4 xl:grid-cols-2">
        {TOOLS.map(tool => (
          <Card key={tool.name} title={tool.name} subtitle={tool.category}>
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
  grokKey,
  selectedTask,
  onActivity,
}: {
  grokKey: string;
  selectedTask?: typeof TASKS[0] | null;
  onActivity: () => void;
}) => {
  const [personaId, setPersonaId] = useState(NPC_PERSONAS[0]?.id || '');
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persona = NPC_PERSONAS.find(p => p.id === personaId) ?? NPC_PERSONAS[0];

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
      const response = await callGrok(promptParts.join(' '), userMessage, nextHistory);
      setHistory(prev => [...prev, { role: 'assistant', content: response }]);
      onActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to contact Grok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">NPC practice</p>
          <h1 className="text-3xl font-bold text-zinc-900 mt-1">Practice audit defense with Grok.</h1>
          <p className="text-sm text-zinc-500 max-w-2xl">Select a persona and ask for feedback on your memo, findings, or risk recommendations.</p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          <p className="font-semibold">Selected persona</p>
          <p>{persona.name}</p>
        </div>
      </header>

      {!grokKey ? (
        <Card title="Grok key required" subtitle="Enter your Grok API key in Settings to use this simulator.">
          <p className="text-sm text-zinc-600">NPC simulation requires a live xAI Grok API key. It is stored locally only.</p>
        </Card>
      ) : (
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
              <div className="text-sm text-zinc-600 space-y-2">
                <p><strong>Role:</strong> {persona.role}</p>
                <p><strong>Context:</strong> {persona.openingContext}</p>
                <p><strong>Pushback style:</strong> {persona.pushback}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card title="Conversation" subtitle="Send a prompt and get a realistic response.">
              <div className="space-y-4">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  rows={5}
                  placeholder="Ask for feedback on your audit memo, risk finding, or evidence summary."
                  className="w-full rounded-3xl border border-zinc-200 p-4 text-sm text-zinc-700 resize-none"
                />
                {error && <p className="text-sm text-rose-700">{error}</p>}
                <button
                  onClick={openChat}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Thinking…' : 'Send to Grok'}
                </button>
              </div>
            </Card>

            <Card title="Chat history" subtitle={selectedTask ? `Task: ${formatWpTitle(selectedTask.workPaperId)}` : 'No task selected'}>
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                {history.length === 0 ? (
                  <p className="text-sm text-zinc-500">No messages yet. Start by asking a question.</p>
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
      )}
    </div>
  );
};

const SettingsView = ({
  grokKey,
  setGrokKey,
  lastExport,
  onExportProgress,
  onImportProgress,
  onReset,
  osType,
  setOsType,
}: {
  grokKey: string;
  setGrokKey: (key: string) => void;
  lastExport: string | null;
  onExportProgress: () => void;
  onImportProgress: (e: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  osType: 'windows' | 'macos-linux';
  setOsType: (os: 'windows' | 'macos-linux') => void;
}) => (
  <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
      <p className="text-zinc-500 mt-1">Manage persistence, API access, and recovery options.</p>
    </header>

    <Card title="Operating System" subtitle="Select your platform for command syntax.">
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 mb-4">Commands will display with the correct syntax for your OS.</p>
        <div className="flex gap-3">
          {(['macos-linux', 'windows'] as const).map(os => (
            <button
              key={os}
              onClick={() => setOsType(os)}
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-bold transition border ${
                osType === os
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
              }`}
            >
              {os === 'macos-linux' ? 'macOS / Linux' : 'Windows'}
            </button>
          ))}
        </div>
      </div>
    </Card>

    <Card title="Grok API key" subtitle="Stored locally only.">
      <div className="space-y-3">
        <p className="text-sm text-zinc-600">Paste your xAI Grok API key to enable the NPC simulator.</p>
        <input
          type="password"
          value={grokKey}
          onChange={(e) => setGrokKey(e.target.value)}
          className="w-full rounded-3xl border border-zinc-200 bg-white px-4 py-3 text-sm"
          placeholder="Enter Grok API key"
        />
      </div>
    </Card>

    <Card title="Backup & restore" subtitle="Export your task progress and workpaper data.">
      <div className="space-y-4">
        <button
          onClick={onExportProgress}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-3 text-sm font-bold text-white hover:bg-zinc-800"
        >
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

// ============================================================
// APP
// ============================================================

export default function App() {
  const [currentView, setCurrentView] = useState<View>('now');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => localStorage.getItem('auditai-selected-task') || null);
  const [grokKey, setGrokKey] = useState(() => localStorage.getItem('auditai-grok-key') || localStorage.getItem('auditai-gemini-key') || '');
  const [activityDates, setActivityDates] = useState<string[]>(() => loadJsonArray('auditai-activity-dates'));
  const [lastExport, setLastExport] = useState<string | null>(() => localStorage.getItem('auditai-last-export'));
  const [referenceTab, setReferenceTab] = useState<ReferenceTab>('orgs');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [osType, setOsType] = useState<'windows' | 'macos-linux'>(() => {
    const saved = localStorage.getItem('auditai-os-type');
    return (saved as 'windows' | 'macos-linux') || 'macos-linux';
  });

  const [completedTasks, setCompletedTasks] = useState<string[]>(() => loadJsonArray('auditai-progress'));
  const [workpaperData, setWorkpaperData] = useState<Record<string, WorkPaperRecord>>(() => loadWorkpapers());

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
    if (grokKey) {
      localStorage.setItem('auditai-grok-key', grokKey);
    }
  }, [grokKey]);

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
      version: 1,
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
        if (data.version !== 1) {
          alert('Unsupported file version.');
          return;
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
    { view: 'now' as View, icon: LayoutDashboard, label: 'What&apos;s Next', badge: totalTasks - completedCount },
    { view: 'queue' as View, icon: ClipboardCheck, label: 'Task queue', badge: completedCount },
    { view: 'npc' as View, icon: Users, label: 'NPC practice' },
    { view: 'reference' as View, icon: BookOpen, label: 'Reference' },
  ];

  useEffect(() => {
    let firstKey: string | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutHelp(s => !s);
        return;
      }

      if (firstKey === 'g') {
        firstKey = null;
        if (resetTimer) clearTimeout(resetTimer);
        const map: Record<string, View> = { n: 'now', q: 'queue', p: 'npc', r: 'reference', s: 'settings' };
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
    <div className="flex h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white">
      <button
        onClick={() => setShowShortcutHelp(true)}
        className="md:hidden fixed top-3 right-3 z-30 bg-white border border-zinc-200 rounded-lg p-2 shadow-sm"
        aria-label="Open keyboard help"
      >
        <Keyboard size={18} />
      </button>

      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 bg-white border border-zinc-200 rounded-lg p-2 shadow-sm"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-30"
        />
      )}

      <aside className={`fixed md:static z-40 inset-y-0 left-0 w-60 border-r border-zinc-200 bg-white px-4 py-6 flex flex-col shrink-0 transition-transform duration-200 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <ShieldAlert size={20} className="fill-zinc-900 text-white" />
          <span className="font-bold tracking-tight text-lg text-zinc-900">AuditAI</span>
          <span className="text-[9px] font-bold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded ml-auto">RANGE</span>
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

        <div className="border-t border-zinc-100 pt-3 mt-3">
          <SidebarItem
            icon={Target}
            label="Settings"
            active={currentView === 'settings'}
            onClick={() => goTo('settings')}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-4 md:p-8 lg:p-10 pt-14 md:pt-8">
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
                />
              )}

              {currentView === 'reference' && (
                <ReferenceView tab={referenceTab} setTab={setReferenceTab} />
              )}

              {currentView === 'npc' && (
                <NpcSimView grokKey={grokKey} selectedTask={currentTask ?? nextTask ?? null} onActivity={trackActivity} />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  grokKey={grokKey}
                  setGrokKey={setGrokKey}
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
        </div>
      </main>

      <AnimatePresence>
        {showShortcutHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcutHelp(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
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
                  { keys: ['g', 'n'], label: 'Go to What&apos;s Next' },
                  { keys: ['g', 'q'], label: 'Go to Task queue' },
                  { keys: ['g', 'p'], label: 'Go to NPC practice' },
                  { keys: ['g', 'r'], label: 'Go to Reference' },
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
