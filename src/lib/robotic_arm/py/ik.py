"""
ik.py
=====
Iterative inverse kinematics solvers.
"""

import numpy as np
from typing import Tuple

from arm import RoboticArm
from fk import forward_kinematics
from jacobian import compute_jacobian


def ik_jacobian_transpose(
    arm: RoboticArm,
    target: np.ndarray,
    alpha: float = 0.5,
    tolerance: float = 1e-3,
    max_iter: int = 200,
) -> Tuple[np.ndarray, float]:
    """
    Iterative IK using the Jacobian Transpose method.

    Update rule:
        Δθ = α · Jᵀ · Δp
        θ  = clamp(θ + Δθ, joint_limits)

    Stable but slower to converge than DLS.
    """
    final_error = float("inf")

    for _ in range(max_iter):
        current_pos, _ = forward_kinematics(arm)
        error = target - current_pos
        final_error = np.linalg.norm(error)
        if final_error < tolerance:
            break
        J = compute_jacobian(arm)
        delta_theta = alpha * J.T @ error
        arm.set_angles(arm.get_angles() + delta_theta)

    return arm.get_angles(), final_error


def ik_damped_least_squares(
    arm: RoboticArm,
    target: np.ndarray,
    damping: float = 0.05,
    tolerance: float = 1e-3,
    max_iter: int = 200,
) -> Tuple[np.ndarray, float]:
    """
    Iterative IK using Damped Least Squares (Levenberg-Marquardt).

    Pseudoinverse with damping prevents blow-up near singularities:
        J⁺ = Jᵀ · (J·Jᵀ + λ²·I)⁻¹
        Δθ = J⁺ · Δp

    Parameters
    ----------
    damping  : λ — increase for stability near singularities
    """
    final_error = float("inf")
    lam2 = damping ** 2

    for _ in range(max_iter):
        current_pos, _ = forward_kinematics(arm)
        error = target - current_pos
        final_error = np.linalg.norm(error)
        if final_error < tolerance:
            break
        J = compute_jacobian(arm)
        delta_theta = J.T @ np.linalg.solve(J @ J.T + lam2 * np.eye(3), error)
        arm.set_angles(arm.get_angles() + delta_theta)

    return arm.get_angles(), final_error
