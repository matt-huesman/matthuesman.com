<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { projects } from '$lib/data/projects';
	import type { ProjectStatus } from '$lib/data/projects';
	import SectionHeader from '../SectionHeader.svelte';
	import ProjectCard from '../ProjectCard.svelte';

	let activeFilter = $state<ProjectStatus | 'all'>('all');

	const filters: { label: string; value: ProjectStatus | 'all' }[] = [
		{ label: 'All', value: 'all' },
		{ label: 'Complete', value: 'complete' },
		{ label: 'In Progress', value: 'in-progress' }
	];

	const filtered = $derived(
		activeFilter === 'all' ? projects : projects.filter((p) => p.status === activeFilter)
	);
</script>

<svelte:head>
	<title>Matt Huesman — Projects</title>
</svelte:head>

<main
	class="min-h-screen"
	style="background: var(--bg); padding-top: 6rem; padding-bottom: var(--section-y);"
>
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">

		<div class="mb-12" use:reveal>
			<SectionHeader label="What I've Built" title="All Projects" />
			<p class="mt-3 body-text">A full list of personal and academic projects.</p>
		</div>

		<!-- Filter buttons -->
		<div class="mb-10 flex flex-wrap gap-2" use:reveal>
			{#each filters as f}
				<button
					type="button"
					class="rounded-full px-4 py-1.5 font-mono text-xs transition-all duration-200"
					style={activeFilter === f.value
						? 'background: var(--accent-faint); border: 1px solid var(--accent); color: var(--accent-text);'
						: 'background: var(--surface); border: 1px solid var(--border); color: var(--text-muted);'}
					onclick={() => (activeFilter = f.value)}
				>
					{f.label}
				</button>
			{/each}
		</div>

		<!-- Project grid -->
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each filtered as project, i (project.id)}
				<div use:reveal={{ delay: i * 60 }}>
					<ProjectCard {project} />
				</div>
			{/each}
		</div>

	</div>
</main>
