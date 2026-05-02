import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar    from './components/Navbar';
import Footer    from './components/Footer';
import MediaDashboard from './components/MediaDashboard';
import MediaDetail    from './components/MediaDetail';
import Auth      from './components/Auth';
import Watchlist from './components/Watchlist';
import Profile   from './components/Profile';
import NotFound  from './components/NotFound';

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('omni_theme') !== 'light'  // default dark (like IMDb)
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('omni_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('omni_theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-900">
      <ScrollToTop />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { style: { background: '#166534', color: '#fff' } },
          error:   { style: { background: '#991b1b', color: '#fff' } },
        }}
      />

      <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/"          element={<MediaDashboard />} />
          <Route path="/title/:id" element={<MediaDetail />} />
          <Route path="/login"     element={<Auth />} />
          <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*"          element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}