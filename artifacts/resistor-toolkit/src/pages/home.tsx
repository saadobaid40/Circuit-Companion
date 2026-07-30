import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorCodeCalculator } from '@/components/color-code-calculator';
import { SeriesParallelCalculator } from '@/components/series-parallel-calculator';
import { OhmsLawCalculator } from '@/components/ohms-law-calculator';
import { Cpu } from 'lucide-react';

export default function Home() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="color-code" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-card border border-border" data-testid="tabs-main">
            <TabsTrigger 
              value="color-code" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-sm py-3"
              data-testid="tab-color-code"
            >
              Color Code
            </TabsTrigger>
            <TabsTrigger 
              value="series-parallel" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-sm py-3"
              data-testid="tab-series-parallel"
            >
              Series & Parallel
            </TabsTrigger>
            <TabsTrigger 
              value="ohms-law" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-sm py-3"
              data-testid="tab-ohms-law"
            >
              Ohm's Law & Divider
            </TabsTrigger>
          </TabsList>

          <TabsContent value="color-code" className="mt-0">
            <ColorCodeCalculator />
          </TabsContent>

          <TabsContent value="series-parallel" className="mt-0">
            <SeriesParallelCalculator />
          </TabsContent>

          <TabsContent value="ohms-law" className="mt-0">
            <OhmsLawCalculator />
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
