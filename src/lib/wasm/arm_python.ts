/**
 * arm_python.ts — Pyodide bridge for the Python robotic arm simulation.
 *
 * Architecture
 * ────────────
 * Python drives the simulation loop; TypeScript only calls step().
 *
 *   initArmPython()              — load Pyodide + numpy + Python modules (once)
 *   stepArm(dt)                  — advance one frame, returns render data
 *   setIKTarget(x, y, z)         — point the arm (Python-space metres, Z-up)
 *   clearIKTarget()              — return to rest pose
 *   setTargetAngles(angles)      — direct joint-angle control
 *   isArmReady()                 — true once Pyodide has fully initialised
 *   onReadyCallbacks             — subscribe to the ready event
 *
 * Coordinate conventions
 * ──────────────────────
 * Python uses Z-up (standard robotics).  The caller is responsible for
 * converting to Three.js Y-up before passing targets and after receiving
 * joint positions — the bridge passes values through unchanged so the
 * Python code stays coordinate-system agnostic.
 *
 * Python source files are bundled via Vite's `?raw` import and written
 * to Pyodide's virtual filesystem so they can import each other normally.
 */

import { base } from '$app/paths';

// ── Python source — bundled at build time via Vite ?raw imports ──────────────
import jointPy      from '$lib/robotic_arm/py/joint.py?raw';
import armPy        from '$lib/robotic_arm/py/arm.py?raw';
import fkPy         from '$lib/robotic_arm/py/fk.py?raw';
import jacobianPy   from '$lib/robotic_arm/py/jacobian.py?raw';
import ikPy         from '$lib/robotic_arm/py/ik.py?raw';
import pidPy        from '$lib/robotic_arm/py/pid.py?raw';
import controllerPy from '$lib/robotic_arm/py/controller.py?raw';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Everything the Three.js renderer needs for one frame. */
export interface ArmStepResult {
	/** 8 world-space positions [x,y,z] in Python's Z-up metre space.
	 *  Index 0 = base / shoulder, indices 1-7 = joint frame origins. */
	joint_positions: [number, number, number][];

	/** World-space end-effector position (same coordinate system). */
	end_effector: [number, number, number];

	/** Current joint angles in radians, length 7. */
	angles: number[];

	/** Per-joint hex colours for the renderer, length 7. */
	colors: string[];

	/** Claw openness 0–1 (reserved for future use). */
	claw_open: number;
}

// ── Internal state ────────────────────────────────────────────────────────────

let pyodide: PyodideInterface | null = null;
let controller: any = null;
let ready = false;
let initPromise: Promise<void> | null = null;
const readyCallbacks: Array<() => void> = [];

/** Minimal surface of the Pyodide API that we use. */
interface PyodideInterface {
	loadPackage(name: string | string[]): Promise<void>;
	runPython(code: string): any;
	FS: {
		mkdir(path: string): void;
		writeFile(path: string, data: string): void;
	};
}

// ── Loader ───────────────────────────────────────────────────────────────────

/**
 * Inject pyodide.js as a classic script tag and wait for it to set
 * globalThis.loadPyodide.  This avoids Vite trying to bundle the file.
 */
function injectPyodideScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		if ((globalThis as any).loadPyodide) { resolve(); return; }
		const s = document.createElement('script');
		s.src = `${base}/pyodide/pyodide.js`;
		s.onload  = () => resolve();
		s.onerror = () => reject(new Error('[arm_python] Failed to load /pyodide/pyodide.js — run npm run pyodide:setup first'));
		document.head.appendChild(s);
	});
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Begin loading Pyodide + numpy + the arm Python modules in the background.
 * Safe to call multiple times — loading only happens once.
 * The arm demo is unusable until this resolves; poll isArmReady() or
 * subscribe via onReadyCallbacks.
 */
export function initArmPython(): Promise<void> {
	if (initPromise) return initPromise;

	initPromise = (async () => {
		try {
			// 1. Inject Pyodide loader script
			await injectPyodideScript();

			// 2. Instantiate Pyodide (loads pyodide.asm.wasm + stdlib)
			pyodide = await (globalThis as any).loadPyodide({
				indexURL: `${base}/pyodide/`,
			}) as PyodideInterface;

			// 3. Load numpy (from local static/pyodide/ if present, else CDN fallback)
			await pyodide.loadPackage('numpy');

			// 4. Write all Python source files to the virtual filesystem
			pyodide.FS.mkdir('/robotic_arm');
			const modules: [string, string][] = [
				['joint.py',      jointPy],
				['arm.py',        armPy],
				['fk.py',         fkPy],
				['jacobian.py',   jacobianPy],
				['ik.py',         ikPy],
				['pid.py',        pidPy],
				['controller.py', controllerPy],
			];
			for (const [name, src] of modules) {
				pyodide.FS.writeFile(`/robotic_arm/${name}`, src);
			}

			// 5. Add our module directory to sys.path and instantiate the controller
			pyodide.runPython(`
import sys
sys.path.insert(0, '/robotic_arm')
from controller import ArmController
_arm_ctrl = ArmController()
`);

			controller = pyodide.runPython('_arm_ctrl');
			ready = true;
			readyCallbacks.forEach(cb => cb());
		} catch (err) {
			console.error('[arm_python] Initialisation failed:', err);
			throw err;
		}
	})();

	return initPromise;
}

/** Returns true once Pyodide is fully loaded and the arm controller is ready. */
export function isArmReady(): boolean {
	return ready;
}

/**
 * Register a callback to fire when the arm controller becomes ready.
 * If already ready, the callback fires synchronously on the next microtask.
 */
export function onArmReady(cb: () => void): void {
	if (ready) { Promise.resolve().then(cb); return; }
	readyCallbacks.push(cb);
}

/**
 * Advance the simulation by `dt` seconds and return render data.
 * Returns null if Pyodide is not yet ready.
 */
export function stepArm(dt: number): ArmStepResult | null {
	if (!controller) return null;
	try {
		const raw: string = controller.step(dt);
		return JSON.parse(raw) as ArmStepResult;
	} catch (err) {
		console.error('[arm_python] step() error:', err);
		return null;
	}
}

/**
 * Set the IK target in Python's coordinate system (metres, Z-up).
 * The arm will solve IK and smoothly drive toward the target each frame.
 */
export function setIKTarget(x: number, y: number, z: number): void {
	if (!controller) return;
	try { controller.set_ik_target(x, y, z); } catch { /* not yet ready */ }
}

/** Stop IK and return the arm to its rest pose. */
export function clearIKTarget(): void {
	if (!controller) return;
	try { controller.clear_ik_target(); } catch { /* not yet ready */ }
}

/**
 * Directly set target joint angles (radians, length 7).
 * Disables the IK solver until setIKTarget() is called again.
 */
export function setTargetAngles(angles: readonly number[]): void {
	if (!controller) return;
	try { controller.set_target_angles(angles); } catch { /* not yet ready */ }
}
