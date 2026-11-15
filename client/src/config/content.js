// SCOPE 13 — editable brand + media configuration (frontend only).
// Only facts supplied by the owner are stated here. No invented history, statistics or fabric specifications.
export const brand = {
  name: 'SCOPE 13',
  positioning: 'A contemporary menswear boutique in Madurai.',
  promise: 'Modern menswear, considered fit, and a personal style of your own.',
  credit: 'Cenexa Systems',
  story: [
    'SCOPE 13 is a contemporary menswear boutique in Madurai, Tamil Nadu.',
    'We curate modern essentials and fashion-forward pieces — from everyday T-shirts and shirts to jackets, co-ord sets and ethnic menswear.',
    'Visit the boutique, try the pieces in person and build a wardrobe that feels like you.',
  ],
  personality: ['Modern', 'Confident', 'Minimal', 'Sophisticated', 'Experimental'],
};

// Public contact details. Only the primary business number is shown publicly.
export const contact = {
  name: 'SCOPE 13',
  owner: 'Hariharan.S',
  phone: '9003410432',
  email: 'scope13men@gmail.com',
  instagram: { handle: '@scope13.in', url: 'https://www.instagram.com/scope13.in/' },
  address: ['Number 15/2-1, Ismailpuram 12th Street', 'Vaigai Thenkarai', 'Madurai - 625009, Tamil Nadu, India'],
};

// Drop real campaign photography into client/public/images/ (or upload it in Admin → Storefront images).
// Menswear campaign imagery has not been supplied yet, so frames stay as elegant placeholders until it is.
export const media = {
  heroCenter: null, heroCutout: null, heroSides: [], heroDepth: null, heroCutoutWebp: null,
  heroAlt: 'SCOPE 13 menswear campaign', storyImage: null, storyAlt: 'SCOPE 13 boutique',
  details: [],
};

export const campaign = {
  label: 'NEW COLLECTION',
  ticker: ['SCOPE 13', 'CONTEMPORARY MENSWEAR', 'NEW ARRIVALS', 'MADURAI'],
};

// Men's category wall (links go to the existing catalogue search so nothing depends on server category slugs).
export const menCategories = [
  'T-Shirts', 'Oversized T-Shirts', 'Shirts', 'Casual Shirts', 'Formal Shirts', 'Polo T-Shirts', 'Jeans', 'Trousers', 'Cargo Pants',
  'Co-ord Sets', 'Jackets', 'Hoodies', 'Sweatshirts', 'Ethnic Menswear', 'Accessories', 'New Arrivals', 'Bestsellers',
];
