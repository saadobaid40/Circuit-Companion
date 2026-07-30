interface SeriesCircuitProps {
  count: number;
}

export function SeriesCircuit({ count }: SeriesCircuitProps) {
  const width = 600;
  const height = 150;
  const resistorWidth = 60;
  const resistorHeight = 20;
  const spacing = 80;
  const startX = (width - (count * spacing - 20)) / 2;
  const centerY = height / 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {/* Left terminal */}
      <circle cx={startX - 40} cy={centerY} r="4" fill="hsl(var(--primary))" />
      <line
        x1={startX - 36}
        y1={centerY}
        x2={startX}
        y2={centerY}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />

      {/* Resistors and connections */}
      {Array.from({ length: count }).map((_, i) => {
        const x = startX + i * spacing;
        return (
          <g key={i}>
            {/* Resistor body */}
            <rect
              x={x}
              y={centerY - resistorHeight / 2}
              width={resistorWidth}
              height={resistorHeight}
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
            />
            {/* Zigzag inside */}
            <path
              d={`M ${x + 5} ${centerY} L ${x + 15} ${centerY - 8} L ${x + 25} ${centerY + 8} L ${x + 35} ${centerY - 8} L ${x + 45} ${centerY + 8} L ${x + 55} ${centerY}`}
              stroke="hsl(var(--foreground))"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Label */}
            <text
              x={x + resistorWidth / 2}
              y={centerY - 20}
              textAnchor="middle"
              className="text-xs font-mono fill-muted-foreground"
            >
              R{i + 1}
            </text>
            {/* Connection wire to next resistor */}
            {i < count - 1 && (
              <line
                x1={x + resistorWidth}
                y1={centerY}
                x2={x + spacing}
                y2={centerY}
                stroke="hsl(var(--foreground))"
                strokeWidth="2"
              />
            )}
          </g>
        );
      })}

      {/* Right terminal */}
      <line
        x1={startX + (count - 1) * spacing + resistorWidth}
        y1={centerY}
        x2={startX + (count - 1) * spacing + resistorWidth + 36}
        y2={centerY}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <circle
        cx={startX + (count - 1) * spacing + resistorWidth + 40}
        cy={centerY}
        r="4"
        fill="hsl(var(--primary))"
      />
    </svg>
  );
}

interface ParallelCircuitProps {
  count: number;
}

export function ParallelCircuit({ count }: ParallelCircuitProps) {
  const width = 600;
  const height = Math.max(200, count * 60);
  const resistorWidth = 60;
  const resistorHeight = 20;
  const leftX = 150;
  const rightX = 450;
  const spacing = (height - 80) / Math.max(count - 1, 1);
  const startY = 40 + (count === 1 ? (height - 80) / 2 : 0);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {/* Left terminal and rail */}
      <circle cx={50} cy={height / 2} r="4" fill="hsl(var(--primary))" />
      <line
        x1={54}
        y1={height / 2}
        x2={leftX}
        y2={height / 2}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <line
        x1={leftX}
        y1={startY}
        x2={leftX}
        y2={startY + (count - 1) * spacing}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />

      {/* Right rail */}
      <line
        x1={rightX}
        y1={startY}
        x2={rightX}
        y2={startY + (count - 1) * spacing}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <line
        x1={rightX}
        y1={height / 2}
        x2={546}
        y2={height / 2}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <circle cx={550} cy={height / 2} r="4" fill="hsl(var(--primary))" />

      {/* Resistors */}
      {Array.from({ length: count }).map((_, i) => {
        const y = startY + i * spacing;
        const centerX = (leftX + rightX) / 2;
        return (
          <g key={i}>
            {/* Connection from left rail */}
            <line
              x1={leftX}
              y1={y}
              x2={centerX - resistorWidth / 2}
              y2={y}
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
            />
            {/* Resistor body */}
            <rect
              x={centerX - resistorWidth / 2}
              y={y - resistorHeight / 2}
              width={resistorWidth}
              height={resistorHeight}
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
            />
            {/* Zigzag */}
            <path
              d={`M ${centerX - resistorWidth / 2 + 5} ${y} L ${centerX - resistorWidth / 2 + 15} ${y - 8} L ${centerX - resistorWidth / 2 + 25} ${y + 8} L ${centerX - resistorWidth / 2 + 35} ${y - 8} L ${centerX - resistorWidth / 2 + 45} ${y + 8} L ${centerX - resistorWidth / 2 + 55} ${y}`}
              stroke="hsl(var(--foreground))"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Label */}
            <text
              x={centerX}
              y={y - 20}
              textAnchor="middle"
              className="text-xs font-mono fill-muted-foreground"
            >
              R{i + 1}
            </text>
            {/* Connection to right rail */}
            <line
              x1={centerX + resistorWidth / 2}
              y1={y}
              x2={rightX}
              y2={y}
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
            />
          </g>
        );
      })}
    </svg>
  );
}

interface VoltageDividerDiagramProps {
  Vin: string;
  Vout: string;
  R1: string;
  R2: string;
}

export function VoltageDividerDiagram({ Vin, Vout, R1, R2 }: VoltageDividerDiagramProps) {
  const width = 400;
  const height = 400;
  const resistorWidth = 60;
  const resistorHeight = 20;
  const centerX = width / 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {/* Voltage source on left */}
      <g>
        <circle cx={80} cy={200} r="30" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        <text x={80} y={205} textAnchor="middle" className="text-sm font-mono fill-primary font-semibold">
          {Vin}
        </text>
        {/* Positive terminal */}
        <line x1={110} y1={200} x2={centerX - 50} y2={200} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1={centerX - 50} y1={200} x2={centerX - 50} y2={80} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1={centerX - 50} y1={80} x2={centerX - resistorWidth / 2} y2={80} stroke="hsl(var(--foreground))" strokeWidth="2" />
      </g>

      {/* R1 (top resistor) */}
      <g>
        <rect
          x={centerX - resistorWidth / 2}
          y={80 - resistorHeight / 2}
          width={resistorWidth}
          height={resistorHeight}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
        />
        <path
          d={`M ${centerX - 25} 80 L ${centerX - 15} 72 L ${centerX - 5} 88 L ${centerX + 5} 72 L ${centerX + 15} 88 L ${centerX + 25} 80`}
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          fill="none"
        />
        <text x={centerX - resistorWidth / 2 - 10} y={85} textAnchor="end" className="text-sm font-mono fill-accent font-semibold">
          {R1}
        </text>
      </g>

      {/* Middle node (Vout tap) */}
      <g>
        <line x1={centerX + resistorWidth / 2} y1={80} x2={centerX} y2={80} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1={centerX} y1={80} x2={centerX} y2={200} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <circle cx={centerX} cy={200} r="4" fill="hsl(var(--primary))" />
        {/* Vout arrow */}
        <line x1={centerX} y1={200} x2={centerX + 80} y2={200} stroke="hsl(var(--secondary))" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x={centerX + 90} y={205} textAnchor="start" className="text-sm font-mono fill-secondary font-semibold">
          {Vout}
        </text>
        <line x1={centerX} y1={200} x2={centerX} y2={320} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1={centerX} y1={320} x2={centerX - resistorWidth / 2} y2={320} stroke="hsl(var(--foreground))" strokeWidth="2" />
      </g>

      {/* R2 (bottom resistor) */}
      <g>
        <rect
          x={centerX - resistorWidth / 2}
          y={320 - resistorHeight / 2}
          width={resistorWidth}
          height={resistorHeight}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
        />
        <path
          d={`M ${centerX - 25} 320 L ${centerX - 15} 312 L ${centerX - 5} 328 L ${centerX + 5} 312 L ${centerX + 15} 328 L ${centerX + 25} 320`}
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          fill="none"
        />
        <text x={centerX - resistorWidth / 2 - 10} y={325} textAnchor="end" className="text-sm font-mono fill-accent font-semibold">
          {R2}
        </text>
      </g>

      {/* Ground */}
      <g>
        <line x1={centerX + resistorWidth / 2} y1={320} x2={centerX + 50} y2={320} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1={centerX + 50} y1={320} x2={centerX + 50} y2={360} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1={centerX + 30} y1={360} x2={centerX + 70} y2={360} stroke="hsl(var(--foreground))" strokeWidth="3" />
        <line x1={centerX + 35} y1={366} x2={centerX + 65} y2={366} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1={centerX + 40} y1={372} x2={centerX + 60} y2={372} stroke="hsl(var(--foreground))" strokeWidth="1.5" />
        {/* Return to source */}
        <line x1={centerX + 50} y1={360} x2={40} y2={360} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1={40} y1={360} x2={40} y2={200} stroke="hsl(var(--foreground))" strokeWidth="2" />
        <line x1={40} y1={200} x2={50} y2={200} stroke="hsl(var(--foreground))" strokeWidth="2" />
      </g>

      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="hsl(var(--secondary))" />
        </marker>
      </defs>
    </svg>
  );
}
