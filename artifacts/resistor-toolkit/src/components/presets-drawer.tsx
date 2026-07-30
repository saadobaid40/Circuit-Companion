import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bookmark, Trash2, Download } from 'lucide-react';
import { Preset } from '@/lib/presets';
import { usePresets } from '@/hooks/use-presets';

interface PresetsDrawerProps {
  onLoadPreset: (preset: Preset) => void;
}

export function PresetsDrawer({ onLoadPreset }: PresetsDrawerProps) {
  const { presets, deletePreset } = usePresets();

  const getTypeBadgeColor = (type: Preset['type']) => {
    switch (type) {
      case 'color-code':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'series-parallel':
        return 'bg-secondary/10 text-secondary border-secondary/30';
      case 'op-amp':
        return 'bg-accent/10 text-accent border-accent/30';
      case 'rc-filter':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/30';
      case 'led-resistor':
        return 'bg-chart-4/10 text-chart-4 border-chart-4/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTypeLabel = (type: Preset['type']) => {
    switch (type) {
      case 'color-code':
        return 'Color Code';
      case 'series-parallel':
        return 'Series/Parallel';
      case 'op-amp':
        return 'Op-Amp';
      case 'rc-filter':
        return 'Filter';
      case 'led-resistor':
        return 'LED Resistor';
      default:
        return type;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-open-presets"
        >
          <Bookmark className="w-4 h-4" />
          Saved Presets
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-bold">Saved Presets</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            Load or delete saved calculator configurations
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {presets.length === 0 ? (
            <Card className="bg-muted/30 border-border p-8">
              <div className="text-center">
                <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No saved presets yet. Use the "Save Setup" button in any calculator to save a
                  configuration.
                </p>
              </div>
            </Card>
          ) : (
            presets
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((preset) => (
                <Card
                  key={preset.id}
                  className="bg-card border-card-border p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate mb-1">
                        {preset.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded border ${getTypeBadgeColor(
                            preset.type
                          )}`}
                        >
                          {getTypeLabel(preset.type)}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(preset.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onLoadPreset(preset)}
                        className="h-8 px-2"
                        data-testid={`button-load-preset-${preset.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePreset(preset.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-testid={`button-delete-preset-${preset.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
