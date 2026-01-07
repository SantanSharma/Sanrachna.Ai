/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'antigoal': {
          'bg': '#0f172a',
          'card': '#1e293b',
          'card-hover': '#334155',
          'border': '#334155',
          'text': '#f1f5f9',
          'text-muted': '#94a3b8',
          'text-dim': '#64748b',
          'warning': '#dc2626',
          'warning-muted': '#991b1b',
          'warning-bg': 'rgba(220, 38, 38, 0.1)',
          'neutral': '#475569',
          'skip': '#ef4444',
          'done': '#22c55e',
          'accent': '#64748b',
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
