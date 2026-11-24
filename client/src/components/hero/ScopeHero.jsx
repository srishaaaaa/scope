import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useApp } from '../../context/App';
import { useFinePointer, useReduced } from '../../lib/hooks';
import { Magnetic } from '../Motion';
import FigurePlaceholder from '../home/FigurePlaceholder';
import { media } from '../../config/content';
import { decodePos } from '../../lib/imgPos';
import { inr } from '../../lib/format';
import { apiRetry } from '../../lib/api';
import { useSiteText } from '../../lib/siteText';

const EASE = [0.22, 1, 0.36, 1];
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const WORD = ['S', 'C', 'O', 'P', 'E', ' ', '1', '3'];

// Editorial hero set like a quiet studio: a pale ice-blue disc and fine rings behind the model, architectural slabs
// standing on a floor, a slow beam of light, a halftone dot patch and a faint floor reflection. The giant SCOPE 13
// wordmark sits between the set and the model so the letters pass behind him. Every layer sits at its own depth and
// answers the pointer and the scroll by a different amount.
// The figure is the supplied hero cut-out (or the admin hero photo, or a product photo, or a neutral placeholder).
export default function ScopeHero() {
  const { entered, site, catalog } = useApp();
  const base = site.branding?.heroModel || media.heroCutout || catalog.featured.find(p => p.image)?.image || null;
  // Extra outfits uploaded in Admin → Storefront images → Hero outfits; the hero cycles through them.
  const looks = [base, ...(site.branding?.heroLooks || [])].filter(Boolean);
  const [li, setLi] = useState(0);
  const idx = looks.length ? li % looks.length : 0;
  const photo = looks[idx] || null;
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (looks.length < 2 || paused || reducedMotion()) return; const id = setInterval(() => setLi(n => n + 1), 5500); return () => clearInterval(id) }, [looks.length, paused]);
  const step = d => setLi(n => (n + d + looks.length) % looks.length);
  const fr = decodePos(site.branding?.heroModelPos);
  const cutout = !!photo && /\.(png|webp|avif)(\?|#|$)/i.test(photo);
  const reduced = useReduced(), fine = useFinePointer();
  const ref = useRef();
  const show = entered;
  const t = useSiteText();
  // The index lists the categories chosen in Admin → Storefront images → Homepage picks (in that order); with none chosen, the first five.
  const live = catalog.categories.filter(c => c.product_count > 0);
  const chosen = (site.homepage?.categories || []).map(s => live.find(c => c.slug === s)).filter(Boolean);
  const cats = (chosen.length ? chosen : live).slice(0, 6);
  // The hero's Featured chip is the first piece picked in Admin → Trending; until one is picked it falls back to the first featured piece.
  const pick = site.homepage?.trending?.[0];
  const [picked, setPicked] = useState(null);
  useEffect(() => { let dead = false; if (!pick) { setPicked(null); return } apiRetry(`/products?slugs=${encodeURIComponent(pick)}&limit=1`).then(d => !dead && setPicked(d.items?.[0] || null)).catch(() => {}); return () => { dead = true } }, [pick]);
  const [dl, setDl] = useState(null);
  useEffect(() => { let dead = false; apiRetry('/delivery-info').then(x => !dead && setDl(x)).catch(() => {}); return () => { dead = true } }, []);
  const feat = picked || catalog.featured[0];
  const picks = catalog.featured.filter(p => p.slug !== feat?.slug).slice(0, 1);
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
            {photo ? <img key={photo} src={photo} alt="" className={(cutout ? 'cut' : 'blend') + ' look-in'} fetchpriority="high" decoding="async" /> : <FigurePlaceholder />}
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

      {looks.length > 1 && (
        <div className="s13-h-looks" role="group" aria-label="Outfits" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <button type="button" aria-label="Previous outfit" onClick={() => step(-1)}>&#8249;</button>
          <span className="dots">{looks.map((_, i) => <button type="button" key={i} aria-label={`Outfit ${i + 1}`} aria-current={i === idx} className={i === idx ? 'on' : ''} onClick={() => setLi(i)} />)}</span>
          <button type="button" aria-label="Next outfit" onClick={() => step(1)}>&#8250;</button>
        </div>
      )}

      {/* running marquee strip */}
      <div className="s13-h-strip" aria-hidden="true">
        <div className="s13-h-strip-track">{[0, 1].map(k => <ul key={k}>{marquee.concat(marquee).map((t, i) => <li key={i}>{t}<i>&#10022;</i></li>)}</ul>)}</div>
      </div>

      <span className="s13-h-dots" aria-hidden="true" />
      <span className="s13-h-ruler" aria-hidden="true"><i>00</i><i>50</i><i>100</i></span>
      <div className="s13-h-side l" aria-hidden="true">CONTEMPORARY MENSWEAR &nbsp;·&nbsp; MADURAI</div>
      <div className="s13-h-side r" aria-hidden="true">9.9252° N &nbsp;—&nbsp; 78.1198° E</div>

      {feat && (
        <motion.div className="s13-h-feat" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.15, ease: EASE }}>
          <Link to={`/product/${feat.slug}`} data-cursor="VIEW"><small>FEATURED</small><strong>{feat.name}</strong><em>{inr(feat.price)} <i aria-hidden="true">&rarr;</i></em></Link>
        </motion.div>
      )}
      {cats.length > 0 && (
        <motion.aside className="s13-h-info" aria-label="Shop by category" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.35, ease: EASE }}>
          <p>SHOP BY CATEGORY</p>
          <ul>{cats.slice(0, 2).map((c, i) => <li key={c.slug}><Link to={`/shop?category=${c.slug}`}><small>{String(i + 1).padStart(2, '0')}</small><span>{c.name}</span><i aria-hidden="true">&rarr;</i></Link></li>)}</ul>
        </motion.aside>
      )}
      {true && (
        <motion.aside className="s13-h-picks" aria-label={picks.length ? 'Trending now' : 'Shop by category'} initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.25, ease: EASE }}>
          <p>NEW SEASON</p>
          <Link className="edit" to="/collections/new-arrivals" data-cursor="NEW">
            <strong>New<br />Arrivals</strong>
            <span>Fresh shirts, tees &amp; trousers, just landed.</span>
            <em>{dl?.freeOver ? `Free delivery over ${inr(dl.freeOver)}` : 'Explore now'} <i aria-hidden="true">&rarr;</i></em>
          </Link>
        </motion.aside>
      )}
      {cats.length > 0 && (
        <motion.nav className="s13-h-index" aria-label="Categories" initial={{ opacity: 0, y: 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 1.25, ease: EASE }}>
          <p>{t.heroIndexTitle}</p>
          <ul>{cats.map((c, i) => <li key={c.slug}><Link to={`/shop?category=${c.slug}`}><span>{String(i + 1).padStart(2, '0')}</span>{c.name}</Link></li>)}</ul>
        </motion.nav>
      )}
    </section>
  );
}
