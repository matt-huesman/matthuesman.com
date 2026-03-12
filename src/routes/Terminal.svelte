<script lang="ts">
	import { onMount } from 'svelte';
	import { dispatch } from '$lib/terminal/commands';
	import type { TerminalState } from '$lib/terminal/commands';

	// DOM bindings — must use $state() for bind:this to work in Svelte 5
	let termContainer: HTMLElement = $state() as HTMLElement;
	let termInput: HTMLInputElement = $state() as HTMLInputElement;
	let termOutputContainer: HTMLElement = $state() as HTMLElement;

	// Terminal state
	let termState = $state<TerminalState>({ cwd: '/home/matt' });
	let commandStack: string[] = [''];
	let commandStackIndex = 0;
	let closed = $state(false);
	let minimized = $state(false);

	// Derived prompt display
	const promptCwd = $derived(
		termState.cwd === '/home/matt' ? '~' : termState.cwd.replace('/home/matt', '~')
	);

	const WELCOME = [
		'Welcome to matt\'s portfolio terminal.',
		'Type \'help\' for available commands.',
		'─'.repeat(40)
	];

	const tabSize = 4;

	function getAllOccurrences(str: string, value: string): number[] {
		const indexes: number[] = [];
		let index = str.indexOf(value);
		while (index !== -1) {
			indexes.push(index);
			index = str.indexOf(value, index + 1);
		}
		return indexes;
	}

	function insertString(src: string, ins: string, index: number): string {
		return src.slice(0, index) + ins + src.slice(index + 1);
	}

	function printTerm(val: string, indent = false) {
		const lines = val.split('\n');
		lines.forEach((line) => {
			// Tab expansion
			let indices = getAllOccurrences(line, '\t');
			indices.forEach((i) => {
				line = insertString(line, ' '.repeat(tabSize - (i % tabSize)), i);
			});
			// HTML escape
			line = line.replaceAll('<', '&lt;').replaceAll('>', '&gt;');

			const el = document.createElement('div');
			el.classList.add('terminal-line');
			if (indent) {
				el.innerHTML = `<pre class="term-text"><span class="term-prompt-indicator">❯</span> ${line}</pre>`;
			} else {
				el.innerHTML = `<pre class="term-text term-output">${line === '' ? ' ' : line}</pre>`;
			}
			termOutputContainer?.appendChild(el);
		});
		if (termContainer) termContainer.scrollTop = termContainer.scrollHeight;
	}

	function clearTerminal() {
		if (termOutputContainer) termOutputContainer.innerHTML = '';
	}

	function sendCommand(command: string) {
		printTerm(command, true);

		const result = dispatch(command, termState);

		if (result.type === 'clear') {
			clearTerminal();
		} else if (result.text) {
			printTerm(result.text);
		}

		termState = result.newState;

		// TODO: Replace dispatch() with WASM instance call once C backend is ready:
		// const wasmResult = instance._process_command(command, termState.cwd);
		// handleWasmResult(wasmResult);
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (!termInput) return;

		switch (event.key) {
			case 'Enter': {
				const command = termInput.value.trim();
				if (command !== '' && commandStack[commandStack.length - 2] !== command) {
					commandStack.pop();
					commandStack.push(command);
					commandStack.push('');
				}
				commandStackIndex = commandStack.length - 1;
				sendCommand(command);
				termInput.value = '';
				break;
			}
			case 'ArrowUp': {
				if (commandStackIndex > 0) {
					commandStackIndex--;
					termInput.value = commandStack[commandStackIndex];
				}
				event.preventDefault();
				break;
			}
			case 'ArrowDown': {
				if (commandStackIndex < commandStack.length - 1) {
					commandStackIndex++;
					termInput.value = commandStack[commandStackIndex];
				}
				event.preventDefault();
				break;
			}
			case 'Tab': {
				event.preventDefault();
				// Tab completion: match partial input against cwd contents
				const partial = termInput.value.split(' ').pop() ?? '';
				if (!partial) break;
				const { getNode, resolvePath } = (() => {
					// dynamic import not available here; use inline logic
					return { getNode: null, resolvePath: null };
				})();
				// Tab completion is a stub — full impl when WASM backend lands
				break;
			}
		}
	}

	onMount(() => {
		termInput.addEventListener('keydown', handleInputKeydown);

		// Print welcome message with typewriter stagger
		WELCOME.forEach((line, i) => {
			setTimeout(() => printTerm(line), i * 60);
		});
	});
</script>

<!-- Gradient fade: light → dark -->
<!-- <div class="term-fade-in" aria-hidden="true"></div> -->

<!-- Full-width dark terminal strip -->
<section id="terminal" class="term-strip" style="padding-block: var(--section-y);">
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">

		<!-- Section header (dark variant) -->
		<div class="mb-10">
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

		<!-- Terminal window -->
		{#if !closed}
			<div class="terminal-window">
				<!-- Title bar -->
				<div class="term-titlebar flex items-center gap-3 rounded-t-xl px-4 py-3">
					<!-- Traffic lights -->
					<button
						type="button"
						class="h-3 w-3 rounded-full bg-red-500 transition-opacity hover:opacity-80 cursor-pointer"
						aria-label="Close terminal"
						onclick={() => { closed = true; clearTerminal(); }}
					></button>
					<button
						type="button"
						class="h-3 w-3 rounded-full bg-yellow-400 transition-opacity hover:opacity-80 cursor-pointer"
						aria-label="Minimize terminal"
						onclick={() => (minimized = !minimized)}
					></button>
					<button
						type="button"
						class="h-3 w-3 rounded-full bg-green-500 transition-opacity hover:opacity-80 cursor-pointer"
						aria-label="Maximize terminal"
						onclick={() => (minimized = false)}
					></button>

					<!-- Title -->
					<span class="ml-3 font-mono text-sm text-gray-400">
						matt@portfolio:<span style="color: var(--accent-text);">{promptCwd}</span>
					</span>
				</div>

				<!-- Body -->
				{#if !minimized}
					<div
						bind:this={termContainer}
						class="term-body h-80 cursor-text overflow-y-auto md:h-96"
						style="scrollbar-width: none;"
						tabindex="0"
						role="button"
						aria-label="Click to focus terminal"
						onclick={() => termInput?.focus()}
						onkeydown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
					>
						<div class="p-4">
							<div bind:this={termOutputContainer}></div>
							<!-- Input row -->
							<div class="flex items-center gap-2">
								<span class="shrink-0 font-mono text-sm">
									<span style="color: #a78bfa;">matt@portfolio</span><span style="color: #374151;">:</span><span style="color: var(--accent-text);">{promptCwd}</span><span style="color: #f5f5f7;">$</span>
								</span>
								<input
									bind:this={termInput}
									type="text"
									class="flex-1 border-none bg-transparent font-mono text-sm text-green-300 outline-none caret-cyan-400"
									autocomplete="off"
									spellcheck="false"
									autofocus
								/>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Reopen button -->
			<button
				type="button"
				class="flex items-center gap-2 rounded-lg px-5 py-3 font-mono text-sm transition-all"
				style="background: var(--term-surface); border: 1px solid var(--term-border); color: #6e6e73;"
				onmouseenter={(e) => (e.currentTarget.style.color = 'var(--accent-text)')}
				onmouseleave={(e) => (e.currentTarget.style.color = '#6e6e73')}
				onclick={() => { closed = false; minimized = false; }}
			>
				<i class="fa-solid fa-terminal"></i>
				Reopen Terminal
			</button>
		{/if}
	</div>
</section>

<!-- Gradient fade: dark → light -->
<!-- <div class="term-fade-out" aria-hidden="true"></div> -->

<style>
	.terminal-window {
		border-radius: 0.75rem;
		overflow: hidden;
		border: 1px solid rgba(78, 205, 196, 0.12);
		box-shadow: 0 0 0 1px rgba(78,205,196,0.06), 0 32px 80px rgba(0,0,0,0.5);
	}

	.term-titlebar {
		background: #0d1117;
		border-bottom: 1px solid rgba(78, 205, 196, 0.08);
	}

	.term-body {
		background: #070d1a;
	}

	:global(.term-text) {
		font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
		font-size: 0.8125rem;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
		color: #86efac; /* green-300 */
		margin: 0;
	}

	:global(.term-output) {
		color: #d1d5db; /* gray-300 */
	}

	:global(.term-prompt-indicator) {
		color: #34d399; /* emerald-400 */
	}
</style>
