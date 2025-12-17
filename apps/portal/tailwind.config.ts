import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#231942",
          700: "#5E548E",
          500: "#9F86C0",
          300: "#BE95C4",
          150: "#E0B1CB",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
