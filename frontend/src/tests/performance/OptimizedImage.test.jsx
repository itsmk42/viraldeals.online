import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OptimizedImage, { ProductImage, ImageGallery } from '../../components/common/OptimizedImage';

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
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with lazy loading by default', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('renders with eager loading when priority is true', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
        priority={true}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('shows loading placeholder initially', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
    // Check for loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('handles image load error gracefully', async () => {
    render(
      <OptimizedImage
        src="/non-existent-image.jpg"
        alt="Test image"
        width={300}
        height={200}
      />
    );

    const img = screen.getByAltText('Test image');
    
    // Simulate image error
    fireEvent.error(img);

    await waitFor(() => {
      expect(screen.getByText('Image not available')).toBeInTheDocument();
    });
  });

  it('generates responsive srcSet', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('srcset');
  });

  it('applies custom className', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        className="custom-class"
        width={300}
        height={200}
      />
    );

    const container = screen.getByAltText('Test image').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});

describe('ProductImage', () => {
  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    images: [{ url: '/product-image.jpg' }],
  };

  it('renders product image with correct props', () => {
    render(
      <ProductImage
        product={mockProduct}
        className="product-image"
        priority={true}
      />
    );

    const img = screen.getByAltText('Test Product');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('uses placeholder when product has no images', () => {
    const productWithoutImages = { ...mockProduct, images: [] };
    
    render(<ProductImage product={productWithoutImages} />);

    const img = screen.getByAltText('Test Product');
    expect(img.src).toContain('placeholder-image.jpg');
  });
});

describe('ImageGallery', () => {
  const mockImages = [
    { url: '/image1.jpg' },
    { url: '/image2.jpg' },
    { url: '/image3.jpg' },
  ];

  it('renders main image and thumbnails', () => {
    render(
      <ImageGallery
        images={mockImages}
        alt="Product gallery"
      />
    );

    // Should have main image
    expect(screen.getByAltText('Product gallery 1')).toBeInTheDocument();
    
    // Should have thumbnails
    expect(screen.getByAltText('Product gallery thumbnail 1')).toBeInTheDocument();
    expect(screen.getByAltText('Product gallery thumbnail 2')).toBeInTheDocument();
    expect(screen.getByAltText('Product gallery thumbnail 3')).toBeInTheDocument();
  });

  it('changes main image when thumbnail is clicked', async () => {
    render(
      <ImageGallery
        images={mockImages}
        alt="Product gallery"
      />
    );

    const secondThumbnail = screen.getByAltText('Product gallery thumbnail 2');
    fireEvent.click(secondThumbnail);

    await waitFor(() => {
      const mainImage = screen.getByAltText('Product gallery 2');
      expect(mainImage.src).toContain('image2.jpg');
    });
  });

  it('shows placeholder when no images provided', () => {
    render(
      <ImageGallery
        images={[]}
        alt="Product gallery"
      />
    );

    const img = screen.getByAltText('Product gallery');
    expect(img.src).toContain('placeholder-image.jpg');
  });

  it('prioritizes first image loading', () => {
    render(
      <ImageGallery
        images={mockImages}
        alt="Product gallery"
      />
    );

    const mainImage = screen.getByAltText('Product gallery 1');
    expect(mainImage).toHaveAttribute('loading', 'eager');
  });
});

describe('Performance optimizations', () => {
  it('implements lazy loading for non-priority images', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        priority={false}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('generates WebP URLs when supported', () => {
    // Mock WebP support
    const mockCanvas = {
      toDataURL: vi.fn().mockReturnValue('data:image/webp;base64,test'),
    };
    
    document.createElement = vi.fn().mockReturnValue(mockCanvas);

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
      />
    );

    // Should attempt to use WebP format
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp');
  });

  it('includes responsive image sizes', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });
});
