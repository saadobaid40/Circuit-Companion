import { useState } from 'react';
import { X, Zap, Triangle, Activity, Cpu, Grid3x3, Settings2, BookOpen, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Formula {
  f: string;   // formula expression
  d: string;   // short description
}

interface Category {
  id: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
  formulas: Formula[];
}

const CATEGORIES: Category[] = [
  {
    id: 'ohm',
    icon: Zap,
    color: 'text-primary',
    bg: 'bg-primary/5 border-primary/20',
    label: "Ohm's Law & Power",
    formulas: [
      { f: 'V = I · R',                   d: 'Voltage from current and resistance' },
      { f: 'I = V / R',                   d: 'Current from voltage and resistance' },
      { f: 'P = V · I = V² / R = I² R',  d: 'Power dissipation (all equivalent forms)' },
      { f: 'P₃φ = √3 · VL · IL · cosφ', d: '3-phase active power' },
      { f: 'S = √(P² + Q²)',              d: 'Apparent power (VA)' },
      { f: 'PF = P / S = cosφ',           d: 'Power factor (lagging/leading)' },
    ],
  },
  {
    id: 'kvl',
    icon: Settings2,
    color: 'text-amber-400',
    bg: 'bg-amber-500/5 border-amber-500/20',
    label: "Kirchhoff's Laws & Theorems",
    formulas: [
      { f: 'ΣV_loop = 0',                 d: 'KVL — sum of voltages around any closed loop' },
      { f: 'ΣI_node = 0',                 d: 'KCL — sum of currents at any node' },
      { f: 'V_div = Vs · Rx / (R1+R2)',  d: 'Voltage divider rule' },
      { f: 'I_div = Is · Ry / (Rx+Ry)',  d: 'Current divider rule' },
      { f: 'V_th = V_oc',                 d: "Thévenin voltage = open-circuit voltage" },
      { f: 'R_th = V_oc / I_sc',          d: "Thévenin resistance" },
      { f: 'I_N = I_sc,  R_N = R_th',    d: 'Norton equivalent' },
    ],
  },
  {
    id: 'opamp',
    icon: Triangle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/5 border-emerald-500/20',
    label: 'Op-Amp Configurations',
    formulas: [
      { f: 'Av = −Rf / R1',              d: 'Inverting amplifier gain' },
      { f: 'Av = 1 + Rf / R1',           d: 'Non-inverting amplifier gain' },
      { f: 'Av = 1',                      d: 'Unity-gain (voltage follower / buffer)' },
      { f: 'Av = Rf / R1',               d: 'Differential amplifier gain (balanced)' },
      { f: 'f_GBP = Av · BW',            d: 'Gain-bandwidth product (constant)' },
      { f: 'CMRR = 20log₁₀(Ad / Acm)',  d: 'Common-mode rejection ratio (dB)' },
      { f: 'Vout = −Rf · (V1/R1 + V2/R2)', d: 'Summing amplifier' },
    ],
  },
  {
    id: 'filters',
    icon: Activity,
    color: 'text-violet-400',
    bg: 'bg-violet-500/5 border-violet-500/20',
    label: 'Filters & Reactive Elements',
    formulas: [
      { f: 'fc = 1 / (2π RC)',            d: 'RC filter −3dB cutoff frequency' },
      { f: 'fc = R / (2π L)',             d: 'RL filter cutoff frequency' },
      { f: 'f₀ = 1 / (2π √LC)',          d: 'LC resonant frequency' },
      { f: 'Q = f₀ / BW = (1/R)√(L/C)', d: 'Quality factor' },
      { f: 'XC = 1 / (2πfC)',            d: 'Capacitive reactance (Ω)' },
      { f: 'XL = 2πfL',                  d: 'Inductive reactance (Ω)' },
      { f: '|Z| = √(R² + (XL − XC)²)',  d: 'Total impedance magnitude' },
      { f: 'τ = RC = L / R',             d: 'Time constant (s)' },
    ],
  },
  {
    id: 'transistor',
    icon: Cpu,
    color: 'text-orange-400',
    bg: 'bg-orange-500/5 border-orange-500/20',
    label: 'Transistors (BJT & FET)',
    formulas: [
      { f: 'β = IC / IB  (hFE)',         d: 'BJT DC current gain' },
      { f: 'α = IC / IE ≈ β/(β+1)',     d: 'BJT alpha; VBE ≈ 0.7V (Si)' },
      { f: 'VT = kT/q ≈ 26mV @ 25°C',  d: 'Thermal voltage' },
      { f: 'IC = Is · e^(VBE/VT)',      d: 'BJT collector current (active region)' },
      { f: 'ID = k(VGS − Vth)² / 2',   d: 'MOSFET drain current (saturation)' },
      { f: 'gm = 2ID / (VGS − Vth)',    d: 'MOSFET transconductance' },
      { f: 'ID = k · VDS(VGS−Vth − VDS/2)', d: 'MOSFET triode region' },
    ],
  },
  {
    id: 'logic',
    icon: Grid3x3,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/5 border-cyan-500/20',
    label: 'Boolean Logic & De Morgan',
    formulas: [
      { f: '¬(A · B) = ¬A + ¬B',        d: "De Morgan — NAND expansion" },
      { f: '¬(A + B) = ¬A · ¬B',        d: "De Morgan — NOR expansion" },
      { f: 'A ⊕ B = Ā·B + A·B̄',       d: 'XOR — exclusive or definition' },
      { f: 'A·(B+C) = AB + AC',          d: 'Distributive law' },
      { f: 'A + AB = A',                  d: 'Absorption law' },
      { f: 'A·Ā = 0,  A+Ā = 1',        d: 'Complement law' },
      { f: 'A·A = A,  A+A = A',          d: 'Idempotent law' },
      { f: 'SOP: Σm(…)  /  POS: ΠM(…)', d: 'K-map canonical forms' },
    ],
  },
];

interface QuickRefModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickRefModal({ open, onClose }: QuickRefModalProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (!open) return null;

  const q = search.toLowerCase().trim();
  const filteredCategories = CATEGORIES.map(cat => ({
    ...cat,
    formulas: cat.formulas.filter(f =>
      !q || f.f.toLowerCase().includes(q) || f.d.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)
    ),
  })).filter(cat => cat.formulas.length > 0);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6 sm:py-10">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-card border border-border rounded-xl shadow-2xl overflow-hidden
        animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className="w-8 h-8 bg-primary/10 border border-primary/30 rounded flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">EE Quick Reference</h2>
            <p className="text-xs text-muted-foreground font-mono">Essential formulas for every EE course</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Search inside modal */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/20">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter formulas…"
                className="bg-transparent outline-none text-xs font-mono text-foreground placeholder:text-muted-foreground/50 w-32"
              />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/10">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter formulas…"
            className="flex-1 bg-transparent outline-none text-xs font-mono text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Category pills */}
        {!q && (
          <div className="flex gap-1.5 px-5 py-2.5 overflow-x-auto border-b border-border flex-shrink-0 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-mono transition-colors border ${
                activeCategory === null
                  ? 'bg-primary/15 text-primary border-primary/40'
                  : 'bg-muted/20 text-muted-foreground border-border hover:border-primary/30'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(prev => prev === cat.id ? null : cat.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-mono transition-colors border ${
                  activeCategory === cat.id
                    ? `${cat.color} border-current bg-current/10`
                    : 'bg-muted/20 text-muted-foreground border-border hover:border-primary/30'
                }`}
              >
                {cat.label.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Formula grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground font-mono">
              No formulas match "<span className="text-foreground">{search}</span>"
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCategories
                .filter(cat => !activeCategory || cat.id === activeCategory)
                .map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.id}
                      className={`rounded-lg border p-4 ${cat.bg} transition-all`}>
                      {/* Category header */}
                      <div className={`flex items-center gap-2 mb-3 ${cat.color}`}>
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs font-bold tracking-wide">{cat.label}</span>
                      </div>
                      {/* Formula rows */}
                      <div className="space-y-2">
                        {cat.formulas.map((row, i) => (
                          <div key={i} className="space-y-0.5">
                            <code className="block text-[13px] font-mono font-semibold text-foreground leading-snug tracking-tight">
                              {row.f}
                            </code>
                            <p className="text-[11px] text-muted-foreground leading-tight pl-0.5">
                              {row.d}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-border bg-muted/10 flex items-center justify-between flex-shrink-0">
          <p className="text-[10px] font-mono text-muted-foreground">
            {CATEGORIES.reduce((s, c) => s + c.formulas.length, 0)} formulas across {CATEGORIES.length} categories
          </p>
          <p className="text-[10px] font-mono text-muted-foreground hidden sm:block">
            All calculations run locally — no data leaves your browser
          </p>
        </div>
      </div>
    </div>
  );
}
