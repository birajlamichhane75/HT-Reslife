import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#660100', // HT Maroon
          light: '#F7E3B8',   // Ember
          mid: '#FAAB8A',     // Bloom
          maroon: '#660100',
          gold: '#FFCC00',
          ember: '#F7E3B8',
          crimson: '#FA2626',
          bloom: '#FAAB8A',
          ecogreen: '#00373E',
          fresh: '#C7EDBF',
          terra: '#291C14',
          sand: '#FFFAEB',
        },
        accent: '#FFCC00',    // HT Gold
        surface: {
          1: '#FFFFFF',
          2: '#FFFAEB',       // Sand
          3: '#F7E3B8',       // Ember
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}

export default config
