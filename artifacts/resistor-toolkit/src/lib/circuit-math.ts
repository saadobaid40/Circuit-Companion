export function parseEngineering(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  
  let multiplier = 1;
  let valueStr = trimmed;

  // Handle unit suffixes
  if (trimmed.endsWith('g')) {
    multiplier = 1e9;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('m') && trimmed.length > 1) {
    // Could be milli or mega - check value magnitude
    const beforeM = trimmed.slice(0, -1);
    const parsed = parseFloat(beforeM);
    if (!isNaN(parsed) && parsed >= 1000) {
      multiplier = 1e6; // Mega
    } else {
      multiplier = 1e-3; // milli
    }
    valueStr = beforeM;
  } else if (trimmed.endsWith('k')) {
    multiplier = 1e3;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('u') || trimmed.endsWith('μ')) {
    multiplier = 1e-6;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('n')) {
    multiplier = 1e-9;
    valueStr = trimmed.slice(0, -1);
  }

  const value = parseFloat(valueStr);
  if (isNaN(value)) return null;

  return value * multiplier;
}

export function formatEngineering(value: number, unit: string): string {
  const absValue = Math.abs(value);
  
  if (absValue === 0) return `0${unit}`;
  
  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(3)}G${unit}`;
  } else if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(3)}M${unit}`;
  } else if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(3)}k${unit}`;
  } else if (absValue >= 1) {
    return `${value.toFixed(3)}${unit}`;
  } else if (absValue >= 1e-3) {
    return `${(value * 1e3).toFixed(3)}m${unit}`;
  } else if (absValue >= 1e-6) {
    return `${(value * 1e6).toFixed(3)}μ${unit}`;
  } else {
    return `${(value * 1e9).toFixed(3)}n${unit}`;
  }
}

export function calculateSeriesResistance(resistors: number[]): number {
  return resistors.reduce((sum, r) => sum + r, 0);
}

export function calculateParallelResistance(resistors: number[]): number | null {
  if (resistors.some(r => r <= 0)) return null;
  
  const reciprocalSum = resistors.reduce((sum, r) => sum + 1 / r, 0);
  return 1 / reciprocalSum;
}

export interface OhmsLawResult {
  V?: number;
  I?: number;
  R?: number;
  P?: number;
  formula: string;
}

export function solveOhmsLaw(
  V?: number | null,
  I?: number | null,
  R?: number | null,
  P?: number | null
): OhmsLawResult | null {
  const values = [V, I, R, P].filter(v => v !== null && v !== undefined);
  
  if (values.length !== 2) return null;

  let result: OhmsLawResult = { formula: '' };

  // V and I known
  if (V != null && I != null) {
    result.V = V;
    result.I = I;
    result.R = V / I;
    result.P = V * I;
    result.formula = 'R = V / I, P = V × I';
  }
  // V and R known
  else if (V != null && R != null) {
    result.V = V;
    result.R = R;
    result.I = V / R;
    result.P = (V * V) / R;
    result.formula = 'I = V / R, P = V² / R';
  }
  // V and P known
  else if (V != null && P != null) {
    result.V = V;
    result.P = P;
    result.I = P / V;
    result.R = (V * V) / P;
    result.formula = 'I = P / V, R = V² / P';
  }
  // I and R known
  else if (I != null && R != null) {
    result.I = I;
    result.R = R;
    result.V = I * R;
    result.P = I * I * R;
    result.formula = 'V = I × R, P = I² × R';
  }
  // I and P known
  else if (I != null && P != null) {
    result.I = I;
    result.P = P;
    result.V = P / I;
    result.R = P / (I * I);
    result.formula = 'V = P / I, R = P / I²';
  }
  // R and P known
  else if (R != null && P != null) {
    result.R = R;
    result.P = P;
    result.I = Math.sqrt(P / R);
    result.V = Math.sqrt(P * R);
    result.formula = 'I = √(P / R), V = √(P × R)';
  }
  else {
    return null;
  }

  return result;
}

export interface VoltageDividerResult {
  Vout: number;
  I: number;
  P1: number;
  P2: number;
  Ptotal: number;
}

export function calculateVoltageDivider(
  Vin: number,
  R1: number,
  R2: number
): VoltageDividerResult | null {
  if (Vin <= 0 || R1 <= 0 || R2 <= 0) return null;

  const Vout = (Vin * R2) / (R1 + R2);
  const I = Vin / (R1 + R2);
  const P1 = I * I * R1;
  const P2 = I * I * R2;
  const Ptotal = P1 + P2;

  return { Vout, I, P1, P2, Ptotal };
}
