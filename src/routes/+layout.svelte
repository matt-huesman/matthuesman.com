<script lang="ts">
	import '../app.css';
	import Header from './Header.svelte';
	import HeaderItem from './HeaderItem.svelte';
	// import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<Header>
	<HeaderItem href="#">About Me</HeaderItem>
	<HeaderItem href="#">Projects</HeaderItem>
	<HeaderItem href="#">Contact</HeaderItem>
	<i class="fa-solid fa-circle-half-stroke"></i>
</Header>

{@render children()}
