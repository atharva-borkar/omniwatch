/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // IMDb gold accent
        gold: {
          400: '#f5c518',
          500: '#e6b800',
          600: '#cca300',
        },
        // Deep navy backgrounds
        navy: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#141d35',
          600: '#1a2540',
        },
        // Omni violet (secondary accent)
        omni: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to right, rgba(10,14,26,0.98) 40%, rgba(10,14,26,0.6) 70%, transparent 100%)',
        'card-gradient': 'linear-gradient(to top, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.5) 60%, transparent 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.35)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.55)',
        'glow-gold': '0 0 20px rgba(245,197,24,0.3)',
        'glow-omni': '0 0 20px rgba(139,92,246,0.4)',
      },
    },
  },
  plugins: [],
}