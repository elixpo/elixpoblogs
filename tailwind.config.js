/** @type {import('tailwindcss').Config} */
export default {
  // Include the @elixpo/lixsketch React subpath so the canvas chrome's
  // utility classes get processed through our Tailwind pipeline. Without
  // this the canvas renders un-styled.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@elixpo/lixsketch/dist/**/*.{js,mjs,cjs}",
  ],
  theme: {
    extend: {
      // Custom theme tokens the canvas components reference (mirrors
      // sketch.elixpo's @theme block). Tweak these to retheme the canvas
      // toward the blog's palette without forking the components.
      // Canvas chrome tokens — driven by blogs' theme variables so the
      // toolbar / sidebars / modals match the rest of the app and pick up
      // light/dark mode automatically. Tailwind's color() resolver lets
      // it use `var(...)` references directly.
      colors: {
        surface: 'var(--bg-elevated)',
        'surface-hover': 'var(--bg-active)',
        'surface-active': 'var(--bg-active)',
        'surface-dark': 'var(--bg-surface)',
        'surface-card': 'var(--bg-elevated)',
        accent: '#9b7bf7',
        'accent-dim': '#c2b3f5',
        'accent-blue': '#9b7bf7',
        'accent-blue-hover': '#b69aff',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-body)',
        'text-dim': 'var(--text-faint)',
        'border-light': 'var(--border-default)',
        'border-accent': '#9b7bf7',
      },
      fontFamily: {
        sans: ['lixFont', 'sans-serif'],
        code: ['lixCode', 'monospace'],
        lixFont: ['lixFont', 'sans-serif'],
        lixCode: ['lixCode', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
