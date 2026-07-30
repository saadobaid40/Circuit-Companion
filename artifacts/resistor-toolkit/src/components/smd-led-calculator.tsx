import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SavePresetDialog } from '@/components/save-preset-dialog';
import { Copy, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  decodeSMDResistor,
  calculateLEDResistor,
  formatEngineering,
} from '@/lib/circuit-math';
import { formatResistance } from '@/lib/resistor-color-code';

interface SmdLedCalculatorProps {
  onSave?: (data: Record<string, unknown>, name: string) => void;
}

export function SmdLedCalculator({ onSave }: SmdLedCalculatorProps) {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<'smd' | 'led'>('smd');

  // SMD state
  const [smdCode, setSmdCode] = useState('103');

  // LED state
  const [vs, setVs] = useState('12');
  const [vf, setVf] = useState('2.0');
  const [ifMa, setIfMa] = useState('20');
  const [numLeds, setNumLeds] = useState('1');

  const smdResult = smdCode.trim() !== '' ? decodeSMDResistor(smdCode) : null;

  const parsedVs = parseFloat(vs);
  const parsedVf = parseFloat(vf);
  const parsedIfMa = parseFloat(ifMa);
  const parsedNumLeds = parseInt(numLeds, 10);

  const ledResult =
    !isNaN(parsedVs) && !isNaN(parsedVf) && !isNaN(parsedIfMa) && !isNaN(parsedNumLeds)
      ? calculateLEDResistor(parsedVs, parsedVf, parsedIfMa, parsedNumLeds)
      : null;

  const handleCopySMD = () => {
    if (smdResult && !smdResult.error) {
      const formatted = formatResistance(smdResult.value);
      navigator.clipboard.writeText(formatted);
      toast({
        title: 'Copied',
        description: `${formatted} copied to clipboard`,
        duration: 2000,
      });
    }
  };

  return (
    <Tabs value={subTab} onValueChange={(v) => setSubTab(v as 'smd' | 'led')}>
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-card border border-border mb-6">
        <TabsTrigger
          value="smd"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          data-testid="tab-smd"
        >
          SMD Decoder
        </TabsTrigger>
        <TabsTrigger
          value="led"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          data-testid="tab-led"
        >
          LED Resistor
        </TabsTrigger>
      </TabsList>

      <TabsContent value="smd">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">SMD Resistor Decoder</CardTitle>
              <CardDescription className="font-mono text-xs">
                Decode 3-digit, 4-digit, and EIA-96 SMD codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  SMD Code
                </Label>
                <Input
                  type="text"
                  value={smdCode}
                  onChange={(e) => setSmdCode(e.target.value)}
                  placeholder="e.g., 103, 4702, 01A, 68C"
                  className="font-mono text-lg bg-card border-input"
                  data-testid="input-smd-code"
                />
              </div>

              {smdResult && !smdResult.error && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                          Resistance Value
                        </p>
                        <p className="text-3xl font-bold font-mono text-primary" data-testid="text-smd-value">
                          {formatResistance(smdResult.value)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopySMD}
                        data-testid="button-copy-smd"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono" data-testid="badge-format">
                      {smdResult.format === '3-digit' && '3-Digit'}
                      {smdResult.format === '4-digit' && '4-Digit'}
                      {smdResult.format === 'eia-96' && 'EIA-96'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {smdResult.format === '3-digit' &&
                        'Standard 3-digit code (AB × 10^C)'}
                      {smdResult.format === '4-digit' &&
                        'Precision 4-digit code (ABC × 10^D)'}
                      {smdResult.format === 'eia-96' &&
                        'EIA-96 high-precision code'}
                    </p>
                  </div>

                  {onSave && (
                    <SavePresetDialog
                      onSave={(name) => onSave({ type: 'smd', smdCode }, name)}
                    />
                  )}
                </div>
              )}

              {smdResult?.error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{smdResult.error}</p>
                </div>
              )}

              {!smdResult && smdCode.trim() !== '' && (
                <div className="bg-muted/30 border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">
                    Invalid SMD code format. Try 103, 4702, 01A, or 68C.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="led">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">LED Configuration</CardTitle>
              <CardDescription className="font-mono text-xs">
                Calculate current-limiting resistor for LED
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Supply Voltage (Vs)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={vs}
                    onChange={(e) => setVs(e.target.value)}
                    placeholder="e.g., 12, 5"
                    className="font-mono bg-card border-input"
                    data-testid="input-vs"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-6">V</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  LED Forward Voltage (Vf)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={vf}
                    onChange={(e) => setVf(e.target.value)}
                    placeholder="e.g., 2.0, 3.2"
                    className="font-mono bg-card border-input"
                    data-testid="input-vf"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-6">V</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  LED Forward Current (If)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={ifMa}
                    onChange={(e) => setIfMa(e.target.value)}
                    placeholder="e.g., 20, 10"
                    className="font-mono bg-card border-input"
                    data-testid="input-if"
                  />
                  <span className="text-sm font-mono text-muted-foreground w-8">mA</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Number of LEDs (series)
                </Label>
                <Input
                  type="text"
                  value={numLeds}
                  onChange={(e) => setNumLeds(e.target.value)}
                  placeholder="1"
                  className="font-mono bg-card border-input"
                  data-testid="input-num-leds"
                />
              </div>

              {onSave && (
                <SavePresetDialog
                  onSave={(name) => onSave({ type: 'led', vs, vf, ifMa, numLeds }, name)}
                />
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {ledResult && !ledResult.warning && (
              <Card className="bg-card border-primary/30 glow-primary">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Required Resistor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                      Resistance
                    </p>
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-led-r">
                      {formatEngineering(ledResult.resistance, 'Ω')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                        Min Power Rating
                      </p>
                      <p className="text-lg font-bold font-mono text-accent" data-testid="text-led-rating">
                        {ledResult.recommendedRating >= 1
                          ? `${ledResult.recommendedRating}W`
                          : ledResult.recommendedRating === 0.5
                          ? '½W'
                          : ledResult.recommendedRating === 0.25
                          ? '¼W'
                          : `${ledResult.recommendedRating}W`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                        Power Dissipated
                      </p>
                      <p className="text-lg font-bold font-mono text-accent" data-testid="text-led-power">
                        {formatEngineering(ledResult.powerDissipated, 'W')}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                        Current
                      </p>
                      <p className="text-lg font-bold font-mono text-accent" data-testid="text-led-current">
                        {formatEngineering(ledResult.current, 'A')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {ledResult?.warning && (
              <Card className="bg-card border-destructive/30">
                <CardContent className="py-8">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-12 h-12 text-destructive flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-destructive mb-2">
                        Configuration Error
                      </p>
                      <p className="text-sm text-muted-foreground">{ledResult.warning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Circuit diagram */}
            {ledResult && !ledResult.warning && (
              <Card className="bg-card border-card-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Circuit Diagram</CardTitle>
                </CardHeader>
                <CardContent className="py-8">
                  <svg width="300" height="200" viewBox="0 0 300 200" className="mx-auto">
                    {/* Battery */}
                    <circle cx="40" cy="100" r="20" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                    <text x="40" y="105" textAnchor="middle" className="text-sm font-mono fill-primary font-semibold">
                      {vs}V
                    </text>
                    
                    {/* Positive wire */}
                    <line x1="60" y1="100" x2="100" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
                    
                    {/* Resistor */}
                    <rect
                      x="100"
                      y="90"
                      width="40"
                      height="20"
                      fill="none"
                      stroke="hsl(var(--foreground))"
                      strokeWidth="2"
                    />
                    <path
                      d="M 105 100 L 112 93 L 120 107 L 128 93 L 135 100"
                      stroke="hsl(var(--foreground))"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <text x="120" y="80" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">
                      R={formatEngineering(ledResult.resistance, 'Ω')}
                    </text>
                    
                    {/* Wire to LED */}
                    <line x1="140" y1="100" x2="170" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
                    
                    {/* LED symbol */}
                    <path
                      d="M 170 110 L 190 100 L 170 90 Z"
                      fill="none"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="2"
                    />
                    <line x1="190" y1="90" x2="190" y2="110" stroke="hsl(var(--secondary))" strokeWidth="2" />
                    
                    {/* LED arrows */}
                    <path
                      d="M 180 85 L 185 75 M 185 75 L 182 77 M 185 75 L 183 78"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M 188 85 L 193 75 M 193 75 L 190 77 M 193 75 L 191 78"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    
                    <text x="180" y="130" textAnchor="middle" className="text-xs font-mono fill-secondary font-semibold">
                      Vf={vf}V
                    </text>
                    
                    {/* Return wire */}
                    <line x1="190" y1="100" x2="230" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
                    <line x1="230" y1="100" x2="230" y2="140" stroke="hsl(var(--foreground))" strokeWidth="2" />
                    
                    {/* Ground */}
                    <line x1="220" y1="140" x2="240" y2="140" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
                    <line x1="223" y1="145" x2="237" y2="145" stroke="hsl(var(--foreground))" strokeWidth="2" />
                    <line x1="226" y1="150" x2="234" y2="150" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                    
                    {/* Return to battery */}
                    <line x1="230" y1="140" x2="40" y2="140" stroke="hsl(var(--foreground))" strokeWidth="2" />
                    <line x1="40" y1="140" x2="40" y2="120" stroke="hsl(var(--foreground))" strokeWidth="2" />
                    
                    {/* Current label */}
                    <text x="150" y="120" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">
                      I={ifMa}mA
                    </text>
                  </svg>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
