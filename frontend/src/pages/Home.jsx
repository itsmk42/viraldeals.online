import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon, FireIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { ProductImage } from '../components/common/OptimizedImage';
import { useFeaturedProducts, useCategories } from '../hooks/useProducts';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const { addToCart, formatPrice } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Intersection Observer for scroll animations
  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use React Query hooks
  const {
    data: featuredProducts = [],
    isLoading: featuredLoading,
    error: featuredError
  } = useFeaturedProducts(6);

  const {
    data: dbCategories = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategories();

  // Special categories with custom filtering and icons
  const specialCategories = [
    {
      name: 'Hot Products',
      count: '50+',
      icon: '🔥',
      gradient: 'from-red-500 to-orange-500',
      link: '/products?specialCategory=hot-products',
      description: 'Trending and popular items'
    },
    {
      name: 'New Releases',
      count: '25+',
      icon: '✨',
      gradient: 'from-blue-500 to-cyan-500',
      link: '/products?specialCategory=new-releases',
      description: 'Latest arrivals and new products'
    },
    {
      name: 'Customer Favorites',
      count: '30+',
      icon: '❤️',
      gradient: 'from-pink-500 to-rose-500',
      link: '/products?specialCategory=customer-favorites',
      description: 'Top-rated and most-loved products'
    },
    {
      name: 'Flash Deals',
      count: '15+',
      icon: '⚡',
      gradient: 'from-yellow-500 to-amber-500',
      link: '/products?specialCategory=flash-deals',
      description: 'Limited-time offers and discounts'
    },
    {
      name: 'Best Sellers',
      count: '40+',
      icon: '🏆',
      gradient: 'from-purple-500 to-indigo-500',
      link: '/products?specialCategory=best-sellers',
      description: 'Most purchased and popular products'
    },
    {
      name: "Editor's Choice",
      count: '20+',
      icon: '👑',
      gradient: 'from-emerald-500 to-teal-500',
      link: '/products?specialCategory=editors-choice',
      description: 'Curated selection of recommended products'
    }
  ];

  // Combine special categories with database categories
  const allCategories = [
    ...specialCategories,
    ...dbCategories.map(cat => ({
      name: cat.name,
      count: `${cat.count}`,
      icon: cat.name.charAt(0),
      gradient: 'from-indigo-500 to-purple-600',
      link: `/products?category=${encodeURIComponent(cat.name)}`,
      description: `${cat.count} products available`
    }))
  ];

  const loading = featuredLoading || categoriesLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
          {/* Parallax overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          ></div>

          {/* Enhanced animated shapes with better positioning */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/25 to-purple-600/25 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/25 to-pink-600/25 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-88 h-88 bg-gradient-to-r from-pink-400/25 to-red-600/25 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-cyan-600/20 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-6000"></div>

          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${8 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`space-y-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Enhanced Badge with more visual appeal */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md border border-white/30 text-white/95 text-sm font-semibold shadow-2xl">
              <div className="flex items-center mr-3">
                <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-2 animate-pulse shadow-lg shadow-green-400/50"></span>
                <FireIcon className="w-4 h-4 text-orange-400 animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent font-bold">
                MEGA SALE LIVE
              </span>
              <span className="mx-2">•</span>
              <span>Up to 70% Off</span>
              <SparklesIcon className="w-4 h-4 ml-2 text-yellow-300 animate-pulse" />
            </div>

            {/* Enhanced Main Heading */}
            <div className="space-y-6">
              <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-[0.9] tracking-tight">
                <span className="block transform transition-all duration-700 delay-300" style={{ transform: isVisible ? 'translateY(0)' : 'translateY(50px)' }}>
                  Discover
                </span>
                <span className="block bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x transform transition-all duration-700 delay-500" style={{ transform: isVisible ? 'translateY(0)' : 'translateY(50px)' }}>
                  ViralDeals
                </span>
              </h1>

              <div className="relative">
                <p className="hero-subtitle text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white/85 max-w-5xl mx-auto leading-relaxed px-4 font-medium transform transition-all duration-700 delay-700" style={{ transform: isVisible ? 'translateY(0)' : 'translateY(30px)' }}>
                  Where{' '}
                  <span className="relative inline-block">
                    <span className="font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                      amazing products
                    </span>
                    <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full opacity-60"></div>
                  </span>
                  {' '}meet{' '}
                  <span className="relative inline-block">
                    <span className="font-bold bg-gradient-to-r from-pink-300 to-pink-500 bg-clip-text text-transparent">
                      unbeatable prices
                    </span>
                    <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-pink-300 to-pink-500 rounded-full opacity-60"></div>
                  </span>
                  <SparklesIcon className="inline-block w-8 h-8 ml-2 text-yellow-300 animate-pulse" />
                </p>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-12 transform transition-all duration-700 delay-900" style={{ transform: isVisible ? 'translateY(0)' : 'translateY(30px)' }}>
              <Link
                to="/products"
                className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-bold text-xl rounded-3xl hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-pink-500/40 border border-white/20"
              >
                <span className="relative z-10 flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-2 animate-pulse" />
                  Start Shopping Now
                </span>
                <ArrowRightIcon className="ml-4 h-7 w-7 group-hover:translate-x-2 transition-transform duration-500" />

                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-700 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10"></div>
              </Link>

              <Link
                to="/products?featured=true"
                className="group inline-flex items-center px-10 py-5 bg-white/15 backdrop-blur-md text-white font-bold text-xl rounded-3xl border-2 border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-white/20"
              >
                <HeartIcon className="w-6 h-6 mr-2 group-hover:text-pink-300 transition-colors duration-300" />
                <span>Explore Deals</span>
                <svg className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto transform transition-all duration-700 delay-1100" style={{ transform: isVisible ? 'translateY(0)' : 'translateY(30px)' }}>
              <div className="text-center group">
                <div className="relative">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    10K+
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-4xl md:text-5xl lg:text-6xl font-black">
                    10K+
                  </div>
                </div>
                <div className="text-white/80 text-base md:text-lg font-medium">Happy Customers</div>
                <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="text-center group">
                <div className="relative">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    500+
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-4xl md:text-5xl lg:text-6xl font-black">
                    500+
                  </div>
                </div>
                <div className="text-white/80 text-base md:text-lg font-medium">Premium Products</div>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="text-center group">
                <div className="relative">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    24/7
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-4xl md:text-5xl lg:text-6xl font-black">
                    24/7
                  </div>
                </div>
                <div className="text-white/80 text-base md:text-lg font-medium">Expert Support</div>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer group" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <div className="relative">
            <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center group-hover:border-white/60 transition-colors duration-300">
              <div className="w-1.5 h-4 bg-gradient-to-b from-white/80 to-white/40 rounded-full mt-2 animate-pulse group-hover:from-white group-hover:to-white/60 transition-colors duration-300"></div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-medium whitespace-nowrap group-hover:text-white/80 transition-colors duration-300">
              Scroll to explore
            </div>
          </div>
        </div>

        {/* Floating action hint */}
        <div className="absolute bottom-24 right-8 hidden lg:block animate-pulse">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
            <div className="flex items-center space-x-2 text-white/80 text-sm">
              <SparklesIcon className="w-4 h-4" />
              <span>Limited time offers below!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
        {/* Enhanced Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-r from-blue-100/60 to-purple-100/60 rounded-full opacity-70 animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-gradient-to-r from-pink-100/60 to-yellow-100/60 rounded-full opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-50/40 to-cyan-50/40 rounded-full opacity-50 animate-pulse animation-delay-4000"></div>

          {/* Geometric patterns */}
          <div className="absolute top-16 right-16 w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 animate-bounce animation-delay-1000"></div>
          <div className="absolute bottom-32 left-16 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-20 animate-bounce animation-delay-3000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-indigo-800 text-sm font-bold mb-6 shadow-lg border border-blue-200/50">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              🛍️ Browse Categories
              <SparklesIcon className="w-4 h-4 ml-2 text-indigo-600" />
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
              Shop by{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Category
                </span>
                <div className="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-full"></div>
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Discover exactly what you're looking for in our{' '}
              <span className="text-indigo-600 font-semibold">carefully curated</span> product categories and{' '}
              <span className="text-purple-600 font-semibold">exclusive collections</span>
            </p>

            {/* Category stats */}
            <div className="flex justify-center items-center space-x-8 mt-8">
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">50+ Categories</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">1000+ Products</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Daily Updates</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {allCategories.map((category, index) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 border border-gray-200/50 hover:border-indigo-200 card-hover transform hover:scale-105 hover:-translate-y-2 overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                {/* Enhanced Category Icon */}
                <div className="relative mb-6 sm:mb-8 z-20">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${category.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-xl group-hover:shadow-2xl`}>
                    {typeof category.icon === 'string' && category.icon.length === 1 && /\p{L}/u.test(category.icon) ? (
                      <span className="text-2xl sm:text-3xl text-white font-bold group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </span>
                    ) : (
                      <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </span>
                    )}
                  </div>

                  {/* Glow effect */}
                  <div className={`absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${category.gradient} rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl -z-10`}></div>

                  {/* Floating sparkles */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <SparklesIcon className="w-6 h-6 text-yellow-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 relative z-20">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-500 line-clamp-2 leading-tight">
                    {category.name}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed line-clamp-2">
                    {category.description}
                  </p>

                  {/* Enhanced Product count badge */}
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-sm font-bold border border-gray-200 group-hover:from-indigo-50 group-hover:to-purple-50 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-all duration-300">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    {category.count} products
                  </div>

                  {/* Enhanced Arrow indicator */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center text-indigo-600 font-bold group-hover:translate-x-3 transition-all duration-500">
                      <span className="text-base">Explore now</span>
                      <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:scale-125 transition-transform duration-300" />
                    </div>

                    {/* Popularity indicator */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <FireIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-gray-500 font-medium">Popular</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Hover effect overlay - positioned behind content */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient.replace('from-', 'from-').replace('to-', 'to-')}/8 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10`}></div>

                {/* Animated border - positioned behind content */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-5">
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${category.gradient} p-[2px]`}>
                    <div className="w-full h-full bg-transparent rounded-3xl"></div>
                  </div>
                </div>

                {/* Subtle glow effect behind card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10 scale-110`}></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Products Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50/50 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-200/40 to-pink-200/40 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-blue-200/40 to-indigo-200/40 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 text-purple-800 text-sm font-bold mb-6 shadow-lg border border-purple-200/50">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
              ⭐ Handpicked for You
              <HeartIcon className="w-4 h-4 ml-2 text-pink-600" />
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  Featured
                </span>
                <div className="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 rounded-full"></div>
              </span>
              {' '}Products
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Discover our{' '}
              <span className="text-purple-600 font-semibold">carefully curated</span> collection of{' '}
              <span className="text-pink-600 font-semibold">trending products</span> that everyone's talking about
            </p>

            {/* Product highlights */}
            <div className="flex justify-center items-center space-x-8 mt-8">
              <div className="flex items-center space-x-2 text-gray-500">
                <SparklesIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <FireIcon className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">Trending Now</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <HeartIcon className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">Customer Favorites</span>
              </div>
            </div>
          </div>

          {/* Enhanced Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {featuredProducts.map((product, index) => (
              <div
                key={product._id}
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-700 overflow-hidden card-hover border border-gray-200/50 hover:border-purple-200 transform hover:scale-105 hover:-translate-y-3"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: isVisible ? 'fadeInUp 0.8s ease-out forwards' : 'none'
                }}
              >
                {/* Enhanced Product Image */}
                <div className="relative overflow-hidden rounded-t-3xl">
                  <Link to={`/products/${product._id}`}>
                    <ProductImage
                      product={product}
                      className="w-full h-72 object-cover group-hover:scale-125 transition-transform duration-1000"
                      priority={index < 3}
                      width={400}
                      height={288}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </Link>

                  {/* Enhanced Discount Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-xl border border-white/20 animate-pulse">
                      <FireIcon className="w-4 h-4 inline mr-1" />
                      {product.discount}% OFF
                    </div>
                  )}

                  {/* Featured badge */}
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    <SparklesIcon className="w-3 h-3 inline mr-1" />
                    Featured
                  </div>

                  {/* Enhanced Quick View Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <Link
                      to={`/products/${product._id}`}
                      className="bg-white/95 backdrop-blur-md text-gray-900 px-8 py-3 rounded-2xl font-bold transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105 border border-white/50"
                    >
                      <span className="flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Quick View
                      </span>
                    </Link>
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Enhanced Product Info */}
                <div className="p-8">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-500 line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">
                    {product.shortDescription}
                  </p>

                  {/* Enhanced Price Section */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl font-black text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xl text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Enhanced Rating Stars */}
                      <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'} transition-colors duration-300`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-600 ml-1 font-medium">(4.0)</span>
                      </div>
                    </div>

                    {/* Savings indicator */}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        You save {formatPrice(product.originalPrice - product.price)}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Add to Cart Button */}
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-xl hover:shadow-purple-500/40 border border-white/20 group-hover:border-purple-300 relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 mr-2 animate-pulse" />
                      Add to Cart
                      <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced View All Products CTA */}
          <div className="text-center">
            <Link
              to="/products"
              className="group relative inline-flex items-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 text-white px-12 py-5 rounded-3xl font-bold text-xl transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-gray-900/30 border border-gray-700 hover:border-gray-600"
            >
              <span className="relative z-10 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-3 animate-pulse" />
                Explore All Products
                <span className="ml-2 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-black">
                  500+
                </span>
              </span>
              <ArrowRightIcon className="ml-4 h-7 w-7 group-hover:translate-x-2 transition-transform duration-500" />

              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10"></div>
            </Link>

            {/* Additional info */}
            <p className="text-gray-500 text-sm mt-4 font-medium">
              Discover thousands of amazing products at unbeatable prices
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 text-sm font-medium mb-4">
              ✨ Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Your{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Shopping
              </span>{' '}
              Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're committed to providing you with the best online shopping experience in India
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fast Delivery */}
            <div className="group text-center bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 card-hover border border-gray-100">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">⚡</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                Lightning Fast Delivery
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get your orders delivered in record time across India with our premium logistics network
              </p>
            </div>

            {/* Quality Assured */}
            <div className="group text-center bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 card-hover border border-gray-100">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                Premium Quality
              </h3>
              <p className="text-gray-600 leading-relaxed">
                100% authentic products with comprehensive warranty and quality guarantee
              </p>
            </div>

            {/* Secure Payments */}
            <div className="group text-center bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 card-hover border border-gray-100">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">🔒</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                Secure Payments
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Multiple secure payment options including UPI, cards, and digital wallets
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-8 bg-white rounded-2xl px-8 py-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">Verified Seller</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-red-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
              📧 Stay Updated
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Never Miss a{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                  Deal
                </span>
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Subscribe to our newsletter and be the first to know about exclusive offers, new arrivals, and flash sales
              </p>
            </div>

            {/* Newsletter Form */}
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
                <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25">
                  Subscribe
                </button>
              </div>
              <p className="text-white/60 text-sm mt-4">
                Join 10,000+ subscribers. No spam, unsubscribe anytime.
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full border-2 border-white"></div>
                  ))}
                </div>
                <span className="text-white/80 text-sm font-medium">10K+ subscribers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white/80 text-sm font-medium">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
