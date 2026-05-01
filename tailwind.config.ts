import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#166534",
          dark: "#14532d",
          light: "#22c55e"
        },
        accent: {
          DEFAULT: "#ea580c",
          dark: "#c2410c",
          light: "#fb923c"
        },
        ink: "#0f172a",
        muted: "#64748b",
        bg: "#f8fafc",
        card: "#ffffff",
        border: "#e2e8f0"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "12px"
      }
    }
  },
  plugins: []
};

export default config;
