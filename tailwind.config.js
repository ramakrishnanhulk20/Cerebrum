/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
    },
    extend: {
      colors: {
        // Semantic color system
        primary: {
          DEFAULT: '#00e6a0',
          50: '#e6fff9',
          100: '#b3ffe8',
          200: '#80ffd7',
          300: '#4dffc6',
          400: '#1affb5',
          500: '#00e6a0',
          600: '#00b37d',
          700: '#00805a',
          800: '#004d37',
          900: '#001a14',
        },
        // Neutral slate/ink ramp
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Semantic tokens
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          strong: 'rgba(255, 255, 255, 0.1)',
          subtle: 'rgba(255, 255, 255, 0.03)',
        },
        muted: {
          DEFAULT: '#94a3b8',
          foreground: '#cbd5e1',
        },
        ring: {
          DEFAULT: 'rgba(0, 230, 160, 0.3)',
          subtle: 'rgba(255, 255, 255, 0.1)',
        },
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(0, 230, 160, 0.3), 0 0 40px rgba(0, 255, 198, 0.2)',
        'glow-lg': '0 0 30px rgba(0, 230, 160, 0.4), 0 0 60px rgba(0, 255, 198, 0.3)',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'glow': {
          'from': {
            'text-shadow': '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #00e6a0, 0 0 40px #00e6a0'
          },
          'to': {
            'text-shadow': '0 0 20px #fff, 0 0 30px #00ffc6, 0 0 40px #00ffc6, 0 0 50px #00ffc6'
          }
        },
        'shimmer': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      letterSpacing: {
        tighter: '-0.05em',
      },
    },
  },
  plugins: [],
}
