<script lang="ts">
	let {
		label,
		number
	}: {
		label: string;
		number?: string;   /* optional section number, e.g. "01" */
	} = $props();
</script>

<p class="eyebrow mb-3">
	{#if number}
		<span class="text-[var(--text-faint)] mr-2">{number}</span>
	{/if}
	{label}
</p>
