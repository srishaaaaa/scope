import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiRetry } from '../../lib/api';
import { Reveal } from '../Motion';
import ProductCard from '../ProductCard3D';
import { ProductMedia } from '../ProductCard3D';
import Scroller from './Scroller';
import { inr } from '../../lib/format';

function useProducts(path) {
  const [items, setItems] = useState(null);
  useEffect(() => { let dead = false; apiRetry(path).then(d => !dead && setItems(d.items || [])).catch(() => !dead && setItems([])); return () => { dead = true } }, [path]);
  return items;
}

// Bestsellers: only products the store has flagged as best sellers (Admin → Inventory). No invented rankings; the
// section stays out of the way if none are flagged.
export function Bestsellers() {
  const items = useProducts('/products?flag=best&limit=10');
  if (!items?.length) return null;
  return (
    <section className="s13-sec s13-best" id="best-sellers" aria-labelledby="best-h">
      <div className="s13-wrap">
        <Reveal className="s13-head s13-head-row">
          <div><p className="s13-label"><i />BEST SELLERS</p><h2 id="best-h" className="s13-h2">Most <em>wanted.</em></h2><p className="s13-sub">The pieces everyone is looking at.</p></div>
          <Link className="s13-link" to="/shop?flag=best" data-cursor="VIEW">SHOP BEST SELLERS →</Link>
        </Reveal>
      </div>
      <Scroller className="s13-pscroll" label="best sellers">
        {items.map((p, i) => <div className="s13-pslide" key={p.id}><ProductCard p={p} index={i} /></div>)}
      </Scroller>
    </section>
  );
}

// New arrivals: an editorial layout (a different composition from the bestseller shelf): the newest piece as a large
// masked feature beside the collection intro, then the rest of the newest pieces in a scroller.
export function NewArrivals() {
  const items = useProducts('/products?sort=newest&limit=9');
  if (!items?.length) return null;
  const [lead, ...rest] = items;
  return (
    <section className="s13-sec s13-new" id="new-arrivals" aria-labelledby="na-h">
      <div className="s13-wrap s13-new-grid">
        <Reveal className="s13-new-copy">
          <p className="s13-label"><i />NEW ARRIVALS</p>
          <h2 id="na-h" className="s13-h2">Just <em>landed.</em></h2>
          <p className="s13-sub">The latest pieces from SCOPE 13: fresh fits, new colours and the everyday staples to build around.</p>
          <Link className="s13-btn" to="/collections/new-arrivals" data-cursor="SHOP"><span>SHOP NEW ARRIVALS</span><b aria-hidden="true">→</b></Link>
        </Reveal>
        <motion.div className="s13-new-lead" initial={{ clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}>
          <Link to={`/product/${lead.slug}`} data-cursor="VIEW" aria-label={`${lead.name}, ${inr(lead.price)}`}>
            <span className="s13-new-img"><ProductMedia p={lead} priority /></span>
            <span className="s13-new-cap"><strong>{lead.name}</strong><em>{inr(lead.price)}</em></span>
          </Link>
        </motion.div>
      </div>
      {rest.length > 0 && <Scroller className="s13-pscroll" label="new arrivals">{rest.map((p, i) => <div className="s13-pslide" key={p.id}><ProductCard p={p} index={i + 1} /></div>)}</Scroller>}
    </section>
  );
}
