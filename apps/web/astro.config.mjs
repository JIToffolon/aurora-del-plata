import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";

import markdoc from "@astrojs/markdoc";

export default defineConfig({
  site: "https://auroradelplata.org",
  integrations: [keystatic(), react(), markdoc()],
  vite: { plugins: [tailwindcss()] }
});