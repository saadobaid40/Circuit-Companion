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

// Op-Amp calculations
export interface OpAmpResult {
  gain: number;
  vout: number;
  voutClamped: number;
  saturated: boolean;
  saturatedHigh: boolean;
  saturatedLow: boolean;
}

export function calculateInvertingOpAmp(
  vin: number,
  r1: number,
  rf: number,
  vcc: number,
  vee: number
): OpAmpResult {
  const gain = -(rf / r1);
  const vout = gain * vin;
  const saturatedHigh = vout > vcc;
  const saturatedLow = vout < vee;
  const saturated = saturatedHigh || saturatedLow;
  const voutClamped = saturatedHigh ? vcc : saturatedLow ? vee : vout;

  return { gain, vout, voutClamped, saturated, saturatedHigh, saturatedLow };
}

export function calculateNonInvertingOpAmp(
  vin: number,
  r1: number,
  rf: number,
  vcc: number,
  vee: number
): OpAmpResult {
  const gain = 1 + rf / r1;
  const vout = gain * vin;
  const saturatedHigh = vout > vcc;
  const saturatedLow = vout < vee;
  const saturated = saturatedHigh || saturatedLow;
  const voutClamped = saturatedHigh ? vcc : saturatedLow ? vee : vout;

  return { gain, vout, voutClamped, saturated, saturatedHigh, saturatedLow };
}

export function calculateVoltageFollower(
  vin: number,
  vcc: number,
  vee: number
): OpAmpResult {
  const gain = 1;
  const vout = vin;
  const saturatedHigh = vout > vcc;
  const saturatedLow = vout < vee;
  const saturated = saturatedHigh || saturatedLow;
  const voutClamped = saturatedHigh ? vcc : saturatedLow ? vee : vout;

  return { gain, vout, voutClamped, saturated, saturatedHigh, saturatedLow };
}

// Capacitance and Inductance parsing
export function parseCapacitance(input: string): number | null {
  const trimmed = input.trim().toLowerCase().replace(/f$/i, '');

  let multiplier = 1;
  let valueStr = trimmed;

  if (trimmed.endsWith('m')) {
    multiplier = 1e-3;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('u') || trimmed.endsWith('μ')) {
    multiplier = 1e-6;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('n')) {
    multiplier = 1e-9;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('p')) {
    multiplier = 1e-12;
    valueStr = trimmed.slice(0, -1);
  }

  const value = parseFloat(valueStr);
  if (isNaN(value) || value <= 0) return null;

  return value * multiplier;
}

export function parseInductance(input: string): number | null {
  const trimmed = input.trim().toLowerCase().replace(/h$/i, '');

  let multiplier = 1;
  let valueStr = trimmed;

  if (trimmed.endsWith('m')) {
    multiplier = 1e-3;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('u') || trimmed.endsWith('μ')) {
    multiplier = 1e-6;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('n')) {
    multiplier = 1e-9;
    valueStr = trimmed.slice(0, -1);
  }

  const value = parseFloat(valueStr);
  if (isNaN(value) || value <= 0) return null;

  return value * multiplier;
}

// Filter calculations
export interface FilterResult {
  fc: number;
  gainDb: number;
  phaseShift: number;
  ratio: number;
}

export function calculateRCFilter(
  r: number,
  c: number,
  f: number,
  type: 'low-pass' | 'high-pass'
): FilterResult {
  const fc = 1 / (2 * Math.PI * r * c);
  const ratio = f / fc;

  let gainDb: number;
  let phaseShift: number;

  if (type === 'low-pass') {
    gainDb = -10 * Math.log10(1 + ratio * ratio);
    phaseShift = -(Math.atan(ratio) * 180) / Math.PI;
  } else {
    gainDb = -10 * Math.log10(1 + 1 / (ratio * ratio));
    phaseShift = (Math.atan(1 / ratio) * 180) / Math.PI;
  }

  return { fc, gainDb, phaseShift, ratio };
}

export function calculateRLFilter(
  r: number,
  l: number,
  f: number,
  type: 'low-pass' | 'high-pass'
): FilterResult {
  const fc = r / (2 * Math.PI * l);
  const ratio = f / fc;

  let gainDb: number;
  let phaseShift: number;

  if (type === 'low-pass') {
    gainDb = -10 * Math.log10(1 + ratio * ratio);
    phaseShift = -(Math.atan(ratio) * 180) / Math.PI;
  } else {
    gainDb = -10 * Math.log10(1 + 1 / (ratio * ratio));
    phaseShift = (Math.atan(1 / ratio) * 180) / Math.PI;
  }

  return { fc, gainDb, phaseShift, ratio };
}

// SMD Resistor decoding
const EIA96_BASE_VALUES: Record<number, number> = {
  1: 100, 2: 102, 3: 105, 4: 107, 5: 110, 6: 113, 7: 115, 8: 118, 9: 121, 10: 124,
  11: 127, 12: 130, 13: 133, 14: 137, 15: 140, 16: 143, 17: 147, 18: 150, 19: 154, 20: 158,
  21: 162, 22: 165, 23: 169, 24: 174, 25: 178, 26: 182, 27: 187, 28: 191, 29: 196, 30: 200,
  31: 205, 32: 210, 33: 215, 34: 221, 35: 226, 36: 232, 37: 237, 38: 243, 39: 249, 40: 255,
  41: 261, 42: 267, 43: 274, 44: 280, 45: 287, 46: 294, 47: 301, 48: 309, 49: 316, 50: 324,
  51: 332, 52: 340, 53: 348, 54: 357, 55: 365, 56: 374, 57: 383, 58: 392, 59: 402, 60: 412,
  61: 422, 62: 432, 63: 442, 64: 453, 65: 464, 66: 475, 67: 487, 68: 499, 69: 511, 70: 523,
  71: 536, 72: 549, 73: 562, 74: 576, 75: 590, 76: 604, 77: 619, 78: 634, 79: 649, 80: 665,
  81: 681, 82: 698, 83: 715, 84: 732, 85: 750, 86: 768, 87: 787, 88: 806, 89: 825, 90: 845,
  91: 866, 92: 887, 93: 909, 94: 931, 95: 953, 96: 976,
};

const EIA96_MULTIPLIERS: Record<string, number> = {
  A: 1, B: 10, C: 100, D: 1000, E: 10000, F: 100000,
  X: 0.1, S: 0.1, Y: 0.01, R: 0.01,
};

export function decodeSMDResistor(
  code: string
): { value: number; format: '3-digit' | '4-digit' | 'eia-96'; error?: string } | null {
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length === 0) return null;

  // EIA-96: 2 digits + 1 letter
  if (trimmed.length === 3 && /^\d{2}[A-Z]$/.test(trimmed)) {
    const numCode = parseInt(trimmed.slice(0, 2), 10);
    const letter = trimmed.charAt(2);

    if (numCode < 1 || numCode > 96) {
      return { value: 0, format: 'eia-96', error: 'Invalid EIA-96 code (must be 01-96)' };
    }

    const baseValue = EIA96_BASE_VALUES[numCode];
    const multiplier = EIA96_MULTIPLIERS[letter];

    if (!baseValue || multiplier === undefined) {
      return { value: 0, format: 'eia-96', error: 'Invalid EIA-96 letter code' };
    }

    return { value: baseValue * multiplier, format: 'eia-96' };
  }

  // 3-digit: ABC => AB × 10^C
  if (trimmed.length === 3 && /^\d{3}$/.test(trimmed)) {
    const d1 = parseInt(trimmed.charAt(0), 10);
    const d2 = parseInt(trimmed.charAt(1), 10);
    const mult = parseInt(trimmed.charAt(2), 10);
    const value = (d1 * 10 + d2) * Math.pow(10, mult);
    return { value, format: '3-digit' };
  }

  // 4-digit: ABCD => ABC × 10^D
  if (trimmed.length === 4 && /^\d{4}$/.test(trimmed)) {
    const d1 = parseInt(trimmed.charAt(0), 10);
    const d2 = parseInt(trimmed.charAt(1), 10);
    const d3 = parseInt(trimmed.charAt(2), 10);
    const mult = parseInt(trimmed.charAt(3), 10);
    const value = (d1 * 100 + d2 * 10 + d3) * Math.pow(10, mult);
    return { value, format: '4-digit' };
  }

  return null;
}

// LED Resistor calculations
export interface LEDResistorResult {
  resistance: number;
  powerDissipated: number;
  recommendedRating: number;
  current: number;
  warning?: string;
}

export function calculateLEDResistor(
  vs: number,
  vf: number,
  ifMa: number,
  numLeds = 1
): LEDResistorResult {
  const ifAmps = ifMa / 1000;
  const totalVf = numLeds * vf;

  if (vs < totalVf) {
    return {
      resistance: 0,
      powerDissipated: 0,
      recommendedRating: 0,
      current: 0,
      warning: `Supply voltage (${vs}V) is too low for ${numLeds} LED(s) with Vf=${vf}V each`,
    };
  }

  const resistance = (vs - totalVf) / ifAmps;
  const powerDissipated = ifAmps * ifAmps * resistance;

  const standardRatings = [0.125, 0.25, 0.5, 1, 2, 5];
  const recommendedRating = standardRatings.find((r) => r >= powerDissipated) || 5;

  if (resistance < 0) {
    return {
      resistance: 0,
      powerDissipated: 0,
      recommendedRating: 0,
      current: 0,
      warning: 'Voltage too low for this LED configuration',
    };
  }

  return {
    resistance,
    powerDissipated,
    recommendedRating,
    current: ifAmps,
  };
}
