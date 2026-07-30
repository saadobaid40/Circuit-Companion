// Digital Logic: Quine-McCluskey minimization, K-Map helpers

export interface KMapColor {
  bg: string;
  border: string;
}

export const KMAP_COLORS: KMapColor[] = [
  { bg: 'rgba(0,212,255,0.18)',   border: '#00d4ff' },
  { bg: 'rgba(255,165,0,0.18)',   border: '#ffa500' },
  { bg: 'rgba(255,75,75,0.18)',   border: '#ff4b4b' },
  { bg: 'rgba(100,255,100,0.18)', border: '#64ff64' },
  { bg: 'rgba(200,100,255,0.18)', border: '#c864ff' },
  { bg: 'rgba(255,230,0,0.18)',   border: '#ffe600' },
];

export interface PrimeImplicantGroup {
  minterms: number[];
  bits: string;
  term: string;
  color: KMapColor;
}

export interface SopResult {
  expression: string;
  terms: string[];
  groups: PrimeImplicantGroup[];
}

interface Implicant {
  minterms: number[];
  bits: string; // chars: '0' | '1' | '-'
  used: boolean;
}

function toBits(n: number, len: number): string {
  return n.toString(2).padStart(len, '0');
}

function canCombine(a: string, b: string): boolean {
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '-' && b[i] === '-') continue;
    if (a[i] === '-' || b[i] === '-') return false;
    if (a[i] !== b[i]) diffs++;
  }
  return diffs === 1;
}

function combineImplicants(a: string, b: string): string {
  return a
    .split('')
    .map((bit, i) => (bit !== b[i] ? '-' : bit))
    .join('');
}

export function minimizeSOP(minterms: number[], numVars: number): SopResult {
  const varNames = ['A', 'B', 'C', 'D'].slice(0, numVars);
  const totalMinterms = 1 << numVars;

  if (minterms.length === 0) {
    return { expression: '0', terms: [], groups: [] };
  }
  if (minterms.length === totalMinterms) {
    return { expression: '1', terms: ['1'], groups: [] };
  }

  // Initialize
  let current: Implicant[] = minterms.map(m => ({
    minterms: [m],
    bits: toBits(m, numVars),
    used: false,
  }));

  const allPIs: Implicant[] = [];

  // Iteratively combine
  while (current.length > 0) {
    const next: Implicant[] = [];
    const seen = new Set<string>();
    current.forEach(imp => (imp.used = false));

    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        if (canCombine(current[i].bits, current[j].bits)) {
          const newBits = combineImplicants(current[i].bits, current[j].bits);
          current[i].used = true;
          current[j].used = true;
          if (!seen.has(newBits)) {
            seen.add(newBits);
            const combined = [
              ...new Set([...current[i].minterms, ...current[j].minterms]),
            ].sort((a, b) => a - b);
            next.push({ minterms: combined, bits: newBits, used: false });
          }
        }
      }
    }

    current.forEach(imp => { if (!imp.used) allPIs.push(imp); });
    current = next;
  }

  // Deduplicate prime implicants
  const uniquePIs = allPIs.filter(
    (pi, idx, arr) => arr.findIndex(p => p.bits === pi.bits) === idx
  );

  // Coverage table: minterm → list of PI indices
  const coverage = new Map<number, number[]>();
  minterms.forEach(m => coverage.set(m, []));
  uniquePIs.forEach((pi, idx) => {
    pi.minterms.forEach(m => { if (coverage.has(m)) coverage.get(m)!.push(idx); });
  });

  const selectedPI = new Set<number>();
  const coveredMinterms = new Set<number>();

  // Essential prime implicants first
  minterms.forEach(m => {
    const covering = coverage.get(m)!;
    if (covering.length === 1) selectedPI.add(covering[0]);
  });
  selectedPI.forEach(idx => uniquePIs[idx].minterms.forEach(m => coveredMinterms.add(m)));

  // Greedy cover remaining
  let uncovered = minterms.filter(m => !coveredMinterms.has(m));
  while (uncovered.length > 0) {
    let bestIdx = -1;
    let bestCount = 0;
    uniquePIs.forEach((pi, idx) => {
      if (!selectedPI.has(idx)) {
        const count = pi.minterms.filter(m => uncovered.includes(m)).length;
        if (count > bestCount) { bestCount = count; bestIdx = idx; }
      }
    });
    if (bestIdx < 0) break;
    selectedPI.add(bestIdx);
    uniquePIs[bestIdx].minterms.forEach(m => coveredMinterms.add(m));
    uncovered = minterms.filter(m => !coveredMinterms.has(m));
  }

  // Build output
  const terms: string[] = [];
  const groups: PrimeImplicantGroup[] = [];

  Array.from(selectedPI)
    .sort((a, b) => a - b)
    .forEach((idx, colorIdx) => {
      const pi = uniquePIs[idx];
      const literals = pi.bits
        .split('')
        .map((bit, i) => {
          if (bit === '-') return null;
          return bit === '1' ? varNames[i] : varNames[i] + "'";
        })
        .filter(Boolean) as string[];

      const term = literals.length > 0 ? literals.join('') : '1';
      terms.push(term);
      groups.push({
        minterms: pi.minterms,
        bits: pi.bits,
        term,
        color: KMAP_COLORS[colorIdx % KMAP_COLORS.length],
      });
    });

  return {
    expression: terms.length > 0 ? terms.join(' + ') : '0',
    terms,
    groups,
  };
}

// Gray-code ordering for K-Map columns/rows: 00→0, 01→1, 11→3, 10→2
const GRAY_ORDER = [0, 1, 3, 2];

/** Returns the minterm index for a given K-Map (row, col) position */
export function kMapCellMinterm(row: number, col: number, numVars: number): number {
  if (numVars === 2) return row * 2 + col;
  if (numVars === 3) return row * 4 + GRAY_ORDER[col];
  return GRAY_ORDER[row] * 4 + GRAY_ORDER[col];
}

export interface KMapDimensions {
  rows: number;
  cols: number;
  rowLabels: string[];
  colLabels: string[];
  rowVars: string;
  colVars: string;
}

export function getKMapDimensions(numVars: number): KMapDimensions {
  if (numVars === 2) {
    return {
      rows: 2, cols: 2,
      rowLabels: ['0', '1'],
      colLabels: ['0', '1'],
      rowVars: 'A', colVars: 'B',
    };
  }
  if (numVars === 3) {
    return {
      rows: 2, cols: 4,
      rowLabels: ['0', '1'],
      colLabels: ['00', '01', '11', '10'],
      rowVars: 'A', colVars: 'BC',
    };
  }
  return {
    rows: 4, cols: 4,
    rowLabels: ['00', '01', '11', '10'],
    colLabels: ['00', '01', '11', '10'],
    rowVars: 'AB', colVars: 'CD',
  };
}
