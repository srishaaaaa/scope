import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import { useApp } from '../../context/App';
import { Reveal, Magnetic } from '../Motion';
import { ProductMedia } from '../ProductCard3D';
import { useReduced } from '../../lib/hooks';
import { brand } from '../../config/content';
import BrandPanel from './BrandPanel';

gsap.registerPlugin(ScrollTrigger);

// About: layered imagery with a gentle parallax, editorial copy, and the brand's own words (config/content.js).
export function About() {
  const { catalog } = useApp();
  const ref = useRef();
  const reduced = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : ['6%', '-6%']);
  const y2 = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : ['-4%', '10%']);
  const first = catalog.featured[0], second = catalog.featured[1];
  return (
    <section className="s13-sec s13-about" id="about" aria-labelledby="about-h" ref={ref}>
      <div className="s13-wrap s13-about-grid">
        <div className="s13-about-media">
          <motion.figure className="s13-about-a" style={{ y: y1 }}>{first ? <ProductMedia p={first} /> : <BrandPanel />}</motion.figure>
          {second && <motion.figure className="s13-about-b" style={{ y: y2 }}><ProductMedia p={second} /></motion.figure>}
        </div>
        <div className="s13-about-copy">
          <Reveal><p className="s13-label"><i />ABOUT SCOPE 13</p></Reveal>
          <h2 id="about-h" className="s13-h2 s13-about-h">
            {['MORE THAN', 'WHAT YOU', 'WEAR.'].map((l, i) => <span className="s13-mask" key={l}><motion.span initial={{ y: '115%' }} whileInView={{ y: '0%' }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span></span>)}
          </h2>
          {brand.story.map((p, i) => <Reveal key={i} delay={0.08 * i}><p className="s13-about-p">{p}</p></Reveal>)}
          <Reveal delay={0.3}><ul className="s13-traits">{brand.personality.map(t => <li key={t}>{t}</li>)}</ul><Link className="s13-link" to="/about" data-cursor="DISCOVER">DISCOVER SCOPE 13 →</Link></Reveal>
        </div>
      </div>
    </section>
  );
}

const Ico = ({ children }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Draw = ({ d }) => <motion.path d={d} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: 'easeInOut' }} />;

// Shopping benefits, stated only as far as the store supports them (shipping charges and policies live in the bag and policy pages).
const FEATURES = [
  ['Quality-focused clothing', 'Pieces chosen for fit, feel and everyday wear.', 'M8 12l6-4 6 3 6-3 6 4-4 6-3-1v15H15V17l-3 1z'],
  ['Easy shopping', 'Filter by size, colour and price and find your fit fast.', 'M6 10h28M10 18h20M14 26h12M18 34h4'],
  ['Secure checkout', 'Pay securely online. Orders are confirmed once payment is verified.', 'M20 5l12 5v9c0 8-5 13-12 16C13 32 8 27 8 19v-9zM14 20l5 5 8-9'],
  ['Convenient ordering', 'Bag and wishlist stay with you on every device when you sign in.', 'M9 14h22l-2 18H11zM15 14v-3a5 5 0 0 1 10 0v3'],
  ['Customer assistance', 'Questions on fit or stock? Call or message the store.', 'M10 22v-4a10 10 0 0 1 20 0v4M8 22h4v8H8zM28 22h4v8h-4zM28 30c0 3-3 4-8 4'],
  ['Delivery support', 'Delivery across India, with the charge shown in your bag first.', 'M4 11h20v15H4zM24 16h7l5 5v5H24zM11 30a3 3 0 1 0 0-.1M29 30a3 3 0 1 0 0-.1'],
];
export function Features() {
  return (
    <section className="s13-features" aria-label="Why SCOPE 13">
      <div className="s13-wrap">
        <ul className="s13-feat-row">
          {FEATURES.map(([t, d, path], i) => (
            <Reveal as="li" key={t} delay={i * 0.06} className="s13-feat"><Ico><Draw d={path} /></Ico><h3>{t}</h3><p>{d}</p></Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Fashion campaign: copy on the left, a campaign photograph on the right (real product photography, or the brand panel
// until campaign photography is supplied) revealed by a scroll-scrubbed mask while it settles from a slow zoom.
export function Campaign() {
  const { catalog, site } = useApp();
  const shot = catalog.featured[2] || catalog.featured[0];
  const root = useRef();
  const reduced = useReduced();
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'center 55%', scrub: 0.6 } });
      tl.fromTo('.s13-camp-frame', { clipPath: 'inset(18% 14% 18% 14% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none' }, 0)
        .fromTo('.s13-camp-frame > *', { scale: 1.25 }, { scale: 1, ease: 'none' }, 0);
      gsap.fromTo('.s13-camp-h span', { xPercent: -6 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'center center', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);
  return (
    <section ref={root} className="s13-campaign" aria-labelledby="camp-h">
      <div className="s13-wrap s13-camp-grid">
        <div className="s13-camp-copy">
          <p className="s13-label light"><i />THE CAMPAIGN</p>
          <h2 id="camp-h" className="s13-camp-h"><span>EVERYDAY,</span><span>REDEFINED.</span></h2>
          <p className="s13-camp-p">Contemporary menswear with a confident point of view, built for the way you actually dress.</p>
          <Magnetic><Link className="s13-btn light" to="/shop" data-cursor="SHOP"><span>EXPLORE COLLECTION</span><b aria-hidden="true">&rarr;</b></Link></Magnetic>
        </div>
        <div className="s13-camp-frame">{site.branding?.campaignImage ? <img src={site.branding.campaignImage} alt="SCOPE 13 campaign" loading="lazy" /> : shot ? <ProductMedia p={shot} /> : <BrandPanel />}</div>
      </div>
    </section>
  );
}
