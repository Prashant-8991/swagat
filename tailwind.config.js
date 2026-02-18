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
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          'primary-foreground': "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          'accent-foreground': "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },

        // Retaining brand colors for compatibility
        brand: {
          25: '#fefcf9',
          50: '#fdf5ec',
          100: '#fae6d0',
          200: '#f5cd9f',
          300: '#efae68',
          400: '#ea8b38',
          500: '#e56e18', // Primary brand
          600: '#d95311',
          700: '#b43f11',
          800: '#903314',
          900: '#742d14',
          950: '#3f1508',
        },
        // Legacy colors support
        transparent: 'transparent',
        white: '#ffffff',
        black: '#101828',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'glass-sm': '0 2px 10px rgba(0, 0, 0, 0.03)', // Kept from original
        'glass-lg': '0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.6)', // Kept from original
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 20px rgba(255, 122, 25, 0.15)', // Kept from original
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
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
