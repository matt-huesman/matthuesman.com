<script lang="ts">
	import type { Snippet } from 'svelte';
	import profile from '$lib/images/profile.png';

	let { children }: { children: Snippet } = $props();
	let scrolled = $state(false);

	$effect(() => {
		const handler = () => {
			scrolled = window.scrollY > 20;
		};
		window.addEventListener('scroll', handler, { passive: true });
		return () => window.removeEventListener('scroll', handler);
	});

	let menuOpen = $state(false);
</script>

<nav
	class="fixed top-0 z-50 w-full px-6 transition-all duration-300"
	class:backdrop-blur-md={scrolled}
	class:bg-[#030712]={!scrolled}
	style={scrolled ? 'background: rgba(3,7,18,0.85);' : ''}
>
	<div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between">
		<div class="flex items-center">
			<img src={profile} alt="Profile" class="mr-3 h-10 w-10 rounded-full ring-2 ring-purple-600/60" />
			<a
				href="./"
				class="gradient-text text-2xl font-bold"
			>Matt Huesman</a>
		</div>

		<!-- Desktop nav -->
		<div class="hidden items-center space-x-1 md:flex">
			{@render children()}
		</div>

		<!-- Mobile hamburger -->
		<button
			type="button"
			class="flex items-center justify-center rounded p-2 text-gray-400 hover:text-white md:hidden"
			aria-label="Toggle menu"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<i class={menuOpen ? 'fa-solid fa-xmark text-xl' : 'fa-solid fa-bars text-xl'}></i>
		</button>
	</div>

	<!-- Mobile dropdown -->
	{#if menuOpen}
		<div class="glass-card mb-2 flex flex-col space-y-1 px-4 py-3 md:hidden">
			{@render children()}
		</div>
	{/if}
</nav>
