/**
 * terminal.ts — Terminal WASM bridge.
 *
 * This module wraps the generic WASM loader with terminal-specific types and
 * provides a drop-in replacement for the JS dispatch function in
 * src/lib/terminal/commands.ts.
 *
 * The JS implementation always stays in place as a fallback:
 *   - While the WASM module is still loading.
 *   - If the WASM module fails to load (network error, unsupported browser, etc.).
 *   - For any command where wasm_dispatch() returns null (unimplemented in C).
 *
 * Usage in a Svelte component:
 *   import { initTerminalWasm, dispatch } from '$lib/wasm/terminal';
 *   onMount(() => { initTerminalWasm(); }); // non-blocking
 *   // ... use dispatch() exactly like the commands.ts version
 */

import { loadWasmModule } from './loader';
import { dispatch as jsDispatch, type CommandResult, type TerminalState } from '$lib/terminal/commands';

/** Shape of the JSON object wasm_dispatch() returns. */
interface WasmResult {
	type: 'output' | 'clear';
	text?: string;
	cwd: string;
}

type WasmDispatchFn = (cmd: string, cwd: string) => string | null;

let wasmDispatch: WasmDispatchFn | null = null;

/**
 * Begin loading the terminal WASM module in the background.
 * Safe to call multiple times; loading only happens once.
 * The terminal works via JS fallback until this resolves.
 */
export async function initTerminalWasm(): Promise<void> {
	try {
		const mod = await loadWasmModule('terminal');
		wasmDispatch = (cmd, cwd) =>
			mod.ccall('wasm_dispatch', 'string', ['string', 'string'], [cmd, cwd]) as string | null;
	} catch (err) {
		console.warn('[wasm/terminal] failed to load, using JS fallback:', err);
	}
}

/**
 * Dispatch a terminal command.
 *
 * Tries the WASM backend first. Falls back to the JS implementation when:
 *   - WASM is not yet loaded
 *   - WASM dispatch returns null (command not implemented in C)
 *   - Any runtime error occurs
 */
export function dispatch(input: string, state: TerminalState): CommandResult {
	if (wasmDispatch) {
		try {
			const raw = wasmDispatch(input.trim(), state.cwd);
			if (raw) {
				const result: WasmResult = JSON.parse(raw);
				const newState: TerminalState = { cwd: result.cwd };
				return result.type === 'clear'
					? { type: 'clear', newState }
					: { type: 'output', text: result.text ?? '', newState };
			}
		} catch (err) {
			console.error('[wasm/terminal] dispatch error, falling back to JS:', err);
		}
	}
	return jsDispatch(input, state);
}

export type { CommandResult, TerminalState };
