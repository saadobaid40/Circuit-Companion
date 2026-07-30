export type ResistorColor =
  | 'Black' | 'Brown' | 'Red' | 'Orange' | 'Yellow'
  | 'Green' | 'Blue' | 'Violet' | 'Grey' | 'White'
  | 'Gold' | 'Silver';

export interface ColorData {
  digit?: number;
  multiplier?: number;
  tolerance?: number;
  tempCo?: number;
  hex: string;
}

export const colorDatabase: Record<ResistorColor, ColorData> = {
  Black:   { digit: 0, multiplier: 1,        tempCo: 250, hex: '#1a1a1a' },
  Brown:   { digit: 1, multiplier: 10,       tolerance: 1,   tempCo: 100, hex: '#8b4513' },
  Red:     { digit: 2, multiplier: 100,      tolerance: 2,   tempCo: 50,  hex: '#dc143c' },
  Orange:  { digit: 3, multiplier: 1000,     tempCo: 15,  hex: '#ff8c00' },
  Yellow:  { digit: 4, multiplier: 10000,    tempCo: 25,  hex: '#ffd700' },
  Green:   { digit: 5, multiplier: 100000,   tolerance: 0.5, tempCo: 20,  hex: '#228b22' },
  Blue:    { digit: 6, multiplier: 1000000,  tolerance: 0.25, tempCo: 10,  hex: '#4169e1' },
  Violet:  { digit: 7, multiplier: 10000000, tolerance: 0.1,  tempCo: 5,   hex: '#8b00ff' },
  Grey:    { digit: 8, multiplier: 100000000, tolerance: 0.05, tempCo: 1,   hex: '#808080' },
  White:   { digit: 9, multiplier: 1000000000, hex: '#f5f5f5' },
  Gold:    { multiplier: 0.1,  tolerance: 5,  hex: '#ffd700' },
  Silver:  { multiplier: 0.01, tolerance: 10, hex: '#c0c0c0' },
};

export const digitColors: ResistorColor[] = ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White'];
export const multiplierColors: ResistorColor[] = ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White', 'Gold', 'Silver'];
export const toleranceColors: ResistorColor[] = ['Brown', 'Red', 'Green', 'Blue', 'Violet', 'Grey', 'Gold', 'Silver'];
export const tempCoColors: ResistorColor[] = ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey'];

export interface ResistorValue {
  resistance: number;
  tolerance?: number;
  tempCo?: number;
  formattedResistance: string;
  minResistance?: number;
  maxResistance?: number;
}

export function calculateResistance(
  band1: ResistorColor,
  band2: ResistorColor,
  multiplier: ResistorColor,
  tolerance?: ResistorColor,
  band3?: ResistorColor,
  tempCo?: ResistorColor
): ResistorValue {
  const d1 = colorDatabase[band1].digit!;
  const d2 = colorDatabase[band2].digit!;
  const d3 = band3 ? colorDatabase[band3].digit! : undefined;
  const mult = colorDatabase[multiplier].multiplier!;
  const tol = tolerance ? colorDatabase[tolerance].tolerance : undefined;
  const tc = tempCo ? colorDatabase[tempCo].tempCo : undefined;

  let significantFigures: number;
  if (d3 !== undefined) {
    significantFigures = d1 * 100 + d2 * 10 + d3;
  } else {
    significantFigures = d1 * 10 + d2;
  }

  const resistance = significantFigures * mult;
  const formattedResistance = formatResistance(resistance);

  let minResistance: number | undefined;
  let maxResistance: number | undefined;
  if (tol !== undefined) {
    const tolerance = resistance * (tol / 100);
    minResistance = resistance - tolerance;
    maxResistance = resistance + tolerance;
  }

  return {
    resistance,
    tolerance: tol,
    tempCo: tc,
    formattedResistance,
    minResistance,
    maxResistance,
  };
}

export function formatResistance(ohms: number): string {
  if (ohms >= 1e9) {
    return `${(ohms / 1e9).toFixed(ohms % 1e9 === 0 ? 0 : 2)}GΩ`;
  } else if (ohms >= 1e6) {
    return `${(ohms / 1e6).toFixed(ohms % 1e6 === 0 ? 0 : 2)}MΩ`;
  } else if (ohms >= 1e3) {
    return `${(ohms / 1e3).toFixed(ohms % 1e3 === 0 ? 0 : 2)}kΩ`;
  } else {
    return `${ohms.toFixed(ohms % 1 === 0 ? 0 : 2)}Ω`;
  }
}

export function parseResistance(input: string): number | null {
  const trimmed = input.trim().toLowerCase().replace(/ω|ohm|ohms/gi, '');
  
  let multiplier = 1;
  let valueStr = trimmed;

  if (trimmed.endsWith('g')) {
    multiplier = 1e9;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('m') && !trimmed.endsWith('ohm')) {
    const beforeM = trimmed.slice(0, -1);
    if (parseFloat(beforeM) > 100) {
      multiplier = 1e-3;
    } else {
      multiplier = 1e6;
    }
    valueStr = beforeM;
  } else if (trimmed.endsWith('k')) {
    multiplier = 1e3;
    valueStr = trimmed.slice(0, -1);
  } else if (trimmed.endsWith('r')) {
    multiplier = 1;
    valueStr = trimmed.slice(0, -1);
  }

  const value = parseFloat(valueStr);
  if (isNaN(value) || value <= 0) return null;

  return value * multiplier;
}

const E24_SERIES = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1
];

export function findNearestE24(targetOhms: number): number {
  if (targetOhms <= 0) return 1;

  const exponent = Math.floor(Math.log10(targetOhms));
  const mantissa = targetOhms / Math.pow(10, exponent);

  let closestMantissa = E24_SERIES[0];
  let minDiff = Math.abs(mantissa - closestMantissa);

  for (const val of E24_SERIES) {
    const diff = Math.abs(mantissa - val);
    if (diff < minDiff) {
      minDiff = diff;
      closestMantissa = val;
    }
  }

  return closestMantissa * Math.pow(10, exponent);
}

export interface ColorBands {
  band1: ResistorColor;
  band2: ResistorColor;
  band3?: ResistorColor;
  multiplier: ResistorColor;
  tolerance: ResistorColor;
}

export function resistanceToColorBands(ohms: number, bands: 4 | 5): ColorBands | null {
  if (ohms <= 0) return null;

  const nearestE24 = findNearestE24(ohms);
  
  let exponent = 0;
  let significantFigures = nearestE24;
  
  while (significantFigures >= 10 && exponent < 9) {
    significantFigures /= 10;
    exponent++;
  }

  if (bands === 5) {
    significantFigures *= 10;
    exponent--;
    if (exponent < -2) {
      significantFigures /= 10;
      exponent++;
    }
  }

  const multiplierValue = Math.pow(10, exponent);
  const multiplierColor = Object.entries(colorDatabase).find(
    ([_, data]) => data.multiplier === multiplierValue
  )?.[0] as ResistorColor | undefined;

  if (!multiplierColor) return null;

  if (bands === 4) {
    const d1 = Math.floor(significantFigures / 10);
    const d2 = Math.floor(significantFigures % 10);
    
    return {
      band1: digitColors[d1],
      band2: digitColors[d2],
      multiplier: multiplierColor,
      tolerance: 'Gold',
    };
  } else {
    const d1 = Math.floor(significantFigures / 100);
    const d2 = Math.floor((significantFigures % 100) / 10);
    const d3 = Math.floor(significantFigures % 10);
    
    return {
      band1: digitColors[d1],
      band2: digitColors[d2],
      band3: digitColors[d3],
      multiplier: multiplierColor,
      tolerance: 'Brown',
    };
  }
}
