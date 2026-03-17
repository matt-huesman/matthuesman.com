cmake_minimum_required(VERSION 3.13)
project(matthuesman C)

# ── Sanity check ──────────────────────────────────────────────────────────────
if(NOT EMSCRIPTEN)
    message(FATAL_ERROR
        "Must build with Emscripten. Run:\n"
        "  emcmake cmake -B build/wasm\n"
        "  cmake --build build/wasm\n"
        "Or use: npm run wasm:build")
endif()

# ── Paths ─────────────────────────────────────────────────────────────────────
set(WASM_SRC_DIR ${CMAKE_SOURCE_DIR}/src/wasm)
set(WASM_OUT_DIR ${CMAKE_SOURCE_DIR}/static/wasm)

# ── Shared link flags ─────────────────────────────────────────────────────────
#
# These are applied to every WASM module. Override per-target with
# target_link_options() after calling add_wasm_module().
#
set(WASM_COMMON_LINK_FLAGS
    "-sMODULARIZE=1"
    "-sEXPORT_ES6=1"
    "-sALLOW_MEMORY_GROWTH=1"
    "-sENVIRONMENT=web"
    "-sINVOKE_RUN=0"          # wasm_init() is called explicitly by the JS loader
    "-sNO_EXIT_RUNTIME=1"
    "-sEXPORTED_RUNTIME_METHODS=ccall,cwrap,UTF8ToString,stringToUTF8,lengthBytesUTF8"
)

# ── add_wasm_module(<name> <src1> [<src2> ...]) ───────────────────────────────
#
# Compiles the given C sources into:
#   static/wasm/<name>.js    — Emscripten ES6 module (factory function)
#   static/wasm/<name>.wasm  — WebAssembly binary
#
# The JS loader (src/lib/wasm/loader.ts) imports these at runtime.
# All functions decorated with WASM_EXPORT in wasm_interface.h are callable
# from JS via ccall/cwrap without any extra configuration.
#
# To add a new module:
#   1. Create src/wasm/<name>/ with C sources that include wasm_interface.h
#   2. file(GLOB MY_SRCS ${WASM_SRC_DIR}/<name>/*.c)
#      add_wasm_module(<name> ${MY_SRCS})
#   3. npm run wasm:build
#   4. loadWasmModule('<name>') in TypeScript
#
function(add_wasm_module MODULE_NAME)
    set(SOURCES ${ARGN})

    add_executable(${MODULE_NAME} ${SOURCES})

    set_target_properties(${MODULE_NAME} PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY ${WASM_OUT_DIR}
        OUTPUT_NAME              "${MODULE_NAME}"
        SUFFIX                   ".js"
    )

    target_include_directories(${MODULE_NAME} PRIVATE ${WASM_SRC_DIR})

    target_compile_options(${MODULE_NAME} PRIVATE "-O2")

    target_link_options(${MODULE_NAME} PRIVATE
        ${WASM_COMMON_LINK_FLAGS}
        "-sEXPORT_NAME=create${MODULE_NAME}Module"
    )
endfunction()

# ── Modules ───────────────────────────────────────────────────────────────────

# terminal — processes shell commands from the portfolio terminal
file(GLOB TERMINAL_SRCS ${WASM_SRC_DIR}/*.c)
add_wasm_module(terminal ${TERMINAL_SRCS})
