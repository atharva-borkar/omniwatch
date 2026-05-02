import { Link } from 'react-router-dom';
import { Film, ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-white/5 mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gold-400 flex items-center justify-center">
                <Film size={14} className="text-navy-900" />
              </div>
              <span className="text-base font-black text-white">Omni<span className="text-gold-400">Watch</span></span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track movies, anime & series. Rate, review, discover. Your personal media universe.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Catalog</h4>
            <ul className="space-y-2">
              {[['/', 'All Titles'], ['/?type=movie', 'Movies'], ['/?type=anime', 'Anime'], ['/?type=series', 'Series']].map(([href, label]) => (
                <li key={href}><Link to={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Account</h4>
            <ul className="space-y-2">
              {[['/login', 'Sign In'], ['/login?tab=signup', 'Create Account'], ['/watchlist', 'My Watchlist'], ['/profile', 'Profile']].map(([href, label]) => (
                <li key={href}><Link to={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} OmniWatch. Built with FastAPI & React.</p>
        <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors"><Globe size={16} /></a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors"><ExternalLink size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
