<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { initArmPython, stepArm, setIKTarget, isArmReady, onArmReady } from '$lib/wasm/arm_python';

	// ─── Constants ────────────────────────────────────────────────────────────

	/**
	 * Scale factor: Python arm is in metres (Z-up), Three.js scene is in
	 * world units (Y-up).  5× makes the arm roughly fill the existing viewport.
	 */
	const PY_SCALE = 5.0;

	/** Maximum reach of the Python arm in metres (0.30 + 0.25 + 0.10 + wrist). */
	const MAX_REACH = 0.58;
	const MIN_REACH = 0.15;

	const JOINT_RADIUS = 0.10;
	const LINK_RADIUS  = 0.07;

	// Joint/link colours — default blue used while Pyodide is loading
	const DEFAULT_COLOR   = 0x3d6491;
	const JOINT_BASE_COLOR = 0x1e3352;
	const OUTLINE_COLOR   = 0x08111e;
	const OUTLINE_SCALE   = 1.08;

	// ─── Props ────────────────────────────────────────────────────────────────
	interface Props { class?: string }
	let { class: cls = '' }: Props = $props();

	// ─── State ────────────────────────────────────────────────────────────────
	let pyReady = $state(false);

	// ─── Internal refs ────────────────────────────────────────────────────────
	let canvasEl:  HTMLCanvasElement;
	let renderer:  THREE.WebGLRenderer;
	let scene:     THREE.Scene;
	let camera:    THREE.PerspectiveCamera;
	let animId:    number;
	let ro:        ResizeObserver;
	let gmap:      THREE.DataTexture;

	// Position-driven arm geometry: 7 links + 7 joints + base sphere
	// Allocated once in buildArm(), updated every frame from Python FK data.
	let linkMeshes:  THREE.Mesh[] = [];
	let jointMeshes: THREE.Mesh[] = [];
	let baseMesh:    THREE.Mesh;

	// Per-joint toon materials (one per joint so we can tint them individually)
	let linkMats:  THREE.MeshToonMaterial[] = [];
	let jointMats: THREE.MeshToonMaterial[] = [];

	// Mouse-tracking state for IK target
	let lastTarget: THREE.Vector3 = new THREE.Vector3(0.3, 0.5, 0);
	const _raycaster = new THREE.Raycaster();
	const _ikPlane   = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

	// ─── Coordinate transform ─────────────────────────────────────────────────

	/**
	 * Convert Python world-space position (metres, Z-up) to Three.js (Y-up, scaled).
	 *   py  [x, y, z]  →  threejs  [x*s, z*s, y*s]
	 */
	function pyToThree(pos: [number, number, number]): THREE.Vector3 {
		return new THREE.Vector3(pos[0] * PY_SCALE, pos[2] * PY_SCALE, pos[1] * PY_SCALE);
	}

	/**
	 * Convert a Three.js canvas pointer position to a Python IK target.
	 * The arm lives in the XZ plane (Python Y=0), so we shoot a ray from
	 * the camera and intersect the Y=0 plane in Three.js (= Python Z=0
	 * after axis swap), then convert back to Python space.
	 */
	function screenToIKTarget(clientX: number, clientY: number): void {
		if (!camera || !canvasEl) return;

		const rect = canvasEl.getBoundingClientRect();
		const ndcX =  ((clientX - rect.left)  / rect.width)  * 2 - 1;
		const ndcY = -((clientY - rect.top)   / rect.height) * 2 + 1;

		_raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

		// Python Y=0 → Three.js Z=0 (our coord swap); intersect that plane
		const target = new THREE.Vector3();
		const hit    = _raycaster.ray.intersectPlane(_ikPlane, target);
		if (!hit) return; // ray parallel to plane — ignore

		// Convert back to Python space: [x/s, z/s, y/s] (inverse of pyToThree)
		const pyX =  target.x / PY_SCALE;
		const pyY =  target.z / PY_SCALE;  // Three.js Z → Python Y
		const pyZ =  target.y / PY_SCALE;  // Three.js Y → Python Z

		// Clamp to reachable shell (XZ plane in Python = XY plane here)
		const dist = Math.sqrt(pyX * pyX + pyZ * pyZ);
		let cx = pyX, cz = pyZ;
		if (dist > MAX_REACH)      { cx = pyX / dist * MAX_REACH; cz = pyZ / dist * MAX_REACH; }
		else if (dist < MIN_REACH && dist > 0) { cx = pyX / dist * MIN_REACH; cz = pyZ / dist * MIN_REACH; }

		lastTarget.set(cx * PY_SCALE, cz * PY_SCALE, pyY * PY_SCALE);
		setIKTarget(cx, pyY, cz);
	}

	// ─── Material / geometry helpers ──────────────────────────────────────────

	function makeGradientMap(): THREE.DataTexture {
		const data = new Uint8Array([0, 128, 255]);
		const tex  = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
		tex.needsUpdate = true;
		return tex;
	}

	function toon(hex: number): THREE.MeshToonMaterial {
		return new THREE.MeshToonMaterial({ color: hex, gradientMap: gmap });
	}

	function outlineMat(): THREE.MeshBasicMaterial {
		return new THREE.MeshBasicMaterial({ color: OUTLINE_COLOR, side: THREE.BackSide });
	}

	/** Create a mesh + BackSide outline child, add to parent, return mesh. */
	function meshWithOutline(
		geo: THREE.BufferGeometry,
		mat: THREE.MeshToonMaterial,
		parent: THREE.Object3D,
	): THREE.Mesh {
		const mesh    = new THREE.Mesh(geo, mat);
		const outline = new THREE.Mesh(geo, outlineMat());
		outline.scale.setScalar(OUTLINE_SCALE);
		mesh.add(outline);
		parent.add(mesh);
		return mesh;
	}

	// ─── Arm scene graph ──────────────────────────────────────────────────────

	/**
	 * Allocate all joint spheres and link cylinders once.
	 * Their positions/orientations are updated every frame in applyFKResult().
	 *
	 * We use unit-height cylinders (height = 1) and scale Y each frame to
	 * match the distance between consecutive joint positions.
	 */
	function buildArm() {
		const sphereGeo = new THREE.SphereGeometry(JOINT_RADIUS, 20, 16);
		// Unit cylinder (height=1, centred at origin) — scaled per frame
		const cylGeo    = new THREE.CylinderGeometry(LINK_RADIUS, LINK_RADIUS, 1, 20, 1);

		// Base sphere (shoulder / world origin)
		const baseMat = toon(JOINT_BASE_COLOR);
		baseMesh = meshWithOutline(sphereGeo, baseMat, scene);
		baseMesh.position.set(0, 0, 0);

		// 7 joints + 7 links
		for (let i = 0; i < 7; i++) {
			const jMat = toon(DEFAULT_COLOR);
			const lMat = toon(DEFAULT_COLOR);
			jointMats.push(jMat);
			linkMats.push(lMat);
			jointMeshes.push(meshWithOutline(sphereGeo, jMat, scene));
			linkMeshes.push(meshWithOutline(cylGeo,    lMat, scene));
		}
	}

	// ── Frame update helpers ───────────────────────────────────────────────────

	const _up    = new THREE.Vector3(0, 1, 0);
	const _start = new THREE.Vector3();
	const _end   = new THREE.Vector3();
	const _dir   = new THREE.Vector3();
	const _mid   = new THREE.Vector3();

	/** Position and orient a unit-height cylinder between two world points. */
	function placeCylinder(mesh: THREE.Mesh, start: THREE.Vector3, end: THREE.Vector3) {
		_dir.subVectors(end, start);
		const len = _dir.length();
		if (len < 1e-6) { mesh.visible = false; return; }
		mesh.visible = true;
		_mid.addVectors(start, end).multiplyScalar(0.5);
		mesh.position.copy(_mid);
		mesh.scale.set(1, len, 1);
		mesh.quaternion.setFromUnitVectors(_up, _dir.normalize());
	}

	/**
	 * Apply one frame of FK data returned by Python's controller.step().
	 * joint_positions[0] is the shoulder (world origin).
	 * joint_positions[1..7] are the 7 joint frame origins.
	 */
	function applyFKResult(positions: [number, number, number][], colors: string[]) {
		const pts = positions.map(p => pyToThree(p));

		// Base sphere at shoulder
		baseMesh.position.copy(pts[0]);

		for (let i = 0; i < 7; i++) {
			// Joint sphere at position i+1
			jointMeshes[i].position.copy(pts[i + 1]);

			// Tint joints with per-joint colours from Python
			const hex = parseInt(colors[i].replace('#', ''), 16);
			jointMats[i].color.setHex(hex);
			linkMats[i].color.setHex(hex);

			// Link cylinder from position i to i+1
			_start.copy(pts[i]);
			_end.copy(pts[i + 1]);
			placeCylinder(linkMeshes[i], _start, _end);
		}
	}

	// ─── Renderer ─────────────────────────────────────────────────────────────

	function init() {
		gmap = makeGradientMap();

		const w = canvasEl.clientWidth;
		const h = canvasEl.clientHeight;

		renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		renderer.setSize(w, h, false);
		renderer.setClearColor(0x000000, 0);

		scene  = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
		camera.position.set(2.8, 2.0, 5.8);
		camera.lookAt(0, 1.3, 0);

		scene.add(new THREE.AmbientLight(0xffffff, 0.5));
		const sun = new THREE.DirectionalLight(0xffffff, 1.4);
		sun.position.set(5, 9, 4);
		scene.add(sun);

		buildArm();
	}

	let lastTime = 0;

	function loop(now: number) {
		animId = requestAnimationFrame(loop);

		const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50 ms
		lastTime = now;

		if (isArmReady() && dt > 0) {
			const result = stepArm(dt);
			if (result) applyFKResult(result.joint_positions, result.colors);
		}

		renderer.render(scene, camera);
	}

	function onResize() {
		if (!renderer || !camera || !canvasEl) return;
		const w = canvasEl.clientWidth;
		const h = canvasEl.clientHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}

	// ─── Pointer events — IK mouse tracking ──────────────────────────────────

	function handlePointerMove(e: PointerEvent) {
		if (!isArmReady()) return;
		screenToIKTarget(e.clientX, e.clientY);
	}

	function handlePointerEnter(e: PointerEvent) {
		if (!isArmReady()) return;
		screenToIKTarget(e.clientX, e.clientY);
	}

	function handlePointerLeave() {
		// Arm keeps its last IK target when the cursor leaves
	}

	// ─── Lifecycle ────────────────────────────────────────────────────────────

	onMount(() => {
		init();
		lastTime = performance.now();
		loop(lastTime);

		ro = new ResizeObserver(onResize);
		ro.observe(canvasEl);

		// Start loading Pyodide in the background (non-blocking)
		initArmPython()
			.then(() => { pyReady = true; })
			.catch(err => console.error('[RoboticArm] Pyodide init failed:', err));

		// Also subscribe to the ready callback in case initArmPython was
		// already called before this component mounted
		onArmReady(() => { pyReady = true; });
	});

	onDestroy(() => {
		if (!renderer) return;
		cancelAnimationFrame(animId);
		ro?.disconnect();
		const disposed = new Set<THREE.BufferGeometry>();
		scene?.traverse(obj => {
			if (!(obj instanceof THREE.Mesh)) return;
			if (!disposed.has(obj.geometry)) {
				obj.geometry.dispose();
				disposed.add(obj.geometry);
			}
			const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
			mats.forEach(m => m.dispose());
		});
		gmap?.dispose();
		renderer?.dispose();
	});
</script>

<div class="arm-root {cls}">
	<canvas
		bind:this={canvasEl}
		style="display:block; width:100%; height:100%;"
		onpointermove={handlePointerMove}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
	></canvas>

	<!-- Loading overlay — shown until Pyodide + numpy are ready -->
	{#if !pyReady}
		<div class="arm-loading-overlay" aria-live="polite">
			<div class="arm-loading-inner">
				<svg class="arm-spinner" viewBox="0 0 44 44" aria-hidden="true">
					<circle class="arm-spinner-track" cx="22" cy="22" r="18" fill="none" stroke-width="3"/>
					<circle class="arm-spinner-arc"   cx="22" cy="22" r="18" fill="none" stroke-width="3"
						stroke-dasharray="40 72" stroke-linecap="round"/>
				</svg>
				<span class="arm-loading-label">loading python runtime…</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.arm-root {
		position: relative;
		width: 100%;
		height: 100%;
	}

	/* ── Loading overlay ──────────────────────────────────────────────────────── */
	.arm-loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: flex-start;
		padding: 1rem 1.25rem;
		pointer-events: none; /* don't block mouse on canvas beneath */
	}

	.arm-loading-inner {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(13, 17, 23, 0.72);
		border: 1px solid rgba(10, 147, 150, 0.20);
		border-radius: 9999px;
		padding: 0.35rem 0.85rem 0.35rem 0.55rem;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	.arm-loading-label {
		font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		color: rgba(10, 147, 150, 0.85);
	}

	/* ── Spinner ──────────────────────────────────────────────────────────────── */
	.arm-spinner {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.arm-spinner-track {
		stroke: rgba(10, 147, 150, 0.18);
	}

	.arm-spinner-arc {
		stroke: rgba(10, 147, 150, 0.90);
		transform-origin: 22px 22px;
		animation: arm-spin 1.1s linear infinite;
	}

	@keyframes arm-spin {
		to { transform: rotate(360deg); }
	}
</style>
