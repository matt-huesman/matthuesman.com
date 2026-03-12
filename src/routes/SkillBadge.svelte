<script lang="ts">
	import type { SkillColor } from '$lib/data/skills';

	let {
		name,
		color = 'cyan',
		icon
	}: {
		name: string;
		color?: SkillColor;
		icon?: string;
	} = $props();

	// Map SkillColor to the CSS custom property accent colors
	const accentStyle: Record<SkillColor, string> = {
		cyan:    'border-left-color: var(--accent-teal); color: var(--accent-text);',
		purple:  'border-left-color: var(--accent-teal); color: var(--accent-text);',  /* remap to teal */
		orange:  'border-left-color: var(--accent-yellow); color: #9a7c00;',
		neutral: 'border-left-color: var(--border); color: var(--text-muted);'
	};
</script>

<span
	class="skill-badge inline-flex items-center gap-1.5 border-l-2 px-3 py-1.5 font-mono text-xs transition-all duration-200 hover:-translate-y-px"
	style="background: var(--surface); border-radius: var(--radius-sm); border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); {accentStyle[color]}"
>
	{#if icon}
		<i class="{icon} text-[0.6rem]"></i>
	{/if}
	{name}
</span>

<style>
	.skill-badge:hover {
		box-shadow: var(--shadow-sm);
	}
</style>
