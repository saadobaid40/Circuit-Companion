import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Download, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VoltageDividerDiagram } from '@/components/circuit-diagram';
import {
  parseEngineering,
  formatEngineering,
  solveOhmsLaw,
  calculateVoltageDivider,
} from '@/lib/circuit-math';

export function OhmsLawCalculator() {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<'ohms-law' | 'voltage-divider'>('ohms-law');

  // Ohm's Law state
  const [V, setV] = useState('');
  const [I, setI] = useState('');
  const [R, setR] = useState('');
  const [P, setP] = useState('');

  // Voltage Divider state
  const [Vin, setVin] = useState('12');
  const [R1, setR1] = useState('10k');
  const [R2, setR2] = useState('10k');

  const parsedV = V.trim() === '' ? null : parseEngineering(V);
  const parsedI = I.trim() === '' ? null : parseEngineering(I);
  const parsedR = R.trim() === '' ? null : parseEngineering(R);
  const parsedP = P.trim() === '' ? null : parseEngineering(P);

  const filledCount = [parsedV, parsedI, parsedR, parsedP].filter((v) => v !== null).length;

  const ohmsResult = filledCount === 2 ? solveOhmsLaw(parsedV, parsedI, parsedR, parsedP) : null;

  const parsedVin = parseEngineering(Vin);
  const parsedR1 = parseEngineering(R1);
  const parsedR2 = parseEngineering(R2);

  const dividerResult =
    parsedVin !== null && parsedR1 !== null && parsedR2 !== null
      ? calculateVoltageDivider(parsedVin, parsedR1, parsedR2)
      : null;

  const handleCopyOhmsLaw = () => {
    if (!ohmsResult) return;

    const text = [
      'OHM\'S LAW RESULTS',
      '='.repeat(30),
      ohmsResult.V !== undefined ? `V = ${formatEngineering(ohmsResult.V, 'V')}` : '',
      ohmsResult.I !== undefined ? `I = ${formatEngineering(ohmsResult.I, 'A')}` : '',
      ohmsResult.R !== undefined ? `R = ${formatEngineering(ohmsResult.R, 'Ω')}` : '',
      ohmsResult.P !== undefined ? `P = ${formatEngineering(ohmsResult.P, 'W')}` : '',
      '',
      `Formula: ${ohmsResult.formula}`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Results copied to clipboard',
      duration: 2000,
    });
  };

  const handleExportDivider = () => {
    if (!dividerResult) return;

    const text = [
      'VOLTAGE DIVIDER RESULTS',
      '='.repeat(30),
      '',
      'Input:',
      `  Vin = ${Vin}`,
      `  R1 = ${R1}`,
      `  R2 = ${R2}`,
      '',
      'Output:',
      `  Vout = ${formatEngineering(dividerResult.Vout, 'V')}`,
      `  I = ${formatEngineering(dividerResult.I, 'A')}`,
      `  P1 = ${formatEngineering(dividerResult.P1, 'W')}`,
      `  P2 = ${formatEngineering(dividerResult.P2, 'W')}`,
      `  Ptotal = ${formatEngineering(dividerResult.Ptotal, 'W')}`,
      '',
      'Formula: Vout = Vin × (R2 / (R1 + R2))',
    ].join('\n');

    navigator.clipboard.writeText(text);
    toast({
      title: 'Exported',
      description: 'Summary copied to clipboard',
      duration: 2000,
    });
  };

  return (
    <Tabs value={subTab} onValueChange={(v) => setSubTab(v as any)}>
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-card border border-border mb-6">
        <TabsTrigger
          value="ohms-law"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          data-testid="tab-ohms-law"
        >
          Ohm's Law Hub
        </TabsTrigger>
        <TabsTrigger
          value="voltage-divider"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          data-testid="tab-voltage-divider"
        >
          Voltage Divider
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ohms-law">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Parameters</CardTitle>
              <CardDescription className="font-mono text-xs">
                Fill in exactly 2 fields to solve
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Voltage (V)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={V}
                    onChange={(e) => setV(e.target.value)}
                    placeholder="e.g., 12, 5"
                    className="font-mono bg-card border-input"
                    data-testid="input-voltage"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-6">V</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Current (I)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={I}
                    onChange={(e) => setI(e.target.value)}
                    placeholder="e.g., 100m, 2"
                    className="font-mono bg-card border-input"
                    data-testid="input-current"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-6">A</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Resistance (R)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={R}
                    onChange={(e) => setR(e.target.value)}
                    placeholder="e.g., 1k, 220"
                    className="font-mono bg-card border-input"
                    data-testid="input-resistance"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-6">Ω</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Power (P)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={P}
                    onChange={(e) => setP(e.target.value)}
                    placeholder="e.g., 100m, 5"
                    className="font-mono bg-card border-input"
                    data-testid="input-power"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-6">W</span>
                </div>
              </div>

              {filledCount !== 2 && (
                <div className="bg-muted/30 border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {filledCount < 2
                      ? `Fill in ${2 - filledCount} more field${2 - filledCount === 1 ? '' : 's'} to solve`
                      : 'Clear one field to solve (need exactly 2 inputs)'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {ohmsResult && (
              <>
                <Card className="bg-card border-primary/30 glow-primary">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Calculated Values</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {ohmsResult.V !== undefined && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                          <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                            Voltage
                          </p>
                          <p className="text-xl font-bold font-mono text-primary" data-testid="text-result-v">
                            {formatEngineering(ohmsResult.V, 'V')}
                          </p>
                        </div>
                      )}
                      {ohmsResult.I !== undefined && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                          <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                            Current
                          </p>
                          <p className="text-xl font-bold font-mono text-primary" data-testid="text-result-i">
                            {formatEngineering(ohmsResult.I, 'A')}
                          </p>
                        </div>
                      )}
                      {ohmsResult.R !== undefined && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                          <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                            Resistance
                          </p>
                          <p className="text-xl font-bold font-mono text-primary" data-testid="text-result-r">
                            {formatEngineering(ohmsResult.R, 'Ω')}
                          </p>
                        </div>
                      )}
                      {ohmsResult.P !== undefined && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                          <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                            Power
                          </p>
                          <p className="text-xl font-bold font-mono text-primary" data-testid="text-result-p">
                            {formatEngineering(ohmsResult.P, 'W')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-xs font-mono text-muted-foreground uppercase mb-2">
                        Formula Used
                      </p>
                      <p className="text-sm font-mono text-accent" data-testid="text-formula">
                        {ohmsResult.formula}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyOhmsLaw}
                      className="w-full"
                      data-testid="button-copy-results"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Results
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="voltage-divider">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-6">
            <Card className="bg-card border-card-border">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Input Parameters</CardTitle>
                <CardDescription className="font-mono text-xs">
                  Configure voltage source and resistors
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
                      value={Vin}
                      onChange={(e) => setVin(e.target.value)}
                      placeholder="e.g., 12, 5"
                      className="font-mono bg-card border-input"
                      data-testid="input-vin"
                    />
                    <span className="text-sm font-mono text-muted-foreground w-6">V</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Resistor 1 (R1)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={R1}
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
                    Resistor 2 (R2)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={R2}
                      onChange={(e) => setR2(e.target.value)}
                      placeholder="e.g., 10k"
                      className="font-mono bg-card border-input"
                      data-testid="input-r2"
                    />
                    <span className="text-sm font-mono text-muted-foreground w-6">Ω</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {dividerResult && (
              <Card className="bg-card border-primary/30 glow-primary">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Calculated Values</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                      Output Voltage
                    </p>
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-vout">
                      {formatEngineering(dividerResult.Vout, 'V')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                        Current
                      </p>
                      <p className="text-lg font-bold font-mono text-accent" data-testid="text-divider-i">
                        {formatEngineering(dividerResult.I, 'A')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                        Total Power
                      </p>
                      <p className="text-lg font-bold font-mono text-accent" data-testid="text-ptotal">
                        {formatEngineering(dividerResult.Ptotal, 'W')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                        P1 (R1)
                      </p>
                      <p className="text-sm font-mono text-muted-foreground" data-testid="text-p1">
                        {formatEngineering(dividerResult.P1, 'W')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                        P2 (R2)
                      </p>
                      <p className="text-sm font-mono text-muted-foreground" data-testid="text-p2">
                        {formatEngineering(dividerResult.P2, 'W')}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportDivider}
                    className="w-full"
                    data-testid="button-export-divider"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Summary
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Circuit Diagram */}
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Circuit Diagram</CardTitle>
              <CardDescription className="font-mono text-xs">
                Voltage divider configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <VoltageDividerDiagram
                Vin={Vin || '?'}
                Vout={dividerResult ? formatEngineering(dividerResult.Vout, 'V') : '?'}
                R1={R1 || '?'}
                R2={R2 || '?'}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
