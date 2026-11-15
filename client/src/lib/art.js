// Deterministic generative art used while a product has no photography.
export const PALETTES = [
  ['#111111', '#999999', '#DCDCDC'],
  ['#252525', '#BDBDBD', '#F4F4F4'],
  ['#1b1b1b', '#8a8a8a', '#E6E6E6'],
  ['#2e2e2e', '#A9A9A9', '#FAFAFA'],
  ['#161616', '#777777', '#D0D0D0'],
];

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0;
}

export function rng(seed) {
  let a = typeof seed === 'string' ? hash(seed) : seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const palette = seed => PALETTES[hash(String(seed)) % PALETTES.length];
