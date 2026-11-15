import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../../context/App';
import { useIsMobile, useReduced, hasWebGL } from '../../lib/hooks';
import { Magnetic } from '../Motion';
import BrandPanel from '../home/BrandPanel';

gsap.registerPlugin(ScrollTrigger);
const HeroScene = lazy(() => import('../../three/HeroScene'));
const EASE = [0.22, 1, 0.36, 1];
const rise = (d, show) => ({ initial: { opacity: 0, y: 26 }, animate: show ? { opacity: 1, y: 0 } : undefined, transition: { duration: 1, delay: d, ease: EASE } });

// The campaign opens inside one connected 3D room (see three/HeroScene). Copy sits on the left grid column, the scene
// carries the panel on the right. The hero stays pinned while the next section slides up over it (a continuous cover
// transition), and the same scroll progress drives the camera. Phones get a lighter 2D composition of the same image.
export default function ScopeHero() {
  const { entered, site, catalog } = useApp();
  const src = site.branding?.heroModel || catalog.featured.find(p => p.image)?.image || null;
  const reduced = useReduced(), mobile = useIsMobile();
  const root = useRef(), progress = useRef(0);
  const [active, setActive] = useState(true);
  const show = entered;
  const scene3d = !mobile && hasWebGL();

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom top', onUpdate: s => { progress.current = s.progress }, onToggle: s => setActive(s.isActive), invalidateOnRefresh: true });
      if (reduced) return;
      gsap.to('.s13-h-copy', { yPercent: -14, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '70% top', scrub: true } });
      gsap.to('.s13-h-flat img', { scale: 1.12, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} className="s13-hero" data-hero aria-label="SCOPE 13">
      <div className="s13-h-stage" aria-hidden="true">
        {scene3d
          ? <Suspense fallback={<div className="s13-h-poster" />}><HeroScene progress={progress} active={active} reduced={reduced} src={src} /></Suspense>
          : <div className="s13-h-flat">{src ? <img src={src} alt="" fetchpriority="high" decoding="async" /> : <BrandPanel />}</div>}
      </div>
      <div className="s13-wrap s13-h-grid">
        <div className="s13-h-copy">
          <motion.p className="s13-label" {...rise(0.2, show)}><i aria-hidden="true" />SCOPE 13 / CONTEMPORARY MENSWEAR</motion.p>
          <h1 className="s13-h-title" aria-label="A new era of everyday style.">
            {['A NEW ERA', 'OF EVERYDAY', 'STYLE.'].map((l, i) => (
              <span className="s13-mask" key={l} aria-hidden="true"><motion.span initial={{ y: '115%' }} animate={show || reduced ? { y: '0%' } : undefined} transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: EASE }}>{l}</motion.span></span>
            ))}
          </h1>
          <motion.p className="s13-h-desc" {...rise(0.75, show)}>Discover contemporary menswear designed around individuality, confidence and effortless style.</motion.p>
          <motion.div className="s13-h-cta" {...rise(0.9, show)}>
            <Magnetic strength={0.22}><Link className="s13-btn" to="/shop" data-cursor="SHOP"><span>EXPLORE COLLECTION</span><b aria-hidden="true">→</b></Link></Magnetic>
            <Link className="s13-link" to="/about" data-cursor="DISCOVER">DISCOVER SCOPE 13</Link>
          </motion.div>
        </div>
      </div>
      <a className="s13-h-scroll" href="#trending" aria-label="Scroll to trending collections"><span>SCROLL</span><i aria-hidden="true" /></a>
    </section>
  );
}
