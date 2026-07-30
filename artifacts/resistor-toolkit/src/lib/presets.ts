export interface Preset {
  id: string;
  name: string;
  type: 'color-code' | 'series-parallel' | 'op-amp' | 'rc-filter' | 'led-resistor';
  createdAt: number;
  data: Record<string, unknown>;
}

const STORAGE_KEY = 'resistor-toolkit-presets';

export function loadPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePreset(preset: Preset): void {
  const presets = loadPresets();
  presets.push(preset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function deletePreset(id: string): void {
  const presets = loadPresets();
  const filtered = presets.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
