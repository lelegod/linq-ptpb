/** Side-view DSB-style modern EMU — lightweight hero watermark (transparent). */
export function DanishEmuHeroSvg({ className = "" }: { className?: string }) {
  const red = "#c8102e";
  const white = "#fdfbf7";
  const glass = "#1e2228";
  const chassis = "#3d4249";
  const rail = "#8a9098";

  return (
    <svg
      className={className}
      viewBox="0 0 1120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {/* track hint */}
      <line
        x1="40"
        y1="118"
        x2="1080"
        y2="118"
        stroke={rail}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* === car 1 — aerodynamic cab === */}
      <g transform="translate(48 28)">
        <path
          d="M0 58 L0 38 Q0 22 28 18 L72 14 Q118 10 132 22 L148 38 L148 58 Z"
          fill={red}
        />
        <path
          d="M18 18 Q52 8 88 12 L128 20 L128 28 L24 32 Q12 32 8 38 Z"
          fill={white}
          opacity="0.95"
        />
        <path
          d="M36 28 L118 24 L118 48 L36 52 Z"
          fill={glass}
          opacity="0.85"
        />
        <path
          d="M38 30 L116 26 L108 38 L42 42 Z"
          fill="#4a6278"
          opacity="0.35"
        />
        <rect x="8" y="44" width="22" height="14" rx="1" fill={white} />
        <rect x="118" y="44" width="22" height="14" rx="1" fill={white} />
        <rect x="36" y="44" width="74" height="14" fill={glass} opacity="0.9" />
        {/* headlight */}
        <circle cx="142" cy="46" r="2.5" fill={white} opacity="0.9" />
        <g transform="translate(24 62)">
          <rect x="0" y="0" width="52" height="10" rx="3" fill={chassis} />
          <circle cx="12" cy="14" r="5" fill={chassis} />
          <circle cx="12" cy="14" r="2.5" fill="#555b63" />
          <circle cx="40" cy="14" r="5" fill={chassis} />
          <circle cx="40" cy="14" r="2.5" fill="#555b63" />
        </g>
      </g>

      {/* gangway */}
      <path
        d="M218 52 Q228 46 238 52 L238 72 Q228 78 218 72 Z"
        fill={glass}
        opacity="0.7"
      />

      {/* === car 2 — middle + pantograph === */}
      <g transform="translate(238 28)">
        <rect x="0" y="18" width="280" height="40" rx="4" fill={red} />
        <rect x="0" y="18" width="280" height="12" rx="4" fill={white} opacity="0.95" />
        <rect x="8" y="32" width="264" height="18" fill={glass} opacity="0.88" />
        <rect x="24" y="44" width="28" height="14" rx="1" fill={white} />
        <rect x="126" y="44" width="28" height="14" rx="1" fill={white} />
        <rect x="228" y="44" width="28" height="14" rx="1" fill={white} />
        {/* pantograph */}
        <path
          d="M140 18 L148 4 L156 18"
          stroke={chassis}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line x1="148" y1="4" x2="148" y2="0" stroke={chassis} strokeWidth="1.5" />
        <g transform="translate(48 62)">
          <rect x="0" y="0" width="184" height="10" rx="3" fill={chassis} />
          <circle cx="46" cy="14" r="5" fill={chassis} />
          <circle cx="46" cy="14" r="2.5" fill="#555b63" />
          <circle cx="138" cy="14" r="5" fill={chassis} />
          <circle cx="138" cy="14" r="2.5" fill="#555b63" />
        </g>
      </g>

      {/* gangway */}
      <path
        d="M526 52 Q536 46 546 52 L546 72 Q536 78 526 72 Z"
        fill={glass}
        opacity="0.7"
      />

      {/* === car 3 — trailing === */}
      <g transform="translate(546 28)">
        <rect x="0" y="18" width="260" height="40" rx="4" fill={red} />
        <rect x="0" y="18" width="260" height="12" rx="4" fill={white} opacity="0.95" />
        <rect x="8" y="32" width="244" height="18" fill={glass} opacity="0.88" />
        <rect x="20" y="44" width="28" height="14" rx="1" fill={white} />
        <rect x="116" y="44" width="28" height="14" rx="1" fill={white} />
        <rect x="212" y="44" width="28" height="14" rx="1" fill={white} />
        <path
          d="M248 38 L260 32 L260 58 L248 58 Z"
          fill={red}
          opacity="0.95"
        />
        <g transform="translate(44 62)">
          <rect x="0" y="0" width="172" height="10" rx="3" fill={chassis} />
          <circle cx="43" cy="14" r="5" fill={chassis} />
          <circle cx="43" cy="14" r="2.5" fill="#555b63" />
          <circle cx="129" cy="14" r="5" fill={chassis} />
          <circle cx="129" cy="14" r="2.5" fill="#555b63" />
        </g>
      </g>

      {/* === car 4 — short end car (S-tog / regional consist) === */}
      <path
        d="M814 52 Q824 46 834 52 L834 72 Q824 78 814 72 Z"
        fill={glass}
        opacity="0.7"
      />
      <g transform="translate(834 28)">
        <path
          d="M0 18 L200 18 Q220 18 228 28 L236 38 L236 58 L0 58 Z"
          fill={red}
        />
        <rect x="0" y="18" width="200" height="12" rx="4" fill={white} opacity="0.95" />
        <rect x="8" y="32" width="212" height="18" fill={glass} opacity="0.88" />
        <rect x="16" y="44" width="28" height="14" rx="1" fill={white} />
        <rect x="100" y="44" width="28" height="14" rx="1" fill={white} />
        <path
          d="M220 28 Q232 22 248 26 L248 50 Q232 54 220 48 Z"
          fill={glass}
          opacity="0.75"
        />
        <g transform="translate(36 62)">
          <rect x="0" y="0" width="140" height="10" rx="3" fill={chassis} />
          <circle cx="35" cy="14" r="5" fill={chassis} />
          <circle cx="35" cy="14" r="2.5" fill="#555b63" />
          <circle cx="105" cy="14" r="5" fill={chassis} />
          <circle cx="105" cy="14" r="2.5" fill="#555b63" />
        </g>
      </g>
    </svg>
  );
}
