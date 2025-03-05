import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    site: "https://matt-huesman.github.io/",
    base: "/", // GitHub Pages
    output: "static", // Ensure outputs are static files
});