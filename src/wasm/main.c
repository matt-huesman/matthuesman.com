#include "wasm_interface.h"

#include <stdio.h>
#include <string.h>

/*
 * main.c — WASM backend stub.
 *
 * Implement wasm_init() and wasm_dispatch() here. The JS terminal bridge
 * (src/lib/wasm/terminal.ts) calls wasm_dispatch() for every command and
 * parses the returned JSON. While this stub is active, unrecognised commands
 * fall through to the TypeScript fallback implementation automatically.
 *
 * Result JSON schemas (see wasm_interface.h):
 *   { "type": "output", "text": "...", "cwd": "..." }
 *   { "type": "clear",                "cwd": "..." }
 */

/* Static result buffer. Increase size if large output is needed. */
static char result_buf[8192];

void wasm_init(void)
{
    /* One-time setup — initialise any global state here. */
}

const char *wasm_dispatch(const char *command, const char *cwd)
{
    /*
     * TODO: implement command dispatch.
     *
     * Parse `command` and write the appropriate JSON result into result_buf.
     * Return NULL (or an empty string) to let the JS fallback handle the command.
     *
     * Example skeleton:
     *
     *   if (strcmp(command, "mycommand") == 0) {
     *       snprintf(result_buf, sizeof(result_buf),
     *           "{\"type\":\"output\",\"text\":\"hello from C\",\"cwd\":\"%s\"}", cwd);
     *       return result_buf;
     *   }
     *   return NULL;  // JS fallback handles it
     */

        if (strcmp(command, "echo hello") == 0)
    {
        snprintf(result_buf, sizeof(result_buf),
                 "{\"type\":\"output\",\"text\":\"hello from C\",\"cwd\":\"%s\"}", cwd);
        return result_buf;
    }

    (void)command;
    (void)cwd;
    return NULL; /* NULL → JS fallback handles all commands for now */
}

int main(void) { return 0; }
