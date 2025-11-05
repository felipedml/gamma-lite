// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          100: "#F2F2F2",
          600: "#666666",
          700: "#4A4A4A",
        },
        black: "#1F1F1F",
      },
    },
  },
  plugins: [],
};
