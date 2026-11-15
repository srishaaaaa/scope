import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../../context/App';
import { apiRetry } from '../../lib/api';
import { useIsMobile, useReduced } from '../../lib/hooks';
import { ProductMedia } from '../ProductCard3D';

gsap.registerPlugin(ScrollTrigger);

// Pinned sideways showcase: while you scroll down the page, the section stays put and its content slides left. The card
// nearest the focus point turns dark, its photograph drifts against the motion, and a progress bar fills. Cards are the
// store's live categories (with their lead product photo), so they always match the catalogue. On phones and for
// reduced-motion users it is a normal swipeable row.
export default function HorizontalShowcase() {
  const { catalog } = useApp();
  const reduced = useReduced(), mobile = useIsMobile();
  const root = useRef(), pinEl = useRef(), track = useRef(), bar = useRef(), count = useRef();
  const cats = catalog.categories.filter(c => c.product_count > 0).slice(0, 9);
  const [lead, setLead] = useState({});
  const key = cats.map(c => c.slug).join(',');

  useEffect(() => {
    let dead = false;
    Promise.all(cats.map(c => apiRetry(`/products?category=${c.slug}&limit=1`).then(d => d.items?.[0] || null).catch(() => null)))
      .then(r => !dead && setLead(Object.fromEntries(cats.map((c, i) => [c.slug, r[i]]))));
    return () => { dead = true };
  }, [key]); // eslint-disable-line

  useEffect(() => {
    if (reduced || mobile || !cats.length || !track.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.hs-card', track.current);
      const dist = () => Math.max(0, track.current.scrollWidth - window.innerWidth);
      const paint = () => {
        const focus = window.innerWidth * 0.56;
        let best = 0, bd = 1e9;
        cards.forEach((c, i) => {
          const r = c.getBoundingClientRect(), mid = r.left + r.width / 2, d = Math.abs(mid - focus);
          c.style.setProperty('--p', ((mid - window.innerWidth / 2) / window.innerWidth).toFixed(3));
          if (d < bd) { bd = d; best = i }
        });
        cards.forEach((c, i) => c.classList.toggle('on', i === best));
        if (count.current) count.current.textContent = `${String(best + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      };
      gsap.to(track.current, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist() + window.innerHeight * 0.3}`, pin: pinEl.current, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: self => { if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`; paint() }, onRefresh: paint },
      });
      paint();
    }, root);
    return () => ctx.revert();
  }, [reduced, mobile, key, Object.keys(lead).length]); // eslint-disable-line

  if (!cats.length) return null;
  return (
    <section ref={root} className="hs" id="categories" aria-labelledby="hs-h">
      <div ref={pinEl} className="hs-pin">
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
              <span className="hs-img"><span><ProductMedia p={lead[c.slug] || { slug: c.slug, name: c.name }} /></span></span>
              <span className="hs-meta"><small>COLLECTION</small><strong>{c.name}</strong><em>{c.product_count} {c.product_count === 1 ? 'piece' : 'pieces'} · Shop now</em></span>
            </Link>
          ))}
        </div>
        <div className="hs-prog" aria-hidden="true"><i ref={bar} /><span ref={count}>01 / {String(cats.length).padStart(2, '0')}</span></div>
      </div>
    </section>
  );
}
