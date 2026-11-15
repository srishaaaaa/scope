import { Link } from 'react-router-dom';
import { Reveal, Magnetic } from '../Motion';
import { contact, menCategories } from '../../config/content';
import { waLink } from '../../lib/contact';

// Story-led sections modelled on the reference site: numbered steps, FAQ, two big linked cards and a closing order CTA.
// Every statement is something already true of this store (how the site works, where the boutique is). Nothing invented.

const STEPS = [
  ['01', 'Browse', 'Explore the collections or search by name. Filter by size, colour and price.'],
  ['02', 'Choose your size', 'Every size shows live availability, so what you see is what can be yours.'],
  ['03', 'Pay securely', 'Checkout is paid online through Razorpay. An order is confirmed once payment is verified.'],
  ['04', 'Track it', 'Sign in to see your orders, keep a wishlist and find your bag on any device.'],
];

const FAQ = [
  ['Where is the SCOPE 13 boutique?', `${contact.address.join(', ')}. Open the map below for directions.`],
  ['How do I order?', 'Add pieces to your bag, check out and pay securely online. You can also message us on WhatsApp with any question first.'],
  ['Do you ship across India?', 'Yes. Careful packing and delivery to your door, anywhere in India. The shipping charge is shown in your bag before you pay.'],
  ['What about returns?', 'Please read our Shipping & Returns page for the policy. Made-to-measure and altered garments are non-returnable.'],
  ['Can I check fit or availability before ordering?', 'Yes. Message or call the boutique and we will help you with sizes and stock.'],
];

export function Steps() {
  return (
    <section className="s13-sec s13-steps" aria-labelledby="steps-h">
      <Reveal className="s13-head"><p className="s13-eyebrow"><i />HOW IT WORKS</p><h2 id="steps-h" className="s13-h2">From first look <em>to your door.</em></h2></Reveal>
      <ol className="s13-steps-row">
        {STEPS.map(([n, t, d], i) => <Reveal as="li" key={n} delay={i * 0.08} className="s13-step"><span>{n}</span><h3>{t}</h3><p>{d}</p></Reveal>)}
      </ol>
    </section>
  );
}

export function Faq() {
  return (
    <section className="s13-sec s13-faq" aria-labelledby="faq-h">
      <Reveal className="s13-head"><p className="s13-eyebrow"><i />QUESTIONS</p><h2 id="faq-h" className="s13-h2">Good to <em>know.</em></h2></Reveal>
      <div className="s13-faq-list">
        {FAQ.map(([q, a], i) => (
          <Reveal key={q} delay={i * 0.05}><details className="s13-q"><summary><span>{String(i + 1).padStart(2, '0')}</span>{q}<i aria-hidden="true" /></summary><p>{a}</p></details></Reveal>
        ))}
      </div>
    </section>
  );
}

export function Cards() {
  return (
    <section className="s13-cards" aria-label="Shop or visit">
      <Reveal className="s13-card-wrap"><Link to="/shop" className="s13-card dark" data-cursor="SHOP"><span className="s13-card-no">01</span><h3>Shop the collection</h3><p>{menCategories.length} departments of menswear, online.</p><b aria-hidden="true">→</b></Link></Reveal>
      <Reveal className="s13-card-wrap" delay={0.1}><a href="/#store" className="s13-card" data-cursor="VISIT"><span className="s13-card-no">02</span><h3>Visit the boutique</h3><p>Ismailpuram, Madurai. Try the pieces in person.</p><b aria-hidden="true">→</b></a></Reveal>
    </section>
  );
}

export function OrderCta() {
  const wa = waLink(contact.phone, 'Hello SCOPE 13, I would like to know more about your collection.');
  return (
    <section className="s13-order" aria-labelledby="ord-h">
      <Reveal className="s13-order-in">
        <p className="s13-eyebrow"><i />ORDER &amp; ENQUIRIES</p>
        <h2 id="ord-h" className="s13-h2">Wear <em>the era.</em></h2>
        <div className="s13-order-cta">
          <Magnetic><a className="s13-btn light" href={wa} target="_blank" rel="noopener noreferrer"><span>WHATSAPP US</span><b aria-hidden="true">→</b></a></Magnetic>
          <a className="s13-link light" href={`tel:${contact.phone}`}>{contact.phone}</a>
        </div>
        <ul className="s13-badges" aria-label="Why SCOPE 13"><li>Secure online payment</li><li>Shipping across India</li><li>Boutique in Madurai</li></ul>
      </Reveal>
    </section>
  );
}
