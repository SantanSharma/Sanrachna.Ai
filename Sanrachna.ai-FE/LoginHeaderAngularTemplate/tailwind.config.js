/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'app': {
          'bg': '#0f172a',
          'card': '#1e293b',
          'card-hover': '#334155',
          'border': '#334155',
          'text': '#f1f5f9',
          'text-muted': '#94a3b8',
          'accent-blue': '#3b82f6',
          'accent-green': '#22c55e',
          'accent-teal': '#14b8a6',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
