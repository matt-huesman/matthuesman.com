export interface FSFile {
	type: 'file';
	content: string;
}

export interface FSDir {
	type: 'dir';
	children: Record<string, FSNode>;
}

export type FSNode = FSFile | FSDir;

export const VFS: FSDir = {
	type: 'dir',
	children: {
		home: {
			type: 'dir',
			children: {
				matt: {
					type: 'dir',
					children: {
						'README.md': {
							type: 'file',
							content: `# Matt Huesman

Computer Engineering student at the University of Minnesota.
I build things at the intersection of hardware and software —
embedded systems, FPGAs, compilers, and the occasional web app.

Run 'ls' to see what's here, or 'cat resume.txt' to learn more.
Type 'help' for a list of available commands.`
						},
						'resume.txt': {
							type: 'file',
							content: `Matt Huesman
─────────────────────────────────────────
Email:    me@matthuesman.com
GitHub:   github.com/matthuesman
LinkedIn: linkedin.com/in/matthuesman
─────────────────────────────────────────

EDUCATION
  B.S. Computer Engineering
  University of Minnesota — Twin Cities
  Expected May 2026  |  GPA: 3.8

EXPERIENCE
  Engineering Intern
  Medtronic  |  May 2024 – Present
  · Embedded firmware development for medical device platform
  · C/C++ on ARM Cortex-M, integration testing, requirements docs

  Student Engineer
  Office of Information & Technology, UMN  |  Oct 2023 – May 2024
  · Full-stack internal tooling and Linux systems administration
  · Student-facing technical support and automation scripting

SKILLS
  Languages:  C, C++, Python, TypeScript, SystemVerilog, MATLAB
  Hardware:   ARM Cortex-M, FPGA (Xilinx), KiCad, JTAG/SWD
  Tools:      Git, CMake, GDB, Docker, GitHub Actions, Linux`
						},
						'skills.txt': {
							type: 'file',
							content: `Languages
─────────────────────────────────────────
  C            ████████████████████  expert
  C++          ████████████████░░░░  advanced
  Python       ███████████████░░░░░  advanced
  TypeScript   ████████████░░░░░░░░  proficient
  SystemVerilog████████░░░░░░░░░░░░  proficient
  MATLAB       ██████░░░░░░░░░░░░░░  familiar
  ARM Assembly ██████░░░░░░░░░░░░░░  familiar

Frameworks & Libraries
─────────────────────────────────────────
  SvelteKit    FreeRTOS    CMake
  React        NumPy       Node.js
  SciPy        Emscripten

Hardware & Embedded
─────────────────────────────────────────
  ARM Cortex-M (STM32, nRF)
  FPGA — Xilinx Artix-7 / Spartan
  Arduino / AVR  |  Raspberry Pi
  KiCad PCB Design  |  JTAG/SWD debugging
  Oscilloscopes / Logic Analyzers

Tools & Platforms
─────────────────────────────────────────
  Git  |  Linux  |  Docker  |  GDB
  Vivado  |  VS Code  |  GitHub Actions`
						},
						'contact.txt': {
							type: 'file',
							content: `Contact
─────────────────────────────────────────
  Email:      me@matthuesman.com
  GitHub:     github.com/matthuesman
  LinkedIn:   linkedin.com/in/matthuesman
  Handshake:  app.joinhandshake.com/users/matthuesman
─────────────────────────────────────────
Open to internships, research roles, and interesting problems.`
						},
						projects: {
							type: 'dir',
							children: {
								'thermal-sim': {
									type: 'dir',
									children: {
										'README.md': {
											type: 'file',
											content: `# Thermal Simulation Engine

A finite-difference heat equation solver written in C++ and
compiled to WebAssembly via Emscripten. Runs live in the browser
with interactive boundary condition controls rendered in SvelteKit.

Tech: C++, WebAssembly, Emscripten, SvelteKit, Canvas API
Status: In Progress

Demonstrates:
  - Numerical methods (explicit Euler, Crank-Nicolson)
  - WASM/JS interop and shared memory
  - Real-time visualization at 60fps`
										}
									}
								},
								'embedded-os': {
									type: 'dir',
									children: {
										'README.md': {
											type: 'file',
											content: `# Embedded RTOS Kernel

Preemptive multitasking kernel for STM32F4 (ARM Cortex-M4).
Custom memory allocator, priority-based round-robin scheduler,
mutex/semaphore primitives, and UART debug console.

Tech: C, ARM Cortex-M4, FreeRTOS, CMake, OpenOCD
Status: Complete

Demonstrates:
  - Bare-metal ARM programming and context switching
  - Memory management without OS support
  - Real-time scheduling theory`
										},
										'build.sh': {
											type: 'file',
											content: `#!/bin/bash
# Build script for embedded-os
cmake -B build -DCMAKE_TOOLCHAIN_FILE=arm-none-eabi.cmake
cmake --build build
arm-none-eabi-objcopy -O binary build/kernel.elf build/kernel.bin
echo "Flash with: openocd -f interface/stlink.cfg -f target/stm32f4x.cfg"`
										}
									}
								},
								portfolio: {
									type: 'dir',
									children: {
										'README.md': {
											type: 'file',
											content: `# Portfolio Site (this site)

Built with SvelteKit and Svelte 5. Features a canvas-based
particle animation engine, this interactive filesystem terminal,
and Emscripten WASM integration for C backend commands.

Tech: SvelteKit, Svelte 5, TypeScript, Tailwind CSS 4, WASM
Status: In Progress

Source: github.com/matthuesman/matthuesman.com`
										}
									}
								},
								'signal-analyzer': {
									type: 'dir',
									children: {
										'README.md': {
											type: 'file',
											content: `# RF Signal Analyzer

Software-defined radio signal classifier using FFT-based feature
extraction and a trained SVM to identify common modulation schemes
(AM, FM, BPSK, QPSK, 16-QAM) from raw IQ samples.

Tech: Python, NumPy, SciPy, MATLAB, RTL-SDR
Status: Complete

Demonstrates:
  - DSP fundamentals: sampling, FFT, windowing, filtering
  - Machine learning for signal classification
  - SDR hardware interfacing`
										}
									}
								},
								'fpga-nn': {
									type: 'dir',
									children: {
										'README.md': {
											type: 'file',
											content: `# FPGA Neural Network Accelerator

Pipelined matrix multiply-accumulate (MAC) unit implemented in
SystemVerilog on a Xilinx Artix-7 FPGA. Uses 8-bit fixed-point
arithmetic and achieves a 12x speedup over CPU baseline for
dense layer inference.

Tech: SystemVerilog, Vivado, Python, Xilinx Artix-7
Status: Complete

Demonstrates:
  - Digital design and pipelining
  - Fixed-point arithmetic
  - FPGA resource optimization (DSP slices, BRAM)`
										}
									}
								},
								'maze-robot': {
									type: 'dir',
									children: {
										'README.md': {
											type: 'file',
											content: `# Autonomous Maze Solver

Line-following robot with ultrasonic obstacle avoidance and
flood-fill maze solving algorithm. Built on ATmega328P from
bare metal — no Arduino libraries, direct register access.

Tech: C, AVR (ATmega328P), HC-SR04, IR sensors
Status: Complete

Demonstrates:
  - Embedded C without HAL abstractions
  - Graph search algorithms on constrained hardware
  - Sensor fusion and real-time control loops`
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

export function resolvePath(cwd: string, input: string): string {
	if (input.startsWith('/')) return normalizePath(input);
	const parts = cwd.split('/').filter(Boolean);
	for (const seg of input.split('/')) {
		if (seg === '.' || seg === '') continue;
		if (seg === '..') parts.pop();
		else parts.push(seg);
	}
	return '/' + parts.join('/');
}

export function normalizePath(p: string): string {
	const parts = p.split('/').filter(Boolean);
	const out: string[] = [];
	for (const seg of parts) {
		if (seg === '..') out.pop();
		else if (seg !== '.') out.push(seg);
	}
	return '/' + out.join('/');
}

export function getNode(path: string): FSNode | null {
	const parts = path.split('/').filter(Boolean);
	let node: FSNode = VFS;
	for (const part of parts) {
		if (node.type !== 'dir') return null;
		const child = node.children[part];
		if (!child) return null;
		node = child;
	}
	return node;
}
