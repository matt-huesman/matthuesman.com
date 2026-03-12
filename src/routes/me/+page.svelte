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
					Computer Engineering student at the University of Minnesota. I build things at the
					intersection of hardware and software — embedded firmware, FPGA accelerators, browser-side
					WASM, and occasionally a portfolio website that takes itself a little too seriously.
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
						<p class="font-mono text-xs" style="color: var(--accent-text);">Expected May 2026</p>
						<p class="mt-0.5 font-mono text-[0.65rem]" style="color: var(--text-faint);">GPA: 3.8 / 4.0</p>
					</div>
				</div>
				<div class="mt-5 pt-5" style="border-top: 1px solid var(--border);">
					<p class="font-mono text-[0.65rem] tracking-[0.15em] uppercase mb-3" style="color: var(--text-faint);">
						Relevant Coursework
					</p>
					<div class="flex flex-wrap gap-1.5">
						{#each [
							'Embedded Systems',
							'Digital Design (FPGA)',
							'Operating Systems',
							'Computer Architecture',
							'Real-Time Systems',
							'Signal Processing',
							'Microcontrollers',
							'Algorithms & Data Structures',
							'Software Engineering',
							'Compilers'
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
					I got into computer engineering because I wanted to understand how computers
					<em style="color: var(--text);">actually</em> work —
					not just at the software abstraction layer, but all the way down to silicon. That curiosity
					led me to embedded systems, FPGA design, and eventually a deep appreciation for well-written C.
				</p>
				<p>
					These days I spend a lot of time thinking about the hardware/software interface: how to make
					firmware that's robust under constraint, how to squeeze performance out of an FPGA by thinking
					about the underlying architecture, and how to bridge low-level systems work with the kind of
					interactive experiences you can only build in a browser.
				</p>
				<p>
					Outside of engineering, I'm usually reading about compilers, tinkering with side projects, or
					trying to convince people that C is actually a reasonable language.
				</p>
			</div>
		</div>

	</div>
</main>
