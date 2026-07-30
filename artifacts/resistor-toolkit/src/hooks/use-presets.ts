import { useState, useEffect } from 'react';
import { Preset, loadPresets, savePreset as savePresetToStorage, deletePreset as deletePresetFromStorage } from '@/lib/presets';

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const savePreset = (preset: Preset) => {
    savePresetToStorage(preset);
    setPresets(loadPresets());
  };

  const deletePreset = (id: string) => {
    deletePresetFromStorage(id);
    setPresets(loadPresets());
  };

  return { presets, savePreset, deletePreset };
}
