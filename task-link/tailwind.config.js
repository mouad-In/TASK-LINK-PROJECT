/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EBF2FE',
          100: '#D7E6FD',
          200: '#AFCDFB',
          300: '#87B4F9',
          400: '#5F9BF7',
          500: '#3B82F6',
          600: '#0B61E4',
          700: '#084AAD',
          800: '#063476',
          900: '#031D3F',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          50: '#F3EDFF',
          100: '#E7DBFF',
          200: '#CFB7FF',
          300: '#B793FF',
          400: '#9F6FFF',
          500: '#8B5CF6',
          600: '#6A2DC4',
          700: '#502293',
          800: '#371862',
          900: '#1D0C31',
        },
        // Landing page colors
        landing: {
          dark: '#0F172A', // slate-950
          purple: '#7C3AED', // violet/purple
          fuchsia: '#D946EF', // fuchsia-500
          cyan: '#06B6D4', // cyan-500
          slate: '#1E293B', // slate-800
        },
        accent: {
          DEFAULT: '#06B6D4', // Changed to cyan from landing page
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        error: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
      },
    },
  },
  plugins: [],
}
