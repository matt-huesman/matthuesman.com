import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter() },
	plugins: [
		tailwindcss(),
	],
};

export default config;
