import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SavePresetDialog } from '@/components/save-preset-dialog';
import { Activity, Sliders, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import {
  parseEngineering,
  parseCapacitance,
  parseInductance,
  formatEngineering,
  calculateExtendedFilter,
  type ExtendedFilterResult,
} from '@/lib/circuit-math';
import {
  RCLowPassDiagram,
  RCHighPassDiagram,
  RLLowPassDiagram,
  RLHighPassDiagram,
  RLCSeriesLowPassDiagram,
  RLCSeriesHighPassDiagram,
  RLCSeriesBandPassDiagram,
  RLCSeriesBandStopDiagram,
  RLCParallelDiagram,
} from '@/components/filter-diagrams';

type Topology = 'rc' | 'rl' | 'rlc-series' | 'rlc-parallel';
type ResponseType = 'low-pass' | 'high-pass' | 'band-pass' | 'band-stop';

interface FilterCalculatorProps {
  onSave?: (data: Record<string, unknown>, name: string) => void;
}

export function FilterCalculator({ onSave }: FilterCalculatorProps) {
  const [topology, setTopology] = useState<Topology>('rc');
  const [responseType, setResponseType] = useState<ResponseType>('low-pass');
  const [r, setR] = useState('10k');
  const [c, setC] = useState('100n');
  const [l, setL] = useState('10m');
  const [f, setF] = useState('1k');

  // Valid response types per topology
  const validResponseTypes: Record<Topology, ResponseType[]> = {
    rc: ['low-pass', 'high-pass'],
    rl: ['low-pass', 'high-pass'],
    'rlc-series': ['low-pass', 'high-pass', 'band-pass', 'band-stop'],
    'rlc-parallel': ['low-pass', 'high-pass', 'band-pass', 'band-stop'],
  };

  // When topology changes, reset to first valid response if current is invalid
  const handleTopologyChange = (newTopology: Topology) => {
    setTopology(newTopology);
    const valid = validResponseTypes[newTopology];
    if (!valid.includes(responseType)) {
      setResponseType(valid[0]);
    }
  };

  const parsedR = parseEngineering(r);
  const parsedC = parseCapacitance(c);
  const parsedL = parseInductance(l);
  const parsedF = parseEngineering(f);

  const needsC = topology === 'rc' || topology.startsWith('rlc');
  const needsL = topology === 'rl' || topology.startsWith('rlc');

  const result: ExtendedFilterResult | null = useMemo(() => {
    if (parsedR === null || parsedF === null) return null;
    if (needsC && parsedC === null) return null;
    if (needsL && parsedL === null) return null;

    return calculateExtendedFilter({
      topology,
      responseType,
      r: parsedR,
      c: parsedC,
      l: parsedL,
      f: parsedF,
    });
  }, [topology, responseType, parsedR, parsedC, parsedL, parsedF, needsC, needsL]);

  // Generate Bode plot data (120 log-spaced points)
  const bodeData = useMemo(() => {
    if (!result) return [];
    
    const refFreq = result.fc || result.f0 || 1000;
    const fMin = Math.max(0.001, refFreq / 100);
    const fMax = Math.min(10e9, refFreq * 100);
    
    const logMin = Math.log10(fMin);
    const logMax = Math.log10(fMax);
    const points = 120;
    
    const data: { freq: number; gainDb: number; logFreq: number }[] = [];
    
    for (let i = 0; i < points; i++) {
      const logF = logMin + (i / (points - 1)) * (logMax - logMin);
      const freq = Math.pow(10, logF);
      
      const testResult = calculateExtendedFilter({
        topology,
        responseType,
        r: parsedR!,
        c: parsedC,
        l: parsedL,
        f: freq,
      });
      
      data.push({
        freq,
        logFreq: logF,
        gainDb: Math.max(-60, testResult.gainDb), // Clip at -60dB
      });
    }
    
    return data;
  }, [result, topology, responseType, parsedR, parsedC, parsedL]);

  // Select diagram component
  const DiagramComponent = useMemo(() => {
    if (topology === 'rc' && responseType === 'low-pass') return RCLowPassDiagram;
    if (topology === 'rc' && responseType === 'high-pass') return RCHighPassDiagram;
    if (topology === 'rl' && responseType === 'low-pass') return RLLowPassDiagram;
    if (topology === 'rl' && responseType === 'high-pass') return RLHighPassDiagram;
    if (topology === 'rlc-series' && responseType === 'low-pass') return RLCSeriesLowPassDiagram;
    if (topology === 'rlc-series' && responseType === 'high-pass') return RLCSeriesHighPassDiagram;
    if (topology === 'rlc-series' && responseType === 'band-pass') return RLCSeriesBandPassDiagram;
    if (topology === 'rlc-series' && responseType === 'band-stop') return RLCSeriesBandStopDiagram;
    return RLCParallelDiagram;
  }, [topology, responseType]);

  // Generate formula text
  const formulaText = useMemo(() => {
    if (topology === 'rc') {
      return responseType === 'low-pass'
        ? `fc = 1 / (2π·R·C)\n|H(f)| = 1 / √(1 + (f/fc)²)\nφ = −arctan(f/fc)`
        : `fc = 1 / (2π·R·C)\n|H(f)| = (f/fc) / √(1 + (f/fc)²)\nφ = arctan(fc/f)`;
    }
    if (topology === 'rl') {
      return responseType === 'low-pass'
        ? `fc = R / (2π·L)\n|H(f)| = 1 / √(1 + (f/fc)²)\nφ = −arctan(f/fc)`
        : `fc = R / (2π·L)\n|H(f)| = (f/fc) / √(1 + (f/fc)²)\nφ = arctan(fc/f)`;
    }
    // RLC
    const qFormula = topology === 'rlc-series' ? 'Q = √(L/C) / R' : 'Q = R·√(C/L)';
    return `f₀ = 1 / (2π·√(L·C))\n${qFormula}\nBW = f₀ / Q\nf₁ = f₀·(√(1 + 1/4Q²) − 1/2Q)\nf₂ = f₀·(√(1 + 1/4Q²) + 1/2Q)`;
  }, [topology, responseType]);

  return (
    <div className="space-y-6">
      {/* Filter selector */}
      <Card className="bg-card border-card-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Filter Configuration</CardTitle>
          <CardDescription className="font-mono text-xs">
            Select topology and response type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Topology
            </Label>
            <ToggleGroup
              type="single"
              value={topology}
              onValueChange={(v) => v && handleTopologyChange(v as Topology)}
              className="justify-start flex-wrap"
            >
              <ToggleGroupItem
                value="rc"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-topology-rc"
              >
                RC
              </ToggleGroupItem>
              <ToggleGroupItem
                value="rl"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-topology-rl"
              >
                RL
              </ToggleGroupItem>
              <ToggleGroupItem
                value="rlc-series"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-topology-rlc-series"
              >
                RLC Series
              </ToggleGroupItem>
              <ToggleGroupItem
                value="rlc-parallel"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-topology-rlc-parallel"
              >
                RLC Parallel
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Response Type
            </Label>
            <ToggleGroup
              type="single"
              value={responseType}
              onValueChange={(v) => v && setResponseType(v as ResponseType)}
              className="justify-start flex-wrap"
            >
              {validResponseTypes[topology].map((rt) => (
                <ToggleGroupItem
                  key={rt}
                  value={rt}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  data-testid={`toggle-response-${rt}`}
                >
                  {rt === 'low-pass' && 'Low-Pass'}
                  {rt === 'high-pass' && 'High-Pass'}
                  {rt === 'band-pass' && 'Band-Pass'}
                  {rt === 'band-stop' && 'Band-Stop (Notch)'}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inputs panel */}
        <Card className="bg-card border-card-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg font-bold">Component Values</CardTitle>
            </div>
            <CardDescription className="font-mono text-xs">
              Enter component values and test frequency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Resistance (R)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={r}
                  onChange={(e) => setR(e.target.value)}
                  placeholder="e.g., 10k, 1M"
                  className="font-mono bg-card border-input"
                  data-testid="input-r"
                />
                <span className="text-sm font-mono text-muted-foreground w-6">Ω</span>
              </div>
            </div>

            {needsC && (
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Capacitance (C)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={c}
                    onChange={(e) => setC(e.target.value)}
                    placeholder="e.g., 100n, 4.7u, 10p"
                    className="font-mono bg-card border-input"
                    data-testid="input-c"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-6">F</span>
                </div>
              </div>
            )}

            {needsL && (
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Inductance (L)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={l}
                    onChange={(e) => setL(e.target.value)}
                    placeholder="e.g., 10m, 100u, 1H"
                    className="font-mono bg-card border-input"
                    data-testid="input-l"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-6">H</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Test Frequency (f)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={f}
                  onChange={(e) => setF(e.target.value)}
                  placeholder="e.g., 1k, 100, 2.4M"
                  className="font-mono bg-card border-input"
                  data-testid="input-f"
                />
                <span className="text-sm font-mono text-muted-foreground w-8">Hz</span>
              </div>
            </div>

            {onSave && (
              <SavePresetDialog
                onSave={(name) => onSave({ topology, responseType, r, c, l, f }, name)}
              />
            )}
          </CardContent>
        </Card>

        {/* Schematic & Bode plot column */}
        <div className="space-y-6">
          {/* Schematic */}
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold font-mono uppercase tracking-wider">Circuit Diagram</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-4">
              <DiagramComponent />
            </CardContent>
          </Card>

          {/* Bode plot */}
          {result && bodeData.length > 0 && (
            <Card className="bg-card border-card-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <CardTitle className="text-lg font-bold">Bode Plot (Gain)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={bodeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="logFreq"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(val) => {
                        const freq = Math.pow(10, val);
                        return formatEngineering(freq, 'Hz').replace('Hz', '');
                      }}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Frequency', position: 'insideBottom', offset: -5, style: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 } }}
                    />
                    <YAxis
                      domain={[-60, 3]}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Gain (dB)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}
                      labelFormatter={(val) => formatEngineering(Math.pow(10, Number(val)), 'Hz')}
                      formatter={(value: number) => [`${value.toFixed(2)} dB`, 'Gain']}
                    />
                    {/* Reference lines */}
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <ReferenceLine y={-3} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.4} />
                    <ReferenceLine y={-20} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.3} />
                    <ReferenceLine y={-40} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.2} />
                    
                    {/* Cutoff/resonant frequency line */}
                    {(result.fc || result.f0) && (
                      <ReferenceLine
                        x={Math.log10(result.fc || result.f0!)}
                        stroke="hsl(var(--secondary))"
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                      />
                    )}
                    
                    {/* Bandwidth lines for BPF/BSF */}
                    {result.f1 && result.f2 && (
                      <>
                        <ReferenceLine
                          x={Math.log10(result.f1)}
                          stroke="hsl(var(--muted-foreground))"
                          strokeDasharray="2 2"
                          strokeOpacity={0.6}
                        />
                        <ReferenceLine
                          x={Math.log10(result.f2)}
                          stroke="hsl(var(--muted-foreground))"
                          strokeDasharray="2 2"
                          strokeOpacity={0.6}
                        />
                      </>
                    )}
                    
                    {/* Test frequency marker */}
                    {parsedF && (
                      <ReferenceLine
                        x={Math.log10(parsedF)}
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                      />
                    )}
                    
                    <Line
                      type="monotone"
                      dataKey="gainDb"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results panel */}
        {result && (
          <div className="space-y-6">
            <Card className="bg-card border-primary/30 glow-primary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <CardTitle className="text-lg font-bold">Calculated Values</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                  <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                    {result.fc !== null ? 'Cutoff Frequency' : 'Resonant Frequency (f₀)'}
                  </p>
                  <p className="text-3xl font-bold font-mono text-primary" data-testid="text-fc">
                    {formatEngineering(result.fc || result.f0!, 'Hz')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                      Gain at f
                    </p>
                    <p className="text-lg font-bold font-mono text-accent" data-testid="text-gain-db">
                      {result.gainDb.toFixed(2)} dB
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-1" data-testid="text-gain-ratio">
                      {result.gainRatio.toFixed(3)}×
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                      Phase Shift
                    </p>
                    <p className="text-lg font-bold font-mono text-accent" data-testid="text-phase">
                      {result.phaseShift.toFixed(1)}°
                    </p>
                  </div>
                </div>

                {result.q !== null && (
                  <>
                    <div className="border-t border-border pt-3 space-y-3">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                          Quality Factor (Q)
                        </p>
                        <p className="text-xl font-bold font-mono text-foreground" data-testid="text-q">
                          {result.q.toFixed(3)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                          Bandwidth (BW)
                        </p>
                        <p className="text-lg font-bold font-mono text-foreground" data-testid="text-bw">
                          {formatEngineering(result.bw!, 'Hz')}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                            Lower f₁
                          </p>
                          <p className="text-sm font-bold font-mono text-foreground" data-testid="text-f1">
                            {formatEngineering(result.f1!, 'Hz')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                            Upper f₂
                          </p>
                          <p className="text-sm font-bold font-mono text-foreground" data-testid="text-f2">
                            {formatEngineering(result.f2!, 'Hz')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Formula card */}
            <Card className="bg-muted/30 border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold font-mono uppercase tracking-wider">Formulas</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed" data-testid="text-formula">
                  {formulaText}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
