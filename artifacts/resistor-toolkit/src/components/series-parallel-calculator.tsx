import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SeriesCircuit, ParallelCircuit } from '@/components/circuit-diagram';
import { Plus, Trash2, Copy, Download, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  parseEngineering,
  formatEngineering,
  calculateSeriesResistance,
  calculateParallelResistance,
} from '@/lib/circuit-math';

interface Resistor {
  id: string;
  value: string;
}

export function SeriesParallelCalculator() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'series' | 'parallel'>('series');
  const [resistors, setResistors] = useState<Resistor[]>([
    { id: '1', value: '1k' },
    { id: '2', value: '2.2k' },
  ]);

  const addResistor = () => {
    const newId = String(Math.max(...resistors.map((r) => Number(r.id)), 0) + 1);
    setResistors([...resistors, { id: newId, value: '' }]);
  };

  const removeResistor = (id: string) => {
    if (resistors.length > 1) {
      setResistors(resistors.filter((r) => r.id !== id));
    }
  };

  const updateResistor = (id: string, value: string) => {
    setResistors(resistors.map((r) => (r.id === id ? { ...r, value } : r)));
  };

  const parsedValues = resistors
    .map((r) => parseEngineering(r.value))
    .filter((v): v is number => v !== null && v > 0);

  const allValid = parsedValues.length === resistors.length && parsedValues.every((v) => v > 0);

  const req =
    allValid && parsedValues.length > 0
      ? mode === 'series'
        ? calculateSeriesResistance(parsedValues)
        : calculateParallelResistance(parsedValues)
      : null;

  const handleCopyReq = () => {
    if (req !== null) {
      const formatted = formatEngineering(req, 'Ω');
      navigator.clipboard.writeText(formatted);
      toast({
        title: 'Copied',
        description: `${formatted} copied to clipboard`,
        duration: 2000,
      });
    }
  };

  const handleExportSummary = () => {
    if (req === null) return;

    const lines = [
      `${mode === 'series' ? 'SERIES' : 'PARALLEL'} RESISTOR CALCULATION`,
      '='.repeat(40),
      '',
      'Input Resistors:',
      ...resistors.map((r, i) => `  R${i + 1} = ${r.value}`),
      '',
      `Equivalent Resistance (Req):`,
      `  ${formatEngineering(req, 'Ω')}`,
      '',
      `Formula: ${mode === 'series' ? 'Req = R1 + R2 + R3 + ...' : '1/Req = 1/R1 + 1/R2 + 1/R3 + ...'}`,
    ];

    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    toast({
      title: 'Exported',
      description: 'Summary copied to clipboard',
      duration: 2000,
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Controls */}
      <div className="space-y-6">
        <Card className="bg-card border-card-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Configuration</CardTitle>
            <CardDescription className="font-mono text-xs">
              Select circuit type and add resistors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode selector */}
            <div className="space-y-2">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Circuit Type
              </Label>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(v) => v && setMode(v as 'series' | 'parallel')}
                className="justify-start"
              >
                <ToggleGroupItem
                  value="series"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-6"
                  data-testid="toggle-series"
                >
                  Series
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="parallel"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-6"
                  data-testid="toggle-parallel"
                >
                  Parallel
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Resistor inputs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Resistors
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addResistor}
                  className="h-7 text-xs"
                  data-testid="button-add-resistor"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {resistors.map((resistor, index) => {
                const parsed = parseEngineering(resistor.value);
                const isInvalid = resistor.value.trim() !== '' && (parsed === null || parsed <= 0);

                return (
                  <div key={resistor.id} className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground w-8">
                      R{index + 1}
                    </span>
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={resistor.value}
                        onChange={(e) => updateResistor(resistor.id, e.target.value)}
                        placeholder="e.g., 1k, 2.2M"
                        className={`font-mono bg-card border-input ${isInvalid ? 'border-destructive' : ''}`}
                        data-testid={`input-resistor-${index + 1}`}
                      />
                      {isInvalid && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Invalid value
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-mono text-muted-foreground w-6">Ω</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeResistor(resistor.id)}
                      disabled={resistors.length === 1}
                      className="h-9 w-9 p-0"
                      data-testid={`button-remove-${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {req !== null && (
          <Card className="bg-card border-primary/30 glow-primary">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Equivalent Resistance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-md p-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Req</p>
                    <p className="text-4xl font-bold font-mono text-primary" data-testid="text-req-value">
                      {formatEngineering(req, 'Ω')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyReq}
                    data-testid="button-copy-req"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSummary}
                  className="flex-1"
                  data-testid="button-export-summary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Summary
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-mono text-muted-foreground uppercase mb-2">Formula</p>
                <p className="text-sm font-mono text-foreground">
                  {mode === 'series'
                    ? 'Req = R1 + R2 + R3 + ...'
                    : '1/Req = 1/R1 + 1/R2 + 1/R3 + ...'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Visualization */}
      <Card className="bg-card border-card-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Circuit Diagram</CardTitle>
          <CardDescription className="font-mono text-xs">
            {mode === 'series' ? 'Resistors in series configuration' : 'Resistors in parallel configuration'}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          {mode === 'series' ? (
            <SeriesCircuit count={resistors.length} />
          ) : (
            <ParallelCircuit count={resistors.length} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
