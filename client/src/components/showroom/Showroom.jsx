import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRetry } from '../../lib/api';
import { inr } from '../../lib/format';
import { useApp } from '../../context/App';
import { Reveal } from '../Motion';
import { useIsMobile, useReduced, hasWebGL } from '../../lib/hooks';
import { ProductMedia } from '../ProductCard3D';

const ShowroomScene = lazy(() => import('./ShowroomScene'));

// The virtual showroom. Zones are real products from the catalogue (never hard-coded). Phones, reduced-motion users and
// browsers without WebGL get a lightweight swipeable gallery of the same zones instead of the 3D scene.
export default function Showroom() {
  const { catalog } = useApp();
  const nav = useNavigate();
  const mobile = useIsMobile(), reduced = useReduced();
  const [zone, setZone] = useState(0);
  const [lists, setLists] = useState({ newest: [], best: [] });
  useEffect(() => {
    let dead = false;
    Promise.all([apiRetry('/products?sort=newest&limit=3').catch(() => ({ items: [] })), apiRetry('/products?flag=best&limit=3').catch(() => ({ items: [] }))])
      .then(([n, b]) => !dead && setLists({ newest: n.items || [], best: b.items || [] }));
    return () => { dead = true };
  }, []);
  const zones = [
    { name: 'FEATURED', items: catalog.featured.slice(0, 3) },
    { name: 'NEW ARRIVALS', items: lists.newest },
    { name: 'BESTSELLERS', items: lists.best },
  ].filter(z => z.items.length);
  const d3 = !mobile && !reduced && hasWebGL();
  if (!zones.length) return null;
  const cur = Math.min(zone, zones.length - 1);

  return (
    <section className="s13-sec s13-sr" id="showroom" aria-labelledby="sr-h">
      <Reveal className="s13-head s13-head-c"><p className="s13-eyebrow"><i />VIRTUAL SHOWROOM</p><h2 id="sr-h" className="s13-h2">Walk the <em>collection.</em></h2><p className="s13-sub">{d3 ? 'Move your cursor to look around. Choose a zone, then open a piece.' : 'Swipe through the zones and open a piece.'}</p></Reveal>
      <div className="s13-sr-tabs" role="tablist" aria-label="Showroom zones">
        {zones.map((z, i) => <button key={z.name} role="tab" aria-selected={cur === i} className={cur === i ? 'on' : ''} onClick={() => setZone(i)}><span>{String(i + 1).padStart(2, '0')}</span>{z.name}</button>)}
      </div>
      <div className="s13-sr-stage">
        {d3
          ? <Suspense fallback={<div className="s13-sr-load skel" aria-label="Loading showroom" />}><ShowroomScene zones={zones} target={cur} reduced={reduced} fmt={inr} go={p => nav(`/product/${p.slug}`)} /></Suspense>
          : (
            <ul className="s13-sr-lite" aria-label={zones[cur].name}>
              {zones[cur].items.map(p => (
                <li key={p.slug}><Link to={`/product/${p.slug}`} data-cursor="VIEW"><span className="s13-sr-img"><ProductMedia p={p} /></span><strong>{p.name}</strong><em>{inr(p.price)}</em></Link></li>
              ))}
            </ul>
          )}
        <span className="s13-sr-hint" aria-hidden="true">{zones[cur].name}</span>
      </div>
    </section>
  );
}
