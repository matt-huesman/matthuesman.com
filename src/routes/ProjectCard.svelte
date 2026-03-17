<script lang="ts">
	import type { Project } from '$lib/data/projects';
	import Badge from '$lib/components/Badge.svelte';
	import Tag from '$lib/components/Tag.svelte';

	let { project }: { project: Project } = $props();

	const statusBadge = {
		complete:     { label: 'Complete',    variant: 'ok'      },
		'in-progress':{ label: 'In Progress', variant: 'warn'    },
		archived:     { label: 'Archived',    variant: 'neutral' }
	} as const;

	const demo = project.demo ? project.demo : null;

	const badge = statusBadge[project.status];
</script>

<article class="card--outlined flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 cursor-default">
	<div class="flex flex-1 flex-col p-6">
		<!-- Header row -->
		<div class="mb-3 flex items-start justify-between gap-3">
			<h3 class="text-base font-semibold leading-snug" style="color: var(--text);">
				{project.title}
			</h3>
			<Badge label={badge.label} variant={badge.variant} />
		</div>

		<!-- Description -->
		<p class="body-text mb-5 flex-1 text-sm leading-relaxed">
			{project.description}
		</p>

		<!-- Tags -->
		<div class="mb-5 flex flex-wrap gap-1.5">
			{#each project.tags as tag, i}
				<Tag label={tag} colorIndex={i} />
			{/each}
		</div>

		<!-- Links -->
		<div class="flex items-center justify-between" style="border-top: 1px solid var(--border); padding-top: 1rem;">
			{#if project.github}
				<a
					href={project.github}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-1.5 text-xs font-mono transition-colors hover:text-[var(--text)]"
					style="color: var(--text-muted);"
				>
					<i class="fa-brands fa-github"></i>
					Source
				</a>
			{/if}
			{#if project.demo}
				<a
					href={project.demo}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-1.5 text-xs font-mono transition-colors hover:text-[var(--text)]"
					style="color: var(--text);"
				>
					<i class="fa-solid fa-arrow-up-right-from-square text-[0.6rem]"></i>
					Live Demo
				</a>
			{/if}
		</div>
	</div>
</article>
