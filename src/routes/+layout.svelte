<script lang="ts">
	import '../app.css';
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import HeaderItem from './HeaderItem.svelte';

	let { children } = $props();
</script>

<Header>
	<HeaderItem href="./me">About Me</HeaderItem>
	<HeaderItem href="#">Projects</HeaderItem>
	<HeaderItem href="#">Contact</HeaderItem>
	<i class="fa-solid fa-circle-half-stroke"></i>
</Header> 

{@render children()}

<Footer></Footer>