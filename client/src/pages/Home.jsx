import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/App';
import { Magnetic, Reveal } from '../components/Motion';
import { apiRetry } from '../lib/api';
import ScopeHero from '../components/hero/ScopeHero';
import Ticker from '../components/Ticker';
import FeaturedCollections, { Item } from '../components/FeaturedCollections';
import BestSellers from '../components/BestSellers';
import CollectionGallery from '../components/collections/CollectionGallery';
import Lookbook from '../components/lookbook/Lookbook';
import Craft from '../components/storytelling/Craft';
import { Steps, Faq, Cards, OrderCta } from '../components/storytelling/Journey';
import CustomerReviews from '../components/CustomerReviews';
import EnquirySection from '../components/EnquirySection';
import InstagramStrip from '../components/InstagramStrip';
import StoreLocationMap from '../components/StoreLocationMap';
import ServiceHighlights from '../components/ServiceHighlights';
import { Newsletter } from '../components/LuxuryFooter';
import { useSiteText } from '../lib/siteText';
import { scrollToEl } from '../components/SmoothScroll';
import { brand } from '../config/content';

const Showroom = lazy(() => import('../components/showroom/Showroom'));

// New arrivals: the newest pieces from the catalogue, same product cards as everywhere else.
function NewArrivals() {
  const [items, setItems] = useState([]);
  useEffect(() => { let dead = false; apiRetry('/products?sort=newest&limit=4').then(d => !dead && setItems(d.items || [])).catch(() => {}); return () => { dead = true } }, []);
  if (!items.length) return null;
  return (
    <section className="cu s13-na" id="new-arrivals" aria-labelledby="na-h">
      <div className="cu-in">
        <Reveal className="cu-head">
          <div><p className="cu-label"><i aria-hidden="true" />NEW ARRIVALS</p><h2 id="na-h">Just landed.</h2><p className="cu-sub">The newest pieces at SCOPE 13.</p></div>
          <Link className="cu-all" to="/shop?sort=newest" data-cursor="VIEW">VIEW ALL →</Link>
        </Reveal>
        <ul className="cu-grid">{items.map((p, i) => <Item key={p.id} p={p} i={i} />)}</ul>
      </div>
    </section>
  );
}

// Campaign band: oversized, layered typography between the product sections.
function Campaign() {
  return (
    <section className="s13-campaign" aria-label="SCOPE 13 campaign">
      <Reveal><p className="s13-eyebrow"><i />THE CAMPAIGN</p></Reveal>
      <h2 className="s13-camp-h" aria-label="A clothing era">
        <span className="s13-camp-l a" aria-hidden="true">A CLOTHING</span>
        <span className="s13-camp-l b" aria-hidden="true">ERA<em>.</em></span>
      </h2>
      <Reveal className="s13-camp-foot" delay={0.1}><p>{brand.positioning}</p><Magnetic><Link className="s13-btn" to="/shop" data-cursor="SHOP"><span>SHOP NOW</span><b aria-hidden="true">→</b></Link></Magnetic></Reveal>
    </section>
  );
}

// Brand story: only what the owner has supplied (config/content.js). No invented history or statistics.
function Story() {
  const t = useSiteText();
  return (
    <section className="s13-story" id="story" aria-labelledby="story-h">
      <Reveal className="s13-story-l"><p className="s13-eyebrow"><i />THE BOUTIQUE</p><h2 id="story-h" className="s13-h2">{t.storyTitle === 'Shop Story' ? 'The boutique.' : t.storyTitle}</h2></Reveal>
      <div className="s13-story-r">{t.story.map((p, i) => <Reveal key={i} delay={i * 0.1}><p>{p}</p></Reveal>)}
        <Reveal delay={0.3}><ul className="s13-traits">{brand.personality.map(x => <li key={x}>{x}</li>)}</ul><Link className="s13-link" to="/about" data-cursor="DISCOVER">DISCOVER MORE →</Link></Reveal></div>
    </section>
  );
}

function NewsletterBand() {
  return (
    <section className="s13-news" aria-labelledby="nws-h">
      <Reveal className="s13-news-in"><p className="s13-eyebrow"><i />NEWSLETTER</p><h2 id="nws-h" className="s13-h2">Stay in <em>the loop.</em></h2><Newsletter id="nb" /></Reveal>
    </section>
  );
}

// Order: hero → ticker → new arrivals → collections → featured → bestsellers → campaign → showroom → lookbook → craft →
// story → reviews → Instagram → store → enquiry → newsletter → footer.
export default function Home() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => scrollToEl(document.getElementById(hash.slice(1))), 650);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="home s13-home">
      <ScopeHero />
      <Ticker />
      <NewArrivals />
      <CollectionGallery />
      <FeaturedCollections />
      <BestSellers />
      <Campaign />
      <Suspense fallback={null}><Showroom /></Suspense>
      <Lookbook />
      <Craft />
      <ServiceHighlights />
      <Story />
      <Steps />
      <CustomerReviews />
      <InstagramStrip />
      <Faq />
      <Cards />
      <StoreLocationMap />
      <EnquirySection />
      <OrderCta />
      <NewsletterBand />
    </div>
  );
}
