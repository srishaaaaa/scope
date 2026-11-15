import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRetry } from '../../lib/api';
import { Reveal } from '../Motion';
import { ProductMedia } from '../ProductCard3D';
import Scroller from './Scroller';

// Trending collections. Each links to the real catalogue filtered by category slugs, and its photography is the lead
// pieces of that category (never invented). Cards use different compositions so the strip has an editorial rhythm.
const COLS = [
  ['Oversized Tees', 'oversized-t-shirts', 'tall'], ['Casual Shirts', 'casual-shirts', 'wide'], ['Streetwear', 'hoodies,jackets,cargo-pants', 'sq'],
  ['Everyday Essentials', 't-shirts,polo-t-shirts', 'tall'], ['Co-ord Sets', 'co-ord-sets', 'wide'], ['Premium Bottomwear', 'jeans,trousers', 'sq'],
];

export default function Trending() {
  const [data, setData] = useState({});
  useEffect(() => {
    let dead = false;
    Promise.all(COLS.map(([, cat]) => apiRetry(`/products?category=${cat}&limit=2`).catch(() => ({ items: [], total: 0 }))))
      .then(r => !dead && setData(Object.fromEntries(COLS.map(([n], i) => [n, r[i]]))));
    return () => { dead = true };
  }, []);
  return (
    <section className="s13-sec s13-trend" id="trending" aria-labelledby="trend-h">
      <div className="s13-wrap">
        <Reveal className="s13-head s13-head-row">
          <div><p className="s13-label"><i />TRENDING NOW</p><h2 id="trend-h" className="s13-h2">What everyone is <em>wearing.</em></h2></div>
          <Link className="s13-link" to="/collections" data-cursor="VIEW">VIEW ALL COLLECTIONS →</Link>
        </Reveal>
      </div>
      <Scroller className="s13-trend-scroll" label="trending collections">
        {COLS.map(([name, cat, tone], i) => {
          const d = data[name] || { items: [], total: 0 };
          const [a, b] = d.items;
          return (
            <Link key={name} to={`/shop?category=${cat}`} className={`s13-tcard ${tone}`} draggable={false} data-cursor="SHOP">
              <span className="s13-tcard-img">
                <span className="a"><ProductMedia p={a || { slug: name, name }} view={0} /></span>
                <span className="b"><ProductMedia p={b || a || { slug: name + 'b', name }} view={1} /></span>
              </span>
              <span className="s13-tcard-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="s13-tcard-t"><strong>{name}</strong><em>{d.total ? `${d.total} ${d.total === 1 ? 'piece' : 'pieces'}` : 'Explore'}</em><i aria-hidden="true">↗</i></span>
            </Link>
          );
        })}
      </Scroller>
    </section>
  );
}
