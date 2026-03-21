<script lang="ts">
	import { reveal } from '$lib/actions/reveal';

	let activeTab = $state<'reading' | 'listening' | 'watching'>('reading');

	// ── Update these with your actual current favorites ──────────────────
	const content = {
		reading: [
			{ title: 'Into Thin Air',                  sub: 'Jon Krakauer' },
			{ title: 'The Almanack of Naval Ravikant', sub: 'Eric Jorgenson' },
			{ title: 'Atomic Habits',                  sub: 'James Clear' }
		],
		listening: [
			{ title: 'Fleet Foxes',     sub: 'Helplessness Blues' },
			{ title: 'The Lumineers',   sub: 'Brightside' },
			{ title: 'Hozier',          sub: 'Unreal Unearth' }
		],
		watching: [
			{ title: 'Free Solo',        sub: '2018 · Documentary' },
			{ title: 'Planet Earth III', sub: 'BBC · Nature' },
			{ title: 'The Bear',         sub: 'FX · Drama' }
		]
	};

	const tabs: { key: 'reading' | 'listening' | 'watching'; label: string; icon: string }[] = [
		{ key: 'reading',   label: 'Reading',   icon: 'fa-solid fa-book-open' },
		{ key: 'listening', label: 'Listening', icon: 'fa-solid fa-music' },
		{ key: 'watching',  label: 'Watching',  icon: 'fa-solid fa-film' }
	];
</script>

<section id="life" style="background: var(--surface-alt); padding-block: var(--section-y);">
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">

		<div class="grid grid-cols-1 items-center gap-16 md:grid-cols-2">

			<!-- Left: copy -->
			<div class="flex flex-col gap-5" use:reveal>
				<div>
					<p class="eyebrow mb-3">
						<span style="color: var(--text-faint); margin-right: 0.5em;">02</span>
						Beyond the Terminal
					</p>
					<h2 class="section-title relative">
						Life Outside<br />the Code
						<span
							class="absolute -bottom-3 left-0 h-0.5 rounded-full"
							style="width: 2.5rem; background: var(--accent);"
						></span>
					</h2>
				</div>

				<p class="body-lead mt-6">
					Engineering is what I do — not all I am.
				</p>

				<p class="body-text">
					I grew up building robots in a garage and earning an Eagle Scout badge on a mountain.
					I run trails, read obsessively, and believe the clearest thinking happens
					somewhere between a summit and a campfire.
				</p>

				<p class="body-text">
					I'm wired to collaborate. I've led robotics teams, a fraternity chapter,
					and cross-functional engineering efforts — and I've learned that the best ideas
					almost always come from a room full of people who actually listen to each other.
				</p>

				<!-- Personality tags -->
				<div class="flex flex-wrap gap-2 mt-1">
					{#each [
						{ icon: 'fa-solid fa-mountain', text: 'Trail Runner' },
						{ icon: 'fa-solid fa-campground', text: 'Backpacker' },
						{ icon: 'fa-solid fa-people-group', text: 'Collaborator' },
						{ icon: 'fa-solid fa-award', text: 'Eagle Scout' }
					] as tag}
						<span
							class="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
							style="background: var(--surface); border: 1px solid var(--border); color: var(--text-muted);"
						>
							<i class="{tag.icon} text-[0.6rem]" style="color: var(--accent-text);"></i>
							{tag.text}
						</span>
					{/each}
				</div>
			</div>

			<!-- Right: macOS floating window -->
			<div use:reveal={{ delay: 120 }}>
				<div class="mac-window">

					<!-- Title bar -->
					<div class="mac-titlebar">
						<div class="traffic-lights">
							<span class="dot" style="background: #ff5f57;"></span>
							<span class="dot" style="background: #febc2e;"></span>
							<span class="dot" style="background: #28c840;"></span>
						</div>
						<span class="mac-title">life.txt — matt</span>
					</div>

					<!-- Tab bar -->
					<div class="mac-tabs">
						{#each tabs as tab}
							<button
								type="button"
								class="mac-tab"
								class:mac-tab--active={activeTab === tab.key}
								onclick={() => (activeTab = tab.key)}
							>
								<i class="{tab.icon} mr-1.5 text-[0.7rem]"></i>
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- Content -->
					<div class="mac-body">
						{#each content[activeTab] as item, i}
							<div
								class="mac-list-item"
								style="animation-delay: {i * 60}ms;"
							>
								<div class="mac-item-dot"></div>
								<div>
									<p class="mac-item-title">{item.title}</p>
									<p class="mac-item-sub">{item.sub}</p>
								</div>
							</div>
						{/each}
					</div>

				</div>
			</div>

		</div>
	</div>
</section>

<style>
	/* ── Window chrome ───────────────────────────────────────────────────── */
	.mac-window {
		border-radius: 0.75rem;
		overflow: hidden;
		border: 1px solid rgba(0, 0, 0, 0.10);
		box-shadow:
			0 0 0 0.5px rgba(0,0,0,0.06),
			0 24px 64px rgba(0,0,0,0.12),
			0 8px 24px rgba(0,0,0,0.06);
		background: var(--surface);
	}

	.mac-titlebar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(0,0,0,0.03);
		border-bottom: 1px solid var(--border);
	}

	.traffic-lights {
		display: flex;
		gap: 0.375rem;
		align-items: center;
	}

	.dot {
		display: block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		opacity: 0.9;
	}

	.mac-title {
		flex: 1;
		text-align: center;
		font-family: 'Menlo', 'Monaco', monospace;
		font-size: 0.7rem;
		color: var(--text-faint);
		letter-spacing: 0.02em;
		margin-right: 4.5rem; /* visually center past the traffic lights */
	}

	/* ── Tabs ────────────────────────────────────────────────────────────── */
	.mac-tabs {
		display: flex;
		border-bottom: 1px solid var(--border);
		background: rgba(0,0,0,0.02);
	}

	.mac-tab {
		flex: 1;
		padding: 0.625rem 0.5rem;
		font-size: 0.7rem;
		font-family: 'Menlo', 'Monaco', monospace;
		color: var(--text-faint);
		border: none;
		background: none;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
	}

	.mac-tab:hover {
		color: var(--text-muted);
		background: rgba(0,0,0,0.03);
	}

	.mac-tab--active {
		color: var(--accent-text) !important;
		border-bottom-color: var(--accent) !important;
		background: rgba(78, 205, 196, 0.04) !important;
	}

	/* ── Body ────────────────────────────────────────────────────────────── */
	.mac-body {
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-height: 11rem;
	}

	.mac-list-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.625rem 0.5rem;
		border-radius: 0.375rem;
		transition: background 0.15s;
		animation: fadeIn 0.25s ease both;
	}

	.mac-list-item:hover {
		background: rgba(0,0,0,0.03);
	}

	.mac-item-dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 50%;
		background: var(--accent);
		margin-top: 0.35rem;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.mac-item-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text);
		line-height: 1.3;
	}

	.mac-item-sub {
		font-family: 'Menlo', 'Monaco', monospace;
		font-size: 0.65rem;
		color: var(--text-faint);
		margin-top: 0.1rem;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(4px); }
		to   { opacity: 1; transform: translateY(0); }
	}
</style>
