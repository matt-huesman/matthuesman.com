export type SkillColor = 'cyan' | 'purple' | 'orange' | 'neutral';

export interface Skill {
	name: string;
	icon?: string;
}

export interface SkillGroup {
	label: string;
	color: SkillColor;
	skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
	{
		label: 'Languages',
		color: 'cyan',
		skills: [
			{ name: 'C', icon: 'fa-solid fa-c' },
			{ name: 'C++' },
			{ name: 'Python', icon: 'fa-brands fa-python' },
			{ name: 'TypeScript', icon: 'fa-brands fa-js' },
			{ name: 'SystemVerilog' },
			{ name: 'MATLAB' },
			{ name: 'ARM Assembly' }
		]
	},
	{
		label: 'Frameworks & Libraries',
		color: 'purple',
		skills: [
			{ name: 'SvelteKit' },
			{ name: 'React', icon: 'fa-brands fa-react' },
			{ name: 'Node.js', icon: 'fa-brands fa-node-js' },
			{ name: 'CMake' },
			{ name: 'FreeRTOS' },
			{ name: 'NumPy / SciPy' },
			{ name: 'Emscripten' }
		]
	},
	{
		label: 'Hardware & Embedded',
		color: 'orange',
		skills: [
			{ name: 'ARM Cortex-M' },
			{ name: 'FPGA (Xilinx)' },
			{ name: 'Arduino / AVR' },
			{ name: 'Raspberry Pi', icon: 'fa-brands fa-raspberry-pi' },
			{ name: 'KiCad PCB' },
			{ name: 'JTAG / SWD' },
			{ name: 'Oscilloscopes' }
		]
	},
	{
		label: 'Tools & Platforms',
		color: 'neutral',
		skills: [
			{ name: 'Git', icon: 'fa-brands fa-git-alt' },
			{ name: 'Linux', icon: 'fa-brands fa-linux' },
			{ name: 'Docker', icon: 'fa-brands fa-docker' },
			{ name: 'GDB' },
			{ name: 'Vivado' },
			{ name: 'GitHub Actions', icon: 'fa-brands fa-github' },
			{ name: 'VS Code' }
		]
	}
];
