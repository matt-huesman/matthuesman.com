export type SkillColor = 'teal' | 'red' | 'yellow' | 'neutral';

export interface Skill {
	name: string;
	icon?: string;
	context?: string;
	projectIds?: string[];
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
			{
				name: 'Python',
				icon: 'fa-brands fa-python',
				context: 'Primary language at Medtronic — AI segmentation algorithms, image processing pipelines, and FDA validation scripts.',
				projectIds: ['ct-scan-ai', 'checkers-ai']
			},
			{
				name: 'Java',
				icon: 'fa-brands fa-java',
				context: 'Used in coursework and early Android development.'
			},
			{
				name: 'C',
				icon: 'fa-solid fa-c',
				context: 'Systems programming in coursework and low-level embedded projects.'
			},
			{
				name: 'C++',
				context: 'Performance-critical coursework and game engine work.'
			},
			{
				name: 'Kotlin',
				context: 'Self-taught to build the FRC Krawler Android scouting app from scratch.',
				projectIds: ['frc-krawler']
			},
			{
				name: 'JavaScript',
				icon: 'fa-brands fa-js',
				context: 'Core language for all web projects — SvelteKit, client logic, and tooling.',
				projectIds: ['portfolio', 'aaude-website']
			},
			{
				name: 'HTML / CSS',
				icon: 'fa-brands fa-html5',
				context: 'Used in all web work — layout, animations, and design systems.',
				projectIds: ['portfolio', 'aaude-website']
			},
			{
				name: 'MATLAB',
				context: 'Used at Medtronic for 3D CT scan processing and MAC quantification algorithms.',
				projectIds: ['ct-scan-ai']
			},
			{
				name: 'Verilog',
				context: 'Used in digital logic design and FPGA coursework with Vivado.'
			}
		]
	},
	{
		label: 'Frameworks & Libraries',
		color: 'red',
		skills: [
			{
				name: 'SvelteKit',
				context: 'Primary web framework — built this portfolio site and the AAUDE website modernization.',
				projectIds: ['portfolio', 'aaude-website']
			},
			{
				name: 'React',
				icon: 'fa-brands fa-react',
				context: 'Used in web development projects and coursework.'
			},
			{
				name: 'NumPy / SciPy',
				context: 'Numerical computing backbone for AI/ML pipelines and algorithm research.',
				projectIds: ['ct-scan-ai', 'checkers-ai']
			},
			{
				name: 'OpenGL',
				context: 'Used to build the 3D robotic arm simulation featured on this site.',
				projectIds: ['portfolio']
			},
			{
				name: 'Android SDK',
				icon: 'fa-brands fa-android',
				context: 'Built a full Android scouting app used in live FIRST Robotics competitions.',
				projectIds: ['frc-krawler']
			}
		]
	},
	{
		label: 'Tools & Platforms',
		color: 'neutral',
		skills: [
			{
				name: 'Git / GitHub',
				icon: 'fa-brands fa-git-alt',
				context: 'Version control for all projects — branching, code review, and CI/CD.',
				projectIds: ['portfolio', 'checkers-ai', 'frc-krawler']
			},
			{
				name: 'GitLab',
				icon: 'fa-brands fa-gitlab',
				context: 'Enterprise source control and CI/CD pipelines at Medtronic.',
				projectIds: ['ct-scan-ai']
			},
			{
				name: 'Linux',
				icon: 'fa-brands fa-linux',
				context: 'Used in server environments at UMN OIT and Medtronic dev pipelines.',
				projectIds: ['ct-scan-ai']
			},
			{
				name: 'Kubernetes',
				context: 'Managed hosting infrastructure on Agile teams at UMN Office of Information Technology.'
			},
			{
				name: 'Vivado',
				context: 'FPGA design and simulation toolchain for digital logic coursework.'
			},
			{
				name: 'Android Studio',
				context: 'Primary IDE for building and profiling the FRC Krawler Android app.',
				projectIds: ['frc-krawler']
			},
			{
				name: 'Figma',
				icon: 'fa-brands fa-figma',
				context: 'Used for UI/UX design and prototyping in web consulting and portfolio work.',
				projectIds: ['aaude-website', 'portfolio']
			}
		]
	},
	{
		label: 'Domain Knowledge',
		color: 'yellow',
		skills: [
			{
				name: 'Computer Vision',
				context: 'Core of Medtronic internship — segmenting 3D CT scans to extract post-implant valve metrics.',
				projectIds: ['ct-scan-ai']
			},
			{
				name: 'AI / ML Algorithms',
				context: 'Built and benchmarked AI systems from a checkers minimax engine to medical CT segmentation pipelines.',
				projectIds: ['ct-scan-ai', 'checkers-ai']
			},
			{
				name: 'Image Processing',
				context: '3D CT scan processing pipelines and valve metric extraction at Medtronic.',
				projectIds: ['ct-scan-ai']
			},
			{
				name: 'API Integration',
				context: 'Used across web projects for third-party service connections and data pipelines.',
				projectIds: ['portfolio']
			},
			{
				name: 'Robotics',
				context: 'Programming Captain at KnightKrawler FIRST Robotics — competition control code and systems.'
			},
			{
				name: 'Agile / Scrum',
				context: 'Practiced on Agile teams at UMN OIT and in ongoing web consulting engagements.',
				projectIds: ['ct-scan-ai', 'aaude-website']
			}
		]
	}
];
