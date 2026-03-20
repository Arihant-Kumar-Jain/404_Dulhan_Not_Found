export const CITIES = [
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', image: '/assets/udaipur.avif', description: 'City of Lakes — Royal palace weddings', coords: { x: 24.58, y: 73.68 } },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600', description: 'Pink City — Majestic forts & havelis', coords: { x: 26.91, y: 75.78 } },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600', description: 'City of Dreams — Luxury seaside weddings', coords: { x: 19.07, y: 72.87 } },
  { id: 'delhi', name: 'Delhi', state: 'Delhi NCR', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600', description: 'Capital grandeur — Heritage & modern venues', coords: { x: 28.61, y: 77.20 } },
  { id: 'goa', name: 'Goa', state: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600', description: 'Beach paradise — Destination wedding bliss', coords: { x: 15.29, y: 73.95 } },
  { id: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', image: '/assets/jodhpur.jpg', description: 'Blue City — Desert royalty weddings', coords: { x: 26.26, y: 73.00 } },
];

export const HOTEL_TIERS = [
  { id: '5star_palace', name: '5-Star Palace', description: 'Taj, Oberoi, Leela heritage properties', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9A2143" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.09 6.26L21 9.27l-5.46 4.73L17.18 21 12 17.27 6.82 21l1.64-6.99L3 9.27l6.91-1.01L12 2z"/></svg>', priceIndicator: '₹₹₹₹₹' },
  { id: '5star_city', name: '5-Star City Hotel', description: 'JW Marriott, Hyatt, ITC Hotels', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9A2143" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V9l6-4 6 4v12M10 12h4M10 16h4"/></svg>', priceIndicator: '₹₹₹₹' },
  { id: '4star', name: '4-Star Hotel', description: 'Radisson, Novotel, Courtyard', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9A2143" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>', priceIndicator: '₹₹₹' },
  { id: 'resort', name: 'Resort / Boutique', description: 'Exclusive resort properties', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9A2143" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-4c0-2-2-4-5-4s-5 2-5 4v4"/><path d="M12 3c1.5 0 3 1 3 3s-1.5 4-3 4-3-2-3-4 1.5-3 3-3z"/><path d="M12 13v-3"/><line x1="3" y1="21" x2="21" y2="21"/></svg>', priceIndicator: '₹₹₹' },
  { id: 'farmhouse', name: 'Farmhouse / Lawn', description: 'Private farmhouse or banquet lawns', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9A2143" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M4 21V10l8-7 8 7v11M9 21v-7h6v7"/><path d="M14 5v2"/></svg>', priceIndicator: '₹₹' },
];

export const EVENTS = [
  { id: 'mehendi', name: 'Mehendi', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E8B57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-4-3-8-7-8-12a8 8 0 0116 0c0 5-4 9-8 12z"/><path d="M12 6v10M9 9c2 2 4 2 6 0"/></svg>', color: '#2E8B57', description: 'Henna ceremony & celebrations' },
  { id: 'haldi', name: 'Haldi', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DAA520" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="3"/></svg>', color: '#FFD700', description: 'Turmeric blessing ceremony' },
  { id: 'sangeet', name: 'Sangeet', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', color: '#FF6B6B', description: 'Music, dance & cocktail night' },
  { id: 'baraat', name: 'Baraat', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6a4 4 0 00-8 0c0 3 4 5 4 8"/><circle cx="14" cy="17" r="3"/><path d="M5 12l2-2 2 2M3 16l2-2 2 2"/></svg>', color: '#D4AF37', description: 'Groom\'s procession' },
  { id: 'pheras', name: 'Pheras', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4500" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-2-2-6-6-6-10a6 6 0 0112 0c0 4-4 8-6 10z"/><path d="M12 12a2 2 0 100-4 2 2 0 000 4z"/><path d="M9 16l3-4 3 4"/></svg>', color: '#FF4500', description: 'Sacred wedding ceremony' },
  { id: 'reception', name: 'Reception', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10l6-6 6 6"/><path d="M12 4v8"/><rect x="4" y="14" width="16" height="6" rx="2"/><line x1="10" y1="17" x2="14" y2="17"/></svg>', color: '#8B1A1A', description: 'Grand wedding reception' },
];

export const DECOR_STYLES = [
  { id: 'traditional', name: 'Traditional Indian', image: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=400', description: 'Classic floral mandap, marigolds, roses' },
  { id: 'royal', name: 'Royal Heritage', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', description: 'Opulent gold, crystal, palatial décor' },
  { id: 'modern', name: 'Contemporary Fusion', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400', description: 'Minimalist elegance with modern touches' },
  { id: 'rustic', name: 'Rustic Chic', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400', description: 'Natural wood, greenery, bohemian vibes' },
  { id: 'glamorous', name: 'Glamorous Night', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400', description: 'LED, neon, dramatic lighting & crystals' },
];

export const FOOD_TYPES = [
  { id: 'veg', name: 'Pure Vegetarian', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E8B57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-4 0-8-3-8-9 0-4 3-8 5-10 1 3 4 5 7 5a6 6 0 01-1 8"/><path d="M15 5c0 3-2 6-3 8"/></svg>', description: 'Complete veg menu with live counters' },
  { id: 'veg_nonveg', name: 'Veg + Non-Veg', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9A2143" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18M5 11c0-4 3-7 7-7s7 3 7 7"/><ellipse cx="12" cy="15" rx="9" ry="4"/><path d="M12 11v4"/></svg>', description: 'Mixed menu catering to all guests' },
  { id: 'nonveg', name: 'Premium Non-Veg', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 11l-1-5h-4L9 11"/><circle cx="12" cy="15" r="5"/><path d="M12 10v5"/><path d="M9 15h6"/></svg>', description: 'Extensive non-veg with specialty items' },
];

export const BAR_TYPES = [
  { id: 'dry', name: 'Dry Event', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="5" y1="5" x2="19" y2="19"/></svg>', description: 'No alcohol' },
  { id: 'beer_wine', name: 'Beer & Wine', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9A2143" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8M12 15v7M7.5 3h9l-1 9a5 5 0 01-10 0L7.5 3z"/></svg>', description: 'Limited bar with beer and wine' },
  { id: 'full_bar', name: 'Full Premium Bar', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8M12 13v9"/><path d="M5 3l7 10 7-10"/><line x1="5" y1="3" x2="19" y2="3"/></svg>', description: 'Complete bar with premium spirits' },
];

export const ENTERTAINMENT_TIERS = [
  { id: 'basic', name: 'Basic', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9A2143" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', price: '₹1-3L', description: 'Local DJ + folk artists' },
  { id: 'standard', name: 'Standard', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9A2143" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16a4 4 0 004-4V4"/><path d="M8 4v8a4 4 0 004 4"/><path d="M12 16v4M8 20h8"/><line x1="8" y1="4" x2="16" y2="4"/></svg>', price: '₹5-10L', description: 'Professional DJ + Live band' },
  { id: 'premium', name: 'Premium', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8"/></svg>', price: '₹15-25L', description: 'Band + B-list singer + choreographer' },
  { id: 'celebrity', name: 'Celebrity', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', price: '₹50L+', description: 'A-list artist + full production' },
];

export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

export const formatCurrencyFull = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
