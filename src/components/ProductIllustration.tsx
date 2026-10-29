import type { Product } from "@/lib/products/schema";

/** Clean vector stand-ins shown until real product photos are added. */
export function ProductIllustration({ kind, className }: { kind: NonNullable<Product["illustration"]>; className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={kind === "timer" ? "#d4eaf6" : "#d7ecda"} />
          <stop offset="1" stopColor={kind === "timer" ? "#edf6fb" : "#eef7ef"} />
        </linearGradient>
      </defs>
      <rect width="240" height="200" fill={`url(#bg-${kind})`} />
      {kind === "timer" ? <Timer /> : <Kit large={kind === "kit-large"} />}
    </svg>
  );
}

function Timer() {
  return (
    <g>
      {/* tap */}
      <rect x="96" y="22" width="48" height="16" rx="6" fill="#9aa5a0" />
      <rect x="112" y="10" width="16" height="16" rx="4" fill="#b8c1bc" />
      {/* timer body */}
      <rect x="78" y="38" width="84" height="108" rx="18" fill="#ffffff" stroke="#1f6f9c" strokeWidth="3" />
      <rect x="92" y="52" width="56" height="30" rx="6" fill="#17251c" />
      <text x="120" y="73" textAnchor="middle" fontSize="15" fontFamily="monospace" fill="#7fbf8b">06:30</text>
      <circle cx="102" cy="100" r="7" fill="#2f8a4a" />
      <circle cx="120" cy="100" r="7" fill="#4ba3d3" />
      <circle cx="138" cy="100" r="7" fill="#4ba3d3" />
      <rect x="96" y="118" width="48" height="8" rx="4" fill="#d7ecda" />
      {/* outlet + drip */}
      <rect x="108" y="146" width="24" height="16" rx="4" fill="#9aa5a0" />
      <path d="M120 168c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12z" fill="#4ba3d3" className="animate-drip" />
    </g>
  );
}

function Kit({ large }: { large: boolean }) {
  const pots = large ? [104, 152, 200] : [96, 150, 204];
  return (
    <g>
      {/* reservoir */}
      <rect x="14" y={large ? 70 : 88} width={large ? 56 : 46} height={large ? 100 : 82} rx="8" fill="#ffffff" stroke="#1f6f9c" strokeWidth="3" />
      <rect x="17" y={large ? 100 : 112} width={large ? 50 : 40} height={large ? 67 : 55} rx="5" fill="#4ba3d3" opacity="0.55" />
      {/* control unit */}
      <rect x={large ? 22 : 18} y={large ? 46 : 64} width={large ? 40 : 38} height="26" rx="6" fill="#17251c" />
      <circle cx={large ? 34 : 30} cy={large ? 59 : 77} r="4" fill="#7fbf8b" />
      <rect x={large ? 42 : 38} y={large ? 56 : 74} width="12" height="6" rx="2" fill="#4ba3d3" />
      {/* tubing */}
      <path
        d={`M${large ? 62 : 56} ${large ? 54 : 72} H226`}
        stroke="#23723b"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {pots.map((x) => (
        <g key={x}>
          <path d={`M${x} ${large ? 54 : 72} V112`} stroke="#23723b" strokeWidth="2" fill="none" />
          <path d={`M${x} 118c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8z`} fill="#4ba3d3" className="animate-drip" />
          {/* pot */}
          <path d={`M${x - 20} 140 h40 l-5 40 h-30 z`} fill="#c97a4a" />
          <rect x={x - 22} y="134" width="44" height="9" rx="3" fill="#b5673a" />
          {/* plant */}
          <path d={`M${x} 134 c-2-14-14-18-20-16 c4 10 12 14 20 16z`} fill="#2f8a4a" />
          <path d={`M${x} 134 c2-16 14-22 20-20 c-4 12-12 18-20 20z`} fill="#7fbf8b" />
          <path d={`M${x} 134 v-22`} stroke="#23723b" strokeWidth="2" />
        </g>
      ))}
    </g>
  );
}
