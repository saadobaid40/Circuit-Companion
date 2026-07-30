import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { SavePresetDialog } from '@/components/save-preset-dialog';
import { AlertTriangle } from 'lucide-react';
import { InvertingOpAmpDiagram, NonInvertingOpAmpDiagram, VoltageFollowerDiagram } from '@/components/opamp-diagrams';
import {
  parseEngineering,
  formatEngineering,
  calculateInvertingOpAmp,
  calculateNonInvertingOpAmp,
  calculateVoltageFollower,
} from '@/lib/circuit-math';

type OpAmpMode = 'inverting' | 'non-inverting' | 'buffer';

interface OpAmpCalculatorProps {
  onSave?: (data: Record<string, unknown>, name: string) => void;
}

export function OpAmpCalculator({ onSave }: OpAmpCalculatorProps) {
  const [mode, setMode] = useState<OpAmpMode>('inverting');
  const [vin, setVin] = useState('1');
  const [vcc, setVcc] = useState('12');
  const [vee, setVee] = useState('-12');
  const [r1, setR1] = useState('10k');
  const [rf, setRf] = useState('100k');

  const parsedVin = parseEngineering(vin);
  const parsedVcc = parseEngineering(vcc);
  const parsedVee = parseEngineering(vee);
  const parsedR1 = parseEngineering(r1);
  const parsedRf = parseEngineering(rf);

  const result =
    parsedVin !== null && parsedVcc !== null && parsedVee !== null
      ? mode === 'buffer'
        ? calculateVoltageFollower(parsedVin, parsedVcc, parsedVee)
        : parsedR1 !== null && parsedRf !== null
        ? mode === 'inverting'
          ? calculateInvertingOpAmp(parsedVin, parsedR1, parsedRf, parsedVcc, parsedVee)
          : calculateNonInvertingOpAmp(parsedVin, parsedR1, parsedRf, parsedVcc, parsedVee)
        : null
      : null;

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <Card className="bg-card border-card-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Configuration</CardTitle>
          <CardDescription className="font-mono text-xs">
            Select op-amp circuit type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Circuit Type
            </Label>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => v && setMode(v as OpAmpMode)}
              className="justify-start flex-wrap"
            >
              <ToggleGroupItem
                value="inverting"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-inverting"
              >
                Inverting
              </ToggleGroupItem>
              <ToggleGroupItem
                value="non-inverting"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-non-inverting"
              >
                Non-Inverting
              </ToggleGroupItem>
              <ToggleGroupItem
                value="buffer"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-testid="toggle-buffer"
              >
                Voltage Follower
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-6">
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Parameters</CardTitle>
              <CardDescription className="font-mono text-xs">
                Configure input and supply voltages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Input Voltage (Vin)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    placeholder="e.g., 1, 2.5"
                    className="font-mono bg-card border-input"
                    data-testid="input-vin"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-6">V</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    +Vcc
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={vcc}
                      onChange={(e) => setVcc(e.target.value)}
                      placeholder="12"
                      className="font-mono bg-card border-input"
                      data-testid="input-vcc"
                    />
                    <span className="text-sm font-mono text-muted-foreground w-6">V</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    −Vee
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={vee}
                      onChange={(e) => setVee(e.target.value)}
                      placeholder="-12"
                      className="font-mono bg-card border-input"
                      data-testid="input-vee"
                    />
                    <span className="text-sm font-mono text-muted-foreground w-6">V</span>
                  </div>
                </div>
              </div>

              {mode !== 'buffer' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      {mode === 'inverting' ? 'Input Resistor (R1)' : 'Ground Resistor (R1)'}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={r1}
                        onChange={(e) => setR1(e.target.value)}
                        placeholder="e.g., 10k"
                        className="font-mono bg-card border-input"
                        data-testid="input-r1"
                      />
                      <span className="text-sm font-mono text-muted-foreground w-6">Ω</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Feedback Resistor (Rf)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={rf}
                        onChange={(e) => setRf(e.target.value)}
                        placeholder="e.g., 100k"
                        className="font-mono bg-card border-input"
                        data-testid="input-rf"
                      />
                      <span className="text-sm font-mono text-muted-foreground w-6">Ω</span>
                    </div>
                  </div>
                </>
              )}

              {onSave && (
                <SavePresetDialog
                  onSave={(name) => onSave({ mode, vin, vcc, vee, r1, rf }, name)}
                />
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className={`bg-card ${result.saturated ? 'border-accent/50' : 'border-primary/30 glow-primary'}`}>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Calculated Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                      Voltage Gain
                    </p>
                    <p className="text-xl font-bold font-mono text-primary" data-testid="text-gain">
                      {result.gain.toFixed(3)}
                    </p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                      Output Voltage
                    </p>
                    <p className="text-xl font-bold font-mono text-primary" data-testid="text-vout">
                      {formatEngineering(result.saturated ? result.voutClamped : result.vout, 'V')}
                    </p>
                  </div>
                </div>

                {result.saturated && (
                  <div className="bg-accent/10 border border-accent/30 rounded-md p-3 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-accent mb-1" data-testid="text-saturation-warning">
                        OUTPUT SATURATED
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Output clipped to {result.saturatedHigh ? '+Vcc' : '−Vee'} (
                        {formatEngineering(result.voutClamped, 'V')})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ideal output: {formatEngineering(result.vout, 'V')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-mono text-muted-foreground uppercase mb-2">
                    Formula
                  </p>
                  <p className="text-sm font-mono text-foreground" data-testid="text-formula">
                    {mode === 'inverting' && 'Av = -(Rf / R1)'}
                    {mode === 'non-inverting' && 'Av = 1 + (Rf / R1)'}
                    {mode === 'buffer' && 'Av = 1 (Unity Gain)'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Circuit Diagram */}
        <Card className="bg-card border-card-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Circuit Diagram</CardTitle>
            <CardDescription className="font-mono text-xs">
              {mode === 'inverting' && 'Inverting amplifier configuration'}
              {mode === 'non-inverting' && 'Non-inverting amplifier configuration'}
              {mode === 'buffer' && 'Unity-gain buffer configuration'}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 flex items-center justify-center">
            {mode === 'inverting' && <InvertingOpAmpDiagram />}
            {mode === 'non-inverting' && <NonInvertingOpAmpDiagram />}
            {mode === 'buffer' && <VoltageFollowerDiagram />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
