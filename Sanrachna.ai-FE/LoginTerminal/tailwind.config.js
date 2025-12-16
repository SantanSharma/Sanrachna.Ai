/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors matching the design
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-border': '#334155',
        'dark-input': '#1e293b',
        'primary': '#3b82f6',
        'primary-hover': '#2563eb',
        'accent-purple': '#8b5cf6',
        'accent-gradient-start': '#3b82f6',
        'accent-gradient-end': '#8b5cf6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        'gradient-logout': 'linear-gradient(to right, #ef4444, #f97316)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
