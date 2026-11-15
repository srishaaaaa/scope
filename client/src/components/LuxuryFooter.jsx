import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useApp } from '../context/App';
import { api } from '../lib/api';
import { brand, contact, menCategories } from '../config/content';

const Ig = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" /></svg>;

export function Newsletter({ id = 'nl' }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState({ s: 'idle', msg: '' });
  async function submit(e) {
    e.preventDefault();
    if (!consent) return setState({ s: 'error', msg: 'Please confirm your consent to receive emails.' });
    setState({ s: 'busy', msg: '' });
    try {
      const r = await api('/newsletter', { method: 'POST', body: { email, consent: true } });
      setState({ s: 'ok', msg: r.status === 'duplicate' ? 'You are already on the list.' : 'Welcome to SCOPE 13. You are subscribed.' });
      if (r.status !== 'duplicate') setEmail('');
    } catch (err) { setState({ s: 'error', msg: err.message === 'Validation failed' ? 'Please enter a valid email address.' : err.message }) }
  }
  return (
    <form onSubmit={submit} className="news" noValidate>
      <label htmlFor={`${id}-email`} className="foot-sub">Letters from SCOPE 13</label>
      <div className="news-row">
        <input id={`${id}-email`} type="email" placeholder="Your email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required aria-describedby={`${id}-msg`} />
        <button className="btn" disabled={state.s === 'busy'}>{state.s === 'busy' ? '…' : 'SUBSCRIBE'}</button>
      </div>
      <label className="check small"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> I agree to receive marketing emails from SCOPE 13 and can unsubscribe at any time.</label>
      <p id={`${id}-msg`} className={`small ${state.s === 'error' ? 'err' : 'muted'}`} role={state.s === 'error' ? 'alert' : 'status'}>{state.msg}</p>
    </form>
  );
}

// Oversized footer: a wordmark that slides with scroll, shop + support columns, contact, Instagram and newsletter.
export default function LuxuryFooter() {
  const { catalog } = useApp();
  const ref = useRef();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const mx = useTransform(scrollYProgress, [0, 1], ['-8%', '0%']);
  const tel = `tel:${contact.phone}`;
  return (
    <footer className="site-footer s13-foot" ref={ref}>
      <div className="foot-grid">
        <div className="foot-brandcol">
          <p className="foot-statement">{brand.promise}</p>
          <Newsletter id="ft" />
        </div>
        <nav aria-label="Shop"><h2 className="foot-h">Shop</h2><ul>
          <li><Link to="/shop">All Products</Link></li>
          <li><Link to={catalog.collections.some(c => c.slug === 'new-arrivals') ? '/collections/new-arrivals' : '/shop?sort=newest'}>New Arrivals</Link></li>
          <li><Link to="/shop?flag=best">Bestsellers</Link></li>
          {menCategories.slice(0, 6).map(c => <li key={c}><Link to={`/search?q=${encodeURIComponent(c)}`}>{c}</Link></li>)}
        </ul></nav>
        <nav aria-label="Customer support"><h2 className="foot-h">Support</h2><ul>
          <li><Link to="/account">My Account</Link></li>
          <li><Link to="/wishlist">Wishlist</Link></li>
          <li><Link to="/cart">Shopping Bag</Link></li>
          <li><Link to="/shipping-returns">Shipping &amp; Returns</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/#contact">Contact</Link></li>
        </ul></nav>
        <div><h2 className="foot-h">Visit &amp; Contact</h2>
          <address>{contact.address.join(', ')}</address>
          <ul>
            <li><a href={tel}>{contact.phone}</a></li>
            <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            <li><a href={contact.instagram.url} target="_blank" rel="noopener noreferrer" className="foot-ig"><Ig /> {contact.instagram.handle}</a></li>
          </ul>
        </div>
      </div>
      <motion.div className="foot-mark" aria-hidden="true" style={{ x: mx }}><span>SCOPE 13</span></motion.div>
      <div className="foot-base">
        <span>© {new Date().getFullYear()} SCOPE 13. All rights reserved.</span>
        <span className="foot-legal"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/shipping-returns">Shipping &amp; returns</Link></span>
        <span>Powered by <strong>{brand.credit}</strong></span>
      </div>
    </footer>
  );
}
