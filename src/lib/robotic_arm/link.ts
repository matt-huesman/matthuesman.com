/**
 * A rigid link connecting two joints.
 * Length is the joint-to-joint distance (the kinematic quantity used in FK/IK).
 * Radius is purely visual — the cylinder radius rendered by Three.js.
 */
export interface Link {
	/** Joint-to-joint distance in world units */
	length: number;

	/** Cylinder radius for the 3D renderer */
	radius: number;
}