/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cx: {
          bg:       '#050810',
          surface:  '#0a0f1c',
          card:     '#0f1524',
          border:   '#1c2540',
          text:     '#e8edf8',
          dim:      '#a0aec0',
          muted:    '#5a6a8a',
          emerald:  '#10d988',
          sky:      '#38bdf8',
          violet:   '#8b5cf6',
          gold:     '#f5b731',
          rose:     '#f43f6e',
          indigo:   '#818cf8',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui'],
        body:    ['var(--font-body)',    'system-ui'],
        mono:    ['JetBrains Mono',      'monospace'],
      },
      fontWeight: {
        600: '600',
        700: '700',
        800: '800',
      },
      boxShadow: {
        'cx-em': '0 0 30px rgba(16,217,136,0.3)',
        'cx-vio': '0 0 30px rgba(139,92,246,0.3)',
        'cx-gold': '0 0 30px rgba(245,183,49,0.3)',
      },
      animation: {
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'float':       'float 3.5s ease-in-out infinite',
        'float-slow':  'floatSlow 5s ease-in-out infinite',
        'scale-in':    'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-down':  'slideDown 0.25s ease-out',
        'slide-up':    'slideUp 0.25s ease-out',
        'fade-in':     'fadeIn 0.3s ease-out',
        'notif-dot':   'notifPop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        glowPulse: { '0%,100%': { boxShadow:'0 0 8px rgba(16,217,136,0.3)' }, '50%': { boxShadow:'0 0 24px rgba(16,217,136,0.6)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        float:     { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-14px)' } },
        floatSlow: { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
        scaleIn:   { from: { opacity:'0', transform:'scale(0.92)' }, to: { opacity:'1', transform:'scale(1)' } },
        slideDown: { from: { opacity:'0', transform:'translateY(-10px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        slideUp:   { from: { opacity:'0', transform:'translateY(10px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:    { from: { opacity:'0', transform:'translateY(8px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        notifPop:  { '0%': { transform:'scale(0)' }, '80%': { transform:'scale(1.15)' }, '100%': { transform:'scale(1)' } },
      },
      backdropBlur: { xs: '4px' },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
}
