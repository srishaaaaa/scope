// Deterministic generative art used while a product has no photography.
export const PALETTES = [
  ['#12232C', '#477E90', '#7FAEC3'],
  ['#1B3340', '#7FAEC3', '#DCE8EE'],
  ['#0f1d25', '#3a6b80', '#A9C9DA'],
  ['#242a2e', '#8a9aa3', '#E4EAED'],
  ['#16303b', '#5f8fa5', '#C8DCE6'],
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
