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
      // Canvas chrome tokens — kept on the dark sketch palette so the
      // toolbar / shape sidebars / modals retain contrast against the
      // working canvas surface (also dark). The host's header above the
      // canvas is the only piece that tracks the blog's light theme.
      colors: {
        surface: '#232329',
        'surface-hover': '#343448',
        'surface-active': '#444480',
        'surface-dark': '#1a1a20',
        'surface-card': '#1e1e28',
        accent: '#c873e4',
        'accent-dim': '#444480',
        'accent-blue': '#9b7bf7',
        'accent-blue-hover': '#b69aff',
        'text-primary': '#fff',
        'text-secondary': '#e8e8ee',
        'text-muted': '#a0a0b0',
        'text-dim': '#787888',
        'border-light': '#3a3a50',
        'border-accent': '#5555a0',
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
