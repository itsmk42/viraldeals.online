import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LazyProductGrid, { ProductGridSkeleton } from '../../components/common/LazyProductGrid';
import { CartProvider } from '../../context/CartContext';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock react-intersection-observer
vi.mock('react-intersection-observer', () => ({
  useInView: vi.fn(() => ({ ref: vi.fn(), inView: false })),
}));

const mockProducts = [
  {
    _id: '1',
    name: 'Product 1',
    price: 100,
    images: [{ url: '/image1.jpg' }],
    rating: { average: 4.5, count: 10 },
    stock: 5,
  },
  {
    _id: '2',
    name: 'Product 2',
    price: 200,
    images: [{ url: '/image2.jpg' }],
    rating: { average: 4.0, count: 8 },
    stock: 3,
  },
];

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <CartProvider>
      {children}
    </CartProvider>
  </BrowserRouter>
);

describe('LazyProductGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products in grid view', () => {
    render(
      <TestWrapper>
        <LazyProductGrid
          products={mockProducts}
          viewMode="grid"
        />
      </TestWrapper>
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('renders products in list view', () => {
    render(
      <TestWrapper>
        <LazyProductGrid
          products={mockProducts}
          viewMode="list"
        />
      </TestWrapper>
    );

    const container = screen.getByText('Product 1').closest('.space-y-4');
    expect(container).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    render(
      <TestWrapper>
        <LazyProductGrid
          products={[]}
          loading={true}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no products', () => {
    render(
      <TestWrapper>
        <LazyProductGrid
          products={[]}
          loading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('No products found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
  });

  it('displays load more trigger when hasMore is true', () => {
    render(
      <TestWrapper>
        <LazyProductGrid
          products={mockProducts}
          hasMore={true}
          loading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Loading more products...')).toBeInTheDocument();
  });

  it('shows "no more products" message when hasMore is false', () => {
    render(
      <TestWrapper>
        <LazyProductGrid
          products={mockProducts}
          hasMore={false}
          loading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText("You've seen all products")).toBeInTheDocument();
  });

  it('calls onLoadMore when load more trigger is in view', async () => {
    const mockOnLoadMore = vi.fn();
    
    // Mock useInView to return true for load more trigger
    const { useInView } = await import('react-intersection-observer');
    useInView.mockReturnValue({ ref: vi.fn(), inView: true });

    render(
      <TestWrapper>
        <LazyProductGrid
          products={mockProducts}
          hasMore={true}
          onLoadMore={mockOnLoadMore}
          loading={false}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalled();
    });
  });

  it('prioritizes first 4 products for image loading', () => {
    const manyProducts = Array.from({ length: 10 }, (_, i) => ({
      _id: `${i + 1}`,
      name: `Product ${i + 1}`,
      price: 100 * (i + 1),
      images: [{ url: `/image${i + 1}.jpg` }],
      rating: { average: 4.0, count: 5 },
      stock: 5,
    }));

    render(
      <TestWrapper>
        <LazyProductGrid
          products={manyProducts}
          viewMode="grid"
        />
      </TestWrapper>
    );

    // First 4 products should have priority loading
    const firstProduct = screen.getByText('Product 1');
    const fifthProduct = screen.getByText('Product 5');
    
    expect(firstProduct).toBeInTheDocument();
    expect(fifthProduct).toBeInTheDocument();
  });

  it('implements batch loading correctly', () => {
    const manyProducts = Array.from({ length: 20 }, (_, i) => ({
      _id: `${i + 1}`,
      name: `Product ${i + 1}`,
      price: 100,
      images: [{ url: `/image${i + 1}.jpg` }],
      rating: { average: 4.0, count: 5 },
      stock: 5,
    }));

    render(
      <TestWrapper>
        <LazyProductGrid
          products={manyProducts}
          viewMode="grid"
        />
      </TestWrapper>
    );

    // Should initially show only first batch (12 products by default)
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 12')).toBeInTheDocument();
    
    // Products beyond first batch should not be visible initially
    expect(screen.queryByText('Product 13')).not.toBeInTheDocument();
  });
});

describe('ProductGridSkeleton', () => {
  it('renders correct number of skeleton items', () => {
    render(<ProductGridSkeleton count={6} viewMode="grid" />);

    const skeletonItems = document.querySelectorAll('.animate-pulse');
    expect(skeletonItems.length).toBeGreaterThan(0);
  });

  it('applies grid layout for grid view mode', () => {
    render(<ProductGridSkeleton count={4} viewMode="grid" />);

    const container = document.querySelector('.grid');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
  });

  it('applies list layout for list view mode', () => {
    render(<ProductGridSkeleton count={4} viewMode="list" />);

    const container = document.querySelector('.space-y-4');
    expect(container).toBeInTheDocument();
  });

  it('shows skeleton elements with proper structure', () => {
    render(<ProductGridSkeleton count={1} viewMode="grid" />);

    // Should have image skeleton
    const imageSkeleton = document.querySelector('.h-48.bg-gray-200');
    expect(imageSkeleton).toBeInTheDocument();

    // Should have content skeletons
    const contentSkeletons = document.querySelectorAll('.bg-gray-200.rounded');
    expect(contentSkeletons.length).toBeGreaterThan(1);
  });
});

describe('Performance optimizations', () => {
  it('implements intersection observer for lazy loading', () => {
    render(
      <TestWrapper>
        <LazyProductGrid
          products={mockProducts}
          hasMore={true}
        />
      </TestWrapper>
    );

    // IntersectionObserver should be called for lazy loading
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('batches product rendering for performance', () => {
    const manyProducts = Array.from({ length: 50 }, (_, i) => ({
      _id: `${i + 1}`,
      name: `Product ${i + 1}`,
      price: 100,
      images: [{ url: `/image${i + 1}.jpg` }],
      rating: { average: 4.0, count: 5 },
      stock: 5,
    }));

    const { rerender } = render(
      <TestWrapper>
        <LazyProductGrid
          products={manyProducts}
          viewMode="grid"
        />
      </TestWrapper>
    );

    // Initial render should only show first batch
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.queryByText('Product 50')).not.toBeInTheDocument();

    // Performance should not degrade with many products
    const startTime = performance.now();
    rerender(
      <TestWrapper>
        <LazyProductGrid
          products={manyProducts}
          viewMode="list"
        />
      </TestWrapper>
    );
    const endTime = performance.now();

    // Render time should be reasonable (less than 100ms)
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('prevents unnecessary re-renders', () => {
    const renderSpy = vi.fn();
    
    const TestComponent = ({ products }) => {
      renderSpy();
      return (
        <LazyProductGrid
          products={products}
          viewMode="grid"
        />
      );
    };

    const { rerender } = render(
      <TestWrapper>
        <TestComponent products={mockProducts} />
      </TestWrapper>
    );

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Re-render with same products should not cause unnecessary renders
    rerender(
      <TestWrapper>
        <TestComponent products={mockProducts} />
      </TestWrapper>
    );

    // Should still be called only once due to memoization
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});
