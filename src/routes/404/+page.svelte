<script>
	let messages = [
		"Oops! This page wandered off.",
		"404: Page not found.",
		"Looks like you took a wrong turn.",
		"The page you're looking for isn't here.",
		"Lost in the portfolio wilderness!"
	];
	let message = messages[Math.floor(Math.random() * messages.length)];
</script>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 70vh;
		text-align: center;
		font-family: 'Montserrat', sans-serif;
	}
	.emoji {
		font-size: 4rem;
		margin-bottom: 1rem;
		animation: bounce 1s infinite alternate;
	}
	@keyframes bounce {
		to { transform: translateY(-10px); }
	}
	.home-link {
		margin-top: 2rem;
		color: #0070f3;
		text-decoration: underline;
		cursor: pointer;
		font-weight: bold;
	}
</style>

<div class="container">
	<div class="emoji">🧭</div>
	<h1>{message}</h1>
	<p>But don't worry, you can always <a class="home-link" href="/">go home</a>!</p>
</div>