import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0E14',
        surface: '#121824',
        'surface-card': 'rgba(18, 24, 36, 0.75)',
        'surface-border': 'rgba(255, 255, 255, 0.08)',
        accent: {
          DEFAULT: '#00F0FF',
          hover: '#38F4FF',
          glow: 'rgba(0, 240, 255, 0.25)'
        },
        success: {
          DEFAULT: '#10B981',
          glow: 'rgba(16, 185, 129, 0.25)'
        },
        danger: {
          DEFAULT: '#FF5F56',
          glow: 'rgba(255, 95, 86, 0.25)'
        },
        warning: {
          DEFAULT: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.25)'
        },
        purple: {
          DEFAULT: '#8B5CF6',
          glow: 'rgba(139, 92, 246, 0.25)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'glass': '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow-accent': '0 0 25px rgba(0, 240, 255, 0.35)',
        'glow-success': '0 0 25px rgba(16, 185, 129, 0.35)',
        'glow-danger': '0 0 25px rgba(255, 95, 86, 0.35)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanline 2s linear infinite'
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
};

export default config;
