<script>
	import '../routes/Terminal.svelte';
	import Terminal from '../routes/Terminal.svelte';
	import Banner from './Banner.svelte';

	/**
	 * @type {HTMLElement}
	 */
	let dotSection;

	/**
	 * @param {{ clientX: number; clientY: number; }} event
	 */
	// function handleMouseMove(event) {
	// 	if (!dotSection) return;
	// 	const rect = dotSection.getBoundingClientRect();
	// 	const x = event.clientX - rect.left;
	// 	const y = event.clientY - rect.top;

	// 	requestAnimationFrame(() => {
	// 		dotSection.style.setProperty('--mouse-x', `${x}px`);
	// 		dotSection.style.setProperty('--mouse-y', `${y}px`);
	// 		dotSection.style.setProperty('--dot-size', `30px`); // Larger when hovering
	// 	});
	// }
</script>

<Banner></Banner>

<main class="mx-auto max-w-6xl p-6">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- <section
		bind:this={dotSection}
		on:mousemove={handleMouseMove}
		on:mouseleave={() => dotSection.style.setProperty('--dot-size', '20px')}
		class="dot-gradient relative flex h-[400px] w-full items-center justify-center"
	>
		<h1 class="z-10 text-center text-4xl font-bold">Hey! I'm Matt</h1>
	</section> -->

	<!-- <section class="text-center">
		<h2 id="anim-welcome-msg" class="text-4xl font-bold">Hey! I'm Matt</h2>
		<p class="mt-2 text-lg text-gray-600">
			A Computer Engineering student at the University of Minnesota
		</p>
		<div class="mt-6 space-x-6">
			<a href="#projects" class="rounded bg-black px-4 py-3 text-white">See My Work</a>
			<a href="./contact" class="rounded border border-gray-700 px-4 py-3 text-gray-700"
				>Contact Me</a
			>
		</div>
	</section> -->

	<Terminal></Terminal>

	<section id="projects" class="mt-12">
		<h3 class="text-2xl font-semibold">Projects</h3>
		<div class="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2"></div>
	</section>

	<section id="experience" class="mt-12">
		<h3 class="text-2xl font-semibold">Working Experience</h3>
		<div class="mt-4 space-y-4">
			<div class="rounded bg-white p-4 shadow">
				<h4 class="font-semibold">Engineering Intern, Medtronic</h4>
				<p class="text-sm text-gray-500">May 2024 - Present</p>
			</div>
			<div class="rounded bg-white p-4 shadow">
				<h4 class="font-semibold">Student Engineer, Office of Information & Technology UMN</h4>
				<p class="text-sm text-gray-500">October 2023 - May 2024</p>
			</div>
		</div>
	</section>
</main>
