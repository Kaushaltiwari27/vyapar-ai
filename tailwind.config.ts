import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Geist', 'Inter', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#4F46E5', light: '#6366F1', dark: '#3730A3' },
        accent: { DEFAULT: '#7C3AED', light: '#8B5CF6' },
      },
      borderRadius: { '2xl': '16px', '3xl': '24px' },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 40px rgba(0,0,0,0.10)',
        'glow': '0 0 30px rgba(79,70,229,0.25)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
