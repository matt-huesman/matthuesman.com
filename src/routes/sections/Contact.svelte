<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import Button from '$lib/components/Button.svelte';
</script>

<section id="contact" style="background: var(--surface); padding-block: var(--section-y);">
	<div
		style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter);"
	>
		<div class="mx-auto max-w-2xl text-center" use:reveal>

			<!-- Eyebrow -->
			<p class="eyebrow mb-4">Get In Touch</p>

			<!-- Heading -->
			<h2
				class="section-title mb-6"
				style="line-height: 1.1;"
			>
				Let's Build<br />
				<span style="color: var(--accent-text);">Something.</span>
			</h2>

			<!-- Body -->
			<p
				class="body-lead mx-auto mb-10"
				style="max-width: 36rem;"
			>
				Open to internships, research collaborations, and interesting engineering problems.
				Whether it's firmware, systems software, or something weird involving FPGAs — I'm in.
			</p>

			<!-- CTAs -->
			<div class="mb-12 flex flex-wrap justify-center gap-3">
				<Button href="mailto:me@matthuesman.com" variant="primary">
					<i class="fa-solid fa-envelope mr-2"></i>Email Me
				</Button>
				<Button href="#" variant="secondary">
					<i class="fa-solid fa-file-lines mr-2"></i>View Resume
				</Button>
			</div>

			<!-- Social icon row -->
			<div class="flex justify-center gap-4">
				{#each [
					{ href: 'https://github.com/matthuesman',    icon: 'fa-brands fa-github',   label: 'GitHub' },
					{ href: 'https://linkedin.com/in/matthuesman', icon: 'fa-brands fa-linkedin', label: 'LinkedIn' },
					{ href: 'https://app.joinhandshake.com',     icon: 'fa-solid fa-handshake', label: 'Handshake' }
				] as social}
					<a
						href={social.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={social.label}
						class="social-icon flex h-12 w-12 items-center justify-center rounded-xl text-lg transition-all duration-200 hover:-translate-y-0.5"
						style="background: var(--surface-alt); border: 1px solid var(--border); color: var(--text-muted);"
					>
						<i class={social.icon}></i>
					</a>
				{/each}
			</div>

		</div>
	</div>
</section>

<style>
	.social-icon:hover {
		color: var(--accent-text) !important;
		border-color: var(--accent) !important;
		box-shadow: var(--shadow-sm);
	}
</style>
