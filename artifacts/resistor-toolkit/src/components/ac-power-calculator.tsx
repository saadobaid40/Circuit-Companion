import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowLeftRight, TrendingUp } from 'lucide-react';
import {
  rectToPolar, polarToRect,
  calculateACPower, calculatePFCorrection,
} from '@/lib/ac-math';

type Mode = 'complex' | 'power' | 'correction';

function fmt(n: number, digits = 4): string {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(digits) + ' M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(digits) + ' k';
  if (Math.abs(n) < 1e-9) return '0';
  if (Math.abs(n) < 1e-6) return (n * 1e9).toFixed(digits) + ' n';
  if (Math.abs(n) < 1e-3) return (n * 1e6).toFixed(digits) + ' µ';
  return n.toFixed(digits);
}

function ResultRow({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded border ${highlight ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/40'}`}>
      <span className="text-sm text-muted-foreground font-mono tracking-wide">{label}</span>
      <span className={`text-base font-bold font-mono ${highlight ? 'text-primary' : 'text-accent'}`}>
        {value}{unit ? <span className="text-xs text-muted-foreground ml-1">{unit}</span> : null}
      </span>
    </div>
  );
}

// ── Complex Converter ────────────────────────────────────────────────────────
function ComplexConverter() {
  const [mode, setMode] = useState<'to-polar' | 'to-rect'>('to-polar');
  const [a, setA] = useState('3');
  const [b, setB] = useState('4');
  const [r, setR] = useState('5');
  const [theta, setTheta] = useState('53.13');

  const polar = useMemo(() => {
    const av = parseFloat(a), bv = parseFloat(b);
    if (!isFinite(av) || !isFinite(bv)) return null;
    return rectToPolar(av, bv);
  }, [a, b]);

  const rect = useMemo(() => {
    const rv = parseFloat(r), tv = parseFloat(theta);
    if (!isFinite(rv) || !isFinite(tv)) return null;
    return polarToRect(rv, tv);
  }, [r, theta]);

  return (
    <div className="space-y-5">
      <ToggleGroup type="single" value={mode} onValueChange={v => v && setMode(v as typeof mode)}
        className="w-full border border-border rounded overflow-hidden">
        <ToggleGroupItem value="to-polar" className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground font-semibold py-2.5">
          Rectangular → Polar
        </ToggleGroupItem>
        <ToggleGroupItem value="to-rect" className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground font-semibold py-2.5">
          Polar → Rectangular
        </ToggleGroupItem>
      </ToggleGroup>

      {mode === 'to-polar' ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-muted-foreground tracking-wider">REAL PART (a)</Label>
            <Input value={a} onChange={e => setA(e.target.value)} className="font-mono" placeholder="3" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-muted-foreground tracking-wider">IMAGINARY PART (b)</Label>
            <Input value={b} onChange={e => setB(e.target.value)} className="font-mono" placeholder="4" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-muted-foreground tracking-wider">MAGNITUDE (r)</Label>
            <Input value={r} onChange={e => setR(e.target.value)} className="font-mono" placeholder="5" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-muted-foreground tracking-wider">ANGLE θ (degrees)</Label>
            <Input value={theta} onChange={e => setTheta(e.target.value)} className="font-mono" placeholder="53.13" />
          </div>
        </div>
      )}

      {mode === 'to-polar' && polar && (
        <div className="space-y-2 pt-1">
          <div className="text-xs font-mono text-muted-foreground tracking-wider mb-2">POLAR FORM</div>
          <ResultRow label="Magnitude  r" value={fmt(polar.r)} highlight />
          <ResultRow label="Angle  θ" value={polar.thetaDeg.toFixed(4)} unit="°" />
          <div className="px-4 py-2.5 rounded border border-accent/30 bg-accent/5 font-mono text-sm text-accent text-center">
            {fmt(polar.r)} ∠ {polar.thetaDeg.toFixed(2)}°
          </div>
        </div>
      )}

      {mode === 'to-rect' && rect && (
        <div className="space-y-2 pt-1">
          <div className="text-xs font-mono text-muted-foreground tracking-wider mb-2">RECTANGULAR FORM</div>
          <ResultRow label="Real  a" value={fmt(rect.a)} highlight />
          <ResultRow label="Imaginary  b" value={fmt(rect.b)} />
          <div className="px-4 py-2.5 rounded border border-accent/30 bg-accent/5 font-mono text-sm text-accent text-center">
            {fmt(rect.a)} + j({fmt(rect.b)})
          </div>
        </div>
      )}
    </div>
  );
}

// ── AC Power & PF ────────────────────────────────────────────────────────────
function ACPowerSection() {
  const [vrms, setVrms] = useState('230');
  const [irms, setIrms] = useState('10');
  const [theta, setTheta] = useState('30');

  const result = useMemo(() => {
    const V = parseFloat(vrms), I = parseFloat(irms), t = parseFloat(theta);
    if (!isFinite(V) || !isFinite(I) || !isFinite(t)) return null;
    if (V <= 0 || I <= 0) return null;
    return calculateACPower(V, I, t);
  }, [vrms, irms, theta]);

  const pfBadgeColor = result
    ? result.PF >= 0.95 ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : result.PF >= 0.8 ? 'bg-accent/20 text-accent border-accent/30'
    : 'bg-destructive/20 text-red-400 border-destructive/30'
    : '';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground tracking-wider">V_RMS (V)</Label>
          <Input value={vrms} onChange={e => setVrms(e.target.value)} className="font-mono" placeholder="230" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground tracking-wider">I_RMS (A)</Label>
          <Input value={irms} onChange={e => setIrms(e.target.value)} className="font-mono" placeholder="10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground tracking-wider">PHASE θ (degrees)</Label>
          <Input value={theta} onChange={e => setTheta(e.target.value)} className="font-mono" placeholder="30" />
        </div>
      </div>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs font-mono text-muted-foreground tracking-wider">RESULTS</div>
            <Badge className={`text-xs font-mono ${pfBadgeColor}`}>
              {result.pfType.toUpperCase()} · PF = {result.PF.toFixed(4)}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ResultRow label="Active Power  P" value={fmt(result.P)} unit="W" highlight />
            <ResultRow label="Reactive Power  Q" value={fmt(result.Q)} unit="VAR" />
            <ResultRow label="Apparent Power  S" value={fmt(result.S)} unit="VA" />
            <ResultRow label="Power Factor  cos θ" value={result.PF.toFixed(4)} highlight />
          </div>
          {/* Power triangle diagram */}
          <div className="mt-3 p-3 rounded border border-border bg-card/30">
            <div className="text-xs font-mono text-muted-foreground mb-2 text-center">POWER TRIANGLE</div>
            <svg viewBox="0 0 280 130" width="100%" className="mx-auto max-w-xs">
              <defs>
                <marker id="arrowP" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--primary))" />
                </marker>
                <marker id="arrowQ" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--accent))" />
                </marker>
                <marker id="arrowS" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#c864ff" />
                </marker>
              </defs>
              {/* P (horizontal) */}
              <line x1="30" y1="90" x2="220" y2="90" stroke="hsl(var(--primary))" strokeWidth="2.5" markerEnd="url(#arrowP)" />
              <text x="125" y="108" textAnchor="middle" className="fill-primary font-mono text-xs" fontSize="11" fill="hsl(var(--primary))">
                P = {fmt(result.P, 2)} W
              </text>
              {/* Q (vertical, negative = up) */}
              <line x1="220" y1="90" x2="220" y2={90 - Math.abs(result.Q / result.S) * 70} stroke="hsl(var(--accent))" strokeWidth="2.5" markerEnd="url(#arrowQ)" />
              <text x="248" y={90 - Math.abs(result.Q / result.S) * 35} textAnchor="start" fontSize="11" fill="hsl(var(--accent))" className="font-mono">
                Q={fmt(result.Q, 1)}
              </text>
              {/* S (hypotenuse) */}
              <line x1="30" y1="90" x2="220" y2={90 - Math.abs(result.Q / result.S) * 70} stroke="#c864ff" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrowS)" />
              <text x="105" y={90 - Math.abs(result.Q / result.S) * 40} textAnchor="middle" fontSize="11" fill="#c864ff" className="font-mono">
                S={fmt(result.S, 1)} VA
              </text>
              {/* angle arc */}
              <path d={`M 60,90 A 30,30 0 0,1 ${60 + 30 * Math.cos(Math.atan2(Math.abs(result.Q / result.S) * 70, 190))},${90 - 30 * Math.sin(Math.atan2(Math.abs(result.Q / result.S) * 70, 190))}`} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
              <text x="70" y="80" fontSize="10" fill="hsl(var(--muted-foreground))" fontFamily="monospace">θ</text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Power Factor Correction ──────────────────────────────────────────────────
function PFCorrectionSection() {
  const [p, setP] = useState('1000');
  const [vrms, setVrms] = useState('230');
  const [pf1, setPf1] = useState('0.7');
  const [pf2, setPf2] = useState('0.95');
  const [freq, setFreq] = useState('50');

  const result = useMemo(() => {
    const P = parseFloat(p), V = parseFloat(vrms);
    const pf1v = parseFloat(pf1), pf2v = parseFloat(pf2);
    const f = parseFloat(freq);
    if ([P, V, pf1v, pf2v, f].some(x => !isFinite(x))) return null;
    if (P <= 0 || V <= 0 || pf1v <= 0 || pf2v <= 0 || f <= 0) return null;
    if (pf1v > 1 || pf2v > 1) return null;
    const theta1 = Math.acos(Math.min(pf1v, 1)) * (180 / Math.PI);
    const theta2 = Math.acos(Math.min(pf2v, 1)) * (180 / Math.PI);
    return calculatePFCorrection(P, V, theta1, theta2, f);
  }, [p, vrms, pf1, pf2, freq]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground tracking-wider">ACTIVE POWER P (W)</Label>
          <Input value={p} onChange={e => setP(e.target.value)} className="font-mono" placeholder="1000" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground tracking-wider">V_RMS (V)</Label>
          <Input value={vrms} onChange={e => setVrms(e.target.value)} className="font-mono" placeholder="230" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground tracking-wider">FREQUENCY (Hz)</Label>
          <Input value={freq} onChange={e => setFreq(e.target.value)} className="font-mono" placeholder="50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground tracking-wider">INITIAL PF (cos θ₁)</Label>
          <Input value={pf1} onChange={e => setPf1(e.target.value)} className="font-mono" placeholder="0.70" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground tracking-wider">TARGET PF (cos θ₂)</Label>
          <Input value={pf2} onChange={e => setPf2(e.target.value)} className="font-mono" placeholder="0.95" />
        </div>
      </div>

      {result && result.C > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-muted-foreground tracking-wider mb-2">CORRECTION RESULTS</div>
          <ResultRow label="Required Capacitor  C" value={fmt(result.C)} unit="F" highlight />
          <ResultRow label="Q compensated  ΔQ" value={fmt(result.deltaQ)} unit="VAR" />
          <ResultRow label="New Apparent Power  S'" value={fmt(result.newS)} unit="VA" />
          <ResultRow label="Achieved Power Factor" value={result.newPF.toFixed(4)} highlight />
          <div className="mt-2 px-4 py-3 rounded border border-accent/30 bg-accent/5 text-sm font-mono text-accent text-center">
            C = ΔQ / (2π · f · V²) = {fmt(result.C)} F
          </div>
        </div>
      )}
      {result && result.C <= 0 && (
        <div className="px-4 py-3 rounded border border-border bg-card/30 text-sm text-muted-foreground text-center font-mono">
          No correction needed — target PF ≤ initial PF
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function AcPowerCalculator() {
  const [mode, setMode] = useState<Mode>('complex');

  const tabs: { value: Mode; label: string; icon: React.ReactNode }[] = [
    { value: 'complex', label: 'Complex Number', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
    { value: 'power', label: 'AC Power & PF', icon: <Zap className="w-3.5 h-3.5" /> },
    { value: 'correction', label: 'PF Correction', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-bold tracking-tight">AC Circuits & Power Factor</CardTitle>
          </div>
          <CardDescription>Complex number conversion · AC power analysis · Power factor correction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Sub-tabs */}
          <div className="flex gap-1 p-1 bg-muted/30 border border-border rounded">
            {tabs.map(t => (
              <button
                key={t.value}
                onClick={() => setMode(t.value)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                  mode === t.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {mode === 'complex' && <ComplexConverter />}
          {mode === 'power' && <ACPowerSection />}
          {mode === 'correction' && <PFCorrectionSection />}
        </CardContent>
      </Card>

      {/* Formula Reference */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight text-muted-foreground">Formula Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded border border-border bg-card/30 space-y-1">
              <div className="text-primary font-semibold mb-1.5">Complex Numbers</div>
              <div className="text-muted-foreground">r = √(a² + b²)</div>
              <div className="text-muted-foreground">θ = atan2(b, a)</div>
              <div className="text-muted-foreground">a = r·cos(θ), b = r·sin(θ)</div>
            </div>
            <div className="p-3 rounded border border-border bg-card/30 space-y-1">
              <div className="text-accent font-semibold mb-1.5">AC Power</div>
              <div className="text-muted-foreground">S = V·I (VA)</div>
              <div className="text-muted-foreground">P = S·cos θ (W)</div>
              <div className="text-muted-foreground">Q = S·sin θ (VAR)</div>
              <div className="text-muted-foreground">PF = P / S = cos θ</div>
            </div>
            <div className="p-3 rounded border border-border bg-card/30 space-y-1">
              <div className="text-[#c864ff] font-semibold mb-1.5">PF Correction</div>
              <div className="text-muted-foreground">ΔQ = P(tan θ₁ − tan θ₂)</div>
              <div className="text-muted-foreground">C = ΔQ / (2π·f·V²)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
