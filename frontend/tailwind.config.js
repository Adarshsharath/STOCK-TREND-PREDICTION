/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
          light: '#A78BFA',
        },
        secondary: {
          DEFAULT: '#00D09C',
          dark: '#00B87C',
          light: '#00FFA3',
        },
        background: {
          DEFAULT: '#f8fafc',
          dark: '#f1f5f9',
        },
        card: '#ffffff',
        text: {
          DEFAULT: '#1e293b',
          light: '#64748b',
          muted: '#94a3b8',
        },
        success: {
          DEFAULT: '#00D09C',
          light: '#00FFA3',
          dark: '#00B87C',
        },
        danger: {
          DEFAULT: '#FF3B69',
          light: '#FF5252',
          dark: '#E91E63',
        },
        warning: {
          DEFAULT: '#FFA500',
          light: '#FFB946',
          dark: '#FF8C00',
        },
        info: {
          DEFAULT: '#00D4FF',
          light: '#5DFDFF',
          dark: '#00B4D8',
        },
        border: '#e2e8f0',
        
        // Radium/Neon accent colors
        neon: {
          green: '#00FFA3',
          purple: '#B388FF',
          blue: '#00D4FF',
          pink: '#FF4081',
          orange: '#FFB946',
          cyan: '#00E5FF',
        },
        
        // Dark mode specific colors
        dark: {
          bg: {
            primary: '#0C0F11',
            secondary: '#161A1D',
            tertiary: '#1E2329',
            elevated: '#252A30',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#B0B3B8',
            muted: '#6B7280',
            disabled: '#4B5563',
          },
          border: {
            DEFAULT: '#2D3238',
            light: '#3A3F47',
            dark: '#1E2329',
          },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark-card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'neon': '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
        'neon-green': '0 0 10px rgba(0, 255, 163, 0.5), 0 0 20px rgba(0, 255, 163, 0.3)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
