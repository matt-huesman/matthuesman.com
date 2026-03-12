<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { skillGroups } from '$lib/data/skills';
	import SectionHeader from '../SectionHeader.svelte';
	import SkillBadge from '../SkillBadge.svelte';
</script>

<section id="skills" style="background: var(--surface-alt); padding-block: var(--section-y);">
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">

		<div use:reveal>
			<SectionHeader number="02" label="What I Work With" title="Skills & Tools" />
		</div>

		<div class="mt-16 flex flex-col gap-10">
			{#each skillGroups as group, i}
				<div use:reveal={{ delay: i * 100 }}>
					<!-- Group label -->
					<p
						class="mb-4 font-mono text-[0.65rem] tracking-[0.18em] uppercase"
						style="color: var(--text-faint);"
					>
						{group.label}
					</p>
					<!-- Skill pills -->
					<div class="flex flex-wrap gap-2">
						{#each group.skills as skill, j}
							<SkillBadge name={skill.name} color={group.color} icon={skill.icon} />
						{/each}
					</div>
				</div>
			{/each}
		</div>

	</div>
</section>
