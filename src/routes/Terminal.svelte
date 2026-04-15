<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { initTerminalWasm, dispatch } from '$lib/wasm/terminal';
	import type { TerminalState } from '$lib/wasm/terminal';
	import Window from '$lib/components/Window.svelte';

	// ── DOM refs ───────────────────────────────────────────────────────────────
	let sectionEl: HTMLElement = $state() as HTMLElement;
	let termContainer: HTMLElement | null = $state(null);
	let termInput: HTMLInputElement | null = $state(null);

	// ── Terminal output ────────────────────────────────────────────────────────
	type TermLine = { id: number; html: string };
	let lines = $state<TermLine[]>([]);
	let lineId = 0;

	// ── Terminal state ─────────────────────────────────────────────────────────
	let termState = $state<TerminalState>({ cwd: '/home/matt' });
	let commandStack: string[] = [''];
	let commandStackIndex = 0;

	const promptCwd = $derived(
		termState.cwd === '/home/matt' ? '~' : termState.cwd.replace('/home/matt', '~')
	);

	const windowTitle = $derived(
		`matt@portfolio:${promptCwd}`
	);

	// ── Widget mode ────────────────────────────────────────────────────────────
	type Mode = 'docked' | 'sticky-mini' | 'sticky-expanded';
	let mode = $state<Mode>('sticky-mini');

	// Prevents the IntersectionObserver from re-docking after user explicitly
	// dismisses. Cleared once the section fully exits the viewport.
	let userDismissed = false;

	// ── Core terminal logic ────────────────────────────────────────────────────
	const tabSize = 4;

	function getAllOccurrences(str: string, value: string): number[] {
		const indexes: number[] = [];
		let i = str.indexOf(value);
		while (i !== -1) { indexes.push(i); i = str.indexOf(value, i + 1); }
		return indexes;
	}

	function insertString(src: string, ins: string, index: number): string {
		return src.slice(0, index) + ins + src.slice(index + 1);
	}

	function printTerm(val: string, indent = false) {
		val.split('\n').forEach((rawLine) => {
			let line = rawLine;
			getAllOccurrences(line, '\t').forEach((i) => {
				line = insertString(line, ' '.repeat(tabSize - (i % tabSize)), i);
			});
			line = line.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
			const html = indent
				? `<pre class="term-text"><span class="term-prompt-indicator">❯</span> ${line}</pre>`
				: `<pre class="term-text term-output">${line === '' ? ' ' : line}</pre>`;
			lines.push({ id: lineId++, html });
		});
	}

	function clearTerminal() { lines = []; }

	async function sendCommand(command: string) {
		printTerm(command, true);
		const result = dispatch(command, termState);
		if (result.type === 'clear') clearTerminal();
		else if (result.text) printTerm(result.text);
		termState = result.newState;
		await tick();
		if (termContainer) termContainer.scrollTop = termContainer.scrollHeight;
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (!termInput) return;
		switch (event.key) {
			case 'Enter': {
				const cmd = termInput.value.trim();
				if (cmd && commandStack[commandStack.length - 2] !== cmd) {
					commandStack.pop();
					commandStack.push(cmd);
					commandStack.push('');
				}
				commandStackIndex = commandStack.length - 1;
				sendCommand(cmd);
				termInput.value = '';
				break;
			}
			case 'ArrowUp':
				if (commandStackIndex > 0) termInput.value = commandStack[--commandStackIndex];
				event.preventDefault();
				break;
			case 'ArrowDown':
				if (commandStackIndex < commandStack.length - 1)
					termInput.value = commandStack[++commandStackIndex];
				event.preventDefault();
				break;
			case 'Tab':
				event.preventDefault();
				break;
		}
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && mode === 'sticky-expanded') {
			userDismissed = true;
			mode = 'sticky-mini';
		}
	}

	function handleClose() {
		clearTerminal();
		userDismissed = true;
		mode = 'sticky-mini';
	}
	function handleMinimize() {
		userDismissed = true;
		mode = 'sticky-mini';
	}
	function handleExpand() { mode = 'sticky-expanded'; }

	$effect(() => {
		if (mode === 'docked' || mode === 'sticky-expanded') {
			tick().then(() => {
				if (termContainer) termContainer.scrollTop = termContainer.scrollHeight;
				if (mode === 'sticky-expanded') termInput?.focus();
			});
		}
	});

	// ── Lifecycle ──────────────────────────────────────────────────────────────
	const WELCOME = [
		"Welcome to matt's portfolio terminal.",
		"Type 'help' for available commands.",
		'─'.repeat(40)
	];

	onMount(() => {
		initTerminalWasm();
		WELCOME.forEach((line, i) => setTimeout(() => printTerm(line), i * 60));

		// Hysteresis: dock at ≥25% visible, undock only at <5%.
		// This locks the terminal in sticky once scrolled past the section.
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.intersectionRatio >= 0.25) {
					if (!userDismissed) mode = 'docked';
				} else if (entry.intersectionRatio < 0.05) {
					userDismissed = false;
					if (mode === 'docked') mode = 'sticky-mini';
				}
			},
			{ threshold: [0, 0.05, 0.25, 1] }
		);
		observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<!-- ── Body snippet — shared between docked and expanded ──────────────────── -->
{#snippet termBody()}
	<div
		bind:this={termContainer}
		class="term-body cursor-text overflow-y-auto"
		style="scrollbar-width: none;"
		tabindex="0"
		role="button"
		aria-label="Click to focus terminal"
		onclick={() => termInput?.focus()}
		onkeydown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
	>
		<div class="p-5">
			{#each lines as line (line.id)}
				<div class="terminal-line">{@html line.html}</div>
			{/each}
			<div class="flex items-center gap-2 mt-1">
				<span class="shrink-0 font-mono text-sm">
					<span style="color: #a78bfa;">matt@portfolio</span><span style="color: #4b5563;">:</span><span style="color: var(--accent-text);">{promptCwd}</span><span style="color: #f5f5f7;">$</span>
				</span>
				<input
					bind:this={termInput}
					type="text"
					class="flex-1 border-none bg-transparent font-mono text-sm text-green-300 outline-none caret-cyan-400"
					autocomplete="off"
					spellcheck="false"
					onkeydown={handleInputKeydown}
				/>
			</div>
		</div>
	</div>
{/snippet}

<!-- ── Section (always in DOM) ───────────────────────────────────────────── -->
<section bind:this={sectionEl} id="terminal" class="term-strip" style="padding-block: var(--section-y);">
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">

		<div class="mb-12">
			<p class="font-mono text-[0.65rem] tracking-[0.18em] uppercase mb-3" style="color: var(--accent-text);">
				Interactive
			</p>
			<h2 class="text-[clamp(2rem,4vw,3rem)] font-bold leading-tight mb-3" style="color: #f5f5f7;">
				Try the Terminal
			</h2>
			<p class="text-sm" style="color: #6e6e73; max-width: 46rem;">
				A real shell running in your browser. Try:
				<code class="font-mono" style="color: var(--accent-text);">ls</code>,
				<code class="font-mono" style="color: var(--accent-text);">cat resume.txt</code>,
				<code class="font-mono" style="color: var(--accent-text);">cd projects/</code>,
				<code class="font-mono" style="color: var(--accent-text);">help</code>
			</p>
		</div>

		<!-- Docked terminal — no transition to avoid height-swap scroll glitch -->
		{#if mode === 'docked'}
			<Window
				title={windowTitle}
				variant="dark"
				onclose={handleClose}
				onminimize={handleMinimize}
				onexpand={handleExpand}
			>
				{@render termBody()}
			</Window>
		{:else}
			<!-- Placeholder holds section height while terminal is sticky -->
			<div class="term-placeholder" aria-hidden="true">
				<i class="fa-solid fa-terminal" style="color: var(--term-muted);"></i>
				<span class="placeholder-label">terminal pinned to corner</span>
			</div>
		{/if}

	</div>
</section>

<!-- ── Sticky mini widget ─────────────────────────────────────────────────── -->
{#if mode === 'sticky-mini'}
	<div
		class="term-mini-widget"
		transition:fly={{ y: 20, duration: 220 }}
		title="Click to open terminal"
	>
		<div
			class="term-mini-bar"
			role="button"
			tabindex="0"
			aria-label="Open terminal"
			onclick={() => (mode = 'sticky-expanded')}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') mode = 'sticky-expanded'; }}
		>
			<div class="flex gap-1.5 shrink-0" role="presentation">
				<button
					type="button"
					class="mini-dot"
					style="background: #ff5f57;"
					aria-label="Clear terminal"
					onclick={(e) => { e.stopPropagation(); clearTerminal(); }}
				></button>
				<!-- Yellow is inert in mini mode — already minimized -->
				<div class="mini-dot" style="background: #febc2e; cursor: default;"></div>
				<button
					type="button"
					class="mini-dot"
					style="background: #28c840;"
					aria-label="Expand terminal"
					onclick={(e) => { e.stopPropagation(); mode = 'sticky-expanded'; }}
				></button>
			</div>

			<span class="font-mono text-xs truncate min-w-0" style="color: #9ca3af;">
				{windowTitle}
			</span>

			<i class="fa-solid fa-chevron-up ml-auto shrink-0 text-[0.5rem]" style="color: var(--term-muted);"></i>
		</div>
	</div>
{/if}

<!-- ── Sticky expanded overlay ────────────────────────────────────────────── -->
<!-- Single {#if} owns both backdrop and window so they always enter/exit
     as one unit — eliminates the frame-gap flash between separate transitions. -->
{#if mode === 'sticky-expanded'}
	<div class="term-overlay"> <!-- transition:fly={{ y: 12, duration: 220 }} -->
		<!-- Backdrop click closes -->
		<div
			class="term-backdrop"
			role="button"
			tabindex="-1"
			aria-label="Close terminal"
			transition:fade={{ duration: 240 }}
			onclick={() => { userDismissed = true; mode = 'sticky-mini'; }}
			onkeydown={(e) => { if (e.key === 'Enter') { userDismissed = true; mode = 'sticky-mini'; } }}
		></div>

		<div class="term-expanded-shell">
			<div class="term-expanded-window" transition:scale={{ start: 0.96, duration: 240, opacity: 0 }}>
				<Window
					title={windowTitle}
					variant="dark"
					onclose={handleClose}
					onminimize={handleMinimize}
				>
					{@render termBody()}
				</Window>
			</div>
		</div>
	</div>
{/if}

<style>
	.term-strip {
		background: var(--term-bg);
		color: var(--term-text);
	}

	/* ── Terminal body ────────────────────────────────────────────────────────── */
	.term-body {
		background: #1c2436;
		height: 22rem;
	}

	@media (min-width: 768px) {
		.term-body { height: 32rem; }
	}

	/* ── Section placeholder ─────────────────────────────────────────────────── */
	.term-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
		border-radius: 0.75rem;
		border: 1px dashed rgba(78, 205, 196, 0.15);
		/* Matches Window titlebar (~44px) + term-body height */
		height: calc(44px + 22rem);
	}

	@media (min-width: 768px) {
		.term-placeholder { height: calc(44px + 32rem); }
	}

	.placeholder-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		color: var(--term-muted);
	}

	/* ── Mini widget ─────────────────────────────────────────────────────────── */
	.term-mini-widget {
		position: fixed;
		bottom: 0;
		right: max(var(--gutter), calc(var(--gutter) + (100vw - var(--container)) / 2));
		width: 260px;
		border-radius: 0.75rem 0.75rem 0 0;
		overflow: hidden;
		/* border: 1px solid rgba(78, 205, 196, 0.15); */
		border-bottom: none;
		/* box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.6), 0 -1px 6px rgba(0, 0, 0, 0.4); */
		z-index: 40;
		cursor: pointer;
	}

	.term-mini-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #0d1117;
		padding: 10px 14px;
	}

	.mini-dot {
		display: block;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 9999px;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
		transition: opacity 120ms ease;
	}

	.mini-dot:hover { opacity: 0.75; }

	/* ── Overlay (backdrop + window, single transition root) ─────────────────── */
	.term-overlay {
		position: fixed;
		inset: 0;
		z-index: 48;
		/* No pointer-events on the root — children handle individually */
	}

	.term-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(3px);
		-webkit-backdrop-filter: blur(3px);
		cursor: pointer;
		pointer-events: auto;
	}

	.term-expanded-shell {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 1.5rem;
		pointer-events: none;
	}

	.term-expanded-window {
		width: min(860px, 100%);
		pointer-events: auto;
	}

	/* ── Terminal text globals ────────────────────────────────────────────────── */
	:global(.term-text) {
		font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
		color: #86efac;
		margin: 0;
	}

	:global(.term-output) { color: #d1d5db; }
	:global(.term-prompt-indicator) { color: #34d399; }
</style>
