<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { base } from '$app/paths';
	import { projects } from '$lib/data/projects';
	import SectionHeader from '../SectionHeader.svelte';
	import ProjectCard from '../ProjectCard.svelte';

	// Show first 6 on homepage
	const featured = projects.slice(0, 6);
</script>

<section id="projects" style="background: var(--surface); padding-block: var(--section-y);">
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">

		<!-- Header row with "View all →" link -->
		<div class="flex items-end justify-between gap-4" use:reveal>
			<SectionHeader number="03" label="What I've Built" title="Projects" />
			<a
				href="{base}/projects"
				class="mb-1 shrink-0 font-mono text-xs transition-colors"
				style="color: var(--text-faint);"
				onmouseenter={(e) => (e.currentTarget.style.color = 'var(--accent-text)')}
				onmouseleave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
			>
				View all →
			</a>
		</div>

		<!-- Project grid -->
		<div class="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each featured as project, i}
				<div use:reveal={{ delay: i * 60 }}>
					<ProjectCard {project} />
				</div>
			{/each}
		</div>

	</div>
</section>
