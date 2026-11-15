import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Reveal } from '../Motion';
import { menCategories } from '../../config/content';
import { useReduced } from '../../lib/hooks';

const hrefFor = c => c === 'New Arrivals' ? '/collections/new-arrivals' : c === 'Bestsellers' ? '/shop?flag=best' : `/search?q=${encodeURIComponent(c)}`;

// Drag / swipe / wheel horizontal collection strip with 3D coverflow depth based on distance from the centre.
function Card({ c, i, x, w }) {
  const reduced = useReduced();
  const ref = useRef();
  const rel = useTransform(x, v => {
    const el = ref.current; if (!el) return 0;
    const cx = el.offsetLeft + v + el.offsetWidth / 2;
    return Math.max(-1, Math.min(1, (cx - w.current / 2) / (w.current / 2)));
  });
  const rotateY = useTransform(rel, [-1, 0, 1], reduced ? [0, 0, 0] : [26, 0, -26]);
  const scale = useTransform(rel, [-1, 0, 1], reduced ? [1, 1, 1] : [0.88, 1, 0.88]);
  return (
    <motion.li ref={ref} className="s13-cf-card" style={{ rotateY, scale }}>
      <Link to={hrefFor(c)} data-cursor="VIEW" draggable={false}>
        <span className="s13-cf-no">{String(i + 1).padStart(2, '0')}</span>
        <span className="s13-cf-name">{c}</span>
        <span className="s13-cf-go" aria-hidden="true">↗</span>
        <span className="s13-cf-glyph" aria-hidden="true">{c.slice(0, 2).toUpperCase()}</span>
      </Link>
    </motion.li>
  );
}

export default function CollectionGallery() {
  const track = useRef(), wrap = useRef(), w = useRef(1200);
  const [limit, setLimit] = useState(-2400);
  const x = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 140, damping: 26 });
  const measure = () => { if (!wrap.current || !track.current) return; w.current = wrap.current.offsetWidth; setLimit(Math.min(0, wrap.current.offsetWidth - track.current.scrollWidth)) };
  const nudge = d => { measure(); const lim = Math.min(0, wrap.current.offsetWidth - track.current.scrollWidth); x.set(Math.max(lim, Math.min(0, x.get() + d))) };
  return (
    <section className="s13-sec s13-cf" aria-labelledby="cf-h" id="collections">
      <Reveal className="s13-head"><p className="s13-eyebrow"><i />THE COLLECTIONS</p><h2 id="cf-h" className="s13-h2">Choose your <em>wardrobe.</em></h2><p className="s13-sub">Drag, swipe or use the arrows through {menCategories.length} departments of menswear.</p></Reveal>
      <div className="s13-cf-wrap" ref={wrap} onPointerEnter={measure}>
        <motion.ul ref={track} className="s13-cf-track" style={{ x: sx }} drag="x" dragConstraints={{ left: limit, right: 0 }} dragElastic={0.08} onDragStart={measure}>
          {menCategories.map((c, i) => <Card key={c} c={c} i={i} x={sx} w={w} />)}
        </motion.ul>
      </div>
      <div className="s13-cf-ctl">
        <button className="s13-round" onClick={() => nudge(360)} aria-label="Previous collections">←</button>
        <button className="s13-round" onClick={() => nudge(-360)} aria-label="Next collections">→</button>
      </div>
    </section>
  );
}
