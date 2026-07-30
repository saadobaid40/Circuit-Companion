import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { ColorCodeCalculator } from '@/components/color-code-calculator';
import { SeriesParallelCalculator } from '@/components/series-parallel-calculator';
import { OhmsLawCalculator } from '@/components/ohms-law-calculator';
import { OpAmpCalculator } from '@/components/opamp-calculator';
import { FilterCalculator } from '@/components/filter-calculator';
import { SmdLedCalculator } from '@/components/smd-led-calculator';
import { AcPowerCalculator } from '@/components/ac-power-calculator';
import { DigitalLogicCalculator } from '@/components/digital-logic-calculator';
import { BjtCalculator } from '@/components/bjt-calculator';
import { PresetsDrawer } from '@/components/presets-drawer';
import { useTheme } from '@/hooks/use-theme';
import { usePresets } from '@/hooks/use-presets';
import { useToast } from '@/hooks/use-toast';
import { Preset } from '@/lib/presets';
import {
  Zap, FlaskConical, Settings2, Waves, Brain, Terminal,
  ChevronRight, Construction, Clock,
} from 'lucide-react';

// ── Breadcrumb map ────────────────────────────────────────────────────────────

const BREADCRUMBS: Record<string, { section: string; tool?: string }> = {
  'home':                 { section: 'Home Dashboard' },
  'core.color-code':      { section: 'Core Circuits & Resistors', tool: 'Color Code' },
  'core.series-parallel': { section: 'Core Circuits & Resistors', tool: 'Series & Parallel' },
  'core.ohms-law':        { section: 'Core Circuits & Resistors', tool: "Ohm's Law & Divider" },
  'core.op-amp':          { section: 'Core Circuits & Resistors', tool: 'Op-Amp' },
  'core.filters':         { section: 'Core Circuits & Resistors', tool: 'Filters' },
  'core.smd-led':         { section: 'Core Circuits & Resistors', tool: 'SMD & LED' },
  'core.ac-power':        { section: 'Core Circuits & Resistors', tool: 'AC Power' },
  'micro.digital-logic':  { section: 'Microprocessors & Digital', tool: 'Digital Logic & K-Map' },
  'micro.bjt':            { section: 'Microprocessors & Digital', tool: 'BJT Transistor Bias' },
  'electronics-ii':       { section: 'Electronics II Suite' },
  'machinery':            { section: 'Electrical Machinery Suite' },
  'signals':              { section: 'Signals & Systems Suite' },
  'matlab':               { section: 'MATLAB Studio & Matrix Hub' },
};

// ── Home Dashboard ────────────────────────────────────────────────────────────

const SUITE_CARDS = [
  {
    id: 'core',
    label: 'Core Circuits & Resistors',
    icon: Zap,
    color: 'text-primary',
    border: 'border-primary/20 hover:border-primary/50',
    bg: 'bg-primary/5',
    tools: ['Color Code', 'Series & Parallel', "Ohm's Law", 'Op-Amp', 'Filters', 'SMD & LED', 'AC Power'],
    firstView: 'core.color-code',
    available: true,
  },
  {
    id: 'micro',
    label: 'Microprocessors & Digital',
    icon: Brain,
    color: 'text-accent',
    border: 'border-accent/20 hover:border-accent/50',
    bg: 'bg-accent/5',
    tools: ['Digital Logic & K-Map', 'BJT Transistor Bias'],
    firstView: 'micro.digital-logic',
    available: true,
  },
  {
    id: 'electronics-ii',
    label: 'Electronics II Suite',
    icon: FlaskConical,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    bg: 'bg-emerald-500/5',
    tools: ['MOSFET & JFET Biasing', 'Diff Amplifier & CMRR', 'Bode Plotter'],
    firstView: 'electronics-ii',
    available: false,
  },
  {
    id: 'machinery',
    label: 'Electrical Machinery Suite',
    icon: Settings2,
    color: 'text-orange-400',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    bg: 'bg-orange-500/5',
    tools: ['DC Motor / Generator', 'Induction Motor & Slip', 'Synchronous Machine Phasor'],
    firstView: 'machinery',
    available: false,
  },
  {
    id: 'signals',
    label: 'Signals & Systems Suite',
    icon: Waves,
    color: 'text-violet-400',
    border: 'border-violet-500/20 hover:border-violet-500/40',
    bg: 'bg-violet-500/5',
    tools: ['Convolution Visualizer', 'Pole-Zero Plotter', 'Fourier Synthesizer'],
    firstView: 'signals',
    available: false,
  },
  {
    id: 'matlab',
    label: 'MATLAB Studio & Matrix Hub',
    icon: Terminal,
    color: 'text-rose-400',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    bg: 'bg-rose-500/5',
    tools: ['MATLAB Script Generator', 'EE Matrix Calculator'],
    firstView: 'matlab',
    available: false,
  },
];

function HomeDashboard({ onNavigate }: { onNavigate: (v: string) => void }) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center flex-shrink-0 glow-primary">
          <Zap className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ElectroLab Suite</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your complete electronics engineering toolkit — all calculations run locally in your browser.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs font-mono px-2 py-1 rounded border border-primary/30 bg-primary/5 text-primary">
              9 tools active
            </span>
            <span className="text-xs font-mono px-2 py-1 rounded border border-border bg-muted/20 text-muted-foreground">
              5 suites planned
            </span>
            <span className="text-xs font-mono px-2 py-1 rounded border border-border bg-muted/20 text-muted-foreground">
              100% client-side
            </span>
          </div>
        </div>
      </div>

      {/* Suite grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {SUITE_CARDS.map(suite => {
          const Icon = suite.icon;
          return (
            <button
              key={suite.id}
              onClick={() => onNavigate(suite.firstView)}
              disabled={!suite.available}
              className={`relative text-left p-4 rounded-lg border transition-all ${suite.border} ${suite.bg}
                ${suite.available ? 'cursor-pointer hover:shadow-md' : 'opacity-60 cursor-not-allowed'}
              `}
            >
              {!suite.available && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded border border-border">
                  <Clock className="w-2.5 h-2.5" /> Soon
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-5 h-5 flex-shrink-0 ${suite.color}`} />
                <span className={`text-sm font-bold ${suite.color}`}>{suite.label}</span>
              </div>
              <div className="space-y-1">
                {suite.tools.map(tool => (
                  <div key={tool} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    {tool}
                  </div>
                ))}
              </div>
              {suite.available && (
                <div className={`mt-3 text-xs font-semibold ${suite.color} flex items-center gap-1`}>
                  Open Suite <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Coming Soon placeholder ───────────────────────────────────────────────────

const COMING_SOON_DETAILS: Record<string, { label: string; icon: React.ElementType; color: string; tools: { name: string; desc: string }[] }> = {
  'electronics-ii': {
    label: 'Electronics II Suite', icon: FlaskConical, color: 'text-emerald-400',
    tools: [
      { name: 'MOSFET & JFET Biasing Calculator', desc: 'I_D, V_GS, V_DS, g_m — Triode & Saturation regions' },
      { name: 'Differential Amplifier & CMRR', desc: 'A_d, A_cm, CMRR in dB' },
      { name: 'Amplifier Frequency Response (Bode)', desc: 'Bandwidth & gain roll-off plot' },
    ],
  },
  'machinery': {
    label: 'Electrical Machinery Suite', icon: Settings2, color: 'text-orange-400',
    tools: [
      { name: 'DC Motor / Generator Analyzer', desc: 'Back EMF, RPM, Torque, Speed–Torque curve' },
      { name: 'Induction Motor & Slip Calculator', desc: 'N_s, slip, rotor frequency, Power Flow Diagram' },
      { name: 'Synchronous Machine Phasor Generator', desc: 'Voltage Regulation, Torque Angle δ' },
    ],
  },
  'signals': {
    label: 'Signals & Systems Suite', icon: Waves, color: 'text-violet-400',
    tools: [
      { name: 'Interactive Convolution Visualizer', desc: 'Step-by-step (f * g)(t) sliding visualizer' },
      { name: 'Laplace & Z-Transform Pole-Zero Plotter', desc: 'Poles / Zeros on s-plane or z-plane with ROC' },
      { name: 'Fourier Series Waveform Synthesizer', desc: 'Square, Sawtooth, Triangle harmonic synthesis' },
    ],
  },
  'matlab': {
    label: 'MATLAB Studio & Matrix Hub', icon: Terminal, color: 'text-rose-400',
    tools: [
      { name: 'MATLAB / Octave Script Generator', desc: 'Bode, FFT, Nodal Analysis, Convolution scripts' },
      { name: 'EE Matrix Calculator', desc: 'Inverse, Determinant, Eigenvalues, A·x = b solver' },
    ],
  },
};

function ComingSoon({ view }: { view: string }) {
  const info = COMING_SOON_DETAILS[view];
  if (!info) return null;
  const Icon = info.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 rounded-2xl bg-muted/30 border border-border flex items-center justify-center">
        <Construction className={`w-8 h-8 ${info.color}`} />
      </div>
      <div className="text-center max-w-sm">
        <div className={`text-xl font-bold ${info.color} mb-2`}>{info.label}</div>
        <p className="text-sm text-muted-foreground">
          This suite is in development. Here's what's planned:
        </p>
      </div>
      <div className="grid gap-3 w-full max-w-lg">
        {info.tools.map((t, i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card/50 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${info.color} flex-shrink-0`} />
              <span className="text-sm font-semibold text-foreground">{t.name}</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono pl-6">{t.desc}</p>
          </div>
        ))}
      </div>
      <div className="text-xs font-mono text-muted-foreground/60 flex items-center gap-1.5">
        <Clock className="w-3 h-3" /> Coming in a future update
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { savePreset: savePresetToStorage } = usePresets();
  const [activeView, setActiveView] = useState('home');
  const [presetsOpen, setPresetsOpen] = useState(false);

  const handleLoadPreset = (preset: Preset) => {
    const tabMap: Record<Preset['type'], string> = {
      'color-code':    'core.color-code',
      'series-parallel': 'core.series-parallel',
      'op-amp':        'core.op-amp',
      'rc-filter':     'core.filters',
      'led-resistor':  'core.smd-led',
    };
    const targetView = tabMap[preset.type];
    if (targetView) {
      setActiveView(targetView);
      setPresetsOpen(false);
      toast({ title: 'Preset Loaded', description: `"${preset.name}" loaded`, duration: 2000 });
    }
  };

  const handleSaveSetup = (data: Record<string, unknown>, name: string) => {
    const viewTypeMap: Record<string, Preset['type']> = {
      'core.color-code':      'color-code',
      'core.series-parallel': 'series-parallel',
      'core.op-amp':          'op-amp',
      'core.filters':         'rc-filter',
      'core.smd-led':         'led-resistor',
    };
    const presetType: Preset['type'] = viewTypeMap[activeView] ?? 'color-code';
    const preset: Preset = {
      id: crypto.randomUUID(),
      name,
      type: presetType,
      createdAt: Date.now(),
      data,
    };
    savePresetToStorage(preset);
    toast({ title: 'Preset Saved', description: `"${name}" saved`, duration: 2000 });
  };

  // ── Content render ────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeView) {
      case 'home':                 return <HomeDashboard onNavigate={setActiveView} />;
      case 'core.color-code':      return <ColorCodeCalculator onSave={handleSaveSetup} />;
      case 'core.series-parallel': return <SeriesParallelCalculator onSave={handleSaveSetup} />;
      case 'core.ohms-law':        return <OhmsLawCalculator />;
      case 'core.op-amp':          return <OpAmpCalculator onSave={handleSaveSetup} />;
      case 'core.filters':         return <FilterCalculator onSave={handleSaveSetup} />;
      case 'core.smd-led':         return <SmdLedCalculator onSave={handleSaveSetup} />;
      case 'core.ac-power':        return <AcPowerCalculator />;
      case 'micro.digital-logic':  return <DigitalLogicCalculator />;
      case 'micro.bjt':            return <BjtCalculator />;
      case 'electronics-ii':
      case 'machinery':
      case 'signals':
      case 'matlab':
        return <ComingSoon view={activeView} />;
      default:
        return <HomeDashboard onNavigate={setActiveView} />;
    }
  };

  // ── Breadcrumb ────────────────────────────────────────────────────────────

  const bc = BREADCRUMBS[activeView] ?? { section: 'Home Dashboard' };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        onPresetsOpen={() => setPresetsOpen(true)}
        onPrint={() => window.print()}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-12 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-5 gap-2 no-print">
          <span className="text-xs text-muted-foreground font-mono">{bc.section}</span>
          {bc.tool && (
            <>
              <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-xs font-semibold text-foreground font-mono">{bc.tool}</span>
            </>
          )}
        </header>

        {/* Print-only header */}
        <div className="print-only print-header px-6 pt-4">
          <h1 className="text-xl font-bold">ElectroLab Suite — {bc.section}{bc.tool ? ` › ${bc.tool}` : ''}</h1>
          <p className="text-sm text-muted-foreground">Exported on {new Date().toLocaleDateString()}</p>
          <hr className="my-2" />
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Presets drawer */}
      <PresetsDrawer
        open={presetsOpen}
        onOpenChange={setPresetsOpen}
        onLoadPreset={handleLoadPreset}
      />
    </div>
  );
}
