<script>
	import { onMount, onDestroy } from "svelte";

	const words = ["Design.", "Make.", "Break."];
	let currentIndex = 0;
	let canvas, ctx;
	let interval;

	let particlePool = [];
	let activeParticles = [];
	let scattering = false;
	let reassembling = false;

	onMount(() => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		ctx = canvas.getContext("2d");

		drawWord(words[currentIndex]);
		animate();

		interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % words.length;
			scatterParticles();
		}, 3000);
	});

	onDestroy(() => clearInterval(interval));

	function drawWord(text) {
		// Offscreen canvas for pixel sampling
		const off = document.createElement("canvas");
		const offCtx = off.getContext("2d");
		off.width = canvas.width;
		off.height = canvas.height;
		offCtx.fillStyle = "#fff";
		offCtx.textAlign = "center";
		offCtx.font = "bold 260px Inter";
		offCtx.fillText(text, canvas.width / 2, canvas.height / 2);
		const data = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;

		// Extract bright pixel positions
		const positions = [];
		for (let y = 0; y < canvas.height; y += 4) {
			for (let x = 0; x < canvas.width; x += 4) {
				const alpha = data[(y * canvas.width + x) * 4 + 3];
				if (alpha > 128) positions.push({ x, y });
			}
		}

		// Adjust activeParticles length to match positions
		// Fade out unused particles and create new particles with fade-in
		if (activeParticles.length < positions.length) {
			let needed = positions.length - activeParticles.length;
			for (let i = 0; i < needed; i++) {
				let p;
				if (particlePool.length > 0) {
					p = particlePool.pop();
					p.alpha = 0;
					p.vx = 0;
					p.vy = 0;
				} else {
					p = {
						x: Math.random() * canvas.width,
						y: Math.random() * canvas.height,
						tx: 0,
						ty: 0,
						vx: 0,
						vy: 0,
						alpha: 0
					};
				}
				activeParticles.push(p);
			}
		} else if (activeParticles.length > positions.length) {
			let excess = activeParticles.length - positions.length;
			for (let i = 0; i < excess; i++) {
				let p = activeParticles.pop();
				particlePool.push(p);
			}
		}

		// Assign new target positions to active particles
		for (let i = 0; i < activeParticles.length; i++) {
			const p = activeParticles[i];
			const t = positions[i];
			p.tx = t.x;
			p.ty = t.y;
		}
	}

	function scatterParticles() {
		scattering = true;
		reassembling = false;
		for (const p of activeParticles) {
			p.scatterTime = 0;
			p.scatterDuration = 60; // 60 to 120 frames
			const angle = Math.random() * 2 * Math.PI;
			p.scatterDir = angle;
			const speed = Math.random() * 1 + 0.5;
			p.vx = Math.cos(angle) * speed;
			p.vy = Math.sin(angle) * speed;
		}
		// Fade out excess particles in pool
		for (const p of particlePool) {
			if (p.alpha > 0) {
				p.alpha -= 0.02;
				if (p.alpha < 0) p.alpha = 0;
			}
		}
	}

	function normalized_gradient(x, y, width, height) {
		const nx = width > 0 ? x / width : 0;
		const ny = height > 0 ? y / height : 0;
		const i = (nx + ny) / 2;

		const c1 = { r: 6, g: 182, b: 212 }; // #06b6d4
		const c2 = { r: 124, g: 58, b: 237 }; // #7c3aed
		const c3 = { r: 249, g: 115, b: 22 }; // #f97316
		let r, g, b;

		if (i < 0.5) {
			// interpolate between c1 and c2
			let t = i / 0.5;
			r = Math.round(c1.r + t * (c2.r - c1.r));
			g = Math.round(c1.g + t * (c2.g - c1.g));
			b = Math.round(c1.b + t * (c2.b - c1.b));
		} else {
			// interpolate between c2 and c3
			let t = (i - 0.5) / 0.5;
			r = Math.round(c2.r + t * (c3.r - c2.r));
			g = Math.round(c2.g + t * (c3.g - c2.g));
			b = Math.round(c2.b + t * (c3.b - c2.b));
		}

		// return a valid CSS color string
		return `rgb(${r}, ${g}, ${b})`;
	}

	function animate() {
		requestAnimationFrame(animate);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (scattering) {
			let allDone = true;
			for (const p of activeParticles) {
				p.scatterTime++;
				p.vx += (Math.random() - 0.5) * 0.5;
				p.vy += (Math.random() - 0.5) * 0.5;

				if (p.scatterTime < p.scatterDuration) {
					p.vx *= 1.02;
					p.vy *= 1.02;
					allDone = false;
				}

				p.x += p.vx;
				p.y += p.vy;

				// Removed fading out alpha during scattering, keep alpha constant

				ctx.globalAlpha = p.alpha;
				ctx.fillStyle = normalized_gradient(p.x, p.y, canvas.width, canvas.height);
				ctx.fillRect(p.x, p.y, 2, 2);
				ctx.globalAlpha = 1;
			}
			if (allDone) {
				scattering = false;
				reassembling = true;
			}
		} else if (reassembling) {
			let closeCount = 0;
			for (const p of activeParticles) {
				// Gradually dampen velocity
				p.vx *= 0.98;
				p.vy *= 0.98;

				// Small attraction force toward target
				const dx = p.tx - p.x;
				const dy = p.ty - p.y;
				p.vx += dx * 0.02;
				p.vy += dy * 0.02;

				// Small random drift
				p.vx += (Math.random() - 0.5) * 0.1;
				p.vy += (Math.random() - 0.5) * 0.1;

				p.x += p.vx;
				p.y += p.vy;

				// Fade alpha back in smoothly
				if (p.alpha < 1) {
					p.alpha += 0.02;
					if (p.alpha > 1) p.alpha = 1;
				}

				// Count particles close to target
				if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
					closeCount++;
				}

				ctx.globalAlpha = p.alpha;
				ctx.fillStyle = normalized_gradient(p.x, p.y, canvas.width, canvas.height);
				ctx.fillRect(p.x, p.y, 2, 2);
				ctx.globalAlpha = 1;
			}
			// End reassembling when most particles are close to targets
			if (closeCount > activeParticles.length * 0.9) {
				reassembling = false;
				drawWord(words[currentIndex]);
			}
		} else {
			for (const p of activeParticles) {
				// Update position with velocity
				p.x += p.vx;
				p.y += p.vy;

				// Velocity decay
				p.vx *= 0.45;
				p.vy *= 0.45;

				// Move towards target with some randomness
				const dx = p.tx - p.x;
				const dy = p.ty - p.y;
				p.vx += dx * 0.18;
				p.vy += dy * 0.18;

				// Fade in/out alpha
				if (p.alpha < 1) {
					p.alpha += 0.05;
					if (p.alpha > 1) p.alpha = 1;
				}

				ctx.globalAlpha = p.alpha;
				ctx.fillStyle = normalized_gradient(p.x, p.y, canvas.width, canvas.height);
				ctx.fillRect(p.x, p.y, 2, 2);
				ctx.globalAlpha = 1;
			}
		}
	}
</script>

<canvas bind:this={canvas} class="particle-canvas"></canvas>

<style>
	.particle-canvas {
		display: block;
		background: #030712;
		width: 100%;
        height: 100vh;
	}
</style>