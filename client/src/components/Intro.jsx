import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useModal, useReduced } from '../lib/hooks';

// Cinematic opening, about 3 s, skippable (button, Esc, or any click). The page loads underneath.
// 1. a dark stage with a drawn frame and grid lines  2. the letters rise out of a blur  3. a light sweep crosses the
// wordmark  4. a counter runs to 100  5. the screen splits left/right and opens onto the site.
const LETTERS = ['S', 'C', 'O', 'P', 'E', ' ', '1', '3'];
const EASE = [0.22, 1, 0.36, 1];

export default function Intro({ onDone }) {
  const reduced = useReduced();
  const ref = useRef();
  useModal(true, onDone, ref);
  const [pct, setPct] = useState(0);
  useEffect(() => { const t = setTimeout(onDone, reduced ? 500 : 3300); return () => clearTimeout(t) }, []); // eslint-disable-line
  useEffect(() => {
    if (reduced) return setPct(100);
    const t0 = performance.now(); let raf;
    const tick = t => { const k = Math.min(1, (t - t0) / 2700); setPct(Math.round((1 - Math.pow(1 - k, 3)) * 100)); if (k < 1) raf = requestAnimationFrame(tick) };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <motion.div ref={ref} className="s13-intro" role="dialog" aria-modal="true" aria-label="SCOPE 13" onClick={onDone} exit={{ transition: { duration: 0.9 } }}>
      <motion.i className="s13-in-half l" aria-hidden="true" initial={{ x: 0 }} exit={{ x: '-101%' }} transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }} />
      <motion.i className="s13-in-half r" aria-hidden="true" initial={{ x: 0 }} exit={{ x: '101%' }} transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }} />

      <motion.div className="s13-in-stage" exit={{ opacity: 0, scale: 1.06 }} transition={{ duration: 0.5 }}>
        <div className="s13-in-glow" aria-hidden="true" />
        <motion.span className="s13-in-v" aria-hidden="true" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.3, delay: 0.1, ease: EASE }} />
        <motion.span className="s13-in-h" aria-hidden="true" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.3, delay: 0.25, ease: EASE }} />
        {['tl', 'tr', 'bl', 'br'].map((c, i) => <motion.span key={c} className={`s13-in-c ${c}`} aria-hidden="true" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: EASE }} />)}

        <button className="s13-intro-skip" onClick={e => { e.stopPropagation(); onDone() }}>SKIP</button>

        <div className="s13-in-mid">
          <motion.p className="s13-in-top" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>CONTEMPORARY MENSWEAR &nbsp;/&nbsp; MADURAI</motion.p>
          <h1 className="s13-in-mark" aria-label="SCOPE 13">
            {LETTERS.map((l, i) => (
              <span key={i} className="s13-in-mask" aria-hidden="true">
                <motion.span initial={reduced ? false : { y: '112%', opacity: 0, filter: 'blur(14px)' }} animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 1.05, delay: 0.45 + i * 0.075, ease: EASE }}>{l}</motion.span>
              </span>
            ))}
            <motion.i className="s13-in-sweep" aria-hidden="true" initial={{ x: '-130%' }} animate={{ x: '130%' }} transition={{ duration: 1.15, delay: 1.45, ease: [0.4, 0, 0.2, 1] }} />
          </h1>
          <motion.p className="s13-in-sub" initial={{ opacity: 0, letterSpacing: '1em' }} animate={{ opacity: 1, letterSpacing: '.5em' }} transition={{ delay: 1.2, duration: 1.1, ease: EASE }}>A NEW ERA OF EVERYDAY STYLE</motion.p>
        </div>

        <div className="s13-in-foot" aria-hidden="true">
          <span className="s13-in-count">{String(pct).padStart(3, '0')}<small>%</small></span>
          <span className="s13-in-bar"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0.3 : 2.7, ease: [0.65, 0, 0.35, 1] }} /></span>
          <span className="s13-in-loc">9.9252° N &nbsp;—&nbsp; 78.1198° E</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
