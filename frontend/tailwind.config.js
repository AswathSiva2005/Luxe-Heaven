/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Plus Jakarta Sans", "Segoe UI", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f4f8ff",
          100: "#e6efff",
          200: "#c6dbff",
          300: "#9fc0ff",
          400: "#6997ff",
          500: "#3f73ff",
          600: "#2f56e6",
          700: "#2845bf",
          800: "#253b9a",
          900: "#223478",
        },
      },
      boxShadow: {
        glow: "0 18px 40px rgba(63, 115, 255, 0.2)",
        card: "0 16px 40px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at 1px 1px, rgba(37,59,154,0.14) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
}

