/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'], // Set Outfit as primary
        display: ['Outfit', 'sans-serif'],
      },
      screens: {
        '2xsm': '375px',
        'xsm': '425px',
        '3xl': '2000px',
      },
      fontSize: {
        'title-2xl': ['72px', { lineHeight: '90px', letterSpacing: '-0.02em' }],
        'title-xl': ['60px', { lineHeight: '72px', letterSpacing: '-0.02em' }],
        'title-lg': ['48px', { lineHeight: '60px', letterSpacing: '-0.02em' }],
        'title-md': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em' }],
        'title-sm': ['30px', { lineHeight: '38px' }],
        'theme-xl': ['20px', { lineHeight: '30px' }],
        'theme-sm': ['14px', { lineHeight: '20px' }],
        'theme-xs': ['12px', { lineHeight: '18px' }],
      },
      colors: {
        current: 'currentColor',
        transparent: 'transparent',
        white: '#ffffff',
        black: '#101828',
        // Pastel Brand - "Soft Peach / Coral"
        brand: {
          25: '#FFF9F5',
          50: '#FFF0E6',
          100: '#FFE1CC',
          200: '#FFD2B3',
          300: '#FFB380',
          400: '#FF944D',
          500: '#FF7A19', // More vibrant but still warm
          600: '#E65C00',
          700: '#B34700',
          800: '#803300',
          900: '#4D1F00',
          950: '#260F00',
        },
        // Pastel Secondary - "Soft Teal"
        secondary: {
          25: '#F2FCFC',
          50: '#E6F9F9',
          100: '#CCF3F3',
          200: '#99E6E6',
          300: '#66D9D9',
          400: '#33CCCC',
          500: '#00BFBF',
          600: '#009999',
          700: '#007373',
          800: '#004D4D',
          900: '#002626',
        },
        // Surface - "Warm/Cool Grey Mix"
        surface: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563', // Text body
          700: '#374151', // Text headings
          800: '#1F2937',
          900: '#111827',
        },
        // Semantic Pastels
        success: {
          25: '#F6FEF9',
          50: '#ECFDF3', // Pastel Green
          100: '#D1FADF',
          500: '#12B76A', // Vibrant for text/icons
          600: '#039855',
        },
        error: {
          25: '#FFFBFA',
          50: '#FEF3F2', // Pastel Red
          100: '#FEE4E2',
          500: '#F04438',
          600: '#D92D20',
        },
        warning: {
          25: '#FFFCF5',
          50: '#FFFAEB', // Pastel Yellow
          100: '#FEF0C7',
          500: '#F79009',
          600: '#DC6803',
        },
        info: {
          25: '#F5FAFF',
          50: '#EFF8FF', // Pastel Blue
          100: '#D1E9FF',
          500: '#2E90FA',
          600: '#1570EF',
        },
        gray: {
          25: '#FCFCFD',
          50: '#F9FAFB',
          100: '#F2F4F7',
          200: '#EAECF0',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1D2939',
          900: '#101828',
          950: '#0C111D',
        }
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'glass-sm': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 40px -8px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(255, 122, 25, 0.15)',
      },
      zIndex: {
        '1': '1',
        '9': '9',
        '99': '99',
        '999': '999',
        '9999': '9999',
        '99999': '99999',
        '999999': '999999',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem', // More rounded for modern look
        '4xl': '2rem',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
        'glass-lg': '24px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 0% 0%, hsla(25,100%,96%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(190,100%,96%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(25,100%,96%,1) 0, transparent 50%)',
      }
    },
  },
  plugins: [],
}
