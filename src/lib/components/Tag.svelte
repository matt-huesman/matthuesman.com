<script lang="ts">
	/** Rotates through the three non-warn pastel colors. Pass an index to cycle. */
	let {
		label,
		colorIndex = 0
	}: {
		label: string;
		colorIndex?: number;
	} = $props();

	const colors = ['teal', 'yellow', 'green'] as const;
	const color = colors[colorIndex % colors.length];
</script>

<span class="tag tag--{color}">{label}</span>
