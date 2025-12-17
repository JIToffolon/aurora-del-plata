import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx,mdoc}"],
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

      typography: {
        DEFAULT: {
          css: {
            a: { color: "#E0B1CB" },
            "a:hover": { color: "#BE95C4" },
            h1: { color: "white" },
            h2: { color: "white" },
            h3: { color: "white" },
            strong: { color: "white" },
            code: { color: "white" },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
