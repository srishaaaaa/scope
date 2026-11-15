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

function Shelf({ id, label, title, link, items, aria }) {
  if (!items?.length) return null;
  return (
    <section className="s13-sec s13-shelf" id={id} aria-labelledby={`${id}-h`}>
      <div className="s13-wrap"><SectionHead id={`${id}-h`} label={label} title={title} link={link} /></div>
      <Scroller className="s13-pscroll" label={aria}>
        {items.map((p, i) => <div className="s13-pslide" key={p.id}><ProductCard p={p} index={i} /></div>)}
      </Scroller>
    </section>
  );
}

// Trending now: the pieces the store features (Admin → Inventory → Featured); if none are flagged, the newest pieces.
export function TrendingNow() {
  const items = useProducts(['/products?featured=1&limit=10', '/products?sort=newest&limit=10']);
  return <Shelf id="trending" label="TRENDING NOW" title="What everyone is wearing" link={['/shop', 'VIEW ALL →']} items={items} aria="trending now" />;
}

// Best sellers: only products flagged as best sellers. No invented rankings; the shelf stays out of the way if none are.
export function Bestsellers() {
  const items = useProducts(['/products?flag=best&limit=10']);
  return <Shelf id="best-sellers" label="BEST SELLERS" title="Most wanted" link={['/shop?flag=best', 'VIEW ALL →']} items={items} aria="best sellers" />;
}
