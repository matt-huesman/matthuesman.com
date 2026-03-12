<script lang="ts">
	let {
		variant = 'hairline',
		spacing = 'none'
	}: {
		variant?: 'hairline' | 'spacer';
		spacing?: 'none' | 'sm' | 'md';
	} = $props();

	const spacingClass = {
		none: '',
		sm: 'my-8',
		md: 'my-16'
	}[spacing];
</script>

{#if variant === 'hairline'}
	<hr class="hairline border-0 {spacingClass}" aria-hidden="true" />
{:else}
	<div class="{spacingClass}" aria-hidden="true"></div>
{/if}
