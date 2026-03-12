<script lang="ts">
	import { base } from '$app/paths';
	const year = new Date().getFullYear();
</script>

<footer style="background: var(--surface); border-top: 1px solid var(--border);">
	<div style="max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter); padding-block: 48px;">
		<div class="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">

			<!-- Brand -->
			<div class="max-w-xs">
				<p class="font-semibold text-base" style="color: var(--text);">Matt Huesman</p>
				<p class="mt-1 text-sm leading-relaxed" style="color: var(--text-muted);">
					Computer Engineering @ University of Minnesota
				</p>
				<div class="mt-4 flex items-center gap-1">
					<a href="https://github.com/matthuesman" target="_blank" rel="noopener"
						class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
						style="color: var(--text-faint);" aria-label="GitHub">
						<i class="fa-brands fa-github"></i>
					</a>
					<a href="https://linkedin.com/in/matthuesman" target="_blank" rel="noopener"
						class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
						style="color: var(--text-faint);" aria-label="LinkedIn">
						<i class="fa-brands fa-linkedin"></i>
					</a>
					<a href="https://app.joinhandshake.com" target="_blank" rel="noopener"
						class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
						style="color: var(--text-faint);" aria-label="Handshake">
						<i class="fa-solid fa-handshake"></i>
					</a>
				</div>
			</div>

			<!-- Nav links -->
			<div class="flex gap-12">
				<div class="flex flex-col gap-2.5">
					<p class="eyebrow mb-0.5">Navigate</p>
					<a href="{base}/#about"    class="text-sm transition-colors hover:text-[var(--text)]" style="color: var(--text-muted);">About</a>
					<a href="{base}/#skills"   class="text-sm transition-colors hover:text-[var(--text)]" style="color: var(--text-muted);">Skills</a>
					<a href="{base}/#projects" class="text-sm transition-colors hover:text-[var(--text)]" style="color: var(--text-muted);">Projects</a>
					<a href="{base}/#terminal" class="text-sm transition-colors hover:text-[var(--text)]" style="color: var(--text-muted);">Terminal</a>
				</div>
				<div class="flex flex-col gap-2.5">
					<p class="eyebrow mb-0.5">Pages</p>
					<a href="{base}/me"       class="text-sm transition-colors hover:text-[var(--text)]" style="color: var(--text-muted);">About Me</a>
					<a href="{base}/projects" class="text-sm transition-colors hover:text-[var(--text)]" style="color: var(--text-muted);">All Projects</a>
					<a href="{base}/#contact" class="text-sm transition-colors hover:text-[var(--text)]" style="color: var(--text-muted);">Contact</a>
				</div>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="mt-10 pt-6" style="border-top: 1px solid var(--border);">
			<div class="flex flex-col gap-1 sm:flex-row sm:justify-between">
				<p class="text-xs" style="color: var(--text-faint);">&copy; {year} Matt Huesman. All rights reserved.</p>
				<p class="text-xs font-mono" style="color: var(--text-faint);">Built with SvelteKit &amp; WASM</p>
			</div>
		</div>
	</div>
</footer>
