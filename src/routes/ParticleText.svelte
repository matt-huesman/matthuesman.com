<script>
    import { onMount } from 'svelte';
    import { onDestroy } from 'svelte';

    const words = ["Hey", "I'm Matt", "Design", "Create", "Disrupt"];
	let currentIndex = 0;
	let canvas, ctx;
	let interval;
    let px_sample_rate = 4;

	let particlePool = [];
	let activeParticles = [];
    let startTime = 0;
    let duration = 3000; // total scatter→reassemble cycle in ms
    let animating = false;
    let downArrowVisible = false;

	onMount(() => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		ctx = canvas.getContext("2d");

        drawWord(words[currentIndex], true);
		animate();
        
        interval = setInterval(() => {
            if (currentIndex === words.length - 1) downArrowVisible = true;

            currentIndex = (currentIndex + 1) % words.length;
            drawWord(words[currentIndex]);
            scatterParticles();

            if (downArrowVisible) {
                const arrow = document.querySelector('.down-arrow');
                if (arrow) arrow.style.display = 'block';
            }
        }, duration);
	});

	onDestroy(() => clearInterval(interval));

    function drawWord(text, firstTime = false) {
		// Offscreen canvas for pixel sampling
		const off = document.createElement("canvas");
		const offCtx = off.getContext("2d");
		off.width = canvas.width;
		off.height = canvas.height;
		offCtx.fillStyle = "#FFF";
		offCtx.textAlign = "center";
        offCtx.letterSpacing = "0.1em";
		// offCtx.font = " 240px \"Sedgwick Ave Display\"";
        const padding = 100;
        let fontSize = canvas.height / 3; // initial guess
        offCtx.font = `${fontSize}px "Sedgwick Ave Display"`;

        let metrics = offCtx.measureText(text);
        let textWidth = metrics.width;
        let textHeight =
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        // shrink until fits both width and height constraints
        while (
            (textWidth > canvas.width - padding * 2 ||
                textHeight > canvas.height - padding * 2) &&
            fontSize > 10
        ) {
            fontSize *= 0.9;
            offCtx.font = `${fontSize}px "Sedgwick Ave Display"`;
            metrics = offCtx.measureText(text);
            textWidth = metrics.width;
            textHeight =
                metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        }
        offCtx.fillText(text, canvas.width / 2, canvas.height / 2 + textHeight / 2);
		// offCtx.fillText(text, canvas.width / 2, canvas.height / 2);
		const data = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;

		// Extract bright pixel positions
		const positions = [];
		for (let y = 0; y < canvas.height; y += px_sample_rate) {
			for (let x = 0; x < canvas.width; x += px_sample_rate) {
				const alpha = data[(y * canvas.width + x) * 4 + 3];
				if (alpha > 128) positions.push({ x, y });
			}
		}
        
		if (activeParticles.length < positions.length) {
			let delt = positions.length - activeParticles.length;
			for (let i = 0; i < delt; i++) {
				let p;
				if (particlePool.length > 0) {
					p = particlePool.pop();
                    p.alpha = 0;
				} else {
					p = {
						x: positions[i % positions.length].x,
						y: positions[i % positions.length].y,
                        otx: 0,
                        oty: 0,
						tx: positions[i % positions.length].x,
						ty: positions[i % positions.length].y,
						alpha: firstTime ? 1 : 0,
						scatterOffsetX: 0,
						scatterOffsetY: 0
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
            p.otx = p.tx;
            p.oty = p.ty;
			p.tx = t.x;
			p.ty = t.y;
		}
	}

    function scatterParticles() {
        startTime = performance.now();
        animating = true;
        for (const p of [...activeParticles, ...particlePool]) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * 5;
            p.scatterOffsetX = Math.cos(angle) * radius;
            p.scatterOffsetY = Math.sin(angle) * radius;
        }
    }

	function lerp(a, b, t) {
        if (t <= 0) {
            t = 0.1;
        }
		return a + (b - a) * t;
	}

	function normalized_gradient(x, y, minX, maxX, minY, maxY) {
		const width = maxX - minX;
		const height = maxY - minY;
		const nx = width > 0 ? (x - minX) / width : 0;
		const ny = height > 0 ? (y - minY) / height : 0;
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

    function drawSineWave(ctx, now) {
        const amplitude = 20; // oscillating amplitude
        const frequency = 0.01;
        const baseline = canvas.height - amplitude;

        for (let i = 1; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, baseline);
            for (let x = 0; x < canvas.width; x++) {
                const y = baseline + Math.sin((x - (i * 40)) * (frequency * (i / 20)) + now / 1000) * amplitude - (i * 4);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            ctx.globalAlpha = 1 / i;

            ctx.fillStyle = "#FFFFFF";
            ctx.fill();
        }
    }

	function animate(now = performance.now()) {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSineWave(ctx, now);

        // Compute bounding box of active particles
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of [...activeParticles, ...particlePool]) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        if (animating) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / (duration / 2), 1);
            const scatterFactor = Math.sin(t * Math.PI);

            for (const p of activeParticles) {
                let tx, ty;
                if (elapsed >= (duration / 2) / 2) {
                    tx = p.tx;
                    ty = p.ty;
                    p.alpha = Math.min(1, p.alpha + 0.05);
                } else {
                    tx = p.otx;
                    ty = p.oty;
                }

                const lerpT = 1 - scatterFactor; 
                p.x = lerp(p.x + p.scatterOffsetX * scatterFactor, tx, lerpT);
                p.y = lerp(p.y + p.scatterOffsetY * scatterFactor, ty, lerpT);

                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = normalized_gradient(p.x, p.y, minX, maxX, minY, maxY);
                ctx.fillRect(p.x, p.y, 2, 2);
            }

            for (const p of particlePool) {
                if (p.alpha > 0) {
                    const decayProgress = Math.min(elapsed / duration, 1);
                    const k = 8;
                    const delay = 0.1; // fraction of duration to stay near 1
                    let t = Math.max((decayProgress - delay) / (1 - delay), 0);
                    p.alpha = Math.exp(-k * t);
                    if (p.alpha < 0.1) p.alpha = 0;
                } else {
                    continue;
                }

                const lerpT = 1 - scatterFactor; 
                p.x = lerp(p.x + p.scatterOffsetX * scatterFactor, p.tx, lerpT);
                p.y = lerp(p.y + p.scatterOffsetY * scatterFactor, p.ty, lerpT);

                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = normalized_gradient(p.x, p.y, minX, maxX, minY, maxY);
                ctx.fillRect(p.x, p.y, 2, 2);
            }

            if (elapsed >= duration / 2) animating = false;

        } else {
            for (const p of activeParticles) {
                if (p.alpha < 1) p.alpha += 0.05;
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = normalized_gradient(p.x, p.y, minX, maxX, minY, maxY);
                ctx.fillRect(p.x, p.y, 2, 2);
            }
        }
    }
</script>

<canvas bind:this={canvas} class="particle-canvas">
</canvas>

<button
    type="button"
    class="down-arrow"
    aria-label="Scroll to next section"
    on:click={() => window.scrollBy({ top: window.innerHeight, left: 0, behavior: 'smooth' })}
>
    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#e3e3e3"><path d="M480-200 240-440l56-56 184 183 184-183 56 56-240 240Zm0-240L240-680l56-56 184 183 184-183 56 56-240 240Z"/></svg>
</button>

<style>
	.particle-canvas {
		display: block;
		background: #030712;
        top: 0;
		width: 100%;
        height: 100vh;
    }

    .down-arrow {
        position: absolute;
        display: none;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(0);
        font-size: 48px;
        color: #FFFFFF;
        will-change: transform, opacity;
        animation: float 6000ms ease-in-out infinite;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
    }

    @keyframes float {
        0%   { transform: translateX(-50%) translateY(0); }
        50%  { transform: translateX(-50%) translateY(-14px); }
        100% { transform: translateX(-50%) translateY(0); }
    }
</style>