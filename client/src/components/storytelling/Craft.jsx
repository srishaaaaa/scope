import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useApp } from '../../context/App';
import { Reveal } from '../Motion';
import { ProductMedia } from '../ProductCard3D';
import { media } from '../../config/content';

// Fabric & detail storytelling. Close-up photography (media.details / admin) is shown when supplied; otherwise a live
// magnifier lets visitors inspect real product photography up close. No fabric specifications are stated or invented.
const LOOK_AT = ['Collar', 'Sleeve', 'Stitching', 'Hem', 'Fabric surface', 'Buttons & fastenings'];

function Lens({ p }) {
  const ref = useRef();
  const [on, setOn] = useState(false);
  const x = useMotionValue(50), y = useMotionValue(50);
  const sx = useSpring(x, { stiffness: 200, damping: 24 }), sy = useSpring(y, { stiffness: 200, damping: 24 });
  const origin = useTransform([sx, sy], ([a, b]) => `${a}% ${b}%`);
  const move = e => { const r = ref.current.getBoundingClientRect(); x.set(((e.clientX - r.left) / r.width) * 100); y.set(((e.clientY - r.top) / r.height) * 100) };
  return (
    <div ref={ref} className={`s13-lens ${on ? 'on' : ''}`} onPointerEnter={() => setOn(true)} onPointerLeave={() => setOn(false)} onPointerMove={move} data-cursor="ZOOM">
      <div className="s13-lens-base"><ProductMedia p={p} /></div>
      <motion.div className="s13-lens-zoom" aria-hidden="true" style={{ transformOrigin: origin }}><ProductMedia p={p} /></motion.div>
      <span className="s13-lens-hint" aria-hidden="true">{on ? 'MACRO VIEW' : 'HOVER TO INSPECT'}</span>
    </div>
  );
}

export default function Craft() {
  const { catalog } = useApp();
  const p = catalog.featured[0];
  return (
    <section className="s13-sec s13-craft" id="craft" aria-labelledby="craft-h">
      <Reveal className="s13-head"><p className="s13-eyebrow"><i />FABRIC &amp; CRAFTSMANSHIP</p><h2 id="craft-h" className="s13-h2">Look <em>closer.</em></h2><p className="s13-sub">Details are where a garment earns its place. Come and feel them in the boutique, or inspect them here.</p></Reveal>
      <div className="s13-craft-grid">
        {media.details.length > 0
          ? <div className="s13-craft-photos">{media.details.map((d, i) => <Reveal key={d.src} delay={i * 0.06}><img src={d.src} alt={d.alt} loading="lazy" /></Reveal>)}</div>
          : p && <Reveal className="s13-craft-lens"><Lens p={p} /></Reveal>}
        <Reveal className="s13-craft-list" delay={0.1}>
          <p className="s13-craft-k">WHAT TO LOOK FOR</p>
          <ul>{LOOK_AT.map((t, i) => <li key={t}><span>{String(i + 1).padStart(2, '0')}</span>{t}</li>)}</ul>
          {p && <Link className="s13-link" to={`/product/${p.slug}`} data-cursor="VIEW">VIEW {p.name.toUpperCase()} →</Link>}
        </Reveal>
      </div>
    </section>
  );
}
