<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { content as lifeContent, tabs as lifeTabs } from '$lib/data/life';
	import Window from '$lib/components/Window.svelte';

	let activeTab = $state<'reading' | 'listening' | 'watching'>('reading');
	let windowMinimized = $state(false);
	let windowClosed = $state(false);
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
					Engineering is what I do - <i>not all I am.</i>
				</p>

				<p class="body-text">
					I started building robots in a highschool storage closet and have climbed the peaks of a mountains.
					I run trails, read sci-fi, and believe the clearest thinking happens
					somewhere between a summit and a campfire.
				</p>

				<p class="body-text">
					I'm wired to collaborate. I've led robotics teams, a fraternity chapter,
					and cross-functional engineering efforts, and I've learned that the best ideas
					almost always come from a diverse room full of people who are willing to listen.
				</p>

				<!-- Personality tags -->
				<div class="flex flex-wrap gap-2 mt-1">
					{#each [
						{ icon: 'fa-solid fa-running', text: 'Runner' },
						{ icon: 'fa-solid fa-campground', text: 'Backpacker' },
						{ icon: 'fa-solid fa-people-group', text: 'Collaborator' },
						{ icon: 'fa-solid fa-book-open', text: 'Sci-fi Reader' },
						{ icon: 'fa-solid fa-users', text: 'Team Leader' },
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

			<!-- Right: window -->
			<div use:reveal={{ delay: 120 }}>
				{#if !windowClosed}
					<Window
						title="life.txt — matt"
						variant="light"
						minimized={windowMinimized}
						onclose={() => (windowClosed = true)}
						onminimize={() => (windowMinimized = !windowMinimized)}
					>
						{#snippet tabs()}
							<div class="life-tabs">
								{#each lifeTabs as tab}
									<button
										type="button"
										class="life-tab"
										class:life-tab--active={activeTab === tab.key}
										onclick={() => (activeTab = tab.key)}
									>
										<i class="{tab.icon} mr-1.5 text-[0.7rem]"></i>
										{tab.label}
									</button>
								{/each}
							</div>
						{/snippet}

						<div class="life-body">
							{#each lifeContent[activeTab] as item, i}
								<div class="life-item" style="animation-delay: {i * 60}ms;">
									<div class="life-item-dot"></div>
									<div>
										<p class="life-item-title">{item.title}</p>
										<p class="life-item-sub">{item.sub}</p>
									</div>
								</div>
							{/each}
							{#if lifeContent[activeTab] === lifeContent['listening']}
								<a href="https://www.cassettosocial.com" target="_blank" rel="noopener noreferrer" class="life-item life-item--link" style="animation-delay: {lifeContent[activeTab].length * 60}ms;">
									<p class="life-item-link-text">
										Check me out on <span class="font-bold">Cassetto</span>!
									</p>
									<i class="fa-solid fa-arrow-up-right-from-square life-item-link-icon" aria-hidden="true"></i>
								</a>
							{/if}
						</div>
					</Window>
				{:else}
					<!-- Reopen chip maintains grid column presence -->
					<button
						type="button"
						class="life-reopen"
						onclick={() => { windowClosed = false; windowMinimized = false; }}
					>
						<i class="fa-solid fa-window-restore text-[0.7rem]"></i>
						Reopen life.txt
					</button>
				{/if}
			</div>

		</div>
	</div>
</section>

<style>
	/* ── Tab bar ─────────────────────────────────────────────────────────── */
	.life-tabs {
		display: flex;
		border-bottom: 1px solid var(--border);
		background: rgba(0, 0, 0, 0.02);
	}

	.life-tab {
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

	.life-tab:hover {
		color: var(--text-muted);
		background: rgba(0, 0, 0, 0.03);
	}

	.life-tab--active {
		color: var(--accent-text) !important;
		border-bottom-color: var(--accent) !important;
		background: rgba(78, 205, 196, 0.04) !important;
	}

	/* ── Body ────────────────────────────────────────────────────────────── */
	.life-body {
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-height: 11rem;
	}

	.life-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.625rem 0.5rem;
		border-radius: 0.375rem;
		transition: background 0.15s;
		animation: fadeIn 0.25s ease both;
	}

	.life-item:hover {
		background: rgba(0, 0, 0, 0.03);
	}

	.life-item--link {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.625rem 0.625rem;
		background: rgba(0, 0, 0, 0.04);
	}

	.life-item--link:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.life-item-link-text {
		font-size: 0.875rem;
		color: var(--text);
		line-height: 1.4;
	}

	.life-item-link-text a {
		color: var(--text);
		text-decoration: underline;
		text-underline-offset: 0.15em;
		font-weight: 500;
	}

	.life-item-link-icon {
		margin-left: 0.35rem;
		font-size: 0.7rem;
		color: var(--text-faint);
	}

	.life-item-dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 50%;
		background: var(--accent);
		margin-top: 0.35rem;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.life-item-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text);
		line-height: 1.3;
	}

	.life-item-sub {
		font-family: 'Menlo', 'Monaco', monospace;
		font-size: 0.65rem;
		color: var(--text-faint);
		margin-top: 0.1rem;
	}

	/* ── Reopen chip ─────────────────────────────────────────────────────── */
	.life-reopen {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: var(--surface);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-faint);
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out),
		            border-color var(--duration-fast) var(--ease-out);
	}

	.life-reopen:hover {
		color: var(--accent-text);
		border-color: var(--accent-teal);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(4px); }
		to   { opacity: 1; transform: translateY(0); }
	}
</style>
