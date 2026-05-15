<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { base } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import RoboticArm from '$lib/components/RoboticArm.svelte';
</script>


<section id="about" style="background: var(--s-bg); padding-block: var(--section-y);">
<!-- <div class="header-fade-out" aria-hidden="true"></div> -->
	<div class="container" style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">
		<div class="grid grid-cols-1 items-center gap-16 md:grid-cols-2">

			<!-- Robotic arm column — bind:this={arm} gives you the full control API -->
			<div class="flex justify-center md:justify-start flex-col" use:reveal>
				<div class="arm-stage">
					<RoboticArm class="arm-canvas" />
				</div>
				<p class="body-text text-center">This will be a completely autonomous machine learning powered robotic arm. This website is all it knows.</p>
			</div>

			<!-- Bio column -->
			<div class="flex flex-col gap-6" use:reveal={{ delay: 100 }}>
				<!-- Eyebrow + heading -->
				<div>
					<p class="eyebrow mb-3">
						<span style="color: var(--accent); margin-right: 0.5em;">01</span>
						Who I am
					</p>
					<h2 class="section-title mb-2">
						Computer Engineer<br />
					</h2>
					<h2 class="section-title" style="color: #ee9b00; background: #9b2226; padding: 0.25rem 0.5rem; margin: 0.25rem; border-radius: var(--radius-sm); width: fit-content;">
						@ UMN
					</h2>
				</div>

				<!-- Bio copy -->
				<div class="flex flex-col gap-4">
					<p class="body-lead">
						<b>Welcome to my portfolio ecosystem!</b> I'm a computer engineering student with a minor in entrepreneurship — driven by the belief that the best software is built by people who care deeply about the problem, the team, and whoever's on the other end of the screen.
					</p>
					<p class="body-text">
						My work spans AI-driven medical imaging, full-stack web development, and everything in between.
						Currently building an end-to-end AI segmentation workflow at Medtronic and modernizing
						AAUDE's production web presence. My sights are set on software that operates at the
						intersection of intelligence and human experience - precise, purposeful, built to last.
					</p>
				</div>

				<!-- Stat pills -->
				<div class="flex flex-wrap gap-2">
					{#each [
						{ icon: 'fa-solid fa-location-dot', text: 'Minneapolis, MN' },
						{ icon: 'fa-solid fa-brain', text: 'AI & Image Processing' },
						{ icon: 'fa-solid fa-graduation-cap', text: 'Expected May 2027' },
						{ icon: 'fa-solid fa-briefcase', text: 'Summer \'26 @ Tokyo Electron' }
					] as stat}
						<span
							class="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
							style="background: var(--surface-alt); border: 1px solid var(--border); color: var(--text-muted);"
						>
							<i class="{stat.icon} text-[0.6rem]" style="color: var(--s-text);"></i>
							{stat.text}
						</span>
					{/each}
				</div>

				<!-- CTAs -->
				<div class="flex flex-wrap gap-3">
					<Button href="{base}/#projects" variant="primary">View Projects</Button>
					<Button href="{base}/me" variant="secondary">Full About Me →</Button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.arm-stage {
		width: 100%;
		max-width: 420px;
		aspect-ratio: 3 / 4;
		border-radius: var(--radius);
		overflow: hidden;
	}

	.arm-canvas {
		width: 100%;
		height: 100%;
	}

	.header-fade-out {
		position: absolute;
		top: 0; left: 0; right: 0;
		width: 100%;
		height: 80px;
		background: linear-gradient(to bottom, var(--bg), var(--surface));
		pointer-events: none;
	}
</style>