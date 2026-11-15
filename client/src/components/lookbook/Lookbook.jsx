import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useApp } from '../../context/App';
import { inr } from '../../lib/format';
import { ProductMedia } from '../ProductCard3D';
import { Reveal } from '../Motion';
import { useIsMobile, useReduced } from '../../lib/hooks';

gsap.registerPlugin(ScrollTrigger);

// An interactive hotspot: a pulsing dot that opens the product name and price. Real products only.
function Hotspot({ p, x, y }) {
  const [open, setOpen] = useState(false);
  return (
    <span className={`s13-hot ${open ? 'on' : ''}`} style={{ left: `${x}%`, top: `${y}%` }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-label={`${p.name}: ${open ? 'hide' : 'show'} details`} aria-expanded={open} onClick={() => setOpen(o => !o)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} />
      <Link to={`/product/${p.slug}`} className="s13-hot-tip" tabIndex={open ? 0 : -1}><strong>{p.name}</strong><em>{inr(p.price)}</em><span>VIEW →</span></Link>
    </span>
  );
}

function Frame({ p, hot, className = '', idx }) {
  return (
    <figure className={`s13-lb-frame ${className}`}>
      <ProductMedia p={p} view={idx % 2} />
      {hot && <Hotspot p={p} x={hot[0]} y={hot[1]} />}
    </figure>
  );
}

export default function Lookbook() {
  const { catalog } = useApp();
  const reduced = useReduced(), mobile = useIsMobile();
  const strip = useRef(), pin = useRef();
  const items = catalog.featured;
  const [a, b, c, d, e, f] = [0, 1, 2, 3, 4, 5].map(i => items[i % Math.max(items.length, 1)]);

  useEffect(() => {
    if (reduced || mobile || !pin.current || !strip.current) return;
    const ctx = gsap.context(() => {
      const dist = () => strip.current.scrollWidth - pin.current.clientWidth;
      gsap.to(strip.current, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: pin.current, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
    }, pin);
    return () => ctx.revert();
  }, [reduced, mobile, items.length]);

  if (!items.length) return null;
  return (
    <section className="s13-lb" id="lookbook" aria-labelledby="lb-h">
      <Reveal className="s13-head s13-lb-head"><p className="s13-eyebrow"><i />THE LOOKBOOK</p><h2 id="lb-h" className="s13-h2">Four chapters, <em>one wardrobe.</em></h2></Reveal>

      {/* Chapter I — full-bleed */}
      <motion.article className="s13-lb-ch s13-ch1" initial={{ clipPath: 'inset(12% 8% 12% 8%)' }} whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}>
        <Frame p={a} hot={[62, 48]} idx={0} className="full" />
        <div className="s13-ch-copy"><span>CHAPTER I</span><h3>Off duty.</h3><p>Relaxed shapes for everyday movement.</p></div>
      </motion.article>

      {/* Chapter II — horizontal gallery, pinned on desktop, swipeable on touch */}
      <div ref={pin} className="s13-lb-pin">
        <div className="s13-ch-copy dark"><span>CHAPTER II</span><h3>In motion.</h3><p>Scroll sideways through the edit.</p></div>
        <div ref={strip} className="s13-lb-strip">
          {[a, b, c, d, e, f].map((p, i) => <Frame key={i} p={p} idx={i} hot={[50, 60]} className={`h${i % 3}`} />)}
        </div>
      </div>

      {/* Chapter III — vertical split */}
      <article className="s13-lb-ch s13-ch3">
        <Reveal className="s13-ch3-a"><Frame p={b} hot={[45, 55]} idx={1} className="tall" /></Reveal>
        <Reveal className="s13-ch3-b" delay={0.12}><span className="s13-big-no" aria-hidden="true">III</span><div className="s13-ch-copy dark"><span>CHAPTER III</span><h3>Quiet structure.</h3><p>Clean lines, considered proportions.</p><Link className="s13-link" to="/shop" data-cursor="SHOP">SHOP THE EDIT →</Link></div></Reveal>
        <Reveal className="s13-ch3-c" delay={0.2}><Frame p={d} hot={[50, 45]} idx={3} className="tall" /></Reveal>
      </article>

      {/* Chapter IV — overlapping collage */}
      <article className="s13-lb-ch s13-ch4">
        <Reveal className="s13-ch4-a"><Frame p={e} hot={[55, 50]} idx={4} className="tall" /></Reveal>
        <Reveal className="s13-ch4-b" delay={0.1}><Frame p={c} hot={[50, 50]} idx={2} className="wide" /></Reveal>
        <div className="s13-ch-copy dark s13-ch4-t"><span>CHAPTER IV</span><h3>After hours.</h3><p>Layers for the evening.</p></div>
      </article>
    </section>
  );
}
