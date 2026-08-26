import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: "#F7F5F0",
        ink: "#1E2A28",
        sage: {
          DEFAULT: "#6B8F71",
          light: "#E4EBE3",
          dark: "#4C6A51",
        },
        clay: {
          DEFAULT: "#C1533D",
          light: "#F5E1DC",
        },
        line: "#DDD8CE",
      },
      fontFamily: {
        display: ["var(--font-newsreader)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
