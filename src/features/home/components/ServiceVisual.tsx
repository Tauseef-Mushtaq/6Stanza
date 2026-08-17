import type { ServiceItem } from "@/features/home/data/services";

/**
 * A consistent abstract visual language for the services chapter —
 * grids, nodes, and technical line-work rather than stock imagery, per
 * spec §11. One lightweight inline SVG per service kind; no per-item
 * Three.js scenes (keeps the pinned chapter cheap to render).
 */
export function ServiceVisual({ kind }: { kind: ServiceItem["visual"] }) {
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)]"
      style={{ background: "var(--stz-navy-950)", border: "1px solid var(--color-border-inverse)" }}
    >
      <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`svc-grad-${kind}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f63ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4a83ff" stopOpacity="0.15" />
          </linearGradient>
          <pattern id={`svc-grid-${kind}`} width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(247,249,252,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#svc-grid-${kind})`} />
        {renderMark(kind)}
      </svg>
    </div>
  );
}

function renderMark(kind: ServiceItem["visual"]) {
  const stroke = "url(#svc-grad-web)";
  switch (kind) {
    case "web":
      return (
        <g fill="none" stroke="#4a83ff" strokeWidth="1.5">
          <rect x="90" y="70" width="220" height="160" rx="6" stroke="#8fb0ff" />
          <line x1="90" y1="102" x2="310" y2="102" />
          <circle cx="108" cy="86" r="4" fill="#1f63ff" stroke="none" />
          <circle cx="124" cy="86" r="4" fill="#4a83ff" stroke="none" />
          <rect x="112" y="126" width="90" height="10" fill="#1f63ff" stroke="none" opacity="0.7" />
          <rect x="112" y="146" width="150" height="6" fill="#8fb0ff" stroke="none" opacity="0.4" />
          <rect x="112" y="160" width="120" height="6" fill="#8fb0ff" stroke="none" opacity="0.4" />
        </g>
      );
    case "cloud":
      return (
        <g fill="none" stroke="#4a83ff" strokeWidth="1.5">
          <path
            d="M140 190a38 38 0 0 1-6-75 50 50 0 0 1 96-18 40 40 0 0 1 40 40 34 34 0 0 1-6 53z"
            stroke="#8fb0ff"
          />
          <circle cx="150" cy="150" r="3" fill="#1f63ff" stroke="none" />
          <circle cx="200" cy="150" r="3" fill="#1f63ff" stroke="none" />
          <circle cx="250" cy="150" r="3" fill="#1f63ff" stroke="none" />
          <line x1="150" y1="150" x2="200" y2="150" opacity="0.5" />
          <line x1="200" y1="150" x2="250" y2="150" opacity="0.5" />
        </g>
      );
    case "devops":
      return (
        <g fill="none" stroke="#4a83ff" strokeWidth="1.5">
          <circle cx="200" cy="150" r="70" stroke="#8fb0ff" strokeDasharray="6 8" />
          <circle cx="200" cy="80" r="6" fill="#1f63ff" stroke="none" />
          <circle cx="264" cy="115" r="6" fill="#1f63ff" stroke="none" />
          <circle cx="264" cy="185" r="6" fill="#1f63ff" stroke="none" />
          <circle cx="200" cy="220" r="6" fill="#1f63ff" stroke="none" />
          <circle cx="136" cy="185" r="6" fill="#1f63ff" stroke="none" />
          <circle cx="136" cy="115" r="6" fill="#1f63ff" stroke="none" />
        </g>
      );
    case "security":
      return (
        <g fill="none" stroke="#4a83ff" strokeWidth="1.5">
          <path d="M200 70 L260 95 V160 C260 200 235 222 200 235 C165 222 140 200 140 160 V95 Z" stroke="#8fb0ff" />
          <path d="M178 158 l16 16 30 -34" stroke="#1f63ff" strokeWidth="2.5" />
        </g>
      );
    case "network":
      return (
        <g fill="none" stroke="#4a83ff" strokeWidth="1.5">
          <line x1="200" y1="90" x2="130" y2="180" opacity="0.5" />
          <line x1="200" y1="90" x2="270" y2="180" opacity="0.5" />
          <line x1="130" y1="180" x2="270" y2="180" opacity="0.5" />
          <line x1="200" y1="90" x2="200" y2="200" opacity="0.3" />
          <circle cx="200" cy="90" r="8" fill="#1f63ff" stroke="none" />
          <circle cx="130" cy="180" r="8" fill="#4a83ff" stroke="none" />
          <circle cx="270" cy="180" r="8" fill="#4a83ff" stroke="none" />
          <circle cx="200" cy="200" r="5" fill="#8fb0ff" stroke="none" />
        </g>
      );
    case "marketing":
      return (
        <g fill="none" stroke="#4a83ff" strokeWidth="1.5">
          <polyline points="120,200 165,160 205,180 255,110 285,125" stroke="#8fb0ff" strokeWidth="2" />
          <circle cx="285" cy="125" r="5" fill="#1f63ff" stroke="none" />
          <line x1="120" y1="215" x2="290" y2="215" opacity="0.3" />
        </g>
      );
    case "video":
      return (
        <g fill="none" stroke="#4a83ff" strokeWidth="1.5">
          <rect x="120" y="100" width="160" height="100" rx="4" stroke="#8fb0ff" />
          <polygon points="185,130 185,170 220,150" fill="#1f63ff" stroke="none" />
          <line x1="120" y1="120" x2="280" y2="120" opacity="0.25" />
        </g>
      );
    case "seo":
      return (
        <g fill="none" stroke="#4a83ff" strokeWidth="1.5">
          <circle cx="185" cy="145" r="45" stroke="#8fb0ff" />
          <line x1="217" y1="177" x2="260" y2="220" strokeWidth="3" />
          <line x1="160" y1="145" x2="210" y2="145" opacity="0.4" />
          <line x1="185" y1="120" x2="185" y2="170" opacity="0.4" />
        </g>
      );
    default:
      return <circle cx="200" cy="150" r="60" fill="none" stroke={stroke} />;
  }
}
