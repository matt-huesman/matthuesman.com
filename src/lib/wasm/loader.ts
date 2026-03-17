/**
 * loader.ts — Generic async loader for Emscripten-compiled WASM modules.
 *
 * Usage:
 *   const mod = await loadWasmModule('terminal');
 *   const result = mod.ccall('wasm_dispatch', 'string', ['string', 'string'], [cmd, cwd]);
 *
 * Each module name corresponds to a pair of files in /static/wasm/:
 *   <name>.js   — Emscripten ES6 glue (factory function)
 *   <name>.wasm — WebAssembly binary
 *
 * Modules are cached; repeated calls return the same instance.
 */

import { base } from '$app/paths';

/** Subset of the Emscripten module surface used by this project. */
export interface EmscriptenInstance {
	/** Call an exported C function by name with automatic type marshalling. */
	ccall(
		name: string,
		returnType: 'string' | 'number' | 'boolean' | null,
		argTypes: ('string' | 'number' | 'boolean')[],
		args: unknown[]
	): unknown;

	/** Wrap a C function for repeated calls without per-call overhead. */
	cwrap(
		name: string,
		returnType: 'string' | 'number' | 'boolean' | null,
		argTypes: ('string' | 'number' | 'boolean')[]
	): (...args: unknown[]) => unknown;

	UTF8ToString(ptr: number): string;
	stringToUTF8(str: string, outPtr: number, maxBytes: number): void;
	lengthBytesUTF8(str: string): number;
	_malloc(size: number): number;
	_free(ptr: number): void;
	HEAPU8: Uint8Array;
	HEAP32: Int32Array;
}

const cache = new Map<string, Promise<EmscriptenInstance>>();

/**
 * Load and instantiate a WASM module by name.
 *
 * @param name  Matches the filename stem in /static/wasm/ (e.g. 'terminal').
 */
export function loadWasmModule(name: string): Promise<EmscriptenInstance> {
	if (cache.has(name)) return cache.get(name)!;

	const promise = (async (): Promise<EmscriptenInstance> => {
		const jsUrl = `${base}/wasm/${name}.js`;
		const wasmUrl = `${base}/wasm/${name}.wasm`;

		// Dynamic import of the Emscripten glue script (lives in /static/wasm/,
		// not bundled by Vite — fetched at runtime from the static server).
		const { default: createModule } = await import(/* @vite-ignore */ jsUrl);

		const instance: EmscriptenInstance = await createModule({
			// Tell Emscripten where the companion .wasm file lives.
			locateFile: (filename: string) => (filename.endsWith('.wasm') ? wasmUrl : filename)
		});

		// Call the module's one-time init hook (defined in wasm_interface.h).
		instance.ccall('wasm_init', null, [], []);

		return instance;
	})();

	cache.set(name, promise);
	return promise;
}
