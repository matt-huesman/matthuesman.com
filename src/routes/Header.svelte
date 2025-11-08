<script>
	import profile from '$lib/images/profile.png';
</script>

<nav class="fixed top-0 w-full bg-[#030712] px-6">
	<div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between">
		<div class="flex items-center">
			<img src={profile} alt="Profile" class="mr-3 h-10 w-10 rounded-full" />
			<a href="./" class="text-2xl font-bold bg-clip-text text-transparent" style="background: linear-gradient(135deg, rgb(6,182,212), rgb(124,58,237), rgb(249,115,22)); -webkit-background-clip: text; background-clip: text; color: transparent;">Matt Huesman</a>
		</div>
		<div class="flex space-x-4">
			<slot></slot>
		</div>
	</div>
</nav>
