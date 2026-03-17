#pragma once

/*
 * wasm_interface.h — Public C API for the matthuesman.com WASM backend.
 *
 * This header is the contract between C and JavaScript. Every function
 * decorated with WASM_EXPORT is callable from JS via Emscripten's ccall/cwrap.
 *
 * To add a new exported function:
 *   1. Declare it here with WASM_EXPORT.
 *   2. Implement it in main.c (or any .c file in src/wasm/).
 *   3. Call it from JS via the typed loader in src/lib/wasm/.
 *
 * Return value convention for string-returning functions:
 *   Return a pointer to a static or heap buffer. The JS side copies the string
 *   immediately after the call via ccall('...', 'string', ...), so no explicit
 *   ownership transfer is needed.
 */

#ifdef __EMSCRIPTEN__
#  include <emscripten.h>
#  define WASM_EXPORT EMSCRIPTEN_KEEPALIVE
#else
#  define WASM_EXPORT
#endif

#ifdef __cplusplus
extern "C" {
#endif

/*
 * wasm_init — Called once by the JS loader after the module is instantiated.
 * Use this for any one-time global setup (allocations, state init, etc.).
 */
WASM_EXPORT void wasm_init(void);

/*
 * wasm_dispatch — Process a terminal command.
 *
 * @param command  Raw command string, e.g. "ls -la"
 * @param cwd      Current working directory, e.g. "/home/matt"
 * @return         JSON-encoded result. Pointer is valid until the next call.
 *
 * Result schemas:
 *   { "type": "output", "text": "...", "cwd": "..." }
 *   { "type": "clear",                "cwd": "..." }
 */
WASM_EXPORT const char* wasm_dispatch(const char* command, const char* cwd);

#ifdef __cplusplus
}
#endif
