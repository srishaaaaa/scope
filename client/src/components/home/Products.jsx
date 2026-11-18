import { useEffect, useState } from 'react';
import { apiRetry } from '../../lib/api';
import ProductCard from '../ProductCard3D';
import Scroller from './Scroller';
import SectionHead from './SectionHead';

function useProducts(paths) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let dead = false;
    (async () => {
      for (const p of paths) {
        try { const d = await apiRetry(p); if (d.items?.length) { if (!dead) setItems(d.items); return } } catch { /* try the next source */ }
      }
      if (!dead) setItems([]);
    })();
    return () => { dead = true };
  }, [paths.join('|')]); // eslint-disable-line
  return items;
}

function Shelf({ id, label, title, link, items, aria, badge, ghost, dark }) {
  if (!items?.length) return null;
  return (
    <section className={`s13-sec s13-shelf ${dark ? 'dark' : ''}`} id={id} aria-labelledby={`${id}-h`}>
      <div className="s13-wrap s13-shelf-top"><span className="s13-gw" aria-hidden="true">{ghost}</span><SectionHead id={`${id}-h`} label={label} title={title} link={link} /></div>
      <Scroller className="s13-pscroll" label={aria}>
        {items.map((p, i) => <div className="s13-pslide" key={p.id}>{badge && <span className="s13-chip">{badge}</span>}<ProductCard p={p} index={i} /></div>)}
      </Scroller>
    </section>
  );
}

// New arrivals, shirts: the newest shirts in the store (falls back to the newest pieces if there are no shirts yet).
const SHIRTS = 'shirts,casual-shirts,formal-shirts';
export function TrendingNow() {
  const items = useProducts([`/products?category=${SHIRTS}&sort=newest&limit=10`, '/products?sort=newest&limit=10']);
  return <Shelf id="trending" label="NEW ARRIVALS" title="Shirts" link={[`/shop?category=${SHIRTS}&sort=newest`, 'VIEW ALL →']} items={items} aria="new arrival shirts" badge="NEW" ghost="NEW" />;
}

// New arrivals, pants: the newest jeans, trousers and cargo pants (this shelf replaced Best Sellers on the home page; the section keeps its
// old id so its styling and links still work). Falls back to the newest pieces if there are no pants yet.
const PANTS = 'jeans,trousers,cargo-pants';
export function Bestsellers() {
  const items = useProducts([`/products?category=${PANTS}&sort=newest&limit=10`, '/products?sort=newest&limit=10']);
  return <Shelf id="best-sellers" label="NEW ARRIVALS" title="Pants" link={[`/shop?category=${PANTS}&sort=newest`, 'VIEW ALL →']} items={items} aria="new arrival pants" badge="NEW" ghost="NEW" />;
}
