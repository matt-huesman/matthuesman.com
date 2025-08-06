cmake_minimum_required(VERSION 3.13)
project(matthuesman C)

set(CMAKE_BINARY_DIR ${CMAKE_SOURCE_DIR}/static/build)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

# Source directory
set(WASM_SRC_DIR ${CMAKE_SOURCE_DIR}/src/wasm)
file(GLOB WASM_SOURCES ${WASM_SRC_DIR}/*.c)

# Toolchain should NOT be set inside the CMakeLists; emcmake handles this
# Just warn if building without Emscripten
if(NOT EMSCRIPTEN)
    message(WARNING "You're not using Emscripten (emcmake) to configure this build!")
endif()

# Target
add_executable(matthuesman ${WASM_SOURCES})

# Set output to produce both .wasm and .js (default for Emscripten)
set_target_properties(matthuesman PROPERTIES
    OUTPUT_NAME "main"
    SUFFIX ".html"
)

# Emscripten flags
target_compile_options(matthuesman PRIVATE
    "-O3"
)

# Copy result to output dir
add_custom_command(TARGET matthuesman POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE:matthuesman> ${CMAKE_SOURCE_DIR}/src/lib
)