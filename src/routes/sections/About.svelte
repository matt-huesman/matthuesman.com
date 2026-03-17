<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { base } from '$app/paths';
	import profile from '$lib/images/profile.png';
	import Button from '$lib/components/Button.svelte';
	import SectionHeader from '../SectionHeader.svelte';
</script>


<section id="about" style="background: var(--surface); padding-block: var(--section-y);">
<!-- <div class="header-fade-out" aria-hidden="true"></div> -->
	<div class="container" style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);">
		<div class="grid grid-cols-1 items-center gap-16 md:grid-cols-2">

			<!-- Photo column -->
			<div class="flex justify-center md:justify-start" use:reveal>
				<div class="relative">
					<img
						src={profile}
						alt="Matt Huesman"
						class="h-72 w-72 rounded-2xl object-cover"
						style="box-shadow: 0 0 0 2px var(--accent), 0 20px 60px rgba(0,0,0,0.10);"
					/>
					<!-- Floating handle badge -->
					<div
						class="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-mono"
						style="background: var(--surface); border: 1px solid var(--border); color: var(--accent-text); box-shadow: var(--shadow-sm); white-space: nowrap;"
					>
						<a href="https://github.com/matt-huesman" target="_blank" rel="noopener noreferrer">@matthuesman</a>
					</div>
				</div>
			</div>

			<!-- Bio column -->
			<div class="flex flex-col gap-6" use:reveal={{ delay: 100 }}>
				<!-- Eyebrow + heading -->
				<div>
					<p class="eyebrow mb-3">
						<span style="color: var(--text-faint); margin-right: 0.5em;">01</span>
						Who I am
					</p>
					<h2 class="section-title mb-2">
						Computer Engineering<br />
					</h2>
					<h2 class="section-title" style="color: #ffcc33; background: #7a0019; padding: 0.25rem 0.5rem; margin: 0.25rem; border-radius: var(--radius-sm); width: fit-content;">
						@ UMN
					</h2>
				</div>

				<!-- Bio copy -->
				<div class="flex flex-col gap-4">
					<p class="body-lead">
						I'm a senior computer engineering student with a minor in entrepreneurship, passionate about building systems that work at
						the intersection of hardware and software.
					</p>
					<p class="body-text">
						From bare-metal firmware to browser-side WASM, I enjoy the full stack —
						especially the low-level parts most people avoid. Currently interning at Medtronic
						on embedded firmware for medical devices.
					</p>
				</div>

				<!-- Stat pills -->
				<div class="flex flex-wrap gap-2">
					{#each [
						{ icon: 'fa-solid fa-location-dot', text: 'Minneapolis, MN' },
						{ icon: 'fa-solid fa-microchip', text: 'Embedded Systems' },
						{ icon: 'fa-solid fa-graduation-cap', text: 'Expected May 2026' },
						{ icon: 'fa-solid fa-briefcase', text: 'Open to Internships' }
					] as stat}
						<span
							class="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
							style="background: var(--surface-alt); border: 1px solid var(--border); color: var(--text-muted);"
						>
							<i class="{stat.icon} text-[0.6rem]" style="color: var(--accent-text);"></i>
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
	.header-fade-out {
		position: absolute;
		top: 0; left: 0; right: 0;
		width: 100%;
		height: 80px;
		background: linear-gradient(to bottom, var(--bg), var(--surface));
		pointer-events: none;
	}
</style>