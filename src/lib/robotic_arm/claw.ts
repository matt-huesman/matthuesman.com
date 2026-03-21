/**
 * The end effector mounted at the tip of the final link.
 * The claw has two symmetric fingers that open and close around the center axis.
 */
export interface Claw {
	/** Length of each finger from pivot to tip */
	fingerLength: number;

	/** Finger cylinder base radius (tapers to half at the tip) */
	fingerRadius: number;

	/**
	 * X-axis offset of each finger pivot from the wrist center.
	 * Left finger is at -fingerSpread, right at +fingerSpread.
	 */
	fingerSpread: number;

	/** Sphere radius of the knuckle joint rendered at the wrist tip */
	knuckleRadius: number;

	/** Maximum opening angle for each finger in radians */
	maxOpenAngle: number;
}