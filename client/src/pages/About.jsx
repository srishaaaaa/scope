import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useApp } from '../context/App';
import { Reveal } from '../components/Motion';
import { ProductMedia } from '../components/ProductCard3D';
import StoreLocationMap from '../components/StoreLocationMap';
import CountUp from '../components/home/CountUp';
import { useSiteText } from '../lib/siteText';
import { useReduced } from '../lib/hooks';
import { brand, media } from '../config/content';
import { coverStyle } from '../lib/imgPos';

const STEPS = [
  ['01', 'Browse', 'Filter by category, size, colour and price to find what suits you.'],
  ['02', 'Choose your size', 'Every size shows live availability.'],
  ['03', 'Pay securely', 'Checkout is paid online. An order is confirmed once payment is verified.'],
  ['04', 'Track it', 'Sign in to see your orders and keep a wishlist on every device.'],
];

// About: a dark editorial opening with the two models, live numbers from the catalogue, the brand's own words, the
// categories as tall cards, how shopping works, and the store. The Our Story photo (Admin → Storefront images) replaces
// the cut-out in the opening when one has been uploaded.
export default function About() {
  const { catalog, site } = useApp();
  const t = useSiteText();
  const reduced = useReduced();
  const hero = useRef();
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 60]);

  const cats = catalog.categories.filter(c => c.product_count > 0);
  const total = cats.reduce((s, c) => s + c.product_count, 0);
  const photo = site.branding?.storyImage || null;
  const stats = [[total, 'Pieces in the collection'], [cats.length, 'Menswear categories'], [catalog.collections.length, 'Curated collections'], ['Madurai', 'Visit our store']].filter(([n]) => n);
  const lines = String(t.aboutTitle).split('\n');

  return (
    <div className="ab4">
      <header className="ab4-hero" ref={hero}>
        <span className="ab4-ghost" aria-hidden="true">SCOPE 13</span>
        <div className="ab4-hero-in">
          <div className="ab4-copy">
            <Reveal><p className="ab4-label"><i />About SCOPE 13</p></Reveal>
            <h1>{lines.map((l, i) => <span className="ab4-mask" key={i}><motion.span initial={{ y: '110%' }} animate={{ y: '0%' }} transition={{ duration: 1, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span></span>)}</h1>
            <Reveal delay={0.3}>
              <p className="ab4-lead">{t.aboutLead}</p><p className="ab4-sub">{t.aboutSub}</p>
              <div className="ab4-cta"><Link className="ab4-btn gold" to="/shop" data-cursor="SHOP">Explore collection <span aria-hidden="true">→</span></Link><Link className="ab4-btn ghost" to="/enquiry" data-cursor="TALK">Get in touch</Link></div>
            </Reveal>
          </div>
          <motion.figure className={`ab4-figure ${photo ? 'photo' : ''}`} style={{ y: drift }}>
            {photo ? <img src={photo} alt={site.branding?.storyAlt || 'SCOPE 13'} style={coverStyle(site.branding?.storyPos)} /> : <img src={media.heroCutout} alt="Two models wearing SCOPE 13 shirts and trousers" />}
          </motion.figure>
        </div>
      </header>

      {stats.length > 0 && (
        <section className="ab4-stats" aria-label="SCOPE 13 at a glance">
          {stats.map(([n, l], i) => <Reveal key={l} delay={i * 0.07} className="ab4-stat"><strong><CountUp value={n} /></strong><span>{l}</span></Reveal>)}
        </section>
      )}

      <section className="ab4-story" aria-labelledby="ab4-s">
        <Reveal className="ab4-story-l"><p className="ab4-label"><i />Our story</p><h2 id="ab4-s">More than <em>what you wear.</em></h2></Reveal>
        <div className="ab4-story-r">
          {brand.story.map((p, i) => <Reveal key={i} delay={0.08 * i}><p>{p}</p></Reveal>)}
          <Reveal delay={0.2}><ul className="ab4-traits">{brand.personality.map(x => <li key={x}>{x}</li>)}</ul></Reveal>
        </div>
      </section>

      {cats.length > 0 && (
        <section className="ab4-offer" aria-labelledby="ab4-o">
          <Reveal className="ab4-head"><p className="ab4-label"><i />What we offer</p><h2 id="ab4-o">Everything he wears, <em>under one roof.</em></h2></Reveal>
          <ul className="ab4-cats">{cats.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={(i % 4) * 0.06}>
              <Link to={`/shop?category=${c.slug}`} data-cursor="SHOP">
                <ProductMedia p={{ slug: c.slug, name: c.name, image: c.image_url || c.cover_image, image_pos: c.image_pos }} />
                <span><strong>{c.name}</strong><em>{c.product_count} {c.product_count === 1 ? 'piece' : 'pieces'}</em></span>
              </Link>
            </Reveal>))}</ul>
        </section>
      )}

      <section className="ab4-steps" aria-labelledby="ab4-st">
        <Reveal className="ab4-head"><p className="ab4-label"><i />How it works</p><h2 id="ab4-st">From first look <em>to your door.</em></h2></Reveal>
        <ol>{STEPS.map(([n, h, d], i) => <Reveal as="li" key={n} delay={i * 0.08}><span>{n}</span><h3>{h}</h3><p>{d}</p></Reveal>)}</ol>
      </section>

      <section className="ab4-end">
        <Reveal><h2>Wear the <em>era.</em></h2><div className="ab4-cta"><Link className="ab4-btn dark" to="/shop" data-cursor="SHOP">Shop now <span aria-hidden="true">→</span></Link><Link className="ab4-btn line" to="/enquiry" data-cursor="TALK">Send an enquiry</Link></div></Reveal>
      </section>
      <StoreLocationMap />
    </div>
  );
}
