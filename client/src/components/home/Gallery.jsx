import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/App';
import { Reveal } from '../Motion';
import SectionHead from './SectionHead';
import { ProductMedia } from '../ProductCard3D';
import { useModal } from '../../lib/hooks';

const SPANS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];

function Lightbox({ items, index, setIndex, onClose }) {
  const ref = useRef(); useModal(true, onClose, ref);
  const N = items.length, it = items[index];
  useEffect(() => {
    const k = e => { if (e.key === 'ArrowRight') setIndex(i => (i + 1) % N); if (e.key === 'ArrowLeft') setIndex(i => (i + N - 1) % N) };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [N, setIndex]);
  return (
    <motion.div ref={ref} className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button className="icon-btn close" onClick={onClose} aria-label="Close viewer">✕</button>
      <button className="icon-btn nav prev" onClick={() => setIndex(i => (i + N - 1) % N)} aria-label="Previous image">‹</button>
      <AnimatePresence mode="wait"><motion.div key={index} className="lb-img" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        {it.src ? <img src={it.src} alt={it.alt} /> : <ProductMedia p={it.p} />}
      </motion.div></AnimatePresence>
      <button className="icon-btn nav next" onClick={() => setIndex(i => (i + 1) % N)} aria-label="Next image">›</button>
      <p className="lb-count" aria-live="polite">{index + 1} / {N}</p>
    </motion.div>
  );
}

// Editorial gallery: an asymmetric magazine layout (varied ratios, one full-width plate) built from the campaign image and
// real catalogue photography, with a keyboard-friendly lightbox.
export default function Gallery() {
  const { catalog } = useApp();
  const [open, setOpen] = useState(null);
  const items = catalog.featured.slice(0, 6).map(p => ({ p, alt: p.name }));
  if (!items.length) return null;
  return (
    <section className="s13-sec s13-gallery" id="gallery" aria-labelledby="gal-h">
      <div className="s13-wrap">
        <SectionHead id="gal-h" center label="IMAGE GALLERY" title="Style, in frame" />
        <div className="s13-gal-grid">
          {items.map((it, i) => (
            <Reveal key={i} className={`s13-gal ${SPANS[i % SPANS.length]}`} delay={(i % 3) * 0.07}>
              <button type="button" onClick={() => setOpen(i)} aria-label={`Open image ${i + 1}: ${it.alt}`} data-cursor="VIEW">
                {it.src ? <img src={it.src} alt="" loading="lazy" /> : <ProductMedia p={it.p} />}
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      <AnimatePresence>{open != null && <Lightbox items={items} index={open} setIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
