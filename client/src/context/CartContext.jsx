import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { success, error, info } = useToast();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('kg_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [coupon, setCoupon] = useState(() => {
    const saved = localStorage.getItem('kg_coupon');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('kg_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('kg_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('kg_coupon');
    }
  }, [coupon]);

  const addToCart = (product, size = null, color = null, quantity = 1) => {
    if (!product) return;

    if (product.stock_quantity <= 0) {
      error(`"${product.name}" is currently out of stock.`);
      return;
    }

    const selectedSize = size || (product.sizes && product.sizes.length > 0 ? (product.sizes[0].size_name || product.sizes[0].size) : 'Standard');
    const selectedColor = color || (product.colors && product.colors.length > 0 ? (product.colors[0].color_name || product.colors[0].name) : 'Standard');
    const unitPrice = product.on_sale && product.sale_price ? product.sale_price : product.price;
    const variantKey = `${product.id}-${selectedSize}-${selectedColor}`;

    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.id === variantKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIdx].quantity;
        const maxStock = product.stock_quantity || 50;
        if (currentQty + quantity > maxStock) {
          info(`Adjusted to maximum available stock (${maxStock} units).`);
          updated[existingIdx].quantity = maxStock;
        } else {
          updated[existingIdx].quantity += quantity;
        }
        return updated;
      } else {
        return [
          ...prev,
          {
            id: variantKey,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            image: product.main_image || (product.images && product.images[0]) || '',
            price: unitPrice,
            original_price: product.price,
            size: selectedSize,
            color: selectedColor,
            quantity: Math.min(quantity, product.stock_quantity || 50),
            stock: product.stock_quantity || 50
          }
        ];
      }
    });

    success(`Added ${quantity} × "${product.name}" (${selectedSize}) to bag!`);
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.min(newQty, item.stock || 99) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId) => {
    const item = items.find((it) => it.id === itemId);
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    if (item) {
      info(`Removed "${item.name}" from cart.`);
    }
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  // Calculations in PKR
  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  }, [items]);

  const discountAmount = useMemo(() => {
    if (!coupon) return 0.0;
    if (subtotal < (coupon.min_order_amount || 0)) return 0.0;

    if (coupon.discount_type === 'percentage') {
      const disc = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && disc > coupon.max_discount_amount) {
        return Number(coupon.max_discount_amount.toFixed(2));
      }
      return Number(disc.toFixed(2));
    }
    if (coupon.discount_type === 'fixed') {
      return Number(Math.min(subtotal, coupon.discount_value).toFixed(2));
    }
    return 0.0;
  }, [coupon, subtotal]);

  const calculateShipping = (shippingMethod = 'Standard Delivery') => {
    if (shippingMethod === 'Express Delivery') return 450.0;
    if (coupon && (coupon.code === 'FREESHIP' || coupon.discount_type === 'shipping')) return 0.0;
    if (subtotal >= 3000.0 || items.length === 0) return 0.0;
    return 250.0;
  };

  const shippingFee = useMemo(() => {
    return calculateShipping('Standard Delivery');
  }, [subtotal, coupon, items]);

  const taxAmount = 0.0; // PKR pricing is all-inclusive

  const totalAmount = useMemo(() => {
    const taxable = Math.max(0, subtotal - discountAmount);
    return Number((taxable + shippingFee).toFixed(2));
  }, [subtotal, discountAmount, shippingFee]);

  const applyCoupon = async (code) => {
    try {
      const data = await api.validateCoupon(code, subtotal);
      setCoupon(data);
      success(`Coupon "${data.code}" applied! You saved on this order.`);
      return true;
    } catch (err) {
      error(err.message || 'Invalid coupon code');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    info('Coupon removed.');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalItems: itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        totalAmount,
        coupon,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        calculateShipping
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
