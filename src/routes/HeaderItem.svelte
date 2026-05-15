<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		href = '#',
		color = 'var(--accent-text)',
		active = false,
		children
	}: {
		href?: string;
		color?: string;
		active?: boolean;
		children: Snippet;
	} = $props();

	let hovered = $state(false);
	const showBar = $derived(hovered || active);
</script>

<a
	{href}
	class="relative px-3 py-1.5 text-sm font-medium rounded-lg"
	style="
		color: {hovered ? 'var(--text)' : 'var(--text-muted)'};
		background: {hovered ? 'rgba(0,0,0,0.05)' : 'transparent'};
		transition: color 200ms, background 200ms;
	"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	{@render children()}

	<!-- Colored underline: shows on hover and when this section is active -->
	<span
		class="absolute bottom-0.5 left-1/2 h-0.5 rounded-full"
		style="
			background: {color};
			transform: translateX(-50%);
			width: {showBar ? (active ? '1.25rem' : '0.875rem') : '0'};
			opacity: {showBar ? '1' : '0'};
			transition: width 280ms ease, opacity 280ms ease;
		"
	></span>
</a>
