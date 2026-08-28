/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0B1F33",
          800: "#12304A",
          700: "#1A4062",
        },
        teal: {
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
