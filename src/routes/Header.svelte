<script>
	import profile from '$lib/images/profile.png';
</script>

<nav class="sticky top-0 w-[100vw] bg-[#171717] px-6">
	<div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between">
		<div class="flex items-center">
			<img src={profile} alt="Profile" class="mr-3 h-10 w-10 rounded-full" />
			<a href="./" class="text-2xl font-bold text-white">Matt Huesman</a>
		</div>
		<div class="flex space-x-4">
			<slot></slot>
		</div>
	</div>
</nav>
