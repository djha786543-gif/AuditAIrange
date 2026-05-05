/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, Fragment, type ChangeEvent } from 'react';
import {
  BarChart3,
  Building2,
  ChevronRight,
  ChevronDown,
  FileCheck2,
  LayoutDashboard,
  MessageSquare,
  ShieldAlert,
  CircleCheck,
  Clock,
  BookOpen,
  Boxes,
  Target,
  AlertTriangle,
  Activity,
  Landmark,
  Cloud,
  CheckCircle2,
  Circle,
  RefreshCw,
  XCircle,
  Send,
  Award,
  Users,
  Compass,
  Hammer,
  ClipboardCheck,
  Network,
  ArrowRight,
  ExternalLink,
  Crosshair,
  Shuffle,
  AlertCircle,
  Database,
  Gauge,
  Download,
  Menu,
  X,
  Save,
  Flame,
  Keyboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ORGANIZATIONS,
  SUTS,
  PHASES,
  TOOLS,
  SCENARIOS,
  RUBRIC_CRITERIA,
  RISK_RATING_METHODOLOGY,
  NPC_PERSONAS,
  PROGRAM_RISKS,
  WORKPAPER_DEFINITIONS,
  FRAMEWORK_CROSSWALK,
  SIMULATION_MISSIONS,
  ProgramPhase,
  NpcPersona,
  SimulationMission,
} from './constants';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================
// TYPES
// ============================================================

type View = 'dashboard' | 'guide' | 'drills' | 'reference' | 'workpapers' | 'npc-sim' | 'settings';
type WorkPaperStatus = 'not-started' | 'in-progress' | 'needs-revision' | 'complete';

interface WorkpaperCriterion {
  checked: boolean;
  evidence: string;
}

interface WorkPaperRecord {
  status: WorkPaperStatus;
  criteria: WorkpaperCriterion[];
  lastModified: string;
}

// ============================================================
// SHARED COMPONENTS
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
    'complete': { label: 'Complete', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md ${config.className}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
};

const RubricScore = ({ score, total = 10 }: { score: number; total?: number }) => {
  const pct = (score / total) * 100;
  const verdict = score >= 9 ? { label: 'PASS', color: 'text-emerald-600' } : score >= 7 ? { label: 'REVISE', color: 'text-amber-600' } : { label: 'REDO', color: 'text-rose-600' };
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${score >= 9 ? 'bg-emerald-500' : score >= 7 ? 'bg-amber-400' : 'bg-rose-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-zinc-600">{score}/{total}</span>
      {score > 0 && <span className={`text-[9px] font-bold ${verdict.color}`}>{verdict.label}</span>}
    </div>
  );
};

// ============================================================
// DASHBOARD VIEW
// ============================================================

const DashboardView = ({
  onSelectPhase,
  completedTasks,
  workpaperData,
  onNavigate,
  onOpenMission: _onOpenMission,
  lastExport,
  onExportProgress,
  onOpenNpcForWp,
  streak,
}: {
  onSelectPhase: (p: ProgramPhase) => void;
  completedTasks: string[];
  workpaperData: Record<string, WorkPaperRecord>;
  onNavigate: (v: View) => void;
  onOpenMission: (id: string) => void;
  lastExport: string | null;
  onExportProgress: () => void;
  onOpenNpcForWp: (wpId: string) => void;
  streak: number;
}) => {
  const completedWPs = Object.values(workpaperData).filter(d => d.status === 'complete').length;
  const totalCriteria = Object.values(workpaperData).reduce((acc, d) => acc + d.criteria.filter(c => c.checked).length, 0);
  const progressPct = Math.round((completedWPs / 16) * 100);
  const isNewUser = completedWPs === 0 && totalCriteria === 0 && completedTasks.length === 0;

  // Find the next active week — first WP that isn't complete
  const nextWP = WORKPAPER_DEFINITIONS.find(wp => workpaperData[wp.id]?.status !== 'complete') ?? WORKPAPER_DEFINITIONS[0];
  const nextPhase = PHASES.find(p => p.id === nextWP.phaseId);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900">
          Week {nextWP.week} of 16 — Phase {nextPhase?.id}: {nextPhase?.title}
        </h1>
        {streak > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded">
            <Flame size={12} /> {streak} day streak
          </span>
        )}
      </header>

      {/* New-user welcome / first-time orientation */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-start gap-4 flex-wrap">
            <div className="bg-white/10 rounded-xl p-3 shrink-0">
              <Compass size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">First time here?</p>
              <h3 className="text-xl font-bold mb-1.5">This portal tracks your 16-week AI audit program.</h3>
              <p className="text-sm text-blue-100 leading-relaxed mb-3 max-w-2xl">
                The actual audit work happens in your terminal and editor — this app keeps you oriented, grades your work papers, and lets you practice stakeholder pushback. Same 5-step loop every week.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { n: '1', label: 'Scope', desc: 'Open the week\'s scenario' },
                  { n: '2', label: 'Execute', desc: 'Run tools / write WP' },
                  { n: '3', label: 'Grade', desc: 'Score against rubric' },
                  { n: '4', label: 'Defend', desc: 'NPC pushback' },
                  { n: '5', label: 'Map', desc: 'Cite frameworks' },
                ].map((s, idx) => (
                  <div key={s.n} className="flex items-center gap-2">
                    <div className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-200">{s.n}</span>
                      <span className="text-xs font-bold">{s.label}</span>
                      <span className="text-[10px] text-blue-200 hidden md:inline">— {s.desc}</span>
                    </div>
                    {idx < 4 && <ArrowRight size={12} className="text-blue-300 hidden md:block" />}
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('guide')}
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
              >
                Read the full guide <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Backup reminder */}
      {(() => {
        const now = new Date();
        const last = lastExport ? new Date(lastExport) : null;
        const daysSince = last ? Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) : null;
        const shouldRemind = !last || daysSince >= 14;
        return shouldRemind ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-amber-900">Backup your progress</p>
              <p className="text-xs text-amber-700">Last export: {last ? `${daysSince} days ago` : 'never'}</p>
            </div>
            <button
              onClick={onExportProgress}
              className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm font-bold hover:bg-amber-700 transition-colors"
            >
              Export Now
            </button>
          </div>
        ) : null;
      })()}

      {/* Next-up action panel — always shown for orientation */}
      {!isNewUser && (
        <div className="bg-white border-2 border-zinc-900 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
          <div className="bg-zinc-900 text-white rounded-xl px-4 py-3 shrink-0 self-start">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Next Up</p>
            <p className="text-2xl font-bold leading-none mt-1">WP{nextWP.number.toString().padStart(2, '0')}</p>
            <p className="text-[10px] text-zinc-400 mt-1">Week {nextWP.week}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Phase {nextPhase?.id} · {nextPhase?.title}</p>
            <p className="font-bold text-zinc-900 leading-snug">{nextWP.title}</p>
            <p className="text-xs text-zinc-500 mt-1">Anchor: {nextWP.anchor} · Status: {workpaperData[nextWP.id]?.status?.replace(/-/g, ' ') ?? 'not started'}</p>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <button
              onClick={() => nextPhase && onSelectPhase(nextPhase)}
              className="bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              Open scenario <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigate('workpapers')}
              className="bg-zinc-100 text-zinc-700 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors"
            >
              Grade WP
            </button>
            <button
              onClick={() => onOpenNpcForWp(nextWP.id)}
              className="bg-purple-100 text-purple-700 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-purple-200 transition-colors"
            >
              Open NPC
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Program Progress</span>
          <span className="text-sm font-bold text-zinc-900">{progressPct}%</span>
        </div>
        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-zinc-900 rounded-full"
          />
        </div>
      </div>

      <details className="group bg-white border border-zinc-200 rounded-xl">
        <summary className="cursor-pointer list-none px-5 py-3 flex items-center justify-between hover:bg-zinc-50 rounded-xl">
          <span className="font-bold text-zinc-900 text-sm">Phase map</span>
          <ChevronDown size={14} className="text-zinc-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5">
        <Card title="Program Master Timeline" className="!bg-zinc-900 !border-zinc-800 text-white">
          <div className="relative pt-2 pb-6">
            <div className="absolute top-7 left-0 right-0 h-0.5 bg-zinc-800 rounded-full" />
            <div className="flex justify-between relative">
              {PHASES.map(phase => {
                const done = WORKPAPER_DEFINITIONS
                  .filter(wp => wp.phaseId === phase.id)
                  .every(wp => workpaperData[wp.id]?.status === 'complete');
                const inProgress = WORKPAPER_DEFINITIONS
                  .filter(wp => wp.phaseId === phase.id)
                  .some(wp => workpaperData[wp.id]?.status === 'in-progress' || workpaperData[wp.id]?.status === 'complete');
                return (
                  <div key={phase.id} className="flex flex-col items-center cursor-pointer group" onClick={() => onSelectPhase(phase)}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-zinc-900 z-10 transition-all ${
                      done ? 'bg-emerald-500' : inProgress ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-zinc-800 group-hover:bg-zinc-700'
                    }`}>
                      {done ? <CheckCircle2 size={16} className="text-white" /> : <span className="text-[10px] font-bold text-white">{phase.id}</span>}
                    </div>
                    <p className={`text-[9px] font-bold uppercase mt-1.5 ${done ? 'text-emerald-400' : inProgress ? 'text-white' : 'text-zinc-600'}`}>PH {phase.id}</p>
                    <p className="text-[8px] text-zinc-700 font-mono">WK {phase.weeks}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[9px] text-zinc-600 font-mono uppercase tracking-widest border-t border-zinc-800 pt-3">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Complete</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" /> Pending</span>
          </div>
        </Card>
        </div>
      </details>

      <details className="group bg-white border border-zinc-200 rounded-xl">
        <summary className="cursor-pointer list-none px-5 py-3 flex items-center justify-between hover:bg-zinc-50 rounded-xl">
          <span className="font-bold text-zinc-900 text-sm">AIRTP+ tracker</span>
          <ChevronDown size={14} className="text-zinc-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5">
          <Card className="!bg-amber-50 !border-amber-200">
            <div className="flex flex-col items-center text-center space-y-3 h-full justify-center py-4">
              <Award className="text-amber-500" size={32} />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">AIRTP+ Exam</h4>
                <p className="text-[10px] text-amber-600 mt-0.5">Target: Week 6 Friday</p>
              </div>
              <div className="w-full">
                <div className="w-full bg-amber-200 h-1.5 rounded-full">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min((completedWPs / 6) * 100, 100)}%` }} />
                </div>
                <p className="text-[9px] font-bold text-amber-800 mt-1 uppercase tracking-tighter">
                  Phase 2 Readiness: {Math.min(Math.round((completedWPs / 6) * 100), 100)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      </details>

      <details className="group bg-white border border-zinc-200 rounded-xl">
        <summary className="cursor-pointer list-none px-5 py-3 flex items-center justify-between hover:bg-zinc-50 rounded-xl">
          <span className="font-bold text-zinc-900 text-sm">Top program risks</span>
          <ChevronDown size={14} className="text-zinc-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 space-y-2">
          {PROGRAM_RISKS.filter(r => r.impact === 'High').map(risk => (
            <div key={risk.id} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <span className={`text-[10px] font-bold mt-0.5 px-1.5 py-0.5 rounded ${
                risk.likelihood === 'High' ? 'bg-rose-100 text-rose-700' :
                risk.likelihood === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>{risk.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 leading-snug">{risk.risk}</p>
                <p className="text-[10px] text-zinc-500 mt-1 leading-snug">{risk.mitigation}</p>
              </div>
              <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                risk.likelihood === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
              }`}>{risk.likelihood}</span>
            </div>
          ))}
        </div>
      </details>

      <details className="group bg-white border border-zinc-200 rounded-xl">
        <summary className="cursor-pointer list-none px-5 py-3 flex items-center justify-between hover:bg-zinc-50 rounded-xl">
          <span className="font-bold text-zinc-900 text-sm">Phase cards</span>
          <ChevronDown size={14} className="text-zinc-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PHASES.map(phase => {
            const phaseWPs = WORKPAPER_DEFINITIONS.filter(wp => wp.phaseId === phase.id);
            const doneCount = phaseWPs.filter(wp => workpaperData[wp.id]?.status === 'complete').length;
            return (
              <motion.div key={phase.id} whileHover={{ y: -4 }} onClick={() => onSelectPhase(phase)} className="cursor-pointer group">
                <Card className="h-full border-zinc-200 group-hover:border-zinc-900 group-hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-md uppercase tracking-wider">Phase {phase.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-mono">{doneCount}/{phaseWPs.length}</span>
                      <div className="flex items-center gap-0.5">
                        {phaseWPs.map(wp => (
                          <div key={wp.id} className={`w-1.5 h-1.5 rounded-full ${
                            workpaperData[wp.id]?.status === 'complete' ? 'bg-emerald-500' :
                            workpaperData[wp.id]?.status === 'in-progress' ? 'bg-blue-400' : 'bg-zinc-200'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <h4 className="text-base font-bold mb-1.5 text-zinc-900 group-hover:text-blue-600 transition-colors leading-tight">{phase.title}</h4>
                  <p className="text-xs text-zinc-400 mb-1 font-mono">{phase.hours} hrs · Wks {phase.weeks} · {phase.anchor}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-4 leading-relaxed">{phase.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.deliverables.slice(0, 3).map(d => (
                      <span key={d} className="text-[9px] bg-zinc-50 border border-zinc-100 px-2 py-1 rounded-md text-zinc-500">{d}</span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </details>
    </div>
  );
};

// ============================================================
// HELPER: Get stakeholder pushback quote
// ============================================================

const getStakeholderPushback = (missionId: string): string => {
  switch (missionId) {
    case 'm-bank-hallucination':
      return 'The 0.84 score is acceptable. We\'ve added a disclaimer. You\'re being too rigorous — most ML systems don\'t hit 90%.';
    case 'm-clinical-rag-injection':
      return 'These prompt injection tests are theoretical. Real users won\'t be adversarial. Let\'s ship and monitor.';
    case 'm-multitenant-rag-exfil':
      return 'Our architecture isolates tenants at the application layer. Database-level breaches aren\'t in scope.';
    case 'm-hr-bias-sweep':
      return 'The disparate impact is within margin of error. We\'ve used the same process for 3 years.';
    default:
      return 'This is too conservative. Our customers expect faster innovation.';
  }
};

const getOrgIdFromAnchor = (anchor: string): 'helix' | 'stellar' | 'nimbus' => {
  const normalized = anchor.toLowerCase();
  if (normalized.includes('helix')) return 'helix';
  if (normalized.includes('stellar')) return 'stellar';
  if (normalized.includes('nimbus')) return 'nimbus';
  return 'stellar';
};

const getDefaultPersonaForAnchor = (anchor: string): NpcPersona => {
  const orgId = getOrgIdFromAnchor(anchor);
  return NPC_PERSONAS.find(p => p.orgId === orgId) ?? NPC_PERSONAS[0];
};

const inferFindingTypeForWorkpaper = (wp: { id: string; number: number; title: string; frameworks: string[]; anchor: string; type: string }) => {
  const map: Record<number, string> = {
    3: 'Prompt Injection',
    7: 'Bias / Disparate Impact',
    9: 'Data Exfiltration',
    12: 'Model Validation',
    15: 'Governance & Controls',
  };
  return map[wp.number] || wp.title.split(' ').slice(0, 3).join(' ');
};

const getNpcExchangeCount = (wpId: string) => {
  try {
    const entries = JSON.parse(localStorage.getItem(`auditai-npc-log-${wpId}`) || '[]');
    return Array.isArray(entries) ? entries.length : 0;
  } catch {
    return 0;
  }
};

const saveNpcExchangeForWp = (wpId: string, userMessage: string, aiResponse: string) => {
  const key = `auditai-npc-log-${wpId}`;
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const entries = Array.isArray(existing) ? existing : [];
    entries.push({
      timestamp: new Date().toISOString(),
      user: userMessage,
      ai: aiResponse,
    });
    localStorage.setItem(key, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
};


// ============================================================
// MISSION MODE VIEW
// ============================================================

const MissionModeView = ({
  currentMissionId,
  onSelectMission,
}: {
  currentMissionId: string | null;
  onSelectMission: (id: string) => void;
}) => {
  const [showEvidenceChecklist, setShowEvidenceChecklist] = useState(false);
  const mission = currentMissionId ? SIMULATION_MISSIONS.find(m => m.id === currentMissionId) : null;

  const sampleEvidenceFilename = mission?.id === 'm-bank-hallucination'
    ? 'deepeval-hallucination-report.json'
    : mission?.id === 'm-clinical-rag-injection'
      ? 'garak-phi-injection-results.csv'
      : mission?.id === 'm-hr-bias-sweep'
        ? 'aequitas-bias-report.csv'
        : 'deepeval-hallucination-report.json';

  const sampleEvidenceHref = `${(import.meta as any).env.BASE_URL}sample-evidence/${sampleEvidenceFilename}`;

  const downloadSampleEvidence = async () => {
    if (!mission) return;

    try {
      const response = await fetch(sampleEvidenceHref);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = sampleEvidenceFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please check the console for details.');
    }
  };

  if (!mission) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-zinc-900">Drills</h1>
          <p className="text-zinc-500 mt-1">Focused practice exercises — each scoped to one finding type, tool, and NPC.</p>
        </header>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 leading-relaxed">
          Drills are focused practice exercises — each one mirrors a single phase scenario but is scoped to one finding type, one tool, one NPC. Use them to warm up before the real WP, or to revisit techniques later. <strong>Drills do not advance program progress.</strong>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SIMULATION_MISSIONS.map(m => (
            <Card key={m.id} className="cursor-pointer hover:border-zinc-900 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">{m.title}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">SUT {m.sutId} · {m.primaryFramework}</p>
                </div>
                <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded shrink-0">{m.findingType}</span>
              </div>
              <p className="text-xs text-zinc-600 line-clamp-3 mb-4 leading-relaxed">{m.scenario}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded">{m.toolName}</span>
                <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded">{NPC_PERSONAS.find(n => n.id === m.npcId)?.name}</span>
              </div>
              <button
                onClick={() => onSelectMission(m.id)}
                className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                Launch <Crosshair size={14} />
              </button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const linkedWP = WORKPAPER_DEFINITIONS.find(w => w.id === mission.workPaperId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectMission('')}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors text-sm font-medium"
          >
            <ChevronRight className="rotate-180" size={16} /> Back to Drills
          </button>
          <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded">DRILL</span>
        </div>
        <span className="text-sm font-bold text-zinc-600">{mission.id}</span>
      </div>

      {linkedWP && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-start gap-3">
          <FileCheck2 size={16} className="text-zinc-500 shrink-0 mt-0.5" />
          <p className="text-sm text-zinc-700 leading-snug">
            <strong>Linked Work Paper:</strong> This drill mirrors WP{linkedWP.number.toString().padStart(2, '0')} — {linkedWP.title}. Practice here, then execute the full scenario in the Phase view.
          </p>
        </div>
      )}

      <Card title={mission.title} className="!border-2 !border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Scenario</p>
            <p className="text-sm text-zinc-700 leading-relaxed italic border-l-2 border-zinc-200 pl-4">{mission.scenario}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">SUT & Framework</p>
            <p className="text-sm text-zinc-700 mb-2">
              <strong>SUT {mission.sutId}:</strong> {SUTS.find(s => s.id === mission.sutId)?.name}
            </p>
            <p className="text-sm text-zinc-700">
              <strong>Framework:</strong> {mission.primaryFramework}
            </p>
            <p className="text-[10px] text-zinc-500 mt-2 font-mono">{mission.primaryControl}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Audit Assets</p>
            <div className="space-y-2 text-sm text-zinc-700">
              <p><strong>Tool:</strong> {mission.toolName}</p>
              <p><strong>Stakeholder:</strong> {NPC_PERSONAS.find(n => n.id === mission.npcId)?.name}</p>
              <p><strong>Work Paper:</strong> {WORKPAPER_DEFINITIONS.find(w => w.id === mission.workPaperId)?.title}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-200 pt-6 mt-6">
          <div>
            <h4 className="font-bold text-zinc-900 mb-3 text-sm">5-Step Execution Recipe</h4>
            <ol className="space-y-2">
              {mission.recipe.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded shrink-0">{idx + 1}</span>
                  <span className="text-xs text-zinc-600 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2 text-sm flex items-center gap-2">
                <AlertCircle size={14} /> Reality Check
              </h4>
              <p className="text-xs text-blue-700 leading-relaxed">{mission.realityCheck}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-bold text-amber-900 mb-2 text-sm flex items-center gap-2">
                <Gauge size={14} /> Threshold Guidance
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">{mission.thresholdGuidance}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Terminal Command Section */}
      <Card title="Get Started Right Now" subtitle="No setup required — copy/paste this command">
        <div className="bg-zinc-900 text-lime-400 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
          <p className="text-[10px] text-zinc-500 mb-2">$ Run this in your terminal:</p>
          <p className="whitespace-nowrap">
            {mission.id === 'm-bank-hallucination'
              ? 'pip install deepeval && deepeval test run --model gpt-4 --cases 200 --dataset banking_fees.json'
              : mission.id === 'm-clinical-rag-injection'
              ? 'docker pull ghcr.io/leondz/garak:latest && garak -m ollama.OllamaChat -p promptinject,dan,glitch'
              : mission.id === 'm-multitenant-rag-exfil'
              ? 'python -m pyrit orchestrator --config multi_tenant_exfil.yaml --target-count 100'
              : mission.id === 'm-hr-bias-sweep'
              ? 'pip install aequitas && aequitas audit --predictions talentmatch_output.csv --fairness-threshold 0.80'
              : 'echo "Command varies by mission"'}
          </p>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">This downloads the tool and runs a sample dataset. Your 5-step recipe maps directly to the tool's workflow.</p>
      </Card>

      {/* Stakeholder Pushback Section */}
      <Card title="Expect Pushback" subtitle="Realistic stakeholder resistance — practice your defense">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-[10px] font-bold text-red-700 uppercase mb-2">📧 {NPC_PERSONAS.find(n => n.id === mission.npcId)?.name}</p>
            <p className="text-sm text-red-900 italic leading-relaxed">
              {mission.id === 'm-bank-hallucination'
                ? '"The 0.84 score is acceptable. We\'ve added a disclaimer. You\'re being too rigorous — most ML systems don\'t hit 90%."'
                : mission.id === 'm-clinical-rag-injection'
                ? '"These prompt injection tests are theoretical. Real users won\'t be adversarial. Let\'s ship and monitor."'
                : mission.id === 'm-multitenant-rag-exfil'
                ? '"Our architecture isolates tenants at the application layer. Database-level breaches aren\'t in scope."'
                : mission.id === 'm-hr-bias-sweep'
                ? '"The disparate impact is within margin of error. We\'ve used the same process for 3 years."'
                : '"This is too conservative. Our customers expect faster innovation."'}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-[10px] font-bold text-green-700 uppercase mb-2">✓ Your Counter (Practice Here):</p>
            <p className="text-sm text-green-900 leading-relaxed">
              Open the NPC Pushback Simulator below. Copy/paste the stakeholder objection and practice your rebuttal. Reference:
              <br /> • Framework citations (from your findings)
              <br /> • Business impact (financials, legal exposure)
              <br /> • Risk register entry (from program settings)
            </p>
          </div>
        </div>
      </Card>

      {/* Threshold Consequences */}
      <Card title="The Threshold Decision: What Gets You Fired?" subtitle="Real consequences of launch vs. remediation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-4">
            <h5 className="font-bold text-rose-900 mb-3 flex items-center gap-2">
              <XCircle size={16} /> Launch with Current Score
            </h5>
            <ul className="space-y-2 text-sm text-rose-800">
              <li>✗ 50% chance of triggering regulator inquiry within 18 months</li>
              <li>✗ Discovery of known failures weakens legal defense</li>
              <li>✗ Customer lawsuits reference your own audit report</li>
              <li>✗ Board memo gets presented: "You knew and shipped anyway"</li>
              <li>✗ <strong>Career impact:</strong> Audit credibility destroyed</li>
            </ul>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4">
            <h5 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} /> Block & Remediate
            </h5>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li>✓ You hold the line; stakeholder retrains model</li>
              <li>✓ Retest in 4 weeks; score improves to 0.92</li>
              <li>✓ Launch happens, but with audit trail showing rigor</li>
              <li>✓ 4-week delay is a feature, not a bug</li>
              <li>✓ <strong>Career impact:</strong> "The auditor saved us"</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={() => onSelectMission('')}
          className="px-6 py-2.5 border border-zinc-200 text-zinc-700 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-colors"
        >
          Back to Missions
        </button>
        <button
          onClick={() => setShowEvidenceChecklist(true)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Evidence Checklist <CheckCircle2 size={14} />
        </button>
      </div>

      {/* Evidence Checklist Modal */}
      <AnimatePresence>
        {showEvidenceChecklist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEvidenceChecklist(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900 mb-1">{mission?.title}</h3>
                    <p className="text-sm text-zinc-500">Evidence artifacts required for this simulation</p>
                  </div>
                  <button
                    onClick={() => setShowEvidenceChecklist(false)}
                    className="text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                {/* Download Sample Evidence */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-purple-900 mb-2 text-sm flex items-center gap-2">
                    <Download size={14} /> Start with Real Messy Data
                  </h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Don't start from scratch. Download an actual (anonymized) failed tool output to practice failure analysis:
                  </p>
                  <button
                    onClick={downloadSampleEvidence}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                  >
                    <Download size={14} /> Download Sample Evidence
                  </button>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                  <h4 className="font-bold text-zinc-900 mb-3 text-sm">What to capture:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3 text-sm text-zinc-700">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <span><strong>Tool Output Logs:</strong> Full terminal output or exported results from {mission?.toolName}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-700">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <span><strong>Screenshots of Findings:</strong> Visual evidence of vulnerabilities discovered in SUT {mission?.sutId}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-700">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <span><strong>Proof-of-Concept Scripts:</strong> Reproducible steps or code to trigger the {mission?.findingType}</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-700">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <span><strong>Data Exports:</strong> CSV/JSON from tool runs (impact analysis, bias metrics, risk scores)</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-zinc-700">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <span><strong>Threshold Justification:</strong> Document your risk rating decision vs. the pre-set threshold</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-bold text-amber-900 mb-2 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} /> Critical: Store ALL Evidence Artifacts
                  </h4>
                  <p className="text-sm text-amber-800">
                    Save screenshots, logs, and exports to your <code className="bg-white px-2 py-1 rounded font-mono text-xs">07_evidence/</code> folder organized by mission ID. When you grade this work paper, reference the actual outputs you collected — not hypothetical findings.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} /> Next Steps
                  </h4>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>Follow the 5-step recipe</li>
                    <li>Capture all evidence artifacts</li>
                    <li>Draft work paper {mission?.workPaperId} with evidence citations</li>
                    <li>Self-score against the ISACA rubric</li>
                    <li>Practice defense with NPC Pushback Simulator</li>
                  </ol>
                </div>

                <button
                  onClick={() => setShowEvidenceChecklist(false)}
                  className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors"
                >
                  Close & Start Execution
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// ORGS VIEW
// ============================================================

const OrgsView = () => (
  <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-bold text-zinc-900">Anchor Organizations</h1>
      <p className="text-zinc-500 mt-1">Three fictional enterprises — each with ~40 evidence documents and distinct regulatory contexts.</p>
    </header>
    <div className="space-y-6">
      {ORGANIZATIONS.map(org => (
        <Card key={org.id} title={org.name} subtitle={org.industry}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Audit Context</h5>
              <p className="text-sm text-zinc-700 leading-relaxed italic border-l-2 border-zinc-200 pl-4">"{org.context}"</p>
            </div>
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Footprint</h5>
              <div className="space-y-2">
                {[['SIZE', org.size], ['GEO', org.geography]].map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2 text-sm text-zinc-600">
                    <span className="text-[9px] font-mono bg-zinc-100 px-1.5 py-0.5 rounded mt-0.5 shrink-0">{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Frameworks</p>
                <div className="flex flex-wrap gap-1">
                  {org.frameworks.map(f => (
                    <span key={f} className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Regulatory Exposure</h5>
              <div className="flex flex-wrap gap-2">
                {org.regulatoryExposure.map(reg => (
                  <span key={reg} className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">{reg}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================
// SUTS VIEW
// ============================================================

const SutsView = ({ onOpenMission }: { onOpenMission: (id: string) => void }) => {
  const [orgFilter, setOrgFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<number | null>(null);
  const filtered = orgFilter === 'All' ? SUTS : orgFilter === 'High-Risk' ? SUTS.filter(s => s.riskTier.includes('High')) : SUTS.filter(s => s.org === orgFilter);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900">SUT Inventory</h1>
        <p className="text-zinc-500 mt-1">10 deliberately vulnerable AI systems — the technical backbone of the program.</p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {['All', 'Helix', 'Stellar', 'Nimbus', 'High-Risk'].map(f => (
          <button
            key={f}
            onClick={() => setOrgFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              orgFilter === f ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        <div className="space-y-1">
          {filtered.map(sut => (
            <div key={sut.id} className="border border-zinc-100 rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                onClick={() => setExpanded(expanded === sut.id ? null : sut.id)}
              >
                <span className="font-mono text-xs text-zinc-400 w-6 shrink-0">{sut.id}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-zinc-900">{sut.name}</span>
                  <span className="text-xs text-zinc-400 ml-2">{sut.type}</span>
                </div>
                <span className="hidden sm:inline-block text-xs bg-zinc-100 px-2 py-0.5 rounded font-medium text-zinc-600 shrink-0">{sut.org}</span>
                <span className={`hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                  sut.riskTier.includes('High') ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                }`}>{sut.riskTier}</span>
                <ChevronDown size={14} className={`text-zinc-400 shrink-0 transition-transform ${expanded === sut.id ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {expanded === sut.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-3 bg-zinc-50 border-t border-zinc-100 space-y-3">
                      <div className="flex sm:hidden flex-wrap gap-2">
                        <span className="text-xs bg-white border border-zinc-200 px-2 py-0.5 rounded font-medium text-zinc-600">{sut.org}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          sut.riskTier.includes('High') ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-zinc-200 text-zinc-500'
                        }`}>{sut.riskTier}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Primary Test</p>
                        <p className="text-sm text-zinc-700 font-mono">{sut.primaryTest}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Build Approach</p>
                        <p className="text-sm text-zinc-700">{sut.buildApproach}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Primary Phase</p>
                        <p className="text-sm text-zinc-700">Phase {sut.primaryPhase} — {PHASES.find(p => p.id === sut.primaryPhase)?.title}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        {SIMULATION_MISSIONS.filter(m => m.sutId === sut.id).length > 0 ? (
                          <button
                            onClick={() => onOpenMission(SIMULATION_MISSIONS.find(m => m.sutId === sut.id)?.id || '')}
                            className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Crosshair size={12} /> Drill
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-400 text-center">No drills available</span>
                        )}
                      </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// WORKPAPERS VIEW
// ============================================================

const WorkpapersView = ({
  workpaperData,
  onUpdateStatus,
  onUpdateCriterion,
  onOpenNpcForWp,
}: {
  workpaperData: Record<string, WorkPaperRecord>;
  onUpdateStatus: (id: string, status: WorkPaperStatus) => void;
  onUpdateCriterion: (id: string, idx: number, checked: boolean, evidence?: string) => void;
  onOpenNpcForWp: (id: string) => void;
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState<Record<string, boolean>>({});

  const blankCriteria = (): WorkpaperCriterion[] =>
    Array.from({ length: 10 }, () => ({ checked: false, evidence: '' }));

  const getRecord = (id: string): WorkPaperRecord =>
    workpaperData[id] ?? { status: 'not-started', criteria: blankCriteria(), lastModified: new Date().toISOString() };

  const totalComplete = Object.values(workpaperData).filter(d => d.status === 'complete').length;
  const totalCriteria = Object.values(workpaperData).reduce((acc, d) => acc + d.criteria.filter(c => c.checked).length, 0);
  const avgScore = Object.keys(workpaperData).length > 0
    ? Math.round(Object.values(workpaperData).reduce((a, d) => a + d.criteria.filter(c => c.checked).length, 0) / Math.max(Object.keys(workpaperData).length, 1) * 10) / 10
    : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900">Work Paper Tracker</h1>
        <p className="text-zinc-500 mt-1">ISACA-aligned self-assessment for all 15 work papers + capstone. Score each against the 10-criterion rubric.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Complete', value: totalComplete, sub: 'of 16', color: 'text-emerald-600' },
          { label: 'In Progress', value: Object.values(workpaperData).filter(d => d.status === 'in-progress').length, sub: 'active', color: 'text-blue-600' },
          { label: 'Needs Revision', value: Object.values(workpaperData).filter(d => d.status === 'needs-revision').length, sub: 'to address', color: 'text-amber-600' },
          { label: 'Avg Rubric Score', value: `${avgScore}/10`, sub: 'across graded WPs', color: 'text-zinc-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">{stat.label}</p>
            <p className="text-[9px] text-zinc-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* WPs grouped by phase */}
      {PHASES.map(phase => {
        const phaseWPs = WORKPAPER_DEFINITIONS.filter(wp => wp.phaseId === phase.id);
        return (
          <div key={phase.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-1 rounded">PHASE {phase.id}</span>
              <h3 className="font-bold text-zinc-700">{phase.title}</h3>
              <span className="text-xs text-zinc-400">Weeks {phase.weeks}</span>
            </div>

            {phaseWPs.map(wp => {
              const record = getRecord(wp.id);
              const score = record.criteria.filter(c => c.checked).length;
              const isExpanded = expandedId === wp.id;
              const npcCount = getNpcExchangeCount(wp.id);
              const editedAgo = record.lastModified ? formatRelativeDay(record.lastModified) : null;
              const isSummaryOpen = !!summaryOpen[wp.id];

              return (
                <div key={wp.id} className={`border rounded-xl overflow-hidden transition-all ${
                  isExpanded ? 'border-zinc-900 shadow-md' : 'border-zinc-200'
                } ${wp.type === 'capstone' ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>

                  {/* Header row */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : wp.id)}
                  >
                    <span className={`text-[10px] font-bold font-mono shrink-0 w-8 ${wp.type === 'capstone' ? 'text-amber-600' : 'text-zinc-400'}`}>
                      WP{wp.number.toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-900 leading-snug">{wp.title}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Week {wp.week} · {wp.anchor}
                        {editedAgo && <> · Edited {editedAgo}</>}
                        {npcCount > 0 && <> · {npcCount} NPC exchange{npcCount === 1 ? '' : 's'} saved</>}
                      </p>
                    </div>
                    <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
                      {wp.frameworks.slice(0, 2).map(f => (
                        <span key={f} className="text-[8px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                    <StatusBadge status={record.status} />
                    <RubricScore score={score} />
                    <ChevronDown size={14} className={`text-zinc-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Expanded rubric */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0 border-t border-zinc-100 space-y-5">
                          {/* Status selector */}
                          <div className="flex items-center gap-2 pt-4">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-2">Status</span>
                            {(['not-started', 'in-progress', 'needs-revision', 'complete'] as WorkPaperStatus[]).map(s => (
                              <button
                                key={s}
                                onClick={() => onUpdateStatus(wp.id, s)}
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-all ${
                                  record.status === s
                                    ? s === 'complete' ? 'bg-emerald-600 text-white' :
                                      s === 'in-progress' ? 'bg-blue-600 text-white' :
                                      s === 'needs-revision' ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-white'
                                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                }`}
                              >
                                {s.replace(/-/g, ' ')}
                              </button>
                            ))}
                          </div>

                          {/* Rubric criteria */}
                          <div>
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ISACA Rubric — {score}/10 criteria met</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {score >= 9 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">PASS THRESHOLD</span>}
                                {score >= 7 && score < 9 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">REVISE</span>}
                                {score > 0 && score < 7 && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">REDO</span>}
                                <button
                                  onClick={() => setSummaryOpen(prev => ({ ...prev, [wp.id]: !prev[wp.id] }))}
                                  className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 underline"
                                >
                                  {isSummaryOpen ? 'Hide evidence summary' : 'Show evidence summary'}
                                </button>
                                <button
                                  onClick={() => onOpenNpcForWp(wp.id)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 px-2 py-1 rounded"
                                >
                                  <MessageSquare size={10} /> Open NPC for this WP
                                </button>
                              </div>
                            </div>

                            {isSummaryOpen ? (
                              <div className="space-y-1.5">
                                {RUBRIC_CRITERIA.map((criterion, idx) => {
                                  const c = record.criteria[idx] ?? { checked: false, evidence: '' };
                                  return (
                                    <div key={idx} className="flex items-start gap-3 px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-md text-xs">
                                      <span className={`shrink-0 w-4 h-4 rounded-full mt-0.5 flex items-center justify-center ${c.checked ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-400'}`}>
                                        <CheckCircle2 size={10} />
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-zinc-700 leading-snug">{criterion}</p>
                                        <p className="text-zinc-500 font-mono text-[10px] mt-1 truncate">
                                          {c.evidence || <span className="italic text-zinc-300">no evidence noted</span>}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {RUBRIC_CRITERIA.map((criterion, idx) => {
                                  const c = record.criteria[idx] ?? { checked: false, evidence: '' };
                                  return (
                                    <div
                                      key={idx}
                                      className={`flex flex-col gap-2 p-3 rounded-lg transition-all border ${
                                        c.checked ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-100'
                                      }`}
                                    >
                                      <div
                                        onClick={() => onUpdateCriterion(wp.id, idx, !c.checked)}
                                        className="flex items-start gap-3 cursor-pointer"
                                      >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                          c.checked ? 'bg-emerald-500' : 'border-2 border-zinc-300'
                                        }`}>
                                          {c.checked && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                        <span className="text-xs text-zinc-700 leading-snug">{criterion}</span>
                                      </div>
                                      <input
                                        type="text"
                                        value={c.evidence}
                                        onChange={e => onUpdateCriterion(wp.id, idx, c.checked, e.target.value)}
                                        placeholder="Evidence path or note (e.g. 07_evidence/wp03/garak-run-2026-05-04.json)"
                                        className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-[11px] font-mono text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Frameworks */}
                          {wp.frameworks.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Framework Mapping</p>
                              <div className="flex flex-wrap gap-2">
                                {wp.frameworks.map(f => (
                                  <span key={f} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-medium">{f}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// FRAMEWORKS VIEW
// ============================================================

const FrameworksView = () => (
  <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-bold text-zinc-900">Framework Crosswalk Layer</h1>
      <p className="text-zinc-500 mt-1">Pre-built mapping: every finding type to every applicable regulatory framework.</p>
    </header>

    {/* Full 8×7 crosswalk */}
    <Card title="Master Crosswalk Matrix" subtitle="8 finding types × 7 regulatory frameworks">
      <div className="overflow-x-auto -mx-6 -mb-6">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-zinc-900 text-white">
            <tr>
              {['Finding Type', 'NIST AI RMF', 'ISO 42001', 'EU AI Act', 'SR 11-7', 'NYC LL 144', 'HIPAA', 'OWASP LLM'].map(h => (
                <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {FRAMEWORK_CROSSWALK.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-4 py-3.5 font-bold text-zinc-900 text-sm whitespace-nowrap">{row.findingType}</td>
                <td className="px-4 py-3.5 text-xs font-mono text-zinc-600">{row.nistAiRmf}</td>
                <td className="px-4 py-3.5 text-xs font-mono text-zinc-600">{row.iso42001}</td>
                <td className="px-4 py-3.5 text-xs font-mono text-zinc-600">{row.euAiAct}</td>
                <td className="px-4 py-3.5 text-xs font-mono text-zinc-600">{row.sr117}</td>
                <td className="px-4 py-3.5 text-xs font-mono text-zinc-600">{row.nycLl144 === '—' ? <span className="text-zinc-300">—</span> : row.nycLl144}</td>
                <td className="px-4 py-3.5 text-xs font-mono text-zinc-600">{row.hipaa === '—' ? <span className="text-zinc-300">—</span> : row.hipaa}</td>
                <td className="px-4 py-3.5 text-xs font-mono text-zinc-600">{row.owasp === '—' ? <span className="text-zinc-300">—</span> : row.owasp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    {/* Risk rating methodology */}
    <Card title="Risk Rating Methodology" subtitle="Severity × Likelihood model — applied consistently across all findings">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Severity Scale (AI-Context)</h5>
          {RISK_RATING_METHODOLOGY.severityScale.map(s => (
            <div key={s.level} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <span className="font-mono text-xs font-bold text-zinc-900 bg-white border border-zinc-200 w-6 h-6 flex items-center justify-center shrink-0 rounded">{s.level}</span>
              <div>
                <p className="text-xs font-bold text-zinc-900">{s.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div>
            <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Risk Thresholds</h5>
            <div className="flex gap-2">
              {RISK_RATING_METHODOLOGY.ratingTiers.map(t => (
                <div key={t.label} className="flex-1 flex flex-col items-center">
                  <div className={`w-full h-10 ${t.color} rounded-lg mb-2 flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                    {t.min}–{t.max}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-900">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 bg-zinc-900 rounded-xl text-white">
            <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-widest">Formula</p>
            <p className="text-base font-mono font-bold tracking-tight">{RISK_RATING_METHODOLOGY.formula}</p>
            <p className="text-[10px] text-zinc-500 mt-3 italic">Apply this methodology to every finding before framework mapping.</p>
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Likelihood Scale</h5>
            <div className="space-y-2">
              {RISK_RATING_METHODOLOGY.likelihoodScale.map(s => (
                <div key={s.level} className="flex items-center gap-3 text-xs text-zinc-600">
                  <span className="font-mono font-bold text-zinc-900 w-4 shrink-0">{s.level}</span>
                  <span className="font-medium text-zinc-700 w-28 shrink-0">{s.label}</span>
                  <span className="text-zinc-500">{s.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// ============================================================
// TOOLS VIEW
// ============================================================

const ToolsView = () => (
  <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-bold text-zinc-900">Tool Stack</h1>
      <p className="text-zinc-500 mt-1">Industry-standard AI audit toolkit — all open-source or free-tier. Click any card to open the official site or repo in a new tab.</p>
    </header>

    {/* Reality Check Banner */}
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-5 flex items-start gap-4"
    >
      <div className="bg-orange-500 text-white rounded-lg p-3 shrink-0">
        <AlertTriangle size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-orange-900 mb-1">🚨 Reality Check: Tools Without Execution = Theoretical Only</h4>
        <p className="text-sm text-orange-800 leading-relaxed">
          Reading about Garak, PyRIT, Aequitas, and Fairlearn teaches you the vocabulary. Actually <strong>running</strong> them against your SUTs teaches you the craft. Every tool here must be installed, tested against a SUT, and captured in evidence. If you finish Week 16 with screenshots of installed tools but no finding evidence, your portfolio will look hollow.
        </p>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(['Adversarial', 'Bias', 'EVAL', 'Governance'] as const).map(category => (
        <Card key={category} title={category} subtitle={`Tools for ${category.toLowerCase()} phase testing`}>
          <div className="space-y-3">
            {TOOLS.filter(t => t.category === category).map(tool => (
              <a
                key={tool.name}
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-3 border border-zinc-100 rounded-lg hover:border-zinc-900 hover:shadow-sm transition-all bg-white"
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-zinc-900 text-sm group-hover:text-blue-600 transition-colors">{tool.name}</span>
                    <ExternalLink size={11} className="text-zinc-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">PHASE {tool.phase}</span>
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded">{tool.license}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-1.5">{tool.purpose}</p>
                <p className="text-[10px] font-mono text-zinc-400 group-hover:text-blue-600 transition-colors truncate">
                  {tool.linkLabel ?? tool.link}
                </p>
              </a>
            ))}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================
// GUIDE VIEW — How to use this tracker
// ============================================================

const GuideView = ({
  onNavigate,
  onOpenReferenceTab,
}: {
  onNavigate: (v: View) => void;
  onOpenReferenceTab: (t: ReferenceTab) => void;
}) => {
  type Step = {
    n: number;
    label: string;
    icon: any;
    title: string;
    where: string;
    detail: string;
    cta: { label: string; action: () => void };
  };
  const steps: Step[] = [
    {
      n: 1,
      label: 'SCOPE',
      icon: Target,
      title: 'Open this week\'s scenario',
      where: 'Dashboard → click the active Phase card',
      detail: 'Read the Objective, Checklist, Tools, and Frameworks for the current week. Each phase contains 1–4 scenarios — one per week.',
      cta: { label: 'Open Dashboard', action: () => onNavigate('dashboard') },
    },
    {
      n: 2,
      label: 'EXECUTE',
      icon: Hammer,
      title: 'Do the audit work — outside this app',
      where: 'Your terminal, your editor, your evidence locker',
      detail: 'Run the listed tools (Garak, PyRIT, Aequitas, Fairlearn, etc.) against the SUTs. Capture screenshots, exports, and logs in 07_evidence/. Draft the work paper in Markdown using the ISACA template.',
      cta: { label: 'Browse SUTs', action: () => onOpenReferenceTab('suts') },
    },
    {
      n: 3,
      label: 'GRADE',
      icon: ClipboardCheck,
      title: 'Self-score against the 10-criterion ISACA rubric',
      where: 'Work Papers view',
      detail: 'Find the WP for this week. Tick each rubric criterion you\'ve satisfied. Your status auto-promotes: 9–10 = Complete · 7–8 = Needs Revision · ≤6 = Redo. The rubric is the same across all 16 deliverables.',
      cta: { label: 'Open Work Papers', action: () => onNavigate('workpapers') },
    },
    {
      n: 4,
      label: 'DEFEND',
      icon: MessageSquare,
      title: 'Practice the close-out meeting',
      where: 'NPC Simulator',
      detail: 'Pick the most adversarial stakeholder for your finding (Sarah Chen if it\'s an SR 11-7 model risk; Sandra Park for HIPAA; Sam Okafor for RAG architecture). Present your finding. Refine until you can defend cleanly under pushback.',
      cta: { label: 'Open NPC Simulator', action: () => onNavigate('npc-sim') },
    },
    {
      n: 5,
      label: 'MAP',
      icon: Network,
      title: 'Cross-reference framework citations',
      where: 'Framework Mapper',
      detail: 'Every finding must cite at least one framework (ISACA rubric criterion #8). The 8×7 master matrix maps finding type → NIST / ISO / EU AI Act / SR 11-7 / NYC LL 144 / HIPAA / OWASP. Look up your finding type, copy the citation into your work paper.',
      cta: { label: 'Open Framework Mapper', action: () => onOpenReferenceTab('frameworks') },
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">
          <Compass size={11} /> How To Use This Portal
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">The Weekly Loop</h1>
        <p className="text-zinc-500 mt-1 max-w-2xl leading-relaxed">
          This portal is a <strong>tracker</strong> for your 16-week AuditAI Range program — not a tool that does the audit for you. The actual audit work happens in your terminal and editor. This app keeps you oriented across phases, grades your work, and gives you reference data so you don't lose context.
        </p>
      </header>

      {/* Quick orientation */}
      <Card title="What this app does — and doesn't do">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">✓ This app DOES</p>
            <ul className="space-y-1.5 text-sm text-zinc-700">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Track your progress across 16 weeks</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Score work papers against the ISACA rubric</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Reference the 8×7 framework crosswalk</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Simulate stakeholder pushback (NPCs)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Hold scenario context for all 16 weeks</li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2">✗ This app does NOT</p>
            <ul className="space-y-1.5 text-sm text-zinc-700">
              <li className="flex items-start gap-2"><XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" /> Run audits or red-team probes for you</li>
              <li className="flex items-start gap-2"><XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" /> Store evidence (use <code className="text-xs bg-zinc-100 px-1 rounded">07_evidence/</code>)</li>
              <li className="flex items-start gap-2"><XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" /> Write work papers (Markdown, in your editor)</li>
              <li className="flex items-start gap-2"><XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" /> Spin up the lab (use <code className="text-xs bg-zinc-100 px-1 rounded">setup.sh</code> + Docker)</li>
              <li className="flex items-start gap-2"><XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" /> Replace reading <code className="text-xs bg-zinc-100 px-1 rounded">AUDITAI_RANGE_ARCHITECTURE.md</code></li>
            </ul>
          </div>
        </div>
      </Card>

      {/* The 5-step loop */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 mb-1">Your repeating 5-step weekly loop</h2>
        <p className="text-zinc-500 text-sm mb-6">Same flow every week, for 16 weeks. After Week 16 you have 15 work papers + 1 capstone audit report.</p>

        <div className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-400 transition-all">
                <div className="flex items-start gap-5">
                  {/* Step number */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    {i < steps.length - 1 && <div className="w-0.5 h-6 bg-zinc-200 mt-2" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded font-mono">STEP {step.n}</span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{step.label}</span>
                    </div>
                    <h3 className="font-bold text-zinc-900 mb-1">{step.title}</h3>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mb-2">📍 {step.where}</p>
                    <p className="text-sm text-zinc-600 leading-relaxed mb-3">{step.detail}</p>
                    <button
                      onClick={step.cta.action}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 hover:gap-2 transition-all"
                    >
                      {step.cta.label} <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Where to start */}
      <Card title="Brand new? Start here." className="!bg-blue-50 !border-blue-200">
        <ol className="space-y-3 text-sm text-blue-900">
          <li className="flex items-start gap-3">
            <span className="font-bold bg-blue-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div>
              <strong>Read <code className="text-xs bg-white px-1 rounded">AUDITAI_RANGE_ARCHITECTURE.md</code></strong> — the source spec for the entire 16-week program. Everything in this app derives from it.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold bg-blue-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div>
              <strong>Browse the three anchor orgs</strong> (Helix Health, Stellar Bank, Nimbus AI) and the 10 SUTs you'll audit. They are fictional but each has a distinct regulatory context.
              <button onClick={() => onOpenReferenceTab('orgs')} className="ml-2 text-xs font-bold underline">Open Org Hub →</button>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold bg-blue-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
            <div>
              <strong>Spin up the lab</strong> — Docker + Ollama + 12 audit tools. Setup is one Week 1 scenario; the program assumes you'll do this before any actual auditing.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold bg-blue-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">4</span>
            <div>
              <strong>Begin Week 1: Lab Readiness Memo.</strong> Open Dashboard → click Phase 1 → read Week 1 scenario → execute the checklist → grade your WP01.
              <button onClick={() => onNavigate('dashboard')} className="ml-2 text-xs font-bold underline">Open Dashboard →</button>
            </div>
          </li>
        </ol>
      </Card>

      {/* Reference tabs */}
      <Card title="Reference tabs you'll consult often" subtitle="All four live under the single Reference view in the sidebar.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { tab: 'orgs' as ReferenceTab, icon: Building2, title: 'Orgs', desc: 'Helix, Stellar, Nimbus context — regulatory exposure, frameworks targeted, audit framing.' },
            { tab: 'suts' as ReferenceTab, icon: Boxes, title: 'SUTs', desc: '10 systems under test with risk tier, build approach, and primary phase.' },
            { tab: 'frameworks' as ReferenceTab, icon: BookOpen, title: 'Frameworks', desc: '8×7 crosswalk: every finding type → every regulation. + risk rating methodology.' },
            { tab: 'tools' as ReferenceTab, icon: BarChart3, title: 'Tools', desc: '12 audit tools by category — Adversarial, Bias, Eval, Governance.' },
          ].map(r => {
            const I = r.icon;
            return (
              <button
                key={r.tab}
                onClick={() => onOpenReferenceTab(r.tab)}
                className="text-left p-4 border border-zinc-200 rounded-lg hover:border-zinc-900 hover:shadow-sm transition-all bg-white"
              >
                <div className="flex items-start gap-3">
                  <I size={18} className="text-zinc-700 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-zinc-900 mb-0.5">{r.title}</p>
                    <p className="text-xs text-zinc-500 leading-snug">{r.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-zinc-300 mt-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Daily routine */}
      <Card title="Daily routine" className="!bg-zinc-900 !border-zinc-800 !text-white">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Open <strong className="text-white">Dashboard</strong> → check <strong className="text-white">Next Up</strong> → open the scenario → execute in your terminal → grade the WP and add evidence paths → optionally drill the NPC for that WP → export progress every Friday.
        </p>
        <p className="text-[10px] text-zinc-500 mt-3 uppercase tracking-widest font-bold">Tip · Press <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">?</kbd> anywhere for keyboard shortcuts</p>
      </Card>
    </div>
  );
};


// ============================================================
// NPC SIMULATOR VIEW
// ============================================================

const NpcSimView = ({
  selectedWpId,
  setSelectedWpId,
  onNavigate,
  onActivity,
}: {
  selectedWpId: string | null;
  setSelectedWpId: (id: string | null) => void;
  onNavigate: (v: View) => void;
  onActivity: () => void;
}) => {
  type Message = { role: 'user' | 'ai'; content: string; timestamp: string; saved?: boolean };

  const wp = selectedWpId ? WORKPAPER_DEFINITIONS.find(w => w.id === selectedWpId) ?? null : null;
  const wpAnchorOrg = wp ? getOrgIdFromAnchor(wp.anchor) : null;
  const wpFindingType = wp ? inferFindingTypeForWorkpaper(wp) : null;
  const wpCrosswalk = wpFindingType ? FRAMEWORK_CROSSWALK.find(c => c.findingType === wpFindingType) : null;

  const initialOrgId: 'helix' | 'stellar' | 'nimbus' = wpAnchorOrg ?? 'stellar';
  const [selectedOrgId, setSelectedOrgId] = useState<'helix' | 'stellar' | 'nimbus'>(initialOrgId);
  const [currentPersona, setCurrentPersona] = useState<NpcPersona>(
    wp ? getDefaultPersonaForAnchor(wp.anchor) : NPC_PERSONAS.find(p => p.orgId === 'stellar')!
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const orgPersonas = NPC_PERSONAS.filter(p => p.orgId === selectedOrgId);

  const orgConfig = {
    helix: { label: 'Helix Health', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    stellar: { label: 'Stellar Bank', icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    nimbus: { label: 'Nimbus AI', icon: Cloud, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Re-align org and persona when the selected WP changes via parent state
  useEffect(() => {
    if (!wp) return;
    const orgId = getOrgIdFromAnchor(wp.anchor);
    setSelectedOrgId(orgId);
    setCurrentPersona(getDefaultPersonaForAnchor(wp.anchor));
    setMessages([]);
  }, [selectedWpId]);

  const handleOrgSwitch = (orgId: 'helix' | 'stellar' | 'nimbus') => {
    setSelectedOrgId(orgId);
    setCurrentPersona(NPC_PERSONAS.find(p => p.orgId === orgId)!);
    setMessages([]);
  };

  const handlePersonaSwitch = (persona: NpcPersona) => {
    setCurrentPersona(persona);
    setMessages([]);
  };

  const buildPrompt = (auditorMessage: string): string => {
    const base = `You are ${currentPersona.name}, the ${currentPersona.role} at ${currentPersona.org}.
Context: ${currentPersona.openingContext}
Personality: ${currentPersona.personality}
Pushback style: ${currentPersona.pushback}

You are in an audit close-out meeting or formal response session. The AI auditor is presenting findings or responding to your feedback.
Be realistic, professional, and appropriately resistant. Push back on vague language, demand evidence, cite your regulatory context.
If the auditor presents solid evidence and clear framework citations, acknowledge it but shift to ROI concerns or implementation timeline.
Keep your response to 2–3 paragraphs. Professional email / meeting tone. Be specific to your org's regulatory context.`;

    const wpContext = wp ? `

The auditor is defending Work Paper WP${wp.number.toString().padStart(2, '0')}: "${wp.title}".
- Anchor org: ${wp.anchor}
- Frameworks in scope: ${wp.frameworks.join(', ') || 'unspecified'}
- Finding type: ${wpFindingType}${wpCrosswalk ? `
- Relevant crosswalk citations: NIST AI RMF ${wpCrosswalk.nistAiRmf} · ISO 42001 ${wpCrosswalk.iso42001} · EU AI Act ${wpCrosswalk.euAiAct}` : ''}
Push back specifically against this finding type and demand evidence tied to those framework citations.` : '';

    return `${base}${wpContext}

Auditor says: ${auditorMessage}`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', content: input, timestamp };
    const userText = input;
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    onActivity();

    try {
      const genAI = new GoogleGenerativeAI(localStorage.getItem('auditai-gemini-key') || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(buildPrompt(userText));
      const text = result.response.text();
      setMessages(prev => [...prev, {
        role: 'ai',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `[${currentPersona.name} is unavailable — paste your Gemini key in Settings.]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveExchange = (aiIdx: number) => {
    if (!selectedWpId) return;
    const aiMsg = messages[aiIdx];
    if (!aiMsg || aiMsg.role !== 'ai') return;
    // Find the most recent user message before this AI message
    let userMsg: Message | null = null;
    for (let i = aiIdx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMsg = messages[i];
        break;
      }
    }
    if (!userMsg) return;
    const ok = saveNpcExchangeForWp(selectedWpId, userMsg.content, aiMsg.content);
    if (ok) {
      setMessages(prev => prev.map((m, i) => (i === aiIdx ? { ...m, saved: true } : m)));
    }
  };

  const cfg = orgConfig[selectedOrgId];
  const OrgIcon = cfg.icon;
  void OrgIcon;

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] md:h-[calc(100vh-120px)] space-y-4">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">NPC Pushback Simulator</h1>
        <p className="text-zinc-500 mt-1 text-sm">Defend your audit findings under fire. 15 hardened stakeholders across 3 organizations — each with real regulatory stalling tactics and ROI concerns.</p>
      </header>

      {/* Work paper context selector */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Defending</label>
        <select
          value={selectedWpId ?? ''}
          onChange={e => setSelectedWpId(e.target.value || null)}
          className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Open / generic — no WP context</option>
          {WORKPAPER_DEFINITIONS.map(w => (
            <option key={w.id} value={w.id}>
              WP{w.number.toString().padStart(2, '0')} · {w.title}
            </option>
          ))}
        </select>
        {wp && (
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white px-3 py-1.5 rounded-md">
            Defending WP{wp.number.toString().padStart(2, '0')}
            {wp.frameworks[0] && <span className="text-zinc-400">· {wp.frameworks[0]}</span>}
            {wpFindingType && <span className="text-zinc-400">· {wpFindingType}</span>}
          </span>
        )}
      </div>

      {/* Org selector */}
      <div className="flex gap-2 flex-wrap">
        {(['helix', 'stellar', 'nimbus'] as const).map(orgId => {
          const c = orgConfig[orgId];
          const C = c.icon;
          return (
            <button
              key={orgId}
              onClick={() => handleOrgSwitch(orgId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                selectedOrgId === orgId
                  ? `${c.bg} ${c.border} ${c.color}`
                  : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400'
              }`}
            >
              <C size={14} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Persona cards */}
      <div className="grid grid-cols-5 gap-2">
        {orgPersonas.map(p => (
          <button
            key={p.id}
            onClick={() => handlePersonaSwitch(p)}
            className={`p-3 rounded-xl border text-left transition-all ${
              currentPersona.id === p.id
                ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold mb-2 ${
              currentPersona.id === p.id ? 'bg-white/10 text-white' : `${cfg.bg} ${cfg.color}`
            }`}>
              {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <p className={`text-[10px] font-bold leading-snug truncate ${currentPersona.id === p.id ? 'text-white' : 'text-zinc-800'}`}>
              {p.name.split(' ').slice(-1)[0]}
            </p>
            <p className={`text-[9px] leading-snug mt-0.5 ${currentPersona.id === p.id ? 'text-zinc-400' : 'text-zinc-400'}`}>
              {p.role.split('/')[0].trim().substring(0, 20)}
            </p>
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex-1 min-h-0 border border-zinc-200 rounded-2xl flex flex-col bg-white overflow-hidden shadow-sm">
        {/* Chat header */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center font-bold text-xs`}>
              {currentPersona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-bold text-zinc-900 leading-none">{currentPersona.name}</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{currentPersona.role} · {currentPersona.org}</p>
            </div>
          </div>
          <p className="hidden md:block text-[10px] text-zinc-400 italic text-right max-w-xs leading-tight">
            {currentPersona.personality}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto py-12">
              <div className={`w-16 h-16 ${cfg.bg} rounded-full flex items-center justify-center mb-5`}>
                <Users size={28} className={cfg.color} />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">{currentPersona.name}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{currentPersona.openingContext}</p>
              <p className="text-xs text-zinc-400 mt-4 italic">"{currentPersona.pushback}"</p>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[85%]">
                <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                  m.role === 'user'
                    ? 'bg-zinc-900 text-white rounded-tr-none'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                </div>
                <div className={`flex items-center gap-2 mt-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className="text-[9px] text-zinc-400">{m.timestamp}</p>
                  {m.role === 'ai' && selectedWpId && (
                    <button
                      onClick={() => saveExchange(i)}
                      disabled={m.saved}
                      className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 disabled:text-emerald-600 disabled:hover:text-emerald-600 inline-flex items-center gap-1"
                    >
                      <Save size={10} /> {m.saved ? 'Saved' : 'Save this exchange'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-200 bg-white shrink-0">
          {!localStorage.getItem('auditai-gemini-key') && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-amber-800">Set your Gemini key in Settings to use NPC simulator</p>
              <button
                onClick={() => onNavigate('settings')}
                className="px-3 py-1 bg-amber-600 text-white rounded text-sm font-bold hover:bg-amber-700 transition-colors"
              >
                Settings
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <textarea
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Present your findings to ${currentPersona.name}…`}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
            />
            <button
              disabled={!input.trim() || isTyping}
              onClick={sendMessage}
              className="bg-zinc-900 text-white px-4 rounded-xl hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[9px] text-zinc-400 text-center mt-2 uppercase tracking-widest font-bold">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// REFERENCE VIEW — tabbed wrapper around Orgs/SUTs/Frameworks/Tools
// ============================================================

type ReferenceTab = 'orgs' | 'suts' | 'frameworks' | 'tools';

const ReferenceView = ({
  tab,
  setTab,
  onOpenMission,
}: {
  tab: ReferenceTab;
  setTab: (t: ReferenceTab) => void;
  onOpenMission: (id: string) => void;
}) => {
  const tabs: { id: ReferenceTab; label: string }[] = [
    { id: 'orgs', label: 'Orgs' },
    { id: 'suts', label: 'SUTs' },
    { id: 'frameworks', label: 'Frameworks' },
    { id: 'tools', label: 'Tools' },
  ];
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap shrink-0 transition-all ${
              tab === t.id ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'orgs' && <OrgsView />}
      {tab === 'suts' && <SutsView onOpenMission={onOpenMission} />}
      {tab === 'frameworks' && <FrameworksView />}
      {tab === 'tools' && <ToolsView />}
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================

const loadWorkpapers = (): Record<string, WorkPaperRecord> => {
  try {
    const parsed = JSON.parse(localStorage.getItem('auditai-workpapers') || '{}');
    const normalized: Record<string, WorkPaperRecord> = {};
    Object.entries(parsed).forEach(([id, record]) => {
      if (!record || typeof record !== 'object') return;
      const criteria = Array.isArray((record as any).criteria)
        ? (record as any).criteria.map((c: any) => {
            if (typeof c === 'boolean') return { checked: c, evidence: '' };
            if (c && typeof c === 'object') return { checked: !!c.checked, evidence: typeof c.evidence === 'string' ? c.evidence : '' };
            return { checked: false, evidence: '' };
          })
        : Array.from({ length: 10 }, () => ({ checked: false, evidence: '' }));
      normalized[id] = {
        status: ['not-started', 'in-progress', 'needs-revision', 'complete'].includes((record as any).status) ? (record as any).status : 'not-started',
        criteria: criteria.length === 10 ? criteria : [...criteria, ...Array.from({ length: 10 - criteria.length }, () => ({ checked: false, evidence: '' }))],
        lastModified: typeof (record as any).lastModified === 'string' ? (record as any).lastModified : new Date().toISOString(),
      };
    });
    return normalized;
  } catch {
    return {};
  }
};

const loadJsonArray = (key: string): string[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};

const formatRelativeDay = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.round((date.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return rtf.format(diffDays, 'day');
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedPhase, setSelectedPhase] = useState<ProgramPhase | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedWpId, setSelectedWpId] = useState<string | null>(() => localStorage.getItem('auditai-selected-wp') || null);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('auditai-gemini-key') || '');
  const [activityDates, setActivityDates] = useState<string[]>(() => loadJsonArray('auditai-activity-dates'));
  const [lastExport, setLastExport] = useState<string | null>(() => localStorage.getItem('auditai-last-export'));
  const [referenceTab, setReferenceTab] = useState<'orgs' | 'suts' | 'frameworks' | 'tools'>('orgs');

  const [completedTasks, setCompletedTasks] = useState<string[]>(() => loadJsonArray('auditai-progress'));
  const [workpaperData, setWorkpaperData] = useState<Record<string, WorkPaperRecord>>(() => loadWorkpapers());

  useEffect(() => {
    localStorage.setItem('auditai-progress', JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem('auditai-workpapers', JSON.stringify(workpaperData));
  }, [workpaperData]);

  useEffect(() => {
    if (selectedWpId) {
      localStorage.setItem('auditai-selected-wp', selectedWpId);
    } else {
      localStorage.removeItem('auditai-selected-wp');
    }
  }, [selectedWpId]);

  useEffect(() => {
    localStorage.setItem('auditai-gemini-key', geminiKey);
  }, [geminiKey]);

  useEffect(() => {
    localStorage.setItem('auditai-activity-dates', JSON.stringify(activityDates));
  }, [activityDates]);

  useEffect(() => {
    if (lastExport) {
      localStorage.setItem('auditai-last-export', lastExport);
    }
  }, [lastExport]);

  const trackActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    setActivityDates(prev => (prev.includes(today) ? prev : [...prev, today]));
  };

  const calculateStreak = () => {
    if (activityDates.length === 0) return 0;
    const sorted = [...activityDates].sort((a, b) => (a < b ? 1 : -1));
    let streak = 0;
    let current = new Date();
    current.setUTCHours(0, 0, 0, 0);
    for (const dateStr of sorted) {
      const date = new Date(`${dateStr}T00:00:00Z`);
      const diff = Math.round((current.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === streak) {
        streak += 1;
      } else if (diff > streak) {
        break;
      }
    }
    return streak;
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => prev.includes(taskId) ? prev.filter(t => t !== taskId) : [...prev, taskId]);
    trackActivity();
  };

  const updateWPStatus = (id: string, status: WorkPaperStatus) => {
    setWorkpaperData(prev => {
      const current = prev[id] ?? { status: 'not-started', criteria: Array.from({ length: 10 }, () => ({ checked: false, evidence: '' })), lastModified: new Date().toISOString() };
      return {
        ...prev,
        [id]: {
          ...current,
          status,
          lastModified: new Date().toISOString(),
          criteria: current.criteria.length === 10 ? current.criteria : [...current.criteria, ...Array.from({ length: 10 - current.criteria.length }, () => ({ checked: false, evidence: '' }))],
        },
      };
    });
    trackActivity();
  };

  const updateWorkpaperCriterion = (id: string, idx: number, checked: boolean, evidence?: string) => {
    setWorkpaperData(prev => {
      const current = prev[id] ?? { status: 'not-started', criteria: Array.from({ length: 10 }, () => ({ checked: false, evidence: '' })), lastModified: new Date().toISOString() };
      const criteria = [...current.criteria];
      const prevCriterion = criteria[idx] ?? { checked: false, evidence: '' };
      criteria[idx] = {
        checked,
        evidence: evidence !== undefined ? evidence : prevCriterion.evidence,
      };
      const score = criteria.filter(c => c.checked).length;
      const status: WorkPaperStatus = score === 0 ? 'not-started' : score >= 9 ? 'complete' : score >= 7 ? 'needs-revision' : 'in-progress';
      return {
        ...prev,
        [id]: {
          ...current,
          status,
          criteria,
          lastModified: new Date().toISOString(),
        },
      };
    });
    trackActivity();
  };

  const completedWPCount = (Object.values(workpaperData) as WorkPaperRecord[]).filter(d => d.status === 'complete').length;

  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null);
  const openMission = (id: string) => {
    setCurrentMissionId(id);
    setCurrentView('drills');
    setSelectedPhase(null);
  };

  const openNpcForWp = (wpId: string) => {
    setSelectedWpId(wpId);
    setCurrentView('npc-sim');
    setSelectedPhase(null);
  };

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

  const nav: { view: View; icon: any; label: string; badge?: number }[] = [
    { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { view: 'guide', icon: Compass, label: 'How To Use' },
    { view: 'drills', icon: Crosshair, label: 'Drills', badge: SIMULATION_MISSIONS.length },
    { view: 'reference', icon: BookOpen, label: 'Reference' },
    { view: 'workpapers', icon: FileCheck2, label: 'Work Papers', badge: completedWPCount },
    { view: 'npc-sim', icon: MessageSquare, label: 'NPC Simulator' },
  ];

  const goTo = (view: View) => {
    setCurrentView(view);
    setSelectedPhase(null);
    setIsSidebarOpen(false);
  };

  const goToReferenceTab = (tab: ReferenceTab) => {
    setReferenceTab(tab);
    goTo('reference');
  };

  const streak = calculateStreak();
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Document title per view
  useEffect(() => {
    const labels: Record<View, string> = {
      'dashboard': 'Dashboard',
      'guide': 'How To Use',
      'drills': 'Drills',
      'reference': 'Reference',
      'workpapers': 'Work Papers',
      'npc-sim': 'NPC Simulator',
      'settings': 'Settings',
    };
    if (currentView === 'dashboard') {
      const nextWP = WORKPAPER_DEFINITIONS.find(wp => workpaperData[wp.id]?.status !== 'complete') ?? WORKPAPER_DEFINITIONS[0];
      document.title = `Week ${nextWP.week} of 16 · AuditAI Range`;
    } else {
      document.title = `${labels[currentView]} · AuditAI Range`;
    }
  }, [currentView, workpaperData]);

  // Keyboard shortcuts
  useEffect(() => {
    let firstKey: string | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const isInputFocused = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable;
    };

    const handler = (e: KeyboardEvent) => {
      if (isInputFocused()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutHelp(s => !s);
        return;
      }

      if (firstKey === 'g') {
        firstKey = null;
        if (resetTimer) clearTimeout(resetTimer);
        const map: Record<string, View> = { d: 'dashboard', w: 'workpapers', n: 'npc-sim', r: 'reference' };
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
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 bg-white border border-zinc-200 rounded-lg p-2 shadow-sm"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Backdrop (mobile only when sidebar open) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-30"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 inset-y-0 left-0 w-60 border-r border-zinc-200 bg-white px-4 py-6 flex flex-col shrink-0 transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <ShieldAlert size={20} className="fill-zinc-900 text-white" />
          <span className="font-bold tracking-tight text-lg text-zinc-900">AuditAI</span>
          <span className="text-[9px] font-bold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded ml-auto">RANGE</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-zinc-400"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <Fragment key={item.view}>
              <SidebarItem
                icon={item.icon}
                label={item.label}
                active={currentView === item.view && !selectedPhase}
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
            active={currentView === 'settings' && !selectedPhase}
            onClick={() => goTo('settings')}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-4 md:p-8 lg:p-10 pt-14 md:pt-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (selectedPhase?.id ?? '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {selectedPhase ? (
                /* Phase detail */
                <div className="space-y-8">
                  <button
                    onClick={() => setSelectedPhase(null)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors text-sm font-medium"
                  >
                    <ChevronRight className="rotate-180" size={16} /> Back to Program Map
                  </button>

                  <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                      <span className="text-xs font-mono font-bold bg-zinc-900 text-white px-3 py-1.5 rounded">PHASE {selectedPhase.id}</span>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span className="flex items-center gap-1.5"><Clock size={13} /> Weeks {selectedPhase.weeks}</span>
                        <span className="flex items-center gap-1.5"><Target size={13} /> {selectedPhase.hours} hrs</span>
                        <span className="flex items-center gap-1.5"><Building2 size={13} /> {selectedPhase.anchor}</span>
                      </div>
                    </div>
                    <h2 className="text-4xl font-bold text-zinc-900 mb-4">{selectedPhase.title}</h2>
                    <p className="text-lg text-zinc-500 mb-10 max-w-2xl leading-relaxed">{selectedPhase.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-zinc-100">
                      <div>
                        <h4 className="flex items-center gap-2 font-bold mb-4 text-zinc-900">
                          <Target size={16} className="text-blue-500" /> Primary Activities
                        </h4>
                        <ul className="space-y-2.5">
                          {selectedPhase.primaryActivities.map(a => (
                            <li key={a} className="flex items-start gap-2.5 text-sm text-zinc-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 shrink-0" />{a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2 font-bold mb-4 text-zinc-900">
                          <CircleCheck size={16} className="text-emerald-500" /> Key Deliverables
                        </h4>
                        <ul className="space-y-2.5">
                          {selectedPhase.deliverables.map(d => (
                            <li
                              key={d}
                              onClick={() => toggleTask(`d-${selectedPhase.id}-${d}`)}
                              className="flex items-center gap-3 text-sm text-zinc-600 cursor-pointer group"
                            >
                              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors shrink-0 ${
                                completedTasks.includes(`d-${selectedPhase.id}-${d}`)
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-zinc-200 group-hover:border-zinc-400'
                              }`}>
                                {completedTasks.includes(`d-${selectedPhase.id}-${d}`) && <CircleCheck size={13} />}
                              </div>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Scenario deep-dive */}
                    <div className="pt-10 mt-10 border-t border-zinc-100">
                      <h4 className="text-lg font-bold mb-6 text-zinc-900">Scenario Deep-Dive</h4>
                      <div className="space-y-5">
                        {SCENARIOS.filter(s => s.phaseId === selectedPhase.id).map(scenario => (
                          <div key={scenario.week} className="p-6 border border-zinc-200 rounded-xl bg-zinc-50/50">
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                              <h5 className="font-bold text-zinc-900">Week {scenario.week}: {scenario.title}</h5>
                              <span className="text-[9px] font-mono font-bold bg-white border border-zinc-200 px-2 py-1 rounded">
                                SUT: {scenario.suts.join(', ')}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-600 mb-5 leading-relaxed">{scenario.objective}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-wider">Checklist</p>
                                <ul className="space-y-1.5">
                                  {scenario.checklists.map(c => (
                                    <li key={c} className="text-xs text-zinc-500 flex items-start gap-2">
                                      <div className="w-1 h-1 rounded-full bg-zinc-300 mt-1.5 shrink-0" />{c}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-wider">Tools</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {scenario.tools.map(t => (
                                      <span key={t} className="text-[9px] bg-white border border-zinc-200 px-2 py-0.5 rounded text-zinc-500">{t}</span>
                                    ))}
                                  </div>
                                </div>
                                {scenario.frameworks && scenario.frameworks.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-wider">Frameworks</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {scenario.frameworks.map(f => (
                                        <span key={f} className="text-[9px] bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-amber-700 font-medium">{f}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {currentView === 'dashboard' && (
                    <DashboardView
                      onSelectPhase={setSelectedPhase}
                      completedTasks={completedTasks}
                      workpaperData={workpaperData}
                      onNavigate={goTo}
                      onOpenMission={openMission}
                      lastExport={lastExport}
                      onExportProgress={exportProgress}
                      onOpenNpcForWp={openNpcForWp}
                      streak={streak}
                    />
                  )}
                  {currentView === 'drills' && (
                    <MissionModeView
                      currentMissionId={currentMissionId}
                      onSelectMission={openMission}
                    />
                  )}
                  {currentView === 'reference' && (
                    <ReferenceView tab={referenceTab} setTab={setReferenceTab} onOpenMission={openMission} />
                  )}
                  {currentView === 'workpapers' && (
                    <WorkpapersView
                      workpaperData={workpaperData}
                      onUpdateStatus={updateWPStatus}
                      onUpdateCriterion={updateWorkpaperCriterion}
                      onOpenNpcForWp={openNpcForWp}
                    />
                  )}
                  {currentView === 'npc-sim' && (
                    <NpcSimView
                      selectedWpId={selectedWpId}
                      setSelectedWpId={setSelectedWpId}
                      onNavigate={goTo}
                      onActivity={trackActivity}
                    />
                  )}
                  {currentView === 'guide' && (
                    <GuideView
                      onNavigate={goTo}
                      onOpenReferenceTab={goToReferenceTab}
                    />
                  )}
                  {currentView === 'settings' && (
                    <div className="space-y-8">
                      <header>
                        <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
                        <p className="text-zinc-500 mt-1">Application and program configuration.</p>
                      </header>

                      <Card title="Gemini API Key">
                        <div className="space-y-3">
                          <p className="text-sm text-zinc-600">Enter your Gemini API key for NPC simulator. Stored locally only.</p>
                          <input
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                            placeholder="Enter Gemini API key"
                          />
                        </div>
                      </Card>

                      <Card title="Backup & Restore" subtitle="Export progress to JSON or import from a previous backup">
                        <div className="space-y-4">
                          <div>
                            <button
                              onClick={exportProgress}
                              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors"
                            >
                              <Download size={14} /> Export Progress (JSON)
                            </button>
                            <p className="text-xs text-zinc-500 mt-1">Downloads auditai-progress-YYYY-MM-DD.json with all progress data</p>
                          </div>
                          <div>
                            <label className="block">
                              <span className="text-sm font-medium text-zinc-700">Import Progress</span>
                              <input
                                type="file"
                                accept=".json"
                                onChange={importProgress}
                                className="mt-1 block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
                              />
                            </label>
                            <p className="text-xs text-zinc-500 mt-1">Select a previously exported JSON file to restore progress</p>
                          </div>
                        </div>
                      </Card>

                      <Card title="Program Risk Register" subtitle="10 identified risks with mitigations built into program design">
                        <div className="space-y-3">
                          {PROGRAM_RISKS.map(risk => (
                            <div key={risk.id} className="grid grid-cols-12 gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100 items-start">
                              <span className="col-span-1 text-[10px] font-bold text-zinc-500 font-mono mt-0.5">{risk.id}</span>
                              <div className="col-span-8">
                                <p className="text-sm font-medium text-zinc-800 leading-snug mb-1">{risk.risk}</p>
                                <p className="text-[10px] text-zinc-500 leading-snug">{risk.mitigation}</p>
                              </div>
                              <div className="col-span-3 flex flex-col gap-1 items-end">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  risk.likelihood === 'High' ? 'bg-rose-100 text-rose-700' :
                                  risk.likelihood === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>L: {risk.likelihood}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  risk.impact === 'High' ? 'bg-rose-100 text-rose-700' :
                                  risk.impact === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>I: {risk.impact}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card title="ISACA Self-Assessment Rubric" subtitle="10 criteria applied to every work paper">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {RUBRIC_CRITERIA.map((criterion, idx) => (
                            <div key={idx} className="flex gap-3 items-start p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                              <div className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">{idx + 1}</div>
                              <p className="text-xs text-zinc-600 leading-snug">{criterion}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-4 bg-zinc-50 border border-zinc-100 rounded-lg">
                          <div className="flex items-center gap-6 text-xs">
                            <span><strong className="text-emerald-700">9–10 ✓</strong> = PASS — Submit as-is</span>
                            <span><strong className="text-amber-700">7–8 ✓</strong> = REVISE — Address gaps</span>
                            <span><strong className="text-rose-700">≤6 ✓</strong> = REDO — Significant rework required</span>
                          </div>
                        </div>
                      </Card>

                      <Card title="Progress Reset" subtitle="Clear all tracked progress (irreversible)">
                        <button
                          onClick={() => {
                            if (confirm('Reset all progress? This cannot be undone.')) {
                              setCompletedTasks([]);
                              setWorkpaperData({});
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors"
                        >
                          <XCircle size={14} /> Reset All Progress
                        </button>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Shortcut help modal */}
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
                  { keys: ['g', 'd'], label: 'Go to Dashboard' },
                  { keys: ['g', 'w'], label: 'Go to Work Papers' },
                  { keys: ['g', 'n'], label: 'Go to NPC Simulator' },
                  { keys: ['g', 'r'], label: 'Go to Reference' },
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
