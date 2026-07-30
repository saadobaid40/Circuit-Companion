// Microprocessors — ADC/DAC resolution and UART baud rate calculations

// ── ADC / DAC ─────────────────────────────────────────────────────────────────

export interface ADCResult {
  bits: number;
  levels: number;        // 2^n
  vref: number;          // V
  LSB: number;           // Vref / 2^n  (V)
  quantErrorPM: number;  // ±LSB/2  (V)
  SNR_dB: number;        // 6.02n + 1.76 dB (ideal)
  // Per-input voltage analysis (optional)
  digitalCode?: number;
  codeHex?: string;
  codeBin?: string;
  quantizedVoltage?: number;  // code × LSB
  quantErrorActual?: number;  // Vin − quantized
}

export const ADC_BIT_OPTIONS = [8, 10, 12, 14, 16] as const;
export type ADCBits = (typeof ADC_BIT_OPTIONS)[number];

export function calculateADC(bits: number, Vref: number, Vin?: number): ADCResult {
  const levels = Math.pow(2, bits);
  const LSB = Vref / levels;
  const SNR_dB = 6.02 * bits + 1.76;

  let digitalCode: number | undefined;
  let codeHex: string | undefined;
  let codeBin: string | undefined;
  let quantizedVoltage: number | undefined;
  let quantErrorActual: number | undefined;

  if (Vin !== undefined && isFinite(Vin) && Vin >= 0 && Vin <= Vref) {
    digitalCode = Math.min(Math.floor(Vin / LSB), levels - 1);
    quantizedVoltage = digitalCode * LSB;
    quantErrorActual = Vin - quantizedVoltage;
    const hexDigits = Math.ceil(bits / 4);
    codeHex = digitalCode.toString(16).toUpperCase().padStart(hexDigits, '0');
    codeBin = digitalCode.toString(2).padStart(bits, '0');
  }

  return {
    bits, levels, vref: Vref, LSB,
    quantErrorPM: LSB / 2,
    SNR_dB,
    digitalCode, codeHex, codeBin, quantizedVoltage, quantErrorActual,
  };
}

// ── UART Baud Rate & Timer Reload ─────────────────────────────────────────────

export interface UARTRow {
  prescaler: number;
  TLR: number;         // Timer Load Register value (rounded)
  actualBaud: number;
  errorPct: number;
  valid: boolean;      // TLR >= 0
}

export const COMMON_BAUDS = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export function calculateUARTTable(clockHz: number, desiredBaud: number): UARTRow[] {
  const prescalers = [1, 2, 4, 8, 16, 32, 64, 128, 256];
  return prescalers.map(p => {
    const raw = clockHz / (p * desiredBaud) - 1;
    const TLR = Math.round(raw);
    if (TLR < 0 || !isFinite(TLR)) {
      return { prescaler: p, TLR: -1, actualBaud: 0, errorPct: 100, valid: false };
    }
    const actualBaud = clockHz / (p * (TLR + 1));
    const errorPct = ((actualBaud - desiredBaud) / desiredBaud) * 100;
    return { prescaler: p, TLR, actualBaud, errorPct, valid: true };
  });
}

/** Find the single best (lowest |error|) row from the table. */
export function bestUARTRow(rows: UARTRow[]): UARTRow | null {
  const valid = rows.filter(r => r.valid);
  if (!valid.length) return null;
  return valid.reduce((best, r) => Math.abs(r.errorPct) < Math.abs(best.errorPct) ? r : best);
}
