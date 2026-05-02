/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, Fragment } from 'react';
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
  Share2,
  AlertTriangle,
  Activity,
  Landmark,
  Cloud,
  CheckCircle2,
  Circle,
  RefreshCw,
  XCircle,
  Send,
  TrendingUp,
  Award,
  Users,
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
  PORTFOLIO_MILESTONES,
  PROGRAM_RISKS,
  WORKPAPER_DEFINITIONS,
  FRAMEWORK_CROSSWALK,
  ProgramPhase,
  NpcPersona,
  WorkPaperDef,
} from './constants';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================
// TYPES
// ============================================================

type View = 'dashboard' | 'orgs' | 'suts' | 'frameworks' | 'workpapers' | 'portfolio' | 'npc-sim' | 'tools' | 'settings';
type WorkPaperStatus = 'not-started' | 'in-progress' | 'needs-revision' | 'complete';

interface WorkPaperRecord {
  status: WorkPaperStatus;
  criteria: boolean[];
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
}: {
  onSelectPhase: (p: ProgramPhase) => void;
  completedTasks: string[];
  workpaperData: Record<string, WorkPaperRecord>;
}) => {
  const completedWPs = Object.values(workpaperData).filter(d => d.status === 'complete').length;
  const totalCriteria = Object.values(workpaperData).reduce((acc, d) => acc + d.criteria.filter(Boolean).length, 0);
  const progressPct = Math.round((completedWPs / 16) * 100);
  const highRiskSUTs = SUTS.filter(s => s.riskTier.includes('High')).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">
            <Target size={11} /> Active Engagement
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">AuditAI Range</h1>
          <p className="text-zinc-500 mt-1">16-Week Hybrid AI Audit Self-Mastery Program — Option C</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Work Papers', value: `${completedWPs}/16`, sub: 'complete' },
            { label: 'Criteria Met', value: totalCriteria, sub: 'rubric checks' },
            { label: 'High-Risk SUTs', value: highRiskSUTs, sub: 'in scope' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-zinc-200 px-4 py-2.5 rounded-xl shadow-sm text-right">
              <p className="text-[10px] font-bold text-zinc-400 uppercase leading-none mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-zinc-900 leading-none">{stat.value}</p>
              <p className="text-[9px] text-zinc-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </header>

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
        <div className="flex justify-between mt-2">
          {PHASES.map(p => (
            <span key={p.id} className="text-[9px] text-zinc-400 font-mono">PH{p.id}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Phase timeline */}
        <Card title="Program Master Timeline" className="lg:col-span-3 !bg-zinc-900 !border-zinc-800 text-white">
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

        {/* AIRTP+ status */}
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

      {/* Top Program Risks */}
      <Card title="Top Program Risks" subtitle="Click a phase card below to dive into scenario details">
        <div className="space-y-2">
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
      </Card>

      {/* Phase cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

const SutsView = () => {
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
                <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded font-medium text-zinc-600 shrink-0">{sut.org}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${
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
                    <div className="px-4 pb-4 pt-0 bg-zinc-50 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-3 gap-4">
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
  onToggleCriterion,
}: {
  workpaperData: Record<string, WorkPaperRecord>;
  onUpdateStatus: (id: string, status: WorkPaperStatus) => void;
  onToggleCriterion: (id: string, idx: number) => void;
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getRecord = (id: string): WorkPaperRecord =>
    workpaperData[id] ?? { status: 'not-started', criteria: new Array(10).fill(false) };

  const totalComplete = Object.values(workpaperData).filter(d => d.status === 'complete').length;
  const totalCriteria = Object.values(workpaperData).reduce((acc, d) => acc + d.criteria.filter(Boolean).length, 0);
  const avgScore = Object.keys(workpaperData).length > 0
    ? Math.round(Object.values(workpaperData).reduce((a, d) => a + d.criteria.filter(Boolean).length, 0) / Math.max(Object.keys(workpaperData).length, 1) * 10) / 10
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
              const score = record.criteria.filter(Boolean).length;
              const isExpanded = expandedId === wp.id;

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
                      <p className="text-[10px] text-zinc-400 mt-0.5">Week {wp.week} · {wp.anchor}</p>
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
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ISACA Rubric — {score}/10 criteria met</p>
                              {score >= 9 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">PASS THRESHOLD</span>}
                              {score >= 7 && score < 9 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">REVISE</span>}
                              {score > 0 && score < 7 && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">REDO</span>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {RUBRIC_CRITERIA.map((criterion, idx) => {
                                const checked = record.criteria[idx] ?? false;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => onToggleCriterion(wp.id, idx)}
                                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                      checked ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                      checked ? 'bg-emerald-500' : 'border-2 border-zinc-300'
                                    }`}>
                                      {checked && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                    <span className="text-xs text-zinc-700 leading-snug">{criterion}</span>
                                  </div>
                                );
                              })}
                            </div>
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
      <p className="text-zinc-500 mt-1">Industry-standard AI audit toolkit — all open-source or free-tier.</p>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(['Adversarial', 'Bias', 'EVAL', 'Governance'] as const).map(category => (
        <Card key={category} title={category} subtitle={`Tools for ${category.toLowerCase()} phase testing`}>
          <div className="space-y-3">
            {TOOLS.filter(t => t.category === category).map(tool => (
              <div key={tool.name} className="p-3 border border-zinc-100 rounded-lg hover:border-zinc-300 transition-all">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-zinc-900 text-sm">{tool.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">PHASE {tool.phase}</span>
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded">{tool.license}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500">{tool.purpose}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================================
// PORTFOLIO VIEW
// ============================================================

const PortfolioView = ({
  publishedWeeks,
  onToggle,
}: {
  publishedWeeks: number[];
  onToggle: (week: number) => void;
}) => {
  const publishedCount = publishedWeeks.length;
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Portfolio & Visibility Plan</h1>
          <p className="text-zinc-500 mt-1">8 LinkedIn assets mapped to program milestones. This is the career ROI layer.</p>
        </div>
        <div className="bg-white border border-zinc-200 px-5 py-3 rounded-xl text-center shadow-sm">
          <p className="text-2xl font-bold text-zinc-900">{publishedCount}/8</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase">Published</p>
        </div>
      </header>

      {/* LinkedIn headline */}
      <Card title="Post-Program LinkedIn Headline" className="!bg-blue-950 !border-blue-900">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Credible after Week 16</p>
          <p className="text-white font-semibold text-base leading-relaxed">
            "CISA, AAIA, AIRTP+ | IT Audit Manager | AI Governance & Red-Teaming | Built end-to-end AI audit program covering NIST AI RMF, ISO 42001, EU AI Act"
          </p>
          <p className="text-blue-400 text-xs">Update LinkedIn after AIRTP+ pass (Week 6) and after capstone publish (Week 16)</p>
        </div>
      </Card>

      {/* Milestone timeline */}
      <div className="space-y-4">
        {PORTFOLIO_MILESTONES.map((m, i) => {
          const published = publishedWeeks.includes(m.week);
          return (
            <div key={m.week} className={`flex gap-5 items-start group`}>
              {/* Timeline spine */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                  published ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-500'
                }`}>
                  {published ? <CheckCircle2 size={16} /> : `W${m.week}`}
                </div>
                {i < PORTFOLIO_MILESTONES.length - 1 && (
                  <div className="w-0.5 h-8 bg-zinc-200 mt-1" />
                )}
              </div>

              {/* Card */}
              <div className={`flex-1 border rounded-xl p-5 transition-all ${
                published ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200'
              }`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        published ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>Week {m.week}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        published ? 'border-white/20 text-white/60' : 'border-zinc-200 text-zinc-500'
                      }`}>{m.format}</span>
                    </div>
                    <p className={`font-semibold leading-snug mb-2 ${published ? 'text-white' : 'text-zinc-900'}`}>{m.asset}</p>
                    <p className={`text-xs leading-relaxed ${published ? 'text-zinc-400' : 'text-zinc-500'}`}>{m.description}</p>
                  </div>
                  <button
                    onClick={() => onToggle(m.week)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      published
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800'
                    }`}
                  >
                    {published ? <><XCircle size={14} /> Unpublish</> : <><Share2 size={14} /> Mark Published</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GitHub strategy */}
      <Card title="GitHub Strategy" subtitle="Public after Week 16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Repo Name', value: 'auditai-range', note: 'Your GitHub username' },
            { label: 'Visibility', value: 'Public after Week 16', note: 'Private during build' },
            { label: 'License', value: 'MIT', note: 'Or all-rights-reserved for SaaS path' },
          ].map(item => (
            <div key={item.label} className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{item.label}</p>
              <p className="font-bold text-zinc-900 font-mono">{item.value}</p>
              <p className="text-[10px] text-zinc-400 mt-1">{item.note}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// NPC SIMULATOR VIEW
// ============================================================

const NpcSimView = () => {
  type Message = { role: 'user' | 'ai'; content: string; timestamp: string };

  const [selectedOrgId, setSelectedOrgId] = useState<'helix' | 'stellar' | 'nimbus'>('stellar');
  const [currentPersona, setCurrentPersona] = useState<NpcPersona>(
    NPC_PERSONAS.find(p => p.orgId === 'stellar')!
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

  const handleOrgSwitch = (orgId: 'helix' | 'stellar' | 'nimbus') => {
    setSelectedOrgId(orgId);
    setCurrentPersona(NPC_PERSONAS.find(p => p.orgId === orgId)!);
    setMessages([]);
  };

  const handlePersonaSwitch = (persona: NpcPersona) => {
    setCurrentPersona(persona);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', content: input, timestamp };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are ${currentPersona.name}, the ${currentPersona.role} at ${currentPersona.org}.
Context: ${currentPersona.openingContext}
Personality: ${currentPersona.personality}
Pushback style: ${currentPersona.pushback}

You are in an audit close-out meeting or formal response session. The AI auditor is presenting findings or responding to your feedback.
Be realistic, professional, and appropriately resistant. Push back on vague language, demand evidence, cite your regulatory context.
If the auditor presents solid evidence and clear framework citations, acknowledge it but shift to ROI concerns or implementation timeline.
Keep your response to 2–3 paragraphs. Professional email / meeting tone. Be specific to your org's regulatory context.

Auditor says: ${input}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setMessages(prev => [...prev, {
        role: 'ai',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `[${currentPersona.name} is unavailable — verify GEMINI_API_KEY in the Secrets panel]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const cfg = orgConfig[selectedOrgId];
  const OrgIcon = cfg.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">NPC Stakeholder Simulator</h1>
        <p className="text-zinc-500 mt-1">Practice defending findings. 15 stakeholders across 3 organizations — each with distinct pushback patterns.</p>
      </header>

      {/* Org selector */}
      <div className="flex gap-2">
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
                <p className={`text-[9px] mt-1 text-zinc-400 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>{m.timestamp}</p>
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
// MAIN APP
// ============================================================

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedPhase, setSelectedPhase] = useState<ProgramPhase | null>(null);

  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('auditai-progress') || '[]'); } catch { return []; }
  });
  const [workpaperData, setWorkpaperData] = useState<Record<string, WorkPaperRecord>>(() => {
    try { return JSON.parse(localStorage.getItem('auditai-workpapers') || '{}'); } catch { return {}; }
  });
  const [portfolioPublished, setPortfolioPublished] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('auditai-portfolio') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('auditai-progress', JSON.stringify(completedTasks));
  }, [completedTasks]);
  useEffect(() => {
    localStorage.setItem('auditai-workpapers', JSON.stringify(workpaperData));
  }, [workpaperData]);
  useEffect(() => {
    localStorage.setItem('auditai-portfolio', JSON.stringify(portfolioPublished));
  }, [portfolioPublished]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => prev.includes(taskId) ? prev.filter(t => t !== taskId) : [...prev, taskId]);
  };

  const updateWPStatus = (id: string, status: WorkPaperStatus) => {
    setWorkpaperData(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? { status: 'not-started', criteria: new Array(10).fill(false) }), status }
    }));
  };

  const toggleWPCriterion = (id: string, idx: number) => {
    setWorkpaperData(prev => {
      const current = prev[id] ?? { status: 'not-started', criteria: new Array(10).fill(false) };
      const criteria = [...current.criteria];
      criteria[idx] = !criteria[idx];
      const score = criteria.filter(Boolean).length;
      const status: WorkPaperStatus = score === 0 ? 'not-started' : score >= 9 ? 'complete' : score >= 7 ? 'needs-revision' : 'in-progress';
      return { ...prev, [id]: { status, criteria } };
    });
  };

  const togglePortfolio = (week: number) => {
    setPortfolioPublished(prev => prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]);
  };

  const completedWPCount = (Object.values(workpaperData) as WorkPaperRecord[]).filter(d => d.status === 'complete').length;

  const nav: { view: View; icon: any; label: string; badge?: number }[] = [
    { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { view: 'orgs', icon: Building2, label: 'Organization Hub' },
    { view: 'suts', icon: Boxes, label: 'SUT Inventory' },
    { view: 'workpapers', icon: FileCheck2, label: 'Work Papers', badge: completedWPCount },
    { view: 'frameworks', icon: BookOpen, label: 'Framework Mapper' },
    { view: 'tools', icon: BarChart3, label: 'Tool Stack' },
    { view: 'npc-sim', icon: MessageSquare, label: 'NPC Simulator' },
    { view: 'portfolio', icon: Share2, label: 'Portfolio', badge: portfolioPublished.length },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Sidebar */}
      <aside className="w-60 border-r border-zinc-200 bg-white px-4 py-6 flex flex-col shrink-0">
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
                active={currentView === item.view && !selectedPhase}
                badge={item.badge}
                onClick={() => { setCurrentView(item.view); setSelectedPhase(null); }}
              />
            </Fragment>
          ))}
        </nav>

        <div className="border-t border-zinc-100 pt-3 mt-3">
          <SidebarItem
            icon={Target}
            label="Settings"
            active={currentView === 'settings' && !selectedPhase}
            onClick={() => { setCurrentView('settings'); setSelectedPhase(null); }}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-8 lg:p-10">
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
                    />
                  )}
                  {currentView === 'orgs' && <OrgsView />}
                  {currentView === 'suts' && <SutsView />}
                  {currentView === 'workpapers' && (
                    <WorkpapersView
                      workpaperData={workpaperData}
                      onUpdateStatus={updateWPStatus}
                      onToggleCriterion={toggleWPCriterion}
                    />
                  )}
                  {currentView === 'frameworks' && <FrameworksView />}
                  {currentView === 'tools' && <ToolsView />}
                  {currentView === 'npc-sim' && <NpcSimView />}
                  {currentView === 'portfolio' && (
                    <PortfolioView
                      publishedWeeks={portfolioPublished}
                      onToggle={togglePortfolio}
                    />
                  )}
                  {currentView === 'settings' && (
                    <div className="space-y-8">
                      <header>
                        <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
                        <p className="text-zinc-500 mt-1">Application and program configuration.</p>
                      </header>

                      <Card title="API Configuration">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm leading-relaxed">
                          Set your <strong>GEMINI_API_KEY</strong> in the Secrets panel (or <code>.env</code> file) for the NPC Simulator to call Gemini 1.5 Flash. The NPC Simulator gracefully degrades with an error message if the key is missing.
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
                              setPortfolioPublished([]);
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
    </div>
  );
}
