// Image framing = focus point + zoom, saved in the existing "x% y%" position field (the API only accepts that shape,
// so zoom rides along in it: y is stored as y + 200 * zoomStep. Plain "50% 20%" values from before still read as zoom 1).
export const ZOOMS = [1, 1.3, 1.6, 2, 2.5];

export function decodePos(pos) {
  const m = /^(\d{1,3})% (\d{1,3})%$/.exec(pos || '');
  if (!m) return { x: 50, y: 50, k: 0, z: 1, set: false };
  const x = Math.min(100, +m[1]); const raw = +m[2]; const k = Math.min(ZOOMS.length - 1, Math.floor(raw / 200)); const y = Math.min(100, raw - k * 200);
  return { x, y, k, z: ZOOMS[k], set: true };
}
export const encodePos = (x, y, k = 0) => `${Math.round(x)}% ${Math.round(y) + 200 * k}%`;

// Style for an <img> that fills a box with object-fit: cover.
export function coverStyle(pos) {
  const { x, y, z } = decodePos(pos);
  return { objectFit: 'cover', objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%`, transform: z > 1 ? `scale(${z})` : undefined };
}

// Reels and gallery photos have no framing field in the API, so the framing rides at the end of the description text
// ("Alt text ¦50% 220%") and is split off again before display. Descriptions without it read as unframed.
const SEP = ' ¦';
export function splitAlt(alt) {
  const i = (alt || '').lastIndexOf(SEP);
  if (i < 0) return { alt: alt || '', pos: null };
  const pos = alt.slice(i + SEP.length);
  return /^\d{1,3}% \d{1,3}%$/.test(pos) ? { alt: alt.slice(0, i), pos } : { alt: alt, pos: null };
}
export const joinAlt = (alt, pos) => (pos ? `${(alt || '').slice(0, 160 - SEP.length - pos.length)}${SEP}${pos}` : (alt || ''));
