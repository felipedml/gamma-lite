/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pc: {
          primary: "#6D6D6D",
          primaryDark: "#5A5A5A",
          primaryLight: "#8B8B8B",
          bg: "#F5F5F5",
          text: "#222222",
          surface: "#FFFFFF",
          accent: "#9E9E9E"
        }
      },
      borderRadius: {
        xl: "14px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,.08)",
      }
    }
  },
  plugins: [],
}
