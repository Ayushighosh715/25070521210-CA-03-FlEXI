/**
 * Cart Context
 * Manages shopping cart state, quantity updates, calculations, local persistence,
 * and database synchronization for authenticated users.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // Initialize cart from localStorage so it persists on page refresh
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('devstore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [notification, setNotification] = useState(null);

  // Show temporary feedback toast
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Sync with backend when user logs in or mounts
  useEffect(() => {
    const syncBackendCart = async () => {
      if (isAuthenticated) {
        try {
          // If we have local guest items, sync them to user DB cart first
          const localItems = cartItems.map(item => ({
            productId: item.product._id,
            quantity: item.quantity
          }));

          if (localItems.length > 0) {
            await api.post('/cart/sync', { localItems });
          }

          // Fetch authoritative cart from DB
          const res = await api.get('/cart');
          if (res.data.success && res.data.cart) {
            setCartItems(res.data.cart);
            localStorage.setItem('devstore_cart', JSON.stringify(res.data.cart));
          }
        } catch (error) {
          console.error('Failed to sync cart with database:', error);
        }
      }
    };

    syncBackendCart();
  }, [isAuthenticated, user?.id]);

  // Keep localStorage updated on cart changes
  useEffect(() => {
    localStorage.setItem('devstore_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity, 10));

    // Update state optimistically
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [...prev, { product, quantity: qty }];
      }
    });

    showNotification(`Added "${product.name}" to cart!`);

    // Log add_to_cart activity
    try {
      api.post('/activity', {
        type: 'add_to_cart',
        productId: product._id,
        category: product.category
      }).catch(() => {});
    } catch (e) {}

    // If authenticated, persist to server
    if (isAuthenticated) {
      try {
        await api.post('/cart', { productId: product._id, quantity: qty });
      } catch (err) {
        console.error('Failed to add to database cart:', err);
      }
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.product._id === productId ? { ...item, quantity: qty } : item
      )
    );

    if (isAuthenticated) {
      try {
        await api.put(`/cart/${productId}`, { quantity: qty });
      } catch (err) {
        console.error('Failed to update cart item on server:', err);
      }
    }
  };

  // Remove single item from cart
  const removeFromCart = async (productId) => {
    setCartItems(prev => prev.filter(item => item.product._id !== productId));
    showNotification('Item removed from cart.', 'info');

    if (isAuthenticated) {
      try {
        await api.delete(`/cart/${productId}`);
      } catch (err) {
        console.error('Failed to remove item on server:', err);
      }
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('devstore_cart');

    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.error('Failed to clear cart on server:', err);
      }
    }
  };

  // Computations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );
  // Free delivery on DevStore for developer digital & hardware gear
  const shippingFee = 0;
  const cartTotal = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        shippingFee,
        cartTotal,
        notification,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        showNotification
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

