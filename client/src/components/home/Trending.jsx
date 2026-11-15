import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiRetry } from '../../lib/api';
import { ProductMedia } from '../ProductCard3D';
import SectionHead from './SectionHead';

// Shop by category: six portrait tiles. Each links to the real catalogue (category slugs), and its photograph is the lead
// piece of that category, so the tiles always match what is in stock.
const TILES = [
  ['New Arrivals', '/collections/new-arrivals', '/products?sort=newest&limit=1'],
  ['Shirts', '/shop?category=shirts,casual-shirts,formal-shirts', '/products?category=shirts,casual-shirts,formal-shirts&limit=1'],
  ['Pants', '/shop?category=jeans,trousers,cargo-pants', '/products?category=jeans,trousers,cargo-pants&limit=1'],
  ['Outerwear', '/shop?category=jackets,hoodies', '/products?category=jackets,hoodies&limit=1'],
  ['T-Shirts', '/shop?category=t-shirts,oversized-t-shirts,polo-t-shirts', '/products?category=t-shirts,oversized-t-shirts,polo-t-shirts&limit=1'],
  ['Co-ord Sets', '/shop?category=co-ord-sets', '/products?category=co-ord-sets&limit=1'],
];

export default function ShopCategories() {
  const [lead, setLead] = useState({});
  useEffect(() => {
    let dead = false;
    Promise.all(TILES.map(([, , q]) => apiRetry(q).then(d => d.items?.[0] || null).catch(() => null)))
      .then(r => !dead && setLead(Object.fromEntries(TILES.map(([n], i) => [n, r[i]]))));
    return () => { dead = true };
  }, []);
  return (
    <section className="s13-sec s13-cats" id="categories" aria-labelledby="cats-h">
      <div className="s13-wrap">
        <SectionHead id="cats-h" center label="SHOP BY CATEGORY" title="Explore our collections" />
        <ul className="s13-cat-grid">
          {TILES.map(([name, to], i) => (
            <motion.li key={name} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.8, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}>
              <Link to={to} className="s13-cat" data-cursor="SHOP">
                <span className="s13-cat-img"><ProductMedia p={lead[name] || { slug: name, name }} /></span>
                <strong>{name}</strong>
                <em>Shop now <i aria-hidden="true">→</i></em>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
