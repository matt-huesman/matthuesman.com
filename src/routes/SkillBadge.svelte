<script lang="ts">
	import type { SkillColor } from '$lib/data/skills';

	let {
		name,
		color = 'neutral',
		icon,
		context,
		linkedProjects = [],
		floatEnabled = false,
		floatDelay = 0
	}: {
		name: string;
		color?: SkillColor;
		icon?: string;
		context?: string;
		linkedProjects?: Array<{ id: string; title: string }>;
		floatEnabled?: boolean;
		floatDelay?: number;
	} = $props();

	const accentStyle: Record<SkillColor, string> = {
		teal:    'border-left-color: #0a9396; color: #005f73;',
		red:     'border-left-color: var(--accent-red); color: var(--accent-red);',
		yellow:  'border-left-color: #ee9b00; color: #ca6702;',
		neutral: 'border-left-color: var(--border); color: var(--text-muted);'
	};

	const hasPopover = context || linkedProjects.length > 0;
	let hovered = $state(false);
</script>

<span
	class="badge-wrap"
	class:floating={floatEnabled}
	style="animation-delay: -{floatDelay}s"
	role="group"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	<span
		class="skill-badge inline-flex items-center gap-1.5 border-l-2 px-3 py-1.5 font-mono text-xs transition-all duration-200"
		class:lifted={hovered}
		style="background: var(--surface); border-radius: var(--radius-sm); border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); {accentStyle[color]}"
	>
		{#if icon}
			<i class="{icon} text-[0.6rem]"></i>
		{/if}
		{name}
	</span>

	{#if hasPopover}
		<div class="popover" class:visible={hovered}>
			{#if context}
				<p class="popover-context">{context}</p>
			{/if}
			{#if linkedProjects.length > 0}
				<div class="popover-projects">
					{#each linkedProjects as project}
						<a href="#{project.id}" class="popover-project-link">
							{project.title}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</span>

<style>
	.badge-wrap {
		position: relative;
		display: inline-flex;
	}

	/* ── Float animation ── */
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50%       { transform: translateY(-5px); }
	}

	.floating {
		animation: float 9s ease-in-out infinite;
	}

	/* Pause float on hover so the popover stays put */
	.floating:hover {
		animation-play-state: paused;
	}

	@media (prefers-reduced-motion: reduce) {
		.floating { animation: none; }
	}

	/* ── Badge hover lift ── */
	.skill-badge { cursor: default; }

	.skill-badge.lifted {
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	/* ── Popover ── */
	.popover {
		position: absolute;
		bottom: calc(100% + 10px);
		left: 50%;
		transform: translateX(-50%) translateY(6px);
		width: 230px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-md);
		padding: 10px 12px;
		z-index: 20;
		pointer-events: none;
		opacity: 0;
		transition:
			opacity var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.popover.visible {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
		pointer-events: auto;
	}

	.popover-context {
		font-size: 0.7rem;
		line-height: 1.5;
		color: var(--text-muted);
		margin: 0;
	}

	.popover-projects {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 8px;
	}

	.popover-project-link {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		background: rgba(10, 147, 150, 0.12);
		color: #005f73;
		text-decoration: none;
		white-space: nowrap;
		transition: background var(--duration-fast) var(--ease-out);
	}

	.popover-project-link:hover {
		background: rgba(10, 147, 150, 0.25);
	}
</style>
