import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useModal, useReduced } from '../lib/hooks';

// Cinematic opening: white screen, architectural grid, letters of SCOPE 13 reveal one by one, thin progress line.
// About 2.6 s; Skip / Esc / click end it at once. Never blocks the site (the page loads underneath).
const LETTERS = ['S', 'C', 'O', 'P', 'E', '\u00a0', '1', '3'];

export default function Intro({ onDone }) {
  const reduced = useReduced();
  const ref = useRef();
  useModal(true, onDone, ref);
  const [pct, setPct] = useState(0);
  useEffect(() => { if (reduced) return setPct(100); const t0 = performance.now(); let raf; const tick = t => { const k = Math.min(1, (t - t0) / 2300); setPct(Math.round(k * k * (3 - 2 * k) * 100)); if (k < 1) raf = requestAnimationFrame(tick) }; raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf) }, [reduced]);
  useEffect(() => { const t = setTimeout(onDone, reduced ? 400 : 2900); return () => clearTimeout(t) }, []); // eslint-disable-line

  return (
    <motion.div ref={ref} className="s13-intro" role="dialog" aria-modal="true" aria-label="SCOPE 13"
      initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}>
      <div className="s13-intro-grid" aria-hidden="true" />
      <div className="s13-intro-depth" aria-hidden="true" />
      <button className="s13-intro-skip" onClick={onDone}>SKIP</button>
      <div className="s13-intro-mid">
        <h1 className="s13-intro-mark" aria-label="SCOPE 13">
          {LETTERS.map((l, i) => (
            <span key={i} className="s13-intro-mask" aria-hidden="true">
              <motion.span initial={reduced ? false : { y: '110%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} transition={{ duration: 0.9, delay: 0.35 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span>
            </span>
          ))}
        </h1>
        <motion.p className="s13-intro-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}>A CLOTHING ERA</motion.p>
        <p className="s13-intro-pct" aria-hidden="true">{String(pct).padStart(3, '0')}%</p>
        <div className="s13-intro-bar" aria-hidden="true"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0.3 : 2.2, ease: [0.65, 0, 0.35, 1] }} /></div>
      </div>
    </motion.div>
  );
}
