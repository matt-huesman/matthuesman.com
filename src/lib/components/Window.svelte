<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title = '',
		variant = 'light',
		minimized = false,
		onclose,
		onminimize,
		onexpand,
		children,
		tabs
	}: {
		title?: string;
		/** 'light' — macOS-style card (Life section)
		 *  'dark'  — terminal chrome (Terminal section) */
		variant?: 'light' | 'dark';
		/** External minimized state; parent controls via onminimize */
		minimized?: boolean;
		onclose?: () => void;
		onminimize?: () => void;
		/** If undefined the green dot renders at reduced opacity */
		onexpand?: () => void;
		children?: Snippet;
		/** Named snippet rendered between titlebar and body (e.g. tab bar) */
		tabs?: Snippet;
	} = $props();
</script>

<div class="window window--{variant}">

	<!-- Title bar -->
	<div class="window-titlebar">
		<div class="traffic-lights">
			<button
				type="button"
				class="traffic-dot"
				style="background: #ff5f57;"
				aria-label="Close"
				onclick={onclose}
			></button>
			<button
				type="button"
				class="traffic-dot"
				style="background: #febc2e;"
				aria-label={minimized ? 'Restore' : 'Minimize'}
				onclick={onminimize}
			></button>
			<button
				type="button"
				class="traffic-dot"
				class:traffic-dot--dim={!onexpand}
				style="background: #28c840;"
				aria-label="Expand"
				onclick={onexpand}
				disabled={!onexpand}
			></button>
		</div>

		<span class="window-title" class:window-title--center={variant === 'light'}>
			{title}
		</span>
	</div>

	<!-- Optional tab bar (hidden when minimized) -->
	{#if tabs && !minimized}
		{@render tabs()}
	{/if}

	<!-- Body (hidden when minimized) -->
	{#if !minimized && children}
		{@render children()}
	{/if}

</div>

<style>
	/* ── Base chrome ──────────────────────────────────────────────────────── */
	.window {
		border-radius: 0.75rem;
		overflow: hidden;
	}

	/* ── Light variant (Life section) ─────────────────────────────────────── */
	.window--light {
		background: var(--surface);
		border: 1px solid rgba(0, 0, 0, 0.10);
		box-shadow:
			0 0 0 0.5px rgba(0, 0, 0, 0.06),
			0 24px 64px rgba(0, 0, 0, 0.10),
			0 8px 24px rgba(0, 0, 0, 0.06);
	}

	.window--light .window-titlebar {
		background: rgba(0, 0, 0, 0.03);
		border-bottom: 1px solid var(--border);
	}

	/* ── Dark variant (Terminal) ──────────────────────────────────────────── */
	.window--dark {
		/* border: 1px solid rgba(78, 205, 196, 0.12); */
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.75), 0 2px 8px rgba(0, 0, 0, 0.5);
	}

	.window--dark .window-titlebar {
		background: #001219;
		border-bottom: 1px solid rgba(10, 147, 150, 0.15);
	}

	/* ── Title bar layout ─────────────────────────────────────────────────── */
	.window-titlebar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
	}

	.traffic-lights {
		display: flex;
		gap: 0.375rem;
		align-items: center;
		flex-shrink: 0;
	}

	.traffic-dot {
		display: block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 9999px;
		border: none;
		cursor: pointer;
		transition: opacity 120ms ease;
		flex-shrink: 0;
	}

	.traffic-dot:hover {
		opacity: 0.75;
	}

	.traffic-dot--dim {
		opacity: 0.35;
		cursor: default;
	}

	/* Window title */
	.window-title {
		font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.02em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.window--light .window-title {
		color: var(--text-faint);
		/* Visually center the title between traffic lights and right edge */
		flex: 1;
		text-align: center;
		margin-right: 4.5rem;
	}

	.window--dark .window-title {
		color: #9ca3af; /* gray-400 */
		margin-left: 0.5rem;
	}
</style>
