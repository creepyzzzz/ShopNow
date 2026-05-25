// ─────────────────────────────────────────────────────────────────────────────
// Fake E-Commerce Data — Disguise Layer
// ─────────────────────────────────────────────────────────────────────────────

export interface FakeProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  category: string;
  imageUrl: string;
  badge?: string;
  description?: string;
}

export interface FakeCategory {
  id: string;
  name: string;
  icon: string;
}

export interface FakeOrder {
  id: string;
  productName: string;
  date: string;
  status: 'Delivered' | 'Shipped' | 'Processing' | 'Cancelled';
  amount: number;
  imageUrl?: string;
}

export const FAKE_CATEGORIES: FakeCategory[] = [
  { id: '1', name: 'All', icon: '🏠' },
  { id: '2', name: 'Fashion', icon: '👗' },
  { id: '3', name: 'Electronics', icon: '📱' },
  { id: '4', name: 'Beauty', icon: '💄' },
  { id: '5', name: 'Home', icon: '🏡' },
  { id: '6', name: 'Sports', icon: '⚽' },
  { id: '7', name: 'Books', icon: '📚' },
  { id: '8', name: 'Toys', icon: '🎮' },
];

export const FAKE_PRODUCTS: FakeProduct[] = [
  {
    id: 'p1',
    name: 'Premium Wireless Earbuds Pro',
    price: 1999,
    originalPrice: 4999,
    discount: 60,
    rating: 4.5,
    reviews: 2341,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    badge: 'Best Seller',
    description: 'True wireless earbuds with active noise cancellation, 36-hour battery life, and premium sound quality.',
  },
  {
    id: 'p2',
    name: 'Floral Summer Dress',
    price: 799,
    originalPrice: 1899,
    discount: 58,
    rating: 4.2,
    reviews: 856,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
    badge: 'Trending',
    description: 'Beautiful floral print summer dress. Lightweight, breathable fabric perfect for warm days.',
  },
  {
    id: 'p3',
    name: 'Smart Watch Ultra Series',
    price: 8999,
    originalPrice: 15999,
    discount: 44,
    rating: 4.7,
    reviews: 5120,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    badge: 'New',
    description: 'Advanced smartwatch with health tracking, GPS, always-on display, and 7-day battery life.',
  },
  {
    id: 'p4',
    name: 'Luxury Perfume Collection',
    price: 1299,
    originalPrice: 2499,
    discount: 48,
    rating: 4.4,
    reviews: 1203,
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400',
    description: 'Exquisite fragrance blend with notes of jasmine, sandalwood, and vanilla. Long-lasting formula.',
  },
  {
    id: 'p5',
    name: 'Minimalist Leather Backpack',
    price: 2499,
    originalPrice: 4999,
    discount: 50,
    rating: 4.6,
    reviews: 3421,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    badge: 'Flash Sale',
    description: 'Genuine leather backpack with laptop compartment, water-resistant, and anti-theft design.',
  },
  {
    id: 'p6',
    name: 'Ergonomic Gaming Chair',
    price: 12999,
    originalPrice: 22999,
    discount: 43,
    rating: 4.3,
    reviews: 789,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400',
    description: 'Professional gaming chair with lumbar support, adjustable armrests, and breathable mesh.',
  },
  {
    id: 'p7',
    name: 'Yoga Mat Premium Non-Slip',
    price: 599,
    originalPrice: 1299,
    discount: 54,
    rating: 4.8,
    reviews: 4521,
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    description: 'Extra thick, non-slip yoga mat with alignment lines. Eco-friendly TPE material.',
  },
  {
    id: 'p8',
    name: 'Wireless Mechanical Keyboard',
    price: 3499,
    originalPrice: 6999,
    discount: 50,
    rating: 4.5,
    reviews: 2103,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    badge: 'Top Rated',
    description: 'RGB mechanical keyboard with hot-swappable switches, Bluetooth 5.0, and USB-C charging.',
  },
  {
    id: 'p9',
    name: 'Classic Aviator Sunglasses',
    price: 1499,
    originalPrice: 3499,
    discount: 57,
    rating: 4.3,
    reviews: 1876,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    badge: 'Popular',
    description: 'Polarized aviator sunglasses with UV400 protection. Lightweight titanium frame.',
  },
  {
    id: 'p10',
    name: 'Portable Bluetooth Speaker',
    price: 2799,
    originalPrice: 5499,
    discount: 49,
    rating: 4.6,
    reviews: 3210,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    badge: 'Best Value',
    description: 'Waterproof Bluetooth speaker with 360° sound, 20-hour battery, and built-in microphone.',
  },
  {
    id: 'p11',
    name: 'Organic Skincare Set',
    price: 1899,
    originalPrice: 3999,
    discount: 53,
    rating: 4.7,
    reviews: 2890,
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
    badge: 'Organic',
    description: 'Complete skincare routine with cleanser, toner, serum, and moisturizer. 100% natural ingredients.',
  },
  {
    id: 'p12',
    name: 'Running Shoes Ultra Boost',
    price: 4999,
    originalPrice: 8999,
    discount: 44,
    rating: 4.5,
    reviews: 6543,
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    badge: 'Top Seller',
    description: 'Lightweight running shoes with responsive cushioning, breathable mesh, and durable outsole.',
  },
  {
    id: 'p13',
    name: 'Scented Candle Gift Set',
    price: 699,
    originalPrice: 1499,
    discount: 53,
    rating: 4.4,
    reviews: 1567,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1602607688066-83ab352d274d?w=400',
    description: 'Set of 4 premium soy wax candles with lavender, vanilla, cinnamon, and ocean breeze scents.',
  },
  {
    id: 'p14',
    name: 'Bestselling Novel Collection',
    price: 399,
    originalPrice: 899,
    discount: 56,
    rating: 4.8,
    reviews: 8901,
    category: 'Books',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    badge: 'Award Winner',
    description: 'Collection of 5 bestselling novels. Perfect for book lovers. Includes bookmark set.',
  },
  {
    id: 'p15',
    name: 'Wireless Gaming Controller',
    price: 2999,
    originalPrice: 5999,
    discount: 50,
    rating: 4.6,
    reviews: 3456,
    category: 'Toys',
    imageUrl: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=400',
    badge: 'Pro',
    description: 'Ergonomic wireless controller with customizable buttons, haptic feedback, and 40-hour battery.',
  },
  {
    id: 'p16',
    name: 'Stainless Steel Water Bottle',
    price: 449,
    originalPrice: 999,
    discount: 55,
    rating: 4.5,
    reviews: 7890,
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    description: 'Insulated water bottle keeps drinks cold for 24h or hot for 12h. BPA-free, leak-proof design.',
  },
  {
    id: 'p17',
    name: 'Desk Lamp LED Smart',
    price: 1299,
    originalPrice: 2799,
    discount: 54,
    rating: 4.4,
    reviews: 2345,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400',
    description: 'Adjustable LED desk lamp with wireless charging base, 5 color modes, and touch controls.',
  },
  {
    id: 'p18',
    name: 'Lip Gloss Palette Pro',
    price: 599,
    originalPrice: 1299,
    discount: 54,
    rating: 4.3,
    reviews: 4567,
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    badge: 'Viral',
    description: '12-shade lip gloss palette with matte and shimmer finishes. Long-lasting, non-sticky formula.',
  },
  {
    id: 'p19',
    name: 'Denim Jacket Classic Fit',
    price: 1799,
    originalPrice: 3499,
    discount: 49,
    rating: 4.5,
    reviews: 2134,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400',
    description: 'Classic fit denim jacket with button closure. Versatile, timeless style for all seasons.',
  },
  {
    id: 'p20',
    name: 'Board Game Strategy Pack',
    price: 899,
    originalPrice: 1799,
    discount: 50,
    rating: 4.7,
    reviews: 3210,
    category: 'Toys',
    imageUrl: 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400',
    badge: 'Family Fun',
    description: 'Pack of 3 strategy board games for 2-6 players. Hours of fun for the whole family.',
  },
];

export const FAKE_ORDERS: FakeOrder[] = [
  { id: 'ORD-4821', productName: 'Wireless Earbuds Pro', date: '20 May 2026', status: 'Delivered', amount: 1999, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
  { id: 'ORD-4790', productName: 'Smart Watch Ultra', date: '18 May 2026', status: 'Shipped', amount: 8999, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200' },
  { id: 'ORD-4755', productName: 'Yoga Mat Premium', date: '15 May 2026', status: 'Delivered', amount: 599, imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=200' },
  { id: 'ORD-4702', productName: 'Leather Backpack', date: '10 May 2026', status: 'Delivered', amount: 2499, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200' },
  { id: 'ORD-4688', productName: 'Luxury Perfume', date: '5 May 2026', status: 'Cancelled', amount: 1299, imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200' },
  { id: 'ORD-4650', productName: 'Running Shoes Ultra', date: '1 May 2026', status: 'Delivered', amount: 4999, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
  { id: 'ORD-4612', productName: 'Gaming Controller', date: '25 Apr 2026', status: 'Processing', amount: 2999, imageUrl: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=200' },
  { id: 'ORD-4580', productName: 'Skincare Set', date: '20 Apr 2026', status: 'Delivered', amount: 1899, imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200' },
];

export const FAKE_BANNERS = [
  {
    id: 'b1',
    title: '🔥 MEGA SALE',
    subtitle: 'Up to 80% Off Electronics',
    bg: ['#FF6B35', '#F5A623'],
    badge: 'Today Only',
  },
  {
    id: 'b2',
    title: '💝 NEW ARRIVALS',
    subtitle: 'Summer Fashion Collection',
    bg: ['#667eea', '#764ba2'],
    badge: 'Just Dropped',
  },
  {
    id: 'b3',
    title: '⚡ FLASH DEAL',
    subtitle: 'Electronics from ₹999',
    bg: ['#11998e', '#38ef7d'],
    badge: '2 hrs left',
  },
];

export const SUPPORT_FAQS = [
  { id: 'faq1', question: 'Where is my order?', icon: '📦' },
  { id: 'faq2', question: 'How do I return an item?', icon: '🔄' },
  { id: 'faq3', question: 'Payment failed, what should I do?', icon: '💳' },
  { id: 'faq4', question: 'How to apply a coupon code?', icon: '🎟️' },
  { id: 'faq5', question: 'Can I change my delivery address?', icon: '📍' },
  { id: 'faq6', question: 'When will my refund be processed?', icon: '💰' },
  { id: 'faq7', question: 'How to cancel my order?', icon: '❌' },
  { id: 'faq8', question: 'Is COD available in my area?', icon: '🏠' },
  { id: 'faq9', question: 'Product received is damaged', icon: '📋' },
  { id: 'faq10', question: 'How to track my shipment?', icon: '🚚' },
];
