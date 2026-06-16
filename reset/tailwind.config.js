/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'cx-bg':      '#07090f',
        'cx-surface': '#0d1018',
        'cx-card':    '#111520',
        'cx-border':  '#1a2035',
        'cx-emerald': '#10d988',
        'cx-violet':  '#8b5cf6',
        'cx-gold':    '#f5b731',
        'cx-sky':     '#38bdf8',
        'cx-rose':    '#f43f6e',
        'cx-muted':   '#4a5a7a',
        'cx-dim':     '#6b7fa3',
        'cx-text':    '#c0cfe8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        spin: { to: { transform: 'rotate(360deg)' } },
        gridPan: { '0%': { backgroundPosition: '0 0' }, '100%': { backgroundPosition: '60px 60px' } },
        orbFloat: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(20px,-30px) scale(1.08)' } },
        orbFloat2: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(-25px,25px) scale(1.05)' } },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(16,217,136,0.35), 0 0 32px rgba(16,217,136,0.25)' },
          '50%':     { boxShadow: '0 0 0 10px rgba(16,217,136,0), 0 0 48px rgba(16,217,136,0.45)' },
        },
        particleDrift: {
          '0%':   { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%':  { opacity: '0.6' },
          '90%':  { opacity: '0.6' },
          '100%': { transform: 'translateY(-120px) translateX(20px)', opacity: '0' },
        },
      },
      animation: {
        'spin-slow': 'spin 1s linear infinite',
        'grid-pan': 'gridPan 6s linear infinite',
        'orb-1': 'orbFloat 9s ease-in-out infinite',
        'orb-2': 'orbFloat2 11s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'particle': 'particleDrift linear infinite',
      },
    },
  },
  plugins: [],
}
