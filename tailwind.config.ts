import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', "serif"],
      },
      colors: {
        background: "#161b24",
        surface: {
          DEFAULT: "#1d232e",
          hover: "#252d3b",
          border: "#2b3444",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#8aa0ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          accent: "#8B5CF6",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "radial-mask": "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)",
      },
      animation: {
        "aurora": "aurora 20s linear infinite",
        "marquee": "marquee 35s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { opacity: "0.4", transform: "translateY(0) scale(1)" },
          "50%": { opacity: "0.8", transform: "translateY(-10px) scale(1.05)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
