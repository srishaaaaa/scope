import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/App';
import { Reveal } from '../components/Motion';
import { ProductMedia } from '../components/ProductCard3D';
import StoreLocationMap from '../components/StoreLocationMap';
import CountUp from '../components/home/CountUp';
import BrandPanel from '../components/home/BrandPanel';
import { useSiteText } from '../lib/siteText';
import { useReduced } from '../lib/hooks';
import { brand } from '../config/content';
import { coverStyle, splitAlt } from '../lib/imgPos';

const STEPS = [
  ['01', 'Browse', 'Filter by category, size, colour and price to find what suits you.'],
  ['02', 'Choose your size', 'Every size shows live availability.'],
  ['03', 'Pay securely', 'Checkout is paid online. An order is confirmed once payment is verified.'],
  ['04', 'Track it', 'Sign in to see your orders and keep a wishlist on every device.'],
];

// About: an editorial page. Serif headline and a tall photograph with parallax, a three-photo collage, live numbers from the
// catalogue, the brand's own words, how shopping works, and the store. Photos are the Our Story photo and real product photos.
export default function About() {
  const { catalog, site } = useApp();
  const t = useSiteText();
  const reduced = useReduced();
  const hero = useRef();
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -50]);

  const cats = catalog.categories.filter(c => c.product_count > 0);
  const total = cats.reduce((s, c) => s + c.product_count, 0);
  const photo = site.branding?.storyImage || null;
  // The collage uses only photos uploaded in the admin: the Our Story photo plus the Reels & Photo gallery photos (never product photos).
  const gallery = (site.social?.instagram?.posts || []).filter(p => !p.video && p.image).map(p => ({ src: p.image, alt: splitAlt(p.alt).alt, pos: splitAlt(p.alt).pos }));
  const [ok, setOk] = useState({}); // gallery files that actually load (a missing file is skipped, never shown broken)
  useEffect(() => { gallery.forEach(g => { if (ok[g.src] !== undefined) return; const i = new Image(); i.onload = () => setOk(o => ({ ...o, [g.src]: true })); i.onerror = () => setOk(o => ({ ...o, [g.src]: false })); i.src = g.src }) }, [gallery.map(g => g.src).join('|')]); // eslint-disable-line
  const [g1, g2] = gallery.filter(g => g.src !== photo && ok[g.src]);
  const stats = [[total, 'Pieces in the collection'], [cats.length, 'Menswear categories'], [catalog.collections.length, 'Curated collections'], ['Madurai', 'Visit our store']].filter(([n]) => n || n === 0);
  const lines = String(t.aboutTitle).split('\n');

  return (
    <div className="ab3">
      <header className="ab3-hero" ref={hero}>
        <div className="ab3-copy">
          <Reveal><p className="ab3-label"><i />ABOUT SCOPE 13</p></Reveal>
          <h1 className="ab3-h">{lines.map((l, i) => <span className="ab3-mask" key={i}><motion.span initial={{ y: '110%' }} animate={{ y: '0%' }} transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span></span>)}</h1>
          <Reveal delay={0.3}><p className="ab3-lead">{t.aboutLead}</p><p className="ab3-sub">{t.aboutSub}</p>
            <div className="ab3-cta"><Link className="ab3-btn" to="/shop" data-cursor="SHOP">EXPLORE COLLECTION</Link><Link className="ab3-link" to="/enquiry" data-cursor="TALK">GET IN TOUCH →</Link></div></Reveal>
        </div>
        <div className="ab3-media">
          <motion.figure className="ab3-main" style={{ y: y1 }}>{photo ? <img src={photo} alt={site.branding?.storyAlt || 'SCOPE 13'} loading="eager" style={coverStyle(site.branding?.storyPos)} /> : g1 ? <img src={g1.src} alt={g1.alt} loading="eager" style={coverStyle(g1.pos)} /> : <BrandPanel />}</motion.figure>
          {photo && g1 && <motion.figure className="ab3-small a" style={{ y: y2 }}><img src={g1.src} alt={g1.alt} loading="eager" style={coverStyle(g1.pos)} /></motion.figure>}
          {photo && g2 && <motion.figure className="ab3-small b" style={{ y: y1 }}><img src={g2.src} alt={g2.alt} loading="eager" style={coverStyle(g2.pos)} /></motion.figure>}
        </div>
      </header>

      <section className="ab3-stats" aria-label="SCOPE 13 at a glance">
        {stats.map(([n, l], i) => <Reveal key={l} delay={i * 0.07} className="ab3-stat"><strong><CountUp value={n} /></strong><span>{l}</span></Reveal>)}
      </section>

      <section className="ab3-story" aria-labelledby="ab3-s">
        <Reveal className="ab3-story-l"><p className="ab3-label"><i />OUR STORY</p><h2 id="ab3-s">More than <em>what you wear.</em></h2></Reveal>
        <div className="ab3-story-r">{brand.story.map((p, i) => <Reveal key={i} delay={0.08 * i}><p>{p}</p></Reveal>)}
          <Reveal delay={0.25}><ul className="ab3-traits">{brand.personality.map(x => <li key={x}>{x}</li>)}</ul></Reveal></div>
      </section>

      {cats.length > 0 && (
        <section className="ab3-offer" aria-labelledby="ab3-o">
          <Reveal className="ab3-head"><p className="ab3-label"><i />WHAT WE OFFER</p><h2 id="ab3-o">Everything he wears, <em>under one roof.</em></h2></Reveal>
          <ul className="ab3-cats">{cats.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={(i % 6) * 0.05}>
              <Link to={`/shop?category=${c.slug}`} className="ab3-cat" data-cursor="SHOP">
                <span className="ab3-cat-img"><ProductMedia p={{ slug: c.slug, name: c.name, image: c.image_url || c.cover_image, image_pos: c.image_pos }} /></span>
                <span className="ab3-cat-t"><strong>{c.name}</strong><em>{c.product_count} {c.product_count === 1 ? 'piece' : 'pieces'}</em></span>
              </Link>
            </Reveal>))}</ul>
        </section>
      )}

      <section className="ab3-steps" aria-labelledby="ab3-st">
        <Reveal className="ab3-head"><p className="ab3-label"><i />HOW IT WORKS</p><h2 id="ab3-st">From first look <em>to your door.</em></h2></Reveal>
        <ol>{STEPS.map(([n, h, d], i) => <Reveal as="li" key={n} delay={i * 0.08}><span>{n}</span><h3>{h}</h3><p>{d}</p></Reveal>)}</ol>
      </section>

      <section className="ab3-cta2">
        <Reveal><h2>Wear the <em>era.</em></h2><div className="ab3-cta"><Link className="ab3-btn light" to="/shop" data-cursor="SHOP">SHOP NOW</Link><Link className="ab3-link light" to="/enquiry" data-cursor="TALK">SEND AN ENQUIRY →</Link></div></Reveal>
      </section>
      <StoreLocationMap />
    </div>
  );
}
