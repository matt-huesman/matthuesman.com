<script>
	import { onMount, onDestroy } from 'svelte';

	// ── Configuration ─────────────────────────────────────────────────────
	const WORDS          = ['Builder.', 'Engineer.', 'Explorer.', 'Matt Huesman.'];
	const WORD_INTERVAL  = 3200;    // ms between word changes
	const GRID_SPACING   = 10;      // px between dot centers
	const DOT_ACTIVE_R   = 2.6;     // radius when forming text
	const DOT_REST_R     = 1.6;    // radius when background
	const DOT_ACTIVE_A   = 1.0;     // opacity when forming text
	const DOT_REST_A     = 0.17;    // opacity when background
	const DOT_COLOR      = '#4ecdc4';
	const TAU            = Math.PI * 2;

	// ── Spring physics ────────────────────────────────────────────────────
	const SPRING_TEXT    = 0.12; // 0.18;
	const SPRING_REST    = 0.12; // 0.04;
	const DAMPING        = 0.92;
	const LERP_SPEED     = 0.10;

	// ── Transition explosion ──────────────────────────────────────────────
	const EXPLODE_STRENGTH     = 0.4;   // force magnitude multiplier
	const EXPLODE_DURATION_PCT = 0.10;  // fraction of WORD_INTERVAL explosion lasts
	const EXPLODE_STEP         = 18;    // gradient sample distance (px) — larger = broader push
	const EXPLODE_DURATION     = WORD_INTERVAL * EXPLODE_DURATION_PCT;

	// ── Mouse repulsion ───────────────────────────────────────────────────
	const MOUSE_RADIUS   = 90;
	const MOUSE_STRENGTH = 0.55;

	// ── Arrow ─────────────────────────────────────────────────────────────
	const ARROW_PAD_BOTTOM = 52;   // px from canvas bottom to arrow bottom
	const ARROW_FLOAT_AMP  = 5;    // px float oscillation amplitude
	const ARROW_FLOAT_MS   = 3000; // ms per float cycle

	// Arrow shape: rows top→bottom, values are col offsets from canvas center col
	const ARROW_SHAPE = [
		[-1, 0, 1],			// shaft
		[-1, 0, 1],			// shaft
		[-1, 0, 1],			// shaft
		[-1, 0, 1],			// shaft
		[-1, 0, 1],			// shaft
		[-2, -1, 0, 1, 2],	// 5-wide head
		[-1, 0, 1],			// 3-wide head
		[0],				// tip
	];

	/* // Alt arrow: 2-wide shaft, tip from 4 to 2
	const ARROW_SHAPE = [
		[-1, 0],           // shaft 2 wide
		[-1, 0],           // shaft 2 wide
		[-1, 0],           // shaft 2 wide
		[-2, -1, 0, 1],   // 4-wide head
		[-1, 0],           // 2-wide tip
	];
	*/

	let canvas;
	let ctx;
	let dots        = [];
	let wordIdx     = 0;
	let interval;
	let raf;
	let arrowVisible = false;
	let mouseX = -99999;
	let mouseY = -99999;
	let explodeStart = -Infinity;

	// ── Grid ──────────────────────────────────────────────────────────────
	function buildGrid() {
		dots = [];
		const cols = Math.ceil(canvas.width  / GRID_SPACING) + 1;
		const rows = Math.ceil(canvas.height / GRID_SPACING) + 1;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const gx = col * GRID_SPACING;
				const gy = row * GRID_SPACING;
				dots.push({
					gx, gy,
					cx: gx, cy: gy,
					vx: 0,  vy: 0,
					r:  DOT_REST_R,  targetR: DOT_REST_R,
					a:  DOT_REST_A,  targetA: DOT_REST_A,
					fx: 0,  fy: 0,
					efx: 0, efy: 0,
					isText:  false,
					isArrow: false
				});
			}
		}
	}

	// ── Alpha sampler ─────────────────────────────────────────────────────
	function sampleA(data, x, y, w, h) {
		const px = Math.round(x);
		const py = Math.round(y);
		if (px < 0 || px >= w || py < 0 || py >= h) return 0;
		return data[(py * w + px) * 4 + 3] / 255;
	}

	// ── Arrow hitbox (canvas coords) ──────────────────────────────────────
	function getArrowHitbox() {
		const allOffsets = ARROW_SHAPE.flat();
		const minOff = Math.min(...allOffsets);
		const maxOff = Math.max(...allOffsets);
		const centerX = canvas.width / 2;
		const bottomY = canvas.height - ARROW_PAD_BOTTOM;
		const topY    = bottomY - (ARROW_SHAPE.length - 1) * GRID_SPACING;
		const pad = 10;
		return {
			x: centerX + minOff * GRID_SPACING - pad,
			y: topY - pad,
			w: (maxOff - minOff) * GRID_SPACING + pad * 2,
			h: (ARROW_SHAPE.length - 1) * GRID_SPACING + pad * 2
		};
	}

	// ── Update arrow dot targets ───────────────────────────────────────────
	function updateArrowDots() {
		const centerCol = canvas.width / 2 / GRID_SPACING;
		const bottomRow = (canvas.height - ARROW_PAD_BOTTOM) / GRID_SPACING;
		const topRow    = bottomRow - (ARROW_SHAPE.length - 1);

		const arrowSet = new Set();
		ARROW_SHAPE.forEach((rowOffsets, ri) => {
			const row = Math.round(topRow + ri);
			rowOffsets.forEach(colOffset => {
				arrowSet.add(`${Math.round(centerCol + colOffset)},${row}`);
			});
		});

		for (const dot of dots) {
			if (dot.isText) { dot.isArrow = false; continue; }
			const col = Math.round(dot.gx / GRID_SPACING);
			const row = Math.round(dot.gy / GRID_SPACING);
			dot.isArrow = arrowSet.has(`${col},${row}`);
			if (dot.isArrow) {
				dot.targetR = DOT_ACTIVE_R * 0.8;
				dot.targetA = DOT_ACTIVE_A * 0.8;
				dot.fx = 0;
				dot.fy = 0;
			}
		}
	}

	// ── Text sampling ─────────────────────────────────────────────────────
	function setTargetsFromText(text, explode = false) {
		const off    = document.createElement('canvas');
		off.width    = canvas.width;
		off.height   = canvas.height;
		const offCtx = off.getContext('2d');

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

		offCtx.fillStyle = '#ffffff';
		offCtx.fillText(text, canvas.width / 2, canvas.height / 2);

		const imgData = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;
		const cw = canvas.width;
		const ch = canvas.height;

		for (const dot of dots) {
			dot.isArrow = false;  // reset; updateArrowDots() will restore if needed
			const { gx, gy } = dot;
			if (gx < 0 || gx >= cw || gy < 0 || gy >= ch) continue;

			const alpha = imgData[(Math.round(gy) * cw + Math.round(gx)) * 4 + 3];
			dot.isText  = alpha > 80;

			if (dot.isText) {
				dot.targetR = DOT_ACTIVE_R;
				dot.targetA = DOT_ACTIVE_A;
			} else {
				dot.targetR = DOT_REST_R;
				dot.targetA = DOT_REST_A;

				const edgeMargin = Math.min(cw, ch) * 0.25;
				const distToEdge = Math.min(gx, gy, cw - gx, ch - gy);
				if (distToEdge < edgeMargin) {
					dot.targetA *= Math.max(0, distToEdge / edgeMargin);
				}
			}
		}

		if (explode) {
			explodeStart = performance.now();
			for (const dot of dots) {
				// if (dot.isText) { dot.efx = 0; dot.efy = 0; continue; }
				const { gx, gy } = dot;
				// gradient of text alpha field — negated to push away from text
				const dx = sampleA(imgData, gx + EXPLODE_STEP, gy, cw, ch)
				         - sampleA(imgData, gx - EXPLODE_STEP, gy, cw, ch);
				const dy = sampleA(imgData, gx, gy + EXPLODE_STEP, cw, ch)
				         - sampleA(imgData, gx, gy - EXPLODE_STEP, cw, ch);
				dot.efx = -dx * EXPLODE_STRENGTH;
				dot.efy = -dy * EXPLODE_STRENGTH;
			}
		}
	}

	// ── Combined update ───────────────────────────────────────────────────
	function updateTargets(text, explode = false) {
		setTargetsFromText(text, explode);
		if (arrowVisible) updateArrowDots();
	}

	// ── Animation loop ────────────────────────────────────────────────────
	function animate() {
		raf = requestAnimationFrame(animate);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = DOT_COLOR;

		const now = performance.now();
		const floatY = arrowVisible
			? Math.sin((now / ARROW_FLOAT_MS) * TAU) * ARROW_FLOAT_AMP
			: 0;
		const explodeT = Math.max(0, 1 - (now - explodeStart) / EXPLODE_DURATION);

		for (const dot of dots) {
			const k = (dot.isText || dot.isArrow) ? SPRING_TEXT : SPRING_REST;

			const mdx   = dot.cx - mouseX;
			const mdy   = dot.cy - mouseY;
			const dist2 = mdx * mdx + mdy * mdy;
			let mfx = 0, mfy = 0;
			if (dist2 < MOUSE_RADIUS * MOUSE_RADIUS && dist2 > 1) {
				const dist    = Math.sqrt(dist2);
				const falloff = (1 - dist / MOUSE_RADIUS);
				const force   = MOUSE_STRENGTH * falloff / dist;
				mfx = mdx * force;
				mfy = mdy * force;
			}

			const homeY = dot.isArrow ? dot.gy + floatY : dot.gy;
			dot.vx = dot.vx * DAMPING + k * (dot.gx  - dot.cx) + dot.fx + mfx + dot.efx * explodeT;
			dot.vy = dot.vy * DAMPING + k * (homeY   - dot.cy) + dot.fy + mfy + dot.efy * explodeT;
			dot.cx += dot.vx;
			dot.cy += dot.vy;

			dot.r += (dot.targetR - dot.r) * LERP_SPEED;
			dot.a += (dot.targetA - dot.a) * LERP_SPEED;

			if (dot.a < 0.008 || dot.r < 0.08) continue;

			ctx.globalAlpha = dot.a;
			ctx.beginPath();
			ctx.arc(dot.cx, dot.cy, dot.r, 0, TAU);
			ctx.fill();
		}

		ctx.globalAlpha = 1;
	}

	// ── Mouse tracking ────────────────────────────────────────────────────
	function handleMouseMove(e) {
		const rect = canvas.getBoundingClientRect();
		mouseX = (e.clientX - rect.left) * (canvas.width  / rect.width);
		mouseY = (e.clientY - rect.top)  * (canvas.height / rect.height);

		if (arrowVisible) {
			const hb = getArrowHitbox();
			canvas.style.cursor =
				mouseX >= hb.x && mouseX <= hb.x + hb.w &&
				mouseY >= hb.y && mouseY <= hb.y + hb.h
					? 'pointer' : '';
		}
	}

	function handleMouseLeave() {
		mouseX = -99999;
		mouseY = -99999;
		canvas.style.cursor = '';
	}

	// ── Canvas click ──────────────────────────────────────────────────────
	function handleCanvasClick(e) {
		if (!arrowVisible) return;
		const rect = canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) * (canvas.width  / rect.width);
		const y = (e.clientY - rect.top)  * (canvas.height / rect.height);
		const hb = getArrowHitbox();
		if (x >= hb.x && x <= hb.x + hb.w && y >= hb.y && y <= hb.y + hb.h) {
			window.scrollBy({ top: window.innerHeight - window.scrollY, behavior: 'smooth' });
		}
	}

	// ── Resize ────────────────────────────────────────────────────────────
	function handleResize() {
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
		
		buildGrid();
		updateTargets(WORDS[wordIdx]);
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
		canvas.addEventListener('mousemove',  handleMouseMove);
		canvas.addEventListener('mouseleave', handleMouseLeave);
		canvas.addEventListener('click',      handleCanvasClick);

		interval = setInterval(() => {
			wordIdx = (wordIdx + 1) % WORDS.length;
			if (wordIdx === WORDS.length - 1) arrowVisible = true;
			updateTargets(WORDS[wordIdx], true);
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

<canvas bind:this={canvas} class="dot-canvas" aria-label="Interactive particle animation. Click the arrow at the bottom to scroll down."></canvas>

<style>
	.dot-canvas {
		display: block;
		width: 100%;
		height: 100vh;
		background: #f5f5f7;
	}
</style>
