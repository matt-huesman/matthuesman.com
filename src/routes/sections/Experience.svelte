<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import SectionHeader from '../SectionHeader.svelte';

	const entries = [
		{
			title: 'Software Engineering Intern',
			company: 'Tokyo Electron',
			period: 'Summer 2026',
			location: 'United States',
			bullets: [
				'Incoming software engineering internship at one of the world\'s leading semiconductor equipment manufacturers',
				'Will work within a software team supporting semiconductor fabrication systems and tooling'
			],
			icon: 'fa-solid fa-microchip',
			upcoming: true
		},
		{
			title: 'Web Development Consultant',
			company: 'AAUDE',
			period: 'Mar 2026 – Present',
			location: 'Remote',
			bullets: [
				'Modernizing and rebuilding production website previously built on WordPress and legacy frameworks',
				'Designing a scalable, maintainable architecture to support the organization\'s long-term web presence',
				'Writing documentation and providing training to internal staff for website maintenance and content management'
			],
			icon: 'fa-solid fa-globe'
		},
		{
			title: 'Engineering Intern',
			company: 'Medtronic',
			period: 'May 2024 – Present',
			location: 'Mounds View, MN',
			bullets: [
				'Helped develop an AI algorithm to automatically segment CT scans and extract post-implant valve metrics in a fully automated workflow',
				'Built and improved Python/MATLAB 3D image processing pipelines to analyze 150+ subject CT scans for TMVR and MAC patients',
				'Internally published a technical paper detailing the algorithm and results',
				'Created MAC quantification algorithm generating key clinical decision-making metrics for countless subjects',
				'Executed FDA-level script validation for TMVR automation, ensuring regulatory compliance within ±0.25mm',
				'Implemented Git/GitLab Script Library and VCS best practices across the R&D engineering team'
			],
			icon: 'fa-solid fa-heart-pulse'
		},
		{
			title: 'Hosting Platform Student Engineer',
			company: 'Office of Information Technology — UMN',
			period: 'Oct 2023 – May 2024',
			location: 'Minneapolis, MN',
			bullets: [
				'Engineered Kubernetes-based infrastructure for dozens of university servers, boosting scalability and uptime for research and instructional use',
				'Collaborated with Agile teams to deliver campus-wide solutions, coordinating workflows via Slack and Target Process'
			],
			icon: 'fa-solid fa-server'
		}
	];
</script>

<section id="experience" style="background: var(--s-bg); padding-block: var(--section-y);">
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">

		<div use:reveal>
			<SectionHeader number="03" label="The Journey" title="Experience" />
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
								style="color: var(--s-text);"
							></i>
						</div>

						<!-- Entry card -->
						<div
							class="card--outlined flex-1 p-6 transition-all duration-300 hover:-translate-y-0.5"
							style="background: var(--surface); {entry.upcoming ? 'border-color: var(--accent); border-width: 1.5px;' : ''}"
						>
							<!-- Header row -->
							<div class="mb-4 flex flex-wrap items-start justify-between gap-2">
								<div>
									<div class="flex items-center gap-2 flex-wrap">
										<h3
											class="text-base font-semibold leading-snug"
											style="color: var(--text);"
										>{entry.title}</h3>
										{#if entry.upcoming}
											<span
												class="rounded-full px-2 py-0.5 font-mono text-[0.6rem] tracking-wide uppercase"
												style="background: var(--accent-faint); color: var(--s-text); border: 1px solid var(--accent-faint);"
											>Next Chapter</span>
										{/if}
									</div>
									<p
										class="mt-0.5 text-sm"
										style="color: var(--text-muted);"
									>{entry.company}</p>
								</div>
								<div class="text-right">
									<p
										class="font-mono text-xs"
										style="color: var(--s-text);"
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
