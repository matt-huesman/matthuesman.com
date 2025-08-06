import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null,
        }),
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/matthuesman.com' : '',
        },
	},
	plugins: [
		tailwindcss(),
	],
};

export default config;