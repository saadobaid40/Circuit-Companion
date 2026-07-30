import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Grid3x3, Table2, Sigma } from 'lucide-react';
import {
  minimizeSOP, kMapCellMinterm, getKMapDimensions,
  KMAP_COLORS, type PrimeImplicantGroup,
} from '@/lib/digital-logic';

type NumVars = 2 | 3 | 4;

const VAR_NAMES = ['A', 'B', 'C', 'D'];

// ── Truth Table ──────────────────────────────────────────────────────────────
function TruthTable({
  numVars,
  outputs,
  onToggle,
}: {
  numVars: NumVars;
  outputs: number[];
  onToggle: (idx: number) => void;
}) {
  const rows = 1 << numVars;
  const vars = VAR_NAMES.slice(0, numVars);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="px-2 py-2 text-center text-xs text-muted-foreground/60 w-10">#</th>
            {vars.map(v => (
              <th key={v} className="px-3 py-2 text-center text-xs font-bold text-muted-foreground tracking-wider">{v}</th>
            ))}
            <th className="px-3 py-2 text-center text-xs font-bold text-primary tracking-wider">Y</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => {
            const bits = i.toString(2).padStart(numVars, '0').split('');
            return (
              <tr key={i} className="border-b border-border/40 hover:bg-card/60 transition-colors">
                <td className="px-2 py-1.5 text-center text-xs text-muted-foreground/50">{i}</td>
                {bits.map((b, bi) => (
                  <td key={bi} className="px-3 py-1.5 text-center text-muted-foreground">{b}</td>
                ))}
                <td className="px-3 py-1.5 text-center">
                  <button
                    onClick={() => onToggle(i)}
                    className={`w-8 h-7 rounded font-bold text-sm transition-all ${
                      outputs[i] === 1
                        ? 'bg-primary text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                        : 'bg-muted/30 text-muted-foreground hover:bg-muted/60 border border-border'
                    }`}
                  >
                    {outputs[i]}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── K-Map ────────────────────────────────────────────────────────────────────
function KMap({
  numVars,
  outputs,
  groups,
}: {
  numVars: NumVars;
  outputs: number[];
  groups: PrimeImplicantGroup[];
}) {
  const dim = getKMapDimensions(numVars);

  // Build cell color map: minterm → color index(es)
  const cellColors = new Map<number, KMapColor[]>();
  groups.forEach(g => {
    g.minterms.forEach(m => {
      if (!cellColors.has(m)) cellColors.set(m, []);
      cellColors.get(m)!.push(g.color);
    });
  });

  type KMapColor = (typeof KMAP_COLORS)[0];

  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse text-center font-mono text-sm">
        <thead>
          <tr>
            {/* Corner label */}
            <th className="px-3 py-2">
              <div className="text-xs text-muted-foreground/60 leading-tight">
                <div className="text-primary font-bold">{dim.rowVars} ↓</div>
                <div className="text-accent">{dim.colVars} →</div>
              </div>
            </th>
            {dim.colLabels.map((cl, ci) => (
              <th key={ci} className="px-3 py-2 text-xs font-bold text-accent tracking-wider min-w-[3rem]">
                {cl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: dim.rows }, (_, row) => (
            <tr key={row}>
              <td className="px-3 py-2 text-xs font-bold text-primary tracking-wider">{dim.rowLabels[row]}</td>
              {Array.from({ length: dim.cols }, (_, col) => {
                const minterm = kMapCellMinterm(row, col, numVars);
                const val = outputs[minterm];
                const colors = cellColors.get(minterm) || [];
                const primaryColor = colors[0];

                return (
                  <td
                    key={col}
                    className="min-w-[3rem] h-12 text-center relative transition-all"
                    style={{
                      background: primaryColor ? primaryColor.bg : 'transparent',
                      border: primaryColor
                        ? `2px solid ${primaryColor.border}`
                        : '1px solid hsl(var(--border))',
                      boxShadow: primaryColor && val === 1
                        ? `inset 0 0 10px ${primaryColor.border}33`
                        : 'none',
                    }}
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-0.5">
                      <span
                        className={`text-base font-bold ${
                          val === 1 ? 'text-foreground' : 'text-muted-foreground/40'
                        }`}
                      >
                        {val}
                      </span>
                      <span className="text-[10px] text-muted-foreground/30 leading-none">m{minterm}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── SOP Expression Display ───────────────────────────────────────────────────
function SopDisplay({
  result,
}: {
  result: { expression: string; terms: string[]; groups: PrimeImplicantGroup[] };
}) {
  if (result.expression === '0' || result.expression === '1') {
    return (
      <div className="flex items-center justify-center p-6 rounded border border-border bg-card/30">
        <span className="text-3xl font-bold font-mono text-primary">{result.expression}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Full expression */}
      <div className="p-4 rounded border border-primary/30 bg-primary/5 text-center">
        <div className="text-xs font-mono text-muted-foreground tracking-wider mb-2">MINIMIZED SOP</div>
        <div className="text-lg font-bold font-mono text-primary break-all">
          Y = {result.expression}
        </div>
      </div>

      {/* Individual terms with colors */}
      <div className="flex flex-wrap gap-2 justify-center">
        {result.groups.map((g, i) => (
          <div
            key={i}
            className="px-3 py-1.5 rounded border font-mono text-sm font-bold"
            style={{
              background: g.color.bg,
              borderColor: g.color.border,
              color: g.color.border,
            }}
          >
            {g.term}
            <span className="text-[10px] opacity-60 ml-1.5">
              m({g.minterms.join(',')})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function DigitalLogicCalculator() {
  const [numVars, setNumVars] = useState<NumVars>(3);
  const [view, setView] = useState<'table' | 'kmap'>('table');
  const [outputs, setOutputs] = useState<Record<number, number[]>>({
    2: [0, 0, 0, 0],
    3: [0, 1, 1, 0, 1, 0, 0, 1],
    4: Array(16).fill(0),
  });

  const currentOutputs = outputs[numVars];

  const toggleOutput = (idx: number) => {
    setOutputs(prev => ({
      ...prev,
      [numVars]: prev[numVars].map((v, i) => (i === idx ? 1 - v : v)),
    }));
  };

  const minterms = useMemo(
    () => currentOutputs.map((v, i) => (v === 1 ? i : -1)).filter(i => i >= 0),
    [currentOutputs]
  );

  const sopResult = useMemo(() => minimizeSOP(minterms, numVars), [minterms, numVars]);

  const handleVarChange = (v: string) => {
    if (v) setNumVars(parseInt(v) as NumVars);
  };

  const handlePreset = (preset: 'zero' | 'one' | 'xor' | 'maj') => {
    const n = 1 << numVars;
    let arr: number[];
    if (preset === 'zero') {
      arr = Array(n).fill(0);
    } else if (preset === 'one') {
      arr = Array(n).fill(1);
    } else if (preset === 'xor' && numVars === 2) {
      arr = [0, 1, 1, 0];
    } else if (preset === 'xor' && numVars === 3) {
      // A XOR B XOR C
      arr = Array.from({ length: n }, (_, i) => {
        const bits = i.toString(2).padStart(numVars, '0').split('').map(Number);
        return bits.reduce((a, b) => a ^ b, 0);
      });
    } else if (preset === 'xor' && numVars === 4) {
      arr = Array.from({ length: n }, (_, i) => {
        const bits = i.toString(2).padStart(numVars, '0').split('').map(Number);
        return bits.reduce((a, b) => a ^ b, 0);
      });
    } else if (preset === 'maj') {
      // Majority function
      arr = Array.from({ length: n }, (_, i) => {
        const bits = i.toString(2).padStart(numVars, '0').split('').map(Number);
        const ones = bits.reduce((a, b) => a + b, 0);
        return ones > numVars / 2 ? 1 : 0;
      });
    } else {
      arr = Array(n).fill(0);
    }
    setOutputs(prev => ({ ...prev, [numVars]: arr }));
  };

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-bold tracking-tight">Digital Logic & K-Map Solver</CardTitle>
          </div>
          <CardDescription>Truth table → Karnaugh map → minimized boolean SOP expression</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-muted-foreground tracking-wider">VARIABLES</div>
              <ToggleGroup
                type="single"
                value={String(numVars)}
                onValueChange={handleVarChange}
                className="border border-border rounded overflow-hidden"
              >
                {[2, 3, 4].map(n => (
                  <ToggleGroupItem
                    key={n}
                    value={String(n)}
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground font-bold px-4 py-2"
                  >
                    {n}-Var
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-mono text-muted-foreground tracking-wider">PRESETS</div>
              <div className="flex gap-1.5">
                {(['zero', 'one', 'xor', 'maj'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePreset(p)}
                    className="px-3 py-1.5 text-xs font-mono font-semibold rounded border border-border bg-card hover:bg-muted/40 hover:text-foreground text-muted-foreground transition-colors"
                  >
                    {p === 'zero' ? 'Clear' : p === 'one' ? 'All 1s' : p === 'xor' ? 'XOR' : 'Majority'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Minterm summary */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">Minterms:</span>
            {minterms.length === 0 ? (
              <span className="text-xs font-mono text-muted-foreground/50">none</span>
            ) : (
              minterms.map(m => (
                <Badge key={m} variant="outline" className="text-xs font-mono px-2 py-0 text-accent border-accent/30 bg-accent/5">
                  m{m}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Truth Table + K-Map toggle */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
                {view === 'table' ? <Table2 className="w-4 h-4 text-primary" /> : <Grid3x3 className="w-4 h-4 text-primary" />}
                {view === 'table' ? 'Truth Table' : 'Karnaugh Map'}
              </CardTitle>
              <div className="flex gap-1 p-0.5 bg-muted/30 border border-border rounded">
                <button
                  onClick={() => setView('table')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Table2 className="w-3 h-3" /> Table
                </button>
                <button
                  onClick={() => setView('kmap')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    view === 'kmap' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid3x3 className="w-3 h-3" /> K-Map
                </button>
              </div>
            </div>
            {view === 'table' && (
              <CardDescription className="text-xs">Click Y cells to toggle 0 ↔ 1</CardDescription>
            )}
            {view === 'kmap' && (
              <CardDescription className="text-xs">Colored cells show prime implicant groups</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {view === 'table' ? (
              <TruthTable numVars={numVars} outputs={currentOutputs} onToggle={toggleOutput} />
            ) : (
              <KMap numVars={numVars} outputs={currentOutputs} groups={sopResult.groups} />
            )}
          </CardContent>
        </Card>

        {/* Right: SOP result + legend */}
        <div className="space-y-5">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
                <Sigma className="w-4 h-4 text-primary" />
                Minimized Boolean Expression
              </CardTitle>
              <CardDescription className="text-xs">Quine-McCluskey algorithm · Sum of Products (SOP)</CardDescription>
            </CardHeader>
            <CardContent>
              <SopDisplay result={sopResult} />
            </CardContent>
          </Card>

          {/* Group Legend */}
          {sopResult.groups.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold tracking-tight text-muted-foreground">Prime Implicant Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sopResult.groups.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded border"
                      style={{ borderColor: g.color.border, background: g.color.bg }}
                    >
                      <div className="font-mono font-bold text-sm" style={{ color: g.color.border }}>
                        {g.term}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        covers {g.minterms.length} cell{g.minterms.length > 1 ? 's' : ''}: m({g.minterms.join(', ')})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variable reference */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight text-muted-foreground">Notation</CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-mono space-y-1.5 text-muted-foreground">
              <div>A, B, C, D — input variables (MSB → LSB)</div>
              <div>A' — complement of A (NOT A)</div>
              <div>AB — logical AND (A · B)</div>
              <div>A + B — logical OR (SUM)</div>
              <div>mN — minterm N (row where Y = 1)</div>
              <div className="pt-2 border-t border-border text-muted-foreground/60">
                Groups must be powers of 2 (1, 2, 4, 8, 16 cells)
                and form rectangles in Gray-code order.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
