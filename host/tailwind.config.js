/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#07090f',
        surface: '#0d1018',
        card:    '#111520',
        border:  '#1a2035',
        emerald: '#10d988',
        violet:  '#8b5cf6',
        gold:    '#f5b731',
        sky:     '#38bdf8',
        rose:    '#f43f6e',
        muted:   '#4a5a7a',
        dim:     '#6b7fa3',
        text:    '#c0cfe8',
        white:   '#e8edf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
