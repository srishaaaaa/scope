import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/App';
import { api } from '../../lib/api';
import { inr } from '../../lib/format';
import { Reveal } from '../Motion';
import { ProductMedia } from '../ProductCard3D';
import { brand, contact } from '../../config/content';
import BrandPanel from './BrandPanel';
import { coverStyle } from '../../lib/imgPos';

const Ico = ({ children, kind }) => (
  <svg className={`ico ${kind || ''}`} width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Draw = ({ d }) => <motion.path d={d} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: 'easeInOut' }} />;
const TRUCK = 'M4 11h20v15H4zM24 16h7l5 5v5H24zM11 30a3 3 0 1 0 0-.1M29 30a3 3 0 1 0 0-.1';
const TAG = 'M6 20L20 6h13v13L19 33zM27 13a1.5 1.5 0 1 0 0-.1';
const SHIELD = 'M20 5l12 5v9c0 8-5 13-12 16C13 32 8 27 8 19v-9zM14 20l5 5 8-9';
const HEADSET = 'M10 22v-4a10 10 0 0 1 20 0v4M8 22h4v8H8zM28 22h4v8h-4zM28 30c0 3-3 4-8 4';
const RETURN = 'M8 18a12 12 0 0 1 22-4M30 8v6h-6M32 22a12 12 0 0 1-22 4M10 32v-6h6';

// Shopping benefits. The delivery lines come from the store's own delivery settings (/delivery-info); anything the store
// has not configured is simply not claimed.
const KINDS = ['truck', 'tag', 'shield', 'headset'];
export function Features() {
  const [d, setD] = useState(null);
  useEffect(() => { let dead = false; api('/delivery-info').then(x => !dead && setD(x)).catch(() => {}); return () => { dead = true } }, []);
  const note = (d?.lines?.[0] || d?.note || '').split(/(?<=\.)\s/)[0];
  const items = [
    [TRUCK, 'Delivery across India', note || 'Careful packing and delivery to your door.'],
    d?.freeOver ? [TAG, 'Free delivery', `On orders of ${inr(d.freeOver)} or more`] : [RETURN, 'Returns & exchanges', 'Read our shipping & returns policy'],
    [SHIELD, 'Secure payment', 'Pay securely online at checkout'],
    [HEADSET, 'Customer support', `Call or message us on ${contact.phone}`],
  ];
  return (
    <section className="s13-features" aria-label="Why shop with SCOPE 13">
      <div className="s13-wrap">
        <ul className="s13-feat-row">
          {items.map(([path, t, s], i) => (
            <Reveal as="li" key={t} delay={i * 0.06} className="s13-feat"><em className="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</em><Ico kind={KINDS[i]}><Draw d={path} /></Ico><div><strong>{t}</strong><span>{s}</span></div></Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Shop story: a split panel with a photograph (admin story image, else product photography, else the brand panel) beside
// the brand's own words. The numbers are live catalogue counts, never invented statistics.
export function StorySplit() {
  const { catalog, site } = useApp();
  const photo = site.branding?.storyImage || null;
  const lead = catalog.featured[1] || catalog.featured[0];
  const pieces = catalog.categories.reduce((s, c) => s + (c.product_count || 0), 0);
  const cats = catalog.categories.filter(c => c.product_count > 0).length;
  const stats = [pieces > 0 && [String(pieces), 'Pieces in the collection'], cats > 0 && [String(cats), 'Menswear categories'], ['Madurai', 'Visit our store']].filter(Boolean);
  return (
    <section className="s13-sec s13-story" id="story" aria-labelledby="story-h">
      <div className="s13-wrap">
        <div className="s13-story-card">
          <Reveal className="s13-story-media">{photo ? <img src={photo} alt={site.branding?.storyAlt || 'SCOPE 13'} loading="lazy" style={coverStyle(site.branding?.storyPos)} /> : lead ? <ProductMedia p={lead} /> : <BrandPanel />}</Reveal>
          <div className="s13-story-copy">
            <Reveal><p className="s13-label"><i />OUR STORY</p></Reveal>
            <h2 id="story-h" className="s13-h2">
              {['More than', 'what you wear.'].map((l, i) => <span className="s13-mask" key={l}><motion.span initial={{ y: '115%' }} whileInView={{ y: '0%' }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span></span>)}
            </h2>
            {brand.story.slice(0, 2).map((p, i) => <Reveal key={i} delay={0.08 * i}><p className="s13-story-p">{p}</p></Reveal>)}
            <Reveal delay={0.2}><ul className="s13-stats">{stats.map(([n, l]) => <li key={l}><strong>{n}</strong><span>{l}</span></li>)}</ul><Link className="s13-link" to="/about" data-cursor="DISCOVER">DISCOVER SCOPE 13 →</Link></Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
