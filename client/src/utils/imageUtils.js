// Kids Garments Image Utilities and Verified Fallbacks

export const DEFAULT_PRODUCT_FALLBACK = '/images/boys-stylish-fashion.jpg';

export const CATEGORY_FALLBACKS = {
  'Boys': '/images/boys-stylish-fashion.jpg',
  'Girls': 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80',
  'Baby': 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80',
  'Unisex': 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=800&auto=format&fit=crop&q=80',
  'Eastern': 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&auto=format&fit=crop&q=80',
  'Outerwear': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80'
};

/**
 * Handle image error and replace with a verified kids clothing fallback
 */
export const handleImageError = (event, fallbackType = 'Boys') => {
  const fallback = CATEGORY_FALLBACKS[fallbackType] || DEFAULT_PRODUCT_FALLBACK;
  if (event.target.src !== fallback) {
    event.target.src = fallback;
  }
};
