import React, { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '100vw',
  priority = false,
  placeholder = '/placeholder-image.jpg',
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    skip: priority // Skip lazy loading for priority images
  });

  // Check WebP support
  const [supportsWebP, setSupportsWebP] = useState(false);

  useEffect(() => {
    const checkWebPSupport = () => {
      // Return false in test environment or if canvas is not available
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return false;
      }

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      } catch (error) {
        return false;
      }
    };

    setSupportsWebP(checkWebPSupport());
  }, []);

  // Generate responsive image URLs
  const generateImageUrl = (originalSrc, format = 'jpg') => {
    if (!originalSrc || originalSrc === placeholder) return originalSrc;
    
    // If it's already a placeholder or external URL, return as is
    if (originalSrc.startsWith('http') || originalSrc.startsWith('/placeholder')) {
      return originalSrc;
    }

    // For our backend images, we can add query parameters for optimization
    const url = new URL(originalSrc, window.location.origin);
    
    if (width) url.searchParams.set('w', width);
    if (height) url.searchParams.set('h', height);
    if (format && supportsWebP && format === 'webp') {
      url.searchParams.set('format', 'webp');
    }
    url.searchParams.set('q', '80'); // Quality 80%
    
    return url.toString();
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (originalSrc) => {
    if (!originalSrc || originalSrc === placeholder) return '';

    const breakpoints = [320, 640, 768, 1024, 1280, 1536];
    const format = supportsWebP ? 'webp' : 'jpg';
    
    return breakpoints
      .map(bp => `${generateImageUrl(originalSrc, format)} ${bp}w`)
      .join(', ');
  };

  // Load image when in view or priority
  useEffect(() => {
    if ((inView || priority) && src && src !== imageSrc && !imageError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad && onLoad();
      };
      
      img.onerror = () => {
        setImageError(true);
        setImageSrc(placeholder);
        onError && onError();
      };

      // Use WebP if supported
      img.src = supportsWebP ? generateImageUrl(src, 'webp') : src;
    }
  }, [inView, priority, src, imageSrc, imageError, supportsWebP, placeholder, onLoad, onError]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(placeholder);
      onError && onError();
    }
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad && onLoad();
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-gray-50 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={generateSrcSet(src)}
        className={`w-full h-full object-contain object-center transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />
      
      {/* Error state */}
      {imageError && imageSrc === placeholder && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Higher-order component for product images
export const ProductImage = ({ product, className = '', priority = false, ...props }) => {
  const imageSrc = product?.images?.[0]?.url || '/placeholder-image.jpg';
  
  return (
    <OptimizedImage
      src={imageSrc}
      alt={product?.name || 'Product image'}
      className={className}
      priority={priority}
      {...props}
    />
  );
};

// Gallery component for product detail page
export const ImageGallery = ({ images = [], alt = '', className = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  if (!images.length) {
    return (
      <OptimizedImage
        src="/placeholder-image.jpg"
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <OptimizedImage
        src={images[selectedIndex]?.url}
        alt={`${alt} ${selectedIndex + 1}`}
        className={`w-full h-96 rounded-lg ${className}`}
        priority={selectedIndex === 0}
        width={600}
        height={400}
      />
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                selectedIndex === index ? 'border-primary-600' : 'border-gray-200'
              }`}
            >
              <OptimizedImage
                src={image.url}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full"
                width={80}
                height={80}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
