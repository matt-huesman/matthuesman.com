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
		color: 'teal',
		skills: [
			{ name: 'Python', icon: 'fa-brands fa-python' },
			{ name: 'Java', icon: 'fa-brands fa-java' },
			{ name: 'C', icon: 'fa-solid fa-c' },
			{ name: 'C++' },
			{ name: 'Kotlin' },
			{ name: 'JavaScript', icon: 'fa-brands fa-js' },
			{ name: 'HTML / CSS', icon: 'fa-brands fa-html5' },
			{ name: 'MATLAB' },
			{ name: 'Verilog' }
		]
	},
	{
		label: 'Frameworks & Libraries',
		color: 'red',
		skills: [
			{ name: 'SvelteKit' },
			{ name: 'React', icon: 'fa-brands fa-react' },
			{ name: 'NumPy / SciPy' },
			{ name: 'OpenGL' },
			{ name: 'Android SDK', icon: 'fa-brands fa-android' }
		]
	},
	{
		label: 'Tools & Platforms',
		color: 'neutral',
		skills: [
			{ name: 'Git / GitHub', icon: 'fa-brands fa-git-alt' },
			{ name: 'GitLab', icon: 'fa-brands fa-gitlab' },
			{ name: 'Linux', icon: 'fa-brands fa-linux' },
			{ name: 'Kubernetes' },
			{ name: 'Vivado' },
			{ name: 'Android Studio' },
			{ name: 'Figma', icon: 'fa-brands fa-figma' }
		]
	},
	{
		label: 'Domain Knowledge',
		color: 'yellow',
		skills: [
			{ name: 'Computer Vision' },
			{ name: 'AI / ML Algorithms' },
			{ name: 'Image Processing' },
			{ name: 'API Integration' },
			{ name: 'Robotics' },
			{ name: 'Agile / Scrum' }
		]
	}
];
