import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { brand, media } from '../config/content';
import { useApp } from '../context/App';
import { Reveal } from '../components/Motion';
import { Emblem } from '../components/Wordmark';
import { ProductMedia } from '../components/ProductCard3D';
import ServiceHighlights from '../components/ServiceHighlights';
import { useSiteText } from '../lib/siteText';
import StoreLocationMap from '../components/StoreLocationMap';
import CountUp from '../components/home/CountUp';
import BrandPanel from '../components/home/BrandPanel';
import { coverStyle } from '../lib/imgPos';

export { default as About } from './About';

export function Journal() {
  return (
    <div className="about">
      <header className="cat-hero"><div className="cat-hero-in"><p className="eyebrow">JOURNAL</p><h1 className="serif">Stories and styling.</h1></div></header>
      <div className="empty"><p className="serif big">No stories have been published yet.</p><p className="muted">Editorial articles will appear here once the boutique publishes them.</p><Link className="btn dark" to="/shop">EXPLORE THE COLLECTION</Link></div>
    </div>
  );
}

export function NotFound() {
  return <div className="empty page-pad"><p className="eyebrow">404</p><p className="serif big">This corner of the world does not exist.</p><Link className="btn dark" to="/">RETURN HOME</Link></div>;
}

// Policy text is written by the store in the admin; nothing legal is invented here.
export function Policy({ slug, title }) {
  const [state, setState] = useState({ s: 'loading' });
  useEffect(() => {
    let dead = false; setState({ s: 'loading' });
    api('/pages/' + slug).then(d => !dead && setState({ s: 'ready', ...d })).catch(e => !dead && setState({ s: e.status === 404 ? 'missing' : 'error' }));
    return () => { dead = true };
  }, [slug]);
  return (
    <div className="policy">
      <p className="eyebrow">POLICIES</p>
      <h1 className="serif">{state.title || title}</h1>
      {state.s === 'loading' && <p className="muted">Loading…</p>}
      {state.s === 'missing' && <p className="muted">This policy has not been published yet. Please check back soon, or contact SCOPE 13.</p>}
      {state.s === 'error' && <p role="alert" className="err">This page could not be loaded.</p>}
      {state.s === 'ready' && state.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}
