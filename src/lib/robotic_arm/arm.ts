import type { RevoluteJoint } from './joint';
import type { Link }          from './link';
import type { Claw }          from './claw';
export type { RevoluteJoint, Link, Claw };

// ─── Core types ───────────────────────────────────────────────────────────────

/**
 * One segment of the arm: a joint that rotates, followed by a link that extends.
 * The arm is built as a chain of segments from base to wrist.1
 */
export interface Segment {
	joint: RevoluteJoint;
	link:  Link;
}

/** Fixed base pedestal — does not rotate, provides the mounting point for joint 0 */
export interface Base {
	/** Top radius of the cylinder (widens toward the bottom at ×1.3) */
	radius: number;
	height: number;
}

/** Complete structural definition of the arm — pure data, no runtime state */
export interface ArmDefinition {
	base:     Base;

	/**
	 * Ordered chain of segments from the base outward:
	 *   [0] upper arm  — base yaw   (Y axis)
	 *   [1] forearm    — shoulder   (Z axis)
	 *   [2] wrist      — elbow      (Z axis)
	 */
	segments: readonly Segment[];

	claw: Claw;
}

/** Runtime kinematic state of the arm */
export interface ArmState {
	/**
	 * One angle per segment, in radians.
	 * Must have the same length as ArmDefinition.segments.
	 */
	angles:   readonly number[];

	/** Claw openness: 0 = fully closed, 1 = fully open */
	clawOpen: number;
}

// ─── The arm ─────────────────────────────────────────────────────────────────

/**
 * Canonical definition of the arm as rendered in RoboticArm.svelte.
 * All visual radii and lengths are in Three.js world units.
 * Update this when physical proportions change — kinematics and renderer both import from here.
 */
export const ARM: ArmDefinition = {
	base: {
		radius: 0.42,
		height: 0.22,
	},

	segments: [
		{
			// Segment 0 — upper arm (base yaw, rotates around Y)
			joint: {
				axis:         'y',
				limits:       [-Math.PI, Math.PI],
				home:         0,
				visualRadius: 0.20,
			},
			link: { length: 1.55, radius: 0.15 },
		},
		{
			// Segment 1 — forearm (shoulder pitch, rotates around Z)
			joint: {
				axis:         'z',
				limits:       [-Math.PI / 2, Math.PI / 2],
				home:         -Math.PI / 5,
				visualRadius: 0.16,
			},
			link: { length: 1.15, radius: 0.12 },
		},
		{
			// Segment 2 — wrist (elbow pitch, rotates around Z)
			joint: {
				axis:         'z',
				limits:       [-(2 * Math.PI) / 3, (2 * Math.PI) / 3],
				home:         Math.PI / 3,
				visualRadius: 0.13,
			},
			link: { length: 0.40, radius: 0.09 },
		},
	],

	claw: {
		fingerLength:  0.38,
		fingerRadius:  0.055,
		fingerSpread:  0.10,
		knuckleRadius: 0.101, // j2R × 0.78 — matches RoboticArm.svelte knuckle
		maxOpenAngle:  0.45,
	},
};

// ─── State helpers ────────────────────────────────────────────────────────────

/** Build an ArmState from each joint's home angle */
export function defaultState(def: ArmDefinition): ArmState {
	return {
		angles:   def.segments.map(s => s.joint.home),
		clawOpen: 0,
	};
}

/**
 * Return a new ArmState with every angle clamped to its joint's hard limits.
 * clawOpen is clamped to [0, 1].
 */
export function clampState(def: ArmDefinition, state: ArmState): ArmState {
	return {
		angles: state.angles.map((a, i) => {
			const { limits } = def.segments[i].joint;
			return Math.max(limits[0], Math.min(limits[1], a));
		}),
		clawOpen: Math.max(0, Math.min(1, state.clawOpen)),
	};
}

/** Throw if the state is structurally incompatible with the definition */
export function assertCompatible(def: ArmDefinition, state: ArmState): void {
	if (state.angles.length !== def.segments.length) {
		throw new RangeError(
			`ArmState has ${state.angles.length} angles but ArmDefinition has ${def.segments.length} segments`,
		);
	}
}

/** Total number of controllable joint DOF (excludes the claw) */
export function numJoints(def: ArmDefinition): number {
	return def.segments.length;
}

/**
 * Total reach of the arm in world units: sum of all link lengths + claw finger length.
 * Use this as the outer bound when checking workspace reachability.
 */
export function maxReach(def: ArmDefinition): number {
	const links = def.segments.reduce((sum, s) => sum + s.link.length, 0);
	return links + def.claw.fingerLength;
}