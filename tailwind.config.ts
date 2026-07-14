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
          bg: "#010102",
          panel: "#0f1011",
          panel2: "#141516",
          line: "#23252a",
          lineStrong: "#34343a",
          text: "#f7f8f8",
          textMuted: "#d0d6e0",
          muted: "#8a8f98",
          subtle: "#62666d",
          accent: "#5e6ad2",
          accentHover: "#828fff",
          accentFocus: "#5e69d1",
          success: "#27a644"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "ui-monospace", "monospace"]
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        xxl: "24px"
      }
    }
  },
  plugins: []
};

export default config;
