/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0A0B0D',
        elev: '#1A1B1E',
        sunken: '#000000',
        ink: '#F8FAFC',
        muted: '#94A3B8',
        dim: '#64748B',
        border: '#334155',
        accent: '#818CF8',
        'risk-low': '#10B981',
        'risk-med': '#F59E0B',
        'risk-high': '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace']
      },
      boxShadow: {
        'neu': '8px 8px 16px rgba(0, 0, 0, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.02)',
        'neu-inset': 'inset 8px 8px 16px rgba(0, 0, 0, 0.3), inset -8px -8px 16px rgba(255, 255, 255, 0.02)'
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}