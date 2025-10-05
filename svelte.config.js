import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// otherwise fail the build
				if (path === '/404' || path === '/projects') {
					// Ignore 404 page during prerender
					return;
				}
				throw new Error(message);
			}
		},
		paths: {
			base: base
		}
	}
};

export default config;
