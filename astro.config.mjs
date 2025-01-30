import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://matt-huesman.github.io/",
  base: "/matthuesman.com/", // GitHub Pages
  output: "static", // Ensure outputs are static files
});