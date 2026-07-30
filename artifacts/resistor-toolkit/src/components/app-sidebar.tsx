import { useState } from 'react';
import {
  Home, Zap, FlaskConical, Settings2, Waves, Brain, Terminal,
  Bookmark, Sun, Moon, PanelLeftClose, PanelLeft,
  ChevronDown, ChevronRight,
  Palette, Share2, Calculator, Triangle, Activity,
  Lightbulb, Grid3x3, Cpu, Printer,
  CircuitBoard, Layers, TrendingDown,
  Gauge, RefreshCw, Compass,
  Shuffle, Target, BarChart2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Navigation schema ────────────────────────────────────────────────────────

interface NavTool {
  id: string;         // becomes activeView = `${sectionId}.${id}`
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  id: string;         // activeView = id (when no tools) or section prefix
  label: string;
  icon: LucideIcon;
  color?: string;     // accent colour for the icon
  tools?: NavTool[];
  comingSoon?: boolean;
  isPresets?: boolean;
}

const SECTIONS: NavSection[] = [
  {
    id: 'home',
    label: 'Home Dashboard',
    icon: Home,
    color: 'text-primary',
  },
  {
    id: 'core',
    label: 'Core Circuits & Resistors',
    icon: Zap,
    color: 'text-primary',
    tools: [
      { id: 'color-code',      label: 'Color Code',         icon: Palette },
      { id: 'series-parallel', label: 'Series & Parallel',  icon: Share2 },
      { id: 'ohms-law',        label: "Ohm's Law & Divider",icon: Calculator },
      { id: 'op-amp',          label: 'Op-Amp',             icon: Triangle },
      { id: 'filters',         label: 'Filters',            icon: Activity },
      { id: 'smd-led',         label: 'SMD & LED',          icon: Lightbulb },
      { id: 'ac-power',        label: 'AC Power',           icon: Zap },
    ],
  },
  {
    id: 'electronics-ii',
    label: 'Electronics II Suite',
    icon: FlaskConical,
    color: 'text-emerald-400',
    tools: [
      { id: 'mosfet',   label: 'MOSFET & JFET Biasing', icon: CircuitBoard },
      { id: 'diff-amp', label: 'Diff Amp & CMRR',        icon: Layers },
      { id: 'bode',     label: 'Amplifier Bode Plotter', icon: TrendingDown },
    ],
  },
  {
    id: 'machinery',
    label: 'Electrical Machinery',
    icon: Settings2,
    color: 'text-orange-400',
    tools: [
      { id: 'dc-motor',    label: 'DC Motor / Generator',   icon: Gauge },
      { id: 'induction',   label: 'Induction Motor & Slip', icon: RefreshCw },
      { id: 'synchronous', label: 'Synchronous Machine',    icon: Compass },
    ],
  },
  {
    id: 'signals',
    label: 'Signals & Systems',
    icon: Waves,
    color: 'text-violet-400',
    tools: [
      { id: 'convolution', label: 'Convolution Visualizer', icon: Shuffle },
      { id: 'pole-zero',   label: 'Pole-Zero Plotter',      icon: Target },
      { id: 'fourier',     label: 'Fourier Synthesizer',    icon: BarChart2 },
    ],
  },
  {
    id: 'micro',
    label: 'Microprocessors & Digital',
    icon: Brain,
    color: 'text-accent',
    tools: [
      { id: 'digital-logic', label: 'Digital Logic & K-Map', icon: Grid3x3 },
      { id: 'bjt',           label: 'BJT Transistor Bias',   icon: Cpu },
    ],
  },
  {
    id: 'matlab',
    label: 'MATLAB Studio',
    icon: Terminal,
    color: 'text-rose-400',
    comingSoon: true,
  },
];

const PRESETS_SECTION: NavSection = {
  id: 'presets',
  label: 'Saved Presets',
  icon: Bookmark,
  color: 'text-primary',
  isPresets: true,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function viewForSection(s: NavSection): string {
  if (s.tools && s.tools.length > 0) return `${s.id}.${s.tools[0].id}`;
  return s.id;
}

// ── Sub-item row ─────────────────────────────────────────────────────────────

function SubItem({
  tool, sectionId, activeView, onViewChange,
}: {
  tool: NavTool;
  sectionId: string;
  activeView: string;
  onViewChange: (v: string) => void;
}) {
  const viewId = `${sectionId}.${tool.id}`;
  const isActive = activeView === viewId;
  return (
    <button
      onClick={() => onViewChange(viewId)}
      className={`w-full flex items-center gap-2.5 pl-9 pr-3 py-1.5 text-left text-sm rounded transition-colors
        ${isActive
          ? 'bg-primary/15 text-primary font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
        }`}
    >
      <tool.icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate">{tool.label}</span>
    </button>
  );
}

// ── Section row ──────────────────────────────────────────────────────────────

function SectionRow({
  section, collapsed, activeView, onViewChange,
  isOpen, onToggle, onPresetsOpen,
}: {
  section: NavSection;
  collapsed: boolean;
  activeView: string;
  onViewChange: (v: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onPresetsOpen: () => void;
}) {
  const hasTools = !!section.tools?.length;
  const isActive = !hasTools && (activeView === section.id || activeView.startsWith(section.id + '.'));
  const isSectionActive = hasTools && activeView.startsWith(section.id + '.');

  const handleClick = () => {
    if (section.isPresets) { onPresetsOpen(); return; }
    if (hasTools) {
      onToggle();
      if (!isOpen) onViewChange(viewForSection(section));
    } else {
      onViewChange(section.id);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        title={collapsed ? section.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-semibold transition-colors group
          ${isActive || isSectionActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
      >
        <section.icon className={`w-4.5 h-4.5 flex-shrink-0 ${section.color ?? 'text-muted-foreground'} ${isActive || isSectionActive ? '!text-primary' : ''}`} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left leading-tight">{section.label}</span>
            {section.comingSoon && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground/70 flex-shrink-0">
                Soon
              </span>
            )}
            {hasTools && (
              isOpen
                ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            )}
          </>
        )}
      </button>

      {/* Sub-items */}
      {!collapsed && hasTools && isOpen && (
        <div className="mt-0.5 mb-1">
          {section.tools!.map(tool => (
            <SubItem
              key={tool.id}
              tool={tool}
              sectionId={section.id}
              activeView={activeView}
              onViewChange={onViewChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onPresetsOpen: () => void;
  onPrint: () => void;
}

export function AppSidebar({
  activeView, onViewChange, isDark, onThemeToggle, onPresetsOpen, onPrint,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState<string>('core');

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? '' : id);
  };

  return (
    <aside
      className={`flex flex-col bg-card border-r border-border transition-[width] duration-300 ease-in-out h-full flex-shrink-0 overflow-hidden no-print
        ${collapsed ? 'w-[60px]' : 'w-[252px]'}`}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-border flex-shrink-0">
        <div className="w-8 h-8 bg-primary/10 border border-primary/30 rounded flex items-center justify-center flex-shrink-0 glow-primary">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-foreground tracking-tight whitespace-nowrap">ElectroLab Suite</div>
            <div className="text-[9px] text-muted-foreground font-mono tracking-widest whitespace-nowrap uppercase">Precision EE Toolkit</div>
          </div>
        )}
      </div>

      {/* ── Controls row (theme + collapse) ── */}
      <div className={`flex items-center gap-1.5 px-3 py-2.5 border-b border-border flex-shrink-0 ${collapsed ? 'flex-col' : ''}`}>
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center gap-1.5 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors
            ${collapsed ? 'p-1.5 w-full justify-center' : 'px-2.5 py-1.5 flex-1'}`}
        >
          {isDark
            ? <Sun className="w-3.5 h-3.5 flex-shrink-0" />
            : <Moon className="w-3.5 h-3.5 flex-shrink-0" />}
          {!collapsed && (
            <span className="text-xs font-mono">{isDark ? 'Light' : 'Dark'}</span>
          )}
        </button>

        {/* Print button */}
        {!collapsed && (
          <button
            onClick={onPrint}
            title="Print Summary"
            className="p-1.5 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {collapsed
            ? <PanelLeft className="w-3.5 h-3.5" />
            : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Nav sections ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {SECTIONS.map(section => (
          <SectionRow
            key={section.id}
            section={section}
            collapsed={collapsed}
            activeView={activeView}
            onViewChange={onViewChange}
            isOpen={openSection === section.id}
            onToggle={() => toggleSection(section.id)}
            onPresetsOpen={onPresetsOpen}
          />
        ))}
      </nav>

      {/* ── Saved Presets pinned at bottom ── */}
      <div className="border-t border-border px-2 py-2 flex-shrink-0">
        <SectionRow
          section={PRESETS_SECTION}
          collapsed={collapsed}
          activeView={activeView}
          onViewChange={onViewChange}
          isOpen={false}
          onToggle={() => {}}
          onPresetsOpen={onPresetsOpen}
        />
        {collapsed && (
          <button
            onClick={onPrint}
            title="Print Summary"
            className="w-full flex items-center justify-center p-1.5 mt-1 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
}
