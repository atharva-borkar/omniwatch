import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Film, Eye, EyeOff, Star, Bookmark, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: Bookmark, title: 'Track Everything',  desc: 'Movies, anime, series — all in one place.' },
  { icon: Star,     title: 'Rate & Review',      desc: 'Share your opinions with the community.' },
  { icon: User,     title: 'Your Profile',       desc: 'See your watchlist stats at a glance.' },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin]     = useState(searchParams.get('tab') !== 'signup');
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [passStrength, setPassStrength] = useState(0);

  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    // Password strength: 0-4
    let score = 0;
    if (password.length >= 6)  score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9!@#$%]/.test(password)) score++;
    setPassStrength(score);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const data = await api.login(username, password);
        login(data);
        toast.success(`Welcome back, ${data.username}!`);
        navigate('/');
      } else {
        await api.register(username, email, password);
        toast.success('Account created! Please sign in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['bg-slate-200 dark:bg-navy-600', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-[calc(100vh-56px)] grid md:grid-cols-2 animate-fade-in">

      {/* ── LEFT PANEL (branding) ──── */}
      <div className="hidden md:flex flex-col justify-between bg-navy-900 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 60%), radial-gradient(circle at 80% 20%, #f5c518 0%, transparent 50%)' }} />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-xl bg-gold-400 flex items-center justify-center">
              <Film size={20} className="text-navy-900" />
            </div>
            <span className="text-2xl font-black text-white">Omni<span className="text-gold-400">Watch</span></span>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Your personal<br />
            <span className="gradient-text">media universe.</span>
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Track movies, anime & series. Rate what you watch. Discover what's next.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-gold-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ──────── */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-navy-800">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="flex md:hidden items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-gold-400 flex items-center justify-center">
              <Film size={16} className="text-navy-900" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">Omni<span className="text-gold-400">Watch</span></span>
          </Link>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {isLogin ? 'Sign in to access your watchlist.' : 'Join OmniWatch — it\'s free.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                className="input-field bg-white dark:bg-navy-700 text-slate-900 dark:text-white ring-slate-200 dark:ring-white/10"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field bg-white dark:bg-navy-700 text-slate-900 dark:text-white ring-slate-200 dark:ring-white/10"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10 bg-white dark:bg-navy-700 text-slate-900 dark:text-white ring-slate-200 dark:ring-white/10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {!isLogin && password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${passStrength >= i ? strengthColors[passStrength] : 'bg-slate-200 dark:bg-navy-600'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{strengthLabels[passStrength] || ''}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary !py-3 !text-sm mt-2 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-navy-900/30 border-t-navy-900 animate-spin" />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setIsLogin(!isLogin); setPassword(''); }}
                className="font-semibold text-omni-600 dark:text-omni-400 hover:text-omni-500 transition-colors">
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}