/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FinSight AI Brand Colors - Blue/Teal/Purple Gradients
        finsight: {
          blue: {
            50: '#E6F7FF',
            100: '#BAE7FF',
            200: '#91D5FF',
            300: '#69C0FF',
            400: '#40A9FF',
            500: '#1890FF', // Primary Blue
            600: '#0077D9',
            700: '#005FB3',
            800: '#00478C',
            900: '#003066',
          },
          teal: {
            50: '#E6FFFB',
            100: '#B3FFF5',
            200: '#80FFEF',
            300: '#4DFFE9',
            400: '#1AFFE3',
            500: '#00D4DD', // Primary Teal
            600: '#00A8B0',
            700: '#007C83',
            800: '#005056',
            900: '#002429',
          },
          purple: {
            50: '#F3E8FF',
            100: '#E0CCFF',
            200: '#C9A3FF',
            300: '#B17AFF',
            400: '#9951FF',
            500: '#8028FF', // Primary Purple
            600: '#6620CC',
            700: '#4D1899',
            800: '#331066',
            900: '#1A0833',
          },
          cyan: {
            DEFAULT: '#00E5FF',
            light: '#5DFDFF',
            dark: '#00B4D8',
          },
        },
        
        // Glassmorphism & Dark Theme
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          black: 'rgba(0, 0, 0, 0.5)',
          blur: 'rgba(255, 255, 255, 0.05)',
        },
        
        // Dark Background Layers
        dark: {
          bg: {
            primary: '#0A0E27',      // Deep space blue
            secondary: '#0F1420',    // Darker layer
            elevated: '#1A1F3A',     // Raised elements
            card: '#141B2D',         // Card background
            glass: 'rgba(26, 31, 58, 0.7)', // Glassmorphism
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#B8C5D6',
            muted: '#6B7A8F',
            disabled: '#4A5568',
          },
          border: {
            DEFAULT: 'rgba(255, 255, 255, 0.1)',
            light: 'rgba(255, 255, 255, 0.15)',
            glow: 'rgba(24, 144, 255, 0.3)',
          },
        },
        
        // Legacy Support (keep for compatibility)
        primary: {
          DEFAULT: '#1890FF',
          dark: '#0077D9',
          light: '#40A9FF',
        },
        secondary: {
          DEFAULT: '#00D4DD',
          dark: '#00A8B0',
          light: '#4DFFE9',
        },
        
        // Neon Accents
        neon: {
          blue: '#1890FF',
          teal: '#00D4DD',
          purple: '#8028FF',
          cyan: '#00E5FF',
          pink: '#FF4081',
          green: '#00FFA3',
          orange: '#FFB946',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      
      boxShadow: {
        // Glassmorphism Shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.6)',
        
        // Neon Glows
        'neon-blue': '0 0 20px rgba(24, 144, 255, 0.5), 0 0 40px rgba(24, 144, 255, 0.3)',
        'neon-teal': '0 0 20px rgba(0, 212, 221, 0.5), 0 0 40px rgba(0, 212, 221, 0.3)',
        'neon-purple': '0 0 20px rgba(128, 40, 255, 0.5), 0 0 40px rgba(128, 40, 255, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.5), 0 0 40px rgba(0, 229, 255, 0.3)',
        
        // Subtle Shadows
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(24, 144, 255, 0.1)',
      },
      
      backgroundImage: {
        // Futuristic Gradients
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-finsight': 'linear-gradient(135deg, #1890FF 0%, #00D4DD 50%, #8028FF 100%)',
        'gradient-finsight-dark': 'linear-gradient(135deg, #0077D9 0%, #00A8B0 50%, #6620CC 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      
      backdropBlur: {
        xs: '2px',
        glass: '10px',
        heavy: '20px',
      },
      
      animation: {
        // Smooth Animations
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(24, 144, 255, 0.5), 0 0 10px rgba(24, 144, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(24, 144, 255, 0.8), 0 0 40px rgba(24, 144, 255, 0.5)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
