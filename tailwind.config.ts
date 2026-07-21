import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        frogtown: {
          900: '#0A1F13',
          800: '#1B4332',
          700: '#2D6A4F',
          600: '#40916C',
          400: '#74C69D',
          200: '#B7E4C7',
          100: '#D8F3DC',
          50:  '#F0FAF3',
        },
        'off-white': '#F7FAF8',
        'muted-green': '#4A6358',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
export default config;
