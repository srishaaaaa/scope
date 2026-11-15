import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/App';
import { apiRetry } from '../../lib/api';
import { useReduced } from '../../lib/hooks';
import { ProductMedia } from '../ProductCard3D';
import { coverStyle } from '../../lib/imgPos';

// Sideways showcase driven by plain scroll position (CSS sticky + one transform), so it is steady on phones and desktops:
// the section is as tall as the sideways distance plus one screen, the panel sticks while you scroll, and the track slides
// left in step with the scroll (no smoothing lag, no pin spacer, no per-frame style churn). The card nearest the focus
// point turns dark and the progress bar fills. Cards are the store's live categories. Reduced motion: a plain swipeable row.
export default function HorizontalShowcase() {
  const { catalog } = useApp();
  const reduced = useReduced();
  const root = useRef(), track = useRef(), bar = useRef(), count = useRef();
  const cats = catalog.categories.filter(c => c.product_count > 0).slice(0, 12);
  const [lead, setLead] = useState({});
  const key = cats.map(c => c.slug).join(',');

  useEffect(() => {
    let dead = false;
    Promise.all(cats.map(c => apiRetry(`/products?category=${c.slug}&limit=1`).then(d => d.items?.[0] || null).catch(() => null)))
      .then(r => !dead && setLead(Object.fromEntries(cats.map((c, i) => [c.slug, r[i]]))));
    return () => { dead = true };
  }, [key]); // eslint-disable-line

  useEffect(() => {
    const el = root.current, tr = track.current;
    if (reduced || !cats.length || !el || !tr) return;
    const cards = [...tr.querySelectorAll('.hs-card')];
    let dist = 0, top = 0, raf = 0, last = null, active = -1;
    const update = () => {
      raf = 0;
      const p = dist ? Math.min(1, Math.max(0, (window.scrollY - top) / dist)) : 0;
      const x = Math.round(-p * dist * 2) / 2; // half-pixel steps keep text crisp
      if (x !== last) { tr.style.transform = `translate3d(${x}px,0,0)`; last = x; bar.current?.style.setProperty('--p', p.toFixed(4)) }
      const focus = window.innerWidth * (window.innerWidth < 900 ? 0.5 : 0.56);
      let best = 0, bd = 1e9;
      cards.forEach((c, i) => { const r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - focus); if (d < bd) { bd = d; best = i } });
      if (best !== active) { cards.forEach((c, i) => c.classList.toggle('on', i === best)); active = best; if (count.current) count.current.textContent = `${String(best + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}` }
    };
    const measure = () => {
      tr.style.transform = 'translate3d(0,0,0)';
      dist = Math.max(0, tr.scrollWidth - window.innerWidth);
      el.style.height = `${dist + window.innerHeight}px`;
      top = el.getBoundingClientRect().top + window.scrollY;
      last = null; update();
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    const imgs = [...tr.querySelectorAll('img')]; imgs.forEach(i => i.addEventListener('load', measure));
    const t = setTimeout(measure, 1200); // after fonts and photos have settled
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', measure); imgs.forEach(i => i.removeEventListener('load', measure)); cancelAnimationFrame(raf); el.style.height = ''; tr.style.transform = '' };
  }, [reduced, key, Object.keys(lead).length]); // eslint-disable-line

  if (!cats.length) return null;
  return (
    <section ref={root} className={`hs ${reduced ? 'plain' : ''}`} id="categories" aria-labelledby="hs-h">
      <div className="hs-pin">
        <div ref={track} className="hs-track">
          <div className="hs-head">
            <p className="s13-label"><i />SHOP BY CATEGORY</p>
            <h2 id="hs-h">FIND YOUR<br />FIT, BY<br />CATEGORY.</h2>
            <p className="hs-sub">Scroll to move through every department of the store.</p>
            <span className="hs-hint" aria-hidden="true">SCROLL <i /></span>
          </div>
          {cats.map((c, i) => (
            <Link key={c.slug} to={`/shop?category=${c.slug}`} className="hs-card" data-cursor="SHOP">
              <span className="hs-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="hs-go" aria-hidden="true">↗</span>
              <span className="hs-img"><span>{c.image_url ? <img className="cov" src={c.image_url} alt="" loading="eager" decoding="async" draggable={false} style={coverStyle(c.image_pos)} /> : <ProductMedia p={lead[c.slug] || { slug: c.slug, name: c.name }} />}</span></span>
              <span className="hs-meta"><small>COLLECTION</small><strong>{c.name}</strong><em>{c.product_count} {c.product_count === 1 ? 'piece' : 'pieces'} · Shop now</em></span>
            </Link>
          ))}
        </div>
        <div className="hs-prog" aria-hidden="true"><i ref={bar} /><span ref={count}>01 / {String(cats.length).padStart(2, '0')}</span></div>
      </div>
    </section>
  );
}
