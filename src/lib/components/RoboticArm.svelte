<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { ARM, defaultState } from '$lib/robotic_arm/arm';

	// ─── Visual-only configuration ────────────────────────────────────────────
	// Kinematics/structure live in arm.ts. Only rendering concerns belong here.

	export const COLORS = {
		body:    0x3d6491,
		joint:   0x1e3352,
		claw:    0x4d7aab,
		outline: 0x08111e,
		nameFg:  '#c8ddf5',
		nameBg:  '#3d6491',
	};

	const NAME          = 'MATT HUESMAN';
	const OUTLINE_SCALE = 1.07;

	// Convenience aliases into the canonical arm definition
	const { base, segments: [seg0, seg1, seg2], claw } = ARM;

	// Default resting pose derived from joint home angles
	const DEFAULT_STATE = defaultState(ARM);

	// ─── Props ────────────────────────────────────────────────────────────────
	interface Props { class?: string }
	let { class: cls = '' }: Props = $props();

	// ─── Internal refs ────────────────────────────────────────────────────────
	let canvasEl: HTMLCanvasElement;
	let renderer: THREE.WebGLRenderer;
	let scene:    THREE.Scene;
	let camera:   THREE.PerspectiveCamera;
	let animId:   number;
	let ro:       ResizeObserver;
	let gmap:     THREE.DataTexture;

	// The three rotating pivot groups — one per joint
	let j0: THREE.Group; // base yaw   (rotates Y)
	let j1: THREE.Group; // shoulder   (rotates Z)
	let j2: THREE.Group; // elbow      (rotates Z)

	// Claw finger groups — rotated to open/close
	let clawL: THREE.Group;
	let clawR: THREE.Group;

	// Invisible marker at the very tip of the claw — used for IK queries
	let clawTip: THREE.Group;

	// ─── Public API ───────────────────────────────────────────────────────────

	/**
	 * Set a single joint angle in radians.
	 *   index 0 — base yaw    (rotates around Y)
	 *   index 1 — shoulder    (rotates around Z)
	 *   index 2 — elbow       (rotates around Z)
	 */
	export function setJoint(index: 0 | 1 | 2, radians: number): void {
		if (!j0) return;
		if (index === 0) j0.rotation.y = radians;
		if (index === 1) j1.rotation.z = radians;
		if (index === 2) j2.rotation.z = radians;
	}

	/** Set all three joint angles at once — [yaw, shoulder, elbow] */
	export function setJoints(angles: readonly [number, number, number]): void {
		setJoint(0, angles[0]);
		setJoint(1, angles[1]);
		setJoint(2, angles[2]);
	}

	/** Read the current joint angles — [yaw, shoulder, elbow] */
	export function getJoints(): [number, number, number] {
		if (!j0) return DEFAULT_STATE.angles as [number, number, number];
		return [j0.rotation.y, j1.rotation.z, j2.rotation.z];
	}

	/** World-space position of the claw tip (end effector). Useful for IK. */
	export function getEndEffectorPosition(): THREE.Vector3 {
		const v = new THREE.Vector3();
		clawTip?.getWorldPosition(v);
		return v;
	}

	/**
	 * Open or close the claw.
	 *   t = 0  →  closed
	 *   t = 1  →  fully open
	 */
	export function setClawOpen(t: number): void {
		if (!clawL) return;
		const a = Math.max(0, Math.min(1, t)) * claw.maxOpenAngle;
		clawL.rotation.z =  a;
		clawR.rotation.z = -a;
	}

	// ─── Geometry / material factories ───────────────────────────────────────

	function makeGradientMap(): THREE.DataTexture {
		// 3-stop toon gradient: shadow → midtone → highlight
		const data = new Uint8Array([0, 128, 255]);
		const tex  = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
		tex.needsUpdate = true;
		return tex;
	}

	function toon(color: number, map?: THREE.Texture): THREE.MeshToonMaterial {
		return new THREE.MeshToonMaterial({ color, gradientMap: gmap, map });
	}

	function outlineMat(): THREE.MeshBasicMaterial {
		return new THREE.MeshBasicMaterial({ color: COLORS.outline, side: THREE.BackSide });
	}

	/**
	 * Create a mesh with a BackSide outline child, then add it to `parent`.
	 * The outline is a child of the mesh so it inherits the same transform.
	 */
	function part(
		geo:    THREE.BufferGeometry,
		color:  number,
		parent: THREE.Object3D,
		map?:   THREE.Texture,
	): THREE.Mesh {
		const mesh    = new THREE.Mesh(geo, toon(color, map));
		const outline = new THREE.Mesh(geo, outlineMat());
		outline.scale.setScalar(OUTLINE_SCALE);
		mesh.add(outline);
		parent.add(mesh);
		return mesh;
	}

	function cyl(rTop: number, rBot: number, h: number): THREE.CylinderGeometry {
		return new THREE.CylinderGeometry(rTop, rBot, h, 28, 1);
	}

	function sph(r: number): THREE.SphereGeometry {
		return new THREE.SphereGeometry(r, 24, 18);
	}

	function makeNameTexture(): THREE.CanvasTexture {
		const W = 512, H = 512;
		const cv  = document.createElement('canvas');
		cv.width  = W;
		cv.height = H;
		const ctx = cv.getContext('2d')!;

		// Background — matches arm body color
		ctx.fillStyle = COLORS.nameBg;
		ctx.fillRect(0, 0, W, H);

		// Name text — drawn horizontally, will be rotated on the mesh
		ctx.fillStyle    = COLORS.nameFg;
		ctx.font         = 'bold 56px "Courier New", monospace';
		ctx.textAlign    = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(NAME, W / 2, H / 2);

		const tex = new THREE.CanvasTexture(cv);
		tex.rotation = Math.PI / 2; // Rotate texture 90° to display vertically
		tex.center.set(0.5, 0.5);
		return tex;
	}

	// ─── Arm scene graph ──────────────────────────────────────────────────────

	function buildArm() {
		// Base pedestal (fixed, does not rotate)
		const baseMesh = part(cyl(base.radius, base.radius * 1.3, base.height), COLORS.joint, scene);
		baseMesh.position.y = base.height / 2;

		// ── Joint 0: base yaw  (rotates around Y) ────────────────────────────
		j0 = new THREE.Group();
		j0.position.y = base.height;
		scene.add(j0);
		part(sph(seg0.joint.visualRadius), COLORS.joint, j0);

		// Link 0: upper arm — name engraved via canvas texture
		const l0     = new THREE.Group();
		j0.add(l0);
		const l0Mesh = part(cyl(seg0.link.radius, seg0.link.radius, seg0.link.length), COLORS.body, l0, makeNameTexture());
		l0Mesh.position.y = seg0.link.length / 2;

		// ── Joint 1: shoulder pitch  (rotates around Z) ───────────────────────
		j1 = new THREE.Group();
		j1.position.y = seg0.link.length;
		j0.add(j1);
		part(sph(seg1.joint.visualRadius), COLORS.joint, j1);

		// Link 1: forearm
		const l1     = new THREE.Group();
		j1.add(l1);
		const l1Mesh = part(cyl(seg1.link.radius, seg1.link.radius, seg1.link.length), COLORS.body, l1);
		l1Mesh.position.y = seg1.link.length / 2;

		// ── Joint 2: elbow pitch  (rotates around Z) ──────────────────────────
		j2 = new THREE.Group();
		j2.position.y = seg1.link.length;
		j1.add(j2);
		part(sph(seg2.joint.visualRadius), COLORS.joint, j2);

		// Link 2: wrist
		const l2     = new THREE.Group();
		j2.add(l2);
		const l2Mesh = part(cyl(seg2.link.radius, seg2.link.radius, seg2.link.length), COLORS.body, l2);
		l2Mesh.position.y = seg2.link.length / 2;

		// ── Claw ──────────────────────────────────────────────────────────────
		const clawBase = new THREE.Group();
		clawBase.position.y = seg2.link.length;
		j2.add(clawBase);
		part(sph(claw.knuckleRadius), COLORS.joint, clawBase);

		clawL = new THREE.Group();
		clawR = new THREE.Group();
		clawL.position.set(-claw.fingerSpread, 0, 0);
		clawR.position.set( claw.fingerSpread, 0, 0);
		clawBase.add(clawL, clawR);

		// Fingers — tapered cylinders (wider at base)
		const fingerGeo = cyl(claw.fingerRadius * 0.45, claw.fingerRadius, claw.fingerLength);
		[clawL, clawR].forEach(g => {
			const f = part(fingerGeo, COLORS.claw, g);
			f.position.y = claw.fingerLength / 2;
		});

		// Invisible end-effector marker — getWorldPosition() target for IK
		clawTip = new THREE.Group();
		clawTip.position.y = claw.fingerLength;
		clawBase.add(clawTip);

		// Apply default pose
		setJoints(DEFAULT_STATE.angles as [number, number, number]);
	}

	// ─── Renderer ─────────────────────────────────────────────────────────────

	function init() {
		gmap = makeGradientMap();

		const w = canvasEl.clientWidth;
		const h = canvasEl.clientHeight;

		renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		renderer.setSize(w, h, false);
		renderer.setClearColor(0x000000, 0); // transparent background

		scene  = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
		camera.position.set(2.8, 2.0, 5.8);
		camera.lookAt(0, 1.3, 0);

		// Lighting — directional from top-right gives crisp toon step contrast
		scene.add(new THREE.AmbientLight(0xffffff, 0.5));
		const sun = new THREE.DirectionalLight(0xffffff, 1.4);
		sun.position.set(5, 9, 4);
		scene.add(sun);

		buildArm();
	}

	function loop() {
		animId = requestAnimationFrame(loop);
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

	onMount(() => {
		init();
		loop();
		ro = new ResizeObserver(onResize);
		ro.observe(canvasEl);
	});

	onDestroy(() => {
		if (!renderer) return; // SSR: onMount never ran, nothing to clean up
		cancelAnimationFrame(animId);
		ro?.disconnect();
		// Dispose all Three.js resources
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

<canvas bind:this={canvasEl} class={cls} style="display:block; width:100%; height:100%;"></canvas>