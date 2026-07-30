// SVG circuit schematics for all filter topologies
// Matching the style from circuit-diagram.tsx

export function RCLowPassDiagram() {
  return (
    <svg width="260" height="180" viewBox="0 0 260 180" className="mx-auto">
      {/* Vin terminal */}
      <text x="10" y="95" textAnchor="start" className="text-xs font-mono fill-primary font-semibold">Vin</text>
      <circle cx="40" cy="90" r="3" fill="hsl(var(--primary))" />
      <line x1="43" y1="90" x2="70" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* R */}
      <rect x="70" y="80" width="50" height="20" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 75 90 L 82 83 L 90 97 L 98 83 L 106 97 L 113 90" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
      <text x="95" y="70" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">R</text>
      
      {/* Node wire */}
      <line x1="120" y1="90" x2="170" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="170" cy="90" r="3" fill="hsl(var(--primary))" />
      
      {/* Vout tap (use accent color to highlight) */}
      <line x1="170" y1="90" x2="220" y2="90" stroke="hsl(var(--accent))" strokeWidth="2" />
      <text x="230" y="95" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">Vout</text>
      
      {/* C to ground */}
      <line x1="170" y1="90" x2="170" y2="120" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="160" y1="120" x2="180" y2="120" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="160" y1="125" x2="180" y2="125" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="170" y="145" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">C</text>
      
      {/* Ground */}
      <line x1="170" y1="125" x2="170" y2="145" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="155" y1="145" x2="185" y2="145" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <line x1="160" y1="150" x2="180" y2="150" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="165" y1="155" x2="175" y2="155" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      <text x="170" y="172" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">GND</text>
    </svg>
  );
}

export function RCHighPassDiagram() {
  return (
    <svg width="260" height="180" viewBox="0 0 260 180" className="mx-auto">
      {/* Vin terminal */}
      <text x="10" y="95" textAnchor="start" className="text-xs font-mono fill-primary font-semibold">Vin</text>
      <circle cx="40" cy="90" r="3" fill="hsl(var(--primary))" />
      <line x1="43" y1="90" x2="70" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* C */}
      <line x="70" y1="80" x2="70" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x="75" y1="80" x2="75" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="70" y="70" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">C</text>
      <line x1="75" y1="90" x2="100" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Node */}
      <line x1="100" y1="90" x2="170" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="170" cy="90" r="3" fill="hsl(var(--primary))" />
      
      {/* Vout tap */}
      <line x1="170" y1="90" x2="220" y2="90" stroke="hsl(var(--accent))" strokeWidth="2" />
      <text x="230" y="95" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">Vout</text>
      
      {/* R to ground */}
      <line x1="170" y1="90" x2="170" y2="105" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <rect x="160" y="105" width="20" height="50" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 170 110 L 177 118 L 163 126 L 177 134 L 163 142 L 170 150" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
      <text x="192" y="132" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">R</text>
      
      {/* Ground */}
      <line x1="170" y1="155" x2="170" y2="165" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="155" y1="165" x2="185" y2="165" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <line x1="160" y1="170" x2="180" y2="170" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="170" y="185" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">GND</text>
    </svg>
  );
}

export function RLLowPassDiagram() {
  return (
    <svg width="260" height="180" viewBox="0 0 260 180" className="mx-auto">
      {/* Vin terminal */}
      <text x="10" y="95" textAnchor="start" className="text-xs font-mono fill-primary font-semibold">Vin</text>
      <circle cx="40" cy="90" r="3" fill="hsl(var(--primary))" />
      <line x1="43" y1="90" x2="70" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* L (inductor coil) */}
      <path d="M 70 90 Q 75 78 80 90 Q 85 102 90 90 Q 95 78 100 90 Q 105 102 110 90 Q 115 78 120 90" 
        stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
      <text x="95" y="70" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">L</text>
      
      {/* Node wire */}
      <line x1="120" y1="90" x2="170" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="170" cy="90" r="3" fill="hsl(var(--primary))" />
      
      {/* Vout tap */}
      <line x1="170" y1="90" x2="220" y2="90" stroke="hsl(var(--accent))" strokeWidth="2" />
      <text x="230" y="95" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">Vout</text>
      
      {/* R to ground */}
      <line x1="170" y1="90" x2="170" y2="105" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <rect x="160" y="105" width="20" height="50" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 170 110 L 177 118 L 163 126 L 177 134 L 163 142 L 170 150" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
      <text x="192" y="132" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">R</text>
      
      {/* Ground */}
      <line x1="170" y1="155" x2="170" y2="165" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="155" y1="165" x2="185" y2="165" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <line x1="160" y1="170" x2="180" y2="170" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="170" y="185" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">GND</text>
    </svg>
  );
}

export function RLHighPassDiagram() {
  return (
    <svg width="260" height="180" viewBox="0 0 260 180" className="mx-auto">
      {/* Vin terminal */}
      <text x="10" y="95" textAnchor="start" className="text-xs font-mono fill-primary font-semibold">Vin</text>
      <circle cx="40" cy="90" r="3" fill="hsl(var(--primary))" />
      <line x1="43" y1="90" x2="70" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* R */}
      <rect x="70" y="80" width="50" height="20" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 75 90 L 82 83 L 90 97 L 98 83 L 106 97 L 113 90" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
      <text x="95" y="70" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">R</text>
      
      {/* Node wire */}
      <line x1="120" y1="90" x2="170" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="170" cy="90" r="3" fill="hsl(var(--primary))" />
      
      {/* Vout tap */}
      <line x1="170" y1="90" x2="220" y2="90" stroke="hsl(var(--accent))" strokeWidth="2" />
      <text x="230" y="95" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">Vout</text>
      
      {/* L to ground */}
      <line x1="170" y1="90" x2="170" y2="105" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 170 105 Q 178 110 170 120 Q 162 130 170 140 Q 178 150 170 160" 
        stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
      <text x="192" y="132" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">L</text>
      
      {/* Ground */}
      <line x1="170" y1="160" x2="170" y2="170" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="155" y1="170" x2="185" y2="170" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <line x1="160" y1="175" x2="180" y2="175" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="170" y="192" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">GND</text>
    </svg>
  );
}

export function RLCSeriesLowPassDiagram() {
  return (
    <svg width="280" height="200" viewBox="0 0 280 200" className="mx-auto">
      <text x="10" y="105" textAnchor="start" className="text-xs font-mono fill-primary font-semibold">Vin</text>
      <circle cx="40" cy="100" r="3" fill="hsl(var(--primary))" />
      <line x1="43" y1="100" x2="60" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* R */}
      <rect x="60" y="90" width="40" height="20" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 64 100 L 70 94 L 76 106 L 82 94 L 88 106 L 95 100" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
      <text x="80" y="82" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">R</text>
      
      <line x1="100" y1="100" x2="115" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* L */}
      <path d="M 115 100 Q 118 90 122 100 Q 126 110 130 100 Q 134 90 138 100 Q 142 110 146 100 Q 150 90 154 100" 
        stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
      <text x="135" y="82" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">L</text>
      
      <line x1="154" y1="100" x2="180" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="180" cy="100" r="3" fill="hsl(var(--primary))" />
      
      {/* Vout tap */}
      <line x1="180" y1="100" x2="230" y2="100" stroke="hsl(var(--accent))" strokeWidth="2" />
      <text x="240" y="105" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">Vout</text>
      
      {/* C to ground */}
      <line x1="180" y1="100" x2="180" y2="125" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="170" y1="125" x2="190" y2="125" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="170" y1="130" x2="190" y2="130" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="180" y="148" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">C</text>
      
      {/* Ground */}
      <line x1="180" y1="130" x2="180" y2="155" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="165" y1="155" x2="195" y2="155" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <line x1="170" y1="160" x2="190" y2="160" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="175" y1="165" x2="185" y2="165" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      <text x="180" y="182" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">GND</text>
    </svg>
  );
}

export function RLCSeriesHighPassDiagram() {
  return (
    <svg width="280" height="200" viewBox="0 0 280 200" className="mx-auto">
      <text x="10" y="105" textAnchor="start" className="text-xs font-mono fill-primary font-semibold">Vin</text>
      <circle cx="40" cy="100" r="3" fill="hsl(var(--primary))" />
      <line x1="43" y1="100" x2="60" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* C */}
      <line x="60" y1="90" x2="60" y2="110" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x="65" y1="90" x2="65" y2="110" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="60" y="82" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">C</text>
      
      <line x1="65" y1="100" x2="90" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* L */}
      <path d="M 90 100 Q 94 90 98 100 Q 102 110 106 100 Q 110 90 114 100 Q 118 110 122 100 Q 126 90 130 100" 
        stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
      <text x="110" y="82" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">L</text>
      
      <line x1="130" y1="100" x2="180" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="180" cy="100" r="3" fill="hsl(var(--primary))" />
      
      {/* Vout tap */}
      <line x1="180" y1="100" x2="230" y2="100" stroke="hsl(var(--accent))" strokeWidth="2" />
      <text x="240" y="105" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">Vout</text>
      
      {/* R to ground */}
      <line x1="180" y1="100" x2="180" y2="115" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <rect x="170" y="115" width="20" height="50" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 180 120 L 187 128 L 173 136 L 187 144 L 173 152 L 180 160" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
      <text x="202" y="142" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">R</text>
      
      {/* Ground */}
      <line x1="180" y1="165" x2="180" y2="175" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="165" y1="175" x2="195" y2="175" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <line x1="170" y1="180" x2="190" y2="180" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="180" y="195" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">GND</text>
    </svg>
  );
}

export function RLCSeriesBandPassDiagram() {
  return (
    <svg width="280" height="200" viewBox="0 0 280 200" className="mx-auto">
      <text x="10" y="105" textAnchor="start" className="text-xs font-mono fill-primary font-semibold">Vin</text>
      <circle cx="40" cy="100" r="3" fill="hsl(var(--primary))" />
      <line x1="43" y1="100" x2="60" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* L */}
      <path d="M 60 100 Q 64 90 68 100 Q 72 110 76 100 Q 80 90 84 100 Q 88 110 92 100 Q 96 90 100 100" 
        stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
      <text x="80" y="82" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">L</text>
      
      <line x1="100" y1="100" x2="115" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* C */}
      <line x="115" y1="90" x2="115" y2="110" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x="120" y1="90" x2="120" y2="110" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="115" y="82" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">C</text>
      
      <line x1="120" y1="100" x2="180" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="180" cy="100" r="3" fill="hsl(var(--primary))" />
      
      {/* Vout tap */}
      <line x1="180" y1="100" x2="230" y2="100" stroke="hsl(var(--accent))" strokeWidth="2" />
      <text x="240" y="105" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">Vout</text>
      
      {/* R to ground */}
      <line x1="180" y1="100" x2="180" y2="115" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <rect x="170" y="115" width="20" height="50" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 180 120 L 187 128 L 173 136 L 187 144 L 173 152 L 180 160" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
      <text x="202" y="142" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">R</text>
      
      {/* Ground */}
      <line x1="180" y1="165" x2="180" y2="175" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="165" y1="175" x2="195" y2="175" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <line x1="170" y1="180" x2="190" y2="180" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="180" y="195" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">GND</text>
    </svg>
  );
}

export function RLCSeriesBandStopDiagram() {
  return (
    <svg width="280" height="220" viewBox="0 0 280 220" className="mx-auto">
      <text x="10" y="105" textAnchor="start" className="text-xs font-mono fill-primary font-semibold">Vin</text>
      <circle cx="40" cy="100" r="3" fill="hsl(var(--primary))" />
      <line x1="43" y1="100" x2="70" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* R */}
      <rect x="70" y="90" width="40" height="20" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 74 100 L 80 94 L 86 106 L 92 94 L 98 106 L 105 100" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
      <text x="90" y="82" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">R</text>
      
      <line x1="110" y1="100" x2="160" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="160" cy="100" r="3" fill="hsl(var(--primary))" />
      
      {/* Vout tap */}
      <line x1="160" y1="100" x2="230" y2="100" stroke="hsl(var(--accent))" strokeWidth="2" />
      <text x="240" y="105" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">Vout</text>
      
      {/* Parallel LC branch to ground */}
      <line x1="160" y1="100" x2="160" y2="130" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* L branch (left) */}
      <line x1="160" y1="130" x2="140" y2="130" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 140 130 Q 138 140 140 150 Q 142 160 140 170" 
        stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
      <text x="125" y="152" textAnchor="end" className="text-xs font-mono fill-accent font-semibold">L</text>
      <line x1="140" y1="170" x2="160" y2="170" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* C branch (right) */}
      <line x1="160" y1="130" x2="180" y2="130" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x="180" y1="140" x2="180" y2="160" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x="185" y1="140" x2="185" y2="160" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="200" y="152" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">C</text>
      <line x1="185" y1="150" x2="190" y2="150" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="190" y1="150" x2="190" y2="170" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="190" y1="170" x2="160" y2="170" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Ground */}
      <line x1="160" y1="170" x2="160" y2="185" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="145" y1="185" x2="175" y2="185" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <line x1="150" y1="190" x2="170" y2="190" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="160" y="207" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">GND</text>
    </svg>
  );
}

export function RLCParallelDiagram() {
  return (
    <svg width="280" height="220" viewBox="0 0 280 220" className="mx-auto">
      <text x="10" y="105" textAnchor="start" className="text-xs font-mono fill-primary font-semibold">Vin</text>
      <circle cx="40" cy="100" r="3" fill="hsl(var(--primary))" />
      <line x1="43" y1="100" x2="70" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* R */}
      <rect x="70" y="90" width="40" height="20" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 74 100 L 80 94 L 86 106 L 92 94 L 98 106 L 105 100" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
      <text x="90" y="82" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">R</text>
      
      <line x1="110" y1="100" x2="160" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="160" cy="100" r="3" fill="hsl(var(--primary))" />
      
      {/* Vout tap */}
      <line x1="160" y1="100" x2="230" y2="100" stroke="hsl(var(--accent))" strokeWidth="2" />
      <text x="240" y="105" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">Vout</text>
      
      {/* Parallel LC to ground */}
      <line x1="160" y1="100" x2="160" y2="130" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* L branch (left) */}
      <line x1="160" y1="130" x2="140" y2="130" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <path d="M 140 130 Q 138 140 140 150 Q 142 160 140 170" 
        stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
      <text x="125" y="152" textAnchor="end" className="text-xs font-mono fill-accent font-semibold">L</text>
      <line x1="140" y1="170" x2="160" y2="170" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* C branch (right) */}
      <line x1="160" y1="130" x2="180" y2="130" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x="180" y1="140" x2="180" y2="160" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x="185" y1="140" x2="185" y2="160" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="200" y="152" textAnchor="start" className="text-xs font-mono fill-accent font-semibold">C</text>
      <line x1="185" y1="150" x2="190" y2="150" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="190" y1="150" x2="190" y2="170" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="190" y1="170" x2="160" y2="170" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Ground */}
      <line x1="160" y1="170" x2="160" y2="185" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="145" y1="185" x2="175" y2="185" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <line x1="150" y1="190" x2="170" y2="190" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <text x="160" y="207" textAnchor="middle" className="text-xs font-mono fill-muted-foreground">GND</text>
    </svg>
  );
}
