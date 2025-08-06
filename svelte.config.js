import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';

const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter({
          pages: 'build', // Output directory for static pages
          assets: 'build', // Output directory for static assets
          fallback: null, // Set to null for 404 handling if needed
        }),
		paths: {
          base: process.env.NODE_ENV === 'production' ? '/matthuesman.com' : '', // Adjust for your repository name
        },
	},
	plugins: [
		tailwindcss(),
	],
};