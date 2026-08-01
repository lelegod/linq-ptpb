// [B] Ticket hand-off links. We never take payment — DSB/DOT does.
//
// Architecture.md §2.4. If the pre-filled URL turns out not to pre-fill on the
// real DSB site (verify in Phase 3 by tapping it on an actual iPhone), flip
// DSB_DEEPLINK_MODE=plain and we hand over the plain booking page instead.
// The demo still works; the user just retypes.

import type { TripOption } from './types';

// Default is 'plain'. VERIFIED 2026-08-01: dsb.dk's own homepage IS the journey
// search, and no documented query-param prefill exists — the old
// /find-produkter-og-priser/ path from Architecture.md §2.4 returns 404.
const MODE = (process.env.DSB_DEEPLINK_MODE ?? 'plain') as 'prefill' | 'plain';

const DSB_HOME = 'https://www.dsb.dk/';
const DOT_HOME = 'https://dinoffentligetransport.dk/';

// AASA-registered path — iOS hands this to the DSB app instead of Safari.
// VERIFIED 2026-08-01 in https://www.dsb.dk/.well-known/apple-app-site-association:
// appID EVL9YWFL59.dk.dsb.nda claims /netbutik/rejseplan-side and /netbutik/rejseplan-side/*.
// Bare https://www.dsb.dk/ is NOT claimed, which is why it always opened Safari.
// In a browser this 302s to the dsb.dk homepage, so the no-app fallback is
// identical to what we shipped before — this swap has no downside.
// Query params are undocumented; we send none and make no prefill claim.
const DSB_APP_LINK = 'https://www.dsb.dk/netbutik/rejseplan-side';

// DOT has no equivalent: dinoffentligetransport.dk's AASA claims only
// /scanandtravel/*, so Copenhagen zone trips stay a plain web hand-off.

/** Greater-Copenhagen station ids — short hops here are DOT zone tickets, not DSB. */
const CPH_AREA = new Set([
  '8600626', // København H
  '8600646', // Nørreport
  '8600858', // Kastrup
  '8600856', // Ørestad
  '8600683', // Valby
  '8600632', // Østerport
  '8600634', // Vesterport
  '8600669', // Svanemøllen
]);

function isCopenhagenLocal(o: TripOption): boolean {
  return (
    CPH_AREA.has(o.origin.id) &&
    CPH_AREA.has(o.destination.id) &&
    o.durationMinutes <= 40
  );
}

export function buildTicketLink(o: TripOption): string {
  if (MODE === 'plain') return isCopenhagenLocal(o) ? DOT_HOME : DSB_APP_LINK;

  if (isCopenhagenLocal(o)) {
    // DOT has no documented query API — hand over the zone-ticket page.
    return DOT_HOME;
  }

  const date = new Date(o.departAt);
  const params = new URLSearchParams({
    from: o.origin.name,
    to: o.destination.name,
    fromId: o.origin.id,
    toId: o.destination.id,
    date: date.toISOString().slice(0, 10),
    time: new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Copenhagen',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date),
  });
  return `${DSB_HOME}?${params.toString()}`;
}

export function ticketVendor(o: TripOption): 'DSB' | 'DOT' {
  return isCopenhagenLocal(o) ? 'DOT' : 'DSB';
}
