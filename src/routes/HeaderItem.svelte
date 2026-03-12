<script lang="ts">
	import type { Snippet } from 'svelte';
	let { href = '#', children }: { href?: string; children: Snippet } = $props();
</script>

<a
	{href}
	class="group relative px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-black/5"
	style="color: var(--text-muted);"
>
	<span style="transition: color 200ms;"
		class="group-hover:text-[var(--text)]">
		{@render children()}
	</span>
	<!-- Subtle accent dot on active/hover -->
	<span
		class="absolute bottom-0.5 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full opacity-0 transition-all duration-300 group-hover:w-4 group-hover:opacity-100"
		style="background: var(--accent);"
	></span>
</a>
