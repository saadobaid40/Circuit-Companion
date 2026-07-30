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
  Sliders, Radio, ToggleLeft, FileCode, Sigma,
  BookOpen, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Navigation schema ────────────────────────────────────────────────────────

interface NavTool {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: string;
  tools?: NavTool[];
  comingSoon?: boolean;
  isPresets?: boolean;
}

const SECTIONS: NavSection[] = [
  { id: 'home', label: 'Home Dashboard', icon: Home, color: 'text-primary' },
  {
    id: 'core', label: 'Core Circuits & Resistors', icon: Zap, color: 'text-primary',
    tools: [
      { id: 'color-code',      label: 'Color Code',          icon: Palette },
      { id: 'series-parallel', label: 'Series & Parallel',   icon: Share2 },
      { id: 'ohms-law',        label: "Ohm's Law & Divider", icon: Calculator },
      { id: 'op-amp',          label: 'Op-Amp',              icon: Triangle },
      { id: 'filters',         label: 'Filters',             icon: Activity },
      { id: 'smd-led',         label: 'SMD & LED',           icon: Lightbulb },
      { id: 'ac-power',        label: 'AC Power',            icon: Zap },
    ],
  },
  {
    id: 'electronics-ii', label: 'Electronics II Suite', icon: FlaskConical, color: 'text-emerald-400',
    tools: [
      { id: 'mosfet',   label: 'MOSFET & JFET Biasing',  icon: CircuitBoard },
      { id: 'diff-amp', label: 'Diff Amp & CMRR',         icon: Layers },
      { id: 'bode',     label: 'Amplifier Bode Plotter',  icon: TrendingDown },
    ],
  },
  {
    id: 'machinery', label: 'Electrical Machinery', icon: Settings2, color: 'text-orange-400',
    tools: [
      { id: 'dc-motor',    label: 'DC Motor / Generator',   icon: Gauge },
      { id: 'induction',   label: 'Induction Motor & Slip', icon: RefreshCw },
      { id: 'synchronous', label: 'Synchronous Machine',    icon: Compass },
    ],
  },
  {
    id: 'signals', label: 'Signals & Systems', icon: Waves, color: 'text-violet-400',
    tools: [
      { id: 'convolution', label: 'Convolution Visualizer', icon: Shuffle },
      { id: 'pole-zero',   label: 'Pole-Zero Plotter',      icon: Target },
      { id: 'fourier',     label: 'Fourier Synthesizer',    icon: BarChart2 },
    ],
  },
  {
    id: 'micro', label: 'Microprocessors & Digital', icon: Brain, color: 'text-accent',
    tools: [
      { id: 'digital-logic', label: 'Digital Logic & K-Map',  icon: Grid3x3 },
      { id: 'bjt',           label: 'BJT Transistor Bias',    icon: Cpu },
      { id: 'adc-dac',       label: 'ADC / DAC Calculator',   icon: Sliders },
      { id: 'uart',          label: 'UART Baud Rate & Timer', icon: Radio },
      { id: 'register',      label: 'Register Visualizer',    icon: ToggleLeft },
    ],
  },
  {
    id: 'matlab', label: 'MATLAB Studio', icon: Terminal, color: 'text-rose-400',
    tools: [
      { id: 'script-gen',  label: 'Script Generator',  icon: FileCode },
      { id: 'matrix-calc', label: 'Matrix Calculator', icon: Sigma },
    ],
  },
];

const PRESETS_SECTION: NavSection = {
  id: 'presets', label: 'Saved Presets', icon: Bookmark, color: 'text-primary', isPresets: true,
};

function viewForSection(s: NavSection): string {
  if (s.tools?.length) return `${s.id}.${s.tools[0].id}`;
  return s.id;
}

// ── Sub-item ──────────────────────────────────────────────────────────────────

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

// ── Section row ───────────────────────────────────────────────────────────────

function SectionRow({
  section, collapsed, activeView, onViewChange, isOpen, onToggle, onPresetsOpen,
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
        className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-semibold transition-colors
          ${isActive || isSectionActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
      >
        <section.icon
          className={`w-4 h-4 flex-shrink-0 ${section.color ?? 'text-muted-foreground'} ${isActive || isSectionActive ? '!text-primary' : ''}`}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left leading-tight">{section.label}</span>
            {section.comingSoon && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground/70 flex-shrink-0">Soon</span>
            )}
            {hasTools && (
              isOpen
                ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            )}
          </>
        )}
      </button>

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

// ── Desktop sidebar body ──────────────────────────────────────────────────────

function DesktopBody({
  collapsed, onCollapse,
  isDark, onThemeToggle, onPrint,
  activeView, onViewChange,
  openSection, onToggleSection,
  onPresetsOpen, onQuickRef,
}: {
  collapsed: boolean; onCollapse: () => void;
  isDark: boolean; onThemeToggle: () => void; onPrint: () => void;
  activeView: string; onViewChange: (v: string) => void;
  openSection: string; onToggleSection: (id: string) => void;
  onPresetsOpen: () => void; onQuickRef: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-border flex-shrink-0">
        <div className="w-8 h-8 bg-primary/10 border border-primary/30 rounded flex items-center justify-center flex-shrink-0 glow-primary">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-bold text-foreground tracking-tight whitespace-nowrap">ElectroLab Suite</div>
              <div className="text-[9px] text-muted-foreground font-mono tracking-widest whitespace-nowrap uppercase">Precision EE Toolkit</div>
            </div>
            {/* Quick Ref button in header */}
            <button
              onClick={onQuickRef}
              title="EE Quick Reference Cheatsheet"
              className="p-1.5 rounded border border-border bg-muted/20 hover:bg-primary/10 hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        {collapsed && (
          <button onClick={onQuickRef} title="EE Quick Reference"
            className="w-full flex items-center justify-center p-1 rounded border border-border bg-muted/20 hover:bg-primary/10 hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Controls row */}
      <div className={`flex items-center gap-1.5 px-3 py-2.5 border-b border-border flex-shrink-0 ${collapsed ? 'flex-col' : ''}`}>
        <button
          onClick={onThemeToggle}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center gap-1.5 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors
            ${collapsed ? 'p-1.5 w-full justify-center' : 'px-2.5 py-1.5 flex-1'}`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 flex-shrink-0" /> : <Moon className="w-3.5 h-3.5 flex-shrink-0" />}
          {!collapsed && <span className="text-xs font-mono">{isDark ? 'Light' : 'Dark'}</span>}
        </button>
        {!collapsed && (
          <button onClick={onPrint} title="Print Summary"
            className="p-1.5 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <Printer className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {collapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {SECTIONS.map(section => (
          <SectionRow
            key={section.id}
            section={section}
            collapsed={collapsed}
            activeView={activeView}
            onViewChange={onViewChange}
            isOpen={openSection === section.id}
            onToggle={() => onToggleSection(section.id)}
            onPresetsOpen={onPresetsOpen}
          />
        ))}
      </nav>

      {/* Presets footer */}
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
          <button onClick={onPrint} title="Print Summary"
            className="w-full flex items-center justify-center p-1.5 mt-1 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <Printer className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onPresetsOpen: () => void;
  onPrint: () => void;
  onQuickRef: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AppSidebar({
  activeView, onViewChange, isDark, onThemeToggle, onPresetsOpen, onPrint,
  onQuickRef, mobileOpen, onMobileClose,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState<string>('core');

  const toggleSection = (id: string) => setOpenSection(prev => prev === id ? '' : id);

  // Wraps navigation: always also closes the mobile drawer
  const handleViewChange = (view: string) => {
    onViewChange(view);
    onMobileClose();
  };

  return (
    <>
      {/* ── Desktop sidebar (md and up) ──────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-card border-r border-border transition-[width] duration-300 ease-in-out h-full flex-shrink-0 overflow-hidden no-print
          ${collapsed ? 'w-[60px]' : 'w-[252px]'}`}
      >
        <DesktopBody
          collapsed={collapsed}
          onCollapse={() => setCollapsed(c => !c)}
          isDark={isDark}
          onThemeToggle={onThemeToggle}
          onPrint={onPrint}
          activeView={activeView}
          onViewChange={handleViewChange}
          openSection={openSection}
          onToggleSection={toggleSection}
          onPresetsOpen={onPresetsOpen}
          onQuickRef={onQuickRef}
        />
      </aside>

      {/* ── Mobile slide-over drawer (below md) ──────────────────────────── */}

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[270px] flex flex-col bg-card border-r border-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary/10 border border-primary/30 rounded flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">ElectroLab Suite</div>
              <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Precision EE Toolkit</div>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border flex-shrink-0">
          <button
            onClick={onThemeToggle}
            className="flex items-center gap-1.5 flex-1 px-2.5 py-1.5 rounded border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="text-xs font-mono">{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <button
            onClick={() => { onQuickRef(); onMobileClose(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border bg-muted/20 hover:bg-primary/10 hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">Quick Ref</span>
          </button>
        </div>

        {/* Mobile nav (never collapsed) */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {SECTIONS.map(section => (
            <SectionRow
              key={section.id}
              section={section}
              collapsed={false}
              activeView={activeView}
              onViewChange={handleViewChange}
              isOpen={openSection === section.id}
              onToggle={() => toggleSection(section.id)}
              onPresetsOpen={() => { onPresetsOpen(); onMobileClose(); }}
            />
          ))}
        </nav>

        {/* Mobile presets footer */}
        <div className="border-t border-border px-2 py-2 flex-shrink-0">
          <SectionRow
            section={PRESETS_SECTION}
            collapsed={false}
            activeView={activeView}
            onViewChange={handleViewChange}
            isOpen={false}
            onToggle={() => {}}
            onPresetsOpen={() => { onPresetsOpen(); onMobileClose(); }}
          />
        </div>
      </div>
    </>
  );
}
