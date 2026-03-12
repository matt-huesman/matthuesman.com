<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import Footer from './Footer.svelte';
	import Header from './Header.svelte';
	import HeaderItem from './HeaderItem.svelte';

	let { children } = $props();
</script>

<Header>
	<HeaderItem href="{base}/#about">About</HeaderItem>
	<HeaderItem href="{base}/#skills">Skills</HeaderItem>
	<HeaderItem href="{base}/#projects">Projects</HeaderItem>
	<HeaderItem href="{base}/#terminal">Terminal</HeaderItem>
	<HeaderItem href="{base}/#contact">Contact</HeaderItem>
</Header>

{@render children()}

<Footer />
