import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useApp } from '../../context/App';
import { useFinePointer, useReduced } from '../../lib/hooks';
import { Magnetic } from '../Motion';
import FigurePlaceholder from '../home/FigurePlaceholder';
import { media } from '../../config/content';
import { decodePos } from '../../lib/imgPos';
import { inr } from '../../lib/format';

const EASE = [0.22, 1, 0.36, 1];
const WORD = ['S', 'C', 'O', 'P', 'E', ' ', '1', '3'];

// Editorial hero set like a quiet studio: a pale ice-blue disc and fine rings behind the model, architectural slabs
// standing on a floor, a slow beam of light, a halftone dot patch and a faint floor reflection. The giant SCOPE 13
// wordmark sits between the set and the model so the letters pass behind him. Every layer sits at its own depth and
// answers the pointer and the scroll by a different amount.
// The figure is the supplied hero cut-out (or the admin hero photo, or a product photo, or a neutral placeholder).
export default function ScopeHero() {
  const { entered, site, catalog } = useApp();
  const photo = site.branding?.heroModel || media.heroCutout || catalog.featured.find(p => p.image)?.image || null;
  const fr = decodePos(site.branding?.heroModelPos);
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
  const sunX = useTransform(sx, [-0.5, 0.5], [14, -14]), sunY = useTransform(sy, [-0.5, 0.5], [9, -9]);
  const slabL = useTransform(sx, [-0.5, 0.5], [6, -6]), slabR = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const wordY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -70]);
  const figScroll = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 50]);
  const sunScroll = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 90]);
  const move = e => { if (!fine || reduced) return; const r = ref.current.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5) };

  return (
    <section ref={ref} className="s13-hero" data-hero aria-label="SCOPE 13" onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0) }}>
      <div className="s13-h-art" aria-hidden="true">
        <span className="g g1" /><span className="g g2" /><span className="g g3" />
        <motion.span className="ring" style={{ x: sunX, y: sunY }} />
        <motion.span className="ring r2" style={{ x: sunX, y: sunY }} />
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
          <motion.div style={{ y: figScroll, scale: fr.z, originX: 0.5, originY: 1, x: `${(50 - fr.x) * 0.5}%` }} className="s13-h-fig-in">
            {photo ? <img src={photo} alt="" className={cutout ? 'cut' : 'blend'} fetchpriority="high" decoding="async" /> : <FigurePlaceholder />}
            {photo && cutout && <span className="refl"><img src={photo} alt="" /></span>}
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

      {/* running marquee strip */}
      <div className="s13-h-strip" aria-hidden="true">
        <div className="s13-h-strip-track">{[0, 1].map(k => <ul key={k}>{marquee.concat(marquee).map((t, i) => <li key={i}>{t}<i>&#10022;</i></li>)}</ul>)}</div>
      </div>

      <div className="s13-h-side l" aria-hidden="true">CONTEMPORARY MENSWEAR &nbsp;·&nbsp; MADURAI</div>
      <div className="s13-h-side r" aria-hidden="true">9.9252° N &nbsp;—&nbsp; 78.1198° E</div>

      {feat && (
        <motion.div className="s13-h-feat" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.15, ease: EASE }}>
          <Link to={`/product/${feat.slug}`} data-cursor="VIEW"><small>FEATURED</small><strong>{feat.name}</strong><em>{inr(feat.price)} <i aria-hidden="true">&rarr;</i></em></Link>
        </motion.div>
      )}
      {cats.length > 0 && (
        <motion.nav className="s13-h-index" aria-label="Categories" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.25, ease: EASE }}>
          <p>INDEX</p>
          <ul>{cats.map((c, i) => <li key={c.slug}><Link to={`/shop?category=${c.slug}`}><span>{String(i + 1).padStart(2, '0')}</span>{c.name}</Link></li>)}</ul>
        </motion.nav>
      )}
    </section>
  );
}
