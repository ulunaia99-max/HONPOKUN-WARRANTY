import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1C6EF2",
          light: "#4A8CFF",
          dark: "#0F4BB5",
        },
        accent: "#F5B800",
        soft: "#E8F0FF",
      },
      boxShadow: {
        card: "0 25px 50px -12px rgba(28, 110, 242, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;


