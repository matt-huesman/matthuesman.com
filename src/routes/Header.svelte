<script lang="ts">
	import type { Snippet } from 'svelte';
	import profile from '$lib/images/profile.png';

	let { children }: { children: Snippet } = $props();
	let scrolled = $state(false);
	let menuOpen = $state(false);

	$effect(() => {
		const handler = () => {
			scrolled = window.scrollY > 40;
		};
		window.addEventListener('scroll', handler, { passive: true });
		return () => window.removeEventListener('scroll', handler);
	});
</script>

<nav
	class="fixed top-0 z-50 w-full transition-all duration-300"
	style={scrolled
		? 'background: rgba(245,245,247,0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(0,0,0,0.06);'
		: 'background: transparent;'}
>
	<div class="container mx-auto flex h-16 items-center justify-between" style="max-width: var(--container); padding-inline: var(--gutter);">
		<!-- Logo -->
		<div class="flex items-center gap-3">
			<!-- <img src={profile} alt="Matt Huesman" class="h-8 w-8 rounded-full" style="box-shadow: 0 0 0 1.5px var(--accent);" /> -->
			<a href="./" class="font-semibold text-[length:var(--text)] hover:opacity-70 transition-opacity" style="color: var(--text); font-size: 1.5rem;">
				MH
			</a>
		</div>

		<!-- Desktop nav -->
		<div class="hidden items-center gap-1 md:flex">
			{@render children()}
		</div>

		<!-- Mobile hamburger -->
		<button
			type="button"
			class="flex items-center justify-center rounded-lg p-2 transition-colors md:hidden"
			style="color: var(--text-muted);"
			aria-label="Toggle menu"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<i class={menuOpen ? 'fa-solid fa-xmark text-lg' : 'fa-solid fa-bars text-lg'}></i>
		</button>
	</div>

	<!-- Mobile dropdown -->
	{#if menuOpen}
		<div
			class="card--outlined flex flex-col px-4 py-3 md:hidden mx-4 mb-2"
			style="background: rgba(255,255,255,0.96); backdrop-filter: blur(16px); border-radius: var(--radius);"
		>
			{@render children()}
		</div>
	{/if}
</nav>
