import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useApp } from '../../context/App';
import { useFinePointer, useReduced } from '../../lib/hooks';
import { Magnetic } from '../Motion';
import FigurePlaceholder from '../home/FigurePlaceholder';
import { media } from '../../config/content';
import { inr } from '../../lib/format';

const EASE = [0.22, 1, 0.36, 1];
const WORD = ['S', 'C', 'O', 'P', 'E', ' ', '1', '3'];

// Editorial hero: a light stage, a giant SCOPE 13 wordmark and the model standing in front of it so the letters pass
// behind the figure. Layers sit at different depths: the wordmark, the figure and the ground shadow each answer the
// pointer and the scroll by a different amount, with a slight 3D turn on the figure.
// The figure is the admin hero photo (Admin → Storefront images; a transparent PNG cut-out sits on the stage as-is, an
// ordinary photo on a light background is blended into it), else a product photo, else a neutral placeholder figure.
export default function ScopeHero() {
  const { entered, site, catalog } = useApp();
  const photo = site.branding?.heroModel || media.heroCutout || catalog.featured.find(p => p.image)?.image || null;
  const cutout = !!photo && /\.(png|webp|avif)(\?|#|$)/i.test(photo);
  const reduced = useReduced(), fine = useFinePointer();
  const ref = useRef();
  const show = entered;
  const cats = catalog.categories.filter(c => c.product_count > 0).slice(0, 5);
  const feat = catalog.featured[0];
  const marquee = ['SCOPE 13', 'CONTEMPORARY MENSWEAR', 'NEW ARRIVALS', 'MADURAI', 'EVERYDAY STYLE'];

  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 18 }), sy = useSpring(my, { stiffness: 70, damping: 18 });
  const wordX = useTransform(sx, [-0.5, 0.5], [26, -26]);
  const figX = useTransform(sx, [-0.5, 0.5], [-14, 14]), figY = useTransform(sy, [-0.5, 0.5], [-6, 6]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const shadowX = useTransform(sx, [-0.5, 0.5], [18, -18]);
  const ringX = useTransform(sx, [-0.5, 0.5], [12, -12]), ringY = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const wordY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -70]);
  const figScroll = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 50]);
  const move = e => { if (!fine || reduced) return; const r = ref.current.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5) };

  return (
    <section ref={ref} className="s13-hero" data-hero aria-label="SCOPE 13" onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0) }}>
      <div className="s13-h-deco" aria-hidden="true">
        <span className="g g1" /><span className="g g2" /><span className="g g3" />
        <motion.span className="ring" style={{ x: ringX, y: ringY }} />
        <motion.span className="ring ring2" style={{ x: ringX, y: ringY }} />
        <span className="vt l">CONTEMPORARY MENSWEAR &nbsp;·&nbsp; MADURAI</span>
        <span className="vt r">9.9252° N &nbsp;—&nbsp; 78.1198° E</span>
        <span className="cue"><i />SCROLL</span>
      </div>

      <h1 className="s13-h-word" aria-label="SCOPE 13. A new era of everyday style.">
        <motion.span className="s13-h-word-in" style={{ x: wordX, y: wordY }} aria-hidden="true">
          {WORD.map((l, i) => (
            <span className="s13-h-mask" key={i}><motion.span initial={{ y: '105%' }} animate={show || reduced ? { y: '0%' } : undefined} transition={{ duration: 1.2, delay: 0.15 + i * 0.06, ease: EASE }}>{l === ' ' ? ' ' : l}</motion.span></span>
          ))}
        </motion.span>
      </h1>

      <div className="s13-h-stage3d" aria-hidden="true">
        <motion.span className="s13-h-ground" style={{ x: shadowX }} initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : undefined} transition={{ duration: 1.4, delay: 0.6 }} />
        <motion.div className="s13-h-fig" style={{ x: figX, y: figY, rotateY: rotY }} initial={{ opacity: 0, y: 40 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 1.3, delay: 0.5, ease: EASE }}>
          <motion.div style={{ y: figScroll }} className="s13-h-fig-in">
            {photo ? <img src={photo} alt="" className={cutout ? 'cut' : 'blend'} fetchpriority="high" decoding="async" /> : <FigurePlaceholder />}
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="s13-h-tag" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 0.9, ease: EASE }}>
        <p>A NEW ERA<br />OF EVERYDAY<br />STYLE.</p><i aria-hidden="true" />
      </motion.div>

      <motion.div className="s13-h-cta" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.0, ease: EASE }}>
        <Magnetic strength={0.18}><Link className="s13-black" to="/shop" data-cursor="SHOP">SHOP NOW</Link></Magnetic>
        <Link className="s13-under" to="/collections/new-arrivals" data-cursor="NEW">EXPLORE NEW IN</Link>
      </motion.div>

      <motion.div className="s13-h-note" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.1, ease: EASE }}>
        <p>NEW<br />COLLECTION</p><i aria-hidden="true" />
      </motion.div>

      {/* rotating circular badge */}
      <motion.div className="s13-h-badge" initial={{ opacity: 0, scale: 0.8 }} animate={show ? { opacity: 1, scale: 1 } : undefined} transition={{ duration: 1, delay: 1.2, ease: EASE }}>
        <Link to="/shop" data-cursor="SHOP" aria-label="Shop the collection">
          <svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="bd" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" /></defs><text><textPath href="#bd" startOffset="0" textLength="268" lengthAdjust="spacing">CONTEMPORARY MENSWEAR · SCOPE 13 · MADURAI ·</textPath></text></svg>
          <b aria-hidden="true">↗</b>
        </Link>
      </motion.div>

      {/* featured product chip (live data) */}
      {feat && (
        <motion.div className="s13-h-feat" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.15, ease: EASE }}>
          <Link to={`/product/${feat.slug}`} data-cursor="VIEW"><small>FEATURED</small><strong>{feat.name}</strong><em>{inr(feat.price)} <i aria-hidden="true">&rarr;</i></em></Link>
        </motion.div>
      )}

      {/* category index (live data) */}
      {cats.length > 0 && (
        <motion.nav className="s13-h-index" aria-label="Categories" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.25, ease: EASE }}>
          <p>INDEX</p>
          <ul>{cats.map((c, i) => <li key={c.slug}><Link to={`/shop?category=${c.slug}`}><span>{String(i + 1).padStart(2, '0')}</span>{c.name}</Link></li>)}</ul>
        </motion.nav>
      )}

      {/* marquee strip */}
      <div className="s13-h-strip" aria-hidden="true">
        <div className="s13-h-strip-track">{[0, 1].map(k => <ul key={k}>{marquee.concat(marquee).map((t, i) => <li key={i}>{t}<i>&#10022;</i></li>)}</ul>)}</div>
      </div>
    </section>
  );
}
