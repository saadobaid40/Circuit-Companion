import { colorDatabase, ResistorColor } from '@/lib/resistor-color-code';

interface ResistorSVGProps {
  bands: ResistorColor[];
  bandCount: 4 | 5 | 6;
  className?: string;
}

export function ResistorSVG({ bands, bandCount, className = '' }: ResistorSVGProps) {
  const width = 400;
  const height = 150;
  const bodyWidth = 280;
  const bodyHeight = 60;
  const bodyX = 60;
  const bodyY = (height - bodyHeight) / 2;
  const leadLength = 50;

  // Band positioning based on count
  const bandWidth = 12;
  const bandSpacing = bandCount === 6 ? 35 : 45;
  const startX = bodyX + 25;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d4c5a0" />
          <stop offset="50%" stopColor="#e8dcc0" />
          <stop offset="100%" stopColor="#c4b5a0" />
        </linearGradient>
        <linearGradient id="leadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b8b8b8" />
          <stop offset="50%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#a0a0a0" />
        </linearGradient>
        <filter id="shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Left lead */}
      <line
        x1="10"
        y1={height / 2}
        x2={bodyX}
        y2={height / 2}
        stroke="url(#leadGradient)"
        strokeWidth="4"
        filter="url(#shadow)"
      />

      {/* Right lead */}
      <line
        x1={bodyX + bodyWidth}
        y1={height / 2}
        x2={width - 10}
        y2={height / 2}
        stroke="url(#leadGradient)"
        strokeWidth="4"
        filter="url(#shadow)"
      />

      {/* Resistor body */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        rx="8"
        fill="url(#bodyGradient)"
        filter="url(#shadow)"
      />

      {/* Color bands */}
      {bands.slice(0, bandCount).map((color, index) => {
        const isLastBand = index === bandCount - 1;
        const x = isLastBand 
          ? bodyX + bodyWidth - 35 
          : startX + index * bandSpacing;

        return (
          <g key={index}>
            <rect
              x={x}
              y={bodyY - 2}
              width={bandWidth}
              height={bodyHeight + 4}
              fill={colorDatabase[color].hex}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="0.5"
            />
            {/* Highlight for depth */}
            <rect
              x={x + 1}
              y={bodyY - 1}
              width={bandWidth - 2}
              height={bodyHeight / 3}
              fill="rgba(255,255,255,0.15)"
              pointerEvents="none"
            />
          </g>
        );
      })}
    </svg>
  );
}
