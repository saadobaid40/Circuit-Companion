import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { calculateADC, calculateUARTTable, bestUARTRow, COMMON_BAUDS, ADC_BIT_OPTIONS } from '@/lib/micro-math';
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

function NumInput({ label, value, onChange, unit, min, step = 'any' }:
  { label: string; value: string; onChange: (v: string) => void; unit?: string; min?: string; step?: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <div className="flex items-center gap-2">
        <Input type="number" step={step} min={min} value={value}
          onChange={e => onChange(e.target.value)}
          className="font-mono bg-background border-border" />
        {unit && <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">{unit}</span>}
      </div>
    </div>
  );
}

// ── ADC / DAC Resolution Calculator ──────────────────────────────────────────

export function ADCDACCalculator() {
  const [bits, setBits] = useState(12);
  const [Vref, setVref] = useState('3.3');
  const [Vin, setVin] = useState('1.65');
  const [mode, setMode] = useState<'adc' | 'dac'>('adc');

  const result = useMemo(() => {
    const vref = parseFloat(Vref);
    const vin = parseFloat(Vin);
    if (isNaN(vref) || vref <= 0) return null;
    return calculateADC(bits, vref, isNaN(vin) ? undefined : vin);
  }, [bits, Vref, Vin]);

  const binFormatted = result?.codeBin
    ? result.codeBin.match(/.{1,4}/g)?.join(' ') ?? result.codeBin
    : null;

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">ADC / DAC Configuration</CardTitle>
          <CardDescription>Compute resolution, step size, and quantization error</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode toggle */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Converter Type</Label>
            <div className="flex gap-2">
              {(['adc', 'dac'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-4 py-1.5 rounded-md text-sm font-mono font-medium transition-colors border ${
                    mode === m
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
                  }`}>
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bit resolution */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Bit Resolution</Label>
            <div className="flex gap-2 flex-wrap">
              {ADC_BIT_OPTIONS.map(b => (
                <button key={b} onClick={() => setBits(b)}
                  className={`px-3 py-1.5 rounded-md text-sm font-mono font-medium transition-colors border ${
                    bits === b
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
                  }`}>
                  {b}-bit
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumInput label="Vref — Reference Voltage" value={Vref} onChange={setVref} unit="V" min="0" />
            <NumInput
              label={mode === 'adc' ? 'Vin — Analog Input (0 to Vref)' : 'Digital Code (0 to 2ⁿ−1)'}
              value={Vin} onChange={setVin}
              unit={mode === 'adc' ? 'V' : '(int)'} min="0"
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Resolution metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Resolution', value: `${bits}-bit`, color: 'text-primary' },
              { label: 'Total Levels  2ⁿ', value: result.levels.toLocaleString(), color: 'text-foreground' },
              { label: 'LSB Step Size', value: formatEngineering(result.LSB, 'V'), color: 'text-emerald-400' },
              { label: 'Ideal SNR', value: `${result.SNR_dB.toFixed(1)} dB`, color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="bg-muted/30 border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`font-mono font-bold text-base ${color}`}>{value}</p>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {mode === 'adc' ? 'ADC Conversion' : 'DAC Output'} Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResultRow label="Quantization Error  ±½ LSB" value={`±${formatEngineering(result.quantErrorPM, 'V')}`} />
              {result.digitalCode !== undefined && (
                <>
                  <ResultRow
                    label={mode === 'adc' ? 'Digital Output Code (decimal)' : 'Input Code'}
                    value={result.digitalCode.toString()}
                  />
                  {result.codeHex && (
                    <ResultRow label="Hex Code" value={<span className="text-primary">0x{result.codeHex}</span>} />
                  )}
                  {binFormatted && (
                    <ResultRow label="Binary Code" value={<span className="text-xs tracking-widest">{binFormatted}</span>} />
                  )}
                  {result.quantizedVoltage !== undefined && (
                    <ResultRow
                      label={mode === 'adc' ? 'Quantized Voltage (reconstructed)' : 'DAC Output Voltage'}
                      value={`${result.quantizedVoltage.toFixed(6)} V`}
                    />
                  )}
                  {result.quantErrorActual !== undefined && (
                    <ResultRow
                      label="Actual Quantization Error"
                      value={
                        <span className={Math.abs(result.quantErrorActual) > result.quantErrorPM * 1.001 ? 'text-red-400' : 'text-emerald-400'}>
                          {(result.quantErrorActual * 1000).toFixed(4)} mV
                        </span>
                      }
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card className="bg-muted/20 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Formula Reference</CardTitle>
        </CardHeader>
        <CardContent className="text-xs font-mono text-muted-foreground space-y-1">
          <p>Levels = 2ⁿ</p>
          <p>LSB = Vref / 2ⁿ  (voltage per step)</p>
          <p>Digital Code = floor(Vin / LSB),  clamped to [0, 2ⁿ−1]</p>
          <p>Quantization Error = ±½ LSB  (max)</p>
          <p>SNR (ideal) = 6.02·n + 1.76 dB</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── UART Baud Rate & Timer Reload ─────────────────────────────────────────────

export function UARTCalculator() {
  const [clock, setClock] = useState('72');           // MHz
  const [baud, setBaud] = useState('115200');

  const { rows, best } = useMemo(() => {
    const clockHz = parseFloat(clock) * 1e6;
    const bd = parseFloat(baud);
    if (isNaN(clockHz) || isNaN(bd) || clockHz <= 0 || bd <= 0) return { rows: [], best: null };
    const rows = calculateUARTTable(clockHz, bd);
    return { rows, best: bestUARTRow(rows) };
  }, [clock, baud]);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">UART / Timer Configuration</CardTitle>
          <CardDescription>Calculates Timer Load Register (TLR) values and baud rate error for each prescaler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <NumInput label="System Clock" value={clock} onChange={setClock} unit="MHz" min="0" />
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Desired Baud Rate</Label>
              <div className="flex gap-2">
                <Input type="number" value={baud} onChange={e => setBaud(e.target.value)}
                  className="font-mono bg-background border-border flex-1" />
                <select
                  value={baud}
                  onChange={e => setBaud(e.target.value)}
                  className="bg-background border border-border rounded px-2 text-xs font-mono text-foreground"
                >
                  {COMMON_BAUDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {best && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Best Prescaler', value: `÷${best.prescaler}`, color: 'text-primary' },
            { label: 'Timer Reload (TLR)', value: best.TLR.toString(), color: 'text-emerald-400' },
            { label: 'Baud Rate Error', value: `${best.errorPct >= 0 ? '+' : ''}${best.errorPct.toFixed(3)}%`, color: Math.abs(best.errorPct) < 2 ? 'text-emerald-400' : 'text-red-400' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="bg-muted/30 border-border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`font-mono font-bold text-lg ${color}`}>{value}</p>
            </Card>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Prescaler vs. TLR Table</CardTitle>
            <CardDescription className="text-xs font-mono">
              TLR = f_clk / (prescaler × baud_rate) − 1  (rounded)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {['Prescaler', 'TLR', 'Actual Baud', 'Error %', ''].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const isBest = best?.prescaler === r.prescaler;
                    const errAbs = Math.abs(r.errorPct);
                    const errColor = !r.valid ? 'text-muted-foreground/40'
                      : errAbs < 0.5 ? 'text-emerald-400'
                      : errAbs < 2 ? 'text-amber-400'
                      : 'text-red-400';
                    return (
                      <tr key={r.prescaler}
                        className={`border-b border-border/50 transition-colors ${isBest ? 'bg-primary/8' : 'hover:bg-muted/20'} ${!r.valid ? 'opacity-40' : ''}`}>
                        <td className="px-4 py-2">{r.valid ? `÷${r.prescaler}` : `÷${r.prescaler}`}</td>
                        <td className="px-4 py-2">{r.valid ? r.TLR : '—'}</td>
                        <td className="px-4 py-2">{r.valid ? Math.round(r.actualBaud).toLocaleString() : '—'}</td>
                        <td className={`px-4 py-2 ${errColor}`}>
                          {r.valid ? `${r.errorPct >= 0 ? '+' : ''}${r.errorPct.toFixed(3)}%` : 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {isBest && <span className="text-primary text-[10px] px-1.5 py-0.5 bg-primary/10 rounded border border-primary/30">Best</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/20 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Formula Reference</CardTitle>
        </CardHeader>
        <CardContent className="text-xs font-mono text-muted-foreground space-y-1">
          <p>TLR = round(f_clk / (Prescaler × Baud)) − 1</p>
          <p>Actual Baud = f_clk / (Prescaler × (TLR + 1))</p>
          <p>Error% = (Actual − Desired) / Desired × 100</p>
          <p>Accepted tolerance: |Error| &lt; 2–5%</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Bitwise Register Mask Visualizer ─────────────────────────────────────────

type BitWidth = 8 | 16 | 32;
type RegOp = 'set' | 'clear' | 'toggle' | 'mask';

const OP_INFO: { id: RegOp; label: string; symbol: string; color: string }[] = [
  { id: 'set',    label: 'SET',    symbol: '|=',  color: 'text-emerald-400' },
  { id: 'clear',  label: 'CLEAR',  symbol: '&=~', color: 'text-red-400' },
  { id: 'toggle', label: 'TOGGLE', symbol: '^=',  color: 'text-amber-400' },
  { id: 'mask',   label: 'MASK',   symbol: '&=',  color: 'text-violet-400' },
];

function applyOp(value: number, mask: number, op: RegOp, width: BitWidth): number {
  const maxVal = width === 32 ? 0xFFFFFFFF : (1 << width) - 1;
  let result: number;
  switch (op) {
    case 'set':    result = (value | mask);           break;
    case 'clear':  result = (value & (~mask));        break;
    case 'toggle': result = (value ^ mask);           break;
    case 'mask':   result = (value & mask);           break;
  }
  // Ensure unsigned within width (handle JS signed 32-bit)
  return ((result) >>> 0) & maxVal;
}

function toBinGrouped(value: number, width: BitWidth): string {
  const bin = (value >>> 0).toString(2).padStart(width, '0');
  return bin.match(/.{1,4}/g)?.join(' ') ?? bin;
}

function toHexStr(value: number, width: BitWidth): string {
  return '0x' + (value >>> 0).toString(16).toUpperCase().padStart(width / 4, '0');
}

export function RegisterVisualizer() {
  const [width, setWidth] = useState<BitWidth>(16);
  const [value, setValue] = useState(0);
  const [maskInput, setMaskInput] = useState('0x00FF');
  const [activeOp, setActiveOp] = useState<RegOp>('set');

  const parsedMask = useMemo(() => {
    const s = maskInput.trim();
    const n = s.startsWith('0x') || s.startsWith('0X') ? parseInt(s, 16) : parseInt(s, 10);
    return isNaN(n) ? 0 : ((n >>> 0) & ((width === 32 ? 0xFFFFFFFF : (1 << width) - 1)));
  }, [maskInput, width]);

  const applyOperation = () => {
    setValue(applyOp(value, parsedMask, activeOp, width));
  };

  const toggleBit = (bitIdx: number) => {
    const mask = bitIdx < 31 ? (1 << bitIdx) : 0x80000000;
    setValue(v => ((v ^ mask) >>> 0) & (width === 32 ? 0xFFFFFFFF : (1 << width) - 1));
  };

  const resetValue = () => setValue(0);
  const setAll = () => setValue(width === 32 ? 0xFFFFFFFF : (1 << width) - 1);

  // Build bit groups (from MSB to LSB in display)
  const byteCount = width / 8;
  const bytes: { byteIdx: number; bits: number[] }[] = Array.from({ length: byteCount }, (_, b) => ({
    byteIdx: byteCount - 1 - b,          // MSB byte first in display
    bits: Array.from({ length: 8 }, (_, bit) => {
      const bitPos = (byteCount - 1 - b) * 8 + (7 - bit); // MSB of byte first
      return bitPos;
    }),
  }));

  const isBitSet = (pos: number) => ((value >>> pos) & 1) === 1;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Register Configuration</CardTitle>
          <CardDescription>Click individual bits to toggle, or apply mask operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Width selector */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Register Width</Label>
            <div className="flex gap-2">
              {([8, 16, 32] as BitWidth[]).map(w => (
                <button key={w} onClick={() => { setWidth(w); setValue(0); }}
                  className={`px-4 py-1.5 rounded-md text-sm font-mono font-medium transition-colors border ${
                    width === w
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
                  }`}>
                  {w}-bit
                </button>
              ))}
            </div>
          </div>

          {/* Bit grid */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Bit Grid (MSB → LSB, click to toggle)</Label>
            <div className={`flex gap-2 flex-wrap ${width === 32 ? 'gap-y-3' : ''}`}>
              {bytes.map(({ byteIdx, bits }) => (
                <div key={byteIdx} className="space-y-1">
                  <div className="flex gap-0.5">
                    {bits.map(pos => (
                      <button
                        key={pos}
                        onClick={() => toggleBit(pos)}
                        className={`w-8 h-8 text-xs font-mono font-bold rounded border transition-all ${
                          isBitSet(pos)
                            ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_4px_rgba(0,212,255,0.2)]'
                            : 'bg-muted/20 text-muted-foreground/50 border-border hover:border-primary/30 hover:text-muted-foreground'
                        }`}
                      >
                        {isBitSet(pos) ? '1' : '0'}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    {bits.map(pos => (
                      <div key={pos} className="w-8 text-center text-[9px] font-mono text-muted-foreground/40">{pos}</div>
                    ))}
                  </div>
                  <div className="text-center text-[9px] font-mono text-muted-foreground/30">B{byteIdx}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={resetValue} className="px-2 py-1 text-xs font-mono rounded border border-border bg-muted/20 text-muted-foreground hover:text-foreground transition-colors">CLR All</button>
              <button onClick={setAll} className="px-2 py-1 text-xs font-mono rounded border border-border bg-muted/20 text-muted-foreground hover:text-foreground transition-colors">SET All</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output display */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Hexadecimal', value: toHexStr(value, width), color: 'text-primary' },
          { label: 'Decimal', value: (value >>> 0).toString(), color: 'text-foreground' },
          { label: 'Octal', value: '0o' + (value >>> 0).toString(8), color: 'text-muted-foreground' },
        ].map(({ label, value: v, color }) => (
          <Card key={label} className="bg-muted/30 border-border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`font-mono font-bold text-base break-all ${color}`}>{v}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border p-4">
        <p className="text-xs text-muted-foreground mb-1 font-mono">Binary</p>
        <p className="font-mono text-sm text-foreground tracking-widest break-all">{toBinGrouped(value, width)}</p>
      </Card>

      {/* Mask operations */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Mask Operations</CardTitle>
          <CardDescription>Apply bitwise operations using a hex or decimal mask</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Mask Value (hex or decimal)</Label>
              <Input value={maskInput} onChange={e => setMaskInput(e.target.value)}
                className="font-mono bg-background border-border" placeholder="0x00FF" />
              <p className="text-xs font-mono text-muted-foreground mt-1">
                = {toHexStr(parsedMask, width)}  ({toBinGrouped(parsedMask, width)})
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Operation</Label>
              <div className="flex gap-2 flex-wrap">
                {OP_INFO.map(op => (
                  <button key={op.id} onClick={() => setActiveOp(op.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors border ${
                      activeOp === op.id
                        ? `bg-primary/20 text-primary border-primary/50`
                        : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
                    }`}>
                    {op.label} ({op.symbol})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={applyOperation}
              className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-md text-sm font-mono font-semibold hover:bg-primary/30 transition-colors"
            >
              Apply {OP_INFO.find(o => o.id === activeOp)?.label}
            </button>
            <span className="text-xs font-mono text-muted-foreground">
              REG {OP_INFO.find(o => o.id === activeOp)?.symbol} {toHexStr(parsedMask, width)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
