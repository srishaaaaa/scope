import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useApp } from '../../context/App';
import { useFinePointer, useReduced } from '../../lib/hooks';
import { Magnetic } from '../Motion';
import BrandPanel from '../home/BrandPanel';

const EASE = [0.22, 1, 0.36, 1];
const rise = (d, show) => ({ initial: { opacity: 0, y: 24 }, animate: show ? { opacity: 1, y: 0 } : undefined, transition: { duration: 1, delay: d, ease: EASE } });

// Full-bleed campaign hero: copy on the left grid column, the model photograph bleeding off the right edge into the dark
// panel. The photograph is the admin's hero photo (Admin → Storefront images), else the first product photo; until one
// exists the brand panel stands in. The image drifts with the pointer and settles from a slow zoom.
export default function ScopeHero() {
  const { entered, site, catalog } = useApp();
  const src = site.branding?.heroModel || catalog.featured.find(p => p.image)?.image || null;
  const pos = site.branding?.heroModelPos || '50% 18%';
  const reduced = useReduced(), fine = useFinePointer();
  const ref = useRef();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 20 }), sy = useSpring(my, { stiffness: 70, damping: 20 });
  const x = useTransform(sx, [-0.5, 0.5], [18, -18]), y = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const show = entered;
  const move = e => { if (!fine || reduced) return; const r = ref.current.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5) };

  return (
    <section ref={ref} className="s13-hero" data-hero aria-label="SCOPE 13" onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0) }}>
      <div className="s13-h-media" aria-hidden="true">
        <motion.div className="s13-h-img" style={{ x, y }} initial={{ scale: 1.12, opacity: 0 }} animate={show ? { scale: 1.04, opacity: 1 } : undefined} transition={{ duration: 2, ease: EASE }}>
          {src ? <img src={src} alt="" style={{ objectPosition: pos }} fetchpriority="high" decoding="async" /> : <BrandPanel big />}
        </motion.div>
        <span className="s13-h-fade" />
      </div>
      <div className="s13-wrap s13-h-grid">
        <div className="s13-h-copy">
          <motion.p className="s13-label light" {...rise(0.15, show)}><i aria-hidden="true" />SCOPE 13 / CONTEMPORARY MENSWEAR</motion.p>
          <h1 className="s13-h-title" aria-label="A new era of everyday style.">
            {['A new era', 'of everyday', 'style.'].map((l, i) => (
              <span className="s13-mask" key={l} aria-hidden="true"><motion.span initial={{ y: '115%' }} animate={show || reduced ? { y: '0%' } : undefined} transition={{ duration: 1.1, delay: 0.25 + i * 0.12, ease: EASE }}>{l}</motion.span></span>
            ))}
          </h1>
          <motion.p className="s13-h-desc" {...rise(0.7, show)}>Discover contemporary menswear designed around individuality, confidence and effortless style.</motion.p>
          <motion.div className="s13-h-cta" {...rise(0.85, show)}>
            <Magnetic strength={0.2}><Link className="s13-solid" to="/shop" data-cursor="SHOP">EXPLORE COLLECTION</Link></Magnetic>
            <Link className="s13-ghost" to="/about" data-cursor="DISCOVER">DISCOVER SCOPE 13</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
