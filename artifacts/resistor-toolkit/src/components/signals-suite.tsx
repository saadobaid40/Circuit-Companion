import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  generateFourier, findRoots, parseCoeffs, convolve, getSignalSamples,
  type WaveType, type SignalShape, type Complex,
} from '@/lib/signals-math';

// ── Shared helpers ────────────────────────────────────────────────────────────

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

function ToggleRow({ label, options, value, onChange }: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-2 block">{label}</Label>
      <div className="flex gap-2 flex-wrap">
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-mono font-medium transition-colors border ${
              value === o.id
                ? 'bg-primary/20 text-primary border-primary/50'
                : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Fourier Series Waveform Synthesizer ───────────────────────────────────────

const WAVE_OPTIONS: { id: WaveType; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'sawtooth', label: 'Sawtooth' },
  { id: 'triangle', label: 'Triangle' },
];

const WAVE_COLORS: Record<WaveType, string> = {
  square: 'hsl(var(--primary))',
  sawtooth: '#f59e0b',
  triangle: '#a78bfa',
};

const FourierTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded px-2 py-1.5 text-xs font-mono shadow-lg">
      <p className="text-muted-foreground">t = {payload[0]?.payload?.t?.toFixed(2)} ms</p>
      <p className="text-primary">y = {payload[0]?.value?.toFixed(3)}</p>
    </div>
  );
};

export function FourierSynthesizer() {
  const [waveType, setWaveType] = useState<WaveType>('square');
  const [N, setN] = useState(5);
  const [f0, setF0] = useState('1000');

  const maxN = waveType === 'sawtooth' ? 31 : 31;

  const data = useMemo(() => {
    const freq = parseFloat(f0) || 1000;
    return generateFourier(waveType, N, freq);
  }, [waveType, N, f0]);

  const oddOnly = waveType !== 'sawtooth';
  const nDisplay = oddOnly ? (N % 2 === 0 ? N - 1 : N) : N;
  const harmonicList = Array.from(
    { length: nDisplay },
    (_, i) => oddOnly ? 2 * i + 1 : i + 1,
  ).filter(k => k <= N);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Waveform & Harmonics</CardTitle>
          <CardDescription>Synthesize periodic waveforms from their Fourier harmonics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ToggleRow label="Waveform Type" options={WAVE_OPTIONS} value={waveType} onChange={v => setWaveType(v as WaveType)} />
            <NumInput label="f₀ — Fundamental Frequency" value={f0} onChange={setF0} unit="Hz" min="1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                Harmonics N = {N} &nbsp;
                <span className="text-primary">({harmonicList.map(k => `k=${k}`).join(', ')})</span>
              </Label>
              <span className="text-xs font-mono text-muted-foreground">{N}/{maxN}</span>
            </div>
            <input
              type="range" min={1} max={maxN} step={oddOnly ? 2 : 1}
              value={N}
              onChange={e => setN(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Synthesized Waveform</CardTitle>
          <CardDescription className="text-xs font-mono">
            {waveType === 'square' && 'f(t) = (4/π) Σ sin(k·2π·f₀·t) / k,  k = 1,3,5…'}
            {waveType === 'sawtooth' && 'f(t) = (2/π) Σ (−1)^(k+1) sin(k·2π·f₀·t) / k'}
            {waveType === 'triangle' && 'f(t) = (8/π²) Σ (−1)^m cos(k·2π·f₀·t) / k²,  k = 1,3,5…'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="t" type="number"
                tickFormatter={v => `${v.toFixed(1)}`}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Time (ms)', position: 'insideBottom', offset: -18, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[-1.5, 1.5]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<FourierTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Line type="monotone" dataKey="y" stroke={WAVE_COLORS[waveType]} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Laplace / Z-Transform Pole-Zero Plotter ───────────────────────────────────

type PlotDomain = 's' | 'z';

function PoleZeroSVG({ poles, zeros, domain }: { poles: Complex[]; zeros: Complex[]; domain: PlotDomain }) {
  const svgW = 380, svgH = 280;
  const pad = 40;

  // Determine coordinate range
  const all = [...poles, ...zeros];
  const absVals = all.flatMap(c => [Math.abs(c.re), Math.abs(c.im)]);
  const maxCoord = Math.max(...absVals, domain === 'z' ? 1.5 : 1, 0.1) * 1.2;

  const cx = svgW / 2, cy = svgH / 2;
  const drawW = svgW - 2 * pad, drawH = svgH - 2 * pad;
  const sc = Math.min(drawW, drawH) / 2 / maxCoord;

  const tx = (re: number) => cx + re * sc;
  const ty = (im: number) => cy - im * sc;

  // Unit circle points (for z-plane)
  const circlePoints = Array.from({ length: 361 }, (_, i) => {
    const a = (i * Math.PI) / 180;
    return `${tx(Math.cos(a))},${ty(Math.sin(a))}`;
  }).join(' ');

  // Axis ticks
  const tickVals: number[] = [];
  const step = maxCoord > 5 ? Math.ceil(maxCoord / 4) : maxCoord > 2 ? 1 : 0.5;
  for (let v = -maxCoord; v <= maxCoord; v += step) {
    if (Math.abs(v) > 0.01) tickVals.push(parseFloat(v.toFixed(2)));
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 280 }}>
      {/* Grid */}
      {tickVals.map(v => (
        <g key={v}>
          <line x1={tx(v)} y1={pad} x2={tx(v)} y2={svgH - pad} stroke="#1e293b" strokeWidth={0.8} />
          <line x1={pad} y1={ty(v)} x2={svgW - pad} y2={ty(v)} stroke="#1e293b" strokeWidth={0.8} />
        </g>
      ))}

      {/* Stability shading */}
      {domain === 's' ? (
        // Left half-plane (stable region)
        <rect x={pad} y={pad} width={cx - pad} height={svgH - 2 * pad}
          fill="rgba(16,185,129,0.04)" stroke="none" />
      ) : (
        // Unit disk (stable region)
        <circle cx={cx} cy={cy} r={sc} fill="rgba(16,185,129,0.06)" stroke="none" />
      )}

      {/* Axes */}
      <line x1={pad} y1={cy} x2={svgW - pad} y2={cy} stroke="#334155" strokeWidth={1.5} />
      <line x1={cx} y1={pad} x2={cx} y2={svgH - pad} stroke="#334155" strokeWidth={1.5} />
      <text x={svgW - pad - 2} y={cy - 4} fontSize={9} fill="#475569" fontFamily="monospace" textAnchor="end">Re</text>
      <text x={cx + 4} y={pad + 8} fontSize={9} fill="#475569" fontFamily="monospace">jIm</text>

      {/* Unit circle (z-plane) */}
      {domain === 'z' && (
        <polyline points={circlePoints} fill="none" stroke="#334155" strokeWidth={1.2} strokeDasharray="4 3" />
      )}

      {/* Stability boundary label */}
      {domain === 's' && (
        <text x={cx - 8} y={pad + 14} fontSize={9} fill="#334155" fontFamily="monospace" textAnchor="end">← stable | unstable →</text>
      )}

      {/* Axis tick labels */}
      {tickVals.filter((_, i) => i % 2 === 0).map(v => (
        <g key={v}>
          <text x={tx(v)} y={cy + 12} fontSize={8} fill="#475569" textAnchor="middle" fontFamily="monospace">{v}</text>
          <text x={cx - 4} y={ty(v) + 3} fontSize={8} fill="#475569" textAnchor="end" fontFamily="monospace">{v}j</text>
        </g>
      ))}

      {/* Zeros (O) */}
      {zeros.map((z, i) => (
        <circle key={`z${i}`} cx={tx(z.re)} cy={ty(z.im)} r={7}
          fill="none" stroke="#00d4ff" strokeWidth={2.5} />
      ))}

      {/* Poles (X) */}
      {poles.map((p, i) => (
        <g key={`p${i}`}>
          <line x1={tx(p.re) - 6} y1={ty(p.im) - 6} x2={tx(p.re) + 6} y2={ty(p.im) + 6}
            stroke="#ef4444" strokeWidth={2.5} />
          <line x1={tx(p.re) + 6} y1={ty(p.im) - 6} x2={tx(p.re) - 6} y2={ty(p.im) + 6}
            stroke="#ef4444" strokeWidth={2.5} />
        </g>
      ))}
    </svg>
  );
}

export function PoleZeroPlotter() {
  const [numStr, setNumStr] = useState('1 -1');
  const [denStr, setDenStr] = useState('1 1 2');
  const [domain, setDomain] = useState<PlotDomain>('s');

  const { poles, zeros, stable, poleList, zeroList } = useMemo(() => {
    const numCoeffs = parseCoeffs(numStr);
    const denCoeffs = parseCoeffs(denStr);
    const rawZeros = numCoeffs.length > 1 ? findRoots(numCoeffs) : [];
    const rawPoles = denCoeffs.length > 1 ? findRoots(denCoeffs) : [];

    // Snap near-zero imaginary parts
    const snap = (r: Complex[]): Complex[] =>
      r.map(c => ({ re: c.re, im: Math.abs(c.im) < 1e-8 ? 0 : c.im }));

    const poles = snap(rawPoles);
    const zeros = snap(rawZeros);

    const stable = domain === 's'
      ? poles.every(p => p.re < 0)
      : poles.every(p => Math.sqrt(p.re ** 2 + p.im ** 2) < 1);

    const fmt = (c: Complex) =>
      Math.abs(c.im) < 1e-8
        ? c.re.toFixed(4)
        : `${c.re.toFixed(3)} ${c.im >= 0 ? '+' : ''}${c.im.toFixed(3)}j`;

    return { poles, zeros, stable, poleList: poles.map(fmt), zeroList: zeros.map(fmt) };
  }, [numStr, denStr, domain]);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Transfer Function H(s) or H(z)</CardTitle>
          <CardDescription>Enter coefficients from highest to lowest degree (space-separated)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="Transform Domain"
            options={[{ id: 's', label: 'Laplace (s-plane)' }, { id: 'z', label: 'Z-transform (z-plane)' }]}
            value={domain}
            onChange={v => setDomain(v as PlotDomain)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Numerator coefficients</Label>
              <Input value={numStr} onChange={e => setNumStr(e.target.value)}
                className="font-mono bg-background border-border" placeholder="e.g. 1 -1" />
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                zeros: {zeroList.length ? zeroList.join(',  ') : 'none'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Denominator coefficients</Label>
              <Input value={denStr} onChange={e => setDenStr(e.target.value)}
                className="font-mono bg-background border-border" placeholder="e.g. 1 1 2" />
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                poles: {poleList.length ? poleList.join(',  ') : 'none'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <span className={`text-sm font-mono font-semibold px-3 py-1.5 rounded-md border ${
          stable
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
            : 'bg-red-500/15 text-red-400 border-red-500/40'
        }`}>
          {stable ? '✓ BIBO Stable' : '✗ Unstable'}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {domain === 's' ? 'All poles must be in Left Half-Plane' : 'All poles must be inside Unit Circle'}
        </span>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {domain === 's' ? 's-Plane' : 'z-Plane'} Pole-Zero Plot
            </CardTitle>
            <div className="flex gap-3 text-xs font-mono">
              <span className="text-primary">○ Zero</span>
              <span className="text-red-400">× Pole</span>
              {domain === 'z' && <span className="text-muted-foreground">- - Unit Circle</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PoleZeroSVG poles={poles} zeros={zeros} domain={domain} />
        </CardContent>
      </Card>

      <Card className="bg-muted/20 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Examples</CardTitle>
        </CardHeader>
        <CardContent className="text-xs font-mono text-muted-foreground space-y-1">
          <p>2nd-order LPF (s): num=<span className="text-primary">1</span>, den=<span className="text-primary">1 √2 1</span></p>
          <p>Notch filter (s): num=<span className="text-primary">1 0 1</span>, den=<span className="text-primary">1 0.1 1</span></p>
          <p>IIR filter (z): num=<span className="text-primary">1 -0.5</span>, den=<span className="text-primary">1 -0.9 0.2</span></p>
          <p>Unstable (s): num=<span className="text-primary">1</span>, den=<span className="text-primary">1 -1 2</span></p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Convolution Visualizer ────────────────────────────────────────────────────

const SIG_OPTIONS: { id: SignalShape; label: string }[] = [
  { id: 'rect', label: 'Rectangle' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'exp', label: 'Exponential' },
];

const ConvTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded px-2 py-1.5 text-xs font-mono shadow-lg">
      <p className="text-muted-foreground">n = {label}</p>
      <p className="text-primary">{payload[0]?.value?.toFixed(4)}</p>
    </div>
  );
};

const N_SAMPLES = 48;

export function ConvolutionVisualizer() {
  const [fType, setFType] = useState<SignalShape>('rect');
  const [gType, setGType] = useState<SignalShape>('exp');
  const [tauIdx, setTauIdx] = useState(40);

  const { fSig, gSig, conv, convLen, gShifted } = useMemo(() => {
    const fSig = getSignalSamples(fType, N_SAMPLES);
    const gSig = getSignalSamples(gType, N_SAMPLES);
    const conv = convolve(fSig, gSig);
    const convLen = conv.length;

    // Compute g[n - k] for display at current tauIdx: g reversed and shifted by tauIdx
    const gShifted = Array.from({ length: convLen }, (_, k) => {
      const gIdx = tauIdx - k;
      return (gIdx >= 0 && gIdx < N_SAMPLES) ? gSig[gIdx] : 0;
    });

    return { fSig, gSig, conv, convLen, gShifted };
  }, [fType, gType, tauIdx]);

  const maxConv = Math.max(...conv.map(Math.abs), 1);
  const convData = conv.map((v, i) => ({ n: i, y: v / maxConv }));
  const fData = Array.from({ length: convLen }, (_, k) => ({ n: k, y: k < N_SAMPLES ? fSig[k] : 0 }));
  const gData = gShifted.map((v, i) => ({ n: i, y: v }));

  // Accumulated convolution up to tauIdx (normalized)
  const accum = conv.slice(0, tauIdx + 1).map((v, i) => ({ n: i, y: v / maxConv }));

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Discrete Convolution  (f * g)[n]</CardTitle>
          <CardDescription>Step through the flip-and-slide convolution process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ToggleRow label="Signal f[k]" options={SIG_OPTIONS} value={fType} onChange={v => setFType(v as SignalShape)} />
            <ToggleRow label="Signal g[k]" options={SIG_OPTIONS} value={gType} onChange={v => setGType(v as SignalShape)} />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-xs text-muted-foreground">
                Time index n = <span className="text-primary font-mono">{tauIdx}</span>
              </Label>
              <span className="text-xs font-mono text-muted-foreground">
                (f*g)[{tauIdx}] = <span className="text-primary">{(conv[tauIdx] / maxConv).toFixed(4)}</span> (normalized)
              </span>
            </div>
            <input type="range" min={0} max={convLen - 1} step={1} value={tauIdx}
              onChange={e => setTauIdx(Number(e.target.value))}
              className="w-full accent-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Three stacked charts */}
      {[
        {
          title: 'f[k]  — Signal f',
          data: fData,
          color: 'hsl(var(--primary))',
          refX: null as number | null,
          yLabel: 'f[k]',
        },
        {
          title: `g[n−k]  — g flipped & shifted to n = ${tauIdx}`,
          data: gData,
          color: '#f59e0b',
          refX: tauIdx,
          yLabel: 'g[n−k]',
        },
        {
          title: '(f * g)[n]  — Convolution result',
          data: convData,
          color: '#a78bfa',
          refX: tauIdx,
          yLabel: '(f*g)[n]',
        },
      ].map(({ title, data, color, refX, yLabel }) => (
        <Card key={title} className="bg-card border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-mono text-muted-foreground">{title}</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={data} margin={{ top: 4, right: 16, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="n" type="number"
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'n', position: 'insideRight', offset: 4, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={v => v.toFixed(1)}
                  label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 12, fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<ConvTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                {refX !== null && (
                  <ReferenceLine x={refX} stroke={color} strokeDasharray="3 3" opacity={0.6} />
                )}
                <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.8} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-muted/20 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Formula Reference</CardTitle>
        </CardHeader>
        <CardContent className="text-xs font-mono text-muted-foreground space-y-1">
          <p>(f * g)[n] = Σ f[k] · g[n−k]  for all k</p>
          <p>Step 1: Flip g → g[−k]</p>
          <p>Step 2: Shift by n → g[n−k]</p>
          <p>Step 3: Multiply f[k]·g[n−k] and sum → (f*g)[n]</p>
          <p>Output length = len(f) + len(g) − 1</p>
        </CardContent>
      </Card>
    </div>
  );
}
