import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  User,
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Sun,
  Snowflake,
  Flame,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import { formatPKR } from '../utils/currency';
import { handleImageError } from '../utils/imageUtils';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { itemCount, openCart } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  // Slide-out Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Search Modal / Dropdown state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Announcement
  const [announcement, setAnnouncement] = useState('🚚 FREE Nationwide Delivery across Pakistan on orders above ₨ 3,000 | Code: KIDS10');

  // Close menus on route change
  useEffect(() => {
    setDrawerOpen(false);
    setSearchModalOpen(false);
  }, [location.pathname, location.search]);

  // Fetch Announcement from Settings
  useEffect(() => {
    api.getSettings()
      .then(res => {
        if (res?.settings?.announcement_text) {
          setAnnouncement(res.settings.announcement_text);
        }
      })
      .catch(() => {});
  }, []);

  // Live search debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await api.getProducts({ search: searchQuery });
        setSearchResults((data.products || []).slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchModalOpen(false);
      setSearchQuery('');
    }
  };

  const navCategories = [
    { name: 'Boys', path: '/boys', badge: null },
    { name: 'Girls', path: '/girls', badge: null },
    { name: 'Baby & Toddler', path: '/baby', badge: null },
    { name: 'New Arrivals', path: '/shop?sort=newest', badge: 'New' },
    { name: 'Best Sellers', path: '/shop?sort=popular', badge: null },
    { name: 'Summer Collection', path: '/shop?search=Summer', badge: null },
    { name: 'Winter Collection', path: '/shop?search=Winter', badge: null },
    { name: 'Sale', path: '/sale', badge: 'Sale', isSale: true }
  ];

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div style={{
        backgroundColor: '#1C1D1F',
        color: '#F4EFE6',
        fontSize: '0.78rem',
        letterSpacing: '0.04em',
        padding: '7px 16px',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500
      }}>
        {announcement}
      </div>

      {/* 2. MAIN HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(250, 249, 245, 0.98)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'var(--transition)'
      }}>
        <div className="container" style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          {/* LEFT: Hamburger Menu Button + Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                color: 'var(--text-main)',
                backgroundColor: 'transparent',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-alt)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Menu size={22} strokeWidth={1.8} />
            </button>

            {/* Brand Logo */}
            <Link to="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
                lineHeight: 1.1
              }}>
                Kids Garments
              </span>
              <span style={{
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent-terracotta)',
                fontWeight: 700
              }}>
                Children's Store
              </span>
            </Link>
          </div>

          {/* CENTER: Clean Desktop Navigation Bar */}
          <nav className="desktop-nav" style={{
            display: 'none',
            alignItems: 'center',
            gap: '18px'
          }}>
            <Link to="/boys" className="nav-link" style={desktopNavLinkStyle}>Boys</Link>
            <Link to="/girls" className="nav-link" style={desktopNavLinkStyle}>Girls</Link>
            <Link to="/baby" className="nav-link" style={desktopNavLinkStyle}>Baby & Toddler</Link>
            <Link to="/shop?sort=newest" className="nav-link" style={desktopNavLinkStyle}>New Arrivals</Link>
            <Link to="/shop?sort=popular" className="nav-link" style={desktopNavLinkStyle}>Best Sellers</Link>
            <Link to="/shop?search=Summer" className="nav-link" style={desktopNavLinkStyle}>Summer</Link>
            <Link to="/shop?search=Winter" className="nav-link" style={desktopNavLinkStyle}>Winter</Link>
            <Link to="/sale" className="nav-link" style={{ ...desktopNavLinkStyle, color: 'var(--accent-terracotta)', fontWeight: 700 }}>
              Sale
            </Link>
          </nav>

          {/* RIGHT: Search, Wishlist, Account, Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search Kids Clothing"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: 'var(--text-main)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-alt)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Search size={19} strokeWidth={1.75} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: 'var(--text-main)',
                position: 'relative',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-alt)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Heart size={19} strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-terracotta)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              aria-label="Account"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: 'var(--text-main)',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-alt)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <User size={19} strokeWidth={1.75} />
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              aria-label="Shopping Cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'var(--transition-fast)',
                marginLeft: '4px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              <ShoppingBag size={16} strokeWidth={2} />
              <span style={{ fontSize: '0.82rem' }}>{itemCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. SLIDER / HAMBURGER DRAWER MENU */}
      {drawerOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={`drawer-panel drawer-left ${drawerOpen ? 'open' : ''}`}
        style={{
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#FFFFFF'
        }}>
          <div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Kids Garments
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
              Children's Clothing Catalog
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close Menu"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              backgroundColor: 'var(--bg-alt)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories Menu List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            padding: '4px 12px 8px'
          }}>
            Main Categories
          </div>

          {navCategories.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              style={{
                padding: '13px 14px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.94rem',
                color: item.isSale ? 'var(--accent-terracotta)' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-alt)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span>{item.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.badge && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: item.isSale ? 'var(--accent-terracotta)' : 'var(--primary)',
                    color: '#FFFFFF'
                  }}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </Link>
          ))}

          {/* Sub-Category Quick Links */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              padding: '0 12px 8px'
            }}>
              Popular Wardrobe Types
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Link to="/shop?search=T-Shirt" onClick={() => setDrawerOpen(false)} style={drawerSubItemStyle}>
                T-Shirts & Tops
              </Link>
              <Link to="/shop?search=Shirt" onClick={() => setDrawerOpen(false)} style={drawerSubItemStyle}>
                Button-Down Shirts
              </Link>
              <Link to="/shop?search=Jeans" onClick={() => setDrawerOpen(false)} style={drawerSubItemStyle}>
                Jeans & Trousers
              </Link>
              <Link to="/shop?search=Dress" onClick={() => setDrawerOpen(false)} style={drawerSubItemStyle}>
                Dresses & Frocks
              </Link>
              <Link to="/shop?search=Kurta" onClick={() => setDrawerOpen(false)} style={drawerSubItemStyle}>
                Festive Kurta & Shalwar
              </Link>
              <Link to="/shop?search=Romper" onClick={() => setDrawerOpen(false)} style={drawerSubItemStyle}>
                Baby Rompers & Onesies
              </Link>
            </div>
          </div>
        </div>

        {/* Drawer Footer Info */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#FFFFFF',
          fontSize: '0.8rem',
          color: 'var(--text-body)'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>
            Kids Garments Pakistan
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            100% Breathable Organic Cotton Apparel
          </div>
        </div>
      </div>

      {/* 4. LIVE SEARCH MODAL */}
      {searchModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '80px 20px 20px'
          }}
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '600px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <Search size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kids clothing (e.g., Boys Shirt, Girls Dress, Romper, Kurta)..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  color: 'var(--text-main)'
                }}
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                style={{
                  color: 'var(--text-muted)',
                  padding: '4px',
                  borderRadius: '50%'
                }}
              >
                <X size={20} />
              </button>
            </form>

            {/* Results preview */}
            <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '12px 16px' }}>
              {isSearching ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Searching kids collection...
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.slug || item.id}`}
                      onClick={() => setSearchModalOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-alt)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <img
                        src={item.main_image}
                        alt={item.name}
                        onError={(e) => handleImageError(e, item.gender)}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-xs)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.gender} • {formatPKR(item.on_sale && item.sale_price ? item.sale_price : item.price)}
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </Link>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    style={{
                      marginTop: '8px',
                      padding: '10px',
                      textAlign: 'center',
                      backgroundColor: 'var(--bg-alt)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      width: '100%'
                    }}
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              ) : searchQuery.trim() ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No garments found matching "{searchQuery}"
                </div>
              ) : (
                <div style={{ padding: '16px 12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Popular Searches
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Boys Shirts', 'Girls Dresses', 'Baby Rompers', 'Festive Kurta', 'Winter Jackets', 'Summer Collection'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          navigate(`/shop?search=${encodeURIComponent(term)}`);
                          setSearchModalOpen(false);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-alt)',
                          fontSize: '0.8rem',
                          color: 'var(--text-body)',
                          fontWeight: 500
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const desktopNavLinkStyle = {
  fontSize: '0.92rem',
  fontWeight: 600,
  color: 'var(--text-main)',
  padding: '6px 4px',
  position: 'relative',
  transition: 'color 0.15s ease'
};

const drawerSubItemStyle = {
  padding: '8px 14px',
  fontSize: '0.84rem',
  color: 'var(--text-body)',
  borderRadius: 'var(--radius-xs)',
  transition: 'background-color 0.15s'
};
