<script lang="ts">
	import ParticleText from './ParticleText.svelte';
	import Terminal from './Terminal.svelte';
	import About from './sections/About.svelte';
	import Skills from './sections/Skills.svelte';
	import Projects from './sections/Projects.svelte';
	import Experience from './sections/Experience.svelte';
	import Contact from './sections/Contact.svelte';
</script>

<!-- Hero — full viewport LED dot matrix -->
<ParticleText />

<!-- About — white surface -->
<About />

<!-- Skills — off-white surface-alt -->
<Skills />

<!-- Projects — white surface -->
<Projects />

<!-- Experience — off-white surface-alt -->
<Experience />

<!-- Terminal — dark strip with built-in gradient fades (light→dark→light) -->
<Terminal />

<!-- Contact — white surface -->
<Contact />
