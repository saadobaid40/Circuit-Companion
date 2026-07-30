// EE Matrix calculations — Inverse, Determinant, Eigenvalues, Ax = b solver

export type Matrix = number[][];
export type Vector = number[];

function copy(A: Matrix): Matrix { return A.map(r => [...r]); }

/** Matrix multiply */
export function matMul(A: Matrix, B: Matrix): Matrix {
  const n = A.length, m = B[0].length, p = B.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) =>
      Array.from({ length: p }, (_, k) => A[i][k] * B[k][j]).reduce((s, x) => s + x, 0)));
}

/** Gauss-Jordan inverse.  Returns inv and det, or null if singular. */
export function matInverse(A: Matrix): { inv: Matrix; det: number } | null {
  const n = A.length;
  const Aug = A.map((row, i) => {
    const id = new Array(n).fill(0); id[i] = 1;
    return [...row, ...id];
  });
  let det = 1;

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(Aug[r][col]) > Math.abs(Aug[maxRow][col])) maxRow = r;
    if (maxRow !== col) { [Aug[col], Aug[maxRow]] = [Aug[maxRow], Aug[col]]; det = -det; }
    const piv = Aug[col][col];
    if (Math.abs(piv) < 1e-12) return null;
    det *= piv;
    for (let j = 0; j < 2 * n; j++) Aug[col][j] /= piv;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = Aug[r][col];
      for (let j = 0; j < 2 * n; j++) Aug[r][j] -= f * Aug[col][j];
    }
  }
  return { inv: A.map((_, i) => Aug[i].slice(n)), det };
}

/** Gaussian elimination with partial pivoting — solve Ax = b. */
export function gaussSolve(A: Matrix, b: Vector): { x: Vector; det: number } | null {
  const n = A.length;
  const Aug = A.map((row, i) => [...row, b[i]]);
  let det = 1;

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(Aug[r][col]) > Math.abs(Aug[maxRow][col])) maxRow = r;
    if (maxRow !== col) { [Aug[col], Aug[maxRow]] = [Aug[maxRow], Aug[col]]; det = -det; }
    if (Math.abs(Aug[col][col]) < 1e-12) return null;
    det *= Aug[col][col];
    for (let r = col + 1; r < n; r++) {
      const f = Aug[r][col] / Aug[col][col];
      for (let j = col; j <= n; j++) Aug[r][j] -= f * Aug[col][j];
    }
  }
  const x: Vector = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = Aug[i][n];
    for (let j = i + 1; j < n; j++) x[i] -= Aug[i][j] * x[j];
    x[i] /= Aug[i][i];
  }
  return { x, det };
}

/** Determinant via Gaussian elimination. */
export function matDet(A: Matrix): number {
  const n = A.length;
  const M = copy(A);
  let det = 1;
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r;
    if (maxRow !== col) { [M[col], M[maxRow]] = [M[maxRow], M[col]]; det = -det; }
    if (Math.abs(M[col][col]) < 1e-12) return 0;
    det *= M[col][col];
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / M[col][col];
      for (let j = col; j < n; j++) M[r][j] -= f * M[col][j];
    }
  }
  return det;
}

/** QR decomposition (modified Gram-Schmidt column-wise). */
function qrDecompose(A: Matrix): { Q: Matrix; R: Matrix } {
  const n = A.length;
  const Q: Matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  const R: Matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  const orth: number[][] = [];

  for (let j = 0; j < n; j++) {
    let v = A.map(row => row[j]);
    for (let i = 0; i < j; i++) {
      const proj = orth[i].reduce((s, x, k) => s + x * A[k][j], 0);
      R[i][j] = proj;
      v = v.map((x, k) => x - proj * orth[i][k]);
    }
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    R[j][j] = norm;
    const qj = norm > 1e-14 ? v.map(x => x / norm) : v.map(() => 0);
    orth.push(qj);
    for (let k = 0; k < n; k++) Q[k][j] = qj[k];
  }
  return { Q, R };
}

/**
 * Eigenvalues via QR iteration (works well for real symmetric matrices).
 * For non-symmetric matrices the diagonal approximation is returned.
 */
export function matEigenvalues(A: Matrix): number[] {
  let Ak = copy(A);
  for (let iter = 0; iter < 800; iter++) {
    const { Q, R } = qrDecompose(Ak);
    Ak = matMul(R, Q);
    let off = 0;
    for (let i = 1; i < Ak.length; i++) off += Math.abs(Ak[i][i - 1]);
    if (off < 1e-12) break;
  }
  return Ak.map((row, i) => row[i]);
}

/** Parse a human-readable matrix string like "1 2; 3 4" or "1,2\n3,4". */
export function parseMatrix(src: string): Matrix | null {
  try {
    const rows = src.trim().split(/[;\n]+/).map(r =>
      r.trim().split(/[\s,]+/).map(Number));
    if (!rows.length || rows.some(r => r.some(isNaN))) return null;
    const n = rows[0].length;
    if (rows.some(r => r.length !== n)) return null;
    return rows;
  } catch { return null; }
}

/** Format a number for display (up to 6 significant digits). */
export function fmt(v: number): string {
  if (!isFinite(v)) return '—';
  if (Math.abs(v) < 1e-10) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e6 || (abs < 0.001 && abs > 0)) return v.toExponential(4);
  return parseFloat(v.toPrecision(6)).toString();
}
