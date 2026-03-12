<script>
	import { onMount, onDestroy } from 'svelte';

	// ── Configuration (tweak these to adjust the look) ──────────────────
	const WORDS          = ['Engineer.', 'Builder.', 'Matt Huesman.'];
	const WORD_INTERVAL  = 3200;   // ms between word changes
	const GRID_SPACING   = 13;     // px between dot centers
	const DOT_ACTIVE_R   = 3.6;    // radius when forming text
	const DOT_REST_R     = 1.85;   // radius when background
	const DOT_ACTIVE_A   = 1.0;    // opacity when forming text
	const DOT_REST_A     = 0.27;   // opacity when background (nearly invisible → "close to bg")
	const LERP_SPEED     = 0.12;  // 0–1, how fast dots lerp per frame
	const DOT_COLOR      = '#4ECDC4'; // --accent-teal
	const BG_COLOR       = '#f5f5f7'; // --bg
	const TAU            = Math.PI * 2;

	let canvas;
	let ctx;
	let dots    = [];
	let wordIdx = 0;
	let interval;
	let raf;
	let downArrowVisible = false;

	// ── Grid ─────────────────────────────────────────────────────────────
	function buildGrid() {
		dots = [];
		const cols = Math.ceil(canvas.width  / GRID_SPACING) + 1;
		const rows = Math.ceil(canvas.height / GRID_SPACING) + 1;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				dots.push({
					x:       col * GRID_SPACING,
					y:       row * GRID_SPACING,
					r:       DOT_REST_R,
					targetR: DOT_REST_R,
					a:       DOT_REST_A,
					targetA: DOT_REST_A
				});
			}
		}
	}

	// ── Text sampling — determines which dots "light up" ─────────────────
	function setTargetsFromText(text) {
		const off    = document.createElement('canvas');
		off.width    = canvas.width;
		off.height   = canvas.height;
		const offCtx = off.getContext('2d');

		// Size text to ~28% of canvas height, clamped to canvas width
		const padding = Math.min(canvas.width, canvas.height) * 0.10;
		let fontSize  = canvas.height * 0.28;
		offCtx.textAlign    = 'center';
		offCtx.textBaseline = 'middle';
		offCtx.font         = `700 ${fontSize}px 'Inter', -apple-system, sans-serif`;

		let w = offCtx.measureText(text).width;
		while (w > canvas.width - padding * 2 && fontSize > 10) {
			fontSize *= 0.92;
			offCtx.font = `700 ${fontSize}px 'Inter', -apple-system, sans-serif`;
			w           = offCtx.measureText(text).width;
		}

		// Draw white text on transparent background for alpha-channel sampling
		offCtx.fillStyle = '#ffffff';
		offCtx.fillText(text, canvas.width / 2, canvas.height / 2);

		const data = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;

		for (const dot of dots) {
			const px  = Math.round(dot.x);
			const py  = Math.round(dot.y);
			if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;
			// Sample the alpha channel — white text → alpha > 0; transparent bg → alpha = 0
			const sampled = data[(py * canvas.width + px) * 4 + 3];
			if (sampled > 80) {
				dot.targetR = DOT_ACTIVE_R;
				dot.targetA = DOT_ACTIVE_A;
			} else {
				dot.targetR = DOT_REST_R;
				dot.targetA = DOT_REST_A;
				
				// Edge fade: dots near canvas edges become more transparent
				const edgeMargin = Math.min(canvas.width, canvas.height) * 0.25;
				const distToEdge = Math.min(
					dot.x,
					dot.y,
					canvas.width - dot.x,
					canvas.height - dot.y
				);
				
				if (distToEdge < edgeMargin) {
					const edgeFade = Math.max(0, distToEdge / edgeMargin);
					dot.targetA *= edgeFade;
				}
			}
		}
	}

	// ── Animation loop ────────────────────────────────────────────────────
	function animate() {
		raf = requestAnimationFrame(animate);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = DOT_COLOR;

		for (const dot of dots) {
			// Lerp toward targets
			dot.r += (dot.targetR - dot.r) * LERP_SPEED;
			dot.a += (dot.targetA - dot.a) * LERP_SPEED;

			// Skip dots that are effectively invisible (perf optimisation)
			if (dot.a < 0.008 || dot.r < 0.08) continue;

			ctx.globalAlpha = dot.a;
			ctx.beginPath();
			ctx.arc(dot.x, dot.y, dot.r, 0, TAU);
			ctx.fill();
		}

		ctx.globalAlpha = 1;
	}

	// ── Resize ────────────────────────────────────────────────────────────
	function handleResize() {
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
		buildGrid();
		setTargetsFromText(WORDS[wordIdx]);
	}

	// ── Lifecycle ─────────────────────────────────────────────────────────
	onMount(() => {
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
		ctx           = canvas.getContext('2d');

		buildGrid();
		setTargetsFromText(WORDS[wordIdx]);
		animate();

		window.addEventListener('resize', handleResize);

		interval = setInterval(() => {
			wordIdx = (wordIdx + 1) % WORDS.length;
			setTargetsFromText(WORDS[wordIdx]);
			if (wordIdx === WORDS.length - 1) downArrowVisible = true;
		}, WORD_INTERVAL);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			clearInterval(interval);
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', handleResize);
		}
	});
</script>

<canvas bind:this={canvas} class="dot-canvas" aria-hidden="true"></canvas>

<button
	type="button"
	class="scroll-cue"
	class:visible={downArrowVisible}
	aria-label="Scroll down"
	onclick={() => window.scrollBy({ top: window.innerHeight, left: 0, behavior: 'smooth' })}
>
	<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8.5" y="0" width="3" height="16" rx="1.5" fill="currentColor" opacity="0.3"/>
		<path d="M1 17 L10 26 L19 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>
</button>

<style>
	.dot-canvas {
		display: block;
		width: 100%;
		height: 100vh;
		background: #f5f5f7;
	}

	.scroll-cue {
		position: absolute;
		bottom: 48px;
		left: 50%;
		transform: translateX(-50%) translateY(8px);
		background: transparent;
		border: none;
		cursor: pointer;
		color: #1d1d1f;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.8s ease,
			transform 0.6s ease;
		padding: 8px;
	}

	.scroll-cue.visible {
		opacity: 0.35;
		transform: translateX(-50%) translateY(0);
		pointer-events: auto;
		animation: float 3s ease-in-out infinite;
	}

	.scroll-cue:hover {
		opacity: 0.65;
	}

	@keyframes float {
		0%, 100% { transform: translateX(-50%) translateY(0); }
		50%       { transform: translateX(-50%) translateY(-6px); }
	}
</style>
