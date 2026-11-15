import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScopeHero from '../components/hero/ScopeHero';
import { TrendingNow, Bestsellers } from '../components/home/Products';
import HorizontalShowcase from '../components/home/HorizontalShowcase';
import { Features, StorySplit } from '../components/home/Story';
import CustomerReviews from '../components/CustomerReviews';
import InstagramStrip from '../components/InstagramStrip';
import StoreLocationMap from '../components/StoreLocationMap';
import EnquirySection from '../components/EnquirySection';
import { scrollToEl } from '../components/SmoothScroll';

// One continuous journey: campaign hero, trending, best sellers, shop by category, benefits, our story, reviews,
// reels, editorial gallery, store map and enquiry, then the footer. Every section sits on the same 1320px grid.
export default function Home() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const alias = { lookbook: 'reels', gallery: 'reels', story: 'story', contact: 'enquiry' }; // links from earlier versions of the site
    const id = hash.slice(1);
    const t = setTimeout(() => scrollToEl(document.getElementById(id) || document.getElementById(alias[id])), 650);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="home s13-home">
      <ScopeHero />
      <div className="s13-flow">
        <TrendingNow />
        <Bestsellers />
        <HorizontalShowcase />
        <Features />
        <StorySplit />
        <CustomerReviews />
        <InstagramStrip />
        <StoreLocationMap />
        <EnquirySection />
      </div>
    </div>
  );
}
