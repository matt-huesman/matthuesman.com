import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

const dev = process.env.NODE_ENV === 'development'; // ✅ ADD THIS

const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
        }),
		paths: {
			base: dev ? '' : '/matthuesman.com',
		},
		prerender: {
			entries: ['*']
		}
	},
	plugins: [
		tailwindcss(),
	],
};

export default config;