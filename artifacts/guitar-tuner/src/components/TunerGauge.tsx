import React from 'react';

interface TunerGaugeProps {
  cents: number | null;
}

export default function TunerGauge({ cents }: TunerGaugeProps) {
  const c = cents ?? 0;
  const clampedCents = Math.max(-50, Math.min(50, c));
  const angle = (clampedCents / 50) * 60;

  const isInTune = cents !== null && Math.abs(cents) <= 10;
  const isFlat = cents !== null && cents < -10;
  const isSharp = cents !== null && cents > 10;
  const isPlaying = cents !== null;

  const absCents = Math.abs(clampedCents);
  const needleColor = isInTune
    ? 'var(--color-success)'
    : absCents > 30
    ? 'var(--color-destructive)'
    : 'var(--color-warning)';

  /* Color-grade the arc: green center (0-10¢), amber mid (10-30¢), red outer (30-50¢) */
  const arcColor = !isPlaying
    ? 'var(--color-card-border)'
    : absCents <= 10
    ? 'var(--color-success)'
    : absCents <= 30
    ? 'var(--color-warning)'
    : 'var(--color-destructive)';

  return (
    <div className="relative w-full max-w-md mx-auto flex items-center justify-center gap-3">
      {/* Flat indicator */}
      <div
        data-testid="indicator-flat"
        className="flex flex-col items-center gap-1 w-12 shrink-0 transition-all duration-200"
        style={{ opacity: isPlaying ? 1 : 0.25 }}
      >
        <span
          className="text-4xl font-black leading-none transition-all duration-200 select-none"
          style={{
            color: isFlat ? 'var(--color-destructive)' : 'var(--color-muted-foreground)',
            textShadow: isFlat ? '0 0 16px rgba(239,68,68,0.7)' : 'none',
            transform: isFlat ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          −
        </span>
        <span
          className="text-xs font-semibold tracking-widest uppercase transition-colors duration-200"
          style={{ color: isFlat ? 'var(--color-destructive)' : 'var(--color-muted-foreground)' }}
        >
          Flat
        </span>
      </div>

      {/* Gauge SVG */}
      <div className="relative flex-1 aspect-[2/1] overflow-hidden min-w-0">
        <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
          {/* Background Arc — color-graded by zone */}
          <path
            d="M 20 90 A 80 80 0 0 1 60 90"
            fill="none"
            stroke={arcColor}
            strokeWidth="6"
            strokeLinecap="round"
            className="transition-colors duration-200"
            opacity={isPlaying ? 0.5 : 0.2}
          />
          <path
            d="M 60 90 A 80 80 0 0 1 140 90"
            fill="none"
            stroke={arcColor}
            strokeWidth="6"
            strokeLinecap="round"
            className="transition-colors duration-200"
            opacity={isPlaying ? 0.35 : 0.15}
          />
          <path
            d="M 140 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke={arcColor}
            strokeWidth="6"
            strokeLinecap="round"
            className="transition-colors duration-200"
            opacity={isPlaying ? 0.5 : 0.2}
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
            let strokeColor = 'var(--color-muted-foreground)';
            if (isCenter && isInTune) strokeColor = 'var(--color-success)';
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={strokeColor}
                strokeWidth={isCenter ? 4 : 2}
                strokeLinecap="round"
                className={isCenter && isInTune ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' : ''}
              />
            );
          })}

          {/* Needle */}
          {isPlaying && (
            <g
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: '100px 90px',
                transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <line
                x1="100" y1="90" x2="100" y2="20"
                stroke={needleColor}
                strokeWidth="4"
                strokeLinecap="round"
                className={isInTune ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' : ''}
              />
              <circle
                cx="100" cy="90" r="6"
                fill="var(--color-card)"
                stroke={isInTune ? 'var(--color-success)' : 'var(--color-border)'}
                strokeWidth="2"
              />
            </g>
          )}

          {/* Idle pivot dot */}
          {!isPlaying && (
            <circle cx="100" cy="90" r="5" fill="var(--color-muted-foreground)" opacity="0.3" />
          )}
        </svg>
      </div>

      {/* Sharp indicator */}
      <div
        data-testid="indicator-sharp"
        className="flex flex-col items-center gap-1 w-12 shrink-0 transition-all duration-200"
        style={{ opacity: isPlaying ? 1 : 0.25 }}
      >
        <span
          className="text-4xl font-black leading-none transition-all duration-200 select-none"
          style={{
            color: isSharp ? 'var(--color-destructive)' : 'var(--color-muted-foreground)',
            textShadow: isSharp ? '0 0 16px rgba(239,68,68,0.7)' : 'none',
            transform: isSharp ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          +
        </span>
        <span
          className="text-xs font-semibold tracking-widest uppercase transition-colors duration-200"
          style={{ color: isSharp ? 'var(--color-destructive)' : 'var(--color-muted-foreground)' }}
        >
          Sharp
        </span>
      </div>
    </div>
  );
}
