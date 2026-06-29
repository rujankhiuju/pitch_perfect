import React from 'react';

interface TunerGaugeProps {
  cents: number | null;
}

export default function TunerGauge({ cents }: TunerGaugeProps) {
  const c = cents ?? 0;
  const clampedCents = Math.max(-50, Math.min(50, c));
  // Needle angle: -50 cents = -60 deg, +50 cents = +60 deg
  const angle = (clampedCents / 50) * 60;
  
  const isInTune = cents !== null && Math.abs(cents) <= 10;
  const isPlaying = cents !== null;

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[2/1] overflow-hidden">
      <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
        {/* Background Arc */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="var(--color-card-border)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Tick Marks */}
        {[-50, -25, 0, 25, 50].map((tick) => {
          const tickAngle = (tick / 50) * 60;
          const rad = (tickAngle - 90) * (Math.PI / 180);
          const isCenter = tick === 0;
          
          const innerR = isCenter ? 65 : 70;
          const outerR = 85;
          
          const x1 = 100 + innerR * Math.cos(rad);
          const y1 = 90 + innerR * Math.sin(rad);
          const x2 = 100 + outerR * Math.cos(rad);
          const y2 = 90 + outerR * Math.sin(rad);
          
          let strokeColor = "var(--color-muted-foreground)";
          if (isCenter && isInTune) {
            strokeColor = "var(--color-success)";
          }
          
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={isCenter ? 4 : 2}
              strokeLinecap="round"
              className={isCenter && isInTune ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" : ""}
            />
          );
        })}

        {/* Center Zone Highlight */}
        <path
          d="M 85 90 A 80 80 0 0 1 115 90"
          fill="none"
          stroke={isInTune ? "var(--color-success)" : "rgba(255,255,255,0.05)"}
          strokeWidth="10"
          className="transition-colors duration-200"
        />

        {/* Needle Container (Rotates) */}
        {isPlaying && (
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: '100px 90px',
              transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)'
            }}
          >
            {/* Needle */}
            <line
              x1="100"
              y1="90"
              x2="100"
              y2="20"
              stroke={isInTune ? "var(--color-success)" : (Math.abs(clampedCents) > 30 ? "var(--color-destructive)" : "var(--color-warning)")}
              strokeWidth="4"
              strokeLinecap="round"
              className={isInTune ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" : ""}
            />
            {/* Center Pivot */}
            <circle cx="100" cy="90" r="6" fill="var(--color-card)" stroke={isInTune ? "var(--color-success)" : "var(--color-border)"} strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}
