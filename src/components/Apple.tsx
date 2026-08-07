import type { CSSProperties } from 'react';

interface Props {
  value: number;
  size?: number; // px
  hueShift?: number; // 0..360 for slight variation
  colorBlind?: boolean;
}

/**
 * SVG apple with stem + leaf. Designed to scale crisply at any cell size.
 * The fruit body has a radial highlight that reads like a 3D apple.
 */
export function Apple({ value, size = 32, hueShift = 0, colorBlind = false }: Props) {
  // In color-blind mode, hue is suppressed and a digit glyph ensures the value is still readable
  // independently of color.
  const hue = colorBlind
    ? 0
    : (340 + hueShift + (value * 7) % 24) % 360;
  const bodyFrom = colorBlind ? '#c0c8d2' : `hsl(${hue}, 78%, 56%)`;
  const bodyTo = colorBlind ? '#6e7682' : `hsl(${hue}, 82%, 38%)`;
  const highlight = colorBlind ? 'rgba(255,255,255,0.85)' : `hsla(${hue}, 100%, 88%, 0.9)`;
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ display: 'block' }}
      aria-label={`apple-${value}`}
    >
      <defs>
        <radialGradient id={`body-${value}-${hueShift}`} cx="35%" cy="32%" r="70%">
          <stop offset="0%" stopColor={highlight} stopOpacity="0.95" />
          <stop offset="20%" stopColor={bodyFrom} />
          <stop offset="100%" stopColor={bodyTo} />
        </radialGradient>
        <linearGradient id={`leaf-${value}-${hueShift}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#86c46a" />
          <stop offset="100%" stopColor="#3e8b2c" />
        </linearGradient>
      </defs>
      {/* leaf */}
      <path
        d="M 60 14 Q 78 8 84 22 Q 76 30 60 22 Z"
        fill={`url(#leaf-${value}-${hueShift})`}
        stroke="#2f6b1e"
        strokeWidth="1.4"
      />
      {/* stem */}
      <rect x="55" y="18" width="4" height="9" rx="1.2" fill="#5a3a1a" />
      {/* apple body */}
      <path
        d="M 50 26
           C 22 26, 14 50, 22 72
           C 30 92, 70 92, 78 72
           C 86 50, 78 26, 50 26 Z"
        fill={`url(#body-${value}-${hueShift})`}
        stroke="#8b1a1a"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      {/* highlight */}
      <ellipse cx="36" cy="44" rx="9" ry="6" fill="white" fillOpacity="0.35" />
    </svg>
  );
}

export const appleContainerStyle: CSSProperties = {
  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))',
};