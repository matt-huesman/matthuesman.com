<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import HeaderItem from './HeaderItem.svelte';

	let { children } = $props();

	// Each nav entry: section id, label, and the accent-text color for that section
	const navItems = [
		{ id: 'about',      label: 'About',      color: '#005f73' },
		{ id: 'experience', label: 'Experience',  color: '#ca6702' },
		{ id: 'projects',   label: 'Projects',    color: '#bb3e03' },
		{ id: 'skills',     label: 'Skills',      color: '#9b2226' },
		{ id: 'contact',    label: 'Contact',     color: '#ae2012' }
	] as const;

	let activeSection = $state('');

	onMount(() => {
		const observers: IntersectionObserver[] = [];

		navItems.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (!el) return;

			// Fire when 30% or more of the section enters the viewport middle band
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) activeSection = id;
				},
				{ rootMargin: '-30% 0px -30% 0px', threshold: 0 }
			);
			observer.observe(el);
			observers.push(observer);
		});

		return () => observers.forEach((o) => o.disconnect());
	});
</script>

<Header>
	{#each navItems as { id, label, color }}
		<HeaderItem href="{base}/#{id}" {color} active={activeSection === id}>
			{label}
		</HeaderItem>
	{/each}
</Header>

{@render children()}

<Footer />
