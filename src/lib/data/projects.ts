export type ProjectStatus = 'complete' | 'in-progress' | 'archived';

export interface Project {
	id: string;
	title: string;
	description: string;
	tags: string[];
	status: ProjectStatus;
	github?: string;
	demo?: string;
}

export const projects: Project[] = [
	{
		id: 'thermal-sim',
		title: 'Thermal Simulation Engine',
		description:
			'Finite-difference heat equation solver written in C++ and compiled to WebAssembly. Runs live in the browser with interactive boundary condition controls.',
		tags: ['C++', 'WebAssembly', 'SvelteKit'],
		status: 'in-progress',
		github: 'https://github.com/matthuesman'
	},
	{
		id: 'embedded-os',
		title: 'Embedded RTOS Kernel',
		description:
			'Preemptive multitasking kernel for STM32F4 (ARM Cortex-M4) with a custom memory allocator, priority scheduler, mutex primitives, and UART debug console.',
		tags: ['C', 'ARM Cortex-M4', 'FreeRTOS', 'CMake'],
		status: 'complete',
		github: 'https://github.com/matthuesman'
	},
	{
		id: 'portfolio',
		title: 'Portfolio Site',
		description:
			'This site. Canvas-based particle animation engine, interactive filesystem terminal, and Emscripten WASM integration for a C backend.',
		tags: ['SvelteKit', 'Svelte 5', 'TypeScript', 'WASM'],
		status: 'in-progress',
		github: 'https://github.com/matthuesman/matthuesman.com'
	},
	{
		id: 'signal-analyzer',
		title: 'RF Signal Analyzer',
		description:
			'Software-defined radio signal classifier using FFT-based feature extraction and a trained SVM to identify modulation schemes from raw IQ samples.',
		tags: ['Python', 'NumPy', 'MATLAB', 'SDR'],
		status: 'complete',
		github: 'https://github.com/matthuesman'
	},
	{
		id: 'fpga-nn',
		title: 'FPGA Neural Network Accelerator',
		description:
			'Pipelined MAC unit in SystemVerilog on a Xilinx Artix-7 FPGA. 8-bit fixed-point arithmetic, achieving 12× speedup over CPU baseline for dense layer inference.',
		tags: ['SystemVerilog', 'Vivado', 'Python', 'FPGA'],
		status: 'complete',
		github: 'https://github.com/matthuesman'
	},
	{
		id: 'maze-robot',
		title: 'Autonomous Maze Solver',
		description:
			'Line-following robot with ultrasonic obstacle avoidance and flood-fill maze solving algorithm. Built on ATmega328P from bare metal — direct register access, no HAL.',
		tags: ['C', 'AVR', 'ATmega328P', 'Sensors'],
		status: 'complete',
		github: 'https://github.com/matthuesman'
	}
];
