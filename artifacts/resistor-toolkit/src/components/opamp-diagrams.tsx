export function InvertingOpAmpDiagram() {
  return (
    <svg width="280" height="200" viewBox="0 0 280 200" className="mx-auto">
      {/* Op-amp triangle */}
      <path
        d="M 100 60 L 100 140 L 180 100 Z"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      
      {/* Input terminals labels */}
      <text x="110" y="80" className="text-xs font-mono fill-muted-foreground">−</text>
      <text x="110" y="125" className="text-xs font-mono fill-muted-foreground">+</text>
      
      {/* Non-inverting input to ground */}
      <line x1="100" y1="120" x2="80" y2="120" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="80" y1="120" x2="80" y2="150" stroke="hsl(var(--foreground))" strokeWidth="2" />
      {/* Ground symbol */}
      <line x1="70" y1="150" x2="90" y2="150" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
      <line x1="73" y1="155" x2="87" y2="155" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="76" y1="160" x2="84" y2="160" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      
      {/* Input resistor R1 */}
      <line x1="20" y1="80" x2="50" y2="80" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <rect
        x="50"
        y="70"
        width="30"
        height="20"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <text x="65" y="60" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">R1</text>
      
      {/* Connection from R1 to inverting input */}
      <line x1="80" y1="80" x2="100" y2="80" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="100" cy="80" r="3" fill="hsl(var(--primary))" />
      
      {/* Feedback resistor Rf */}
      <line x1="100" y1="80" x2="100" y2="30" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="100" y1="30" x2="180" y2="30" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <rect
        x="180"
        y="20"
        width="30"
        height="20"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <text x="195" y="15" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">Rf</text>
      <line x1="210" y1="30" x2="230" y2="30" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="230" y1="30" x2="230" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Output */}
      <line x1="180" y1="100" x2="230" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="230" cy="100" r="3" fill="hsl(var(--primary))" />
      <line x1="230" y1="100" x2="260" y2="100" stroke="hsl(var(--secondary))" strokeWidth="2" />
      <text x="265" y="105" className="text-sm font-mono fill-secondary font-semibold">Vout</text>
      
      {/* Input source */}
      <circle cx="20" cy="80" r="3" fill="hsl(var(--primary))" />
      <text x="5" y="85" textAnchor="end" className="text-sm font-mono fill-primary font-semibold">Vin</text>
    </svg>
  );
}

export function NonInvertingOpAmpDiagram() {
  return (
    <svg width="280" height="200" viewBox="0 0 280 200" className="mx-auto">
      {/* Op-amp triangle */}
      <path
        d="M 100 60 L 100 140 L 180 100 Z"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      
      {/* Input terminals labels */}
      <text x="110" y="80" className="text-xs font-mono fill-muted-foreground">−</text>
      <text x="110" y="125" className="text-xs font-mono fill-muted-foreground">+</text>
      
      {/* Input to non-inverting terminal */}
      <line x1="20" y1="120" x2="100" y2="120" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="20" cy="120" r="3" fill="hsl(var(--primary))" />
      <text x="5" y="125" textAnchor="end" className="text-sm font-mono fill-primary font-semibold">Vin</text>
      
      {/* Feedback network */}
      <line x1="100" y1="80" x2="80" y2="80" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="100" cy="80" r="3" fill="hsl(var(--primary))" />
      <line x1="80" y1="80" x2="80" y2="30" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Feedback resistor Rf */}
      <line x1="80" y1="30" x2="200" y2="30" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <rect
        x="160"
        y="20"
        width="30"
        height="20"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <text x="175" y="15" textAnchor="middle" className="text-xs font-mono fill-accent font-semibold">Rf</text>
      <line x1="200" y1="30" x2="230" y2="30" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="230" y1="30" x2="230" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Ground resistor R1 */}
      <line x1="80" y1="80" x2="80" y2="110" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <rect
        x="70"
        y="110"
        width="20"
        height="30"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <text x="95" y="130" className="text-xs font-mono fill-accent font-semibold">R1</text>
      <line x1="80" y1="140" x2="80" y2="160" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Ground symbol */}
      <line x1="70" y1="160" x2="90" y2="160" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
      <line x1="73" y1="165" x2="87" y2="165" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="76" y1="170" x2="84" y2="170" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
      
      {/* Output */}
      <line x1="180" y1="100" x2="230" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="230" cy="100" r="3" fill="hsl(var(--primary))" />
      <line x1="230" y1="100" x2="260" y2="100" stroke="hsl(var(--secondary))" strokeWidth="2" />
      <text x="265" y="105" className="text-sm font-mono fill-secondary font-semibold">Vout</text>
    </svg>
  );
}

export function VoltageFollowerDiagram() {
  return (
    <svg width="240" height="180" viewBox="0 0 240 180" className="mx-auto">
      {/* Op-amp triangle */}
      <path
        d="M 80 50 L 80 130 L 160 90 Z"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      
      {/* Input terminals labels */}
      <text x="90" y="70" className="text-xs font-mono fill-muted-foreground">−</text>
      <text x="90" y="115" className="text-xs font-mono fill-muted-foreground">+</text>
      
      {/* Input to non-inverting terminal */}
      <line x1="20" y1="110" x2="80" y2="110" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="20" cy="110" r="3" fill="hsl(var(--primary))" />
      <text x="5" y="115" textAnchor="end" className="text-sm font-mono fill-primary font-semibold">Vin</text>
      
      {/* Direct feedback from output to inverting input */}
      <line x1="80" y1="70" x2="60" y2="70" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="60" y1="70" x2="60" y2="20" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="60" y1="20" x2="200" y2="20" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <line x1="200" y1="20" x2="200" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      
      {/* Output */}
      <line x1="160" y1="90" x2="200" y2="90" stroke="hsl(var(--foreground))" strokeWidth="2" />
      <circle cx="200" cy="90" r="3" fill="hsl(var(--primary))" />
      <line x1="200" y1="90" x2="220" y2="90" stroke="hsl(var(--secondary))" strokeWidth="2" />
      <text x="225" y="95" className="text-sm font-mono fill-secondary font-semibold">Vout</text>
      
      {/* Unity gain label */}
      <text x="120" y="140" textAnchor="middle" className="text-xs font-mono fill-muted-foreground italic">
        Unity Gain Buffer
      </text>
    </svg>
  );
}
