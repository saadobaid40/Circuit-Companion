import { useState, useEffect, useRef } from 'react';
import { Search, X,
  Home, Palette, Share2, Calculator, Triangle, Activity, Lightbulb, Zap,
  CircuitBoard, Layers, TrendingDown,
  Gauge, RefreshCw, Compass,
  Shuffle, Target, BarChart2,
  Grid3x3, Cpu, Sliders, Radio, ToggleLeft,
  FileCode, Sigma,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ToolEntry {
  view: string;
  label: string;
  section: string;
  sectionColor: string;
  icon: LucideIcon;
  keywords: string[];
}

const ALL_TOOLS: ToolEntry[] = [
  { view: 'home',                    label: 'Home Dashboard',           section: 'Navigation',      sectionColor: 'text-muted-foreground',  icon: Home,        keywords: ['home', 'dashboard', 'start', 'overview'] },
  // Core Circuits
  { view: 'core.color-code',         label: 'Color Code',               section: 'Core Circuits',   sectionColor: 'text-primary',           icon: Palette,    keywords: ['resistor', '4 band', '5 band', 'colour', 'ring', 'ohm'] },
  { view: 'core.series-parallel',    label: 'Series & Parallel',        section: 'Core Circuits',   sectionColor: 'text-primary',           icon: Share2,     keywords: ['series', 'parallel', 'equivalent', 'network', 'combination'] },
  { view: 'core.ohms-law',           label: "Ohm's Law & Divider",      section: 'Core Circuits',   sectionColor: 'text-primary',           icon: Calculator, keywords: ['ohm', 'voltage divider', 'current divider', 'kirchhoff', 'vr'] },
  { view: 'core.op-amp',             label: 'Op-Amp',                   section: 'Core Circuits',   sectionColor: 'text-primary',           icon: Triangle,   keywords: ['operational amplifier', 'inverting', 'gain', '741', 'non-inverting', 'opamp'] },
  { view: 'core.filters',            label: 'RC/RL Filters',            section: 'Core Circuits',   sectionColor: 'text-primary',           icon: Activity,   keywords: ['filter', 'rc', 'rl', 'cutoff', 'low pass', 'high pass', 'bandpass', 'frequency'] },
  { view: 'core.smd-led',            label: 'SMD & LED',                section: 'Core Circuits',   sectionColor: 'text-primary',           icon: Lightbulb,  keywords: ['smd', 'led', 'surface mount', 'package', 'diode', 'current limiting', 'light'] },
  { view: 'core.ac-power',           label: 'AC Power',                 section: 'Core Circuits',   sectionColor: 'text-primary',           icon: Zap,        keywords: ['ac', 'power factor', 'reactive', 'apparent', 'real', 'phasor', 'rms', 'var', 'three phase'] },
  // Electronics II
  { view: 'electronics-ii.mosfet',   label: 'MOSFET & JFET Biasing',   section: 'Electronics II',  sectionColor: 'text-emerald-400',       icon: CircuitBoard, keywords: ['mosfet', 'jfet', 'fet', 'field effect', 'bias', 'pinch off', 'threshold', 'vgs'] },
  { view: 'electronics-ii.diff-amp', label: 'Diff Amp & CMRR',         section: 'Electronics II',  sectionColor: 'text-emerald-400',       icon: Layers,     keywords: ['differential', 'cmrr', 'common mode', 'rejection', 'diff pair', 'instrumentation'] },
  { view: 'electronics-ii.bode',     label: 'Amplifier Bode Plotter',  section: 'Electronics II',  sectionColor: 'text-emerald-400',       icon: TrendingDown, keywords: ['bode', 'frequency response', 'gain margin', 'phase margin', 'stability', 'amplifier', 'pole'] },
  // Machinery
  { view: 'machinery.dc-motor',      label: 'DC Motor / Generator',    section: 'Machinery',       sectionColor: 'text-orange-400',        icon: Gauge,      keywords: ['dc motor', 'generator', 'armature', 'back emf', 'torque', 'speed', 'brushed'] },
  { view: 'machinery.induction',     label: 'Induction Motor & Slip',  section: 'Machinery',       sectionColor: 'text-orange-400',        icon: RefreshCw,  keywords: ['induction', 'slip', 'synchronous speed', 'rotor', 'squirrel cage', 'asynchronous', 'ns'] },
  { view: 'machinery.synchronous',   label: 'Synchronous Machine',     section: 'Machinery',       sectionColor: 'text-orange-400',        icon: Compass,    keywords: ['synchronous', 'machine', 'phasor', 'power angle', 'excitation', 'salient pole', 'delta'] },
  // Signals
  { view: 'signals.convolution',     label: 'Convolution Visualizer',  section: 'Signals',         sectionColor: 'text-violet-400',        icon: Shuffle,    keywords: ['convolution', 'lti', 'impulse response', 'flip shift', 'signal'] },
  { view: 'signals.pole-zero',       label: 'Pole-Zero Plotter',       section: 'Signals',         sectionColor: 'text-violet-400',        icon: Target,     keywords: ['pole zero', 'transfer function', 'stability', 'laplace', 's-plane', 'root'] },
  { view: 'signals.fourier',         label: 'Fourier Synthesizer',     section: 'Signals',         sectionColor: 'text-violet-400',        icon: BarChart2,  keywords: ['fourier', 'fft', 'frequency', 'spectrum', 'synthesis', 'harmonics', 'dft'] },
  // Microprocessors
  { view: 'micro.digital-logic',     label: 'Digital Logic & K-Map',   section: 'Microprocessors', sectionColor: 'text-cyan-400',          icon: Grid3x3,    keywords: ['digital', 'logic', 'kmap', 'karnaugh', 'boolean', 'gates', 'minimization', 'minterms'] },
  { view: 'micro.bjt',               label: 'BJT Transistor Bias',     section: 'Microprocessors', sectionColor: 'text-cyan-400',          icon: Cpu,        keywords: ['bjt', 'transistor', 'npn', 'pnp', 'bias', 'beta', 'hfe', 'collector', 'emitter', 'ce'] },
  { view: 'micro.adc-dac',           label: 'ADC / DAC Calculator',    section: 'Microprocessors', sectionColor: 'text-cyan-400',          icon: Sliders,    keywords: ['adc', 'dac', 'analog digital', 'resolution', 'quantization', 'lsb', 'snr', 'bits'] },
  { view: 'micro.uart',              label: 'UART Baud Rate & Timer',  section: 'Microprocessors', sectionColor: 'text-cyan-400',          icon: Radio,      keywords: ['uart', 'baud', 'serial', 'timer', 'reload', 'tlr', 'communication', 'prescaler', 'rs232'] },
  { view: 'micro.register',          label: 'Register Visualizer',     section: 'Microprocessors', sectionColor: 'text-cyan-400',          icon: ToggleLeft, keywords: ['register', 'bit', 'mask', 'bitwise', 'set', 'clear', 'toggle', 'binary', 'hex', 'gpio'] },
  // MATLAB
  { view: 'matlab.script-gen',       label: 'MATLAB Script Generator', section: 'MATLAB Studio',   sectionColor: 'text-rose-400',          icon: FileCode,   keywords: ['matlab', 'octave', 'script', 'bode', 'fft', 'nodal', 'convolution', 'code gen', 'export'] },
  { view: 'matlab.matrix-calc',      label: 'Matrix Calculator',       section: 'MATLAB Studio',   sectionColor: 'text-rose-400',          icon: Sigma,      keywords: ['matrix', 'inverse', 'determinant', 'eigenvalue', 'solve', 'linear algebra', 'ax=b', 'gauss'] },
];

function matchTool(tool: ToolEntry, q: string): boolean {
  const query = q.toLowerCase().trim();
  if (!query) return true;
  const haystack = `${tool.label} ${tool.section} ${tool.keywords.join(' ')}`.toLowerCase();
  // All words must appear somewhere
  return query.split(/\s+/).every(w => haystack.includes(w));
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = ALL_TOOLS.filter(t => matchTool(t, query));

  // Focus + reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Reset index on query change
  useEffect(() => { setActiveIdx(0); }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const commit = (view: string) => {
    onNavigate(view);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); break;
      case 'ArrowUp':   e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); break;
      case 'Enter':     if (results[activeIdx]) commit(results[activeIdx].view); break;
      case 'Escape':    onClose(); break;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh] pb-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl flex flex-col bg-card border border-border rounded-xl shadow-2xl overflow-hidden
        animate-in fade-in slide-in-from-top-3 duration-200">

        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools — K-Map, Bode, MOSFET, ADC…"
            className="flex-1 bg-transparent outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground/55 min-w-0"
          />
          {query ? (
            <button onClick={() => setQuery('')}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/30 border border-border rounded gap-0.5">
              ESC
            </kbd>
          )}
        </div>

        {/* Results list */}
        <div ref={listRef} className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'min(50vh, 380px)' }}>
          {results.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground font-mono">
              No tools match "<span className="text-foreground">{query}</span>"
            </div>
          ) : (
            results.map((tool, i) => {
              const Icon = tool.icon;
              const isActive = i === activeIdx;
              return (
                <button
                  key={tool.view}
                  onClick={() => commit(tool.view)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                    ${isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'text-foreground/80 hover:bg-muted/30'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${tool.sectionColor}`} />
                  <span className="flex-1 text-sm font-medium truncate">{tool.label}</span>
                  <span className={`text-[11px] font-mono ${tool.sectionColor} opacity-60 hidden sm:block flex-shrink-0`}>
                    {tool.section}
                  </span>
                  {isActive && (
                    <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground bg-muted/40 border border-border rounded flex-shrink-0">
                      ⏎
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-muted/10 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted/40 border border-border rounded">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted/40 border border-border rounded">⏎</kbd>
            open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted/40 border border-border rounded">Esc</kbd>
            close
          </span>
          <span className="ml-auto">
            {results.length} / {ALL_TOOLS.length}
          </span>
        </div>
      </div>
    </div>
  );
}
