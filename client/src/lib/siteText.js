import { useApp } from '../context/App';
import { brand } from '../config/content';

// Built-in website wording. Anything filled in under Admin → Site text replaces the matching line.
export const TEXT_DEFAULTS = {
  storyTitle: 'The Boutique', story: brand.story,
  trendingEyebrow: 'TRENDING NOW', trendingTitle: 'TRENDING COLLECTIONS', trendingSub: 'Handpicked pieces from the SCOPE 13 collection.',
  worldEyebrow: 'COLLECTIONS', worldTitle: 'CHOOSE YOUR WORLD.',
  instaTitle: 'INSIDE SCOPE 13', instaSub: 'Moments from the boutique and the collection. Follow @scope13.in on Instagram.',
  contactEyebrow: 'GET IN TOUCH', contactTitle: 'ENQUIRE WITH\nSCOPE 13.', contactSub: 'Looking for a particular piece or size? Tell us what you need and we will get back to you.',
  aboutTitle: 'MODERN MENSWEAR.\nA CLOTHING ERA.', aboutLead: brand.positioning, aboutSub: brand.promise,
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
