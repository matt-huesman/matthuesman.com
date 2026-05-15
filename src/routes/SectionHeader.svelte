<script lang="ts">
	let {
		label,
		title,
		subtitle,
		align = 'left',
		number
	}: {
		label: string;
		title: string;
		subtitle?: string;
		align?: 'left' | 'center';
		number?: string;
	} = $props();

	const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';
</script>

<div class="flex flex-col {alignClass} mb-12">
	<!-- Eyebrow -->
	<p class="eyebrow mb-3">
		{#if number}
			<span style="color: var(--accent); margin-right: 0.5em;">{number}</span>
		{/if}
		{label}
	</p>

	<!-- Title + accent underline -->
	<h2 class="section-title relative">
		{title}
		<span
			class="absolute -bottom-3 h-0.5 rounded-full"
			class:left-0={align !== 'center'}
			style="width: 2.5rem; background: var(--accent); {align === 'center' ? 'left: 50%; transform: translateX(-50%);' : ''}"
		></span>
	</h2>

	{#if subtitle}
		<p class="body-lead mt-6 max-w-xl">{subtitle}</p>
	{/if}
</div>
