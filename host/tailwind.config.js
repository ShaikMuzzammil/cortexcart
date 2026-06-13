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
        emerald: { 50:'#e6fdf4',100:'#c2faE6',200:'#8ff3d1',300:'#52e8ba',400:'#22e2a4',500:'#10d988',600:'#0ba968',700:'#0a8a56',800:'#0a6c46',900:'#08543a' },
        violet:  { 50:'#f3f0ff',100:'#e4dcff',200:'#cbbcff',300:'#ad94ff',400:'#a78bfa',500:'#8b5cf6',600:'#7a3ff0',700:'#6928db',800:'#5621b5',900:'#451c92' },
        gold:    '#f5b731',
        sky:     { 50:'#f0f9ff',100:'#e0f4fe',200:'#bae6fd',300:'#8fd9fc',400:'#67c8fb',500:'#38bdf8',600:'#1ea3e0',700:'#1786bb',800:'#176a96',900:'#17577c' },
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
