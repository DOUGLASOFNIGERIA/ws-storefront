import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1714",
        surface: "#2a221d",
        wine: "#3a2a24",
        "wine-light": "#4a372f",
        cream: "#f7f2e9",
        muted: "#b5a79a",
        gold: "#c79a6b",
        accent: "#b96f52",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.2em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "drawer-in": "drawer-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
