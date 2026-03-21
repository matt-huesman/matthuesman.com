<script lang="ts">
	import ParticleText from './ParticleText.svelte';
	import Terminal from './Terminal.svelte';
	import About from './sections/About.svelte';
	import Life from './sections/Life.svelte';
	import Skills from './sections/Skills.svelte';
	import Projects from './sections/Projects.svelte';
	import Experience from './sections/Experience.svelte';
	import Contact from './sections/Contact.svelte';
</script>

<!-- Hero — full viewport particle canvas with trajectory overlay -->
<div class="hero-wrapper">
	<ParticleText />
	<div class="hero-tagline" aria-hidden="true">
		<p>UMN &nbsp;·&nbsp; Medtronic &nbsp;·&nbsp; Tokyo Electron &nbsp;→</p>
	</div>
</div>

<!-- About — who I am -->
<About />

<!-- Life — the human side -->
<Life />

<!-- Experience — the journey -->
<Experience />

<!-- Projects — what I've built -->
<Projects />

<!-- Skills — what I work with -->
<Skills />

<!-- Terminal — dark strip -->
<Terminal />

<!-- Contact -->
<Contact />

<style>
	.hero-wrapper {
		position: relative;
	}

	.hero-tagline {
		position: absolute;
		bottom: 1.6rem;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.hero-tagline p {
		font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: #86868b;
	}
</style>
