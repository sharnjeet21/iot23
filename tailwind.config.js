/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0052CC',
        'primary-container': '#DEEBFF',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#0747A6',
        secondary: '#36B37E',
        'secondary-container': '#E3FCEF',
        'on-secondary': '#006644',
        tertiary: '#FF5630',
        'tertiary-container': '#FFEBE6',
        'on-tertiary': '#BF2600',
        surface: '#FFFFFF',
        'surface-dim': '#F4F5F7',
        'surface-container-low': '#F4F5F7',
        'surface-container': '#EBECF0',
        'surface-container-high': '#DFE1E6',
        'surface-container-highest': '#C1C7D0',
        'on-surface': '#172B4D',
        'on-surface-variant': '#42526E',
        outline: '#7A869A',
        'outline-variant': '#DFE1E6',
        background: '#F4F5F7',
        error: '#DE350B',
        'error-container': '#FFEBE6',
        'on-error': '#FFFFFF',
        warn: '#FFAB00',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px #36B37E' },
          '50%': { boxShadow: '0 0 16px #36B37E' },
        }
      }
    },
  },
  plugins: [],
}
