/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        royal: {
          navy: "#0f101a",
          deep: "#12121f",
          crimson: "#c2185b",
          rose: "#e91e8c",
          blush: "#fff5f8",
          gold: "#f5d78e",
        },
        surprise: {
          bg: "#fdf2f8",
          lavender: "#f5f0ff",
          magenta: "#c2185b",
          soft: "#9ca3af",
        },
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        script: ["Segoe Script", "Brush Script MT", "cursive"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(233, 30, 140, 0.25)",
        pill: "0 8px 24px rgba(194, 24, 91, 0.28)",
        polaroid: "0 12px 32px rgba(0, 0, 0, 0.12)",
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        bob: "bob 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-6px) rotate(2deg)" },
        },
      },
    },
  },
  plugins: [],
};
