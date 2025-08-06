<script>
	export let href = '#';
</script>

<a {href} class="group relative ml-4 text-gray-200 transition-colors duration-300 hover:text-white">
	<span
		class="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-white opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100"
	></span>
	<slot />
</a>
