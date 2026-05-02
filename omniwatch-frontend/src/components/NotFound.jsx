import { Link } from 'react-router-dom';
import { Home, Film } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="text-[8rem] font-black text-slate-100 dark:text-navy-800 leading-none select-none mb-2">
        404
      </div>
      <div className="mb-6">
        <Film size={40} className="mx-auto text-gold-400 mb-4" />
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          This scene doesn't exist in our catalog. Maybe you mistyped the URL?
        </p>
      </div>
      <Link to="/" className="btn-primary flex items-center gap-2">
        <Home size={16} /> Back to Catalog
      </Link>
    </div>
  );
}
