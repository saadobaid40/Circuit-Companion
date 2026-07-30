import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ResistorSVG } from '@/components/resistor-svg';
import { SavePresetDialog } from '@/components/save-preset-dialog';
import { Copy, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ResistorColor,
  digitColors,
  multiplierColors,
  toleranceColors,
  tempCoColors,
  calculateResistance,
  formatResistance,
  parseResistance,
  resistanceToColorBands,
  colorDatabase,
} from '@/lib/resistor-color-code';

interface ColorCodeCalculatorProps {
  onSave?: (data: Record<string, unknown>, name: string) => void;
}

export function ColorCodeCalculator({ onSave }: ColorCodeCalculatorProps = {}) {
  const { toast } = useToast();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [bandCount, setBandCount] = useState<4 | 5 | 6>(4);

  // Encode mode state
  const [band1, setBand1] = useState<ResistorColor>('Yellow');
  const [band2, setBand2] = useState<ResistorColor>('Violet');
  const [band3, setBand3] = useState<ResistorColor>('Black');
  const [multiplier, setMultiplier] = useState<ResistorColor>('Red');
  const [tolerance, setTolerance] = useState<ResistorColor>('Gold');
  const [tempCo, setTempCo] = useState<ResistorColor>('Brown');

  // Decode mode state
  const [inputValue, setInputValue] = useState('4.7k');
  const [decodeError, setDecodeError] = useState('');

  const result = mode === 'encode'
    ? calculateResistance(
        band1,
        band2,
        multiplier,
        tolerance,
        bandCount >= 5 ? band3 : undefined,
        bandCount === 6 ? tempCo : undefined
      )
    : null;

  const parsedOhms = mode === 'decode' ? parseResistance(inputValue) : null;
  const decodeBands4 = parsedOhms !== null ? resistanceToColorBands(parsedOhms, 4) : null;
  const decodeBands5 = parsedOhms !== null ? resistanceToColorBands(parsedOhms, 5) : null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${text} copied to clipboard`,
      duration: 2000,
    });
  };

  const ColorSelector = ({
    label,
    value,
    onChange,
    colors,
    testId,
  }: {
    label: string;
    value: ResistorColor;
    onChange: (v: ResistorColor) => void;
    colors: ResistorColor[];
    testId: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as ResistorColor)}>
        <SelectTrigger className="bg-card border-input" data-testid={testId}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {colors.map((color) => (
            <SelectItem key={color} value={color}>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: colorDatabase[color].hex }}
                />
                <span>{color}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'encode' | 'decode')}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-card border border-border">
          <TabsTrigger 
            value="encode" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-testid="tab-encode"
          >
            Encode
          </TabsTrigger>
          <TabsTrigger 
            value="decode" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            data-testid="tab-decode"
          >
            Decode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Controls */}
            <Card className="bg-card border-card-border">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Band Configuration</CardTitle>
                <CardDescription className="font-mono text-xs">
                  Select resistor type and color bands
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Band count selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Band Count
                  </Label>
                  <ToggleGroup
                    type="single"
                    value={String(bandCount)}
                    onValueChange={(v) => v && setBandCount(Number(v) as 4 | 5 | 6)}
                    className="justify-start"
                  >
                    <ToggleGroupItem 
                      value="4" 
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      data-testid="toggle-4-band"
                    >
                      4-Band
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="5" 
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      data-testid="toggle-5-band"
                    >
                      5-Band
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="6" 
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      data-testid="toggle-6-band"
                    >
                      6-Band
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Color band selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <ColorSelector
                    label="Band 1"
                    value={band1}
                    onChange={setBand1}
                    colors={digitColors}
                    testId="select-band-1"
                  />
                  <ColorSelector
                    label="Band 2"
                    value={band2}
                    onChange={setBand2}
                    colors={digitColors}
                    testId="select-band-2"
                  />
                  {bandCount >= 5 && (
                    <ColorSelector
                      label="Band 3"
                      value={band3}
                      onChange={setBand3}
                      colors={digitColors}
                      testId="select-band-3"
                    />
                  )}
                  <ColorSelector
                    label="Multiplier"
                    value={multiplier}
                    onChange={setMultiplier}
                    colors={multiplierColors}
                    testId="select-multiplier"
                  />
                  <ColorSelector
                    label="Tolerance"
                    value={tolerance}
                    onChange={setTolerance}
                    colors={toleranceColors}
                    testId="select-tolerance"
                  />
                  {bandCount === 6 && (
                    <ColorSelector
                      label="Temp Co"
                      value={tempCo}
                      onChange={setTempCo}
                      colors={tempCoColors}
                      testId="select-temp-co"
                    />
                  )}
                </div>

                {onSave && (
                  <SavePresetDialog
                    onSave={(name) => onSave({ mode, bandCount, band1, band2, band3, multiplier, tolerance, tempCo }, name)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Visualization and Results */}
            <div className="space-y-6">
              {/* Resistor SVG */}
              <Card className="bg-card border-card-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Resistor Visualization</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                  <ResistorSVG
                    bands={
                      bandCount === 4
                        ? [band1, band2, multiplier, tolerance]
                        : bandCount === 5
                        ? [band1, band2, band3, multiplier, tolerance]
                        : [band1, band2, band3, multiplier, tolerance, tempCo]
                    }
                    bandCount={bandCount}
                    className="w-full max-w-md"
                  />
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
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                            Resistance
                          </p>
                          <p className="text-3xl font-bold font-mono text-primary" data-testid="text-resistance-value">
                            {result.formattedResistance}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(result.formattedResistance)}
                          data-testid="button-copy-resistance"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {result.tolerance !== undefined && (
                        <div>
                          <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                            Tolerance
                          </p>
                          <p className="text-lg font-bold font-mono text-accent" data-testid="text-tolerance">
                            ±{result.tolerance}%
                          </p>
                        </div>
                      )}
                      {result.tempCo !== undefined && (
                        <div>
                          <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                            Temp Coeff
                          </p>
                          <p className="text-lg font-bold font-mono text-accent" data-testid="text-temp-co">
                            {result.tempCo} ppm/K
                          </p>
                        </div>
                      )}
                    </div>

                    {result.minResistance !== undefined && result.maxResistance !== undefined && (
                      <div className="border-t border-border pt-4">
                        <p className="text-xs font-mono text-muted-foreground uppercase mb-2">
                          Value Range
                        </p>
                        <p className="text-sm font-mono text-foreground" data-testid="text-resistance-range">
                          {formatResistance(result.minResistance)} –{' '}
                          {formatResistance(result.maxResistance)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="decode" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card className="bg-card border-card-border">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Resistance Value</CardTitle>
                <CardDescription className="font-mono text-xs">
                  Enter resistance value (e.g., 4.7k, 1M, 220)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Resistance
                  </Label>
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setDecodeError('');
                    }}
                    onBlur={() => {
                      if (parseResistance(inputValue) === null && inputValue.trim() !== '') {
                        setDecodeError('Invalid resistance format');
                      }
                    }}
                    placeholder="e.g., 4.7k, 1M, 220"
                    className="font-mono text-lg bg-card border-input"
                    data-testid="input-resistance-decode"
                  />
                  {decodeError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {decodeError}
                    </p>
                  )}
                </div>

                {parsedOhms !== null && (
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-1">
                      Parsed Value
                    </p>
                    <p className="text-2xl font-bold font-mono text-primary" data-testid="text-parsed-value">
                      {formatResistance(parsedOhms)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {parsedOhms !== null && decodeBands4 && (
                <>
                  <Card className="bg-card border-card-border">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">4-Band Representation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ResistorSVG
                        bands={[
                          decodeBands4.band1,
                          decodeBands4.band2,
                          decodeBands4.multiplier,
                          decodeBands4.tolerance,
                        ]}
                        bandCount={4}
                        className="w-full max-w-md mx-auto"
                      />
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          decodeBands4.band1,
                          decodeBands4.band2,
                          decodeBands4.multiplier,
                          decodeBands4.tolerance,
                        ].map((color, i) => (
                          <div key={i} className="space-y-1">
                            <div
                              className="w-full h-8 rounded border border-border mx-auto"
                              style={{ backgroundColor: colorDatabase[color].hex }}
                            />
                            <p className="text-xs font-mono text-muted-foreground">{color}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {decodeBands5 && (
                    <Card className="bg-card border-card-border">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold">5-Band Representation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ResistorSVG
                          bands={[
                            decodeBands5.band1,
                            decodeBands5.band2,
                            decodeBands5.band3!,
                            decodeBands5.multiplier,
                            decodeBands5.tolerance,
                          ]}
                          bandCount={5}
                          className="w-full max-w-md mx-auto"
                        />
                        <div className="grid grid-cols-5 gap-2 text-center">
                          {[
                            decodeBands5.band1,
                            decodeBands5.band2,
                            decodeBands5.band3!,
                            decodeBands5.multiplier,
                            decodeBands5.tolerance,
                          ].map((color, i) => (
                            <div key={i} className="space-y-1">
                              <div
                                className="w-full h-8 rounded border border-border mx-auto"
                                style={{ backgroundColor: colorDatabase[color].hex }}
                              />
                              <p className="text-xs font-mono text-muted-foreground">{color}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {parsedOhms === null && inputValue.trim() !== '' && (
                <Card className="bg-card border-destructive/30">
                  <CardContent className="py-8 text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Unable to parse resistance value. Try formats like 4.7k, 1M, or 220.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
