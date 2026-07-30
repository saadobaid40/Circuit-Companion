// AC Circuits, Impedance & Power Factor math

export interface ComplexPolar {
  r: number;
  thetaDeg: number;
}

export interface ComplexRect {
  a: number;
  b: number;
}

export interface ACPowerResult {
  P: number;       // Active power (W)
  Q: number;       // Reactive power (VAR)
  S: number;       // Apparent power (VA)
  PF: number;      // Power factor (cos θ)
  pfType: 'lagging' | 'leading' | 'unity';
}

export interface PFCorrectionResult {
  C: number;      // Required capacitor (F)
  deltaQ: number; // Reactive power compensated (VAR)
  newPF: number;  // Target power factor
  newS: number;   // New apparent power (VA)
}

export function rectToPolar(a: number, b: number): ComplexPolar {
  const r = Math.sqrt(a * a + b * b);
  const thetaDeg = Math.atan2(b, a) * (180 / Math.PI);
  return { r, thetaDeg };
}

export function polarToRect(r: number, thetaDeg: number): ComplexRect {
  const theta = thetaDeg * (Math.PI / 180);
  return { a: r * Math.cos(theta), b: r * Math.sin(theta) };
}

export function calculateACPower(
  Vrms: number,
  Irms: number,
  thetaDeg: number
): ACPowerResult {
  const theta = thetaDeg * (Math.PI / 180);
  const S = Vrms * Irms;
  const P = S * Math.cos(theta);
  const Q = S * Math.sin(theta);
  const PF = Math.cos(theta);
  const pfType =
    Math.abs(thetaDeg) < 0.01 ? 'unity' : thetaDeg > 0 ? 'lagging' : 'leading';
  return { P, Q, S, PF, pfType };
}

export function calculatePFCorrection(
  P: number,
  Vrms: number,
  theta1Deg: number,
  theta2Deg: number,
  freq: number = 50
): PFCorrectionResult {
  const theta1 = theta1Deg * (Math.PI / 180);
  const theta2 = theta2Deg * (Math.PI / 180);
  const Q1 = P * Math.tan(theta1);
  const Q2 = P * Math.tan(theta2);
  const deltaQ = Q1 - Q2;
  const C = deltaQ / (2 * Math.PI * freq * Vrms * Vrms);
  const newPF = Math.cos(theta2);
  const newS = P / newPF;
  return { C, deltaQ, newPF, newS };
}
