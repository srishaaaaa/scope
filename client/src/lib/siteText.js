import { useApp } from '../context/App';
import { brand } from '../config/content';

// Built-in website wording. Anything filled in under Admin → Site text replaces the matching line.
export const TEXT_DEFAULTS = {
  storyTitle: 'More than what you wear.', story: brand.story,
  trendingEyebrow: 'TRENDING NOW', trendingTitle: 'TRENDING COLLECTIONS', trendingSub: 'Handpicked pieces from the SCOPE 13 collection.',
  worldEyebrow: 'COLLECTIONS', worldTitle: 'CHOOSE YOUR WORLD.',
  instaTitle: 'THE SCOPE 13 FEED.', instaSub: 'A closer look at the style.',
  contactEyebrow: 'ENQUIRIES', contactTitle: "LET'S TALK.", contactSub: 'Questions about a piece, your size or an order? Send us a message and we will get back to you.',
  heroBadgeText: 'CONTEMPORARY MENSWEAR · SCOPE 13 · MADURAI ·', heroBadgeLink: '/shop', heroIndexTitle: 'INDEX',
  aboutTitle: 'A NEW ERA OF\nEVERYDAY STYLE.', aboutLead: brand.positioning, aboutSub: brand.promise,
};

export function useSiteText() {
  const { site } = useApp();
  const c = site.content || {};
  const out = { ...TEXT_DEFAULTS };
  for (const k of Object.keys(TEXT_DEFAULTS)) {
    const v = c[k];
    if (Array.isArray(v) ? v.some(x => x && x.trim()) : v && String(v).trim()) out[k] = Array.isArray(v) ? v.filter(x => x && x.trim()) : v;
  }
  return out;
}
