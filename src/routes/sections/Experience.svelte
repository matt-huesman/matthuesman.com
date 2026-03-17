<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import SectionHeader from '../SectionHeader.svelte';

	const entries = [
		{
			title: 'Softwear Engineering Intern',
			company: 'Tokyo Electron',
			period: 'May 2026 – Present',
			location: 'Mounds View, MN',
			bullets: [
				
			],
			icon: 'fa-solid fa-microchip'
		},
		{
			title: 'R&D Engineering Intern',
			company: 'Medtronic',
			period: 'May 2024 – May 2026',
			location: 'Mounds View, MN',
			bullets: [
				'Embedded firmware development for medical device platform in C/C++ on ARM Cortex-M',
				'Integration testing, requirements documentation, and design reviews',
				'Collaborated with cross-functional teams on hardware/software interface specs'
			],
			icon: 'fa-solid fa-heart-pulse'
		},
		{
			title: 'Student Engineer',
			company: 'Office of Information & Technology — UMN',
			period: 'Oct 2023 – May 2024',
			location: 'Minneapolis, MN',
			bullets: [
				'Built and maintained internal full-stack web tooling for IT operations',
				'Linux systems administration and automation scripting (Python, Bash)',
				'Provided technical support and training to students and staff'
			],
			icon: 'fa-solid fa-server'
		}
	];
</script>

<section id="experience" style="background: var(--surface-alt); padding-block: var(--section-y);">
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">

		<div use:reveal>
			<SectionHeader number="04" label="Where I've Been" title="Experience" />
		</div>

		<div class="relative mt-16">
			<!-- Thin vertical timeline line -->
			<div
				class="absolute top-0 h-full w-px"
				style="left: 19px; background: var(--border);"
			></div>

			<div class="flex flex-col gap-8">
				{#each entries as entry, i}
					<div class="relative flex gap-8" use:reveal={{ delay: i * 120 }}>

						<!-- Timeline node: small icon badge -->
						<div
							class="relative z-10 mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
							style="background: var(--surface); border: 1.5px solid var(--border);"
						>
							<i
								class="{entry.icon} text-[1rem]"
								style="color: var(--accent-text);"
							></i>
						</div>

						<!-- Entry card -->
						<div
							class="card--outlined flex-1 p-6 transition-all duration-300 hover:-translate-y-0.5"
							style="background: var(--surface);"
						>
							<!-- Header row -->
							<div class="mb-4 flex flex-wrap items-start justify-between gap-2">
								<div>
									<h3
										class="text-base font-semibold leading-snug"
										style="color: var(--text);"
									>{entry.title}</h3>
									<p
										class="mt-0.5 text-sm"
										style="color: var(--text-muted);"
									>{entry.company}</p>
								</div>
								<div class="text-right">
									<p
										class="font-mono text-xs"
										style="color: var(--accent-text);"
									>{entry.period}</p>
									<p
										class="mt-0.5 font-mono text-[0.65rem]"
										style="color: var(--text-faint);"
									>{entry.location}</p>
								</div>
							</div>

							<!-- Bullet points -->
							<ul class="flex flex-col gap-2">
								{#each entry.bullets as bullet}
									<li class="flex items-start gap-2.5 text-sm" style="color: var(--text-muted);">
										<span
											class="mt-2 h-1 w-1 shrink-0 rounded-full"
											style="background: var(--accent);"
										></span>
										{bullet}
									</li>
								{/each}
							</ul>
						</div>

					</div>
				{/each}
			</div>
		</div>

	</div>
</section>
