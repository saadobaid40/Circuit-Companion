// Signals & Systems — Fourier Series, Pole-Zero root finding, Discrete Convolution

// ── Fourier Series Synthesis ──────────────────────────────────────────────────

export type WaveType = 'square' | 'sawtooth' | 'triangle';

export interface FourierPoint { t: number; y: number; }

function squareCoeff(k: number): number {
  return k % 2 === 1 ? 4 / (Math.PI * k) : 0;
}
function sawtoothCoeff(k: number): number {
  return (2 / (Math.PI * k)) * (k % 2 === 0 ? -1 : 1);
}
function triangleCoeff(k: number): number {
  // cosine series, odd harmonics only
  if (k % 2 === 0) return 0;
  const m = (k - 1) / 2;
  return (8 / (Math.PI ** 2 * k ** 2)) * (m % 2 === 0 ? 1 : -1);
}

export function generateFourier(
  waveType: WaveType,
  N: number,
  f0: number,
  numPoints = 600,
): FourierPoint[] {
  const T = 1 / f0;
  const points: FourierPoint[] = [];
  for (let i = 0; i < numPoints; i++) {
    const t = (i / (numPoints - 1)) * 2 * T;
    let y = 0;
    const kMax = waveType === 'sawtooth' ? N : Math.min(N % 2 === 0 ? N - 1 : N, N);
    for (let k = 1; k <= N; k++) {
      if (waveType === 'square') {
        y += squareCoeff(k) * Math.sin(2 * Math.PI * k * f0 * t);
      } else if (waveType === 'sawtooth') {
        y += sawtoothCoeff(k) * Math.sin(2 * Math.PI * k * f0 * t);
      } else {
        // triangle — cosine terms
        y += triangleCoeff(k) * Math.cos(2 * Math.PI * k * f0 * t);
      }
    }
    points.push({ t: parseFloat((t * 1000).toFixed(4)), y: parseFloat(y.toFixed(5)) });
  }
  return points;
}

// ── Complex Number ────────────────────────────────────────────────────────────

export interface Complex { re: number; im: number; }

function cmul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
function cdiv(a: Complex, b: Complex): Complex {
  const d = b.re ** 2 + b.im ** 2;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}
function cadd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}
function csub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

/** Evaluate polynomial at complex z using Horner's method.
 *  coeffsHighToLow[0] is the leading (highest-degree) coefficient. */
function polyEval(coeffs: number[], z: Complex): Complex {
  let r: Complex = { re: 0, im: 0 };
  for (const c of coeffs) {
    r = cadd(cmul(r, z), { re: c, im: 0 });
  }
  return r;
}

/** Durand-Kerner (Weierstrass) method — find all roots of a polynomial.
 *  coeffsHighToLow: [a_n, a_{n-1}, ..., a_0] with a_n ≠ 0. */
export function findRoots(coeffsHighToLow: number[]): Complex[] {
  const raw = coeffsHighToLow.map(Number).filter(isFinite);
  // Drop leading zeros
  let start = 0;
  while (start < raw.length - 1 && Math.abs(raw[start]) < 1e-15) start++;
  const coeffs = raw.slice(start);
  const n = coeffs.length - 1;
  if (n <= 0) return [];

  // Monic coefficients
  const lead = coeffs[0];
  const monic = coeffs.map(c => c / lead);

  // Estimate root radius from Cauchy bound
  const maxAbs = Math.max(...monic.slice(1).map(Math.abs));
  const r = 1 + maxAbs;

  // Initial guesses on a circle
  const roots: Complex[] = Array.from({ length: n }, (_, k) => ({
    re: r * Math.cos((2 * Math.PI * k) / n + Math.PI / (2 * n)),
    im: r * Math.sin((2 * Math.PI * k) / n + Math.PI / (2 * n)),
  }));

  for (let iter = 0; iter < 400; iter++) {
    for (let i = 0; i < n; i++) {
      const pVal = polyEval(monic, roots[i]);
      // denominator = product of (roots[i] - roots[j]) for j ≠ i
      let denom: Complex = { re: 1, im: 0 };
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        denom = cmul(denom, csub(roots[i], roots[j]));
      }
      const mag2 = denom.re ** 2 + denom.im ** 2;
      if (mag2 < 1e-30) continue;
      roots[i] = csub(roots[i], cdiv(pVal, denom));
    }
  }
  return roots;
}

/** Parse a space- or comma-separated string of polynomial coefficients. */
export function parseCoeffs(str: string): number[] {
  return str
    .trim()
    .split(/[\s,]+/)
    .map(s => parseFloat(s))
    .filter(n => !isNaN(n));
}

// ── Discrete Convolution ─────────────────────────────────────────────────────

export type SignalShape = 'rect' | 'triangle' | 'exp';

/** Generate a causal discrete signal of length `numSamples`. */
export function getSignalSamples(shape: SignalShape, numSamples = 50): number[] {
  const half = Math.floor(numSamples / 2);
  switch (shape) {
    case 'rect':
      return Array.from({ length: numSamples }, (_, k) => (k < half ? 1 : 0));
    case 'triangle':
      return Array.from({ length: numSamples }, (_, k) => {
        if (k >= half) return 0;
        return 1 - k / half;
      });
    case 'exp':
      return Array.from({ length: numSamples }, (_, k) =>
        k < half ? Math.exp(-k / (half / 4)) : 0,
      );
  }
}

/** Full discrete linear convolution: result length = f.length + g.length - 1. */
export function convolve(f: number[], g: number[]): number[] {
  const n = f.length + g.length - 1;
  const out = new Array<number>(n).fill(0);
  for (let i = 0; i < f.length; i++) {
    for (let j = 0; j < g.length; j++) {
      out[i + j] += f[i] * g[j];
    }
  }
  return out;
}
