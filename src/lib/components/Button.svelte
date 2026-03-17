<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		size = 'md',
		href,
		type = 'button',
		disabled = false,
		onclick,
		children
	}: {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	} = $props();

	const sizeClass = {
		sm: 'text-sm px-4 py-2',
		md: 'text-base px-5 py-2.5',
		lg: 'text-lg px-7 py-3'
	}[size];
</script>

{#if href}
	<a {href} class="btn btn--{variant} {sizeClass}" style="color: {variant === 'primary' ? '#ffffff' : 'var(--text)'}" class:opacity-50={disabled} class:pointer-events-none={disabled}>
		{@render children()}
	</a>
{:else}
	<button {type} {disabled} {onclick} class="btn btn--{variant} {sizeClass}" style="color: {variant === 'primary' ? '#ffffff' : 'var(--text)'}">
		{@render children()}
	</button>
{/if}
