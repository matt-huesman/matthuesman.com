// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		fs: {
			// Allow serving files from the monorepo root (node_modules live there, not in worktree)
			allow: [
				path.resolve(__dirname, '../../..'),
			]
		}
	}
});