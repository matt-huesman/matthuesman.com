<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { skillGroups } from '$lib/data/skills';
	import { projects } from '$lib/data/projects';
	import SectionHeader from '../SectionHeader.svelte';
	import SkillBadge from '../SkillBadge.svelte';

	type ViewMode = 'type' | 'project';
	let viewMode = $state<ViewMode>('type');

	// Flat list of all skills with their group color attached
	const allSkills = skillGroups.flatMap((g) =>
		g.skills.map((s) => ({
			...s,
			color: g.color,
			linkedProjects: (s.projectIds ?? [])
				.map((id) => projects.find((p) => p.id === id))
				.filter((p): p is NonNullable<typeof p> => p !== undefined)
				.map((p) => ({ id: p.id, title: p.title }))
		}))
	);

	// Skills grouped by project, filtered to projects that have at least one skill
	const projectGroups = projects
		.map((p) => ({
			project: p,
			skills: allSkills.filter((s) => s.projectIds?.includes(p.id))
		}))
		.filter((g) => g.skills.length > 0);
</script>

<section id="skills" style="background: var(--surface-alt); padding-block: var(--section-y);">
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">

		<div use:reveal>
			<SectionHeader number="05" label="What I Work With" title="Skills & Tools" />
		</div>

		<!-- Controls -->
		<div class="controls" use:reveal={{ delay: 80 }}>
			<div class="segmented" role="group" aria-label="View mode">
				<button
					class="seg-btn"
					class:active={viewMode === 'type'}
					onclick={() => (viewMode = 'type')}
				>
					By Type
				</button>
				<button
					class="seg-btn"
					class:active={viewMode === 'project'}
					onclick={() => (viewMode = 'project')}
				>
					By Project
				</button>
			</div>
		</div>

		<!-- By Type view -->
		{#if viewMode === 'type'}
			<div class="mt-10 flex flex-col gap-10">
				{#each skillGroups as group, i}
					<div use:reveal={{ delay: i * 80 }}>
						<p class="group-label">{group.label}</p>
						<div class="badge-row">
							{#each group.skills as skill, j}
								{@const meta = allSkills.find((s) => s.name === skill.name)}
								<SkillBadge
									name={skill.name}
									color={group.color}
									icon={skill.icon}
									context={skill.context}
									linkedProjects={meta?.linkedProjects ?? []}
									floatDelay={(i * 10 + j) * 0.38}
								/>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- By Project view -->
		{#if viewMode === 'project'}
			<div class="mt-10 flex flex-col gap-10">
				{#each projectGroups as { project, skills }, i}
					<div use:reveal={{ delay: i * 80 }}>
						<div class="project-label-row">
							<p class="group-label">{project.title}</p>
							{#if project.github || project.demo}
								<a
									href={project.github ?? project.demo}
									target="_blank"
									rel="noopener noreferrer"
									class="project-ext-link"
								>
									View →
								</a>
							{/if}
						</div>
						<p class="project-desc">{project.description}</p>
						<div class="badge-row">
							{#each skills as skill, j}
								<SkillBadge
									name={skill.name}
									color={skill.color}
									icon={skill.icon}
									context={skill.context}
									linkedProjects={skill.linkedProjects}
									floatDelay={(i * 8 + j) * 0.42}
								/>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}

	</div>
</section>

<style>
	.group-label {
		margin-bottom: 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-faint);
	}

	.badge-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	/* ── Controls row ── */
	.controls {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		margin-top: 2.5rem;
	}

	/* Segmented control */
	.segmented {
		display: inline-flex;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 3px;
		gap: 2px;
	}

	.seg-btn {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		padding: 5px 13px;
		border-radius: calc(var(--radius-sm) - 2px);
		border: none;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.seg-btn.active {
		background: var(--surface);
		color: var(--text);
		box-shadow: var(--shadow-sm);
	}

	.seg-btn:not(.active):hover {
		color: var(--text);
	}

	/* ── Project view ── */
	.project-label-row {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 0.25rem;
	}

	.project-label-row .group-label {
		margin-bottom: 0;
	}

	.project-ext-link {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		color: var(--text-faint);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.project-ext-link:hover {
		color: var(--accent-text);
	}

	.project-desc {
		font-size: 0.775rem;
		line-height: 1.55;
		color: var(--text-faint);
		margin-bottom: 0.75rem;
		max-width: 620px;
	}
</style>
