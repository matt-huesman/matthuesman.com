/**
 * A revolute (rotational) joint — the only joint type on this arm.
 * All angles are in radians.
 */
export interface RevoluteJoint {
	/** Local axis of rotation */
	axis: 'x' | 'y' | 'z';

	/** Hard angular limits [min, max] in radians */
	limits: readonly [min: number, max: number];

	/** Home/resting angle used to build the default ArmState */
	home: number;

	/** Sphere radius used by the 3D renderer */
	visualRadius: number;
}

/** Clamp an angle to a joint's hard limits */
export function clampAngle(joint: RevoluteJoint, angle: number): number {
	return Math.max(joint.limits[0], Math.min(joint.limits[1], angle));
}

/** Return true if the angle is within the joint's hard limits */
export function isInLimits(joint: RevoluteJoint, angle: number): boolean {
	return angle >= joint.limits[0] && angle <= joint.limits[1];
}