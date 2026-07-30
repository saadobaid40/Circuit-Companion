import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorCodeCalculator } from '@/components/color-code-calculator';
import { SeriesParallelCalculator } from '@/components/series-parallel-calculator';
import { OhmsLawCalculator } from '@/components/ohms-law-calculator';
import { OpAmpCalculator } from '@/components/opamp-calculator';
import { FilterCalculator } from '@/components/filter-calculator';
import { SmdLedCalculator } from '@/components/smd-led-calculator';
import { PresetsDrawer } from '@/components/presets-drawer';
import { SavePresetDialog } from '@/components/save-preset-dialog';
import { Cpu } from 'lucide-react';
import { Preset } from '@/lib/presets';
import { usePresets } from '@/hooks/use-presets';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();
  const { savePreset: savePresetToStorage } = usePresets();
  const [activeTab, setActiveTab] = useState('color-code');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLoadPreset = (preset: Preset) => {
    const tabMap: Record<Preset['type'], string> = {
      'color-code': 'color-code',
      'series-parallel': 'series-parallel',
      'op-amp': 'op-amp',
      'rc-filter': 'filters',
      'led-resistor': 'smd-led',
    };

    const targetTab = tabMap[preset.type];
    if (targetTab) {
      setActiveTab(targetTab);
      toast({
        title: 'Preset Loaded',
        description: `"${preset.name}" configuration loaded`,
        duration: 2000,
      });
    }
  };

  const handleSaveSetup = (data: Record<string, unknown>, name: string) => {
    let presetType: Preset['type'] = 'color-code';
    if (activeTab === 'color-code') presetType = 'color-code';
    else if (activeTab === 'series-parallel') presetType = 'series-parallel';
    else if (activeTab === 'op-amp') presetType = 'op-amp';
    else if (activeTab === 'filters') presetType = 'rc-filter';
    else if (activeTab === 'smd-led') presetType = 'led-resistor';

    const preset: Preset = {
      id: crypto.randomUUID(),
      name,
      type: presetType,
      createdAt: Date.now(),
      data,
    };

    savePresetToStorage(preset);

    toast({
      title: 'Preset Saved',
      description: `"${name}" has been saved`,
      duration: 2000,
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border border-primary/30 rounded flex items-center justify-center glow-primary">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight" data-testid="text-app-title">
                RESISTOR TOOLKIT
              </h1>
              <p className="text-xs text-muted-foreground font-mono tracking-wider">
                PRECISION ELECTRONICS CALCULATOR
              </p>
            </div>
          </div>
          <PresetsDrawer onLoadPreset={handleLoadPreset} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-8 h-auto p-1 bg-card border border-border overflow-x-auto flex-nowrap" data-testid="tabs-main">
            <TabsTrigger 
              value="color-code" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-sm py-3 whitespace-nowrap"
              data-testid="tab-color-code"
            >
              Color Code
            </TabsTrigger>
            <TabsTrigger 
              value="series-parallel" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-sm py-3 whitespace-nowrap"
              data-testid="tab-series-parallel"
            >
              Series & Parallel
            </TabsTrigger>
            <TabsTrigger 
              value="ohms-law" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-sm py-3 whitespace-nowrap"
              data-testid="tab-ohms-law"
            >
              Ohm's Law & Divider
            </TabsTrigger>
            <TabsTrigger 
              value="op-amp" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-sm py-3 whitespace-nowrap"
              data-testid="tab-op-amp"
            >
              Op-Amp
            </TabsTrigger>
            <TabsTrigger 
              value="filters" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-sm py-3 whitespace-nowrap"
              data-testid="tab-filters"
            >
              Filters
            </TabsTrigger>
            <TabsTrigger 
              value="smd-led" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-sm py-3 whitespace-nowrap"
              data-testid="tab-smd-led"
            >
              SMD & LED
            </TabsTrigger>
          </TabsList>

          <TabsContent value="color-code" className="mt-0">
            <ColorCodeCalculator onSave={handleSaveSetup} />
          </TabsContent>

          <TabsContent value="series-parallel" className="mt-0">
            <SeriesParallelCalculator onSave={handleSaveSetup} />
          </TabsContent>

          <TabsContent value="ohms-law" className="mt-0">
            <OhmsLawCalculator />
          </TabsContent>

          <TabsContent value="op-amp" className="mt-0">
            <OpAmpCalculator onSave={handleSaveSetup} />
          </TabsContent>

          <TabsContent value="filters" className="mt-0">
            <FilterCalculator onSave={handleSaveSetup} />
          </TabsContent>

          <TabsContent value="smd-led" className="mt-0">
            <SmdLedCalculator onSave={handleSaveSetup} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6 bg-card/30">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground font-mono">
          <p>Built for engineers, by engineers. All calculations client-side.</p>
        </div>
      </footer>

    </div>
  );
}
