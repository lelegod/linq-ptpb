import { copy } from "@/content/copy";
import { REJSY_AGENT_E164 } from "@/lib/env";

type Tile = {
  char: string;
  label: string;
  bg: string;
  fg?: string;
  motif: "plus" | "ticket" | "metro" | "clock" | "pin" | "stog" | "train" | "platform" | "dash";
};

/** Visual tiles for +16695776525 — Tomo collage energy, transit motifs. */
const TILES: Tile[] = [
  { char: "+", label: "plus", bg: "#7eb8d8", motif: "plus" },
  { char: "1", label: "platform", bg: "#1a1a1c", fg: "#fdfbf7", motif: "platform" },
  { char: "6", label: "ticket", bg: "#f5f0e6", motif: "ticket" },
  { char: "6", label: "s-tog", bg: "#c8102e", fg: "#fff", motif: "stog" },
  { char: "9", label: "metro", bg: "#e8e4dc", motif: "metro" },
  { char: "5", label: "train", bg: "#2c3e50", fg: "#fff", motif: "train" },
  { char: "7", label: "clock", bg: "#f5d76e", motif: "clock" },
  { char: "7", label: "pin", bg: "#dceaf4", motif: "pin" },
  { char: "6", label: "ticket", bg: "#fff8e8", motif: "ticket" },
  { char: "5", label: "metro", bg: "#1b8a4b", fg: "#fff", motif: "metro" },
  { char: "2", label: "train", bg: "#e9e9eb", motif: "train" },
  { char: "5", label: "platform", bg: "#0b0b0c", fg: "#fdfbf7", motif: "platform" },
];

function Motif({ motif, fg }: { motif: Tile["motif"]; fg: string }) {
  const stroke = fg;
  switch (motif) {
    case "plus":
      return (
        <g stroke={stroke} strokeWidth="2.2" strokeLinecap="round">
          <path d="M14 8v12M8 14h12" />
        </g>
      );
    case "ticket":
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.4">
          <path d="M6 9h16v10H6z" />
          <path d="M10 9v10M14 12h5" strokeDasharray="2 2" />
        </g>
      );
    case "metro":
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.5">
          <circle cx="14" cy="14" r="7" />
          <path d="M10 14h8M14 10v8" />
        </g>
      );
    case "clock":
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.5">
          <circle cx="14" cy="14" r="7" />
          <path d="M14 9v5l3 2" strokeLinecap="round" />
        </g>
      );
    case "pin":
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.5">
          <path d="M14 6c3 0 5.5 2.2 5.5 5.2 0 3.6-5.5 9.3-5.5 9.3S8.5 14.8 8.5 11.2C8.5 8.2 11 6 14 6Z" />
          <circle cx="14" cy="11" r="1.8" fill={stroke} stroke="none" />
        </g>
      );
    case "stog":
      return (
        <text
          x="14"
          y="17"
          textAnchor="middle"
          fill={stroke}
          fontSize="9"
          fontWeight="700"
          fontFamily="var(--font-sans)"
        >
          S
        </text>
      );
    case "train":
      return (
        <g fill={stroke}>
          <rect x="7" y="8" width="14" height="9" rx="1.5" opacity="0.9" />
          <rect x="9" y="10" width="3" height="3" rx="0.4" fill="var(--sky)" />
          <rect x="14" y="10" width="3" height="3" rx="0.4" fill="var(--sky)" />
          <circle cx="10" cy="19" r="1.4" />
          <circle cx="18" cy="19" r="1.4" />
        </g>
      );
    case "platform":
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.4">
          <path d="M6 18h16M8 18V10h12v8" />
          <path d="M11 10V7h6v3" />
        </g>
      );
    case "dash":
      return (
        <rect x="8" y="12" width="12" height="3" rx="1" fill={stroke} />
      );
    default:
      return null;
  }
}

function TileCard({ tile }: { tile: Tile }) {
  const fg = tile.fg ?? "#0b0b0c";
  return (
    <span
      className="relative flex h-[52px] w-[36px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[10px] sm:h-[64px] sm:w-[44px] sm:rounded-[12px] md:h-[72px] md:w-[50px]"
      style={{ background: tile.bg, color: fg }}
      title={tile.label}
    >
      <svg
        className="absolute inset-0 opacity-[0.22]"
        viewBox="0 0 28 28"
        aria-hidden
      >
        <Motif motif={tile.motif} fg={fg} />
      </svg>
      <span
        className="relative font-display text-[22px] font-semibold leading-none tracking-tight sm:text-[28px] md:text-[32px]"
        style={{ color: fg }}
      >
        {tile.char}
      </span>
    </span>
  );
}

export function TransitCollage({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="group mx-auto flex max-w-full flex-col items-center gap-3"
      aria-label={`Text Rejsy at ${copy.agentDisplay}`}
    >
      <span className="flex items-end justify-center gap-1 overflow-x-auto px-1 pb-1 sm:gap-1.5">
        {TILES.map((tile, i) => (
          <TileCard key={`${tile.char}-${i}`} tile={tile} />
        ))}
      </span>
      <span className="font-data text-[10px] uppercase tracking-[0.08em] text-[var(--muted)] transition-colors group-hover:text-[var(--slate)]">
        {REJSY_AGENT_E164} · tap to text
      </span>
    </a>
  );
}
