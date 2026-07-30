import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SavePresetDialog } from '@/components/save-preset-dialog';
import {
  parseEngineering,
  parseCapacitance,
  parseInductance,
  formatEngineering,
  calculateRCFilter,
  calculateRLFilter,
} from '@/lib/circuit-math';

type FilterMode = 'rc-low' | 'rc-high' | 'rl-low' | 'rl-high';

interface FilterCalculatorProps {
  onSave?: (data: Record<string, unknown>, name: string) => void;
}

export function FilterCalculator({ onSave }: FilterCalculatorProps) {
  const [mode, setMode] = useState<FilterMode>('rc-low');
  const [r, setR] = useState('10k');
  const [c, setC] = useState('100n');
  const [l, setL] = useState('10m');
  const [f, setF] = useState('1k');

  const isRC = mode.startsWith('rc');
  const isLow = mode.endsWith('low');

  const parsedR = parseEngineering(r);
  const parsedC = parseCapacitance(c);
  const parsedL = parseInductance(l);
  const parsedF = parseEngineering(f);

  const result =
    parsedR !== null && parsedF !== null
      ? isRC && parsedC !== null
        ? calculateRCFilter(parsedR, parsedC, parsedF, isLow ? 'low-pass' : 'high-pass')
        : !isRC && parsedL !== null
        ? calculateRLFilter(parsedR, parsedL, parsedF, isLow ? 'low-pass' : 'high-pass')
        : null
      : null;

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <Card className="bg-card border-card-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Filter Configuration</CardTitle>
          <CardDescription className="font-mono text-xs">
            Select passive filter type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Filter Type
            </Label>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => v && setMode(v as FilterMode)}
              className="justify-start flex-wrap"
            >
              <ToggleGroupItem
                value="rc-low"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-rc-low"
              >
                RC Low-Pass
              </ToggleGroupItem>
              <ToggleGroupItem
                value="rc-high"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-rc-high"
              >
                RC High-Pass
              </ToggleGroupItem>
              <ToggleGroupItem
                value="rl-low"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-rl-low"
              >
                RL Low-Pass
              </ToggleGroupItem>
              <ToggleGroupItem
                value="rl-high"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-rl-high"
              >
                RL High-Pass
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card className="bg-card border-card-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Component Values</CardTitle>
            <CardDescription className="font-mono text-xs">
              Enter resistance, {isRC ? 'capacitance' : 'inductance'}, and frequency
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

            {isRC ? (
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
            ) : (
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
                Signal Frequency (f)
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
                onSave={(name) => onSave({ mode, r, c, l, f }, name)}
              />
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="bg-card border-primary/30 glow-primary">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Calculated Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                  Cutoff Frequency
                </p>
                <p className="text-3xl font-bold font-mono text-primary" data-testid="text-fc">
                  {formatEngineering(result.fc, 'Hz')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                    Gain at f
                  </p>
                  <p className="text-lg font-bold font-mono text-accent" data-testid="text-gain">
                    {result.gainDb.toFixed(2)} dB
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
                <div className="col-span-2">
                  <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                    f / fc Ratio
                  </p>
                  <p className="text-lg font-bold font-mono text-accent" data-testid="text-ratio">
                    {result.ratio.toFixed(3)}
                  </p>
                </div>
              </div>

              {/* Frequency response indicator */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-mono text-muted-foreground uppercase mb-2">
                  Response
                </p>
                <div className="relative h-6 bg-muted rounded-md overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full ${
                      isLow
                        ? result.ratio < 1
                          ? 'bg-primary'
                          : 'bg-accent'
                        : result.ratio > 1
                        ? 'bg-primary'
                        : 'bg-accent'
                    } transition-all`}
                    style={{
                      width: `${Math.min(
                        100,
                        isLow
                          ? result.ratio < 1
                            ? 100
                            : (1 / result.ratio) * 100
                          : result.ratio > 1
                          ? 100
                          : result.ratio * 100
                      )}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono font-semibold text-foreground/90 mix-blend-difference">
                      {isLow
                        ? result.ratio < 1
                          ? 'PASSBAND'
                          : 'STOPBAND'
                        : result.ratio > 1
                        ? 'PASSBAND'
                        : 'STOPBAND'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-mono text-muted-foreground uppercase mb-2">
                  Formula
                </p>
                <p className="text-sm font-mono text-foreground bg-muted/50 p-2 rounded" data-testid="text-formula">
                  {isRC && `fc = 1 / (2π·R·C)`}
                  {!isRC && `fc = R / (2π·L)`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
