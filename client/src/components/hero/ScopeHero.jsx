import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../../context/App';
import { useFinePointer, useIsMobile, useReduced, hasWebGL } from '../../lib/hooks';
import { Magnetic } from '../Motion';
import { campaign } from '../../config/content';

gsap.registerPlugin(ScrollTrigger);
const FloatingGeometry = lazy(() => import('../../three/FloatingGeometry'));
const rise = (d, show) => ({ initial: { opacity: 0, y: 28 }, animate: show ? { opacity: 1, y: 0 } : undefined, transition: { duration: 1, delay: d, ease: [0.22, 1, 0.36, 1] } });

// Asymmetric, layered hero: oversized type behind and in front of a campaign plane that tilts with the pointer and
// drifts on scroll (GSAP ScrollTrigger). The 3D wireframe layer is lazy, off-screen-paused and skipped on phones.
export default function ScopeHero() {
  const { entered, site } = useApp();
  const reduced = useReduced(), fine = useFinePointer(), mobile = useIsMobile();
  const root = useRef();
  const show = entered;
  const b = site.branding || {};
  const photo = b.heroModel || '/images/scope13-logo.jpg';
  const alt = b.heroModel ? (b.heroAlt || 'SCOPE 13 menswear campaign') : 'SCOPE 13, a clothing era';

  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 20 }), sy = useSpring(my, { stiffness: 90, damping: 20 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-9, 9]), rotX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const bgX = useTransform(sx, [-0.5, 0.5], [30, -30]), fgX = useTransform(sx, [-0.5, 0.5], [-24, 24]);
  const glowX = useTransform(sx, [-0.5, 0.5], ['20%', '80%']), glowY = useTransform(sy, [-0.5, 0.5], ['20%', '80%']);

  const onMove = e => {
    if (!fine || reduced) return;
    const r = root.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5);
  };

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 } });
      tl.to('.s13-h-plane', { yPercent: -10, scale: 0.94, ease: 'none' }, 0)
        .to('.s13-h-back', { xPercent: -14, ease: 'none' }, 0)
        .to('.s13-h-front', { xPercent: 10, yPercent: -20, ease: 'none' }, 0)
        .to('.s13-h-geo', { yPercent: 18, ease: 'none' }, 0)
        .to('.s13-h-copy', { yPercent: -12, opacity: 0.2, ease: 'none' }, 0)
        .to(root.current, { clipPath: 'inset(0% 4% 6% 4% round 0 0 48px 48px)', ease: 'none' }, 0);
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} className="s13-hero" data-hero aria-label="SCOPE 13" onPointerMove={onMove} onPointerLeave={() => { mx.set(0); my.set(0) }}>
      <div className="s13-grid" aria-hidden="true" />
      <motion.span className="s13-h-light" aria-hidden="true" style={{ left: glowX, top: glowY }} />
      {!mobile && !reduced && hasWebGL() && <Suspense fallback={null}><FloatingGeometry className="s13-h-geo" /></Suspense>}

      <motion.p className="s13-h-back" aria-hidden="true" style={{ x: bgX }}>SCOPE</motion.p>

      <motion.figure className="s13-h-plane" style={{ rotateY: rotY, rotateX: rotX }} initial={{ opacity: 0, y: 60 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
        <img src={photo} alt={alt} fetchpriority="high" decoding="async" />
        <span className="s13-h-sheen" aria-hidden="true" />
        <figcaption>{campaign.label}</figcaption>
      </motion.figure>

      <motion.p className="s13-h-front" aria-hidden="true" style={{ x: fgX }}>13</motion.p>

      <div className="s13-h-copy">
        <motion.p className="s13-eyebrow" {...rise(0.2, show)}><i aria-hidden="true" />CONTEMPORARY MENSWEAR · MADURAI</motion.p>
        <h1 className="s13-h-title" aria-label="A clothing era.">
          {['A CLOTHING', 'ERA.'].map((l, i) => <span className="s13-mask" key={l} aria-hidden="true"><motion.span initial={{ y: '115%' }} animate={show || reduced ? { y: '0%' } : undefined} transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span></span>)}
        </h1>
        <motion.p className="s13-h-desc" {...rise(0.7, show)}>Modern menswear, considered fit, and a personal style of your own, now in a digital showroom.</motion.p>
        <motion.div className="s13-h-cta" {...rise(0.85, show)}>
          <Magnetic strength={0.25}><Link className="s13-btn" to="/shop" data-cursor="SHOP"><span>SHOP THE COLLECTION</span><b aria-hidden="true">→</b></Link></Magnetic>
          <a className="s13-link" href="#showroom" data-cursor="ENTER">ENTER THE SHOWROOM</a>
        </motion.div>
      </div>

      <ul className="s13-h-tags" aria-label="Collections">
        {[['NEW ARRIVALS', '/collections/new-arrivals'], ['BESTSELLERS', '/shop?flag=best'], ['LOOKBOOK', '/#lookbook']].map(([l, to], i) => (
          <motion.li key={l} {...rise(1 + i * 0.1, show)}><Link to={to} data-cursor="VIEW">{l}</Link></motion.li>
        ))}
      </ul>
      <span className="s13-h-side" aria-hidden="true">SCROLL <i /></span>
    </section>
  );
}
