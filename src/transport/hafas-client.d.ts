// [B] hafas-client ships no types. We only touch it inside rejseplanen.ts and
// normalise everything at that boundary (Rules §3.5), so `any` here is fine.
declare module 'hafas-client' {
  export function createClient(profile: unknown, userAgent: string): any;
}
declare module 'hafas-client/p/rejseplanen/index.js' {
  export const profile: any;
}
