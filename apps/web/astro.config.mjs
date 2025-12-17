import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import markdoc from "@astrojs/markdoc";


export default defineConfig({
  output:"static",
  adapter:vercel(),
  site: "https://auroradelplata.org",
  integrations: [keystatic(), react(), markdoc()],
  vite: { plugins: [tailwindcss()] }
});