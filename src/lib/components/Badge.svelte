<script lang="ts">
	export type BadgeVariant = 'ok' | 'warn' | 'neutral';

	let {
		label,
		variant = 'neutral',
		icon
	}: {
		label: string;
		variant?: BadgeVariant;
		icon?: string;
	} = $props();
</script>

<span class="badge badge--{variant}">
	{#if icon}
		<i class="{icon} text-[0.65rem]"></i>
	{/if}
	{label}
</span>
