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
		id: 'ct-scan-ai',
		title: 'CT Scan AI Segmentation',
		description:
			'AI algorithm that automatically segments CT scans to extract post-implant valve metrics in a fully automated clinical workflow. Built at Medtronic to accelerate analysis of TMVR and MAC patients.',
		tags: ['Python', 'MATLAB', 'AI/ML', 'Image Processing'],
		status: 'in-progress'
	},
	{
		id: 'aaude-website',
		title: 'AAUDE Website Modernization',
		description:
			'Consulting engagement to redesign and rebuild the AAUDE production website, migrating away from a legacy WordPress-based stack toward a scalable, maintainable modern architecture.',
		tags: ['Web Development', 'WordPress', 'Consulting'],
		status: 'in-progress'
	},
	{
		id: 'checkers-ai',
		title: 'Checkers AI Engine',
		description:
			'Minimax algorithm with alpha-beta pruning enabling efficient competitive gameplay. Benchmarked across 100+ hours of intra-model tests and documented in a research paper comparing efficiency across multiple configurations.',
		tags: ['Python', 'AI Algorithms', 'Research'],
		status: 'complete',
		github: 'https://github.com/matthuesman'
	},
	{
		id: 'frc-krawler',
		title: 'FRC Krawler 4.0',
		description:
			'Self-taught Kotlin and Android to lead design of a scouting app from scratch for KnightKrawler Robotics. Provided the team with a modernized strategy tool used in live FIRST Robotics competitions.',
		tags: ['Kotlin', 'Android', 'Android Studio'],
		status: 'complete',
		github: 'https://github.com/matthuesman'
	},
	{
		id: 'portfolio',
		title: 'Portfolio Site',
		description:
			'This site. Canvas-based particle animation engine, interactive terminal, and a fully autonomous ML-powered robotic arm simulation — built with SvelteKit and Svelte 5.',
		tags: ['SvelteKit', 'Svelte 5', 'TypeScript', 'OpenGL'],
		status: 'in-progress',
		github: 'https://github.com/matthuesman/matthuesman.com'
	}
];
