import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from '../../context/CartContext';

// Mock product data
const mockProduct = {
  _id: '1',
  name: 'Test Product',
  price: 1000,
  image: '/test-image.jpg',
  stock: 10,
  sku: 'TEST001'
};

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

describe('CartContext', () => {
  let result;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    const { result: hookResult } = renderHook(() => useCart(), { wrapper });
    result = hookResult;
  });

  it('initializes with empty cart', () => {
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('adds item to cart', () => {
    act(() => {
      result.current.addToCart(mockProduct, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({
      ...mockProduct,
      quantity: 2
    });
    expect(result.current.itemCount).toBe(2);
    expect(result.current.total).toBe(2000);
  });

  it('increases quantity when adding existing item', () => {
    act(() => {
      result.current.addToCart(mockProduct, 1);
    });

    act(() => {
      result.current.addToCart(mockProduct, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.itemCount).toBe(3);
    expect(result.current.total).toBe(3000);
  });

  it('respects stock limit when adding items', () => {
    const limitedStockProduct = { ...mockProduct, stock: 2 };

    act(() => {
      result.current.addToCart(limitedStockProduct, 5);
    });

    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.itemCount).toBe(2);
  });

  it('updates item quantity', () => {
    act(() => {
      result.current.addToCart(mockProduct, 2);
    });

    act(() => {
      result.current.updateQuantity(mockProduct._id, 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.itemCount).toBe(5);
    expect(result.current.total).toBe(5000);
  });

  it('removes item when quantity is set to 0', () => {
    act(() => {
      result.current.addToCart(mockProduct, 2);
    });

    act(() => {
      result.current.updateQuantity(mockProduct._id, 0);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('removes item from cart', () => {
    act(() => {
      result.current.addToCart(mockProduct, 2);
    });

    act(() => {
      result.current.removeFromCart(mockProduct._id);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('clears entire cart', () => {
    act(() => {
      result.current.addToCart(mockProduct, 2);
      result.current.addToCart({ ...mockProduct, _id: '2' }, 1);
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('calculates total correctly with multiple items', () => {
    const product2 = { ...mockProduct, _id: '2', price: 500 };

    act(() => {
      result.current.addToCart(mockProduct, 2); // 2000
      result.current.addToCart(product2, 3); // 1500
    });

    expect(result.current.total).toBe(3500);
    expect(result.current.itemCount).toBe(5);
  });

  it('formats price correctly', () => {
    expect(result.current.formatPrice(1000)).toBe('₹1,000');
    expect(result.current.formatPrice(100000)).toBe('₹1,00,000');
    expect(result.current.formatPrice(999.99)).toBe('₹999.99');
  });

  it('gets item quantity for specific product', () => {
    act(() => {
      result.current.addToCart(mockProduct, 3);
    });

    expect(result.current.getItemQuantity(mockProduct._id)).toBe(3);
    expect(result.current.getItemQuantity('non-existent')).toBe(0);
  });

  it('checks if item is in cart', () => {
    act(() => {
      result.current.addToCart(mockProduct, 1);
    });

    expect(result.current.isInCart(mockProduct._id)).toBe(true);
    expect(result.current.isInCart('non-existent')).toBe(false);
  });

  it('persists cart to localStorage', () => {
    act(() => {
      result.current.addToCart(mockProduct, 2);
    });

    const savedCart = JSON.parse(localStorage.getItem('viraldeals_cart'));
    expect(savedCart).toHaveLength(1);
    expect(savedCart[0]).toEqual({
      ...mockProduct,
      quantity: 2
    });
  });

  it('loads cart from localStorage on initialization', () => {
    const savedCart = [{ ...mockProduct, quantity: 3 }];
    localStorage.setItem('viraldeals_cart', JSON.stringify(savedCart));

    const { result: newResult } = renderHook(() => useCart(), { wrapper });

    expect(newResult.current.items).toHaveLength(1);
    expect(newResult.current.items[0].quantity).toBe(3);
    expect(newResult.current.itemCount).toBe(3);
    expect(newResult.current.total).toBe(3000);
  });
});
