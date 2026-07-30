// BJT NPN Voltage-Divider Bias calculations

export type BJTRegion = 'cutoff' | 'active' | 'saturation';

export interface BJTBiasResult {
  VTH: number;    // Thevenin base voltage (V)
  RTH: number;    // Thevenin base resistance (Ω)
  VB: number;     // Base voltage (V)
  VE: number;     // Emitter voltage (V)
  VC: number;     // Collector voltage (V)
  VCE: number;    // Collector-emitter voltage (V)
  VBE: number;    // Base-emitter voltage (V)
  IB: number;     // Base current (A)
  IC: number;     // Collector current (A)
  IE: number;     // Emitter current (A)
  region: BJTRegion;
}

export function calculateBJTBias(
  VCC: number,
  R1: number,
  R2: number,
  RC: number,
  RE: number,
  beta: number
): BJTBiasResult {
  const VBE = 0.7;

  // Thevenin equivalent at base
  const VTH = VCC * R2 / (R1 + R2);
  const RTH = (R1 * R2) / (R1 + R2);

  // KVL: VTH = IB·RTH + VBE + IE·RE,  IE = (β+1)·IB
  // → IB = (VTH - VBE) / (RTH + (β+1)·RE)
  const IB = Math.max(0, (VTH - VBE) / (RTH + (beta + 1) * RE));
  const IC = beta * IB;
  const IE = (beta + 1) * IB;

  const VE = IE * RE;
  const VB = VE + VBE;
  const VC = VCC - IC * RC;
  const VCE = VC - VE; // = VCC - IC·RC - IE·RE

  let region: BJTRegion;
  if (VTH < VBE || IB <= 0) {
    region = 'cutoff';
  } else if (VCE < 0.2) {
    region = 'saturation';
  } else {
    region = 'active';
  }

  return { VTH, RTH, VB, VE, VC, VCE, VBE, IB, IC, IE, region };
}
