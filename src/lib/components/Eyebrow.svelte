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
		<span style="color: var(--accent); margin-right: 0.5em;">{number}</span>
	{/if}
	{label}
</p>
