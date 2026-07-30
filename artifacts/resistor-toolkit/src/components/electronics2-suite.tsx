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
  calculateFET, calculateDiffAmp, generateBodeData,
  type FETType, type FETRegion,
} from '@/lib/electronics2-math';
import { formatEngineering } from '@/lib/circuit-math';

// ── Shared helpers ────────────────────────────────────────────────────────────

function ResultRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold text-foreground ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function NumInput({
  label, value, onChange, unit, step = 'any', min,
}: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; step?: string; min?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number" step={step} min={min}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="font-mono bg-background border-border"
        />
        {unit && <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">{unit}</span>}
      </div>
    </div>
  );
}

const REGION_COLORS: Record<FETRegion, string> = {
  cutoff: 'bg-muted text-muted-foreground border-border',
  triode: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  saturation: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
};
const REGION_LABELS: Record<FETRegion, string> = {
  cutoff: '⊘ Cutoff (Off)',
  triode: '▣ Triode / Ohmic',
  saturation: '✓ Saturation (Amplifier)',
};

// ── MOSFET / JFET Calculator ─────────────────────────────────────────────────

const FET_TYPES: { id: FETType; label: string }[] = [
  { id: 'nmos', label: 'NMOS' },
  { id: 'pmos', label: 'PMOS' },
  { id: 'njfet', label: 'N-JFET' },
];

export function MOSFETCalculator() {
  const [fetType, setFetType] = useState<FETType>('nmos');
  const [VGS, setVGS] = useState('3');
  const [VT, setVT] = useState('1');       // VT for MOSFET, VP for JFET
  const [Kn, setKn] = useState('2');       // mA/V² for MOSFET, IDSS (mA) for JFET
  const [VDS, setVDS] = useState('5');
  const [VP, setVP] = useState('-4');      // JFET pinch-off (V)
  const [IDSS, setIDSS] = useState('10');  // JFET IDSS (mA)

  const result = useMemo(() => {
    const vgs = parseFloat(VGS), vt = parseFloat(VT);
    const kn = parseFloat(Kn) * 1e-3, vds = parseFloat(VDS);
    const vp = parseFloat(VP), idss = parseFloat(IDSS) * 1e-3;
    if ([vgs, vt, kn, vds].some(isNaN)) return null;
    if (fetType === 'njfet' && (isNaN(vp) || isNaN(idss))) return null;
    return calculateFET(fetType, vgs, vt, kn, vds, idss, vp);
  }, [fetType, VGS, VT, Kn, VDS, VP, IDSS]);

  const isJFET = fetType === 'njfet';

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Device Parameters</CardTitle>
          <CardDescription>Configure the FET type and bias conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device type selector */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Device Type</Label>
            <div className="flex gap-2">
              {FET_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setFetType(t.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-mono font-medium transition-colors border ${
                    fetType === t.id
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumInput
              label={isJFET ? 'VGS — Gate-Source Voltage' : 'VGS — Gate-Source Voltage'}
              value={VGS} onChange={setVGS} unit="V"
            />
            {isJFET ? (
              <NumInput label="VP — Pinch-off Voltage (< 0)" value={VP} onChange={setVP} unit="V" />
            ) : (
              <NumInput
                label={fetType === 'pmos' ? 'VT — Threshold Voltage (< 0)' : 'VT — Threshold Voltage'}
                value={VT} onChange={setVT} unit="V"
              />
            )}
            {isJFET ? (
              <NumInput label="IDSS — Saturation Current" value={IDSS} onChange={setIDSS} unit="mA" min="0" />
            ) : (
              <NumInput label="Kn — Transconductance Parameter" value={Kn} onChange={setKn} unit="mA/V²" min="0" />
            )}
            <NumInput
              label={fetType === 'pmos' ? 'VDS (negative for PMOS)' : 'VDS — Drain-Source Voltage'}
              value={VDS} onChange={setVDS} unit="V"
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Analysis Results</CardTitle>
              <span className={`text-xs font-mono px-2 py-1 rounded border ${REGION_COLORS[result.region]}`}>
                {REGION_LABELS[result.region]}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ResultRow label="Drain Current  ID" value={formatEngineering(result.ID, 'A')} />
            <ResultRow label="Transconductance  gm" value={formatEngineering(result.gm, 'A/V')} />
            <ResultRow
              label={isJFET ? 'Overdrive  VGS − VP' : 'Overdrive  VGS − VT'}
              value={`${result.overdriveV.toFixed(3)} V`}
            />
            {result.VDSsat !== undefined && (
              <ResultRow label="Min VDS for Saturation" value={`${Math.abs(result.VDSsat).toFixed(3)} V`} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Formula reference */}
      <Card className="bg-muted/20 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Formula Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs font-mono text-muted-foreground">
          {isJFET ? (
            <>
              <p>Saturation:  I_D = I_DSS (1 − V_GS/V_P)²</p>
              <p>g_m = −2·I_DSS/V_P · (1 − V_GS/V_P)</p>
              <p>Condition:   V_DS ≥ V_GS − V_P</p>
            </>
          ) : fetType === 'pmos' ? (
            <>
              <p>Saturation:  I_D = (Kp/2)(V_SG − |V_TP|)²</p>
              <p>Triode:  I_D = Kp[(V_SG−|V_TP|)V_SD − V_SD²/2]</p>
              <p>g_m = Kp(V_SG − |V_TP|)  in saturation</p>
            </>
          ) : (
            <>
              <p>Saturation:  I_D = (Kn/2)(V_GS − V_T)²</p>
              <p>Triode:  I_D = Kn[(V_GS−V_T)V_DS − V_DS²/2]</p>
              <p>g_m = Kn(V_GS − V_T)  in saturation</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Differential Amplifier & CMRR ─────────────────────────────────────────────

export function DiffAmpCMRRCalculator() {
  const [IC, setIC] = useState('0.5');     // mA
  const [RC, setRC] = useState('10');     // kΩ
  const [REE, setREE] = useState('50');   // kΩ

  const result = useMemo(() => {
    const ic = parseFloat(IC) * 1e-3;
    const rc = parseFloat(RC) * 1e3;
    const ree = parseFloat(REE) * 1e3;
    if ([ic, rc, ree].some(v => isNaN(v) || v <= 0)) return null;
    return calculateDiffAmp(ic, rc, ree);
  }, [IC, RC, REE]);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">BJT Differential Pair</CardTitle>
          <CardDescription>Emitter-coupled pair with tail current source</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <NumInput label="IC — Quiescent Collector Current" value={IC} onChange={setIC} unit="mA" min="0.001" />
          <NumInput label="RC — Collector Resistance" value={RC} onChange={setRC} unit="kΩ" min="0" />
          <NumInput label="REE — Tail Resistance" value={REE} onChange={setREE} unit="kΩ" min="0" />
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Small-Signal Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultRow label="Emitter resistance  re = VT/IC" value={formatEngineering(result.re, 'Ω')} />
              <ResultRow label="Transconductance  gm = IC/VT" value={formatEngineering(result.gm, 'A/V')} />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Gain & CMRR Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultRow label="Differential Gain  |Ad| = RC/re" value={result.Ad.toFixed(2) + ' V/V'} />
              <ResultRow label="Ad in dB" value={(20 * Math.log10(result.Ad)).toFixed(1) + ' dB'} />
              <ResultRow label="Common-Mode Gain  |Acm| = RC/(2·REE)" value={Math.abs(result.Acm).toFixed(4) + ' V/V'} />
              <ResultRow label="CMRR  = |Ad/Acm|" value={result.CMRR.toFixed(1)} />
              <ResultRow
                label="CMRR in dB"
                value={
                  <span className="text-primary font-mono font-bold">{result.CMRR_dB.toFixed(1)} dB</span> as unknown as string
                }
              />
            </CardContent>
          </Card>
        </>
      )}

      <Card className="bg-muted/20 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Formula Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs font-mono text-muted-foreground">
          <p>re = VT / IC  (VT = 25.85 mV at 300 K)</p>
          <p>gm = IC / VT = 1/re</p>
          <p>Ad  = RC / re  (differential output)</p>
          <p>Acm = −RC / (2·REE)  (emitter-coupled pair)</p>
          <p>CMRR = |Ad / Acm| = 2·REE·gm</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Amplifier Frequency Response (Bode Plotter) ───────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { f, gain_dB } = payload[0].payload;
  const freq = f >= 1e6 ? `${(f / 1e6).toFixed(2)} MHz`
    : f >= 1e3 ? `${(f / 1e3).toFixed(2)} kHz`
    : `${f.toFixed(1)} Hz`;
  return (
    <div className="bg-popover border border-border rounded px-3 py-2 text-xs font-mono shadow-lg">
      <p className="text-foreground">{freq}</p>
      <p className="text-primary">{gain_dB.toFixed(1)} dB</p>
    </div>
  );
};

export function BodePlotter() {
  const [fL, setFL] = useState('200');
  const [fH, setFH] = useState('20000');
  const [Amid, setAmid] = useState('100');

  const { data, BW, midband_dB } = useMemo(() => {
    const fl = parseFloat(fL), fh = parseFloat(fH), am = parseFloat(Amid);
    if ([fl, fh, am].some(v => isNaN(v) || v <= 0) || fl >= fh) {
      return { data: [], BW: 0, midband_dB: 0 };
    }
    return generateBodeData(fl, fh, am);
  }, [fL, fH, Amid]);

  // Log-transform X for true Bode plot appearance
  const chartData = data.map(d => ({ logF: Math.log10(d.f), gain_dB: d.gain_dB, f: d.f }));
  const fLlog = Math.log10(parseFloat(fL) || 200);
  const fHlog = Math.log10(parseFloat(fH) || 20000);
  const m3dB = midband_dB - 3;

  const freqTickFormatter = (logF: number) => {
    const f = Math.pow(10, logF);
    if (f >= 1e6) return `${(f / 1e6).toFixed(0)}M`;
    if (f >= 1e3) return `${(f / 1e3).toFixed(0)}k`;
    return `${Math.round(f)}`;
  };

  // Tick positions at each decade
  const logMin = chartData.length ? chartData[0].logF : 0;
  const logMax = chartData.length ? chartData[chartData.length - 1].logF : 1;
  const ticks: number[] = [];
  for (let d = Math.ceil(logMin); d <= Math.floor(logMax) + 1; d++) ticks.push(d);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Amplifier Frequency Response</CardTitle>
          <CardDescription>Single-pole low & high-frequency roll-off model</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <NumInput label="fL — Lower 3 dB Frequency" value={fL} onChange={setFL} unit="Hz" min="0" />
          <NumInput label="fH — Upper 3 dB Frequency" value={fH} onChange={setFH} unit="Hz" min="0" />
          <NumInput label="Amid — Midband Gain" value={Amid} onChange={setAmid} unit="V/V" min="0" />
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Midband Gain', value: `${midband_dB.toFixed(1)} dB` },
              { label: 'Bandwidth', value: BW >= 1e3 ? `${(BW / 1e3).toFixed(2)} kHz` : `${BW.toFixed(0)} Hz` },
              { label: '−3 dB Level', value: `${m3dB.toFixed(1)} dB` },
            ].map(({ label, value }) => (
              <Card key={label} className="bg-muted/30 border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="font-mono font-bold text-primary text-lg">{value}</p>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Bode Magnitude Plot</CardTitle>
              <CardDescription className="text-xs font-mono">Gain (dB) vs Frequency (Hz) — log scale</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    dataKey="logF"
                    type="number"
                    domain={[logMin, logMax]}
                    ticks={ticks}
                    tickFormatter={freqTickFormatter}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -18, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={v => `${v}dB`}
                    label={{ value: 'Gain (dB)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {/* -3 dB reference line */}
                  <ReferenceLine y={m3dB} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: '−3 dB', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
                  {/* fL and fH */}
                  <ReferenceLine x={fLlog} stroke="#6b7280" strokeDasharray="3 3" label={{ value: 'fL', position: 'top', fontSize: 9, fill: '#6b7280' }} />
                  <ReferenceLine x={fHlog} stroke="#6b7280" strokeDasharray="3 3" label={{ value: 'fH', position: 'top', fontSize: 9, fill: '#6b7280' }} />
                  <Line type="monotone" dataKey="gain_dB" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="bg-muted/20 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Formula Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs font-mono text-muted-foreground">
          <p>|A(f)| = Amid · (f/fL) / √[(1+(f/fL)²)(1+(f/fH)²)]</p>
          <p>At f = fL or f = fH → |A| = Amid/√2 → −3 dB</p>
          <p>BW = fH − fL</p>
        </CardContent>
      </Card>
    </div>
  );
}
