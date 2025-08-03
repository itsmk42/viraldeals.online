import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">V</span>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ViralDeals
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1 hidden sm:block">
                  Discover Amazing Products
                </span>
              </div>
            </Link>
          </div>

          {/* Enhanced Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search for amazing products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg placeholder-gray-400 text-gray-700"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />

                {/* Search button */}
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
                  disabled={!searchQuery.trim()}
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>

                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
              </div>
            </form>
          </div>

          {/* Enhanced Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/products"
              className="relative px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 rounded-xl hover:bg-indigo-50 group"
            >
              <span className="relative z-10">Products</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/orders"
                  className="relative px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 rounded-xl hover:bg-indigo-50 group"
                >
                  <span className="relative z-10">Orders</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 rounded-xl hover:bg-indigo-50 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden lg:block">{user?.name}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-3" />
                      My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                      >
                        <span className="w-4 h-4 mr-3 text-indigo-600">⚙️</span>
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <span className="w-4 h-4 mr-3">🚪</span>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="relative px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 rounded-xl hover:bg-indigo-50 group"
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/register"
                  className="relative px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Enhanced Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-3 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-indigo-50 group"
            >
              <ShoppingCartIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </nav>

          {/* Enhanced Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-3 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-indigo-50 group mobile-search-icon"
            >
              <MagnifyingGlassIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
            </button>

            <button
              onClick={toggleCart}
              className="relative p-3 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-indigo-50"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-indigo-50"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 transform rotate-180 transition-transform duration-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>



        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-6 bg-gradient-to-b from-white to-gray-50">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/products"
                className="flex items-center px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 font-semibold transition-all duration-300 rounded-xl mx-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">🛍️</span>
                Products
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="px-6 py-2 border-b border-gray-100 mb-2">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 font-semibold transition-all duration-300 rounded-xl mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 font-semibold transition-all duration-300 rounded-xl mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-3" />
                    My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 font-semibold transition-all duration-300 rounded-xl mx-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3">⚙️</span>
                      Admin Panel
                    </Link>
                  )}

                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 font-semibold transition-all duration-300 rounded-xl mx-2"
                    >
                      <span className="mr-3">🚪</span>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 font-semibold transition-all duration-300 rounded-xl mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">🔑</span>
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-4 py-3 mx-2 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">✨</span>
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}

        {/* Mobile Search Modal */}
        {isMobileSearchOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm mobile-search-backdrop"
              onClick={() => setIsMobileSearchOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative z-10 bg-white shadow-2xl mobile-search-modal">
              <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Search Products</h3>
                  <button
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  handleSearch(e);
                  setIsMobileSearchOpen(false);
                }}>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search for amazing products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg placeholder-gray-400 text-gray-700 text-lg mobile-search-input"
                      autoFocus
                    />
                    <MagnifyingGlassIcon className="absolute left-4 top-4.5 h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />

                    {/* Search button */}
                    <button
                      type="submit"
                      className="absolute right-2 top-2 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
                      disabled={!searchQuery.trim()}
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>

                    {/* Gradient border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                  </div>
                </form>

                {/* Quick search suggestions or recent searches could go here */}
                <div className="mt-6">
                  <p className="text-sm text-gray-500 text-center">
                    Start typing to search for products...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
