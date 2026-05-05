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
      // Canvas chrome tokens — mapped to blogs.elixpo's LIGHT palette so
      // the embedded canvas matches the rest of the app instead of looking
      // like a dark window cut into a light page. Edit these to retheme.
      colors: {
        surface: '#ffffff',
        'surface-hover': '#eeeff2',
        'surface-active': '#e2e3e8',
        'surface-dark': '#f4f4f6',
        'surface-card': '#f7f7f9',
        accent: '#9b7bf7',
        'accent-dim': '#c2b3f5',
        'accent-blue': '#7757e8',
        'accent-blue-hover': '#6647d4',
        'text-primary': '#111118',
        'text-secondary': '#2d2d3a',
        'text-muted': '#5c5c72',
        'text-dim': '#8585a0',
        'border-light': '#dcdce4',
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
