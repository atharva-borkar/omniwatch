import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Moon, Sun, Menu, X, Bookmark, LogOut, User, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ isDarkMode, setIsDarkMode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-navy-900/95 backdrop-blur-md shadow-2xl border-b border-white/5'
        : 'bg-navy-900 border-b border-white/5'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400">
              <Film size={16} className="text-navy-900" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Omni<span className="text-gold-400">Watch</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="nav-link">Catalog</Link>
            <Link to="/?type=movie" className="nav-link">Movies</Link>
            <Link to="/?type=anime" className="nav-link">Anime</Link>
            <Link to="/?type=series" className="nav-link">Series</Link>
            {isAuthenticated && (
              <Link to="/watchlist" className="nav-link flex items-center gap-1">
                <Bookmark size={14} />
                Watchlist
              </Link>
            )}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles..."
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-400 focus:bg-white/10 transition-all"
              />
            </div>
          </form>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-all">
                  <div className="h-7 w-7 rounded-full bg-omni-600 flex items-center justify-center text-xs font-bold text-white">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300 hidden md:block">{user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all" aria-label="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link to="/login?tab=signup" className="btn-primary !py-1.5 !px-4 !text-xs">
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-navy-900 px-4 py-4 space-y-3 animate-slide-up">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles..."
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-400"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-1">
            {[['/', 'Catalog'], ['/?type=movie', 'Movies'], ['/?type=anime', 'Anime'], ['/?type=series', 'Series']].map(([href, label]) => (
              <Link key={href} to={href} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm">
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/watchlist" className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm flex items-center gap-2">
                <Bookmark size={14} />Watchlist
              </Link>
            )}
          </nav>
          {isAuthenticated ? (
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-300">
                <div className="h-7 w-7 rounded-full bg-omni-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                {user?.username}
              </Link>
              <button onClick={handleLogout} className="text-sm text-red-400 flex items-center gap-1">
                <LogOut size={14} />Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 border-t border-white/10 pt-3">
              <Link to="/login" className="flex-1 text-center py-2 text-sm text-slate-300 border border-white/10 rounded-lg hover:bg-white/5 transition-all">Sign in</Link>
              <Link to="/login?tab=signup" className="flex-1 text-center py-2 text-sm font-semibold bg-gold-400 text-navy-900 rounded-lg hover:bg-gold-500 transition-all">Join Free</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
