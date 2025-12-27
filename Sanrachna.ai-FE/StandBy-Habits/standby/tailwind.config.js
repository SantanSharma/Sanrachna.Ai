/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'standby': {
          'bg': '#0f172a',
          'card': '#1e293b',
          'card-hover': '#334155',
          'border': '#334155',
          'text': '#f1f5f9',
          'text-muted': '#94a3b8',
          'accent-blue': '#3b82f6',
          'accent-green': '#22c55e',
          'accent-orange': '#f97316',
          'accent-yellow': '#eab308',
          'accent-teal': '#14b8a6',
          'accent-red': '#ef4444',
          'success': '#22c55e',
          'grid-empty': '#1e293b',
          'grid-low': '#166534',
          'grid-medium': '#22c55e',
          'grid-high': '#4ade80',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

