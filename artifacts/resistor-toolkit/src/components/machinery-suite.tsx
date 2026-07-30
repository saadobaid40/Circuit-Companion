import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot,
} from 'recharts';
import { calculateDCMotor, calculateInductionMotor, calculateSyncMachine } from '@/lib/machinery-math';
import { formatEngineering } from '@/lib/circuit-math';

// ── Shared helpers ────────────────────────────────────────────────────────────

function ResultRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono font-semibold text-foreground">{value}</span>
    </div>
  );
}

function NumInput({ label, value, onChange, unit, step = 'any', min }:
  { label: string; value: string; onChange: (v: string) => void; unit?: string; step?: string; min?: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <div className="flex items-center gap-2">
        <Input type="number" step={step} min={min} value={value} onChange={e => onChange(e.target.value)}
          className="font-mono bg-background border-border" />
        {unit && <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">{unit}</span>}
      </div>
    </div>
  );
}

// ── DC Motor / Generator ─────────────────────────────────────────────────────

const MotorTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded px-3 py-2 text-xs font-mono shadow-lg">
      <p className="text-amber-400">τ = {payload[0]?.payload?.torque?.toFixed(3)} N·m</p>
      <p className="text-primary">N = {payload[0]?.payload?.speed?.toFixed(1)} RPM</p>
    </div>
  );
};

export function DCMotorAnalyzer() {
  const [Vt, setVt] = useState('120');
  const [Ra, setRa] = useState('0.5');
  const [Ia, setIa] = useState('20');
  const [KPhi, setKPhi] = useState('0.8');

  const result = useMemo(() => {
    const vt = parseFloat(Vt), ra = parseFloat(Ra), ia = parseFloat(Ia), kphi = parseFloat(KPhi);
    if ([vt, ra, ia, kphi].some(v => isNaN(v) || v <= 0)) return null;
    return calculateDCMotor(vt, ra, ia, kphi);
  }, [Vt, Ra, Ia, KPhi]);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">DC Machine Parameters</CardTitle>
          <CardDescription>Separately-excited DC motor (KVL: Vt = Ea + Ia·Ra)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <NumInput label="Vt — Terminal Voltage" value={Vt} onChange={setVt} unit="V" min="0" />
          <NumInput label="Ra — Armature Resistance" value={Ra} onChange={setRa} unit="Ω" min="0" />
          <NumInput label="Ia — Armature Current" value={Ia} onChange={setIa} unit="A" min="0" />
          <NumInput label="KΦ — Motor Constant (K·Φ)" value={KPhi} onChange={setKPhi} unit="V·s/rad" min="0.001" />
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Back EMF  Ea', value: `${result.Ea.toFixed(2)} V`, color: 'text-primary' },
              { label: 'Speed  N', value: `${result.N.toFixed(0)} RPM`, color: 'text-emerald-400' },
              { label: 'Torque  τ', value: `${result.tau.toFixed(3)} N·m`, color: 'text-amber-400' },
              { label: 'Pdev', value: `${result.Pdev.toFixed(1)} W`, color: 'text-foreground' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="bg-muted/30 border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`font-mono font-bold text-lg ${color}`}>{value}</p>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Speed vs. Torque Characteristic</CardTitle>
              <CardDescription className="text-xs font-mono">Varies armature current from no-load to stall</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={result.curve} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="torque" type="number"
                    tickFormatter={v => v.toFixed(1)}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Torque (N·m)', position: 'insideBottom', offset: -18, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={v => `${v.toFixed(0)}`}
                    label={{ value: 'Speed (RPM)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<MotorTooltip />} />
                  <Line type="monotone" dataKey="speed" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  {/* Operating point */}
                  <ReferenceDot x={result.tau} y={result.N} r={5} fill="hsl(var(--secondary))" stroke="hsl(var(--background))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground mt-1 font-mono">
                ● Operating point: τ = {result.tau.toFixed(3)} N·m, N = {result.N.toFixed(0)} RPM
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/20 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Formula Reference</CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-mono text-muted-foreground space-y-1">
              <p>Ea = Vt − Ia·Ra  (back EMF)</p>
              <p>ω = Ea / KΦ  (rad/s),  N = 60ω / 2π  (RPM)</p>
              <p>τ = KΦ·Ia,  Pdev = Ea·Ia</p>
              <p>Speed-Torque:  N = (Vt/KΦ) − (Ra/KΦ²)·τ  ← linear</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Induction Motor & Slip ────────────────────────────────────────────────────

function PowerFlowSVG({ s, Ns }: { s: number; Ns: number }) {
  const sPct = Math.max(0, Math.min(1, s)) * 100;
  const mechPct = 100 - sPct;
  const safeS = s.toFixed(4);
  const color = sPct < 5 ? '#10b981' : sPct < 20 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mt-2">
      <svg viewBox="0 0 520 200" className="w-full" style={{ maxHeight: 200 }}>
        {/* Blocks */}
        {[
          { x: 10, label: 'INPUT\nPower Pin', fill: '#1e293b' },
          { x: 140, label: 'STATOR\n(losses small)', fill: '#1e293b' },
          { x: 270, label: 'AIR GAP\nPower Pag', fill: '#0f2027' },
          { x: 400, label: 'OUTPUT\nPmech', fill: '#1e293b' },
        ].map(({ x, label, fill }) => (
          <g key={x}>
            <rect x={x} y={70} width={100} height={60} rx={6} fill={fill} stroke="#334155" strokeWidth={1.5} />
            {label.split('\n').map((line, i) => (
              <text key={i} x={x + 50} y={97 + i * 16} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="monospace">{line}</text>
            ))}
          </g>
        ))}

        {/* Arrows between blocks */}
        {[110, 240, 370].map(x => (
          <g key={x}>
            <line x1={x} y1={100} x2={x + 30} y2={100} stroke="#475569" strokeWidth={2} />
            <polygon points={`${x + 30},95 ${x + 30},105 ${x + 40},100`} fill="#475569" />
          </g>
        ))}

        {/* Rotor loss arrow (downward from Pag block) */}
        <line x1={320} y1={130} x2={320} y2={165} stroke={color} strokeWidth={2} />
        <polygon points={`315,160 325,160 320,170`} fill={color} />
        <rect x={255} y={168} width={130} height={24} rx={4} fill="#1e293b" stroke={color} strokeWidth={1.5} />
        <text x={320} y={184} textAnchor="middle" fontSize={10} fill={color} fontFamily="monospace">
          Rotor Loss = s·Pag = {safeS}·Pag
        </text>

        {/* Labels */}
        <text x={270} y={60} textAnchor="middle" fontSize={11} fill="#00d4ff" fontFamily="monospace">
          Pag (1-s) = {(mechPct / 100).toFixed(4)}·Pag → Pmech
        </text>
        <text x={450} y={155} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="monospace">
          Ns = {Ns.toFixed(0)} RPM
        </text>
      </svg>

      {/* Slip bar */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Rotor Loss  {sPct.toFixed(2)}%</span>
          <span>Mechanical Power  {mechPct.toFixed(2)}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted/40 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${sPct}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

export function InductionMotorCalc() {
  const [freq, setFreq] = useState('60');
  const [poles, setPoles] = useState('4');
  const [rotorN, setRotorN] = useState('1740');

  const result = useMemo(() => {
    const f = parseFloat(freq), P = parseFloat(poles), N = parseFloat(rotorN);
    if ([f, P, N].some(isNaN) || P < 2 || P % 2 !== 0) return null;
    return calculateInductionMotor(f, P, N);
  }, [freq, poles, rotorN]);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Induction Motor Parameters</CardTitle>
          <CardDescription>3-phase induction motor slip analysis</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <NumInput label="f — Stator Frequency" value={freq} onChange={setFreq} unit="Hz" min="0" />
          <NumInput label="P — Number of Poles (even)" value={poles} onChange={setPoles} unit="poles" step="2" min="2" />
          <NumInput label="N — Rotor Speed" value={rotorN} onChange={setRotorN} unit="RPM" min="0" />
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Synchronous Speed  Ns', value: `${result.Ns.toFixed(0)} RPM`, color: 'text-primary' },
              { label: 'Slip  s', value: result.s.toFixed(4), color: result.s < 0.05 ? 'text-emerald-400' : result.s < 0.2 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Rotor Frequency  fr', value: `${result.fr.toFixed(2)} Hz`, color: 'text-foreground' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="bg-muted/30 border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`font-mono font-bold text-lg ${color}`}>{value}</p>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Power Flow Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <PowerFlowSVG s={result.s} Ns={result.Ns} />
            </CardContent>
          </Card>

          <Card className="bg-muted/20 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Formula Reference</CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-mono text-muted-foreground space-y-1">
              <p>Ns = 120·f / P  (synchronous speed, RPM)</p>
              <p>s  = (Ns − N) / Ns  (slip, dimensionless)</p>
              <p>fr = s·f  (rotor frequency, Hz)</p>
              <p>Pmech = (1 − s)·Pag,  Protor_loss = s·Pag</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Synchronous Machine Phasor ────────────────────────────────────────────────

function PhasorSVG({ Vt_val, Ef_re, Ef_im, jXsIa_re, jXsIa_im }:
  { Vt_val: number; Ef_re: number; Ef_im: number; jXsIa_re: number; jXsIa_im: number }) {
  const svgW = 340, svgH = 220;
  const margin = 30;
  const cx = margin + 10;
  const cy = svgH / 2;

  // Scale so all vectors fit
  const allCoords = [Vt_val, 0, Ef_re, Ef_im, jXsIa_re, jXsIa_im];
  const maxVal = Math.max(...allCoords.map(Math.abs), 1);
  const scaleX = (svgW - margin * 2 - 50) / maxVal;
  const scaleY = (svgH - margin * 2) / (maxVal * 2 || 1);
  const sc = Math.min(scaleX, scaleY);

  // SVG coordinate helper
  const tx = (re: number) => cx + re * sc;
  const ty = (im: number) => cy - im * sc;

  function Arrow({ x1, y1, x2, y2, color, label, pos = 'end' }: {
    x1: number; y1: number; x2: number; y2: number; color: string; label: string; pos?: 'end' | 'mid';
  }) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return null;
    const ux = dx / len, uy = dy / len;
    const ah = 8;
    // arrowhead
    const px = x2 - ah * ux, py = y2 - ah * uy;
    const pts = `${x2},${y2} ${px - ah * 0.4 * uy},${py + ah * 0.4 * ux} ${px + ah * 0.4 * uy},${py - ah * 0.4 * ux}`;
    const lx = pos === 'end' ? x2 + uy * 12 : (x1 + x2) / 2 - uy * 14;
    const ly = pos === 'end' ? y2 - ux * 12 : (y1 + y2) / 2 + ux * 14;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} />
        <polygon points={pts} fill={color} />
        <text x={lx} y={ly} fontSize={11} fill={color} fontFamily="monospace" textAnchor="middle">{label}</text>
      </g>
    );
  }

  const Vt_x2 = tx(Vt_val), Vt_y2 = ty(0);
  const Ef_x2 = tx(Ef_re), Ef_y2 = ty(Ef_im);
  const jXs_x1 = Vt_x2, jXs_y1 = Vt_y2;
  const jXs_x2 = tx(Ef_re), jXs_y2 = ty(Ef_im);

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Axes */}
      <line x1={margin} y1={cy} x2={svgW - 10} y2={cy} stroke="#334155" strokeWidth={1} />
      <line x1={cx} y1={margin} x2={cx} y2={svgH - margin} stroke="#334155" strokeWidth={1} />
      <text x={svgW - 14} y={cy + 4} fontSize={9} fill="#475569" fontFamily="monospace">Re</text>
      <text x={cx + 4} y={margin + 4} fontSize={9} fill="#475569" fontFamily="monospace">jIm</text>

      {/* Vt */}
      <Arrow x1={cx} y1={cy} x2={Vt_x2} y2={Vt_y2} color="#00d4ff" label="Vt∠0°" />
      {/* jXs·Ia */}
      <Arrow x1={jXs_x1} y1={jXs_y1} x2={jXs_x2} y2={jXs_y2} color="#f59e0b" label="jXs·Ia" pos="mid" />
      {/* Ef */}
      <Arrow x1={cx} y1={cy} x2={Ef_x2} y2={Ef_y2} color="#a78bfa" label="Ef" pos="end" />

      {/* Origin dot */}
      <circle cx={cx} cy={cy} r={3} fill="#94a3b8" />
    </svg>
  );
}

export function SynchronousMachineCalc() {
  const [Vt, setVt] = useState('220');
  const [Ia, setIa] = useState('10');
  const [Xs, setXs] = useState('5');
  const [theta, setTheta] = useState('30');

  const result = useMemo(() => {
    const vt = parseFloat(Vt), ia = parseFloat(Ia), xs = parseFloat(Xs), th = parseFloat(theta);
    if ([vt, ia, xs, th].some(isNaN) || vt <= 0 || ia <= 0 || xs <= 0) return null;
    return calculateSyncMachine(vt, ia, xs, th);
  }, [Vt, Ia, Xs, theta]);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Synchronous Generator Parameters</CardTitle>
          <CardDescription>Round-rotor machine per-phase analysis (generator convention)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <NumInput label="Vt — Terminal Voltage (per phase)" value={Vt} onChange={setVt} unit="V" min="0" />
          <NumInput label="Ia — Armature Current" value={Ia} onChange={setIa} unit="A" min="0" />
          <NumInput label="Xs — Synchronous Reactance" value={Xs} onChange={setXs} unit="Ω" min="0" />
          <NumInput label="θ — Power Factor Angle (+ = lagging)" value={theta} onChange={setTheta} unit="°" />
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Excitation Voltage  |Ef|', value: `${result.Ef.toFixed(2)} V`, color: 'text-violet-400' },
              { label: 'Voltage Regulation  %VR', value: `${result.VR.toFixed(2)}%`, color: result.VR > 0 ? 'text-amber-400' : 'text-emerald-400' },
              { label: 'Torque Angle  δ', value: `${result.delta.toFixed(2)}°`, color: 'text-primary' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="bg-muted/30 border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`font-mono font-bold text-lg ${color}`}>{value}</p>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Phasor Diagram</CardTitle>
              <CardDescription className="text-xs font-mono">Vt (reference) + jXs·Ia = Ef</CardDescription>
            </CardHeader>
            <CardContent>
              <PhasorSVG
                Vt_val={parseFloat(Vt)}
                Ef_re={result.Ef_re}
                Ef_im={result.Ef_im}
                jXsIa_re={result.jXsIa_re}
                jXsIa_im={result.jXsIa_im}
              />
              <div className="flex gap-4 justify-center mt-2 text-xs font-mono">
                <span className="text-primary">━ Vt</span>
                <span className="text-amber-400">━ jXs·Ia</span>
                <span className="text-violet-400">━ Ef</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/20 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Formula Reference</CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-mono text-muted-foreground space-y-1">
              <p>Ef = Vt + jXs·Ia  (generator phasor equation)</p>
              <p>Ia = Ia∠−θ  (lagging PF → θ positive)</p>
              <p>%VR = (|Ef| − Vt) / Vt × 100%</p>
              <p>δ = angle of Ef relative to Vt  (torque angle)</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
