import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from '../../components/common/ProductCard';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';

// Mock product data
const mockProduct = {
  _id: '1',
  name: 'Test Product',
  description: 'Test product description',
  price: 1000,
  originalPrice: 1200,
  images: [{ url: '/test-image.jpg', alt: 'Test Image' }],
  rating: 4.5,
  reviewCount: 10,
  stock: 5,
  category: 'Electronics',
  brand: 'Test Brand'
};

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('₹1,200')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
  });

  it('shows discount percentage when original price is higher', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const discountPercentage = Math.round(((1200 - 1000) / 1200) * 100);
    expect(screen.getByText(`${discountPercentage}% OFF`)).toBeInTheDocument();
  });

  it('displays rating and review count', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(10)')).toBeInTheDocument();
  });

  it('shows stock status when low stock', () => {
    const lowStockProduct = { ...mockProduct, stock: 2 };
    
    render(
      <TestWrapper>
        <ProductCard product={lowStockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Only 2 left!')).toBeInTheDocument();
  });

  it('shows out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    
    render(
      <TestWrapper>
        <ProductCard product={outOfStockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('has correct link to product detail page', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const productLink = screen.getByRole('link');
    expect(productLink).toHaveAttribute('href', '/products/1');
  });

  it('handles image error by showing placeholder', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const image = screen.getByAltText('Test Image');
    fireEvent.error(image);
    
    expect(image).toHaveAttribute('src', '/placeholder-image.jpg');
  });

  it('renders add to cart button when in stock', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('disables add to cart button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    
    render(
      <TestWrapper>
        <ProductCard product={outOfStockProduct} />
      </TestWrapper>
    );

    const addToCartButton = screen.getByText('Out of Stock');
    expect(addToCartButton).toBeDisabled();
  });
});
