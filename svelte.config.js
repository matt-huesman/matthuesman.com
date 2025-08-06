import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

const config = {
	kit: { 
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
        }),
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		},
	},
	plugins: [
		tailwindcss(),
	],
};

export default config;