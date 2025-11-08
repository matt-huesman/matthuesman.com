<script>
	import { onMount } from 'svelte';
	onMount(() => {
		// Initialize canvas animation here
		const canvas = document.querySelector('canvas');
		const ctx = canvas.getContext('2d');

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}

		window.addEventListener('resize', resize);
		resize();

		let animationFrameId;

		function animate() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			// Add your animation drawing logic here

			animationFrameId = requestAnimationFrame(animate);
		}

		animate();

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationFrameId);
		};
	});
</script>

<section
	class="relative -z-10 flex h-[50vh] w-full items-center justify-center overflow-hidden py-[30vh]"
>
	<canvas> </canvas>
	<!-- <span class="absolute left-0 top-0 w-full h-1/2 bg-[#171717]"></span>
	<div class="absolute left-0 h-full w-full bg-white duration-500">
		{#each Array(6) as _, i}
			<span
				class="absolute top-[-150vh] left-[50%] h-[400vh] w-[400vh] -translate-1/2 transform animate-[spin_15s_linear_infinite] bg-[rgba(20,20,20,0.5)] shadow-[inset_0_0_50px_rgba(44,99,161,0.2)]"
				style="border-radius: {50 - i}%"
			></span>
		{/each}
	</div> -->
	<div class="relative z-[1] text-white">
		<h1 class="bitcount pb-2 text-center text-5xl tracking-wider select-none">Hey, I'm Matt!</h1>
		<p class="bitcount text-center text-xl select-none">Explore my projects and experiences.</p>
	</div>
</section>
