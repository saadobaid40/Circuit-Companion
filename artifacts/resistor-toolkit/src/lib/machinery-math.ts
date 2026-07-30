// Electrical Machinery — DC Motor/Generator, Induction Motor, Synchronous Machine

// ── DC Motor / Generator ─────────────────────────────────────────────────────

export interface DCMotorResult {
  Ea: number;      // Back EMF (V)
  omega: number;   // Angular speed (rad/s)
  N: number;       // Speed (RPM)
  tau: number;     // Developed torque (N·m)
  Pdev: number;    // Developed power (W)
  mode: 'motor' | 'generator';
  curve: { torque: number; speed: number }[];
}

export function calculateDCMotor(
  Vt: number,    // Terminal voltage (V)
  Ra: number,    // Armature resistance (Ω)
  Ia: number,    // Armature current (A)
  KPhi: number,  // Motor constant K·Φ (V·s/rad = N·m/A)
): DCMotorResult {
  // KVL: Vt = Ea + Ia·Ra  (motor)  or  Ea = Vt + Ia·Ra  (generator, Ia out)
  const Ea = Vt - Ia * Ra;
  const omega = Ea / KPhi;
  const N = (omega * 60) / (2 * Math.PI);
  const tau = KPhi * Ia;
  const Pdev = Ea * Ia;
  const mode: 'motor' | 'generator' = Ea > 0 && Ia > 0 ? 'motor' : 'generator';

  // Speed-Torque characteristic: vary Ia from 0 to 2·Ia
  const N0 = (Vt * 60) / (2 * Math.PI * KPhi);      // no-load speed
  const tauMax = KPhi * (Vt / Ra);                   // stall torque
  const curve = Array.from({ length: 60 }, (_, i) => {
    const Ia_i = (i / 59) * (Vt / Ra);               // 0 → stall current
    const Ea_i = Vt - Ia_i * Ra;
    const N_i = (Ea_i * 60) / (2 * Math.PI * KPhi);
    return { torque: KPhi * Ia_i, speed: Math.max(0, N_i) };
  });

  return { Ea, omega, N, tau, Pdev, mode, curve };
}

// ── Induction Motor & Slip ────────────────────────────────────────────────────

export interface InductionMotorResult {
  Ns: number;   // Synchronous speed (RPM)
  s: number;    // Slip (0–1)
  fr: number;   // Rotor frequency (Hz)
}

export function calculateInductionMotor(
  f: number,   // Stator frequency (Hz)
  P: number,   // Number of poles
  N: number,   // Actual rotor speed (RPM)
): InductionMotorResult {
  const Ns = (120 * f) / P;
  const s = (Ns - N) / Ns;
  const fr = s * f;
  return { Ns, s, fr };
}

// ── Synchronous Machine ───────────────────────────────────────────────────────

export interface SyncMachineResult {
  Ef: number;       // Excitation voltage magnitude (V)
  Ef_re: number;    // Real part of Ef phasor
  Ef_im: number;    // Imaginary part of Ef phasor
  VR: number;       // Voltage regulation (%)
  delta: number;    // Torque angle (degrees)
  jXsIa_re: number; // Real part of jXs·Ia drop
  jXsIa_im: number; // Imaginary part of jXs·Ia drop
}

export function calculateSyncMachine(
  Vt: number,       // Terminal voltage (V) — reference phasor at 0°
  Ia: number,       // Armature current (A)
  Xs: number,       // Synchronous reactance (Ω)
  thetaDeg: number, // Power factor angle (degrees, + = lagging)
): SyncMachineResult {
  const theta = thetaDeg * (Math.PI / 180);
  // Ia phasor: Ia∠−θ  →  (Ia·cosθ, −Ia·sinθ)
  const Ia_re = Ia * Math.cos(theta);
  const Ia_im = -Ia * Math.sin(theta);

  // jXs·Ia: multiply Ia by jXs → rotate by +90°
  // jXs·(Ia_re + j·Ia_im) = Xs·(−Ia_im + j·Ia_re)
  const jXsIa_re = -Xs * Ia_im;
  const jXsIa_im = Xs * Ia_re;

  // Generator: Ef = Vt + jXs·Ia  (Vt along real axis)
  const Ef_re = Vt + jXsIa_re;
  const Ef_im = jXsIa_im;
  const Ef = Math.sqrt(Ef_re ** 2 + Ef_im ** 2);

  const VR = ((Ef - Vt) / Vt) * 100;
  const delta = Math.atan2(Ef_im, Ef_re) * (180 / Math.PI);

  return { Ef, Ef_re, Ef_im, VR, delta, jXsIa_re, jXsIa_im };
}
