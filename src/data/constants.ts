export const CITIES = [
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600', description: 'City of Lakes — Royal palace weddings', coords: { x: 24.58, y: 73.68 } },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600', description: 'Pink City — Majestic forts & havelis', coords: { x: 26.91, y: 75.78 } },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600', description: 'City of Dreams — Luxury seaside weddings', coords: { x: 19.07, y: 72.87 } },
  { id: 'delhi', name: 'Delhi', state: 'Delhi NCR', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600', description: 'Capital grandeur — Heritage & modern venues', coords: { x: 28.61, y: 77.20 } },
  { id: 'goa', name: 'Goa', state: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600', description: 'Beach paradise — Destination wedding bliss', coords: { x: 15.29, y: 73.95 } },
  { id: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600', description: 'Blue City — Desert royalty weddings', coords: { x: 26.26, y: 73.00 } },
];

export const HOTEL_TIERS = [
  { id: '5star_palace', name: '5-Star Palace', description: 'Taj, Oberoi, Leela heritage properties', icon: '👑', priceIndicator: '₹₹₹₹₹' },
  { id: '5star_city', name: '5-Star City Hotel', description: 'JW Marriott, Hyatt, ITC Hotels', icon: '🏨', priceIndicator: '₹₹₹₹' },
  { id: '4star', name: '4-Star Hotel', description: 'Radisson, Novotel, Courtyard', icon: '🌟', priceIndicator: '₹₹₹' },
  { id: 'resort', name: 'Resort / Boutique', description: 'Exclusive resort properties', icon: '🌴', priceIndicator: '₹₹₹' },
  { id: 'farmhouse', name: 'Farmhouse / Lawn', description: 'Private farmhouse or banquet lawns', icon: '🏡', priceIndicator: '₹₹' },
];

export const EVENTS = [
  { id: 'mehendi', name: 'Mehendi', icon: '🌿', color: '#2E8B57', description: 'Henna ceremony & celebrations' },
  { id: 'haldi', name: 'Haldi', icon: '💛', color: '#FFD700', description: 'Turmeric blessing ceremony' },
  { id: 'sangeet', name: 'Sangeet', icon: '💃', color: '#FF6B6B', description: 'Music, dance & cocktail night' },
  { id: 'baraat', name: 'Baraat', icon: '🐴', color: '#D4AF37', description: 'Groom\'s procession' },
  { id: 'pheras', name: 'Pheras', icon: '🔥', color: '#FF4500', description: 'Sacred wedding ceremony' },
  { id: 'reception', name: 'Reception', icon: '🎉', color: '#8B1A1A', description: 'Grand wedding reception' },
];

export const DECOR_STYLES = [
  { id: 'traditional', name: 'Traditional Indian', image: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=400', description: 'Classic floral mandap, marigolds, roses' },
  { id: 'royal', name: 'Royal Heritage', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', description: 'Opulent gold, crystal, palatial décor' },
  { id: 'modern', name: 'Contemporary Fusion', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400', description: 'Minimalist elegance with modern touches' },
  { id: 'rustic', name: 'Rustic Chic', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400', description: 'Natural wood, greenery, bohemian vibes' },
  { id: 'glamorous', name: 'Glamorous Night', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400', description: 'LED, neon, dramatic lighting & crystals' },
];

export const FOOD_TYPES = [
  { id: 'veg', name: 'Pure Vegetarian', icon: '🥗', description: 'Complete veg menu with live counters' },
  { id: 'veg_nonveg', name: 'Veg + Non-Veg', icon: '🍛', description: 'Mixed menu catering to all guests' },
  { id: 'nonveg', name: 'Premium Non-Veg', icon: '🍖', description: 'Extensive non-veg with specialty items' },
];

export const BAR_TYPES = [
  { id: 'dry', name: 'Dry Event', icon: '🚫', description: 'No alcohol' },
  { id: 'beer_wine', name: 'Beer & Wine', icon: '🍷', description: 'Limited bar with beer and wine' },
  { id: 'full_bar', name: 'Full Premium Bar', icon: '🥂', description: 'Complete bar with premium spirits' },
];

export const ENTERTAINMENT_TIERS = [
  { id: 'basic', name: 'Basic', icon: '🎵', price: '₹1-3L', description: 'Local DJ + folk artists' },
  { id: 'standard', name: 'Standard', icon: '🎸', price: '₹5-10L', description: 'Professional DJ + Live band' },
  { id: 'premium', name: 'Premium', icon: '🎤', price: '₹15-25L', description: 'Band + B-list singer + choreographer' },
  { id: 'celebrity', name: 'Celebrity', icon: '⭐', price: '₹50L+', description: 'A-list artist + full production' },
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
