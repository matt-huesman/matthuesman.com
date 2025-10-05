<script lang="ts">
	import '../app.css';
	import Header from './Header.svelte';
	import HeaderItem from './HeaderItem.svelte';
	// import { base } from '$app/paths'

	let { children } = $props();
</script>

<Header>
	<HeaderItem href="/">About Me</HeaderItem>
	<HeaderItem href="/me">Projects</HeaderItem>
	<HeaderItem href="/contact">Contact</HeaderItem>
	<i class="fa-solid fa-circle-half-stroke"></i>
</Header>

{@render children()}
