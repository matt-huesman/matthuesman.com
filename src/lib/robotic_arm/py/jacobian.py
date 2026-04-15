"""
jacobian.py
===========
Numerical (finite-difference) positional Jacobian.
"""

import numpy as np

from arm import RoboticArm
from fk import forward_kinematics


def compute_jacobian(arm: RoboticArm, epsilon: float = 1e-5) -> np.ndarray:
    """
    Compute the 3×n positional Jacobian numerically via finite differences.

    Each column j answers: "if joint j is nudged by ε radians, how does
    the end-effector position change?"

        J[:, j] = (FK(θ with θ_j + ε) − FK(θ)) / ε

    Parameters
    ----------
    arm     : RoboticArm
    epsilon : small perturbation in radians (default 1e-5)

    Returns
    -------
    J : np.ndarray, shape (3, n)
    """
    n = arm.num_joints()
    J = np.zeros((3, n))

    p0, _ = forward_kinematics(arm)
    for j in range(n):
        original_theta = arm.joints[j].theta
        arm.set_angle(j, original_theta + epsilon)
        p1, _ = forward_kinematics(arm)
        J[:, j] = (p1 - p0) / epsilon
        arm.set_angle(j, original_theta)

    return J
