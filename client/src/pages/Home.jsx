import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScopeHero from '../components/hero/ScopeHero';
import { TrendingNow, Bestsellers } from '../components/home/Products';
import ShopCategories from '../components/home/Trending';
import { Features, StorySplit } from '../components/home/Story';
import Gallery from '../components/home/Gallery';
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
    const t = setTimeout(() => scrollToEl(document.getElementById(hash.slice(1))), 650);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="home s13-home">
      <ScopeHero />
      <div className="s13-flow">
        <TrendingNow />
        <Bestsellers />
        <ShopCategories />
        <Features />
        <StorySplit />
        <CustomerReviews />
        <InstagramStrip />
        <Gallery />
        <StoreLocationMap />
        <EnquirySection />
      </div>
    </div>
  );
}
