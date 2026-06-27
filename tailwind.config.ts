import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#05070d",
          panel: "#0d111b",
          line: "#232b3d",
          text: "#f5f7fb",
          muted: "#8d96ad",
          accent: "#7dd3fc"
        }
      }
    }
  },
  plugins: []
};

export default config;
