// Electronics II — MOSFET/JFET biasing, Differential Amplifier, Bode plot

export type FETType = 'nmos' | 'pmos' | 'njfet';
export type FETRegion = 'cutoff' | 'triode' | 'saturation';

export interface FETResult {
  ID: number;        // Drain current (A)
  gm: number;        // Transconductance (A/V)
  region: FETRegion;
  overdriveV: number; // VGS-VT for MOSFET, VGS-VP for JFET
  VDSsat?: number;   // Minimum VDS for saturation
}

export function calculateFET(
  type: FETType,
  VGS: number,
  VT: number,   // threshold (MOSFET) or pinch-off (JFET, negative)
  Kn: number,   // process transconductance (A/V²) — for JFET supply IDSS
  VDS: number,
  IDSS?: number,
  VP?: number,
): FETResult {
  if (type === 'nmos') {
    const ov = VGS - VT;
    if (ov <= 0) return { ID: 0, gm: 0, region: 'cutoff', overdriveV: ov };
    const VDSsat = ov;
    if (VDS >= VDSsat) {
      const ID = (Kn / 2) * ov * ov;
      return { ID, gm: Kn * ov, region: 'saturation', overdriveV: ov, VDSsat };
    }
    return {
      ID: Kn * (ov * VDS - 0.5 * VDS * VDS),
      gm: Kn * VDS,
      region: 'triode', overdriveV: ov, VDSsat,
    };
  }

  if (type === 'pmos') {
    // VT is negative for PMOS (e.g. −1 V); use VSG/VSD
    const VSG = -VGS, VTP = -VT, VSD = -VDS;
    const ov = VSG - VTP;
    if (ov <= 0) return { ID: 0, gm: 0, region: 'cutoff', overdriveV: VGS - VT };
    if (VSD >= ov) {
      const ID = (Kn / 2) * ov * ov;
      return { ID, gm: Kn * ov, region: 'saturation', overdriveV: VGS - VT, VDSsat: -(ov) };
    }
    return {
      ID: Kn * (ov * VSD - 0.5 * VSD * VSD),
      gm: Kn * VSD,
      region: 'triode', overdriveV: VGS - VT, VDSsat: -(ov),
    };
  }

  // N-JFET: VP < 0, IDSS > 0
  const Vp = VP ?? -4;
  const Idss = IDSS ?? 10e-3;
  const ov = VGS - Vp; // > 0 when device is on
  if (VGS <= Vp) return { ID: 0, gm: 0, region: 'cutoff', overdriveV: ov };
  const VDSsat = VGS - Vp; // = ov
  const gm_sat = (-2 * Idss / Vp) * (1 - VGS / Vp);
  if (VDS >= VDSsat) {
    const ID = Idss * Math.pow(1 - VGS / Vp, 2);
    return { ID, gm: Math.abs(gm_sat), region: 'saturation', overdriveV: ov, VDSsat };
  }
  // Triode (Ohmic): ID = IDSS * [2(VDS/|VP|)(1 - VGS/VP) - (VDS/|VP|)²]
  const absVP = Math.abs(Vp);
  const x = VDS / absVP;
  const ID = Idss * (2 * x * (1 - VGS / Vp) - x * x);
  return { ID: Math.max(0, ID), gm: Math.abs(gm_sat), region: 'triode', overdriveV: ov, VDSsat };
}

// ── Differential Amplifier & CMRR ────────────────────────────────────────────

export interface DiffAmpResult {
  re: number;      // small-signal emitter resistance Ω
  gm: number;      // transconductance A/V
  Ad: number;      // differential gain (V/V)
  Acm: number;     // common-mode gain (V/V)
  CMRR: number;    // linear ratio
  CMRR_dB: number;
}

const VT_THERMAL = 0.02585; // Thermal voltage at 300 K (V)

export function calculateDiffAmp(
  IC: number,   // quiescent collector current per transistor (A)
  RC: number,   // collector/drain load resistance (Ω)
  REE: number,  // tail (emitter) resistance (Ω)
): DiffAmpResult {
  const re = VT_THERMAL / IC;  // small-signal emitter resistance
  const gm = IC / VT_THERMAL;
  const Ad = RC / re;          // differential gain (for emitter-coupled pair)
  const Acm = -RC / (2 * REE); // common-mode gain (approximate)
  const CMRR = Math.abs(Ad / Acm);
  return { re, gm, Ad, Acm, CMRR, CMRR_dB: 20 * Math.log10(CMRR) };
}

// ── Bode Plot ────────────────────────────────────────────────────────────────

export interface BodePoint {
  f: number;       // Hz
  gain_dB: number;
}

export interface BodeResult {
  data: BodePoint[];
  BW: number;        // Hz
  midband_dB: number;
}

export function generateBodeData(fL: number, fH: number, Amid: number): BodeResult {
  const numPoints = 300;
  const fMin = fL / 100;
  const fMax = fH * 100;
  const logMin = Math.log10(fMin), logMax = Math.log10(fMax);

  const data: BodePoint[] = Array.from({ length: numPoints }, (_, i) => {
    const f = Math.pow(10, logMin + (i / (numPoints - 1)) * (logMax - logMin));
    // |A(f)| = Amid * (f/fL) / sqrt[(1+(f/fL)²)(1+(f/fH)²)]
    const normLow = f / fL;
    const mag = Amid * normLow / Math.sqrt((1 + normLow * normLow) * (1 + (f / fH) ** 2));
    return { f, gain_dB: 20 * Math.log10(Math.max(mag, 1e-12)) };
  });

  return {
    data,
    BW: fH - fL,
    midband_dB: 20 * Math.log10(Amid),
  };
}
