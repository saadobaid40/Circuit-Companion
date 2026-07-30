import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Cpu } from 'lucide-react';
import { calculateBJTBias, type BJTRegion } from '@/lib/bjt-math';
import { parseEngineering, formatEngineering } from '@/lib/circuit-math';

function fmtV(v: number): string {
  if (!isFinite(v)) return '—';
  return v.toFixed(4) + ' V';
}
function fmtA(a: number): string {
  if (!isFinite(a)) return '—';
  if (Math.abs(a) < 1e-9) return '0 A';
  if (Math.abs(a) < 1e-3) return (a * 1e6).toFixed(3) + ' µA';
  if (Math.abs(a) < 1) return (a * 1e3).toFixed(3) + ' mA';
  return a.toFixed(4) + ' A';
}
function fmtR(r: number): string {
  if (!isFinite(r)) return '—';
  return formatEngineering(r, 'Ω');
}

interface ResultRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  sub?: string;
}
function ResultRow({ label, value, highlight, sub }: ResultRowProps) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded border ${highlight ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/40'}`}>
      <div>
        <div className="text-sm text-muted-foreground font-mono tracking-wide">{label}</div>
        {sub && <div className="text-xs text-muted-foreground/60 font-mono">{sub}</div>}
      </div>
      <span className={`text-base font-bold font-mono ${highlight ? 'text-primary' : 'text-accent'}`}>{value}</span>
    </div>
  );
}

const REGION_STYLE: Record<BJTRegion, { label: string; cls: string }> = {
  cutoff:     { label: 'CUTOFF',      cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  active:     { label: 'ACTIVE',      cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
  saturation: { label: 'SATURATION',  cls: 'bg-destructive/20 text-red-400 border-destructive/30' },
};

// NPN Voltage-Divider Bias SVG schematic
function BJTSchematic({ region }: { region?: BJTRegion }) {
  const txColor = region === 'active' ? '#64ff64' : region === 'saturation' ? '#ff4b4b' : '#4488ff';
  return (
    <svg viewBox="0 0 300 260" className="w-full max-w-sm mx-auto" aria-label="NPN Voltage Divider Bias Circuit">
      {/* VCC rail */}
      <text x="148" y="14" textAnchor="middle" fontSize="11" fill="hsl(var(--primary))" fontFamily="monospace" fontWeight="bold">V_CC</text>
      <line x1="148" y1="16" x2="148" y2="24" stroke="hsl(var(--primary))" strokeWidth="2"/>
      <line x1="70" y1="24" x2="230" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2"/>

      {/* Left branch: R1 top */}
      <line x1="78" y1="24" x2="78" y2="48" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      {/* R1 body */}
      <rect x="66" y="48" width="24" height="44" rx="2" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5"/>
      <path d="M71 52 L78 60 L85 52 L92 60 L85 68 L78 76" stroke="hsl(var(--accent))" strokeWidth="1.5" fill="none"/>
      <text x="78" y="44" textAnchor="middle" fontSize="10" fill="hsl(var(--accent))" fontFamily="monospace" fontWeight="bold">R₁</text>

      {/* Node between R1 and R2 */}
      <line x1="78" y1="92" x2="78" y2="108" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <circle cx="78" cy="108" r="3.5" fill="hsl(var(--primary))"/>

      {/* R2 body */}
      <line x1="78" y1="108" x2="78" y2="116" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <rect x="66" y="116" width="24" height="44" rx="2" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5"/>
      <path d="M71 120 L78 128 L85 120 L92 128 L85 136 L78 144" stroke="hsl(var(--accent))" strokeWidth="1.5" fill="none"/>
      <text x="78" y="175" textAnchor="middle" fontSize="10" fill="hsl(var(--accent))" fontFamily="monospace" fontWeight="bold">R₂</text>

      {/* GND for R2 */}
      <line x1="78" y1="162" x2="78" y2="180" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <line x1="65" y1="180" x2="91" y2="180" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <line x1="70" y1="185" x2="86" y2="185" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <line x1="75" y1="190" x2="81" y2="190" stroke="hsl(var(--foreground))" strokeWidth="2"/>

      {/* Base wire: R1/R2 node to transistor base */}
      <line x1="78" y1="108" x2="148" y2="108" stroke="hsl(var(--foreground))" strokeWidth="2"/>

      {/* Right branch: RC */}
      <line x1="222" y1="24" x2="222" y2="48" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <rect x="210" y="48" width="24" height="44" rx="2" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5"/>
      <path d="M215 52 L222 60 L229 52 L236 60 L229 68 L222 76" stroke="hsl(var(--accent))" strokeWidth="1.5" fill="none"/>
      <text x="222" y="44" textAnchor="middle" fontSize="10" fill="hsl(var(--accent))" fontFamily="monospace" fontWeight="bold">R_C</text>
      <line x1="222" y1="92" x2="222" y2="110" stroke="hsl(var(--foreground))" strokeWidth="2"/>

      {/* NPN BJT symbol */}
      {/* Vertical base bar */}
      <line x1="158" y1="95" x2="158" y2="130" stroke={txColor} strokeWidth="3"/>
      {/* Base connection */}
      <line x1="148" y1="108" x2="158" y2="108" stroke={txColor} strokeWidth="2"/>
      {/* Collector: diagonal up-right */}
      <line x1="158" y1="99" x2="222" y2="110" stroke={txColor} strokeWidth="2"/>
      {/* Emitter: diagonal down-right with arrow */}
      <line x1="158" y1="126" x2="190" y2="148" stroke={txColor} strokeWidth="2"/>
      {/* Arrow on emitter */}
      <polygon points="185,143 195,152 187,155" fill={txColor}/>

      {/* Labels */}
      <text x="145" y="93" textAnchor="end" fontSize="10" fill={txColor} fontFamily="monospace" fontWeight="bold">B</text>
      <text x="225" y="108" textAnchor="start" fontSize="10" fill={txColor} fontFamily="monospace" fontWeight="bold">C</text>
      <text x="194" y="152" textAnchor="start" fontSize="10" fill={txColor} fontFamily="monospace" fontWeight="bold">E</text>
      <text x="170" y="92" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" fontFamily="monospace">NPN</text>

      {/* RE body */}
      <line x1="190" y1="156" x2="190" y2="164" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <rect x="178" y="164" width="24" height="36" rx="2" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5"/>
      <path d="M183 168 L190 174 L197 168 L204 174 L197 180 L190 186" stroke="hsl(var(--accent))" strokeWidth="1.5" fill="none"/>
      <text x="212" y="185" textAnchor="start" fontSize="10" fill="hsl(var(--accent))" fontFamily="monospace" fontWeight="bold">R_E</text>

      {/* GND for RE */}
      <line x1="190" y1="200" x2="190" y2="215" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <line x1="177" y1="215" x2="203" y2="215" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <line x1="182" y1="220" x2="198" y2="220" stroke="hsl(var(--foreground))" strokeWidth="2"/>
      <line x1="187" y1="225" x2="193" y2="225" stroke="hsl(var(--foreground))" strokeWidth="2"/>

      {/* Collector node dot */}
      <circle cx="222" cy="110" r="3" fill="hsl(var(--primary))"/>
    </svg>
  );
}

export function BjtCalculator() {
  const [vcc, setVcc] = useState('12');
  const [r1, setR1] = useState('47k');
  const [r2, setR2] = useState('10k');
  const [rc, setRc] = useState('2.2k');
  const [re, setRe] = useState('1k');
  const [beta, setBeta] = useState('100');

  const result = useMemo(() => {
    const VCC = parseFloat(vcc);
    const R1 = parseEngineering(r1);
    const R2 = parseEngineering(r2);
    const RC = parseEngineering(rc);
    const RE = parseEngineering(re);
    const BETA = parseFloat(beta);
    if (R1 === null || R2 === null || RC === null || RE === null) return null;
    if (!isFinite(VCC) || !isFinite(BETA) || VCC <= 0 || R1 <= 0 || R2 <= 0 || RC <= 0 || RE <= 0 || BETA <= 0) return null;
    return calculateBJTBias(VCC, R1, R2, RC, RE, BETA);
  }, [vcc, r1, r2, rc, re, beta]);

  const region = result?.region;
  const rStyle = region ? REGION_STYLE[region] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs + Schematic */}
      <div className="space-y-5">
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold tracking-tight">BJT Transistor Biasing</CardTitle>
            </div>
            <CardDescription>NPN voltage-divider bias — DC operating point</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">V_CC (V)</Label>
                <Input value={vcc} onChange={e => setVcc(e.target.value)} className="font-mono" placeholder="12" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">β (hFE)</Label>
                <Input value={beta} onChange={e => setBeta(e.target.value)} className="font-mono" placeholder="100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">R₁ (bias top)</Label>
                <Input value={r1} onChange={e => setR1(e.target.value)} className="font-mono" placeholder="47k" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">R₂ (bias bottom)</Label>
                <Input value={r2} onChange={e => setR2(e.target.value)} className="font-mono" placeholder="10k" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">R_C (collector)</Label>
                <Input value={rc} onChange={e => setRc(e.target.value)} className="font-mono" placeholder="2.2k" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">R_E (emitter)</Label>
                <Input value={re} onChange={e => setRe(e.target.value)} className="font-mono" placeholder="1k" />
              </div>
            </div>

            {/* Region Badge */}
            {result && rStyle && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-mono text-muted-foreground">Operating Region:</span>
                <Badge className={`text-sm font-mono px-3 py-1 border ${rStyle.cls}`}>
                  ● {rStyle.label}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schematic */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-muted-foreground">Circuit Schematic</CardTitle>
          </CardHeader>
          <CardContent>
            <BJTSchematic region={region} />
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="space-y-5">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">DC Operating Point</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result ? (
              <>
                <div className="text-xs font-mono text-muted-foreground tracking-wider mb-3">VOLTAGES</div>
                <ResultRow label="V_B  (Base)" value={fmtV(result.VB)} highlight />
                <ResultRow label="V_E  (Emitter)" value={fmtV(result.VE)} />
                <ResultRow label="V_C  (Collector)" value={fmtV(result.VC)} />
                <ResultRow label="V_CE" value={fmtV(result.VCE)} highlight />
                <ResultRow label="V_BE" value={fmtV(result.VBE)} />
                <div className="text-xs font-mono text-muted-foreground tracking-wider mt-4 mb-2">CURRENTS</div>
                <ResultRow label="I_B  (Base current)" value={fmtA(result.IB)} />
                <ResultRow label="I_C  (Collector current)" value={fmtA(result.IC)} highlight />
                <ResultRow label="I_E  (Emitter current)" value={fmtA(result.IE)} />
                <div className="text-xs font-mono text-muted-foreground tracking-wider mt-4 mb-2">THEVENIN EQUIVALENT</div>
                <ResultRow label="V_TH" value={fmtV(result.VTH)} />
                <ResultRow label="R_TH" value={fmtR(result.RTH)} />
              </>
            ) : (
              <div className="text-center text-muted-foreground text-sm font-mono py-8">
                Enter valid component values to calculate
              </div>
            )}
          </CardContent>
        </Card>

        {/* Region explanation */}
        {result && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight text-muted-foreground">Region Conditions</CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-mono space-y-2">
              <div className={`p-2.5 rounded border ${region === 'cutoff' ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' : 'border-border text-muted-foreground'}`}>
                <span className="font-bold">CUTOFF:</span>  V_BE &lt; 0.6 V, I_B ≈ 0, I_C ≈ 0
              </div>
              <div className={`p-2.5 rounded border ${region === 'active' ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-border text-muted-foreground'}`}>
                <span className="font-bold">ACTIVE:</span>  V_CE &gt; 0.2 V, I_C = β · I_B
              </div>
              <div className={`p-2.5 rounded border ${region === 'saturation' ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-border text-muted-foreground'}`}>
                <span className="font-bold">SATURATION:</span>  V_CE &lt; 0.2 V, transistor fully ON
              </div>
              <div className="pt-2 border-t border-border space-y-1 text-muted-foreground/70">
                <div>I_B = (V_TH − V_BE) / (R_TH + (β+1)·R_E)</div>
                <div>I_C = β · I_B,   V_CE = V_CC − I_C·R_C − I_E·R_E</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
