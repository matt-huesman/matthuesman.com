<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { skillGroups } from '$lib/data/skills';
	import profile from '$lib/images/profile.png';
	import SectionHeader from '../SectionHeader.svelte';
	import SkillBadge from '../SkillBadge.svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Matt Huesman — About Me</title>
</svelte:head>

<main
	class="min-h-screen"
	style="background: var(--bg); padding-top: 6rem; padding-bottom: var(--section-y);"
>
	<div style="max-width: 52rem; margin-inline: auto; padding-inline: var(--gutter);">

		<!-- Hero row -->
		<div class="mb-20 flex flex-col items-center gap-10 md:flex-row md:items-start" use:reveal>
			<div class="relative shrink-0">
				<img
					src={profile}
					alt="Matt Huesman"
					class="h-44 w-44 rounded-2xl object-cover"
					style="box-shadow: 0 0 0 2px var(--accent), 0 20px 60px rgba(0,0,0,0.10);"
				/>
				<div
					class="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[0.65rem] font-mono"
					style="background: var(--surface); border: 1px solid var(--border); color: var(--accent-text); white-space: nowrap; box-shadow: var(--shadow-sm);"
				>
					@matthuesman
				</div>
			</div>
			<div>
				<p class="eyebrow mb-3">me@matthuesman.com</p>
				<h1
					class="mb-4 font-bold"
					style="font-size: clamp(2rem,5vw,3rem); color: var(--text); line-height: 1.1;"
				>Matt Huesman</h1>
				<p class="body-lead mb-6">
					Computer Engineering student at the University of Minnesota. I build software that solves real problems — AI-powered medical imaging pipelines, modernized production web systems, and occasionally a portfolio that takes itself a little too seriously.
				</p>
				<div class="flex flex-wrap gap-3">
					<Button href="mailto:me@matthuesman.com" variant="primary" size="sm">
						<i class="fa-solid fa-envelope mr-1.5"></i>Email Me
					</Button>
					<Button href="https://github.com/matthuesman" variant="secondary" size="sm">
						<i class="fa-brands fa-github mr-1.5"></i>GitHub
					</Button>
					<Button href="https://linkedin.com/in/matthuesman" variant="secondary" size="sm">
						<i class="fa-brands fa-linkedin mr-1.5"></i>LinkedIn
					</Button>
				</div>
			</div>
		</div>

		<!-- Education -->
		<div class="mb-20" use:reveal>
			<SectionHeader label="Where I Study" title="Education" />
			<div class="card--outlined mt-10 p-6" style="background: var(--surface);">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h3 class="text-base font-semibold" style="color: var(--text);">
							B.S. Computer Engineering
						</h3>
						<p class="mt-0.5 text-sm" style="color: var(--text-muted);">
							University of Minnesota — Twin Cities
						</p>
					</div>
					<div class="text-right">
						<p class="font-mono text-xs" style="color: var(--accent-text);">Expected May 2027</p>
						<p class="mt-0.5 font-mono text-[0.65rem]" style="color: var(--text-faint);">University Honors Program</p>
					</div>
				</div>
				<div class="mt-5 pt-5" style="border-top: 1px solid var(--border);">
					<p class="font-mono text-[0.65rem] tracking-[0.15em] uppercase mb-3" style="color: var(--text-faint);">
						Relevant Coursework
					</p>
					<div class="flex flex-wrap gap-1.5">
						{#each [
							'Artificial Intelligence',
							'Algorithms & Data Structures',
							'Operating Systems',
							'Computer Architecture',
							'Analog Electronics',
							'Signals & Systems',
							'Insights, Ideas & Innovation'
						] as course}
							<span
								class="rounded-full px-3 py-1 font-mono text-xs"
								style="background: var(--surface-alt); border: 1px solid var(--border); color: var(--text-muted);"
							>
								{course}
							</span>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Skills -->
		<div class="mb-20">
			<div use:reveal>
				<SectionHeader label="What I Know" title="Skills" />
			</div>
			<div class="mt-10 flex flex-col gap-8">
				{#each skillGroups as group, i}
					<div use:reveal={{ delay: i * 80 }}>
						<p class="font-mono text-[0.65rem] tracking-[0.18em] uppercase mb-3" style="color: var(--text-faint);">
							{group.label}
						</p>
						<div class="flex flex-wrap gap-2">
							{#each group.skills as skill}
								<SkillBadge name={skill.name} color={group.color} icon={skill.icon} />
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Background / narrative -->
		<div class="mb-20" use:reveal>
			<SectionHeader label="The Story" title="Background" />
			<div class="mt-10 flex flex-col gap-5 leading-relaxed" style="color: var(--text-muted);">
				<p>
					I started in competitive robotics — spending years as programming lead for a FIRST Robotics team,
					which meant self-teaching Kotlin to build a scouting app from scratch and wiring together
					vision-assisted autonomous control under competition pressure. That combination of urgency and
					real-world stakes still drives everything I do.
				</p>
				<p>
					At Medtronic I've worked at the boundary where algorithms meet patient outcomes:
					building 3D image processing pipelines that analyze real CT scans and, more recently,
					designing an AI workflow that automates post-implant valve analysis end-to-end.
					It's made me care deeply about correctness and the kind of rigor the FDA expects —
					not just the kind that passes a code review.
				</p>
				<p>
					Beyond the day job, I lead Triangle Fraternity as president, consult on rebuilding
					legacy web infrastructure for AAUDE, and spend free time reading about AI, building
					side projects, and working toward the intersection of technology and entrepreneurship.
				</p>
				<p>
					My goal is to be the kind of engineer who ships software that millions of people use
					and feel — work that sits at the intersection of intelligence, precision, and human
					experience. The companies doing that most thoughtfully are where I intend to build
					my career.
				</p>
			</div>
		</div>

	</div>
</main>
