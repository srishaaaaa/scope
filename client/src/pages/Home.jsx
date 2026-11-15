import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Reveal } from '../components/Motion';
import ScopeHero from '../components/hero/ScopeHero';
import Trending from '../components/home/Trending';
import { Bestsellers, NewArrivals } from '../components/home/Products';
import { About, Features, Campaign } from '../components/home/Story';
import Gallery from '../components/home/Gallery';
import Craft from '../components/storytelling/Craft';
import CustomerReviews from '../components/CustomerReviews';
import InstagramStrip from '../components/InstagramStrip';
import StoreLocationMap from '../components/StoreLocationMap';
import { scrollToEl } from '../components/SmoothScroll';

// One continuous journey: campaign hero → trending → best sellers → new arrivals → about → benefits → campaign →
// craftsmanship → reviews → Instagram → editorial gallery → store → enquiry. The hero stays pinned while the flow
// slides up over it, so the first screen hands over to the rest of the site without a hard cut.
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
      <div className="s13-flow">
        <Trending />
        <Bestsellers />
        <NewArrivals />
        <About />
        <Features />
        <Campaign />
        <Craft />
        <CustomerReviews />
        <InstagramStrip />
        <Gallery />
        <StoreLocationMap />
        <section className="s13-talk" aria-labelledby="talk-h">
          <div className="s13-wrap"><Reveal className="s13-talk-in"><p className="s13-label"><i />ENQUIRIES</p><h2 id="talk-h" className="s13-h2">Let&rsquo;s <em>talk.</em></h2>
            <Link className="s13-btn" to="/enquiry" data-cursor="TALK"><span>SEND AN ENQUIRY</span><b aria-hidden="true">→</b></Link></Reveal></div>
        </section>
      </div>
    </div>
  );
}
