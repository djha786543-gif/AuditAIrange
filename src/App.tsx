/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Building2, 
  ChevronRight, 
  FileCheck2, 
  LayoutDashboard, 
  MessageSquare, 
  ShieldAlert, 
  Settings, 
  CircleCheck, 
  Clock,
  BookOpen,
  Boxes,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ORGANIZATIONS, SUTS, PHASES, TOOLS, SCENARIOS, RUBRIC_CRITERIA, RISK_RATING_METHODOLOGY, ProgramPhase, Organization, SUT, Tool, Scenario } from './constants';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Types ---
type View = 'dashboard' | 'orgs' | 'suts' | 'frameworks' | 'npc-sim' | 'tools' | 'settings';

// --- Shared Components ---
const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    id={`nav-${label.toLowerCase().replace(' ', '-')}`}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-zinc-900 text-white shadow-sm shadow-zinc-800' 
        : 'text-zinc-500 hover:bg-zinc-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, title, subtitle, className = "" }: any) => (
  <div className={`bg-white border border-zinc-200 rounded-xl overflow-hidden ${className}`}>
    {(title || subtitle) && (
      <div className="px-6 py-4 border-b border-zinc-100">
        {title && <h3 className="font-semibold text-zinc-900">{title}</h3>}
        {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

// --- Content Views ---

const DashboardView = ({ onSelectPhase, completedWeeks, completedWorkpapers }: { onSelectPhase: (p: ProgramPhase) => void, completedWeeks: number, completedWorkpapers: number }) => (
  <div className="space-y-8">
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">
          <Target size={12} />
          Active Engagement
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">AuditAI Range Center</h1>
        <p className="text-zinc-500 mt-1">16 Weeks to AI Audit Self-Mastery • Option C Hybrid Path</p>
      </div>
      <div className="flex gap-4">
        <div className="bg-white border border-zinc-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold text-zinc-400 uppercase leading-none mb-1">Pace</p>
            <p className="text-sm font-bold text-zinc-900">7.2 hrs/avg</p>
          </div>
          <div className="w-px h-8 bg-zinc-100" />
          <div className="text-right">
            <p className="text-[10px] font-bold text-zinc-400 uppercase leading-none mb-1">Workpapers</p>
            <p className="text-sm font-bold text-zinc-900">{completedWorkpapers}/16</p>
          </div>
        </div>
      </div>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Detailed Timeline */}
      <Card title="Program Master Timeline" className="lg:col-span-3 border-zinc-900 bg-zinc-900 text-white overflow-visible">
        <div className="relative pt-2 pb-6">
          <div className="absolute top-7 left-0 right-0 h-1 bg-zinc-800 rounded-full" />
          <div className="flex justify-between relative">
            {PHASES.map((phase) => {
              const [startWeek] = phase.weeks.split('-').map(Number);
              const isActive = startWeek <= 1; // Simulation
              return (
                <div key={phase.id} className="flex flex-col items-center group cursor-pointer" onClick={() => onSelectPhase(phase)}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-zinc-900 z-10 transition-all ${
                    isActive ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-zinc-800'
                  }`}>
                    <span className="text-[10px] font-bold text-white">{phase.id}</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-[10px] font-bold uppercase transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                      PH {phase.id}
                    </p>
                    <p className="text-[8px] text-zinc-600 font-mono mt-0.5">WKS {phase.weeks}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-2 border-t border-zinc-800 pt-3">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Current Stage: Week 1 Foundation & Discovery
        </div>
      </Card>

      <Card title="Cert Status" className="bg-amber-50 border-amber-200">
        <div className="flex items-center justify-center h-full flex-col text-center space-y-2">
          <ShieldAlert className="text-amber-500 mb-2" size={32} />
          <h4 className="font-bold text-amber-900 text-sm">AIRTP+ Scheduled</h4>
          <p className="text-[10px] text-amber-700 italic">Exam Window: Week 6 Friday</p>
          <div className="w-full bg-amber-200 h-1.5 rounded-full mt-4">
            <div className="bg-amber-500 h-full w-[15%]" />
          </div>
          <p className="text-[9px] font-bold text-amber-800 uppercase tracking-tighter">Readiness: 15%</p>
        </div>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {PHASES.map((phase) => (
        <motion.div
          key={phase.id}
          whileHover={{ y: -4 }}
          onClick={() => onSelectPhase(phase)}
          className="cursor-pointer group"
        >
          <Card className="h-full border-zinc-200 group-hover:border-zinc-900 group-hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-2 py-1 rounded-md uppercase tracking-wider">Phase {phase.id}</span>
              <div className="flex items-center gap-1 text-zinc-400 text-[10px] font-bold">
                <Clock size={10} />
                {phase.weeks} WKS
              </div>
            </div>
            <h4 className="text-lg font-bold mb-2 text-zinc-900 group-hover:text-blue-600 transition-colors leading-tight">{phase.title}</h4>
            <p className="text-xs text-zinc-500 line-clamp-2 mb-6 leading-relaxed">{phase.description}</p>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Deliverables</p>
              <div className="flex flex-wrap gap-1.5">
                {phase.deliverables.slice(0, 3).map((d) => (
                  <span key={d} className="text-[9px] bg-white border border-zinc-100 px-2 py-1 rounded-md text-zinc-500 lowercase">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

const OrgsView = () => (
  <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-bold text-zinc-900">Anchor Organizations</h1>
      <p className="text-zinc-500">Mult-vertical scenarios designed to surface different regulatory contexts.</p>
    </header>

    <div className="space-y-6">
      {ORGANIZATIONS.map((org) => (
        <Card key={org.id} title={org.name} subtitle={org.industry}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase text-zinc-400">Context</h5>
              <p className="text-sm text-zinc-700 leading-relaxed italic border-l-2 border-zinc-200 pl-4">
                "{org.context}"
              </p>
            </div>
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase text-zinc-400">Footprint</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <span className="text-xs font-mono bg-zinc-100 px-1 py-0.5 rounded">SIZE</span>
                  {org.size}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <span className="text-xs font-mono bg-zinc-100 px-1 py-0.5 rounded">GEO</span>
                  {org.geography}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase text-zinc-400">Regulatory & Map</h5>
              <div className="flex flex-wrap gap-2">
                {org.regulatoryExposure.map(reg => (
                  <span key={reg} className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                    {reg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const SutsView = () => (
  <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-bold text-zinc-900">Systems Under Test (SUTs)</h1>
      <p className="text-zinc-500">The technical backbone — 10 deliberately vulnerable AI systems.</p>
    </header>

    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="pb-4 pt-2 font-mono text-xs text-zinc-400 font-normal">#</th>
              <th className="pb-4 pt-2 font-bold text-zinc-900">System Name</th>
              <th className="pb-4 pt-2 font-bold text-zinc-900 text-sm">Org</th>
              <th className="pb-4 pt-2 font-bold text-zinc-900 text-sm">Type</th>
              <th className="pb-4 pt-2 font-bold text-zinc-900 text-sm">EU Risk Tier</th>
              <th className="pb-4 pt-2 font-bold text-zinc-900 text-sm">Primary Test</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {SUTS.map((sut) => (
              <tr key={sut.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="py-4 font-mono text-xs text-zinc-400">{sut.id}</td>
                <td className="py-4 font-bold text-zinc-900">{sut.name}</td>
                <td className="py-4">
                   <span className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded font-medium">{sut.org}</span>
                </td>
                <td className="py-4 text-sm text-zinc-600">{sut.type}</td>
                <td className="py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    sut.riskTier.includes('High') 
                      ? 'bg-rose-50 border-rose-200 text-rose-700' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                  }`}>
                    {sut.riskTier}
                  </span>
                </td>
                <td className="py-4 text-sm text-zinc-500 font-mono italic">{sut.primaryTest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

const ToolsView = () => (
  <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-bold text-zinc-900">Tool Stack</h1>
      <p className="text-zinc-500">The industry-standard toolkit for AI auditing and red-teaming.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(['Adversarial', 'Bias', 'EVAL', 'Governance'] as const).map(category => (
        <Card key={category} title={category} subtitle={`Resources for ${category.toLowerCase()} phase`}>
          <div className="space-y-4">
            {TOOLS.filter(t => t.category === category).map(tool => (
              <div key={tool.name} className="flex flex-col p-3 border border-zinc-100 rounded-lg hover:border-zinc-300 transition-all">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-zinc-900">{tool.name}</span>
                  <span className="text-[10px] font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">PHASE {tool.phase}</span>
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

const FrameworksView = () => (
  <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-bold text-zinc-900">Framework Crosswalk Layer</h1>
      <p className="text-zinc-500">Mapping finding types to applicable framework controls.</p>
    </header>

    <Card title="Standard Crosswalk Matrix" subtitle="Pre-built mapping definitions (csv excerpt)">
      <div className="overflow-x-auto -mx-6 mb-[-24px]">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-zinc-50 border-y border-zinc-200">
            <tr>
              <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-zinc-500">Finding Type</th>
              <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-zinc-500">NIST AI RMF</th>
              <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-zinc-500">ISO 42001</th>
              <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-zinc-500">EU AI Act</th>
              <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-zinc-500">OWASP LLM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {[
              { type: 'Prompt Injection', nist: 'Measure 2.7', iso: 'A.6.2.4', eu: 'Art. 15', owasp: 'LLM01' },
              { type: 'Data Leakage', nist: 'Measure 2.10', iso: 'A.7.4', eu: 'Art. 10', owasp: 'LLM06' },
              { type: 'Bias / Fairness', nist: 'Measure 2.11', iso: 'A.6.2.6', eu: 'Annex III §4', owasp: '—' },
              { type: 'Hallucination', nist: 'Measure 2.7', iso: 'A.6.2.4', eu: 'Art. 13', owasp: 'LLM09' },
              { type: 'Vendor Risk', nist: 'Govern 6.1', iso: 'A.10.2', eu: 'Art. 25, 28', owasp: '—' },
            ].map((row) => (
              <tr key={row.type}>
                <td className="px-6 py-4 font-bold text-zinc-900">{row.type}</td>
                <td className="px-6 py-4 text-sm font-mono">{row.nist}</td>
                <td className="px-6 py-4 text-sm font-mono">{row.iso}</td>
                <td className="px-6 py-4 text-sm font-mono">{row.eu}</td>
                <td className="px-6 py-4 text-sm font-mono">{row.owasp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

const NpcSimView = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai' | 'system', content: string, timestamp: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(NPC_PERSONAS[0]);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  
  const sendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user' as const, content: input, timestamp };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are ${currentPersona.name}, the ${currentPersona.role} at an organization being audited for AI. 
      Your personality is ${currentPersona.personality}. 
      Your goal is to push back on audit findings realistically based on your specific style: ${currentPersona.pushback}.
      Be professional, perhaps a bit weary or defensive. If the auditor is vague, call it out. If they citing a framework correctly, acknowledge it but move the goalposts to ROI or theoretical vs practical risk.
      
      Auditor's current finding/comment: ${input}
      
      Keep your response to 2-3 paragraphs maximum. Use a professional email/meeting tone.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setMessages(prev => [...prev, { 
        role: 'ai' as const, 
        content: response.text(), 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai' as const, 
        content: `${currentPersona.name} is currently unavailable. Please verify your GEMINI_API_KEY in the Secrets panel.`, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-120px)] flex flex-col">
       <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">NPC Stakeholder Sim</h1>
        <p className="text-zinc-500">Practice your audit report close-out meetings. Defend your findings against pushback.</p>
      </header>

      <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl w-fit">
        {NPC_PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => {
               setCurrentPersona(p);
               setMessages([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentPersona.id === p.id 
                ? 'bg-white text-zinc-900 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 border border-zinc-200 rounded-2xl flex flex-col bg-white overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              {currentPersona.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-bold text-zinc-900 leading-none">{currentPersona.name}</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">{currentPersona.role}</p>
            </div>
          </div>
          <div className="hidden md:block max-w-xs">
            <p className="text-[10px] text-zinc-400 italic text-right leading-tight">
              {currentPersona.personality}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={32} className="text-zinc-200" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">Stakeholder Meeting Initiated</h3>
              <p className="text-sm text-zinc-500">
                You are in the final review meeting for the AI Audit of {currentPersona.name === 'Sarah Chen' ? 'Stellar Bank' : 'their organization'}. 
                Present your findings or defend your recent report.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] group`}>
                <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-zinc-900 text-white rounded-tr-none' 
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-tl-none font-serif text-[15px]'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <p className={`text-[10px] mt-1 text-zinc-400 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" />
               </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 bg-white">
          <div className="max-w-4xl mx-auto flex gap-3">
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Debate your findings with ${currentPersona.name}...`}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none overflow-hidden"
            />
            <button 
              disabled={!input.trim() || isTyping}
              onClick={sendMessage}
              className="bg-zinc-900 text-white p-3 rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-2 uppercase tracking-widest font-bold">Press Enter to send • Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedPhase, setSelectedPhase] = useState<ProgramPhase | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    const saved = localStorage.getItem('auditai-progress');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('auditai-progress', JSON.stringify(completedTasks));
  }, [completedTasks]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) ? prev.filter(t => t !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-200 bg-white p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2 text-zinc-900">
          <ShieldAlert className="fill-zinc-900 text-white" />
          <span className="font-bold tracking-tight text-xl">AuditAI</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => { setCurrentView('dashboard'); setSelectedPhase(null); }} 
          />
          <SidebarItem 
            icon={Building2} 
            label="Organization Hub" 
            active={currentView === 'orgs'} 
            onClick={() => setCurrentView('orgs')} 
          />
          <SidebarItem 
            icon={Boxes} 
            label="SUT Inventory" 
            active={currentView === 'suts'} 
            onClick={() => setCurrentView('suts')} 
          />
          <SidebarItem 
            icon={BookOpen} 
            label="Framework Mapper" 
            active={currentView === 'frameworks'} 
            onClick={() => setCurrentView('frameworks')} 
          />
          <SidebarItem 
            icon={Settings} 
            label="Tool Stack" 
            active={currentView === 'tools'} 
            onClick={() => setCurrentView('tools')} 
          />
          <SidebarItem 
            icon={MessageSquare} 
            label="NPC Simulator" 
            active={currentView === 'npc-sim'} 
            onClick={() => setCurrentView('npc-sim')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={currentView === 'settings'} 
            onClick={() => setCurrentView('settings')} 
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-10">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (selectedPhase?.id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {selectedPhase ? (
                <div className="space-y-8">
                  <button 
                    onClick={() => setSelectedPhase(null)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors text-sm font-medium"
                   >
                    <ChevronRight className="rotate-180" size={16} />
                    Back to Program Map
                  </button>
                  
                  <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                       <span className="text-xs font-mono font-bold bg-zinc-900 text-white px-3 py-1 rounded">PHASE {selectedPhase.id}</span>
                       <span className="text-sm font-medium text-zinc-400">Weeks {selectedPhase.weeks}</span>
                    </div>
                    <h2 className="text-4xl font-bold text-zinc-900 mb-4">{selectedPhase.title}</h2>
                    <p className="text-xl text-zinc-500 mb-10 max-w-2xl leading-relaxed">{selectedPhase.description}</p>
                    
                    <div className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-zinc-100">
                        <div>
                          <h4 className="flex items-center gap-2 font-bold mb-4 text-zinc-900">
                            <Target size={18} className="text-blue-500" />
                            Primary Activities
                          </h4>
                          <ul className="space-y-3">
                            {selectedPhase.primaryActivities.map(a => (
                              <li key={a} className="flex items-center gap-3 text-zinc-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-2 font-bold mb-4 text-zinc-900">
                            <CircleCheck size={18} className="text-green-500" />
                            Key Deliverables
                          </h4>
                          <ul className="space-y-3">
                            {selectedPhase.deliverables.map(d => (
                              <li 
                                key={d} 
                                onClick={() => toggleTask(`d-${selectedPhase.id}-${d}`)}
                                className="flex items-center gap-3 text-zinc-600 cursor-pointer group"
                              >
                                 <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                                   completedTasks.includes(`d-${selectedPhase.id}-${d}`) 
                                     ? 'bg-green-500 border-green-500 text-white' 
                                     : 'border-zinc-200 group-hover:border-zinc-400'
                                 }`}>
                                   {completedTasks.includes(`d-${selectedPhase.id}-${d}`) && <CircleCheck size={14} />}
                                 </div>
                                 {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-zinc-100">
                        <h4 className="text-lg font-bold mb-6 text-zinc-900">Scenario Deep-Dive</h4>
                        <div className="space-y-6">
                           {SCENARIOS.filter(s => s.phaseId === selectedPhase.id).map(scenario => (
                             <div key={scenario.week} className="p-6 border border-zinc-200 rounded-xl bg-zinc-50/50">
                                <div className="flex items-center justify-between mb-4">
                                  <h5 className="font-bold text-zinc-900">Week {scenario.week}: {scenario.title}</h5>
                                  <span className="text-[10px] font-mono font-bold bg-white border border-zinc-200 px-2 py-1 rounded">SUT: {scenario.suts.join(', ')}</span>
                                </div>
                                <p className="text-sm text-zinc-600 mb-4">{scenario.objective}</p>
                                <div className="grid grid-cols-2 gap-4">
                                   <div>
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Checklist</p>
                                      <ul className="space-y-1">
                                        {scenario.checklists.map(c => (
                                          <li key={c} className="text-xs text-zinc-500 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                            {c}
                                          </li>
                                        ))}
                                      </ul>
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Tools Used</p>
                                      <div className="flex flex-wrap gap-1">
                                        {scenario.tools.map(t => (
                                          <span key={t} className="text-[10px] bg-white border border-zinc-100 px-1.5 py-0.5 rounded text-zinc-400">{t}</span>
                                        ))}
                                      </div>
                                   </div>
                                </div>
                             </div>
                           ))}
                           {SCENARIOS.filter(s => s.phaseId === selectedPhase.id).length === 0 && (
                             <p className="text-sm text-zinc-400 italic">Extended scenario data pending implementation for this phase.</p>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {currentView === 'dashboard' && (
                    <DashboardView 
                      onSelectPhase={setSelectedPhase} 
                      completedWeeks={completedTasks.filter(t => t.startsWith('w-')).length} 
                      completedWorkpapers={completedTasks.filter(t => t.startsWith('d-')).length}
                    />
                  )}
                  {currentView === 'orgs' && <OrgsView />}
                  {currentView === 'suts' && <SutsView />}
                  {currentView === 'frameworks' && (
                    <div className="space-y-8">
                       <FrameworksView />
                       <Card title="Risk Rating Methodology" subtitle="Severity x Likelihood model for audit findings">
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Severity Scale (AI-Context)</h5>
                               <div className="space-y-2">
                                  {RISK_RATING_METHODOLOGY.severityScale.map(s => (
                                    <div key={s.level} className="flex items-start gap-3 p-2 bg-zinc-50 rounded-lg">
                                       <span className="font-mono text-xs font-bold text-zinc-900 bg-white border border-zinc-200 w-6 h-6 flex items-center justify-center shrink-0 rounded">{s.level}</span>
                                       <div>
                                          <p className="text-xs font-bold text-zinc-900">{s.label}</p>
                                          <p className="text-[10px] text-zinc-500">{s.detail}</p>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-6">
                               <div>
                                  <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Risk Thresholds</h5>
                                  <div className="flex gap-2">
                                     {RISK_RATING_METHODOLOGY.ratingTiers.map(t => (
                                       <div key={t.label} className="flex-1 flex flex-col items-center">
                                          <div className={`w-full h-8 ${t.color} rounded-md mb-2 flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                                             {t.min}-{t.max}
                                          </div>
                                          <span className="text-[10px] font-bold text-zinc-900">{t.label}</span>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                               <div className="p-4 bg-zinc-900 rounded-xl text-white">
                                  <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Calculation Invariant</p>
                                  <p className="text-lg font-mono font-bold tracking-tighter">{RISK_RATING_METHODOLOGY.formula}</p>
                                  <p className="text-[10px] text-zinc-500 mt-2 italic">*Apply this methodology to every finding before mapping to framework controls.</p>
                               </div>
                            </div>
                         </div>
                       </Card>
                    </div>
                  )}
                  {currentView === 'tools' && <ToolsView />}
                  {currentView === 'npc-sim' && <NpcSimView />}
                  {currentView === 'settings' && (
                    <Card title="Settings" subtitle="Application and API configuration">
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                          Ensure your <strong>GEMINI_API_KEY</strong> is set in the AI Studio Secrets panel for the NPC Simulator to function.
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                          <span className="text-sm font-medium">Dark Mode</span>
                          <div className="w-10 h-5 bg-zinc-200 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm font-medium">Auto-save Progress</span>
                          <div className="w-10 h-5 bg-green-500 rounded-full relative">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                  {currentView === 'settings' && (
                    <Card title="Audit Standards (ISACA-Aligned)" subtitle="Self-assessment criteria for every work paper" className="mt-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {RUBRIC_CRITERIA.map((criterion, idx) => (
                            <div key={idx} className="flex gap-3 items-start p-3 bg-zinc-50 rounded-lg">
                               <div className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</div>
                               <p className="text-xs text-zinc-600 leading-tight">{criterion}</p>
                            </div>
                          ))}
                       </div>
                    </Card>
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

// --- NPC Data ---
const NPC_PERSONAS = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    role: 'Chief Risk Officer',
    personality: 'Direct, regulator-experienced, low tolerance for vague findings.',
    pushback: 'Demands citation of specific SR 11-7 sections, asks "what would the OCC say in their next view?"'
  },
  {
    id: 'marcus-vane',
    name: 'Marcus Vane',
    role: 'Head of AI Engineering',
    personality: 'Technical, defensive, protective of his models.',
    pushback: 'Argues findings are theoretical, demands Proof-of-Concept for injection attacks.'
  },
  {
    id: 'elena-rodriguez',
    name: 'Elena Rodriguez',
    role: 'Compliance Officer',
    personality: 'Risk-averse, regulator-focused.',
    pushback: 'Asks for multi-framework crosswalks and precedent from other peer banks.'
  }
];

