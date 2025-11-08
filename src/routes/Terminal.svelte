<script lang="ts">
	import { onMount } from 'svelte';

	let closeTermBtn: HTMLElement | null;
	let minTermBtn: HTMLElement | null;
	let maxTermBtn: HTMLElement | null;
	let termContainer: HTMLElement | null;
	let termInputContainer: HTMLElement | null;
	let termInput: HTMLInputElement | null;
	let termOutputContainer: HTMLElement | null;

	onMount(() => {
		closeTermBtn = document.getElementById('closeTerminalButton');
		minTermBtn = document.getElementById('minimizeTerminalButton');
		maxTermBtn = document.getElementById('maximizeTerminalButton');
		termContainer = document.getElementById('terminalContainer');
		termInputContainer = document.getElementById('terminalInputContainer');
		termInput = document.getElementById('terminalInput') as HTMLInputElement | null;
		termOutputContainer = document.getElementById('terminalOutputContainer');
	});

	/*
	 * TODO: welcome.mh
	 * - prints welcome message char by char using webassembly
	 * - terminal reads from stdout
	 * - terminal writes to stdin
	 * - terminal supports keyboard interupts for programs by passing through webassembly
	 * - terminal supports history (up/down arrows)
	 * - terminal supports tab completion
	 */

	const tabSize = 4;
	let commandStack = ['', ''];
	let commandStackIndex = 0;

	function getAllOccurrences(str: string, value: string) {
		const indexes: number[] = [];
		let index = str.indexOf(value);
		while (index !== -1) {
			indexes.push(index);
			index = str.indexOf(value, index + 1);
		}
		return indexes;
	}

	function insertString(srcString: string, insertString: string, index: number) {
		return srcString.slice(0, index) + insertString + srcString.slice(index + 1);
	}

	function printTerm(val: string, indent?: boolean) {
		const lines = val.split('\n');
		lines.forEach((line) => {
			let indices = getAllOccurrences(line, '\t');
			indices.forEach((index) => {
				line = insertString(line, ' '.repeat(tabSize - (index % tabSize)), index);
			});
			line = line.replaceAll('<', '&lt');
			line = line.replaceAll('>', '&gt');
			if (indent === true) {
				writeTerm(
					'<span class="pr-3 whitespace-pre text-green-600 select-none">&gt;</span>' + line
				);
			} else {
				writeTerm(line);
			}
		});
	}

	function writeTerm(line: string) {
		const commandOutput = document.createElement('div');
		commandOutput.classList.add('terminal-line');
		commandOutput.innerHTML = `<pre class="text-green-600">${line === '' ? ' ' : line}</pre>`;
		if (termOutputContainer) termOutputContainer.appendChild(commandOutput);
		if (termContainer) termContainer.scrollTop = termContainer.scrollHeight;
	}

	function clearTerminal() {
		if (termOutputContainer) termOutputContainer.innerHTML = '';
	}

	function exitTerminal() {
		clearTerminal();
		commandStack = ['', ''];
		commandStackIndex = 0;
	}

	function sendCommand(command: string) {
		printTerm(command, true);
		switch (command) {
			case '':
				break;
			case 'clear':
				clearTerminal();
				break;
			case 'project':
				printTerm('redirecting...');
				window.location.href = '#';
				break;
			default:
				printTerm(
					`'${command}' is not recognized as a command or program.\nType 'help' for a list.\n`
				);
				break;
		}
		console.log(`Command sent: ${command}`);
	}

	// Svelte inline event handlers
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
				if (commandStack.length > 0) {
					if (commandStackIndex > 0) {
						commandStackIndex--;
						termInput.value = String(commandStack[commandStackIndex]);
					} else {
						termInput.value = String('');
					}
				}
				event.preventDefault();
				break;
			}
			case 'ArrowDown': {
				if (commandStack.length > 0) {
					if (commandStackIndex < commandStack.length - 1) {
						commandStackIndex++;
						termInput.value = String(commandStack[commandStackIndex]);
					} else {
						termInput.value = String('');
					}
				}
				event.preventDefault();
				break;
			}
			default:
				break;
		}
	}

	onMount(() => {
		if (termInput) {
			termInput.addEventListener('keydown', handleInputKeydown);
		}
	});

	let result = $state('');

	onMount(async () => {
		// Load the Emscripten-generated glue code
		const module = await import('../lib/main.js');

		// Wait for it to finish loading and initialize
		const instance = await module.default();

		// Call a function from your C code
		result = instance._example_function(); // Replace with actual C function
		console.log('WASM Result:', result);
	});
</script>

<section class="container mx-auto mt-10 rounded-lg shadow-[0_0_5px_rgba(44,99,161,0.2)]">
	<div class="overflow-hidden rounded-lg bg-gray-200">
		<div class="flex items-center justify-between rounded-lg bg-[#171717] px-4 py-3">
			<div class="flex items-center space-x-3">
				<button
					type="button"
					class="h-3 w-3 cursor-pointer rounded-full bg-red-500 outline-2 outline-[#272727]"
					id="closeTerminalButton"
					aria-label="Close terminal"
					on:click={() => {
						if (termContainer) {
							termContainer.classList.add('terminal-closed');
							termContainer.classList.remove('terminal-minimized', 'terminal-maximized');
						}
						exitTerminal();
					}}
				></button>
				<button
					type="button"
					class="h-3 w-3 cursor-pointer rounded-full bg-yellow-500 outline-2 outline-[#272727]"
					id="closeTerminalButton"
					aria-label="Close terminal"
					on:click={() => {
						if (termContainer) {
							termContainer.classList.add('terminal-minimized');
							termContainer.classList.remove('terminal-maximized', 'terminal-closed');
							if (termOutputContainer) {
								termOutputContainer.style.opacity = '0';
								termOutputContainer.style.maxHeight = '0';
							}
						}
					}}
				></button>
				<button
					type="button"
					class="h-3 w-3 cursor-pointer rounded-full bg-green-600 outline-2 outline-[#272727]"
					id="closeTerminalButton"
					aria-label="Close terminal"
					on:click={() => {
						if (termContainer) {
							termContainer.classList.add('terminal-maximized');
							termContainer.classList.remove('terminal-minimized', 'terminal-closed');
							if (termOutputContainer) {
								termOutputContainer.style.opacity = '1';
								termOutputContainer.style.maxHeight = '24rem';
							}
						}
					}}
				></button>
				<p class="text-neutral pl-2 font-mono text-white leading-none whitespace-pre select-none">Terminal</p>
			</div>
		</div>
		<div
			id="terminalContainer"
			class="terminal-transition terminal-maximized h-96 cursor-text overflow-y-scroll"
			style="scrollbar-width: none; -ms-overflow-style: none;"
			class:terminal-closed={termContainer?.classList.contains('terminal-closed')}
			class:terminal-minimized={termContainer?.classList.contains('terminal-minimized')}
			class:terminal-maximized={termContainer?.classList.contains('terminal-maximized')}
			tabindex="0"
			role="button"
			aria-label="Expand terminal"
			on:click={() => {
				if (termContainer) {
					termContainer.classList.add('terminal-maximized');
					termContainer.classList.remove('terminal-minimized', 'terminal-closed');
				}
				if (termOutputContainer) {
					termOutputContainer.style.opacity = '1';
					termOutputContainer.style.maxHeight = '24rem';
				}
				termInput?.focus();
			}}
			on:keydown={(event) => {
				if (event.key === 'Enter') {
					event.preventDefault();
				}
			}}
		>
			<div class="px-3 py-2">
				<div id="terminalOutputContainer" class="terminal-content-transition"></div>
				<div id="terminalInputContainer" class="text-green flex items-center">
					<span class="pr-3 whitespace-pre text-green-600 select-none">&gt;</span>
					<input
						type="text"
						id="terminalInput"
						class="flex-grow border-none bg-transparent font-mono whitespace-pre text-green-600 outline-none"
						autocomplete="off"
						autofocus
					/>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.terminal-content-transition {
		transition:
			max-height 0.1s ease-out,
			opacity 0.1s ease-out;
	}

	.terminal-transition {
		transition:
			max-height 0.2s ease-out,
			opacity 0.1s ease-out;
		max-height: 24rem;
	}

	.terminal-minimized {
		max-height: 40px; /* adjust as needed for your minimized height */
		opacity: 1;
	}

	.terminal-maximized {
		max-height: 24rem;
		opacity: 1;
	}

	.terminal-closed {
		max-height: 0;
		opacity: 0;
	}
</style>
